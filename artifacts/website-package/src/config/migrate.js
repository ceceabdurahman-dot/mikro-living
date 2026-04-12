require('dotenv').config()

const { sequelize } = require('./database')
const logger = require('../utils/logger')

require('../models')

const runMigrations = async () => {
  logger.info('Starting database migration...')
  await sequelize.sync({ alter: true })
  logger.info('All tables created or updated successfully')
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error(`Migration failed: ${error.message}`)
      process.exit(1)
    })
}

module.exports = { runMigrations }
