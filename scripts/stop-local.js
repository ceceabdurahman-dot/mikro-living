const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const rootDir = path.resolve(__dirname, '..')
const runtimeDir = path.join(rootDir, '.local-runtime')
const pidFiles = [
  path.join(runtimeDir, 'stack-supervisor.pid'),
  path.join(runtimeDir, 'api.pid'),
  path.join(runtimeDir, 'web.pid'),
]

function run(command, args) {
  return spawnSync(command, args, {
    encoding: 'utf8',
    windowsHide: true,
  })
}

function readPid(file) {
  if (!fs.existsSync(file)) return 0
  const value = Number(fs.readFileSync(file, 'utf8').trim())
  return Number.isFinite(value) ? value : 0
}

function killPid(pid) {
  if (!pid) return
  run('taskkill', ['/PID', String(pid), '/T', '/F'])
}

function deleteFileIfExists(file) {
  try {
    if (fs.existsSync(file)) fs.unlinkSync(file)
  } catch {}
}

function stopTrackedNodeProcesses() {
  const psScript = `
$patterns = @('start-local.js','local-stack.js','start-web-local.js','src/index.js')
Get-CimInstance Win32_Process -Filter "name = 'node.exe'" |
  Where-Object {
    $cmd = $_.CommandLine
    $cmd -and ($patterns | Where-Object { $cmd -like ('*' + $_ + '*') })
  } |
  ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
    $_.ProcessId
  }
`

  const result = run('powershell.exe', ['-NoProfile', '-Command', psScript])
  const output = (result.stdout || '').trim()
  if (!output) return []
  return [...new Set(output.split(/\s+/).map((value) => Number(value)).filter(Boolean))]
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

const stopped = new Set()

for (const pidFile of pidFiles) {
  const pid = readPid(pidFile)
  if (pid) {
    killPid(pid)
    stopped.add(pid)
  }
  deleteFileIfExists(pidFile)
}

for (const pid of stopTrackedNodeProcesses()) {
  stopped.add(pid)
}

for (const pid of [...collectListeningPids(3001), ...collectListeningPids(5000)]) {
  if (stopped.has(pid)) continue
  killPid(pid)
  stopped.add(pid)
}

console.log('Stopped local processes: ' + (stopped.size ? [...stopped].join(', ') : 'none'))
