import { JSDOM } from 'jsdom';
const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', { url: 'http://localhost:3001/', pretendToBeVisual: true });
for (const k of ['window','document','navigator','localStorage','sessionStorage','HTMLElement','Element','Node','CustomEvent','Event','KeyboardEvent','MouseEvent','HashChangeEvent','requestAnimationFrame','cancelAnimationFrame','getComputedStyle','DocumentFragment','Text','Comment','MutationObserver','Range','Selection']) {
  if (dom.window[k] !== undefined) { try { Object.defineProperty(globalThis, k, { value: dom.window[k], configurable: true, writable: true }); } catch {} }
}
// jsdom has no matchMedia / IntersectionObserver; stub them (reduced-motion = true so animations stay inert).
dom.window.matchMedia = (q) => ({ matches: /reduce/.test(q) && !/no-preference/.test(q), media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {} });
globalThis.IntersectionObserver = class { observe() {} disconnect() {} unobserve() {} };
globalThis.IS_REACT_ACT_ENVIRONMENT = true;
const { runSmoke } = await import('/tmp/smoke.bundle.mjs');
const results = await runSmoke();
for (const [name, ok] of results) console.log((ok ? 'PASS ' : 'FAIL ') + name);
console.log('SMOKE OK');
// GSAP's ticker keeps jsdom's rAF loop alive; exit explicitly (non-zero if any check failed).
process.exit(results.every(([, ok]) => ok) ? 0 : 1);
