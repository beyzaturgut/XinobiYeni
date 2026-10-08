// Local test-only static export server with a narrow read proxy. No inference routes.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
const root = path.resolve('out');
const apiPort = process.env.PRODUCT_SURFACES_TEST_API_PORT || '5023';
const webPort = process.env.PRODUCT_SURFACES_TEST_WEB_PORT || '3010';
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.woff2': 'font/woff2', '.ico': 'image/x-icon' };
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, 'http://127.0.0.1:3010');
    if (req.method !== 'GET') { res.writeHead(405).end(); return; }
    if (url.pathname === '/api/v1/local-commerce/state' || /^\/api\/v1\/dev\/product-surfaces\/(?:commerce\/)?[a-zA-Z0-9-]+\/[a-zA-Z0-9-]+\/rendering-inputs$/.test(url.pathname)) {
      const response = await fetch(`http://127.0.0.1:${apiPort}` + url.pathname);
      res.writeHead(response.status, { 'Content-Type': response.headers.get('content-type') || 'application/json', 'Cache-Control': 'no-store' });
      res.end(Buffer.from(await response.arrayBuffer())); return;
    }
    let file = path.resolve(root, '.' + decodeURIComponent(url.pathname));
    if (file !== root && !file.startsWith(root + path.sep)) { res.writeHead(404).end(); return; }
    if (url.pathname.endsWith('/')) file = path.join(file, 'index.html');
    else if (!path.extname(file)) file = path.join(file, 'index.html');
    const bytes = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }); res.end(bytes);
  } catch { res.writeHead(404).end(); }
}).listen(Number(webPort), '127.0.0.1');
