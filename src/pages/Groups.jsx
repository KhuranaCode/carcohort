import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { CITIES, carById, bestOffer, savingsVsEstimate, STATUS_META } from '../data.js';
import { Badge, Countdown, ProgressBar, CarArt, SectionHeading } from '../ui.jsx';
import { fmtINR } from '../utils.js';
import { useApp } from '../store.jsx';

export function GroupCard({ group }) {
  const car = carById(group.carId);
  const best = bestOffer(group);
  const saving = savingsVsEstimate(group);
  const meta = STATUS_META[group.status];
  const { state } = useApp();
  const joined = state.joined.includes(group.id);
  const members = group.members;
  return (
    <Link to={`/groups/${group.id}`} className="card group flex flex-col overflow-hidden transition hover:shadow-lift">
      <div className="bg-gradient-to-br from-brand-50 to-white p-5">
        <div className="flex items-center justify-between">
          <Badge cls={meta.cls}>{meta.label}</Badge>
          <Countdown deadline={group.deadline} />
        </div>
        <CarArt body={car.body} type={car.type} className="mx-auto mt-2 w-56 max-w-full" />
      </div>
      <div className="flex flex-1 flex-col p-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-lg font-bold text-brand-950 group-hover:text-brand-700">{car.name}</h3>
            <p className="text-sm text-slate-500">{group.city} · {car.fuel}</p>
          </div>
          {joined && <Badge cls="bg-emerald-100 text-emerald-800">Joined</Badge>}
        </div>
        <div className="mt-4"><ProgressBar value={members} max={group.target} /></div>
        <div className="mt-4 flex items-end justify-between border-t border-slate-100 pt-4">
          {best ? (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Best offer (on-road)</p>
              <p className="font-display text-xl font-extrabold text-brand-900">{fmtINR(best.onRoad)}</p>
            </div>
          ) : (
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Offers</p>
              <p className="text-sm font-semibold text-slate-500">Dealers invited once group grows</p>
            </div>
          )}
          {saving > 0 && <Badge cls="bg-emerald-100 text-emerald-800">Save {fmtINR(saving)}*</Badge>}
        </div>
        <p className="mt-3 text-[11px] text-slate-400">{group.offers.length} dealer offer{group.offers.length === 1 ? '' : 's'} · *indicative vs est. on-road</p>
      </div>
    </Link>
  );
}

export default function Groups() {
  const { data } = useApp();
  const [city, setCity] = useState('All');
  const [status, setStatus] = useState('All');
  const list = useMemo(() => data.groups.filter((g) =>
    (city === 'All' || g.city === city) && (status === 'All' || g.status === status)
  ), [city, status, data.groups]);

  return (
    <div className="container-x py-12">
      <SectionHeading kicker="Live buying groups" title="Find your group"
        sub="Join buyers who want the same car in your city. Free and non-binding - your joining simply raises the buyer count dealers bid for." />
      <div className="mt-8 flex flex-wrap gap-3">
        <select className="input !w-auto" value={city} onChange={(e) => setCity(e.target.value)}>
          <option>All</option>{CITIES.map((c) => <option key={c}>{c}</option>)}
        </select>
        <select className="input !w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="All">All statuses</option>
          <option value="forming">Group forming</option>
          <option value="offers-live">Offers live</option>
          <option value="closing-soon">Closing soon</option>
        </select>
      </div>
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {list.map((g) => <GroupCard key={g.id} group={g} />)}
      </div>
      {list.length === 0 && <p className="mt-12 text-center text-slate-500">No groups match these filters yet.</p>}
    </div>
  );
}
