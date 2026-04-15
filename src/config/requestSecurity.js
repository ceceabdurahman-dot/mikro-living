const LOOPBACK_HOST_PATTERN = /^(localhost|127\.0\.0\.1|::1|::ffff:127\.0\.0\.1)$/i
const STATE_CHANGING_METHODS = new Set(['POST', 'PUT', 'PATCH', 'DELETE'])

const normalizeOriginList = (raw = '') =>
  String(raw)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)

const isLoopbackValue = (value = '') => LOOPBACK_HOST_PATTERN.test(String(value).trim().toLowerCase())

const isLoopbackOrigin = (origin, nodeEnv = process.env.NODE_ENV) => {
  try {
    const { hostname, protocol } = new URL(origin)
    return nodeEnv !== 'production' && /^https?:$/i.test(protocol) && isLoopbackValue(hostname)
  } catch {
    return false
  }
}

const buildAllowedOrigins = (
  raw = process.env.ALLOWED_ORIGINS || 'http://localhost:3000',
  nodeEnv = process.env.NODE_ENV
) => normalizeOriginList(raw).filter((origin) => origin || isLoopbackOrigin(origin, nodeEnv))

const isAllowedOrigin = (
  origin,
  allowedOrigins = buildAllowedOrigins(process.env.ALLOWED_ORIGINS, process.env.NODE_ENV),
  nodeEnv = process.env.NODE_ENV
) => allowedOrigins.includes(origin) || isLoopbackOrigin(origin, nodeEnv)

const hasBearerAuthorization = (req) => /^Bearer\s+/i.test(String(req.headers?.authorization || '').trim())

const resolveRequestOrigin = (req) => {
  const explicitOrigin = String(req.headers?.origin || '').trim()
  if (explicitOrigin) return explicitOrigin

  const referer = String(req.headers?.referer || '').trim()
  if (!referer) return ''

  try {
    const parsed = new URL(referer)
    return `${parsed.protocol}//${parsed.host}`
  } catch {
    return ''
  }
}

const shouldRequireTrustedOrigin = (req) =>
  STATE_CHANGING_METHODS.has(String(req.method || 'GET').toUpperCase()) && !hasBearerAuthorization(req)

const shouldAllowMissingOrigin = (req, nodeEnv = process.env.NODE_ENV) => {
  if (nodeEnv === 'production') return false

  const hostHeader = String(req.headers?.host || '')
  return (
    isLoopbackValue(req.hostname) ||
    isLoopbackValue(req.ip) ||
    hostHeader.includes('127.0.0.1') ||
    hostHeader.includes('localhost')
  )
}

const resolveTrustProxySetting = ({
  nodeEnv = process.env.NODE_ENV,
  trustProxy = process.env.TRUST_PROXY,
  trustProxyHops = process.env.TRUST_PROXY_HOPS,
} = {}) => {
  const normalizedHops = String(trustProxyHops || '').trim()
  if (normalizedHops) {
    if (!/^\d+$/.test(normalizedHops)) {
      throw new Error('TRUST_PROXY_HOPS harus berupa angka bulat non-negatif.')
    }

    return Number(normalizedHops)
  }

  const normalizedTrustProxy = String(trustProxy || '').trim()
  if (!normalizedTrustProxy) {
    return nodeEnv === 'production' ? 1 : false
  }

  const lowerValue = normalizedTrustProxy.toLowerCase()
  if (['false', 'off', 'no'].includes(lowerValue)) return false
  if (['true', 'on', 'yes'].includes(lowerValue)) return 1
  if (/^\d+$/.test(normalizedTrustProxy)) return Number(normalizedTrustProxy)
  if (normalizedTrustProxy.includes(',')) {
    return normalizedTrustProxy
      .split(',')
      .map((entry) => entry.trim())
      .filter(Boolean)
  }

  return normalizedTrustProxy
}

module.exports = {
  buildAllowedOrigins,
  hasBearerAuthorization,
  isAllowedOrigin,
  isLoopbackValue,
  resolveRequestOrigin,
  resolveTrustProxySetting,
  shouldAllowMissingOrigin,
  shouldRequireTrustedOrigin,
}
