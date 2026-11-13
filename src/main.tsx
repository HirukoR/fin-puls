import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Unregister any stale development service workers to avoid cached @vite/client scripts
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) {
      if (registration.active?.scriptURL.includes('dev-sw') || import.meta.env.DEV) {
        registration.unregister().catch(() => {});
      }
    }
  }).catch(() => {});
}

createRoot(document.getElementById('root')!).render(<App />);
