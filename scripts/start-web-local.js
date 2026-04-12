const fs = require('fs')
const path = require('path')

process.env.PORT = process.env.PORT || '3001'
process.env.HOSTNAME = process.env.HOSTNAME || '127.0.0.1'
process.env.NODE_ENV = process.env.NODE_ENV || 'production'

const standaloneServer = path.join(__dirname, '..', '.next', 'standalone', 'server.js')
const standaloneRoot = path.join(__dirname, '..', '.next', 'standalone')
const publicSource = path.join(__dirname, '..', 'public')
const publicTarget = path.join(standaloneRoot, 'public')
const staticSource = path.join(__dirname, '..', '.next', 'static')
const staticTarget = path.join(standaloneRoot, '.next', 'static')

const syncDirectory = (source, target) => {
  if (!fs.existsSync(source)) return

  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.cpSync(source, target, {
    recursive: true,
    force: true,
  })
}

if (fs.existsSync(standaloneServer)) {
  syncDirectory(publicSource, publicTarget)
  syncDirectory(staticSource, staticTarget)
  require(standaloneServer)
} else {
  process.argv = [
    process.execPath,
    'next',
    'start',
    '-p',
    process.env.PORT,
    '-H',
    process.env.HOSTNAME,
  ]

  require('next/dist/bin/next')
}
