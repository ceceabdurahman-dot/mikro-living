const { sequelize } = require('../config/database')
const { DataTypes } = require('sequelize')

const User = sequelize.define(
  'User',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    password: { type: DataTypes.STRING(255), allowNull: false },
    role: {
      type: DataTypes.ENUM('superadmin', 'admin', 'editor'),
      defaultValue: 'editor',
    },
    avatar_url: { type: DataTypes.TEXT },
    avatar_id: { type: DataTypes.STRING(255) },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    last_login: { type: DataTypes.DATE },
    refresh_token: { type: DataTypes.TEXT },
  },
  { tableName: 'users' }
)

const Project = sequelize.define(
  'Project',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(200), allowNull: false },
    slug: { type: DataTypes.STRING(220), unique: true, allowNull: false },
    description: { type: DataTypes.TEXT },
    location: { type: DataTypes.STRING(100) },
    area_sqm: { type: DataTypes.DECIMAL(8, 2) },
    category: {
      type: DataTypes.ENUM(
        'apartment',
        'residential',
        'kitchen',
        'bedroom',
        'office',
        'commercial'
      ),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'draft',
    },
    is_featured: { type: DataTypes.BOOLEAN, defaultValue: false },
    year_completed: { type: DataTypes.SMALLINT },
    client_name: { type: DataTypes.STRING(100) },
    cover_url: { type: DataTypes.TEXT },
    cover_id: { type: DataTypes.STRING(255) },
    sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
    views: { type: DataTypes.INTEGER, defaultValue: 0 },
    meta_title: { type: DataTypes.STRING(70) },
    meta_desc: { type: DataTypes.STRING(160) },
  },
  { tableName: 'projects' }
)

const ProjectImage = sequelize.define(
  'ProjectImage',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    project_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'projects', key: 'id' },
    },
    url: { type: DataTypes.TEXT, allowNull: false },
    public_id: { type: DataTypes.STRING(255), allowNull: false },
    alt_text: { type: DataTypes.STRING(200) },
    caption: { type: DataTypes.STRING(500) },
    sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
    width: { type: DataTypes.SMALLINT },
    height: { type: DataTypes.SMALLINT },
  },
  { tableName: 'project_images' }
)

const Service = sequelize.define(
  'Service',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(150), allowNull: false },
    slug: { type: DataTypes.STRING(170), unique: true },
    description: { type: DataTypes.TEXT },
    icon: { type: DataTypes.STRING(100) },
    icon_url: { type: DataTypes.TEXT },
    icon_id: { type: DataTypes.STRING(255) },
    features: { type: DataTypes.JSON },
    price_from: { type: DataTypes.DECIMAL(15, 0) },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { tableName: 'services' }
)

const BlogPost = sequelize.define(
  'BlogPost',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    title: { type: DataTypes.STRING(250), allowNull: false },
    slug: { type: DataTypes.STRING(270), unique: true, allowNull: false },
    excerpt: { type: DataTypes.TEXT },
    content: { type: DataTypes.TEXT('long') },
    category: {
      type: DataTypes.ENUM('trends', 'aesthetics', 'material', 'tips', 'news'),
      defaultValue: 'tips',
    },
    status: {
      type: DataTypes.ENUM('draft', 'published', 'archived'),
      defaultValue: 'draft',
    },
    cover_url: { type: DataTypes.TEXT },
    cover_id: { type: DataTypes.STRING(255) },
    author_id: { type: DataTypes.INTEGER, references: { model: 'users', key: 'id' } },
    tags: { type: DataTypes.JSON },
    views: { type: DataTypes.INTEGER, defaultValue: 0 },
    read_time: { type: DataTypes.TINYINT },
    published_at: { type: DataTypes.DATE },
    meta_title: { type: DataTypes.STRING(70) },
    meta_desc: { type: DataTypes.STRING(160) },
  },
  { tableName: 'blog_posts' }
)

const Testimonial = sequelize.define(
  'Testimonial',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    client_name: { type: DataTypes.STRING(100), allowNull: false },
    client_title: { type: DataTypes.STRING(150) },
    content: { type: DataTypes.TEXT, allowNull: false },
    rating: { type: DataTypes.TINYINT, defaultValue: 5 },
    avatar_url: { type: DataTypes.TEXT },
    avatar_id: { type: DataTypes.STRING(255) },
    project_id: { type: DataTypes.INTEGER, references: { model: 'projects', key: 'id' } },
    is_featured: { type: DataTypes.BOOLEAN, defaultValue: false },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { tableName: 'testimonials' }
)

const TeamMember = sequelize.define(
  'TeamMember',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    role: { type: DataTypes.STRING(100) },
    bio: { type: DataTypes.TEXT },
    avatar_url: { type: DataTypes.TEXT },
    avatar_id: { type: DataTypes.STRING(255) },
    instagram: { type: DataTypes.STRING(100) },
    linkedin: { type: DataTypes.STRING(200) },
    is_active: { type: DataTypes.BOOLEAN, defaultValue: true },
    sort_order: { type: DataTypes.INTEGER, defaultValue: 0 },
  },
  { tableName: 'team_members' }
)

const ConsultationRequest = sequelize.define(
  'ConsultationRequest',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    name: { type: DataTypes.STRING(100), allowNull: false },
    email: { type: DataTypes.STRING(150), allowNull: false },
    phone: { type: DataTypes.STRING(20) },
    message: { type: DataTypes.TEXT },
    service_type: { type: DataTypes.STRING(100) },
    budget_range: { type: DataTypes.STRING(50) },
    location: { type: DataTypes.STRING(100) },
    area_sqm: { type: DataTypes.DECIMAL(8, 2) },
    status: {
      type: DataTypes.ENUM('new', 'contacted', 'in_progress', 'converted', 'closed'),
      defaultValue: 'new',
    },
    notes: { type: DataTypes.TEXT },
    source: { type: DataTypes.STRING(50) },
  },
  { tableName: 'consultation_requests' }
)

const SiteSetting = sequelize.define(
  'SiteSetting',
  {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    key: { type: DataTypes.STRING(100), allowNull: false, unique: true },
    value: { type: DataTypes.TEXT },
    type: {
      type: DataTypes.ENUM('text', 'number', 'boolean', 'json', 'image'),
      defaultValue: 'text',
    },
    label: { type: DataTypes.STRING(200) },
    group: { type: DataTypes.STRING(50) },
  },
  { tableName: 'site_settings', updatedAt: 'updated_at', createdAt: false }
)

Project.hasMany(ProjectImage, { foreignKey: 'project_id', as: 'images', onDelete: 'CASCADE' })
ProjectImage.belongsTo(Project, { foreignKey: 'project_id', as: 'project' })

Project.hasMany(Testimonial, { foreignKey: 'project_id', as: 'testimonials' })
Testimonial.belongsTo(Project, { foreignKey: 'project_id', as: 'project' })

User.hasMany(BlogPost, { foreignKey: 'author_id', as: 'posts' })
BlogPost.belongsTo(User, { foreignKey: 'author_id', as: 'author' })

module.exports = {
  sequelize,
  User,
  Project,
  ProjectImage,
  Service,
  BlogPost,
  Testimonial,
  TeamMember,
  ConsultationRequest,
  SiteSetting,
}
