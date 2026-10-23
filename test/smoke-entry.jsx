import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../src/App.jsx';

const flush = () => new Promise((r) => setTimeout(r, 40));
const results = [];
const check = (name, cond) => { results.push([name, !!cond]); if (!cond) throw new Error('smoke failed: ' + name); };

export async function runSmoke() {
  const errors = [];
  window.addEventListener('error', (e) => errors.push(String(e.error?.message || e.message)));
  window.localStorage.setItem('carcohort-v1', JSON.stringify({ user: { name: 'Smoke Tester', role: 'buyer' }, reservations: {}, alerts: {}, welcomeSeen: true }));
  const root = createRoot(document.getElementById('root'));
  root.render(React.createElement(App));
  await flush();
  const nav = async (hash) => { window.location.hash = hash; window.dispatchEvent(new window.HashChangeEvent('hashchange')); await flush(); };

  await nav('#/groups/creta-mumbai');
  check('group detail renders dealer offers', document.body.textContent.includes('Dealer offers'));
  check('variant grouping present', document.body.textContent.includes('Variant:'));

  const reserveBtn = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Reserve this offer');
  check('reserve button present', reserveBtn);
  reserveBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  await flush();
  const confirmBtn = [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === 'Confirm reservation');
  check('confirm modal opens', confirmBtn);
  confirmBtn.dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  await flush();
  check('reservation badge shows', document.body.textContent.includes('Reserved (demo)'));

  await nav('#/dashboard');
  check('dashboard renders without crash', document.body.textContent.toLowerCase().includes('reserv'));

  await nav('#/compare');
  check('compare page renders', document.body.textContent.includes('Every dealer offer, side by side'));

  await nav('#/request');
  check('request page renders', document.body.textContent.includes('Tell dealers exactly what you want'));

  root.unmount();
  const real = errors.filter((e) => !/fetch|network|Failed to fetch/i.test(e));
  if (real.length) throw new Error('runtime errors: ' + real.join(' | '));
  return results;
}
