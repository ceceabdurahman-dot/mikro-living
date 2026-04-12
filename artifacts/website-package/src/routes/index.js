const router = require('express').Router()
const {
  authenticate,
  tryAuthenticate,
  adminOnly,
  superadminOnly,
} = require('../middleware/auth')

const authCtrl = require('../controllers/authController')
const projectCtrl = require('../controllers/projectController')
const blogCtrl = require('../controllers/blogController')
const serviceCtrl = require('../controllers/serviceController')
const {
  testimonialController: testimonialCtrl,
  settingController: settingCtrl,
  consultationController: consultationCtrl,
  teamController: teamCtrl,
  dashboardController: dashboardCtrl,
} = require('../controllers/cmsControllers')

const {
  uploadPortfolio,
  uploadThumbnail,
  uploadAvatar,
  uploadBlog,
  uploadLogo,
} = require('../config/cloudinary')

const authRouter = require('express').Router()
authRouter.post('/login', authCtrl.login)
authRouter.post('/refresh', authCtrl.refreshToken)
authRouter.post('/logout', authenticate, authCtrl.logout)
authRouter.get('/me', authenticate, authCtrl.me)
authRouter.put('/change-password', authenticate, authCtrl.changePassword)
authRouter.post('/users', authenticate, superadminOnly, authCtrl.createUser)
router.use('/auth', authRouter)

router.get('/dashboard/stats', authenticate, adminOnly, dashboardCtrl.stats)

const projectRouter = require('express').Router()
projectRouter.get('/', tryAuthenticate, projectCtrl.getAll)
projectRouter.get('/:slug', tryAuthenticate, projectCtrl.getOne)
projectRouter.post('/', authenticate, adminOnly, uploadThumbnail.single('cover'), projectCtrl.create)
projectRouter.put('/:id', authenticate, adminOnly, uploadThumbnail.single('cover'), projectCtrl.update)
projectRouter.delete('/:id', authenticate, adminOnly, projectCtrl.remove)
projectRouter.patch('/:id/featured', authenticate, adminOnly, projectCtrl.toggleFeatured)
projectRouter.post(
  '/:id/images',
  authenticate,
  adminOnly,
  uploadPortfolio.array('images', 20),
  projectCtrl.uploadImages
)
projectRouter.patch('/images/:imageId/sort', authenticate, adminOnly, projectCtrl.updateImageSortOrder)
projectRouter.delete('/images/:imageId', authenticate, adminOnly, projectCtrl.deleteImage)
router.use('/projects', projectRouter)

const blogRouter = require('express').Router()
blogRouter.get('/', tryAuthenticate, blogCtrl.getAll)
blogRouter.get('/:slug', tryAuthenticate, blogCtrl.getOne)
blogRouter.post('/', authenticate, adminOnly, uploadBlog.single('cover'), blogCtrl.create)
blogRouter.put('/:id', authenticate, adminOnly, uploadBlog.single('cover'), blogCtrl.update)
blogRouter.delete('/:id', authenticate, adminOnly, blogCtrl.remove)
router.use('/blog', blogRouter)

const serviceRouter = require('express').Router()
serviceRouter.get('/', tryAuthenticate, serviceCtrl.getAll)
serviceRouter.post('/', authenticate, adminOnly, uploadLogo.single('icon'), serviceCtrl.create)
serviceRouter.put('/:id', authenticate, adminOnly, uploadLogo.single('icon'), serviceCtrl.update)
serviceRouter.delete('/:id', authenticate, adminOnly, serviceCtrl.remove)
router.use('/services', serviceRouter)

const testimonialRouter = require('express').Router()
testimonialRouter.get('/', tryAuthenticate, testimonialCtrl.getAll)
testimonialRouter.post('/', authenticate, adminOnly, uploadAvatar.single('avatar'), testimonialCtrl.create)
testimonialRouter.put('/:id', authenticate, adminOnly, uploadAvatar.single('avatar'), testimonialCtrl.update)
testimonialRouter.delete('/:id', authenticate, adminOnly, testimonialCtrl.remove)
router.use('/testimonials', testimonialRouter)

const teamRouter = require('express').Router()
teamRouter.get('/', tryAuthenticate, teamCtrl.getAll)
teamRouter.post('/', authenticate, adminOnly, uploadAvatar.single('avatar'), teamCtrl.create)
teamRouter.put('/:id', authenticate, adminOnly, uploadAvatar.single('avatar'), teamCtrl.update)
teamRouter.delete('/:id', authenticate, adminOnly, teamCtrl.remove)
router.use('/team', teamRouter)

const consultationRouter = require('express').Router()
consultationRouter.post('/', consultationCtrl.submit)
consultationRouter.get('/', authenticate, adminOnly, consultationCtrl.getAll)
consultationRouter.patch('/:id', authenticate, adminOnly, consultationCtrl.updateStatus)
router.use('/consultations', consultationRouter)

const settingRouter = require('express').Router()
settingRouter.get('/', authenticate, settingCtrl.getAll)
settingRouter.get('/:key', settingCtrl.get)
settingRouter.put('/:key', authenticate, adminOnly, settingCtrl.upsert)
settingRouter.put('/', authenticate, adminOnly, settingCtrl.bulkUpdate)
router.use('/settings', settingRouter)

router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'OK',
    service: 'MikroLiving API',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
  })
})

module.exports = router
