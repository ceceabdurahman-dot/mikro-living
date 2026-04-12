const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

const rootDir = path.resolve(__dirname, '..', '..')
const PRODUCTION_REQUIRED_ENV_KEYS = [
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'NEXT_PUBLIC_SITE_URL',
  'NEXT_PUBLIC_API_URL',
  'ALLOWED_ORIGINS',
]
const SECRET_MIN_LENGTHS = {
  JWT_SECRET: 32,
  JWT_REFRESH_SECRET: 32,
}
const PLACEHOLDER_VALUE_PATTERN = /(change_me|replace_with|your-domain|your_|example)/i
const LOOPBACK_HOST_PATTERN = /^(localhost|127\.0\.0\.1|::1|::ffff:127\.0\.0\.1)$/i

const getEnvFileCandidates = () => {
  if (process.env.NODE_ENV === 'production') {
    return ['.env.production']
  }

  return ['.env.local', '.env']
}

const normalizeEnvValue = (value) => String(value || '').trim()

const isPlaceholderValue = (value) => PLACEHOLDER_VALUE_PATTERN.test(normalizeEnvValue(value))

const validateProductionEnv = () => {
  if (process.env.NODE_ENV !== 'production') return

  const missingKeys = PRODUCTION_REQUIRED_ENV_KEYS.filter((key) => !normalizeEnvValue(process.env[key]))
  const placeholderKeys = PRODUCTION_REQUIRED_ENV_KEYS.filter((key) =>
    process.env[key] ? isPlaceholderValue(process.env[key]) : false
  )
  const weakSecretKeys = Object.entries(SECRET_MIN_LENGTHS)
    .filter(([key, minLength]) => normalizeEnvValue(process.env[key]).length < minLength)
    .map(([key]) => key)

  const invalidUrlKeys = ['NEXT_PUBLIC_SITE_URL', 'NEXT_PUBLIC_API_URL'].filter((key) => {
    const value = normalizeEnvValue(process.env[key])
    if (!value) return false

    try {
      const parsed = new URL(value)
      return !/^https?:$/i.test(parsed.protocol) || LOOPBACK_HOST_PATTERN.test(parsed.hostname)
    } catch {
      return true
    }
  })

  const issues = []
  if (missingKeys.length) {
    issues.push(`missing required env: ${missingKeys.join(', ')}`)
  }
  if (placeholderKeys.length) {
    issues.push(`placeholder values detected: ${placeholderKeys.join(', ')}`)
  }
  if (weakSecretKeys.length) {
    issues.push(`weak secrets detected: ${weakSecretKeys.join(', ')}`)
  }
  if (invalidUrlKeys.length) {
    issues.push(`invalid public URLs for production: ${invalidUrlKeys.join(', ')}`)
  }
  if (normalizeEnvValue(process.env.SESSION_COOKIE_SECURE).toLowerCase() === 'false') {
    issues.push('SESSION_COOKIE_SECURE must not be false in production')
  }

  if (issues.length) {
    throw new Error(`Production environment validation failed: ${issues.join(' | ')}`)
  }
}

const loadEnv = () => {
  for (const fileName of getEnvFileCandidates()) {
    const filePath = path.join(rootDir, fileName)
    if (fs.existsSync(filePath)) {
      dotenv.config({ path: filePath })
    }
  }

  validateProductionEnv()
}

module.exports = { loadEnv, validateProductionEnv, isPlaceholderValue }
