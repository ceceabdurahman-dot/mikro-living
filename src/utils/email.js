const nodemailer = require('nodemailer')
const logger = require('./logger')

let transporterPromise = null

const isPlaceholderValue = (value = '') => /your_|change_me|example/i.test(String(value).trim())

const hasMailConfig = () =>
  Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      !isPlaceholderValue(process.env.SMTP_PASS) &&
      !isPlaceholderValue(process.env.SMTP_USER)
  )

const createTransporter = async () => {
  if (!hasMailConfig()) return null

  if (!transporterPromise) {
    transporterPromise = Promise.resolve(
      nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: Number(process.env.SMTP_PORT || 587),
        secure:
          process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT || 587) === 465,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS,
        },
      })
    )
  }

  return transporterPromise
}

const sendMail = async ({ to, subject, text, html }) => {
  const transporter = await createTransporter()

  if (!transporter) {
    logger.warn(`SMTP not configured. Skipping email delivery for ${to}.`)
    return { delivered: false, skipped: true }
  }

  const info = await transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER,
    to,
    subject,
    text,
    html,
  })

  logger.info(`Email sent to ${to}: ${info.messageId}`)
  return { delivered: true, messageId: info.messageId }
}

module.exports = {
  hasMailConfig,
  sendMail,
}
