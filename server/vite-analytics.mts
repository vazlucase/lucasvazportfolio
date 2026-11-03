import type { Plugin, Connect } from 'vite';
import { loadEnv } from 'vite';
import { resolve } from 'node:path';
import { createAnalyticsHandler } from './analytics-handler.mjs';

export function analyticsPlugin(): Plugin {
  let middleware: Connect.NextHandleFunction;
  return {
    name: 'portfolio-analytics',
    configResolved(config) {
      const handler = createAnalyticsHandler({ local: true, directory: resolve(config.root, '.analytics-data'),
        env: { ...loadEnv(config.mode, config.envDir, ''), ...process.env } });
      middleware = async (req, res, next) => {
        if (!req.url?.startsWith('/api/analytics/')) return next();
        const host = req.headers.host ?? '';
        const address = req.socket.remoteAddress ?? '';
        if (!/^(localhost|127\.0\.0\.1|\[::1\])(:\d+)?$/.test(host) || !['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(address)) {
          res.statusCode = 403; res.end('O painel local aceita somente conexões deste computador.'); return;
        }
        try {
          const chunks: Buffer[] = []; let size = 0;
          for await (const chunk of req) {
            size += chunk.length;
            if (size > 65536) { res.statusCode = 413; res.end('Envio muito grande.'); return; }
            chunks.push(Buffer.from(chunk));
          }
          const headers = new Headers();
          for (const [key, value] of Object.entries(req.headers)) if (value) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
          headers.delete('x-forwarded-for');
          const request = new Request(`http://${host}${req.url}`, { method: req.method, headers,
            body: ['GET', 'HEAD'].includes(req.method ?? 'GET') ? undefined : Buffer.concat(chunks) });
          const response = await handler(request);
          res.statusCode = response.status;
          response.headers.forEach((value: string, key: string) => res.setHeader(key, value));
          res.end(Buffer.from(await response.arrayBuffer()));
        } catch { res.statusCode = 500; res.end('Não foi possível atender à solicitação.'); }
      };
    },
    configureServer(server) { server.middlewares.use((req, res, next) => middleware(req, res, next)); },
    configurePreviewServer(server) { server.middlewares.use((req, res, next) => middleware(req, res, next)); },
  };
}
