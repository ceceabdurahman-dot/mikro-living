const { spawn } = require('child_process')
const fs = require('fs')
const os = require('os')
const path = require('path')

const chromePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe'
const debugPort = 9223
const userDataDir = path.join(os.tmpdir(), 'mikroliving-cdp-' + Date.now())
const startUrl = 'http://127.0.0.1:3001/login'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function waitForJson(url, timeoutMs = 15000) {
  const start = Date.now()
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url)
      if (response.ok) return response.json()
    } catch {}
    await delay(250)
  }
  throw new Error('Timed out waiting for ' + url)
}

async function main() {
  require('../src/config/loadEnv').loadEnv()
  const email = process.env.ADMIN_EMAIL
  const password = process.env.ADMIN_PASSWORD
  if (!email || !password) {
    throw new Error('ADMIN_EMAIL / ADMIN_PASSWORD tidak tersedia di env lokal.')
  }

  fs.mkdirSync(userDataDir, { recursive: true })
  const chrome = spawn(chromePath, [
    '--headless=new',
    '--disable-gpu',
    '--no-first-run',
    '--no-default-browser-check',
    '--remote-debugging-port=' + debugPort,
    '--user-data-dir=' + userDataDir,
    startUrl,
  ], {
    stdio: 'ignore',
    detached: false,
  })

  const cleanup = () => {
    try { chrome.kill() } catch {}
    try { fs.rmSync(userDataDir, { recursive: true, force: true }) } catch {}
  }

  try {
    await waitForJson(`http://127.0.0.1:${debugPort}/json/version`)
    const targets = await waitForJson(`http://127.0.0.1:${debugPort}/json/list`)
    const pageTarget = targets.find((target) => target.type === 'page')
    if (!pageTarget?.webSocketDebuggerUrl) {
      throw new Error('Tidak menemukan target page dari Chrome headless.')
    }

    const ws = new WebSocket(pageTarget.webSocketDebuggerUrl)
    let id = 0
    const pending = new Map()
    ws.addEventListener('message', (event) => {
      const message = JSON.parse(event.data)
      if (message.id && pending.has(message.id)) {
        const { resolve, reject } = pending.get(message.id)
        pending.delete(message.id)
        if (message.error) reject(new Error(message.error.message))
        else resolve(message.result)
      }
    })

    await new Promise((resolve, reject) => {
      ws.addEventListener('open', resolve, { once: true })
      ws.addEventListener('error', reject, { once: true })
    })

    const send = (method, params = {}) => {
      const messageId = ++id
      ws.send(JSON.stringify({ id: messageId, method, params }))
      return new Promise((resolve, reject) => {
        pending.set(messageId, { resolve, reject })
      })
    }

    await send('Page.enable')
    await send('Runtime.enable')
    await send('DOM.enable')
    await delay(1400)

    const initial = await send('Runtime.evaluate', {
      expression: `JSON.stringify({
        title: document.title,
        pathname: location.pathname,
        hasEmail: Boolean(document.querySelector('input[type="email"]')),
        hasPassword: Boolean(document.querySelector('input[type="password"]')),
        buttonText: document.querySelector('button[type="submit"]')?.textContent?.trim() || null
      })`,
      returnByValue: true,
    })

    await send('Runtime.evaluate', {
      expression: `(() => {
        const emailInput = document.querySelector('input[type="email"]')
        const passwordInput = document.querySelector('input[type="password"]')
        if (!emailInput || !passwordInput) return 'missing-inputs'
        emailInput.focus()
        emailInput.value = ${JSON.stringify(email)}
        emailInput.dispatchEvent(new Event('input', { bubbles: true }))
        passwordInput.focus()
        passwordInput.value = ${JSON.stringify(password)}
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }))
        const submitButton = document.querySelector('button[type="submit"]')
        submitButton?.click()
        return 'submitted'
      })()`,
      returnByValue: true,
      awaitPromise: true,
    })

    await delay(5000)

    const afterLogin = await send('Runtime.evaluate', {
      expression: `JSON.stringify({
        title: document.title,
        pathname: location.pathname,
        href: location.href,
        hasHomepageSettings: document.body.innerText.includes('Homepage settings'),
        hasCmsText: document.body.innerText.includes('CMS') || document.body.innerText.includes('Dashboard'),
        visibleError: Array.from(document.querySelectorAll('*')).map((node) => node.textContent || '').find((text) => text.includes('Login gagal') || text.includes('Email atau password salah') || text.includes('Sesi Anda berakhir')) || null,
        bodyPreview: document.body.innerText.slice(0, 400)
      })`,
      returnByValue: true,
    })

    console.log(JSON.stringify({
      initial: JSON.parse(initial.result.value),
      afterLogin: JSON.parse(afterLogin.result.value)
    }, null, 2))

    ws.close()
  } finally {
    cleanup()
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ error: error.message }, null, 2))
  process.exit(1)
})
