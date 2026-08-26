import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App.js';

// The DOM returns null for a missing element. Absence has one spelling inside
// this project, so it is converted here, at the boundary, and not carried in.
const host = document.getElementById('root') ?? undefined;
if (host === undefined) throw new Error('the page has no #root to mount into');

createRoot(host).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
