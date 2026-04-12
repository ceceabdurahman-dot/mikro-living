module.exports = {
  apps: [
    {
      name: 'mikroliving-api',
      cwd: __dirname,
      script: 'scripts/start-api.js',
      exec_mode: 'fork',
      instances: 1,
      watch: false,
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
      },
    },
    {
      name: 'mikroliving-web',
      cwd: __dirname,
      script: 'node_modules/next/dist/bin/next',
      args: 'start -H 127.0.0.1 -p 3000',
      exec_mode: 'fork',
      instances: 1,
      watch: false,
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
}
