// src/middleware/errorHandler.js
const logger = require('../utils/logger')

const errorHandler = (err, req, res, next) => {
  logger.error(`${err.message} — ${req.method} ${req.originalUrl}`, { stack: err.stack })

  // Sequelize validation errors
  if (err.name === 'SequelizeValidationError' || err.name === 'SequelizeUniqueConstraintError') {
    const errors = err.errors.map((e) => ({ field: e.path, message: e.message }))
    return res.status(422).json({ success: false, message: 'Validasi gagal', errors })
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ success: false, message: 'Token tidak valid' })
  }

  // Multer / file upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ success: false, message: 'Ukuran file terlalu besar. Maksimal 15MB.' })
  }

  // Default
  const statusCode = err.statusCode || 500
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Terjadi kesalahan server' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
  })
}

const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} tidak ditemukan`,
  })
}

module.exports = { errorHandler, notFoundHandler }
