import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';

process.env.DB_PATH = path.join(os.tmpdir(), `carcohort-test-${process.pid}.json`);
fs.rmSync(process.env.DB_PATH, { force: true });

const { createApp } = await import('./index.js');

let server, base;
before(async () => {
  server = createApp().listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}`;
});
after(() => { server.close(); fs.rmSync(process.env.DB_PATH, { force: true }); });

test('bootstrap returns catalogue and seeded groups', async () => {
  const r = await fetch(`${base}/api/bootstrap`);
  assert.equal(r.status, 200);
  const body = await r.json();
  assert.equal(body.cars.length, 19);
  assert.equal(body.groups.length, 9);
  assert.ok(body.groups[0].members > 0);
});

test('join increments members once per name (idempotent)', async () => {
  const j = async () => (await fetch(`${base}/api/groups/creta-mumbai/join`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Test Buyer' }),
  })).json();
  const a = (await j()).group.members;
  const b = (await j()).group.members;
  assert.equal(b, a); // second join by same name does not double-count
});

test('leave removes the member again', async () => {
  const before1 = (await (await fetch(`${base}/api/bootstrap`)).json()).groups.find((g) => g.id === 'creta-mumbai').members;
  await fetch(`${base}/api/groups/creta-mumbai/leave`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Test Buyer' }),
  });
  const after1 = (await (await fetch(`${base}/api/bootstrap`)).json()).groups.find((g) => g.id === 'creta-mumbai').members;
  assert.equal(after1, before1 - 1);
});

test('dealer offer validation and persistence', async () => {
  const bad = await fetch(`${base}/api/groups/creta-mumbai/offers`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ dealer: 'Test Motors', onRoad: 500 }),
  });
  assert.equal(bad.status, 400);
  const noVariant = await fetch(`${base}/api/groups/creta-mumbai/offers`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ dealer: 'Test Motors', onRoad: 1690000 }),
  });
  assert.equal(noVariant.status, 400);
  const good = await fetch(`${base}/api/groups/creta-mumbai/offers`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ dealer: 'Test Motors', variant: 'SX Petrol', onRoad: 1699000, inclusions: ['free mats'], validTill: '2026-11-06' }),
  });
  assert.equal(good.status, 201);
  const { offer } = await good.json();
  const groups = (await (await fetch(`${base}/api/bootstrap`)).json()).groups;
  assert.ok(groups.find((g) => g.id === 'creta-mumbai').offers.some((o) => o.id === offer.id));
});

test('reservation requires a real group and offer', async () => {
  const missing = await fetch(`${base}/api/reserve`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ groupId: 'nope', offerId: 'nope', name: 'X' }),
  });
  assert.equal(missing.status, 404);
  const ok = await fetch(`${base}/api/reserve`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ groupId: 'creta-mumbai', offerId: 'o1', name: 'Test Buyer' }),
  });
  assert.equal(ok.status, 201);
});

test('unknown group returns 404', async () => {
  const r = await fetch(`${base}/api/groups/nope/join`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'X' }),
  });
  assert.equal(r.status, 404);
});

test('buyer quote request validates and matches an existing group', async () => {
  const bad = await fetch(`${base}/api/requests`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Test', carId: 'creta', variant: 'mid', city: 'Mumbai', budget: 50, deliveryBy: '2026-12-15' }),
  });
  assert.equal(bad.status, 400);
  const ok = await fetch(`${base}/api/requests`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Test Buyer', carId: 'creta', variant: 'mid', city: 'Mumbai', budget: 1700000, deliveryBy: '2026-12-15' }),
  });
  assert.equal(ok.status, 201);
  const body = await ok.json();
  assert.equal(body.groupId, 'creta-mumbai');
  assert.equal(body.created, false);
  const boot = await (await fetch(`${base}/api/bootstrap`)).json();
  assert.equal(boot.requests.length, 1);
  assert.equal(boot.requests[0].deliveryBy, '2026-12-15');
});

test('unmatched request actually creates a new group (exact variant/budget/date carried)', async () => {
  const r = await fetch(`${base}/api/requests`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ name: 'Scooter Buyer', carId: 'activa', variant: 'top', city: 'Pune', budget: 95000, deliveryBy: '2026-12-20' }),
  });
  assert.equal(r.status, 201);
  const body = await r.json();
  assert.equal(body.created, true);
  assert.ok(body.groupId);
  const boot = await (await fetch(`${base}/api/bootstrap`)).json();
  const g = boot.groups.find((x) => x.id === body.groupId);
  assert.ok(g, 'new group appears in bootstrap');
  assert.equal(g.carId, 'activa');
  assert.equal(g.city, 'Pune');
  assert.equal(g.members, 1);
  assert.equal(g.deliveryBy, '2026-12-20');
  // and it can receive dealer offers like any other group
  const o = await fetch(`${base}/api/groups/${body.groupId}/offers`, {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ dealer: 'Test Honda', variant: 'DLX Drum', onRoad: 98000, inclusions: [], validTill: '2026-12-01' }),
  });
  assert.equal(o.status, 201);
  const ob = await o.json();
  assert.equal(ob.offer.variant, 'DLX Drum');
});
