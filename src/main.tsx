import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Ensure service workers update immediately so new deployments on Vercel never serve stale cached JS
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((registrations) => {
      for (const registration of registrations) {
        if (registration.active?.scriptURL.includes('dev-sw') || import.meta.env.DEV) {
          registration.unregister().catch(() => {});
        } else {
          registration.update().catch(() => {});
        }
      }
    })
    .catch(() => {});
}

createRoot(document.getElementById('root')!).render(<App />);

