import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import viteCompression from 'vite-plugin-compression';
import { generateSeoHtml } from './seo-plugin.js';
import generateCarousel from './api/generateCarousel.js';

function localRoutes() {
  const rewriteStart = (req, _res, next) => {
    const [pathname, query = ''] = req.url.split('?');
    if (pathname === '/start' || pathname === '/start/') {
      req.url = '/start/index.html' + (query ? '?' + query : '');
    }
    next();
  };
  return {
    name: 'local-routes',
    configurePreviewServer(server) { server.middlewares.use(rewriteStart); },
    configureServer(server) {
      server.middlewares.use(rewriteStart);
      server.middlewares.use('/api/generateCarousel', async (req, res) => {
        res.status = code => { res.statusCode = code; return res; };
        res.json = data => {
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify(data));
          return res;
        };
        try {
          let body = '';
          for await (const chunk of req) {
            body += chunk;
            if (Buffer.byteLength(body) > 16384) return res.status(413).json({ error: 'Request too large' });
          }
          try { req.body = body ? JSON.parse(body) : {}; }
          catch { return res.status(400).json({ error: 'Invalid JSON body' }); }
          await generateCarousel(req, res);
        } catch {
          if (!res.writableEnded) res.status(500).json({ error: 'Generation failed. Please try again.' });
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // These keys stay server-side; only VITE_ variables enter the client bundle.
  const env = loadEnv(mode, process.cwd(), '');
  for (const key of ['GROQ_API_KEY', 'GEMINI_API_KEY', 'GEMINI_API_KEY_2', 'GEMINI_MODEL']) {
    if (!process.env[key] && env[key]) process.env[key] = env[key];
  }
  return {
    plugins: [localRoutes(), react(), viteCompression(), generateSeoHtml()],
    server: {
      proxy: {
        '/sanity-cdn': {
          target: 'https://cdn.sanity.io', changeOrigin: true,
          rewrite: path => path.replace(/^\/sanity-cdn/, ''),
        },
      },
    },
  };
});
