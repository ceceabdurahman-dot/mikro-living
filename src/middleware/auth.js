const jwt = require('jsonwebtoken')
const { User } = require('../models')
const { unauthorized, forbidden } = require('../utils/apiResponse')
const { ACCESS_COOKIE_NAME } = require('../utils/authCookies')

const resolveTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1]
  }

  return req.cookies?.[ACCESS_COOKIE_NAME] || null
}

const resolveUserFromRequest = async (req) => {
  const token = resolveTokenFromRequest(req)
  if (!token) return null

  const decoded = jwt.verify(token, process.env.JWT_SECRET)

  const user = await User.findByPk(decoded.id, {
    attributes: { exclude: ['password', 'refresh_token'] },
  })

  if (!user || !user.is_active) {
    throw new Error('INVALID_USER')
  }

  return user
}

const authenticate = async (req, res, next) => {
  try {
    const user = await resolveUserFromRequest(req)
    if (!user) {
      return unauthorized(res, 'Token tidak ditemukan. Harap login terlebih dahulu.')
    }

    req.user = user
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return unauthorized(res, 'Token kadaluarsa. Harap login ulang.')
    }

    return unauthorized(res, 'Token tidak valid.')
  }
}

const tryAuthenticate = async (req, res, next) => {
  try {
    const user = await resolveUserFromRequest(req)
    if (user) req.user = user
  } catch (error) {
    req.user = null
  }

  next()
}

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) return unauthorized(res)
    if (!roles.includes(req.user.role)) {
      return forbidden(res, 'Anda tidak memiliki akses ke resource ini.')
    }
    next()
  }
}

const adminOnly = authorize('superadmin', 'admin')
const superadminOnly = authorize('superadmin')

module.exports = { authenticate, tryAuthenticate, authorize, adminOnly, superadminOnly }
