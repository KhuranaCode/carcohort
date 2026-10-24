import React from 'react';
import { createRoot } from 'react-dom/client';
import App from '../src/App.jsx';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
// Poll instead of a fixed 200ms flush: CI runners vary in speed, and the app's
// animation loop can starve timers, making fixed-delay route checks racy.
// The assertions themselves are unchanged.
const until = async (fn, ms = 6000) => {
  const t0 = Date.now();
  for (;;) {
    let ok = false;
    try { ok = !!fn(); } catch {}
    if (ok) return true;
    if (Date.now() - t0 > ms) return false;
    await sleep(50);
  }
};
const results = [];
const check = (name, cond) => { results.push([name, !!cond]); if (!cond) throw new Error('smoke failed: ' + name); };
const text = () => document.body.textContent || '';
const btn = (label) => [...document.querySelectorAll('button')].find((b) => b.textContent.trim() === label);

export async function runSmoke() {
  const errors = [];
  window.addEventListener('error', (e) => errors.push(String(e.error?.message || e.message)));
  window.localStorage.setItem('carcohort-v1', JSON.stringify({ user: { name: 'Smoke Tester', role: 'buyer' }, reservations: {}, alerts: {}, welcomeSeen: true }));
  const root = createRoot(document.getElementById('root'));
  root.render(React.createElement(App));
  await sleep(200);
  const nav = (hash) => { window.location.hash = hash; window.dispatchEvent(new window.HashChangeEvent('hashchange')); };

  nav('#/groups/creta-mumbai');
  check('group detail renders dealer offers', await until(() => text().includes('Dealer offers')));
  check('variant grouping present', text().includes('Variant:'));

  check('reserve button present', await until(() => !!btn('Reserve this offer')));
  btn('Reserve this offer').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  check('confirm modal opens', await until(() => !!btn('Confirm reservation')));
  btn('Confirm reservation').dispatchEvent(new window.MouseEvent('click', { bubbles: true }));
  check('reservation badge shows', await until(() => text().includes('Reserved (demo)')));

  nav('#/dashboard');
  check('dashboard renders without crash', await until(() => text().toLowerCase().includes('reserv')));

  nav('#/compare');
  check('compare page renders', await until(() => text().includes('Every dealer offer, side by side')));

  nav('#/request');
  check('request page renders', await until(() => text().includes('Tell dealers exactly what you want')));

  root.unmount();
  const real = errors.filter((e) => !/fetch|network|Failed to fetch/i.test(e));
  if (real.length) throw new Error('runtime errors: ' + real.join(' | '));
  return results;
}
