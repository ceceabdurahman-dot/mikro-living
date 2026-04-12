const { Op } = require('sequelize')
const slugify = require('slugify')
const { Service } = require('../models')
const { deleteFromCloudinary } = require('../config/cloudinary')
const api = require('../utils/apiResponse')

const normalizeArrayField = (value) => {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'string') return JSON.parse(value)
  return []
}

const parseBoolean = (value) => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value === 'true'
  return false
}

const canUseCmsScope = (req) =>
  req.query.cms === 'true' && ['superadmin', 'admin'].includes(req.user?.role)

exports.getAll = async (req, res) => {
  const includeCmsContent = canUseCmsScope(req)
  const where = includeCmsContent ? {} : { is_active: true }
  const { page, limit, q, status } = req.query

  if (includeCmsContent && status === 'active') where.is_active = true
  if (includeCmsContent && status === 'inactive') where.is_active = false
  if (q) {
    where[Op.or] = [
      { title: { [Op.like]: `%${q}%` } },
      { description: { [Op.like]: `%${q}%` } },
    ]
  }

  const shouldPaginate = Boolean(page || limit || q || status)

  if (shouldPaginate) {
    const currentPage = parseInt(page || '1', 10)
    const currentLimit = parseInt(limit || '20', 10)
    const offset = (currentPage - 1) * currentLimit

    const { count, rows } = await Service.findAndCountAll({
      where,
      order: [['sort_order', 'ASC']],
      limit: currentLimit,
      offset,
    })

    return api.paginated(res, rows, count, currentPage, currentLimit)
  }

  const services = await Service.findAll({ where, order: [['sort_order', 'ASC']] })
  return api.success(res, services)
}

exports.create = async (req, res) => {
  const { title, description, icon, features, price_from, sort_order } = req.body
  if (!title) return api.badRequest(res, 'Title wajib diisi')

  const slug = slugify(title, { lower: true, strict: true, locale: 'id' })
  const iconData = req.file ? { icon_url: req.file.path, icon_id: req.file.filename } : {}

  const service = await Service.create({
    title,
    slug,
    description,
    icon,
    features: normalizeArrayField(features),
    price_from,
    sort_order: sort_order || 0,
    ...iconData,
  })

  return api.created(res, service, 'Layanan berhasil dibuat')
}

exports.update = async (req, res) => {
  const service = await Service.findByPk(req.params.id)
  if (!service) return api.notFound(res, 'Layanan tidak ditemukan')

  const updates = { ...req.body }
  if (updates.features !== undefined) updates.features = normalizeArrayField(updates.features)
  if (updates.is_active !== undefined) updates.is_active = parseBoolean(updates.is_active)

  if (req.file) {
    if (service.icon_id) await deleteFromCloudinary(service.icon_id).catch(() => {})
    updates.icon_url = req.file.path
    updates.icon_id = req.file.filename
  }

  await service.update(updates)
  return api.success(res, service, 'Layanan berhasil diperbarui')
}

exports.remove = async (req, res) => {
  const service = await Service.findByPk(req.params.id)
  if (!service) return api.notFound(res, 'Layanan tidak ditemukan')

  if (service.icon_id) await deleteFromCloudinary(service.icon_id).catch(() => {})
  await service.destroy()
  return api.success(res, null, 'Layanan berhasil dihapus')
}
