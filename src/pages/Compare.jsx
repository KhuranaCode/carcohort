import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CARS, GROUPS, TYPE_META } from '../data.js';
import { Badge, SectionHeading } from '../ui.jsx';
import { fmtINR, fmtDate } from '../utils.js';

// Compare - cross-group offer table.
//
// Read-only page: the only network call is GET /api/bootstrap. When the API
// is unreachable the page falls back to the bundled seed data (labelled), the
// same static-demo pattern the rest of the app uses.
//
// Ranking rules (matching GroupDetail's variant grouping):
// - The "Lowest listed" tag is about the listed on-road figure only, inside
//   one exact configuration: same vehicle, same city AND same exact variant.
//   It never compares across variants, vehicles or cities, and it does NOT
//   weigh inclusions, itemised charges or delivery terms - those can differ
//   between same-variant offers, and this page says so when they do.
// - An offer with no variant label ("Variant unconfirmed") is never tagged -
//   a missing label must not imply comparability.
// - Nothing here is called the best deal. The buyer weighs the terms.

const ALL = 'all';
const UNCONFIRMED = 'Variant unconfirmed';
const cohortKey = (r) => `${r.carId}::${r.city}`;
const variantKey = (r) => r.variant.toLowerCase();
const parseDay = (iso) => {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const t = new Date(iso + 'T23:59:59').getTime();
  return Number.isNaN(t) ? null : t;
};

// Flatten groups x offers into table rows. Exported for tests.
export function buildOfferRows(groups, cars, now = Date.now()) {
  const carByIdMap = new Map(cars.map((c) => [c.id, c]));
  const rows = [];
  for (const g of groups) {
    const car = carByIdMap.get(g.carId);
    for (const o of g.offers || []) {
      const validTill = parseDay(o.validTill);
      const variant = String(o.variant || '').trim();
      rows.push({
        key: `${g.id}:${o.id}`,
        groupId: g.id,
        carId: g.carId,
        vehicle: car?.name || g.carId,
        type: car?.type || 'car',
        variant,
        variantLabel: variant || UNCONFIRMED,
        city: g.city,
        dealer: o.dealer,
        rating: o.rating || 0,
        note: o.note || '',
        onRoad: o.onRoad,
        inclusions: o.inclusions || [],
        validTill,
        validTillIso: validTill ? o.validTill : '',
        expired: validTill != null && validTill < now,
        deliveryBy: parseDay(g.deliveryBy),
        deliveryByIso: parseDay(g.deliveryBy) ? g.deliveryBy : '',
      });
    }
  }
  // Lowest LISTED price: cheapest LIVE offer within one exact variant cohort
  // (same vehicle + city + same variant label), and only when at least two
  // live offers actually compete there. A lone offer is not a win, an expired
  // offer never counts, and an unconfirmed variant is never treated as
  // comparable. termsDiffer flags cohorts whose competing offers list
  // different inclusions - the tag is about the price figure, not the package.
  const live = rows.filter((r) => !r.expired && r.variant);
  const groups_ = new Map();
  for (const r of live) {
    const k = `${cohortKey(r)}::${variantKey(r)}`;
    if (!groups_.has(k)) groups_.set(k, []);
    groups_.get(k).push(r);
  }
  for (const r of rows) { r.lowestListed = false; r.termsDiffer = false; }
  for (const list of groups_.values()) {
    if (list.length < 2) continue;
    const min = Math.min(...list.map((r) => r.onRoad));
    const packs = new Set(list.map((r) => [...r.inclusions].sort().join(' | ')));
    for (const r of list) {
      if (r.onRoad === min) r.lowestListed = true;
      if (packs.size > 1) r.termsDiffer = true;
    }
  }
  return rows;
}

const COLUMNS = [
  { key: 'dealer', label: 'Dealer', sort: (r) => r.dealer.toLowerCase() },
  { key: 'vehicle', label: 'Vehicle', sort: (r) => r.vehicle.toLowerCase() },
  { key: 'variant', label: 'Variant', sort: (r) => (r.variant ? variantKey(r) : null) },
  { key: 'city', label: 'City', sort: (r) => r.city.toLowerCase() },
  { key: 'onRoad', label: 'Total on-road', sort: (r) => r.onRoad },
  { key: 'inclusions', label: 'Inclusions', sort: (r) => r.inclusions.length },
  { key: 'validTill', label: 'Valid till', sort: (r) => r.validTill },
  { key: 'deliveryBy', label: 'Delivery by', sort: (r) => r.deliveryBy },
];

// Exported for tests: missing values (e.g. no variant, no date) always sort
// last, whichever direction; ties fall back to on-road price ascending.
export function sortRows(rows, key, dir) {
  const col = COLUMNS.find((c) => c.key === key) || COLUMNS[0];
  const val = col.sort;
  return [...rows].sort((a, b) => {
    const va = val(a);
    const vb = val(b);
    if (va == null && vb == null) return a.onRoad - b.onRoad;
    if (va == null) return 1;
    if (vb == null) return -1;
    const cmp = typeof va === 'string' ? va.localeCompare(vb) : va - vb;
    return (dir === 'desc' ? -cmp : cmp) || a.onRoad - b.onRoad;
  });
}

