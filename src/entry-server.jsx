import React from 'react';
import { renderToString } from 'react-dom/server';
import { App } from './main.jsx';

export function render(url, initialData) {
  const html = renderToString(<App initialData={initialData} />);
  return html;
}


