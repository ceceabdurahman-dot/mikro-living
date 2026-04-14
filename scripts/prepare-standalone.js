const fs = require('fs')
const path = require('path')

const rootDir = process.cwd()
const standaloneDir = path.join(rootDir, '.next', 'standalone')
const standaloneStaticDir = path.join(standaloneDir, '.next', 'static')
const buildStaticDir = path.join(rootDir, '.next', 'static')
const standalonePublicDir = path.join(standaloneDir, 'public')
const publicDir = path.join(rootDir, 'public')

function copyIfExists(sourceDir, targetDir) {
  if (!fs.existsSync(sourceDir)) {
    return
  }

  fs.mkdirSync(path.dirname(targetDir), { recursive: true })
  fs.cpSync(sourceDir, targetDir, { recursive: true, force: true })
}

if (!fs.existsSync(standaloneDir)) {
  throw new Error('Expected .next/standalone to exist after next build.')
}

copyIfExists(buildStaticDir, standaloneStaticDir)
copyIfExists(publicDir, standalonePublicDir)

console.log('Prepared standalone runtime assets.')
