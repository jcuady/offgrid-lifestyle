import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import {initPwaInstall} from '@/src/lib/pwa';
import {initServiceWorker} from '@/src/lib/serviceWorker';

initPwaInstall();
initServiceWorker();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
