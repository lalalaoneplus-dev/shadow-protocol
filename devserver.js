// Dev-only static server for browser verification (NOT packaged into the app).
const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };
const PORT = process.env.PORT || 4173;
http.createServer((req, res) => {
  // dev-only capture sink: POST a dataURL body, saved as a PNG/JPG under /screens
  if (req.method === 'POST' && req.url.startsWith('/__capture')) {
    const name = (new URL(req.url, 'http://x').searchParams.get('name') || 'frame') .replace(/[^a-z0-9_-]/gi, '');
    let body = '';
    req.on('data', c => body += c);
    req.on('end', () => {
      try {
        const m = body.match(/^data:image\/(png|jpeg);base64,(.*)$/);
        const ext = m[1] === 'jpeg' ? 'jpg' : 'png';
        const dir = path.join(ROOT, 'screens'); fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, name + '.' + ext), Buffer.from(m[2], 'base64'));
        res.writeHead(200); res.end('ok');
      } catch (e) { res.writeHead(400); res.end(String(e)); }
    });
    return;
  }
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p === '/') p = '/index.html';
  const file = path.normalize(path.join(ROOT, p));
  if (!file.startsWith(ROOT) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) {
    res.writeHead(404); res.end('not found'); return;
  }
  res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
  fs.createReadStream(file).pipe(res);
}).listen(PORT, () => console.log('dev server on http://localhost:' + PORT));
