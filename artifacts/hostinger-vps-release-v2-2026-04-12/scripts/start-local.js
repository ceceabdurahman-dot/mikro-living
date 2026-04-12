const { spawnSync, spawn } = require('child_process')
const fs = require('fs')
const path = require('path')
const http = require('http')

const rootDir = path.resolve(__dirname, '..')
const runtimeDir = path.join(rootDir, '.local-runtime')
const apiPidFile = path.join(runtimeDir, 'api.pid')
const webPidFile = path.join(runtimeDir, 'web.pid')
const apiOutLog = path.join(runtimeDir, 'api.out.log')
const apiErrLog = path.join(runtimeDir, 'api.err.log')
const webOutLog = path.join(runtimeDir, 'web.out.log')
const webErrLog = path.join(runtimeDir, 'web.err.log')
const buildIdFile = path.join(rootDir, '.next', 'BUILD_ID')
const apiUrl = 'http://127.0.0.1:5000/api/v1/health'
const webUrl = 'http://127.0.0.1:3001'

fs.mkdirSync(runtimeDir, { recursive: true })

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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

function run(command, args, options = {}) {
  return spawnSync(command, args, {
    encoding: 'utf8',
    windowsHide: true,
    ...options,
  })
}

function ensureFrontendBuild() {
  if (fs.existsSync(buildIdFile)) return

  console.log('Frontend build not found, running npm.cmd run build:web ...')
  const result = run('npm.cmd', ['run', 'build:web'], {
    cwd: rootDir,
    stdio: 'inherit',
  })

  if ((result.status || 0) !== 0 || !fs.existsSync(buildIdFile)) {
    process.exit(result.status || 1)
  }
}

function startDetached(relativeScriptPath, stdoutFile, stderrFile) {
  const command = 'start "" /min cmd.exe /c "cd /d ' + rootDir + ' && node ' + relativeScriptPath + ' 1>>' + stdoutFile + ' 2>>' + stderrFile + '"'
  const child = spawn('cmd.exe', ['/c', command], {
    cwd: rootDir,
    detached: true,
    stdio: 'ignore',
    windowsHide: true,
  })

  child.on('error', (error) => {
    fs.appendFileSync(stderrFile, `\n[start-local] ${error.message}\n`, 'utf8')
  })

  child.unref()
}

function collectListeningPids(port) {
  const result = run('cmd.exe', ['/c', 'netstat -ano | findstr :' + port])
  const text = (result.stdout || '') + '\n' + (result.stderr || '')
  return [...new Set(text.split(/\r?\n/).map((line) => {
    if (!line.includes('LISTENING')) return null
    const match = line.trim().match(/\s+(\d+)$/)
    return match ? Number(match[1]) : null
  }).filter(Boolean))]
}

function writePidIfFound(port, pidFile) {
  const pid = collectListeningPids(port)[0]
  if (!pid) return
  fs.writeFileSync(pidFile, String(pid), 'utf8')
}

async function waitUntilReady(url, timeoutMs) {
  const startedAt = Date.now()
  while (Date.now() - startedAt < timeoutMs) {
    if (await request(url)) return true
    await sleep(500)
  }
  return false
}

async function main() {
  ensureFrontendBuild()

  if (!(await request(apiUrl))) {
    startDetached('src\\index.js', apiOutLog, apiErrLog)
    console.log('Backend API launch requested.')
  } else {
    console.log('Backend API is already responding.')
  }

  if (!(await waitUntilReady(apiUrl, 30000))) {
    console.error('Backend API failed to become ready: ' + apiUrl)
    process.exit(1)
  }
  writePidIfFound(5000, apiPidFile)

  if (!(await request(webUrl))) {
    startDetached('scripts\\start-web-local.js', webOutLog, webErrLog)
    console.log('Frontend Web launch requested.')
  } else {
    console.log('Frontend Web is already responding.')
  }

  if (!(await waitUntilReady(webUrl, 30000))) {
    console.error('Frontend Web failed to become ready: ' + webUrl)
    process.exit(1)
  }
  writePidIfFound(3001, webPidFile)

  console.log('Local stack started successfully.')
  console.log('Public site: http://127.0.0.1:3001')
  console.log('Login CMS: http://127.0.0.1:3001/login')
  console.log('CMS: http://127.0.0.1:3001/cms')
  console.log('API health: http://127.0.0.1:5000/api/v1/health')
  console.log('API log: ' + apiOutLog)
  console.log('Web log: ' + webOutLog)
}

main().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
