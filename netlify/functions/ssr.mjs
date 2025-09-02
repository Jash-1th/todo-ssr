import fs from 'fs';
import path from 'path';
import serialize from 'serialize-javascript';

// Netlify bundles functions (often to CJS). Avoid import.meta.url; base paths on the task root.
const taskRoot = process.env.LAMBDA_TASK_ROOT || process.cwd();
const projectRoot = path.resolve(taskRoot);
const clientIndex = path.join(projectRoot, 'dist', 'client', 'index.html');
const serverEntry = path.join(projectRoot, 'dist', 'server', 'entry-server.js');

export async function handler(event) {
  try {
    const url = event.rawUrl || event.headers['x-nf-original-host'] || '/';
    const template = fs.readFileSync(clientIndex, 'utf-8');
    // Load ESM SSR bundle even when this function is bundled to CJS
    const serverCode = fs.readFileSync(serverEntry, 'utf-8');
    const dataUrl = 'data:text/javascript;charset=utf-8,' + encodeURIComponent(serverCode);
    const { render } = await import(dataUrl);

    // Simple initial data (mirror server storage logic); replace with real data sources as needed
    const initialData = {
      todos: [
        { id: 1, text: 'Learn React SSR', completed: false },
        { id: 2, text: 'Build todo app', completed: true }
      ]
    };
    const appHtml = await render(url, initialData);
    const html = template
      .replace('<!--ssr-outlet-->', appHtml)
      .replace(
        '</body>',
        `<script>window.__INITIAL_DATA__=${serialize(initialData, { isJSON: true })}</script></body>`
      );

    return {
      statusCode: 200,
      headers: {
        'content-type': 'text/html',
        'cache-control': 'no-store'
      },
      body: html
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: 'Internal Server Error: ' + e.message
    };
  }
}


