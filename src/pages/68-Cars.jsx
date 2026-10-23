import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { TYPE_META } from '../data.js';
import { useApp } from '../store.jsx';
import { Badge, CarPhoto, SectionHeading } from '../ui.jsx';
import { fmtINR } from '../utils.js';

const BODIES = ['All', 'Hatchback', 'Micro SUV', 'Compact SUV', 'SUV', 'Sedan', 'MPV', 'Scooter', 'Cruiser', 'Commuter'];

export default function Cars() {
  const { data } = useApp();
  const [body, setBody] = useState('All');
  const [vtype, setVtype] = useState('All');
  const [budget, setBudget] = useState('All');
  const list = useMemo(() => data.cars.filter((c) => {
    if (vtype !== 'All' && c.type !== vtype) return false;
    if (body !== 'All' && c.body !== body) return false;
    if (budget === 'Under ₹10L' && c.exMin >= 1000000) return false;
    if (budget === '₹10-20L' && (c.exMin < 1000000 || c.exMin > 2000000)) return false;
    if (budget === 'Above ₹20L' && c.exMin < 2000000) return false;
    return true;
  }), [body, budget, vtype, data.cars]);
  const groupCount = (carId) => data.groups.filter((g) => g.carId === carId).length;

  return (
    <div className="container-x py-12">
      <SectionHeading kicker="Catalogue" title="Pick the vehicle. We'll find the group."
        sub="Indicative ex-showroom prices for popular models. Every model can have a buying group in any of our live cities." />
      <div className="mt-8 flex flex-wrap gap-3">
        <select className="input !w-auto" value={vtype} onChange={(e) => setVtype(e.target.value)}>
          <option value="All">All types</option>
          {Object.entries(TYPE_META).map(([t, m]) => <option key={t} value={t}>{m.label}</option>)}
        </select>
        <select className="input !w-auto" value={body} onChange={(e) => setBody(e.target.value)}>
          {BODIES.map((b) => <option key={b}>{b}</option>)}
        </select>
        <select className="input !w-auto" value={budget} onChange={(e) => setBudget(e.target.value)}>
          {['All', 'Under ₹10L', '₹10-20L', 'Above ₹20L'].map((b) => <option key={b}>{b}</option>)}
        </select>
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {list.map((c) => (
          <div key={c.id} className="card flex flex-col overflow-hidden transition hover:shadow-lift">
            <div className="bg-gradient-to-br from-brand-50 to-ink-800 p-4">
              <CarPhoto car={c} className="mx-auto w-full max-w-xs" />
            </div>
            <div className="flex flex-1 flex-col p-5">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-display font-bold text-brand-950">{c.name}</h3>
                {c.popular && <Badge cls="bg-amber-100 text-amber-800">Popular</Badge>}
              </div>
              <p className="mt-1 text-xs text-slate-500">{TYPE_META[c.type]?.label} · {c.body} · {c.fuel}</p>
              <p className="mt-1 text-xs text-slate-500">{c.mileage}{c.ncap > 0 ? ` · ${c.ncap}★ safety` : ''}</p>
              <p className="mt-3 font-display text-lg font-extrabold text-brand-900">{fmtINR(c.exMin)} <span className="text-xs font-semibold text-slate-400">onwards, ex-showroom</span></p>
              <div className="mt-auto pt-4">
                {groupCount(c.id) > 0 ? (
                  <Link to="/groups" className="btn-primary w-full !py-2.5">{groupCount(c.id)} group{groupCount(c.id) > 1 ? 's' : ''} forming - view</Link>
                ) : (
                  <Link to="/groups" className="btn-ghost w-full !py-2.5">Start a group</Link>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
