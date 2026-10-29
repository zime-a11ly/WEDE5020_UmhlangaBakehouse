/* Optional local/Node host: serves the website and submits validated enquiries.
   Static hosting also works; sending is enabled only with configured email delivery. */
import http from 'node:http';
import path from 'node:path';
import {readFile, stat} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {fileURLToPath, pathToFileURL} from 'node:url';

const require = createRequire(import.meta.url);
const rules = require('./js/validation.js');
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PAGES = new Set(['index.html', 'about.html', 'products.html', 'gallery.html', 'contact.html', 'enquiry.html', 'cart.html', 'privacy.html', 'robots.txt', 'sitemap.xml']);
const MIME = {'.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.webp': 'image/webp', '.png': 'image/png', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8'};

function json(res, status, data) {
  res.writeHead(status, {'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store'});
  res.end(JSON.stringify(data));
}
async function parseBody(req) {
  if (!(req.headers['content-type'] || '').startsWith('application/json')) throw Object.assign(new Error('Use JSON.'), {status: 415});
  const chunks = []; let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 20000) throw Object.assign(new Error('Request is too large.'), {status: 413});
    chunks.push(chunk);
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}
export function createServer({root = ROOT, env = process.env, fetchImpl = globalThis.fetch, rateLimit = 8} = {}) {
  const rates = new Map();
  const emailReady = Boolean(env.RESEND_API_KEY && env.CONTACT_EMAIL && env.MAIL_FROM);
  return http.createServer(async (req, res) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
    catch { return json(res, 400, {ok: false, message: 'Invalid URL.'}); }
    try {
      if (pathname === '/api/health' && req.method === 'GET') return json(res, 200, {service: 'umhlanga-bakehouse', emailReady});
      if (['/api/contact', '/api/enquiry'].includes(pathname)) {
        if (req.method !== 'POST') { res.setHeader('Allow', 'POST'); return json(res, 405, {ok: false, message: 'Use POST.'}); }
        if (req.headers.origin) {
          let origin;
          try { origin = new URL(req.headers.origin); } catch { return json(res, 403, {ok: false, message: 'Invalid origin.'}); }
          const allowed = origin.host === req.headers.host || (env.SITE_ORIGIN && origin.origin === env.SITE_ORIGIN);
          if (!allowed) return json(res, 403, {ok: false, message: 'Cross-origin requests are not accepted.'});
        }
        const now = Date.now(), ip = req.socket.remoteAddress || 'local';
        for (const [key, value] of rates) if (now - value.start > 60000) rates.delete(key);
        const rate = rates.get(ip) || {start: now, count: 0};
        rates.set(ip, rate);
        if (++rate.count > rateLimit) { res.setHeader('Retry-After', '60'); return json(res, 429, {ok: false, message: 'Please wait a minute before trying again.'}); }
        const body = await parseBody(req);
        const kind = pathname.slice('/api/'.length);
        const {data, errors} = rules.validate(body, kind);
        if (Object.keys(errors).length) return json(res, 422, {ok: false, message: 'Check the form fields.', errors});
        if (!emailReady) return json(res, 503, {ok: false, message: 'Email delivery is not configured. Download your summary or use an available email draft.'});
        const idempotencyKey = createHash('sha256').update(`${kind}:${data.requestId}`).digest('hex');
        const controller = new AbortController(), timeout = setTimeout(() => controller.abort(), 10000);
        let response;
        try {
          response = await fetchImpl('https://api.resend.com/emails', {
            method: 'POST', signal: controller.signal,
            headers: {Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json', 'Idempotency-Key': `bakehouse-${idempotencyKey}`},
            body: JSON.stringify({
              from: env.MAIL_FROM, to: [env.CONTACT_EMAIL], reply_to: data.email,
              subject: kind === 'enquiry' ? 'New bakery enquiry — Umhlanga Bakehouse' : `${data.subject} — Umhlanga Bakehouse`,
              text: rules.summary(data, kind)
            })
          });
        } finally { clearTimeout(timeout); }
        const delivery = await response.json();
        if (!response.ok || typeof delivery.id !== 'string' || !delivery.id) return json(res, 502, {ok: false, message: 'The email service did not confirm delivery. Please keep your summary and try again.'});
        return json(res, 200, {ok: true, reference: `UB-${idempotencyKey.slice(0, 10).toUpperCase()}`, message: 'Accepted by the email service.', estimate: kind === 'enquiry' && data.items.length ? rules.estimate(data) : null});
      }
      if (!['GET', 'HEAD'].includes(req.method)) { res.setHeader('Allow', 'GET, HEAD'); return json(res, 405, {ok: false, message: 'Method not allowed.'}); }
      const relative = pathname === '/' ? 'index.html' : pathname.slice(1);
      const permitted = PAGES.has(relative) || (env.NODE_ENV !== 'production' && relative === 'tests/responsive.html') || /^(?:css|js)\/[a-z0-9-]+\.(?:css|js)$/.test(relative) || /^assets\/(?:images|fonts)\/[a-z0-9-]+\.(?:png|webp|woff2|ttf)$/.test(relative);
      if (!permitted) return json(res, 404, {ok: false, message: 'Page not found.'});
      const file = path.resolve(root, relative);
      if (!file.startsWith(path.resolve(root) + path.sep)) return json(res, 404, {ok: false, message: 'Page not found.'});
      const info = await stat(file);
      if (!info.isFile()) return json(res, 404, {ok: false, message: 'Page not found.'});
      const content = await readFile(file);
      res.writeHead(200, {'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Content-Length': content.length, 'Cache-Control': 'no-cache'});
      res.end(req.method === 'HEAD' ? undefined : content);
    } catch (error) {
      if (res.headersSent) { res.end(); return; }
      const status = error.status || (error instanceof SyntaxError ? 400 : error.code === 'ENOENT' ? 404 : 500);
      json(res, status, {ok: false, message: status === 404 ? 'Page not found.' : status === 400 ? 'Invalid request data.' : status === 413 ? 'Request is too large.' : 'Your request could not be completed. Please try again.'});
    }
  });
}
if (process.argv[1] && pathToFileURL(path.resolve(process.argv[1])).href === import.meta.url) {
  const portIndex = process.argv.indexOf('--port');
  const port = Number(process.env.PORT || (portIndex >= 0 ? process.argv[portIndex + 1] : 3000));
  createServer().listen(port, '0.0.0.0', () => console.log(`Umhlanga Bakehouse is ready at http://localhost:${port}`));
}
