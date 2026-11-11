import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

const handleExit = () => {
  if (window.history.length > 1) {
    window.history.back();
    return;
  }

  window.location.href = '/';
};

createRoot(document.getElementById('root')!).render(
  <App onExit={handleExit} />
);
