module.exports = {
  apps: [
    {
      name: 'mikroliving-id-web',
      cwd: __dirname,
      script: 'scripts/start-web.js',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      autorestart: true,
      max_memory_restart: '512M',
      min_uptime: '10s',
      restart_delay: 3000,
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
        HOSTNAME: '0.0.0.0',
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: '3000',
        HOSTNAME: '0.0.0.0',
        NEXT_PUBLIC_SITE_URL: 'https://mikroliving.id',
        NEXT_PUBLIC_API_URL: 'https://mikroliving.id/api/v1',
        API_URL: 'https://api.mikroliving.id/api/v1',
        API_PROXY_TARGET: '',
      },
    },
  ],
}
