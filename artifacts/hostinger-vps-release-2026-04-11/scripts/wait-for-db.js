require('../src/config/loadEnv').loadEnv()

const { sequelize } = require('../src/config/database')
const logger = require('../src/utils/logger')

const waitMs = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const MAX_RETRIES = parseInt(process.env.DB_WAIT_MAX_RETRIES || '30', 10)
const RETRY_DELAY_MS = parseInt(process.env.DB_WAIT_RETRY_DELAY_MS || '2000', 10)

const waitForDatabase = async () => {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      await sequelize.authenticate()
      logger.info(`Database is ready after ${attempt} attempt${attempt === 1 ? '' : 's'}`)
      return
    } catch (error) {
      const retriesLeft = MAX_RETRIES - attempt
      logger.warn(
        `Database not ready yet (${attempt}/${MAX_RETRIES}): ${error.message}${
          retriesLeft > 0 ? `. Retrying in ${RETRY_DELAY_MS}ms...` : ''
        }`
      )

      if (retriesLeft === 0) {
        throw new Error('Database did not become ready in time')
      }

      await waitMs(RETRY_DELAY_MS)
    }
  }
}

if (require.main === module) {
  waitForDatabase()
    .then(() => process.exit(0))
    .catch((error) => {
      logger.error(error.message)
      process.exit(1)
    })
}

module.exports = { waitForDatabase }
