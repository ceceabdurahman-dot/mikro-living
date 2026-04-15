const test = require('node:test')
const assert = require('node:assert/strict')

const { validateTrustedOriginRequest } = require('../src/middleware/trustedOrigin')

test('trusted origin validation allows bearer-authenticated writes without browser origin', () => {
  const result = validateTrustedOriginRequest(
    {
      method: 'POST',
      headers: {
        authorization: 'Bearer test-token',
      },
      hostname: 'api.mikroliving.test',
      ip: '203.0.113.10',
    },
    {
      nodeEnv: 'production',
      allowedOrigins: ['https://www.mikroliving.id'],
    }
  )

  assert.deepEqual(result, { ok: true })
})

test('trusted origin validation rejects production writes without origin or referer', () => {
  const result = validateTrustedOriginRequest(
    {
      method: 'POST',
      headers: {},
      hostname: 'api.mikroliving.test',
      ip: '203.0.113.10',
    },
    {
      nodeEnv: 'production',
      allowedOrigins: ['https://www.mikroliving.id'],
    }
  )

  assert.deepEqual(result, {
    ok: false,
    message: 'Origin atau referer request wajib valid untuk aksi ini.',
  })
})

test('trusted origin validation accepts allowed same-site origin for cookie-backed writes', () => {
  const result = validateTrustedOriginRequest(
    {
      method: 'PATCH',
      headers: {
        origin: 'https://www.mikroliving.id',
      },
      hostname: 'api.mikroliving.test',
      ip: '203.0.113.10',
    },
    {
      nodeEnv: 'production',
      allowedOrigins: ['https://www.mikroliving.id'],
    }
  )

  assert.deepEqual(result, { ok: true })
})
