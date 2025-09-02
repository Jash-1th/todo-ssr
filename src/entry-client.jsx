import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { App } from './main.jsx';

const initialData = window.__INITIAL_DATA__ || { todos: [] };

hydrateRoot(
  document.getElementById('root'),
  <App initialData={initialData} />
);


