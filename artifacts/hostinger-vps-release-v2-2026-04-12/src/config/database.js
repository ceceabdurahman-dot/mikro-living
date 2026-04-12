const { Sequelize } = require('sequelize')
const logger = require('../utils/logger')

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    dialect: 'mysql',
    logging: (message) => {
      if (process.env.NODE_ENV === 'development') {
        logger.debug(message)
      }
    },
    pool: {
      max: parseInt(process.env.DB_POOL_MAX, 10) || 10,
      min: parseInt(process.env.DB_POOL_MIN, 10) || 2,
      acquire: 30000,
      idle: 10000,
    },
    define: {
      timestamps: true,
      underscored: true,
      freezeTableName: false,
    },
    timezone: '+07:00',
  }
)

const connectDB = async () => {
  try {
    await sequelize.authenticate()
    logger.info('MySQL database connected successfully')
  } catch (error) {
    logger.error(`Database connection failed: ${error.message}`)
    process.exit(1)
  }
}

module.exports = { sequelize, connectDB }
