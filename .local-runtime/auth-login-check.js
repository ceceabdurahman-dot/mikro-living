require('./src/config/loadEnv').loadEnv();
(async () => {
  const base = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1';
  const site = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'http://127.0.0.1:3001';
  const response = await fetch(base + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: site },
    body: JSON.stringify({ email: process.env.ADMIN_EMAIL, password: process.env.ADMIN_PASSWORD })
  });
  const payload = await response.json().catch(() => ({}));
  const cookies = (typeof response.headers.getSetCookie === 'function' ? response.headers.getSetCookie() : [response.headers.get('set-cookie')].filter(Boolean))
    .map((entry) => entry.split(';')[0]);
  console.log(JSON.stringify({ status: response.status, success: payload.success === true, cookies }, null, 2));
})().catch((error) => { console.error(JSON.stringify({ error: error.message }, null, 2)); process.exit(1); });