function SortTh({ col, sortKey, dir, onSort }) {
  const active = sortKey === col.key;
  return (
    <th className="py-3 pr-4" aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : 'none'}>
      <button type="button" onClick={() => onSort(col.key)}
        className={`inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide ${active ? 'text-brand-800' : 'text-slate-400 hover:text-slate-600'}`}>
        {col.label}
        <span aria-hidden="true" className="text-[10px]">{active ? (dir === 'asc' ? '▲' : '▼') : '↕'}</span>
      </button>
    </th>
  );
}

// Pure presentational view - exported so it can be rendered/tested with any
// dataset. The default export below only wires in the bootstrap fetch.
export function CompareView({ cars, groups, offline = false }) {
  const [cohort, setCohort] = useState(null); // null = land on the most-competitive cohort
  const [vtype, setVtype] = useState(ALL);
  // Default order clusters exact variants together, cheapest first inside each
  // cluster - the like-for-like reading. Every column header re-sorts.
  const [sortKey, setSortKey] = useState('variant');
  const [dir, setDir] = useState('asc');

  const rows = useMemo(() => buildOfferRows(groups, cars), [groups, cars]);

  const cohorts = useMemo(() => {
    const seen = new Map();
    for (const r of rows) {
      const k = cohortKey(r);
      if (!seen.has(k)) seen.set(k, { key: k, label: `${r.vehicle} · ${r.city}`, live: 0 });
      if (!r.expired) seen.get(k).live += 1;
    }
    // Default landing target: the vehicle+city group with the most live offers.
    return [...seen.values()].sort((a, b) => b.live - a.live || a.label.localeCompare(b.label));
  }, [rows]);

  const effCohort = cohort ?? cohorts[0]?.key ?? ALL;

  const visible = useMemo(() => {
    let list = rows;
    if (effCohort !== ALL) list = list.filter((r) => cohortKey(r) === effCohort);
    if (effCohort === ALL && vtype !== ALL) list = list.filter((r) => r.type === vtype);
    return sortRows(list, sortKey, dir);
  }, [rows, effCohort, vtype, sortKey, dir]);

  const noBidGroups = groups.filter((g) => (g.offers || []).length === 0).length;
  const unconfirmed = visible.filter((r) => !r.variant).length;

  const onSort = (key) => {
    if (key === sortKey) setDir(dir === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setDir('asc'); }
  };

  return (
    <div className="container-x py-12">
      <SectionHeading kicker="Compare offers" title="Every dealer offer, side by side"
        sub="All prices are final on-road quotes for the group's city. Tags mark the lowest listed price within the same vehicle, city and exact variant - inclusions, charges and delivery terms can still differ, so weigh them before calling one offer better." />

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <select className="input !w-auto" value={effCohort} onChange={(e) => setCohort(e.target.value)} aria-label="Vehicle and city group">
          <option value={ALL}>All vehicles &amp; cities</option>
          {cohorts.map((c) => <option key={c.key} value={c.key}>{c.label} ({c.live} live offer{c.live === 1 ? '' : 's'})</option>)}
        </select>
        {effCohort === ALL && (
          <select className="input !w-auto" value={vtype} onChange={(e) => setVtype(e.target.value)} aria-label="Vehicle type">
            <option value={ALL}>All types</option>
            {Object.entries(TYPE_META).map(([t, m]) => <option key={t} value={t}>{m.label}</option>)}
          </select>
        )}
        {offline && <Badge cls="bg-amber-100 text-amber-800">Offline demo data - live server unreachable</Badge>}
        <span className="text-xs text-slate-400">{visible.length} offer{visible.length === 1 ? '' : 's'}</span>
      </div>

      {unconfirmed > 0 && (
        <p className="mt-3 text-xs text-amber-700">
          {unconfirmed} offer{unconfirmed === 1 ? '' : 's'} in this view {unconfirmed === 1 ? 'has' : 'have'} no variant label
          and {unconfirmed === 1 ? 'is' : 'are'} excluded from lowest-price matching - confirm the exact variant with the dealer before comparing.
        </p>
      )}

      {rows.length === 0 ? (
        <div className="card mt-8 p-10 text-center">
          <p className="font-semibold text-slate-600">No dealer offers yet.</p>
          <p className="mt-1 text-sm text-slate-500">Dealers start bidding once buyer groups grow. <Link to="/groups" className="font-semibold text-brand-700 hover:underline">Browse live groups</Link></p>
        </div>
      ) : visible.length === 0 ? (
        <div className="card mt-8 p-10 text-center">
          <p className="font-semibold text-slate-600">No offers match these filters.</p>
          <p className="mt-1 text-sm text-slate-500">Try a different vehicle, type or city group.</p>
        </div>
      ) : (
        <>
        <p className="mt-6 text-xs font-semibold text-brand-700 sm:hidden">Table scrolls sideways - swipe for total on-road price, inclusions and delivery terms →</p>
        <div className="card mt-2 overflow-x-auto sm:mt-8">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                {COLUMNS.map((c) => <SortTh key={c.key} col={c} sortKey={sortKey} dir={dir} onSort={onSort} />)}
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.key} className={`border-b border-slate-100 align-top ${r.expired ? 'opacity-55' : ''}`}>
                  <td className="py-4 pr-4">
                    <p className="font-semibold text-brand-950">{r.dealer}</p>
                    <p className="mt-0.5 text-xs text-slate-500">{r.rating > 0 ? `★ ${r.rating}` : 'New dealer'}{r.note ? ` · ${r.note}` : ''}</p>
                  </td>
                  <td className="py-4 pr-4">
                    <Link to={`/groups/${r.groupId}`} className="font-semibold text-brand-700 hover:underline">{r.vehicle}</Link>
                    <p className="mt-0.5 text-xs text-slate-400">{TYPE_META[r.type]?.label || r.type}</p>
                  </td>
                  <td className="py-4 pr-4">
                    {r.variant
                      ? <span className="font-semibold text-slate-700">{r.variant}</span>
                      : <Badge cls="bg-amber-100 text-amber-800">{UNCONFIRMED}</Badge>}
                  </td>
                  <td className="py-4 pr-4 text-slate-600">{r.city}</td>
                  <td className="py-4 pr-4">
                    <p className="font-display font-extrabold text-brand-900">{fmtINR(r.onRoad)}</p>
                    {r.lowestListed && (
                      <Badge cls="mt-1 bg-emerald-100 text-emerald-800">Lowest listed · {r.variant}</Badge>
                    )}
                    {r.lowestListed && r.termsDiffer && (
                      <p className="mt-1 text-[11px] font-semibold text-amber-700">Inclusions differ across these {r.variant} offers - compare them too</p>
                    )}
                  </td>
                  <td className="max-w-[220px] py-4 pr-4">
                    {r.inclusions.length === 0 ? (
                      <span className="text-xs text-slate-400">None listed</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {r.inclusions.slice(0, 2).map((inc) => <Badge key={inc} cls="bg-slate-100 text-slate-700">{inc}</Badge>)}
                        {r.inclusions.length > 2 && <Badge cls="bg-slate-100 text-slate-500">+{r.inclusions.length - 2} more</Badge>}
                      </div>
                    )}
                  </td>
                  <td className="py-4 pr-4">
                    {r.validTillIso ? <span className="text-slate-600">{fmtDate(r.validTillIso)}</span> : <span className="text-slate-400">-</span>}
                    {r.expired && <Badge cls="ml-2 bg-red-100 text-red-700">Expired</Badge>}
                  </td>
                  <td className="py-4">
                    {r.deliveryByIso ? <span className="text-slate-600">{fmtDate(r.deliveryByIso)}</span> : <span className="text-slate-400">-</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        </>
      )}

      {noBidGroups > 0 && (
        <p className="mt-4 text-xs text-slate-500">
          {noBidGroups} more group{noBidGroups === 1 ? ' is' : 's are'} still awaiting its first dealer bid. <Link to="/groups" className="font-semibold text-brand-700 hover:underline">See all groups</Link>
        </p>
      )}

      <div className="mt-6 rounded-xl bg-slate-100 p-4 text-xs leading-relaxed text-slate-500">
        Same vehicle, same city and same exact variant is the starting point, not the whole comparison. The
        "Lowest listed" tag looks at the on-road figure only - it does not weigh inclusions, itemised charges or
        delivery terms. Confirm all of those with the dealer before treating one offer as better. Every dealer,
        offer and price shown is fictional sample data. Savings depend on actual offers and are never guaranteed.
        Reservations stay free and non-binding; no payment happens on CarCohort.
      </div>
    </div>
  );
}

export default function Compare() {
  const [data, setData] = useState(null); // { cars, groups, offline }

  useEffect(() => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 8000);
    fetch('/api/bootstrap', { signal: ctrl.signal })
      .then((r) => {
        if (!r.ok) throw new Error(`bootstrap ${r.status}`);
        return r.json();
      })
      .then((b) => setData({ cars: b.cars, groups: b.groups, offline: false }))
      .catch(() => setData({ cars: CARS, groups: GROUPS, offline: true }))
      .finally(() => clearTimeout(timer));
    return () => { ctrl.abort(); clearTimeout(timer); };
  }, []);

  if (!data) {
    return (
      <div className="container-x py-24 text-center">
        <p className="text-sm font-semibold text-slate-500">Loading offers…</p>
      </div>
    );
  }
  return <CompareView cars={data.cars} groups={data.groups} offline={data.offline} />;
}
