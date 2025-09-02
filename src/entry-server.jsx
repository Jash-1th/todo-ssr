import React from 'react';
import { renderToString } from 'react-dom/server';
import { App, ErrorBoundary } from './main.jsx';

export function render(url, initialData) {
  const html = renderToString(
    <ErrorBoundary>
      <App initialData={initialData} />
    </ErrorBoundary>
  );
  return html;
}


