require('./config/loadEnv').loadEnv()
require('express-async-errors')

const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const helmet = require('helmet')
const morgan = require('morgan')
const compression = require('compression')
const rateLimit = require('express-rate-limit')
const path = require('path')

const { connectDB } = require('./config/database')
const routes = require('./routes')
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler')
const logger = require('./utils/logger')

const app = express()
const PORT = process.env.PORT || 5000
const API = process.env.API_PREFIX || '/api/v1'

app.disable('x-powered-by')

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean)

const isLoopbackOrigin = (origin) => {
  try {
    const { hostname, protocol } = new URL(origin)
    return (
      process.env.NODE_ENV !== 'production' &&
      protocol.startsWith('http') &&
      (hostname === 'localhost' || hostname === '127.0.0.1')
    )
  } catch {
    return false
  }
}

const isAllowedOrigin = (origin) => allowedOrigins.includes(origin) || isLoopbackOrigin(origin)

const isLoopbackValue = (value = '') => {
  const normalized = String(value).trim().toLowerCase()
  return (
    normalized === 'localhost' ||
    normalized === '127.0.0.1' ||
    normalized === '::1' ||
    normalized === '::ffff:127.0.0.1'
  )
}

const shouldBypassRateLimit = (req) => {
  if (req.path === '/health') return true
  if (process.env.NODE_ENV === 'production') return false

  const hostHeader = req.headers.host || ''
  return (
    isLoopbackValue(req.hostname) ||
    isLoopbackValue(req.ip) ||
    hostHeader.includes('127.0.0.1') ||
    hostHeader.includes('localhost')
  )
}

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
)
app.use(compression())

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || isAllowedOrigin(origin)) return callback(null, true)
      callback(new Error(`CORS: Origin ${origin} tidak diizinkan`))
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
)

const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 100,
  message: { success: false, message: 'Terlalu banyak request. Coba lagi nanti.' },
  standardHeaders: true,
  legacyHeaders: false,
  skip: shouldBypassRateLimit,
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Terlalu banyak percobaan login. Coba lagi dalam 15 menit.',
  },
  skip: shouldBypassRateLimit,
})

const credentialFlowLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: {
    success: false,
    message: 'Terlalu banyak percobaan pada alur autentikasi. Coba lagi dalam 15 menit.',
  },
  skip: shouldBypassRateLimit,
})

app.use(`${API}/auth/login`, authLimiter)
app.use(`${API}/auth/forgot-password`, credentialFlowLimiter)
app.use(`${API}/auth/reset-password`, credentialFlowLimiter)
app.use(`${API}/auth/change-password`, credentialFlowLimiter)
app.use(API, limiter)

const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev'
app.use(
  morgan(morganFormat, {
    stream: { write: (message) => logger.http(message.trim()) },
  })
)

app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true, limit: '10mb' }))
app.use(cookieParser())

app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))
app.use(API, routes)

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'MikroLiving API | Designing Smart Living Spaces',
    version: '1.0.0',
    docs: `${API}/health`,
    env: process.env.NODE_ENV,
  })
})

app.use(notFoundHandler)
app.use(errorHandler)

const start = async () => {
  await connectDB()
  app.listen(PORT, () => {
    logger.info(`Server running on http://localhost:${PORT}`)
    logger.info(`API base: http://localhost:${PORT}${API}`)
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`)
  })
}

start()

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...')
  const { sequelize: db } = require('./config/database')
  await db.close()
  process.exit(0)
})
