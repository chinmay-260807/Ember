import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

const mount = () => {
  const container = document.getElementById('root');
  if (!container) {
    console.error('Fatal: #root element not found in DOM.');
    return;
  }
  
  try {
    const root = createRoot(container);
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (err) {
    console.error('Fatal: Error during React root creation:', err);
    container.innerHTML = `<div style="padding: 20px; color: #4a4e69; text-align: center; font-family: sans-serif;">
      A small spark went out. Please refresh the sanctuary.
    </div>`;
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}