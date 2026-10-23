// CarCohort local backend - Express API with JSON-file persistence.
// Seed catalogue/groups come from src/data.js; all mutations (joins, dealer
// offers, reservations) persist to server/db.json. Zero external services.
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { CARS, GROUPS } from '../src/data.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'db.json');

function loadDb() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
  } catch {
    return { joins: {}, offers: {}, reservations: [] };
  }
}

function saveDb(db) {
  const tmp = DB_PATH + '.tmp';
  fs.writeFileSync(tmp, JSON.stringify(db, null, 2));
  fs.renameSync(tmp, DB_PATH);
}

const CUSTOM_DEFAULT = { target: 15, status: 'forming' };

function allGroups(db) {
  const custom = (db.customGroups || []).map((g) => ({ ...CUSTOM_DEFAULT, offers: [], invited: 0, ...g }));
  return [...GROUPS, ...custom];
}

function buildGroups(db) {
  return allGroups(db).map((g) => ({
    ...g,
    members: g.members + (db.joins[g.id]?.length || 0),
    offers: [...g.offers, ...(db.offers[g.id] || [])],
  }));
}

// ---- Hardening for the local Express path only (does not apply to a static host) ----
const LIMITS = { joinsPerGroup: 5000, offersPerGroup: 50, reservations: 5000, requests: 5000, customGroups: 200 };
const CSP = [
  "default-src 'self'",
  "script-src 'self'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

function securityHeaders(_req, res, next) {
  res.setHeader('Content-Security-Policy', CSP);
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  next();
}

// Small in-memory fixed-window limiter per client address. Resets on restart and is per process.
function rateLimit({ windowMs, max }) {
  const hits = new Map();
  return (req, res, next) => {
    const now = Date.now();
    const key = req.ip || 'unknown';
    const h = hits.get(key);
    if (!h || now - h.start > windowMs) hits.set(key, { start: now, n: 1 });
    else if (++h.n > max) {
      res.setHeader('Retry-After', String(Math.ceil((h.start + windowMs - now) / 1000)));
      return res.status(429).json({ error: 'too many requests' });
    }
    if (hits.size > 10000) for (const [k, v] of hits) if (now - v.start > windowMs) hits.delete(k);
    next();
  };
}

export function createApp() {
  const app = express();
  app.disable('x-powered-by');
  app.use(securityHeaders);
  app.use('/api', rateLimit({ windowMs: 60000, max: 240 }));
  const writeLimit = rateLimit({ windowMs: 60000, max: 40 });
  app.use('/api', (req, res, next) => (req.method === 'POST' ? writeLimit(req, res, next) : next()));
  app.use(express.json({ limit: '10kb' }));
  app.use((err, _req, res, next) => {
    if (err) return res.status(err.status === 413 ? 413 : 400).json({ error: 'invalid request body' });
    return next();
  });

  app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

  // Public catalogue. Other people's reservations and quote requests are NOT included.
  // Callers may pass ?name= to get only the records stored under that name. There is no
  // real authentication in this prototype, so anyone who knows a name can read that name's records.
  app.get('/api/bootstrap', (req, res) => {
    const db = loadDb();
    const name = String(req.query?.name || '').trim().slice(0, 60).toLowerCase();
    const mine = (r) => name && String(r.name || '').toLowerCase() === name;
    res.json({
      cars: CARS,
      groups: buildGroups(db),
      reservations: name ? db.reservations.filter(mine) : [],
      requests: name ? (db.requests || []).filter(mine) : [],
    });
  });

  app.post('/api/groups/:id/join', (req, res) => {
    const { id } = req.params;
    const name = String(req.body?.name || '').trim().slice(0, 60);
    if (!allGroups(loadDb()).some((g) => g.id === id)) return res.status(404).json({ error: 'unknown group' });
    if (!name) return res.status(400).json({ error: 'name required' });
    const db = loadDb();
    const list = db.joins[id] || (db.joins[id] = []);
    if (list.length >= LIMITS.joinsPerGroup) return res.status(409).json({ error: 'group is full in this demo' });
    if (!list.some((n) => n.toLowerCase() === name.toLowerCase())) {
      list.push(name);
      saveDb(db);
    }
    res.json({ group: buildGroups(db).find((g) => g.id === id) });
  });

  app.post('/api/groups/:id/leave', (req, res) => {
    const { id } = req.params;
    const name = String(req.body?.name || '').trim().slice(0, 60);
    if (!allGroups(loadDb()).some((g) => g.id === id)) return res.status(404).json({ error: 'unknown group' });
    const db = loadDb();
    db.joins[id] = (db.joins[id] || []).filter((n) => n.toLowerCase() !== name.toLowerCase());
    saveDb(db);
    res.json({ group: buildGroups(db).find((g) => g.id === id) });
  });

  app.post('/api/groups/:id/offers', (req, res) => {
    const { id } = req.params;
    if (!allGroups(loadDb()).some((g) => g.id === id)) return res.status(404).json({ error: 'unknown group' });
    const dealer = String(req.body?.dealer || '').trim().slice(0, 80);
    const variant = String(req.body?.variant || '').trim().slice(0, 60);
    const onRoad = Number.parseInt(req.body?.onRoad, 10);
    if (!dealer) return res.status(400).json({ error: 'dealer required' });
    if (!variant) return res.status(400).json({ error: 'variant required - offers must name the exact variant they cover' });
    if (!Number.isFinite(onRoad) || onRoad < 30000 || onRoad > 100000000) {
      return res.status(400).json({ error: 'onRoad must be a plausible price in INR' });
    }
    const inclusions = Array.isArray(req.body?.inclusions)
      ? req.body.inclusions.map((s) => String(s).trim().slice(0, 80)).filter(Boolean).slice(0, 8)
      : [];
    let breakdown;
    if (req.body?.breakdown) {
      const b = req.body.breakdown;
      const keys = ['exShowroom', 'rto', 'insurance', 'other'];
      const vals = keys.map((k) => Number.parseInt(b[k], 10));
      if (vals.some((v) => !Number.isFinite(v) || v < 0 || v > 100000000)) return res.status(400).json({ error: 'breakdown amounts must be non-negative numbers' });
      if (Math.abs(vals.reduce((a, c) => a + c, 0) - onRoad) > 1) return res.status(400).json({ error: 'breakdown must add up to onRoad' });
      breakdown = Object.fromEntries(keys.map((k, i) => [k, vals[i]]));
    }
    const offer = {
      id: `srv-${Date.now().toString(36)}`,
      dealer,
      variant,
      onRoad,
      inclusions,
      breakdown,
      validTill: /^\d{4}-\d{2}-\d{2}$/.test(String(req.body?.validTill || '')) ? String(req.body.validTill) : '',
      rating: 0, // new dealers have no rating yet
      note: String(req.body?.note || '').trim().slice(0, 200),
      submittedAt: new Date().toISOString(),
    };
    const db = loadDb();
    if ((db.offers[id] || []).length >= LIMITS.offersPerGroup) return res.status(409).json({ error: 'offer limit reached in this demo' });
    (db.offers[id] || (db.offers[id] = [])).push(offer);
    saveDb(db);
    res.status(201).json({ offer, group: buildGroups(db).find((g) => g.id === id) });
  });

  // Buyer quote requests: car + variant + budget + requested delivery date.
  // These are what dealers get invited to bid on.
  app.post('/api/requests', (req, res) => {
    const b = req.body || {};
    const name = String(b.name || '').trim().slice(0, 60);
    const carId = String(b.carId || '');
    const variant = String(b.variant || '').slice(0, 20);
    const variantText = String(b.variantText || '').trim().slice(0, 60);
    const city = String(b.city || '').slice(0, 40);
    const budget = Number.parseInt(b.budget, 10);
    const deliveryBy = String(b.deliveryBy || '').slice(0, 10);
    if (!name) return res.status(400).json({ error: 'name required' });
    if (!CARS.some((c) => c.id === carId)) return res.status(400).json({ error: 'unknown car' });
    if (!city) return res.status(400).json({ error: 'city required' });
    if (!Number.isFinite(budget) || budget < 30000 || budget > 100000000) {
      return res.status(400).json({ error: 'budget must be a plausible amount in INR' });
    }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(deliveryBy)) return res.status(400).json({ error: 'deliveryBy must be YYYY-MM-DD' });
    const db = loadDb();
    if ((db.requests || []).length >= LIMITS.requests || (db.customGroups || []).length >= LIMITS.customGroups) {
      return res.status(409).json({ error: 'demo storage limit reached' });
    }
    const rec = {
      id: `req-${Date.now().toString(36)}`,
      name, carId, variant, variantText, city, budget, deliveryBy,
      at: new Date().toISOString(),
    };
    (db.requests || (db.requests = [])).push(rec);
    // Groups form per model + city (the bargaining unit). The request keeps the buyer's
    // exact variant, budget and delivery date; dealers quote against those, and offers
    // carry the variant they cover so buyers compare like-for-like, not price alone.
    // Match = same model + city group. Otherwise this request starts a
    // new group (persisted) that dealers would be invited to bid on.
    const existing = allGroups(db).find((g) => g.carId === carId && g.city === city);
    let groupId = existing?.id || null;
    let created = false;
    if (!existing) {
      groupId = `grp-${Date.now().toString(36)}`;
      (db.customGroups || (db.customGroups = [])).push({
        id: groupId, carId, city, members: 0,
        deadline: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        deliveryBy,
      });
      (db.joins[groupId] || (db.joins[groupId] = [])).push(name);
      created = true;
    }
    saveDb(db);
    res.status(201).json({ request: rec, groupId, created, group: buildGroups(db).find((g) => g.id === groupId) });
  });

  app.post('/api/reserve', (req, res) => {
    const { groupId, offerId } = req.body || {};
    const name = String(req.body?.name || '').trim().slice(0, 60);
    const db = loadDb();
    const group = buildGroups(db).find((g) => g.id === groupId);
    if (!group) return res.status(404).json({ error: 'unknown group' });
    if (!group.offers.some((o) => o.id === offerId)) return res.status(404).json({ error: 'unknown offer' });
    if (!name) return res.status(400).json({ error: 'name required' });
    const offerRec = group.offers.find((o) => o.id === offerId);
    if (offerRec.validTill && offerRec.validTill < new Date().toISOString().slice(0, 10)) {
      return res.status(409).json({ error: 'offer expired' });
    }
    const rec = { groupId, offerId, name, at: new Date().toISOString() };
    if (db.reservations.length >= LIMITS.reservations) return res.status(409).json({ error: 'demo storage limit reached' });
    if (!db.reservations.some((r) => r.offerId === offerId && r.name.toLowerCase() === name.toLowerCase())) {
      db.reservations.push(rec);
      saveDb(db);
    }
    res.status(201).json({ reservation: rec });
  });

  // Serve the production build when present (npm run build first).
  const dist = path.join(__dirname, '..', 'dist');
  if (fs.existsSync(dist)) {
    app.use(express.static(dist, { dotfiles: 'ignore', index: false }));
    app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
  }

  return app;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3001);
  const host = process.env.HOST || '127.0.0.1'; // loopback only unless explicitly overridden
  createApp().listen(port, host, () => {
    console.log(`CarCohort server on http://${host}:${port}`);
  });
}
