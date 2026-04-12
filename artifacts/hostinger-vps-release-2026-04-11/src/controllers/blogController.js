const { Op } = require('sequelize')
const slugify = require('slugify')
const { BlogPost, User } = require('../models')
const { deleteFromCloudinary } = require('../config/cloudinary')
const api = require('../utils/apiResponse')

const makeSlug = (title) => slugify(title, { lower: true, strict: true, locale: 'id' })
const canManagePublish = (req) => req.user?.role === 'superadmin'
const canUseCmsScope = (req) =>
  req.query.cms === 'true' && ['superadmin', 'admin'].includes(req.user?.role)
const normalizeArrayField = (value) => {
  if (!value) return []
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      if (Array.isArray(parsed)) return parsed
    } catch {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean)
    }
  }
  return []
}

const serializeBlogPost = (post) => {
  if (!post) return post
  const plain = typeof post.toJSON === 'function' ? post.toJSON() : post
  return {
    ...plain,
    tags: normalizeArrayField(plain.tags),
  }
}

exports.getAll = async (req, res) => {
  const { page = 1, limit = 9, category, status, q } = req.query
  const where = {}
  const includeCmsContent = canUseCmsScope(req)

  if (!includeCmsContent) where.status = 'published'
  else if (status) where.status = status

  if (category) where.category = category
  if (q) where.title = { [Op.like]: `%${q}%` }

  const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10)
  const { count, rows } = await BlogPost.findAndCountAll({
    where,
    include: [{ model: User, as: 'author', attributes: ['id', 'name', 'avatar_url'] }],
    order: [['published_at', 'DESC'], ['created_at', 'DESC']],
    limit: parseInt(limit, 10),
    offset,
  })

  return api.paginated(
    res,
    rows.map((row) => serializeBlogPost(row)),
    count,
    page,
    limit
  )
}

exports.getOne = async (req, res) => {
  const where = { slug: req.params.slug }
  if (!canUseCmsScope(req)) where.status = 'published'

  const post = await BlogPost.findOne({
    where,
    include: [{ model: User, as: 'author', attributes: ['id', 'name', 'avatar_url'] }],
  })

  if (!post) return api.notFound(res, 'Artikel tidak ditemukan')

  post.increment('views').catch(() => {})
  return api.success(res, serializeBlogPost(post))
}

exports.create = async (req, res) => {
  const {
    title,
    excerpt,
    content,
    category,
    status,
    tags,
    read_time,
    meta_title,
    meta_desc,
  } = req.body

  if (!title) return api.badRequest(res, 'Title wajib diisi')

  let slug = makeSlug(title)
  const exists = await BlogPost.findOne({ where: { slug } })
  if (exists) slug = `${slug}-${Date.now()}`

  const coverData = req.file ? { cover_url: req.file.path, cover_id: req.file.filename } : {}
  const nextStatus = canManagePublish(req) ? status || 'draft' : 'draft'

  const post = await BlogPost.create({
    title,
    slug,
    excerpt,
    content,
    category: category || 'tips',
    status: nextStatus,
    author_id: req.user.id,
    tags: normalizeArrayField(tags),
    read_time: read_time || 5,
    published_at: nextStatus === 'published' ? new Date() : null,
    meta_title,
    meta_desc,
    ...coverData,
  })

  return api.created(res, serializeBlogPost(post), 'Artikel berhasil dibuat')
}

exports.update = async (req, res) => {
  const post = await BlogPost.findByPk(req.params.id)
  if (!post) return api.notFound(res, 'Artikel tidak ditemukan')

  const updates = { ...req.body }
  if (updates.status !== undefined && updates.status !== post.status && !canManagePublish(req)) {
    return api.forbidden(res, 'Hanya superadmin yang dapat mengubah status publish artikel')
  }
  if (updates.title && updates.title !== post.title) {
    let slug = makeSlug(updates.title)
    const exists = await BlogPost.findOne({
      where: { slug, id: { [Op.ne]: post.id } },
    })
    if (exists) slug = `${slug}-${Date.now()}`
    updates.slug = slug
  }
  if (updates.tags !== undefined) updates.tags = normalizeArrayField(updates.tags)

  if (req.file) {
    if (post.cover_id) await deleteFromCloudinary(post.cover_id).catch(() => {})
    updates.cover_url = req.file.path
    updates.cover_id = req.file.filename
  }

  if (updates.status === 'published' && post.status !== 'published') {
    updates.published_at = new Date()
  }

  await post.update(updates)
  return api.success(res, serializeBlogPost(post), 'Artikel berhasil diperbarui')
}

exports.remove = async (req, res) => {
  const post = await BlogPost.findByPk(req.params.id)
  if (!post) return api.notFound(res, 'Artikel tidak ditemukan')

  if (post.cover_id) await deleteFromCloudinary(post.cover_id).catch(() => {})
  await post.destroy()
  return api.success(res, null, 'Artikel berhasil dihapus')
}
