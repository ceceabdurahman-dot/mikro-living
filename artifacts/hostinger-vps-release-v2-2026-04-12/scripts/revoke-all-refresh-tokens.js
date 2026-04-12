require('../src/config/loadEnv').loadEnv()

const { Op } = require('sequelize')
const { sequelize } = require('../src/config/database')
const { User } = require('../src/models')
const logger = require('../src/utils/logger')

const isDryRun = process.argv.includes('--dry-run')

const tokenPresentWhere = {
  [Op.or]: [
    { refresh_token: { [Op.not]: null } },
    { refresh_token: { [Op.ne]: '' } },
  ],
}

const revokeAllRefreshTokens = async () => {
  const affectedBeforeUpdate = await User.count({ where: tokenPresentWhere })

  if (isDryRun) {
    logger.info(`[dry-run] ${affectedBeforeUpdate} user(s) masih memiliki refresh token aktif.`)
    return affectedBeforeUpdate
  }

  await User.update({ refresh_token: null }, { where: tokenPresentWhere })
  logger.info(`Refresh token berhasil dicabut untuk ${affectedBeforeUpdate} user(s).`)
  return affectedBeforeUpdate
}

if (require.main === module) {
  revokeAllRefreshTokens()
    .then(async () => {
      await sequelize.close()
      process.exit(0)
    })
    .catch(async (error) => {
      logger.error(`Gagal mencabut refresh token: ${error.message}`)
      await sequelize.close().catch(() => {})
      process.exit(1)
    })
}

module.exports = { revokeAllRefreshTokens }
