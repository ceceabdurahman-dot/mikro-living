const test = require('node:test')
const assert = require('node:assert/strict')
const crypto = require('node:crypto')
const path = require('node:path')
const jwt = require('jsonwebtoken')

const controllerPath = path.resolve(__dirname, '../src/controllers/authController.js')
const modelsPath = require.resolve('../src/models')
const apiResponsePath = require.resolve('../src/utils/apiResponse')
const loggerPath = require.resolve('../src/utils/logger')
const emailPath = require.resolve('../src/utils/email')
const cloudinaryPath = require.resolve('../src/config/cloudinary')
const authCookiesPath = require.resolve('../src/utils/authCookies')

const hashRefreshToken = (token) => `sha256:${crypto.createHash('sha256').update(token).digest('hex')}`

const createCachedModule = (modulePath, exports) => ({
  id: modulePath,
  filename: modulePath,
  loaded: true,
  exports,
})

const loadControllerWithMocks = ({
  models,
  apiResponse,
  logger,
  email,
  cloudinary,
  authCookies,
}) => {
  const originalEntries = new Map([
    [modelsPath, require.cache[modelsPath]],
    [apiResponsePath, require.cache[apiResponsePath]],
    [loggerPath, require.cache[loggerPath]],
    [emailPath, require.cache[emailPath]],
    [cloudinaryPath, require.cache[cloudinaryPath]],
    [authCookiesPath, require.cache[authCookiesPath]],
    [controllerPath, require.cache[controllerPath]],
  ])

  require.cache[modelsPath] = createCachedModule(modelsPath, models)
  require.cache[apiResponsePath] = createCachedModule(apiResponsePath, apiResponse)
  require.cache[loggerPath] = createCachedModule(loggerPath, logger)
  require.cache[emailPath] = createCachedModule(emailPath, email)
  require.cache[cloudinaryPath] = createCachedModule(cloudinaryPath, cloudinary)
  require.cache[authCookiesPath] = createCachedModule(authCookiesPath, authCookies)
  delete require.cache[controllerPath]

  const controller = require(controllerPath)

  return {
    controller,
    restore() {
      delete require.cache[controllerPath]

      for (const [modulePath, originalEntry] of originalEntries.entries()) {
        if (originalEntry) {
          require.cache[modulePath] = originalEntry
        } else {
          delete require.cache[modulePath]
        }
      }
    },
  }
}

const noopLogger = {
  info() {},
  warn() {},
  error() {},
}

const noopApiResponse = {
  success() {
    return { ok: true }
  },
  badRequest() {
    return { ok: false }
  },
  forbidden() {
    return { ok: false }
  },
  notFound() {
    return { ok: false }
  },
}

test('logout revokes stored refresh token when access token is missing but refresh cookie is valid', async () => {
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret'

  const refreshToken = jwt.sign({ id: 42 }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d',
  })

  let updatedPayload = null
  let cookiesCleared = false
  let successMessage = null

  const user = {
    id: 42,
    refresh_token: hashRefreshToken(refreshToken),
    update: async (payload) => {
      updatedPayload = payload
    },
  }

  const { controller, restore } = loadControllerWithMocks({
    models: {
      User: {
        findByPk: async (id) => (id === 42 ? user : null),
      },
    },
    apiResponse: {
      ...noopApiResponse,
      success: (res, data, message) => {
        successMessage = message
        return { ok: true, data, message }
      },
    },
    logger: noopLogger,
    email: { sendMail: async () => {} },
    cloudinary: { deleteFromCloudinary: async () => {} },
    authCookies: {
      REFRESH_COOKIE_NAME: 'ml_refresh_token',
      clearAuthCookies: () => {
        cookiesCleared = true
      },
      setAuthCookies: () => {},
    },
  })

  try {
    const req = {
      cookies: {
        ml_refresh_token: refreshToken,
      },
    }
    const res = {}

    await controller.logout(req, res)

    assert.deepEqual(updatedPayload, { refresh_token: null })
    assert.equal(cookiesCleared, true)
    assert.equal(successMessage, 'Logout berhasil')
  } finally {
    restore()
  }
})

test('refresh token rotation accepts legacy raw tokens and stores hashed replacement', async () => {
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret'
  process.env.JWT_SECRET = 'test-access-secret'

  const refreshToken = jwt.sign({ id: 21 }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: '30d',
  })

  let updatedPayload = null
  let authCookiesPayload = null
  let successMessage = null

  const user = {
    id: 21,
    email: 'admin@mikroliving.test',
    role: 'admin',
    is_active: true,
    refresh_token: refreshToken,
    update: async (payload) => {
      updatedPayload = payload
    },
  }

  const { controller, restore } = loadControllerWithMocks({
    models: {
      User: {
        findByPk: async (id) => (id === 21 ? user : null),
      },
    },
    apiResponse: {
      ...noopApiResponse,
      success: (res, data, message) => {
        successMessage = message
        return { ok: true, data, message }
      },
      unauthorized: () => {
        throw new Error('refresh token should have been accepted')
      },
    },
    logger: noopLogger,
    email: { sendMail: async () => {} },
    cloudinary: { deleteFromCloudinary: async () => {} },
    authCookies: {
      REFRESH_COOKIE_NAME: 'ml_refresh_token',
      clearAuthCookies: () => {},
      setAuthCookies: (res, accessToken, nextRefreshToken) => {
        authCookiesPayload = { accessToken, refreshToken: nextRefreshToken }
      },
    },
  })

  try {
    const req = {
      cookies: {
        ml_refresh_token: refreshToken,
      },
    }
    const res = {}

    await controller.refreshToken(req, res)

    assert.equal(successMessage, 'Token diperbarui')
    assert.ok(authCookiesPayload?.accessToken)
    assert.ok(authCookiesPayload?.refreshToken)
    assert.deepEqual(updatedPayload, {
      refresh_token: hashRefreshToken(authCookiesPayload.refreshToken),
    })
  } finally {
    restore()
  }
})

test('admin reset password endpoint rejects self password changes', async () => {
  let updateCalled = false
  let badRequestMessage = null

  const user = {
    id: 7,
    role: 'admin',
    update: async () => {
      updateCalled = true
    },
  }

  const { controller, restore } = loadControllerWithMocks({
    models: {
      User: {
        findByPk: async () => user,
      },
    },
    apiResponse: {
      ...noopApiResponse,
      badRequest: (res, message) => {
        badRequestMessage = message
        return { ok: false, message }
      },
    },
    logger: noopLogger,
    email: { sendMail: async () => {} },
    cloudinary: { deleteFromCloudinary: async () => {} },
    authCookies: {
      REFRESH_COOKIE_NAME: 'ml_refresh_token',
      clearAuthCookies: () => {},
      setAuthCookies: () => {},
    },
  })

  try {
    const req = {
      params: { id: '7' },
      user: { id: 7, role: 'admin' },
      body: {
        newPassword: 'new-password-123',
        confirmPassword: 'new-password-123',
      },
    }
    const res = {}

    await controller.resetUserPassword(req, res)

    assert.equal(badRequestMessage, 'Gunakan fitur ubah password untuk akun sendiri.')
    assert.equal(updateCalled, false)
  } finally {
    restore()
  }
})
