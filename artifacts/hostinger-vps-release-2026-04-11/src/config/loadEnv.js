const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

const rootDir = path.resolve(__dirname, '..', '..')

const getEnvFileCandidates = () => {
  if (process.env.NODE_ENV === 'production') {
    return ['.env.production', '.env']
  }

  return ['.env.local', '.env']
}

const loadEnv = () => {
  for (const fileName of getEnvFileCandidates()) {
    const filePath = path.join(rootDir, fileName)
    if (fs.existsSync(filePath)) {
      dotenv.config({ path: filePath })
    }
  }
}

module.exports = { loadEnv }
