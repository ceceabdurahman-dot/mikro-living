// src/utils/apiResponse.js

/**
 * Standar format response API MikroLiving
 * Semua controller menggunakan helper ini agar konsisten
 */

const success = (res, data = null, message = 'Success', statusCode = 200, meta = null) => {
  const response = { success: true, message, data }
  if (meta) response.meta = meta
  return res.status(statusCode).json(response)
}

const created = (res, data = null, message = 'Resource created successfully') =>
  success(res, data, message, 201)

const paginated = (res, data, total, page, limit, message = 'Success') => {
  const totalPages = Math.ceil(total / limit)
  return success(res, data, message, 200, {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  })
}

const error = (res, message = 'Internal server error', statusCode = 500, errors = null) => {
  const response = { success: false, message }
  if (errors) response.errors = errors
  return res.status(statusCode).json(response)
}

const notFound = (res, message = 'Resource not found') => error(res, message, 404)

const unauthorized = (res, message = 'Unauthorized') => error(res, message, 401)

const forbidden = (res, message = 'Forbidden') => error(res, message, 403)

const badRequest = (res, message = 'Bad request', errors = null) =>
  error(res, message, 400, errors)

const validationError = (res, errors) =>
  error(res, 'Validation failed', 422, errors)

module.exports = { success, created, paginated, error, notFound, unauthorized, forbidden, badRequest, validationError }
