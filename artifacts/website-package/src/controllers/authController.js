const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { User } = require('../models')
const api = require('../utils/apiResponse')
const logger = require('../utils/logger')

const generateAccessToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })

const generateRefreshToken = (user) =>
  jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  })

exports.login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return api.badRequest(res, 'Email dan password wajib diisi')
  }

  const user = await User.findOne({ where: { email: email.toLowerCase() } })
  if (!user || !user.is_active) {
    return api.unauthorized(res, 'Email atau password salah')
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return api.unauthorized(res, 'Email atau password salah')
  }

  const accessToken = generateAccessToken(user)
  const refreshToken = generateRefreshToken(user)

  await user.update({ refresh_token: refreshToken, last_login: new Date() })
  logger.info(`User login: ${user.email}`)

  return api.success(
    res,
    {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar_url: user.avatar_url,
      },
      accessToken,
      refreshToken,
    },
    'Login berhasil'
  )
}

exports.refreshToken = async (req, res) => {
  const { refreshToken } = req.body
  if (!refreshToken) {
    return api.badRequest(res, 'Refresh token wajib diisi')
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    const user = await User.findByPk(decoded.id)

    if (!user || user.refresh_token !== refreshToken || !user.is_active) {
      return api.unauthorized(res, 'Refresh token tidak valid')
    }

    const newAccessToken = generateAccessToken(user)
    const newRefreshToken = generateRefreshToken(user)
    await user.update({ refresh_token: newRefreshToken })

    return api.success(
      res,
      { accessToken: newAccessToken, refreshToken: newRefreshToken },
      'Token diperbarui'
    )
  } catch {
    return api.unauthorized(res, 'Refresh token kadaluarsa')
  }
}

exports.logout = async (req, res) => {
  await req.user.update({ refresh_token: null })
  return api.success(res, null, 'Logout berhasil')
}

exports.me = async (req, res) =>
  api.success(res, {
    id: req.user.id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    avatar_url: req.user.avatar_url,
    last_login: req.user.last_login,
  })

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body

  if (!currentPassword || !newPassword) {
    return api.badRequest(res, 'Password lama dan baru wajib diisi')
  }

  if (newPassword.length < 8) {
    return api.badRequest(res, 'Password baru minimal 8 karakter')
  }

  const user = await User.findByPk(req.user.id)
  const isMatch = await bcrypt.compare(currentPassword, user.password)
  if (!isMatch) {
    return api.badRequest(res, 'Password lama tidak sesuai')
  }

  const hashed = await bcrypt.hash(newPassword, 12)
  await user.update({ password: hashed, refresh_token: null })
  return api.success(res, null, 'Password berhasil diubah. Silakan login ulang.')
}

exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body

  if (!name || !email || !password) {
    return api.badRequest(res, 'Name, email, dan password wajib diisi')
  }

  const exists = await User.findOne({ where: { email: email.toLowerCase() } })
  if (exists) {
    return api.badRequest(res, 'Email sudah terdaftar')
  }

  const hashed = await bcrypt.hash(password, 12)
  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password: hashed,
    role: role || 'editor',
  })

  return api.created(
    res,
    {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    'Pengguna baru berhasil dibuat'
  )
}
