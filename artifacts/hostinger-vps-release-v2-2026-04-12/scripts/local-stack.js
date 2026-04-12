const { spawn } = require('child_process')
const http = require('http')
const net = require('net')
const path = require('path')
const fs = require('fs')

const rootDir = path.resolve(__dirname, '..')
const nodeBin = process.execPath
const runtimeDir = path.join(rootDir, '.local-runtime')
const pidFile = path.join(runtimeDir, 'stack-supervisor.pid')
const healthCheckIntervalMs = 5000
const bootTimeoutMs = 30000

const services = [
  {
    key: 'api',
    name: 'Backend API',
    color: '\x1b[36m',
    reset: '\x1b[0m',
    command: nodeBin,
    args: ['src/index.js'],
    host: '127.0.0.1',
    port: 5000,
    readyUrl: 'http://127.0.0.1:5000/api/v1/health',
    child: null,
    starting: false,
  },
  {
    key: 'web',
    name: 'Frontend Web',
    color: '\x1b[35m',
    reset: '\x1b[0m',
    command: nodeBin,
    args: ['scripts/start-web-local.js'],
    host: '127.0.0.1',
    port: 3001,
    readyUrl: 'http://127.0.0.1:3001',
    child: null,
    starting: false,
  },
]

let shuttingDown = false
let monitorTimer = null

fs.mkdirSync(runtimeDir, { recursive: true })
fs.writeFileSync(pidFile, String(process.pid), 'utf8')
process.stdout.on('error', () => {})
process.stderr.on('error', () => {})

function log(service, message, method = 'log') {
  const prefix = service ? service.color + '[' + service.key + ']' + service.reset : '[stack]'
  console[method](prefix + ' ' + message)
}

function pipeOutput(service, stream, method = 'log') {
  let buffer = ''
  stream.on('data', (chunk) => {
    buffer += chunk.toString()
    const lines = buffer.split(/\r?\n/)
    buffer = lines.pop() || ''
    for (const line of lines) {
      if (!line.trim()) continue
      log(service, line, method)
    }
  })
  stream.on('end', () => {
    if (buffer.trim()) log(service, buffer.trim(), method)
  })
}

function wait(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function request(url) {
  return new Promise((resolve) => {
    const req = http.get(url, (res) => {
      const ok = (res.statusCode || 500) < 400
      res.resume()
      res.on('end', () => resolve(ok))
    })
    req.setTimeout(1500, () => {
      req.destroy()
      resolve(false)
    })
    req.on('error', () => resolve(false))
  })
}

function isPortOpen(port, host) {
  return new Promise((resolve) => {
    const socket = new net.Socket()
    const finish = (value) => {
      socket.destroy()
      resolve(value)
    }
    socket.setTimeout(1000)
    socket.once('connect', () => finish(true))
    socket.once('timeout', () => finish(false))
    socket.once('error', () => finish(false))
    socket.connect(port, host)
  })
}

async function waitUntilReady(service, timeoutMs = bootTimeoutMs) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    if (await request(service.readyUrl)) return true
    await wait(500)
  }
  return false
}

function spawnService(service) {
  service.starting = true
  log(service, 'starting...')

  const child = spawn(service.command, service.args, {
    cwd: rootDir,
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
    windowsHide: true,
  })

  service.child = child
  pipeOutput(service, child.stdout, 'log')
  pipeOutput(service, child.stderr, 'error')

  child.on('exit', (code, signal) => {
    service.child = null
    service.starting = false
    if (shuttingDown) return
    log(service, 'stopped (code=' + code + ', signal=' + signal + ')', 'error')
    setTimeout(() => {
      void ensureService(service)
    }, 1200)
  })

  child.on('error', (error) => {
    log(service, 'failed to start: ' + error.message, 'error')
  })
}

async function ensureService(service) {
  if (shuttingDown || service.starting) return
  if (await request(service.readyUrl)) return

  const portBusy = await isPortOpen(service.port, service.host)
  if (portBusy) {
    log(service, 'port is occupied but health check is failing; waiting for recovery', 'error')
    return
  }

  spawnService(service)
  const ready = await waitUntilReady(service)
  service.starting = false

  if (ready) {
    log(service, 'ready at ' + service.readyUrl)
    return
  }

  log(service, 'failed to become ready within timeout', 'error')
}

async function bootstrap() {
  for (const service of services) {
    await ensureService(service)
  }

  if (!(await request(services[0].readyUrl))) {
    throw new Error('Backend API is not ready on ' + services[0].readyUrl)
  }

  if (!(await request(services[1].readyUrl))) {
    throw new Error('Frontend Web is not ready on ' + services[1].readyUrl)
  }

  log(null, 'Local stack is ready:')
  log(null, '- Public site: http://127.0.0.1:3001')
  log(null, '- Login CMS: http://127.0.0.1:3001/login')
  log(null, '- CMS: http://127.0.0.1:3001/cms')
  log(null, '- API health: http://127.0.0.1:5000/api/v1/health')

  monitorTimer = setInterval(() => {
    for (const service of services) {
      void ensureService(service)
    }
  }, healthCheckIntervalMs)
}

function shutdown() {
  if (shuttingDown) return
  shuttingDown = true
  if (monitorTimer) clearInterval(monitorTimer)
  log(null, 'Stopping local stack...')
  for (const service of services) {
    if (service.child && !service.child.killed) {
      try {
        service.child.kill('SIGTERM')
      } catch {}
    }
  }
  try {
    if (fs.existsSync(pidFile)) fs.unlinkSync(pidFile)
  } catch {}
  setTimeout(() => process.exit(0), 600)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
process.on('exit', () => {
  try {
    if (fs.existsSync(pidFile)) fs.unlinkSync(pidFile)
  } catch {}
})

bootstrap().catch((error) => {
  log(null, error.message, 'error')
  shutdown()
  process.exitCode = 1
})
