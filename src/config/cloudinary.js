// src/config/cloudinary.js
const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary')
const multer = require('multer')

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// ── Storage factory (berbeda folder per tipe konten) ──────────────────────────
const createStorage = (folder, transformations = []) =>
  new CloudinaryStorage({
    cloudinary,
    params: async (req, file) => ({
      folder: `${process.env.CLOUDINARY_FOLDER || 'mikroliving'}/${folder}`,
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
      transformation: transformations,
      use_filename: false,
      unique_filename: true,
      overwrite: false,
    }),
  })

// Preset transformasi untuk berbagai konteks
const TRANSFORMS = {
  // Gambar hero/portfolio — kualitas tinggi, WebP
  portfolio: [
    { width: 1920, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' },
  ],
  // Thumbnail card proyek
  thumbnail: [
    { width: 800, height: 600, crop: 'fill', gravity: 'auto', quality: 'auto:eco', fetch_format: 'auto' },
  ],
  // Avatar team / klien
  avatar: [
    { width: 400, height: 400, crop: 'fill', gravity: 'face', quality: 'auto:good', fetch_format: 'auto' },
  ],
  // Gambar blog / insight
  blog: [
    { width: 1200, crop: 'limit', quality: 'auto:good', fetch_format: 'auto' },
  ],
  // Logo / service icon
  logo: [
    { width: 400, crop: 'limit', quality: 'auto:best', fetch_format: 'auto' },
  ],
}

// ── Multer upload instances ───────────────────────────────────────────────────
const fileSizeLimits = { fileSize: 15 * 1024 * 1024 } // 15MB max upload

const mimeFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
  if (allowed.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Format file tidak didukung. Gunakan JPG, PNG, WebP, atau AVIF.'), false)
  }
}

const uploadPortfolio  = multer({ storage: createStorage('projects', TRANSFORMS.portfolio), limits: fileSizeLimits, fileFilter: mimeFilter })
const uploadThumbnail  = multer({ storage: createStorage('thumbnails', TRANSFORMS.thumbnail), limits: fileSizeLimits, fileFilter: mimeFilter })
const uploadAvatar     = multer({ storage: createStorage('avatars', TRANSFORMS.avatar), limits: fileSizeLimits, fileFilter: mimeFilter })
const uploadBlog       = multer({ storage: createStorage('blog', TRANSFORMS.blog), limits: fileSizeLimits, fileFilter: mimeFilter })
const uploadLogo       = multer({ storage: createStorage('logos', TRANSFORMS.logo), limits: fileSizeLimits, fileFilter: mimeFilter })

// ── Helper: hapus aset dari Cloudinary ───────────────────────────────────────
const deleteFromCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId)
    return result
  } catch (err) {
    console.error('Cloudinary delete error:', err)
    throw err
  }
}

// ── Helper: generate URL dengan transformasi on-the-fly ───────────────────────
const generateOptimizedUrl = (publicId, options = {}) => {
  const defaults = {
    quality: 'auto',
    fetch_format: 'auto',
    ...options,
  }
  return cloudinary.url(publicId, defaults)
}

module.exports = {
  cloudinary,
  uploadPortfolio,
  uploadThumbnail,
  uploadAvatar,
  uploadBlog,
  uploadLogo,
  deleteFromCloudinary,
  generateOptimizedUrl,
}
