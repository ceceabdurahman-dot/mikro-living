const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const { Op } = require('sequelize')
const { User } = require('../models')
const api = require('../utils/apiResponse')
const logger = require('../utils/logger')
const { sendMail } = require('../utils/email')
const { deleteFromCloudinary } = require('../config/cloudinary')
const { setAuthCookies, clearAuthCookies, REFRESH_COOKIE_NAME } = require('../utils/authCookies')

const normalizeEmail = (email = '') => String(email).trim().toLowerCase()
const normalizeUserName = (name = '') => String(name).trim()
const USER_EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const isValidManagedUserEmail = (email) => USER_EMAIL_PATTERN.test(normalizeEmail(email))

const parseBooleanInput = (value) => {
  if (value === true || value === 'true') return true
  if (value === false || value === 'false') return false
  return null
}

const generateAccessToken = (user) =>
  jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  })

const generateRefreshToken = (user) =>
  jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  })

const hashRefreshToken = (token) => `sha256:${crypto.createHash('sha256').update(token).digest('hex')}`

const matchesStoredRefreshToken = (storedToken, refreshToken) => {
  if (!storedToken || !refreshToken) return false
  return storedToken === refreshToken || storedToken === hashRefreshToken(refreshToken)
}

const getResetTokenSecret = (user) => `${process.env.JWT_SECRET}:${user.password}`

const buildResetUrl = (user, token) => {
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean)
  const baseUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    (process.env.NODE_ENV !== 'production' ? 'http://127.0.0.1:3001' : '') ||
    allowedOrigins.find((origin) => origin.startsWith('http')) ||
    'http://127.0.0.1:3001'

  return `${baseUrl.replace(/\/$/, '')}/login?resetToken=${encodeURIComponent(token)}&email=${encodeURIComponent(
    user.email
  )}`
}

const issuePasswordResetToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      purpose: 'password_reset',
    },
    getResetTokenSecret(user),
    {
      expiresIn: process.env.JWT_RESET_EXPIRES_IN || '20m',
    }
  )

