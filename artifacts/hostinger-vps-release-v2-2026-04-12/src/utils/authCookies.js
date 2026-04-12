const ACCESS_COOKIE_NAME = 'ml_access_token'
const REFRESH_COOKIE_NAME = 'ml_refresh_token'
const API_PREFIX = process.env.API_PREFIX || '/api/v1'

const parseDurationToMs = (value, fallbackMs) => {
  if (!value || typeof value !== 'string') return fallbackMs

  const match = value.trim().match(/^(\d+)(ms|s|m|h|d)$/i)
  if (!match) return fallbackMs

  const amount = Number(match[1])
  const unit = match[2].toLowerCase()
  const unitMap = {
    ms: 1,
    s: 1000,
    m: 60 * 1000,
    h: 60 * 60 * 1000,
    d: 24 * 60 * 60 * 1000,
  }

  return amount * (unitMap[unit] || 1)
}

const shouldUseSecureCookies = () =>
  process.env.SESSION_COOKIE_SECURE === 'true' ||
  (process.env.NODE_ENV === 'production' && process.env.SESSION_COOKIE_SECURE !== 'false')

const buildCookieOptions = (maxAge, path = '/') => ({
  httpOnly: true,
  sameSite: 'lax',
  secure: shouldUseSecureCookies(),
  path,
  maxAge,
})

const setAuthCookies = (res, accessToken, refreshToken) => {
  const accessMaxAge = parseDurationToMs(process.env.JWT_EXPIRES_IN || '7d', 7 * 24 * 60 * 60 * 1000)
  const refreshMaxAge = parseDurationToMs(
    process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    30 * 24 * 60 * 60 * 1000
  )

  res.cookie(ACCESS_COOKIE_NAME, accessToken, buildCookieOptions(accessMaxAge, API_PREFIX))
  res.cookie(
    REFRESH_COOKIE_NAME,
    refreshToken,
    buildCookieOptions(refreshMaxAge, `${API_PREFIX}/auth`)
  )
}

const clearAuthCookies = (res) => {
  res.clearCookie(ACCESS_COOKIE_NAME, buildCookieOptions(0, '/'))
  res.clearCookie(ACCESS_COOKIE_NAME, buildCookieOptions(0, API_PREFIX))
  res.clearCookie(REFRESH_COOKIE_NAME, buildCookieOptions(0, '/'))
  res.clearCookie(REFRESH_COOKIE_NAME, buildCookieOptions(0, `${API_PREFIX}/auth`))
}

module.exports = {
  ACCESS_COOKIE_NAME,
  REFRESH_COOKIE_NAME,
  setAuthCookies,
  clearAuthCookies,
}
