const { Op } = require('sequelize')
const slugify = require('slugify')
const { Project, ProjectImage } = require('../models')
const { deleteFromCloudinary } = require('../config/cloudinary')
const api = require('../utils/apiResponse')

const makeSlug = (title) => slugify(title, { lower: true, strict: true, locale: 'id' })
const canManagePublish = (req) => req.user?.role === 'superadmin'
const canUseCmsScope = (req) =>
  req.query.cms === 'true' && ['superadmin', 'admin'].includes(req.user?.role)

const parseBoolean = (value) => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') return value === 'true'
  return false
}

exports.getAll = async (req, res) => {
  const { page = 1, limit = 12, category, featured, status, q } = req.query
  const where = {}
  const includeCmsContent = canUseCmsScope(req)

  if (!includeCmsContent) where.status = 'published'
  else if (status) where.status = status

  if (category) where.category = category
  if (featured === 'true') where.is_featured = true
  if (q) where.title = { [Op.like]: `%${q}%` }

  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10)
  const { count, rows } = await Project.findAndCountAll({
    where,
    include: [
      {
        model: ProjectImage,
        as: 'images',
        attributes: ['id', 'url', 'alt_text', 'sort_order'],
        limit: 1,
        order: [['sort_order', 'ASC']],
      },
    ],
    order: [['sort_order', 'ASC'], ['created_at', 'DESC']],
    limit: parseInt(limit, 10),
    offset,
  })

  return api.paginated(res, rows, count, page, limit)
}

exports.getOne = async (req, res) => {
  const where = { slug: req.params.slug }
  if (!canUseCmsScope(req)) where.status = 'published'

  const project = await Project.findOne({
    where,
    include: [{ model: ProjectImage, as: 'images', order: [['sort_order', 'ASC']] }],
  })

  if (!project) return api.notFound(res, 'Proyek tidak ditemukan')

  project.increment('views').catch(() => {})
  return api.success(res, project)
}

exports.create = async (req, res) => {
  const {
    title,
    description,
    location,
    area_sqm,
    category,
    status,
    is_featured,
    year_completed,
    client_name,
    sort_order,
    meta_title,
    meta_desc,
  } = req.body

  if (!title || !category) return api.badRequest(res, 'Title dan category wajib diisi')

  let slug = makeSlug(title)
  const exists = await Project.findOne({ where: { slug } })
  if (exists) slug = `${slug}-${Date.now()}`

  const coverData = req.file ? { cover_url: req.file.path, cover_id: req.file.filename } : {}
  const nextStatus = canManagePublish(req) ? status || 'draft' : 'draft'

  const project = await Project.create({
    title,
    slug,
    description,
    location,
    area_sqm,
    category,
    status: nextStatus,
    is_featured: parseBoolean(is_featured),
    year_completed,
    client_name,
    sort_order: sort_order || 0,
    meta_title,
    meta_desc,
    ...coverData,
  })

  return api.created(res, project, 'Proyek berhasil dibuat')
}

exports.update = async (req, res) => {
  const project = await Project.findByPk(req.params.id)
  if (!project) return api.notFound(res, 'Proyek tidak ditemukan')

  const updates = { ...req.body }
  if (
    updates.status !== undefined &&
    updates.status !== project.status &&
    !canManagePublish(req)
  ) {
    return api.forbidden(res, 'Hanya superadmin yang dapat mengubah status publish proyek')
  }

  if (updates.title && updates.title !== project.title) {
    let slug = makeSlug(updates.title)
    const exists = await Project.findOne({
      where: { slug, id: { [Op.ne]: project.id } },
    })
    if (exists) slug = `${slug}-${Date.now()}`
    updates.slug = slug
  }

  if (req.file) {
    if (project.cover_id) {
      await deleteFromCloudinary(project.cover_id).catch(() => {})
    }
    updates.cover_url = req.file.path
    updates.cover_id = req.file.filename
  }

  if (updates.is_featured !== undefined) {
    updates.is_featured = parseBoolean(updates.is_featured)
  }

  await project.update(updates)
  return api.success(res, project, 'Proyek berhasil diperbarui')
}

exports.remove = async (req, res) => {
  const project = await Project.findByPk(req.params.id, {
    include: [{ model: ProjectImage, as: 'images' }],
  })
  if (!project) return api.notFound(res, 'Proyek tidak ditemukan')

  const deletePromises = project.images.map((image) =>
    deleteFromCloudinary(image.public_id).catch(() => {})
  )
  if (project.cover_id) {
    deletePromises.push(deleteFromCloudinary(project.cover_id).catch(() => {}))
  }
  await Promise.all(deletePromises)

  await project.destroy()
  return api.success(res, null, 'Proyek berhasil dihapus')
}

exports.uploadImages = async (req, res) => {
  const project = await Project.findByPk(req.params.id)
  if (!project) return api.notFound(res, 'Proyek tidak ditemukan')

  if (!req.files || req.files.length === 0) {
    return api.badRequest(res, 'Tidak ada file yang diupload')
  }

  const images = await ProjectImage.bulkCreate(
    req.files.map((file, index) => ({
      project_id: project.id,
      url: file.path,
      public_id: file.filename,
      alt_text: req.body.alt_text || project.title,
      sort_order: index,
    }))
  )

  return api.created(res, images, `${images.length} gambar berhasil diupload`)
}

exports.deleteImage = async (req, res) => {
  const image = await ProjectImage.findByPk(req.params.imageId)
  if (!image) return api.notFound(res, 'Gambar tidak ditemukan')

  await deleteFromCloudinary(image.public_id).catch(() => {})
  await image.destroy()
  return api.success(res, null, 'Gambar berhasil dihapus')
}

exports.updateImageSortOrder = async (req, res) => {
  const image = await ProjectImage.findByPk(req.params.imageId)
  if (!image) return api.notFound(res, 'Gambar tidak ditemukan')

  const { sort_order } = req.body
  await image.update({ sort_order: Number(sort_order || 0) })
  return api.success(res, image, 'Urutan gambar berhasil diperbarui')
}

exports.toggleFeatured = async (req, res) => {
  const project = await Project.findByPk(req.params.id)
  if (!project) return api.notFound(res, 'Proyek tidak ditemukan')

  if (!canManagePublish(req)) {
    return api.forbidden(res, 'Hanya superadmin yang dapat mengubah status featured proyek')
  }

  await project.update({ is_featured: !project.is_featured })
  return api.success(
    res,
    { is_featured: project.is_featured },
    `Proyek ${project.is_featured ? 'ditandai' : 'dihapus dari'} featured`
  )
}
