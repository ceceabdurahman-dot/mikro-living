const { spawnSync } = require('child_process')
const path = require('path')

const rootDir = path.resolve(__dirname, '..')
const nodeBin = process.execPath

const stopResult = spawnSync(nodeBin, ['scripts/stop-local.js'], {
  cwd: rootDir,
  stdio: 'inherit',
  windowsHide: true,
})

if (stopResult.status && stopResult.status !== 0) {
  process.exit(stopResult.status)
}

const startResult = spawnSync(nodeBin, ['scripts/start-local.js'], {
  cwd: rootDir,
  stdio: 'inherit',
  windowsHide: true,
})

process.exit(startResult.status || 0)
