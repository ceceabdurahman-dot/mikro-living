const { Op } = require('sequelize')
const {
  Testimonial,
  Project,
  SiteSetting,
  ConsultationRequest,
  TeamMember,
  BlogPost,
} = require('../models')
const { deleteFromCloudinary } = require('../config/cloudinary')
const api = require('../utils/apiResponse')

const normalizeActiveStatus = (value) => {
  if (!value || value === 'all') return undefined
  if (value === 'active') return true
  if (value === 'inactive') return false
  return undefined
}

const testimonialController = {
  getAll: async (req, res) => {
    const where = req.user ? {} : { is_active: true }
    const { page, limit, q, status } = req.query
    const activeStatus = normalizeActiveStatus(status)

    if (req.query.featured === 'true') where.is_featured = true
    if (activeStatus !== undefined) where.is_active = activeStatus
    if (q) {
      where[Op.or] = [
        { client_name: { [Op.like]: `%${q}%` } },
        { client_title: { [Op.like]: `%${q}%` } },
        { content: { [Op.like]: `%${q}%` } },
      ]
    }

    const shouldPaginate = Boolean(page || limit || q || status)

    if (shouldPaginate) {
      const currentPage = parseInt(page || '1', 10)
      const currentLimit = parseInt(limit || '20', 10)
      const offset = (currentPage - 1) * currentLimit

      const { count, rows } = await Testimonial.findAndCountAll({
        where,
        include: [{ model: Project, as: 'project', attributes: ['id', 'title', 'slug'] }],
        order: [['sort_order', 'ASC']],
        limit: currentLimit,
        offset,
      })

      return api.paginated(res, rows, count, currentPage, currentLimit)
    }

    const items = await Testimonial.findAll({
      where,
      include: [{ model: Project, as: 'project', attributes: ['id', 'title', 'slug'] }],
      order: [['sort_order', 'ASC']],
    })

    return api.success(res, items)
  },

  create: async (req, res) => {
    const {
      client_name,
      client_title,
      content,
      rating,
      project_id,
      is_featured,
      is_active,
      sort_order,
    } = req.body

    if (!client_name || !content) {
      return api.badRequest(res, 'Nama klien dan testimonial wajib diisi')
    }

    const avatarData = req.file ? { avatar_url: req.file.path, avatar_id: req.file.filename } : {}

    const item = await Testimonial.create({
      client_name,
      client_title,
      content,
      rating: rating || 5,
      project_id: project_id || null,
      is_featured: is_featured === 'true',
      is_active: is_active !== 'false',
      sort_order: sort_order || 0,
      ...avatarData,
    })

    return api.created(res, item, 'Testimonial berhasil ditambahkan')
  },

  update: async (req, res) => {
    const item = await Testimonial.findByPk(req.params.id)
    if (!item) return api.notFound(res, 'Testimonial tidak ditemukan')

    const updates = { ...req.body }
    if (typeof updates.is_featured === 'string') updates.is_featured = updates.is_featured === 'true'
    if (typeof updates.is_active === 'string') updates.is_active = updates.is_active === 'true'

    if (req.file) {
      if (item.avatar_id) await deleteFromCloudinary(item.avatar_id).catch(() => {})
      updates.avatar_url = req.file.path
      updates.avatar_id = req.file.filename
    }

    await item.update(updates)
    return api.success(res, item, 'Testimonial berhasil diperbarui')
  },

  remove: async (req, res) => {
    const item = await Testimonial.findByPk(req.params.id)
    if (!item) return api.notFound(res, 'Testimonial tidak ditemukan')

    if (item.avatar_id) await deleteFromCloudinary(item.avatar_id).catch(() => {})
    await item.destroy()
    return api.success(res, null, 'Testimonial berhasil dihapus')
  },
}

const settingController = {
  getAll: async (req, res) => {
    const settings = await SiteSetting.findAll({ order: [['group', 'ASC'], ['key', 'ASC']] })
    const grouped = settings.reduce((acc, setting) => {
      const group = setting.group || 'general'
      if (!acc[group]) acc[group] = {}
      acc[group][setting.key] =
        setting.type === 'json' ? JSON.parse(setting.value || '{}') : setting.value
      return acc
    }, {})

    return api.success(res, grouped)
  },

  get: async (req, res) => {
    const setting = await SiteSetting.findOne({ where: { key: req.params.key } })
    if (!setting) return api.notFound(res, 'Setting tidak ditemukan')
    return api.success(res, setting)
  },

  upsert: async (req, res) => {
    const { key } = req.params
    const { value, type, label, group } = req.body

    const [setting, created] = await SiteSetting.findOrCreate({
      where: { key },
      defaults: { value, type: type || 'text', label, group },
    })

    if (!created) {
      await setting.update({
        value,
        ...(type && { type }),
        ...(label && { label }),
        ...(group && { group }),
      })
    }

    return api.success(
      res,
      setting,
      `Setting '${key}' berhasil ${created ? 'dibuat' : 'diperbarui'}`
    )
  },

  bulkUpdate: async (req, res) => {
    const { settings } = req.body
    if (!settings || typeof settings !== 'object') {
      return api.badRequest(res, 'Format tidak valid')
    }

    await Promise.all(
      Object.entries(settings).map(([key, value]) =>
        SiteSetting.update({ value: String(value) }, { where: { key } })
      )
    )

    return api.success(res, null, 'Settings berhasil diperbarui')
  },
}

