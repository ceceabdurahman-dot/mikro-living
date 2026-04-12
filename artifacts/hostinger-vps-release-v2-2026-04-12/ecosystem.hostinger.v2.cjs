module.exports = {
  apps: [
    {
      name: 'mikro-living-v2-api',
      cwd: __dirname,
      script: 'scripts/start-api.js',
      exec_mode: 'fork',
      instances: 1,
      watch: false,
      env: {
        NODE_ENV: 'production',
        APP_NAME: 'mikro-living-v2',
        PORT: 5200,
      },
    },
    {
      name: 'mikro-living-v2-web',
      cwd: __dirname,
      script: 'node_modules/next/dist/bin/next',
      args: 'start -H 127.0.0.1 -p 3200',
      exec_mode: 'fork',
      instances: 1,
      watch: false,
      env: {
        NODE_ENV: 'production',
        APP_NAME: 'mikro-living-v2',
      },
    },
  ],
}
