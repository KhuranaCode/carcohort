import { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { TYPE_META } from '../data.js';
import { useApp } from '../store.jsx';
import { Badge, CarPhoto, SectionHeading, Tilt } from '../ui.jsx';
import { Reveal } from '../cinematic.jsx';
import { fmtINR } from '../utils.js';

const BODIES = ['All', 'Hatchback', 'Micro SUV', 'Compact SUV', 'SUV', 'Sedan', 'MPV', 'Scooter', 'Cruiser', 'Commuter'];
const BUDGETS = ['All', 'Under ₹10L', '₹10-20L', 'Above ₹20L'];
const SORTS = [
  ['featured', 'Featured'],
  ['price-asc', 'Price: low to high'],
  ['price-desc', 'Price: high to low'],
  ['name', 'Name A-Z'],
];

// Vehicle discovery. Filters and sort live in the URL (?type=&body=&budget=&sort=)
// so a filtered view is shareable and survives a refresh.
export default function Cars() {
  const { data } = useApp();
  const [params, setParams] = useSearchParams();
  const body = params.get('body') || 'All';
  const vtype = params.get('type') || 'All';
  const budget = params.get('budget') || 'All';
  const sort = params.get('sort') || 'featured';

  const set = (key, value) => {
    setParams((p) => {
      const next = new URLSearchParams(p);
      if (value === 'All' || value === 'featured') next.delete(key); else next.set(key, value);
      return next;
    }, { replace: true });
  };

  const list = useMemo(() => {
    const filtered = data.cars.filter((c) => {
      if (vtype !== 'All' && c.type !== vtype) return false;
      if (body !== 'All' && c.body !== body) return false;
      if (budget === 'Under ₹10L' && c.exMin >= 1000000) return false;
      if (budget === '₹10-20L' && (c.exMin < 1000000 || c.exMin > 2000000)) return false;
      if (budget === 'Above ₹20L' && c.exMin < 2000000) return false;
      return true;
    });
    const by = {
      'featured': (a, b) => (b.popular - a.popular) || a.exMin - b.exMin,
      'price-asc': (a, b) => a.exMin - b.exMin,
      'price-desc': (a, b) => b.exMin - a.exMin,
      'name': (a, b) => a.name.localeCompare(b.name),
    }[sort] || (() => 0);
    return [...filtered].sort(by);
  }, [body, budget, vtype, sort, data.cars]);
  const groupCount = (carId) => data.groups.filter((g) => g.carId === carId).length;

  return (
    <div className="container-x py-12">
      <SectionHeading kicker="Catalogue" title="Pick the vehicle. We'll find the group."
        sub="Indicative ex-showroom prices for popular models. Every model can have a buying group in any of our live cities." />
      <div className="mt-8 flex flex-wrap items-center gap-3">
        <select className="input !w-auto" value={vtype} onChange={(e) => set('type', e.target.value)} aria-label="Vehicle type">
          <option value="All">All types</option>
          {Object.entries(TYPE_META).map(([t, m]) => <option key={t} value={t}>{m.label}</option>)}
        </select>
        <select className="input !w-auto" value={body} onChange={(e) => set('body', e.target.value)} aria-label="Body style">
          {BODIES.map((b) => <option key={b}>{b}</option>)}
        </select>
        <select className="input !w-auto" value={budget} onChange={(e) => set('budget', e.target.value)} aria-label="Budget">
          {BUDGETS.map((b) => <option key={b}>{b}</option>)}
        </select>
        <select className="input !w-auto" value={sort} onChange={(e) => set('sort', e.target.value)} aria-label="Sort by">
          {SORTS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <span className="text-xs text-slate-400" aria-live="polite">{list.length} vehicle{list.length === 1 ? '' : 's'}</span>
      </div>
      {list.length === 0 ? (
        <div className="card mt-8 p-10 text-center">
          <p className="font-semibold text-slate-500">No vehicles match these filters.</p>
          <button type="button" className="btn-ghost mt-4" onClick={() => setParams({}, { replace: true })}>Clear filters</button>
        </div>
      ) : (
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((c, i) => (
          <Reveal key={c.id} delay={Math.min(i, 6) * 60}>
            <Tilt className="h-full" max={3}>
            <div className="card flex h-full flex-col overflow-hidden transition hover:shadow-lift">
              <Link to={`/cars/${c.id}`} className="block bg-gradient-to-br from-brand-50 to-ink-800 p-4" aria-label={`${c.name} full details`}>
                <CarPhoto car={c} className="mx-auto w-full max-w-xs" />
              </Link>
              <div className="flex flex-1 flex-col p-5">
                <div className="flex items-start justify-between gap-2">
                  <Link to={`/cars/${c.id}`} className="font-display font-bold text-brand-950 hover:text-brand-700">{c.name}</Link>
                  {c.popular && <Badge cls="bg-amber-100 text-amber-800">Popular</Badge>}
                </div>
                <p className="mt-1 text-xs text-slate-500">{TYPE_META[c.type]?.label} · {c.body} · {c.fuel}</p>
                <p className="mt-3 font-display text-lg font-extrabold text-brand-900">{fmtINR(c.exMin)} <span className="text-xs font-semibold text-slate-400">onwards, ex-showroom</span></p>
                <div className="mt-auto flex gap-2 pt-4">
                  <Link to={`/cars/${c.id}`} className="btn-ghost flex-1 !py-2.5">Details</Link>
                  {groupCount(c.id) > 0 ? (
                    <Link to="/groups" className="btn-primary flex-1 !py-2.5">{groupCount(c.id)} group{groupCount(c.id) > 1 ? 's' : ''}</Link>
                  ) : (
                    <Link to="/groups" className="btn-primary flex-1 !py-2.5">Start a group</Link>
                  )}
                </div>
              </div>
            </div>
            </Tilt>
          </Reveal>
        ))}
      </div>
      )}
    </div>
  );
}
