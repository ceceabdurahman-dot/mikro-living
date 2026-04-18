const { spawn } = require('child_process')
const path = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'
const child = spawn(path, ['--headless=new','--disable-gpu','--no-first-run','--no-default-browser-check','--remote-debugging-address=127.0.0.1','--remote-debugging-port=9225','--user-data-dir=' + require('path').join(require('os').tmpdir(),'mikroliving-edge-cdp-debug-' + Date.now()), 'about:blank'], { stdio: ['ignore','pipe','pipe'] })
child.stdout.on('data', (d) => process.stdout.write(String(d)))
child.stderr.on('data', (d) => process.stdout.write(String(d)))
setTimeout(() => {
  console.log('PID=' + child.pid)
  try { process.kill(child.pid) } catch {}
}, 5000)
child.on('exit', (code, signal) => console.log('EXIT=' + code + ' SIGNAL=' + signal))
