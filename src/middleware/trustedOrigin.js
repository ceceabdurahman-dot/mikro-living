const api = require('../utils/apiResponse')
const {
  buildAllowedOrigins,
  isAllowedOrigin,
  resolveRequestOrigin,
  shouldAllowMissingOrigin,
  shouldRequireTrustedOrigin,
} = require('../config/requestSecurity')

const validateTrustedOriginRequest = (
  req,
  {
    allowedOrigins = buildAllowedOrigins(process.env.ALLOWED_ORIGINS, process.env.NODE_ENV),
    nodeEnv = process.env.NODE_ENV,
  } = {}
) => {
  if (!shouldRequireTrustedOrigin(req)) {
    return { ok: true }
  }

  const requestOrigin = resolveRequestOrigin(req)
  if (!requestOrigin) {
    if (shouldAllowMissingOrigin(req, nodeEnv)) {
      return { ok: true }
    }

    return {
      ok: false,
      message: 'Origin atau referer request wajib valid untuk aksi ini.',
    }
  }

  if (!isAllowedOrigin(requestOrigin, allowedOrigins, nodeEnv)) {
    return {
      ok: false,
      message: 'Origin request tidak diizinkan.',
    }
  }

  return { ok: true }
}

const enforceTrustedOrigin = (req, res, next) => {
  const validation = validateTrustedOriginRequest(req)
  if (!validation.ok) {
    return api.forbidden(res, validation.message)
  }

  return next()
}

module.exports = { enforceTrustedOrigin, validateTrustedOriginRequest }
