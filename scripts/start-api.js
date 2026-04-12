require('../src/config/loadEnv').loadEnv()

const { waitForDatabase } = require('./wait-for-db')
const { runMigrations } = require('../src/config/migrate')
const logger = require('../src/utils/logger')

const shouldRunMigrations = process.env.AUTO_RUN_MIGRATIONS !== 'false'

const bootstrap = async () => {
  await waitForDatabase()

  if (shouldRunMigrations) {
    await runMigrations()
  } else {
    logger.info('Skipping automatic migrations because AUTO_RUN_MIGRATIONS=false')
  }

  require('../src/index')
}

bootstrap().catch((error) => {
  logger.error(`API bootstrap failed: ${error.message}`)
  process.exit(1)
})
