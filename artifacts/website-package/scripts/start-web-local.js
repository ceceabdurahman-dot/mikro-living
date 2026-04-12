process.env.PORT = process.env.PORT || '3001'
process.env.HOSTNAME = process.env.HOSTNAME || '127.0.0.1'
process.env.NODE_ENV = process.env.NODE_ENV || 'production'

process.argv = [
  process.execPath,
  'next',
  'start',
  '-p',
  process.env.PORT,
  '-H',
  process.env.HOSTNAME,
]

require('next/dist/bin/next')