const consultationController = {
  submit: async (req, res) => {
    const { name, email, phone, message, service_type, budget_range, location, area_sqm } = req.body

    if (!name || !email) {
      return api.badRequest(res, 'Nama dan email wajib diisi')
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return api.badRequest(res, 'Format email tidak valid')
    }

    const request = await ConsultationRequest.create({
      name,
      email,
      phone,
      message,
      service_type,
      budget_range,
      location,
      area_sqm,
      source: req.body.source || 'website',
    })

    return api.created(
      res,
      { id: request.id },
      'Permintaan konsultasi berhasil dikirim. Kami akan menghubungi Anda segera.'
    )
  },

  getAll: async (req, res) => {
    const { page = 1, limit = 20, status } = req.query
    const where = status ? { status } : {}
    const offset = (parseInt(page, 10) - 1) * parseInt(limit, 10)

    const { count, rows } = await ConsultationRequest.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit: parseInt(limit, 10),
      offset,
    })

    return api.paginated(res, rows, count, page, limit)
  },

  updateStatus: async (req, res) => {
    const item = await ConsultationRequest.findByPk(req.params.id)
    if (!item) return api.notFound(res, 'Request tidak ditemukan')

    const { status, notes } = req.body
    await item.update({ ...(status && { status }), ...(notes !== undefined && { notes }) })
    return api.success(res, item, 'Status berhasil diperbarui')
  },
}

const teamController = {
  getAll: async (req, res) => {
    const where = req.user ? {} : { is_active: true }
    const { page, limit, q, status } = req.query
    const activeStatus = normalizeActiveStatus(status)

    if (activeStatus !== undefined) where.is_active = activeStatus
    if (q) {
      where[Op.or] = [
        { name: { [Op.like]: `%${q}%` } },
        { role: { [Op.like]: `%${q}%` } },
        { bio: { [Op.like]: `%${q}%` } },
      ]
    }

    const shouldPaginate = Boolean(page || limit || q || status)

    if (shouldPaginate) {
      const currentPage = parseInt(page || '1', 10)
      const currentLimit = parseInt(limit || '20', 10)
      const offset = (currentPage - 1) * currentLimit

      const { count, rows } = await TeamMember.findAndCountAll({
        where,
        order: [['sort_order', 'ASC']],
        limit: currentLimit,
        offset,
      })

      return api.paginated(res, rows, count, currentPage, currentLimit)
    }

    const members = await TeamMember.findAll({ where, order: [['sort_order', 'ASC']] })
    return api.success(res, members)
  },

  create: async (req, res) => {
    const { name, role, bio, instagram, linkedin, is_active, sort_order } = req.body
    if (!name) return api.badRequest(res, 'Nama wajib diisi')

    const avatarData = req.file ? { avatar_url: req.file.path, avatar_id: req.file.filename } : {}
    const member = await TeamMember.create({
      name,
      role,
      bio,
      instagram,
      linkedin,
      is_active: is_active !== 'false',
      sort_order: sort_order || 0,
      ...avatarData,
    })

    return api.created(res, member, 'Anggota tim berhasil ditambahkan')
  },

  update: async (req, res) => {
    const member = await TeamMember.findByPk(req.params.id)
    if (!member) return api.notFound(res, 'Anggota tim tidak ditemukan')

    const updates = { ...req.body }
    if (typeof updates.is_active === 'string') updates.is_active = updates.is_active === 'true'

    if (req.file) {
      if (member.avatar_id) await deleteFromCloudinary(member.avatar_id).catch(() => {})
      updates.avatar_url = req.file.path
      updates.avatar_id = req.file.filename
    }

    await member.update(updates)
    return api.success(res, member, 'Data anggota tim berhasil diperbarui')
  },

  remove: async (req, res) => {
    const member = await TeamMember.findByPk(req.params.id)
    if (!member) return api.notFound(res, 'Anggota tim tidak ditemukan')

    if (member.avatar_id) await deleteFromCloudinary(member.avatar_id).catch(() => {})
    await member.destroy()
    return api.success(res, null, 'Anggota tim berhasil dihapus')
  },
}

const dashboardController = {
  stats: async (req, res) => {
    const [projects, posts, consultations, newConsultations] = await Promise.all([
      Project.count({ where: { status: 'published' } }),
      BlogPost.count({ where: { status: 'published' } }),
      ConsultationRequest.count(),
      ConsultationRequest.count({ where: { status: 'new' } }),
    ])

    const recentConsultations = await ConsultationRequest.findAll({
      order: [['created_at', 'DESC']],
      limit: 5,
    })

    const topProjects = await Project.findAll({
      attributes: ['id', 'title', 'slug', 'views', 'category'],
      order: [['views', 'DESC']],
      limit: 5,
    })

    return api.success(res, {
      counts: { projects, posts, consultations, newConsultations },
      recentConsultations,
      topProjects,
    })
  },
}

module.exports = {
  testimonialController,
  settingController,
  consultationController,
  teamController,
  dashboardController,
}
