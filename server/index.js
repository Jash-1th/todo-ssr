import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { InMemoryTodoStorage } from './storage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const resolve = (p) => path.resolve(__dirname, '..', p);

const isProd = process.env.NODE_ENV === 'production';

async function createServer() {
  const app = express();

  // Simple in-memory storage for todos on server
  const storage = new InMemoryTodoStorage([
    { id: 1, text: 'Learn React SSR', completed: false },
    { id: 2, text: 'Build todo app', completed: true }
  ]);

  // API to get initial data (used for CSR navigation or future needs)
  app.get('/api/todos', (req, res) => {
    res.json(storage.getAll());
  });

  let vite;
  if (!isProd) {
    const vitePackage = await import('vite');
    vite = await vitePackage.createServer({
      root: resolve('.'),
      server: { middlewareMode: true },
      appType: 'custom'
    });
    app.use(vite.middlewares);
  } else {
    app.use('/assets', express.static(resolve('dist/client/assets')));
    app.use(express.static(resolve('dist/client')));
  }

  app.use('*', async (req, res, next) => {
    try {
      const url = req.originalUrl;

      let template, render;
      if (!isProd) {
        // Always read fresh in dev
        template = fs.readFileSync(resolve('index.html'), 'utf-8');
        template = await vite.transformIndexHtml(url, template);
        render = (await vite.ssrLoadModule('/src/entry-server.jsx')).render;
      } else {
        template = fs.readFileSync(resolve('dist/client/index.html'), 'utf-8');
        const mod = await import('file://' + resolve('dist/server/entry-server.js'));
        render = mod.render;
      }

      const initialData = { todos: storage.getAll() };
      const appHtml = await render(url, initialData);

      const html = template
        .replace('<!--ssr-outlet-->', appHtml)
        .replace(
          '</body>',
          `<script>window.__INITIAL_DATA__=${JSON.stringify(initialData)}</script></body>`
        );

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    } catch (e) {
      !isProd && vite && vite.ssrFixStacktrace(e);
      next(e);
    }
  });

  const port = process.env.PORT || 5173;
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}

createServer();


