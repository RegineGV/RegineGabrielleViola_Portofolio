import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

// Normalize the root so resolve() results compare correctly (without a trailing slash).
const root = resolve(fileURLToPath(new URL('.', import.meta.url)));
const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
};

const server = createServer((request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end('Method not allowed');
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end('Bad request');
    return;
  }

  const requestedPath = resolve(root, `.${pathname}`);
  if (requestedPath !== root && !requestedPath.startsWith(root + sep)) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  let filePath = requestedPath;
  try {
    if (statSync(filePath).isDirectory()) filePath = resolve(filePath, 'index.html');
    const fileInfo = statSync(filePath);
    if (!fileInfo.isFile()) throw new Error('Not a file');

    response.writeHead(200, {
      'Content-Type': mimeTypes[extname(filePath).toLowerCase()] ?? 'application/octet-stream',
      'Content-Length': fileInfo.size,
      'X-Content-Type-Options': 'nosniff',
    });
    if (request.method === 'HEAD') response.end();
    else createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
  }
});

const port = Number(process.env.PORT ?? 8000);
server.listen(port, () => {
  console.log(`Portfolio ready at http://localhost:${port}`);
});
