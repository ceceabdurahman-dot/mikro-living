const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

const rootDir = path.resolve(__dirname, '..')
const explicitPort = process.env.PORT
const explicitHostname = process.env.HOSTNAME
const nodeEnv = process.env.NODE_ENV || 'production'
const standaloneServerPath = path.join(rootDir, '.next', 'standalone', 'server.js')

process.env.NODE_ENV = nodeEnv
process.chdir(rootDir)

function loadEnvFile(relativePath) {
  const absolutePath = path.join(rootDir, relativePath)

  if (!fs.existsSync(absolutePath)) {
    return
  }

  dotenv.config({ path: absolutePath })
}

;[
  `.env.${nodeEnv}.local`,
  '.env.local',
  `.env.${nodeEnv}`,
  '.env',
  path.join('.next', 'standalone', `.env.${nodeEnv}`),
  path.join('.next', 'standalone', '.env'),
].forEach(loadEnvFile)

process.env.PORT = explicitPort || '3000'
process.env.HOSTNAME = explicitHostname || '0.0.0.0'

if (!fs.existsSync(standaloneServerPath)) {
  throw new Error(
    [
      'Expected .next/standalone/server.js to exist before starting the frontend.',
      'Run `npm run build:web` first, then start the app with `npm start` or `node scripts/start-web.js`.',
    ].join(' '),
  )
}

const runtimeSummary = [
  `NODE_ENV=${process.env.NODE_ENV}`,
  `PORT=${process.env.PORT}`,
  `HOSTNAME=${process.env.HOSTNAME}`,
  `NEXT_PUBLIC_SITE_URL=${process.env.NEXT_PUBLIC_SITE_URL || 'unset'}`,
  `NEXT_PUBLIC_API_URL=${process.env.NEXT_PUBLIC_API_URL || 'unset'}`,
  `API_URL=${process.env.API_URL || 'unset'}`,
  `API_PROXY_TARGET=${process.env.API_PROXY_TARGET || 'unset'}`,
].join(', ')

console.log(`[start-web] Launching standalone frontend from ${standaloneServerPath}`)
console.log(`[start-web] Runtime config: ${runtimeSummary}`)

require(standaloneServerPath)
