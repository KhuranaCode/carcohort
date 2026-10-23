import { Link, useNavigate } from 'react-router-dom';
import { carById, bestOffer, savingsVsEstimate, STATUS_META } from '../data.js';
import { Badge, Countdown, ProgressBar, SectionHeading } from '../ui.jsx';
import { fmtINR } from '../utils.js';
import { useApp } from '../store.jsx';

export default function Dashboard() {
  const { state, findGroup } = useApp();
  const nav = useNavigate();

  if (!state.user) {
    return (
      <div className="container-x py-24 text-center">
        <SectionHeading center kicker="Buyer dashboard" title="Sign in to see your groups" />
        <Link to="/signin" state={{ back: '/dashboard' }} className="btn-primary mt-6">Sign in</Link>
      </div>
    );
  }
  if (state.user.role === 'dealer') { nav('/dealer/dashboard'); return null; }

  const myGroups = state.joined.map(findGroup).filter(Boolean);
  const reservations = Object.entries(state.reservations);

  return (
    <div className="container-x py-12">
      <SectionHeading kicker="Buyer dashboard" title={`Namaste, ${state.user.name}`}
        sub="Your groups, reserved offers and next steps - all in one place." />

      {reservations.length > 0 && (
        <>
          <h2 className="mt-10 font-display text-xl font-extrabold text-brand-950">Reserved offers</h2>
          <div className="mt-4 space-y-4">
            {reservations.map(([offerId, r]) => {
              const g = findGroup(r.groupId);
              const o = g && g.offers.find((x) => x.id === offerId);
              if (!g || !o) return null;
              const car = carById(g.carId);
              return (
                <div key={offerId} className="card flex flex-wrap items-center justify-between gap-4 p-6">
                  <div>
                    <p className="font-display font-bold text-brand-950">{car.name} · {g.city}</p>
                    <p className="text-sm text-slate-500">{o.dealer}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-xl font-extrabold text-brand-900">{fmtINR(o.onRoad)}</p>
                    <Badge cls="bg-emerald-100 text-emerald-800">Reserved - no payment taken</Badge>
                  </div>
                  <div className="w-full rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                    Next step: the dealer shares your proforma invoice. Verify VIN + PDI before paying anything at the dealership.
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      <h2 className="mt-10 font-display text-xl font-extrabold text-brand-950">My groups ({myGroups.length})</h2>
      {myGroups.length === 0 ? (
        <div className="card mt-4 p-10 text-center">
          <p className="font-semibold text-slate-600">You haven't joined a group yet.</p>
          <p className="mt-1 text-sm text-slate-500">Joining is free and non-binding - it just adds your name to the buyer count dealers compete for.</p>
          <Link to="/groups" className="btn-primary mt-5">Browse live groups</Link>
        </div>
      ) : (
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {myGroups.map((g) => {
            const car = carById(g.carId);
            const best = bestOffer(g);
            const saving = savingsVsEstimate(g);
            const meta = STATUS_META[g.status];
            return (
              <Link key={g.id} to={`/groups/${g.id}`} className="card block p-6 transition hover:shadow-lift">
                <div className="flex items-center justify-between">
                  <Badge cls={meta.cls}>{meta.label}</Badge>
                  <Countdown deadline={g.deadline} />
                </div>
                <h3 className="mt-3 font-display text-lg font-bold text-brand-950">{car.name}</h3>
                <p className="text-sm text-slate-500">{g.city}</p>
                <div className="mt-4"><ProgressBar value={g.members} max={g.target} /></div>
                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                  <span className="text-slate-500">Lowest listed: <strong className="text-brand-900">{best ? fmtINR(best.onRoad) : 'awaiting bids'}</strong>{best?.variant ? ` · ${best.variant}` : ''}</span>
                  {saving > 0 && <Badge cls="bg-emerald-100 text-emerald-800">Save {fmtINR(saving)}*</Badge>}
                </div>
                {state.alerts[g.id] && <p className="mt-2 text-xs font-semibold text-brand-700">🔔 Price alerts on for this group</p>}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