const sendResetPasswordEmail = async (user, resetUrl) => {
  const subject = 'Reset password MikroLiving CMS'
  const text = [
    `Halo ${user.name || 'tim MikroLiving'},`,
    '',
    'Kami menerima permintaan reset password untuk akun CMS Anda.',
    'Klik tautan berikut untuk membuat password baru:',
    resetUrl,
    '',
    'Tautan ini akan kadaluarsa dalam waktu singkat. Jika Anda tidak meminta reset password, abaikan email ini.',
  ].join('\n')

  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.6;color:#2b211d">
      <h2 style="margin-bottom:12px;">Reset password MikroLiving CMS</h2>
      <p>Halo ${user.name || 'tim MikroLiving'},</p>
      <p>Kami menerima permintaan reset password untuk akun CMS Anda.</p>
      <p>
        <a href="${resetUrl}" style="display:inline-block;padding:12px 20px;border-radius:12px;background:#8a5529;color:#ffffff;text-decoration:none;font-weight:700;">
          Reset password
        </a>
      </p>
      <p>Atau buka tautan ini secara manual:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>Tautan ini akan kadaluarsa dalam waktu singkat. Jika Anda tidak meminta reset password, abaikan email ini.</p>
    </div>
  `

  return sendMail({
    to: user.email,
    subject,
    text,
    html,
  })
}

const canManageTargetUser = (actor, target) => {
  if (!actor || !target) return false
  if (actor.id === target.id) return true

  if (actor.role === 'superadmin') {
    return target.role !== 'superadmin'
  }

  if (actor.role === 'admin') {
    return target.role === 'editor'
  }

  return false
}

const allowedRolesForCreator = (actor) => {
  if (actor.role === 'superadmin') return ['admin', 'editor']
  if (actor.role === 'admin') return ['editor']
  return []
}

const sanitizeUserPayload = (user) => ({
  id: user.id,
  name: user.name,
  email: user.email,
  role: user.role,
  avatar_url: user.avatar_url,
  is_active: user.is_active,
  last_login: user.last_login,
  created_at: user.createdAt,
})

const resolveUserFromRefreshCookie = async (req) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME]
  if (!refreshToken) return null

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    const user = await User.findByPk(decoded.id)
    if (!user || !matchesStoredRefreshToken(user.refresh_token, refreshToken)) {
      return null
    }
    return user
  } catch {
    return null
  }
}

const extractAvatarData = (req) =>
  req.file
    ? {
        avatar_url: req.file.path,
        avatar_id: req.file.filename,
      }
    : null

const replaceUserAvatarIfNeeded = async (user, avatarData) => {
  if (!avatarData) return

  const previousAvatarId = user.avatar_id
  await user.update(avatarData)

  if (previousAvatarId && previousAvatarId !== avatarData.avatar_id) {
    try {
      await deleteFromCloudinary(previousAvatarId)
    } catch (error) {
      logger.warn(`Gagal menghapus avatar lama user ${user.email}: ${error.message}`)
    }
  }
}

exports.login = async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return api.badRequest(res, 'Email dan password wajib diisi')
  }

  const user = await User.findOne({ where: { email: normalizeEmail(email) } })
  if (!user || !user.is_active) {
    return api.unauthorized(res, 'Email atau password salah')
  }

  const isMatch = await bcrypt.compare(password, user.password)
  if (!isMatch) {
    return api.unauthorized(res, 'Email atau password salah')
  }

  const accessToken = generateAccessToken(user)
  const refreshToken = generateRefreshToken(user)

  await user.update({ refresh_token: hashRefreshToken(refreshToken), last_login: new Date() })
  setAuthCookies(res, accessToken, refreshToken)
  logger.info(`User login: ${user.email}`)

  return api.success(
    res,
    {
      user: sanitizeUserPayload(user),
    },
    'Login berhasil'
  )
}

exports.refreshToken = async (req, res) => {
  const refreshToken = req.cookies?.[REFRESH_COOKIE_NAME]
  if (!refreshToken) {
    clearAuthCookies(res)
    return api.badRequest(res, 'Refresh token wajib diisi')
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    const user = await User.findByPk(decoded.id)

    if (!user || !matchesStoredRefreshToken(user.refresh_token, refreshToken) || !user.is_active) {
      clearAuthCookies(res)
      return api.unauthorized(res, 'Refresh token tidak valid')
    }

    const newAccessToken = generateAccessToken(user)
    const newRefreshToken = generateRefreshToken(user)
    await user.update({ refresh_token: hashRefreshToken(newRefreshToken) })
    setAuthCookies(res, newAccessToken, newRefreshToken)

    return api.success(res, { refreshed: true }, 'Token diperbarui')
  } catch {
    clearAuthCookies(res)
    return api.unauthorized(res, 'Refresh token kadaluarsa')
  }
}

exports.logout = async (req, res) => {
  const user = req.user || (await resolveUserFromRefreshCookie(req))
  if (user) {
    await user.update({ refresh_token: null })
  }
  clearAuthCookies(res)
  return api.success(res, null, 'Logout berhasil')
}

exports.me = async (req, res) => api.success(res, sanitizeUserPayload(req.user))

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
  clearAuthCookies(res)
  return api.success(res, null, 'Password berhasil diubah. Silakan login ulang.')
}

exports.forgotPassword = async (req, res) => {
  const email = normalizeEmail(req.body?.email)

  if (!email) {
    return api.badRequest(res, 'Email wajib diisi')
  }

  const user = await User.findOne({ where: { email } })
  const genericMessage = 'Jika email terdaftar, tautan reset password akan dikirim ke inbox Anda.'

  if (!user || !user.is_active) {
    return api.success(res, null, genericMessage)
  }

  const token = issuePasswordResetToken(user)
  const resetUrl = buildResetUrl(user, token)

  try {
    const result = await sendResetPasswordEmail(user, resetUrl)
    logger.info(`Password reset requested for ${user.email}`)

    return api.success(
      res,
      process.env.NODE_ENV === 'production'
        ? null
        : { preview_url: resetUrl, email_skipped: Boolean(result?.skipped) },
      genericMessage
    )
  } catch (error) {
    logger.error(`Failed to send reset email to ${user.email}: ${error.message}`)
    if (process.env.NODE_ENV !== 'production') {
      return api.success(res, { preview_url: resetUrl, email_skipped: true }, genericMessage)
    }
    return api.error(res, 'Gagal mengirim email reset password.', 500)
  }
}

exports.resetPassword = async (req, res) => {
  const email = normalizeEmail(req.body?.email)
  const token = String(req.body?.token || '').trim()
  const newPassword = String(req.body?.newPassword || '')
  const confirmPassword = String(req.body?.confirmPassword || '')

  if (!email || !token || !newPassword || !confirmPassword) {
    return api.badRequest(res, 'Email, token reset, password baru, dan konfirmasi password wajib diisi')
  }

  if (newPassword !== confirmPassword) {
    return api.badRequest(res, 'Konfirmasi password baru tidak sesuai')
  }

  if (newPassword.length < 8) {
    return api.badRequest(res, 'Password baru minimal 8 karakter')
  }

  const user = await User.findOne({ where: { email } })
  if (!user || !user.is_active) {
    return api.badRequest(res, 'Tautan reset password tidak valid')
  }

  try {
    const payload = jwt.verify(token, getResetTokenSecret(user))
    if (payload.id !== user.id || payload.purpose !== 'password_reset') {
      return api.badRequest(res, 'Tautan reset password tidak valid')
    }
  } catch {
    return api.badRequest(res, 'Tautan reset password tidak valid atau sudah kadaluarsa')
  }

  const hashed = await bcrypt.hash(newPassword, 12)
  await user.update({ password: hashed, refresh_token: null })
  clearAuthCookies(res)

  return api.success(res, null, 'Password baru berhasil disimpan. Silakan login dengan password baru.')
}

exports.listUsers = async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1)
  const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1)
  const offset = (page - 1) * limit
  const q = String(req.query.q || '').trim()
  const role = String(req.query.role || 'all').trim()
  const status = String(req.query.status || 'all').trim()
  const where = {}

  if (q) {
    where[Op.or] = [
      { name: { [Op.like]: `%${q}%` } },
      { email: { [Op.like]: `%${q}%` } },
    ]
  }

  if (status === 'active') where.is_active = true
  if (status === 'inactive') where.is_active = false

  if (req.user.role !== 'superadmin') {
    where.role = 'editor'
  } else if (role !== 'all') {
    where.role = role
  }

  const result = await User.findAndCountAll({
    where,
    attributes: { exclude: ['password', 'refresh_token'] },
    order: [['createdAt', 'DESC']],
    limit,
    offset,
  })

  return api.paginated(
    res,
    result.rows.map(sanitizeUserPayload),
    result.count,
    page,
    limit,
    'Daftar user berhasil dimuat'
  )
}

exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body
  const normalizedName = normalizeUserName(name)
  const normalizedEmail = normalizeEmail(email)

  if (!normalizedName || !normalizedEmail || !password) {
    return api.badRequest(res, 'Nama, email, dan password wajib diisi')
  }

  if (password.length < 8) {
    return api.badRequest(res, 'Password minimal 8 karakter')
  }

  if (!isValidManagedUserEmail(normalizedEmail)) {
    return api.badRequest(res, 'Format email tidak valid')
  }

  const normalizedRole = String(role || 'editor').trim()
  const allowedRoles = allowedRolesForCreator(req.user)

  if (!allowedRoles.includes(normalizedRole)) {
    return api.forbidden(res, 'Anda tidak memiliki izin membuat role tersebut.')
  }

  const exists = await User.findOne({ where: { email: normalizedEmail } })
  if (exists) {
    return api.badRequest(res, 'Email sudah terdaftar')
  }

  const hashed = await bcrypt.hash(password, 12)
  const user = await User.create({
    name: normalizedName,
    email: normalizedEmail,
    password: hashed,
    role: normalizedRole,
    is_active: true,
    ...(extractAvatarData(req) || {}),
  })

  return api.created(res, sanitizeUserPayload(user), 'User baru berhasil dibuat')
}

exports.updateUser = async (req, res) => {
  const user = await User.findByPk(req.params.id)
  if (!user) return api.notFound(res, 'User tidak ditemukan')

  if (!canManageTargetUser(req.user, user)) {
    return api.forbidden(res, 'Anda tidak memiliki akses untuk mengubah user ini.')
  }

  const updates = {}

  if (req.body.name !== undefined) {
    const normalizedName = normalizeUserName(req.body.name)

    if (!normalizedName) {
      return api.badRequest(res, 'Nama wajib diisi')
    }

    updates.name = normalizedName
  }

  if (req.body.email !== undefined) {
    const normalizedEmail = normalizeEmail(req.body.email)

    if (!normalizedEmail || !isValidManagedUserEmail(normalizedEmail)) {
      return api.badRequest(res, 'Format email tidak valid')
    }

    const exists = await User.findOne({
      where: {
        email: normalizedEmail,
        id: { [Op.ne]: user.id },
      },
    })

    if (exists) {
      return api.badRequest(res, 'Email sudah digunakan user lain')
    }

    updates.email = normalizedEmail
  }

  if (req.body.role !== undefined) {
    const nextRole = String(req.body.role).trim()

    if (user.role === 'superadmin') {
      if (nextRole !== user.role) {
        return api.badRequest(res, 'Role superadmin tidak dapat diubah melalui form ini.')
      }
    } else if (nextRole !== user.role) {
      const allowedRoles = allowedRolesForCreator(req.user)
      if (!allowedRoles.includes(nextRole)) {
        return api.forbidden(res, 'Anda tidak memiliki izin mengubah role ke nilai tersebut.')
      }
      updates.role = nextRole
    }
  }

  if (req.body.is_active !== undefined) {
    const nextActive = parseBooleanInput(req.body.is_active)

    if (nextActive === null) {
      return api.badRequest(res, 'Status user harus bernilai true atau false.')
    }

    if (req.user.id === user.id && !nextActive) {
      return api.badRequest(res, 'Anda tidak dapat menonaktifkan akun sendiri.')
    }
    updates.is_active = nextActive
    if (!nextActive) {
      updates.refresh_token = null
    }
  }

  await user.update(updates)
  await replaceUserAvatarIfNeeded(user, extractAvatarData(req))
  await user.reload()

  return api.success(res, sanitizeUserPayload(user), 'Data user berhasil diperbarui')
}

exports.bulkUpdateUserStatus = async (req, res) => {
  const ids = Array.isArray(req.body?.ids) ? req.body.ids.map((id) => Number(id)).filter(Boolean) : []
  const nextActive = parseBooleanInput(req.body?.is_active)

  if (!ids.length) {
    return api.badRequest(res, 'Pilih minimal satu user untuk diproses.')
  }

  if (nextActive === null) {
    return api.badRequest(res, 'Status user harus bernilai true atau false.')
  }

  const users = await User.findAll({ where: { id: ids } })
  if (!users.length) {
    return api.notFound(res, 'User tidak ditemukan')
  }

  const unauthorizedTarget = users.find((user) => !canManageTargetUser(req.user, user))
  if (unauthorizedTarget) {
    return api.forbidden(res, 'Ada user yang tidak dapat Anda ubah pada pilihan tersebut.')
  }

  if (!nextActive && users.some((user) => user.id === req.user.id)) {
    return api.badRequest(res, 'Akun yang sedang dipakai tidak dapat dinonaktifkan secara bulk.')
  }

  await User.update(
    {
      is_active: nextActive,
      ...(nextActive ? {} : { refresh_token: null }),
    },
    { where: { id: ids } }
  )

  return api.success(
    res,
    { affected: ids.length, is_active: nextActive },
    nextActive ? 'User terpilih berhasil diaktifkan.' : 'User terpilih berhasil dinonaktifkan.'
  )
}

exports.resetUserPassword = async (req, res) => {
  const user = await User.findByPk(req.params.id)
  if (!user) return api.notFound(res, 'User tidak ditemukan')

  if (req.user.id === user.id) {
    return api.badRequest(res, 'Gunakan fitur ubah password untuk akun sendiri.')
  }

  if (!canManageTargetUser(req.user, user)) {
    return api.forbidden(res, 'Anda tidak memiliki akses untuk mengubah password user ini.')
  }

  const newPassword = String(req.body?.newPassword || '')
  const confirmPassword = String(req.body?.confirmPassword || '')

  if (!newPassword || !confirmPassword) {
    return api.badRequest(res, 'Password baru dan konfirmasi password wajib diisi')
  }

  if (newPassword !== confirmPassword) {
    return api.badRequest(res, 'Konfirmasi password tidak sesuai')
  }

  if (newPassword.length < 8) {
    return api.badRequest(res, 'Password baru minimal 8 karakter')
  }

  const hashed = await bcrypt.hash(newPassword, 12)
  await user.update({ password: hashed, refresh_token: null })

  return api.success(res, null, 'Password user berhasil diperbarui')
}

exports.deleteUser = async (req, res) => {
  const user = await User.findByPk(req.params.id)
  if (!user) return api.notFound(res, 'User tidak ditemukan')

  if (req.user.id === user.id) {
    return api.badRequest(res, 'Akun yang sedang dipakai tidak dapat dihapus')
  }

  if (!canManageTargetUser(req.user, user)) {
    return api.forbidden(res, 'Anda tidak memiliki akses untuk menghapus user ini.')
  }

  if (user.avatar_id) {
    try {
      await deleteFromCloudinary(user.avatar_id)
    } catch (error) {
      logger.warn(`Gagal menghapus avatar user ${user.email}: ${error.message}`)
    }
  }

  await user.destroy()
  return api.success(res, null, 'User berhasil dihapus')
}
