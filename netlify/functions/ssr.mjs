import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..', '..');
const clientIndex = path.join(projectRoot, 'dist', 'client', 'index.html');
const serverEntry = path.join(projectRoot, 'dist', 'server', 'entry-server.js');

export async function handler(event) {
  try {
    const url = event.rawUrl || event.headers['x-nf-original-host'] || '/';
    const template = fs.readFileSync(clientIndex, 'utf-8');
    const { render } = await import('file://' + serverEntry);

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
        `<script>window.__INITIAL_DATA__=${JSON.stringify(initialData)}</script></body>`
      );

    return {
      statusCode: 200,
      headers: { 'content-type': 'text/html' },
      body: html
    };
  } catch (e) {
    return {
      statusCode: 500,
      body: 'Internal Server Error: ' + e.message
    };
  }
}


