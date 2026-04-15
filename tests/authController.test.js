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

test('create user rejects whitespace-only required fields', async () => {
  let badRequestMessage = null
  let findOneCalled = false

  const { controller, restore } = loadControllerWithMocks({
    models: {
      User: {
        findOne: async () => {
          findOneCalled = true
          return null
        },
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
      user: { id: 2, role: 'admin' },
      body: {
        name: '   ',
        email: '   ',
        password: 'password-123',
        role: 'editor',
      },
    }
    const res = {}

    await controller.createUser(req, res)

    assert.equal(badRequestMessage, 'Nama, email, dan password wajib diisi')
    assert.equal(findOneCalled, false)
  } finally {
    restore()
  }
})

test('update user rejects self demotion for superadmin accounts', async () => {
  let badRequestMessage = null
  let updateCalled = false

  const user = {
    id: 11,
    role: 'superadmin',
    update: async () => {
      updateCalled = true
    },
    reload: async () => {},
  }

  const { controller, restore } = loadControllerWithMocks({
    models: {
      User: {
        findByPk: async () => user,
        findOne: async () => null,
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
      params: { id: '11' },
      user: { id: 11, role: 'superadmin' },
      body: {
        role: 'editor',
      },
    }
    const res = {}

    await controller.updateUser(req, res)

    assert.equal(badRequestMessage, 'Role superadmin tidak dapat diubah melalui form ini.')
    assert.equal(updateCalled, false)
  } finally {
    restore()
  }
})

test('update user rejects invalid email format', async () => {
  let badRequestMessage = null
  let findOneCalled = false

  const user = {
    id: 12,
    role: 'editor',
    update: async () => {
      throw new Error('update should not run for invalid email')
    },
    reload: async () => {},
  }

  const { controller, restore } = loadControllerWithMocks({
    models: {
      User: {
        findByPk: async () => user,
        findOne: async () => {
          findOneCalled = true
          return null
        },
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
      params: { id: '12' },
      user: { id: 1, role: 'admin' },
      body: {
        email: 'not-an-email',
      },
    }
    const res = {}

    await controller.updateUser(req, res)

    assert.equal(badRequestMessage, 'Format email tidak valid')
    assert.equal(findOneCalled, false)
  } finally {
    restore()
  }
})

test('bulk update user status rejects malformed boolean payloads', async () => {
  let badRequestMessage = null
  let findAllCalled = false

  const { controller, restore } = loadControllerWithMocks({
    models: {
      User: {
        findAll: async () => {
          findAllCalled = true
          return []
        },
        update: async () => {
          throw new Error('bulk update should not run for invalid payload')
        },
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
      body: {
        ids: [5, 6],
        is_active: 'yes',
      },
      user: { id: 1, role: 'admin' },
    }
    const res = {}

    await controller.bulkUpdateUserStatus(req, res)

    assert.equal(badRequestMessage, 'Status user harus bernilai true atau false.')
    assert.equal(findAllCalled, false)
  } finally {
    restore()
  }
})

test('forgot password keeps generic response when delivery fails in production', async () => {
  process.env.NODE_ENV = 'production'
  process.env.JWT_SECRET = 'test-jwt-secret-32-characters-long'

  let successPayload = null
  let errorCalled = false

  const user = {
    id: 18,
    email: 'admin@mikroliving.test',
    name: 'Admin',
    password: '$2a$12$hashed-password-value',
    is_active: true,
  }

  const { controller, restore } = loadControllerWithMocks({
    models: {
      User: {
        findOne: async ({ where }) => (where?.email === user.email ? user : null),
      },
    },
    apiResponse: {
      ...noopApiResponse,
      success: (res, data, message) => {
        successPayload = { data, message }
        return { ok: true, data, message }
      },
      error: () => {
        errorCalled = true
        return { ok: false }
      },
    },
    logger: noopLogger,
    email: {
      sendMail: async () => {
        throw new Error('smtp unavailable')
      },
    },
    cloudinary: { deleteFromCloudinary: async () => {} },
    authCookies: {
      REFRESH_COOKIE_NAME: 'ml_refresh_token',
      clearAuthCookies: () => {},
      setAuthCookies: () => {},
    },
  })

  try {
    const req = {
      body: {
        email: user.email,
      },
    }
    const res = {}

    await controller.forgotPassword(req, res)

    assert.deepEqual(successPayload, {
      data: null,
      message: 'Jika email terdaftar, tautan reset password akan dikirim ke inbox Anda.',
    })
    assert.equal(errorCalled, false)
  } finally {
    restore()
    delete process.env.NODE_ENV
  }
})
