const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = 3000;
const MIME = {
  '.html': 'text/html',
  '.js'  : 'application/javascript',
  '.css' : 'text/css',
  '.png' : 'image/png',
  '.jpg' : 'image/jpeg',
};

http.createServer((req, res) => {
  const url      = new URL(req.url, `http://localhost:${PORT}`);
  const safe     = url.pathname === '/' ? 'index.html' : url.pathname.replace(/^\//, '');
  const filePath = path.join(__dirname, safe);

  if (!filePath.startsWith(__dirname)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(filePath)] || 'text/plain' });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log('\n✒️  HandScript is running!');
  console.log(`\n   Open → http://localhost:${PORT}\n`);
  console.log('   No API key needed. Works completely offline.\n');
});
