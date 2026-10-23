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

export function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/api/health', (_req, res) => res.json({ ok: true, ts: Date.now() }));

  app.get('/api/bootstrap', (_req, res) => {
    const db = loadDb();
    res.json({ cars: CARS, groups: buildGroups(db), reservations: db.reservations, requests: db.requests || [] });
  });

  app.post('/api/groups/:id/join', (req, res) => {
    const { id } = req.params;
    const name = String(req.body?.name || '').trim().slice(0, 60);
    if (!allGroups(loadDb()).some((g) => g.id === id)) return res.status(404).json({ error: 'unknown group' });
    if (!name) return res.status(400).json({ error: 'name required' });
    const db = loadDb();
    const list = db.joins[id] || (db.joins[id] = []);
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
    const offer = {
      id: `srv-${Date.now().toString(36)}`,
      dealer,
      variant,
      onRoad,
      inclusions,
      validTill: String(req.body?.validTill || '').slice(0, 10),
      rating: 0, // new dealers have no rating yet
      note: String(req.body?.note || '').trim().slice(0, 200),
      submittedAt: new Date().toISOString(),
    };
    const db = loadDb();
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
    const rec = { groupId, offerId, name, at: new Date().toISOString() };
    if (!db.reservations.some((r) => r.offerId === offerId && r.name.toLowerCase() === name.toLowerCase())) {
      db.reservations.push(rec);
      saveDb(db);
    }
    res.status(201).json({ reservation: rec });
  });

  // Serve the production build when present (npm run build first).
  const dist = path.join(__dirname, '..', 'dist');
  if (fs.existsSync(dist)) {
    app.use(express.static(dist));
    app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
  }

  return app;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 3001);
  createApp().listen(port, () => {
    console.log(`CarCohort server on http://localhost:${port}`);
  });
}
