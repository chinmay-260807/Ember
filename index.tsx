
import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';

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
  }
};

// Mount immediately if DOM is ready, otherwise wait for DOMContentLoaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', mount);
} else {
  mount();
}
