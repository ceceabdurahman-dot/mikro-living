const { spawnSync } = require('child_process')
const fs = require('fs')
const path = require('path')

const rootDir = path.resolve(__dirname, '..')
const runtimeDir = path.join(rootDir, '.local-runtime')
const pidFile = path.join(runtimeDir, 'stack-supervisor.pid')

function run(command, args) {
  return spawnSync(command, args, {
    encoding: 'utf8',
    windowsHide: true,
  })
}

function killPid(pid) {
  if (!pid) return
  run('taskkill', ['/PID', String(pid), '/T', '/F'])
}

function stopProjectNodeProcesses() {
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
  const text = (result.stdout || '').trim()
  if (!text) return []
  return [...new Set(text.split(/\s+/).map((value) => Number(value)).filter(Boolean))]
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

if (fs.existsSync(pidFile)) {
  const pid = Number(fs.readFileSync(pidFile, 'utf8').trim())
  if (pid) {
    killPid(pid)
    stopped.add(pid)
  }
  try {
    fs.unlinkSync(pidFile)
  } catch {}
}

for (const pid of stopProjectNodeProcesses()) {
  if (stopped.has(pid)) continue
  stopped.add(pid)
}

for (const pid of [...collectListeningPids(3001), ...collectListeningPids(5000)]) {
  if (stopped.has(pid)) continue
  killPid(pid)
  stopped.add(pid)
}

console.log('Stopped local processes: ' + (stopped.size ? [...stopped].join(', ') : 'none'))
