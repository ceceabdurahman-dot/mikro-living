const { spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const http = require('http')

const rootDir = path.resolve(__dirname, '..')
const runtimeDir = path.join(rootDir, '.local-runtime')
const pidFile = path.join(runtimeDir, 'stack-supervisor.pid')
const logFile = path.join(runtimeDir, 'stack-supervisor.log')
const nodeBin = process.execPath

fs.mkdirSync(runtimeDir, { recursive: true })

function isPidAlive(pid) {
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
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

async function main() {
  const existingPid = fs.existsSync(pidFile) ? Number(fs.readFileSync(pidFile, 'utf8').trim()) : 0
  if (existingPid && isPidAlive(existingPid)) {
    console.log('Local supervisor already running with PID ' + existingPid)
    console.log('Public site: http://127.0.0.1:3001')
    console.log('Login CMS: http://127.0.0.1:3001/login')
    console.log('CMS: http://127.0.0.1:3001/cms')
    console.log('API health: http://127.0.0.1:5000/api/v1/health')
    return
  }

  const out = fs.openSync(logFile, 'a')
  const child = spawn(nodeBin, ['scripts/local-stack.js'], {
    cwd: rootDir,
    detached: true,
    stdio: ['ignore', out, out],
    windowsHide: true,
  })
  child.unref()
  fs.writeFileSync(pidFile, String(child.pid), 'utf8')

  const startedAt = Date.now()
  while (Date.now() - startedAt < 30000) {
    const webOk = await request('http://127.0.0.1:3001')
    const apiOk = await request('http://127.0.0.1:5000/api/v1/health')
    if (webOk && apiOk) {
      console.log('Local stack started successfully.')
      console.log('Public site: http://127.0.0.1:3001')
      console.log('Login CMS: http://127.0.0.1:3001/login')
      console.log('CMS: http://127.0.0.1:3001/cms')
      console.log('API health: http://127.0.0.1:5000/api/v1/health')
      console.log('Supervisor log: ' + logFile)
      return
    }
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  console.log('Local supervisor launched, but services are still warming up.')
  console.log('Supervisor log: ' + logFile)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
