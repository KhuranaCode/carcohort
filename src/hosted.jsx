// Entry used ONLY for the hosted phone preview (Instinct File). Same app, same components;
// differences: MemoryRouter (does not touch the host page URL) and no /api server, so it runs on bundled seed data.
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { AppProvider } from './store.jsx';
import { Shell } from './App.jsx';
import './index.css';

export function mount(el) {
  window.__CC_HOSTED__ = true;
  // iframe height tracks content here, so viewport units would feed back; use a fixed scene height instead.
  document.documentElement.style.setProperty('--cc-vh', `${Math.max(560, Math.min(760, Math.round((window.screen?.height || 800) * 0.8)))}px`);
  const root = createRoot(el);
  root.render(<AppProvider><MemoryRouter><Shell /></MemoryRouter></AppProvider>);
  return () => root.unmount();
}
