import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { carById, bestOffer } from '../data.js';
import { Badge, Countdown, SectionHeading } from '../ui.jsx';
import { fmtINR } from '../utils.js';
import { useApp } from '../store.jsx';

function OfferForm({ group, onDone }) {
  const { state, submitOffer } = useApp();
  const [onRoad, setOnRoad] = useState('');
  const [variant, setVariant] = useState('');
  const [inclusions, setInclusions] = useState('');
  const [validTill, setValidTill] = useState(group.deadline);
  const [note, setNote] = useState('');
  const [bdError, setBdError] = useState('');
  const [bd, setBd] = useState({ exShowroom: '', rto: '', insurance: '', other: '' });
  const car = carById(group.carId);

  return (
    <form className="mt-4 space-y-4 rounded-xl bg-slate-50 p-5" onSubmit={(e) => {
      e.preventDefault();
      const price = parseInt(onRoad.replace(/[^0-9]/g, ''), 10);
      if (!price) return;
      const num = (v) => parseInt(String(v).replace(/[^0-9]/g, ''), 10) || 0;
      const any = Object.values(bd).some((v) => String(v).trim());
      const breakdown = any ? { exShowroom: num(bd.exShowroom), rto: num(bd.rto), insurance: num(bd.insurance), other: num(bd.other) } : undefined;
      if (breakdown && Math.abs(breakdown.exShowroom + breakdown.rto + breakdown.insurance + breakdown.other - price) > 1) {
        setBdError('The itemised charges must add up to the final on-road price.');
        return;
      }
      setBdError('');
      submitOffer(group.id, {
        id: `my-${group.id}-${Date.now()}`,
        dealer: `${state.user.name} (demo dealer)`,
        variant,
        onRoad: price,
        inclusions: inclusions.split(',').map((s) => s.trim()).filter(Boolean),
        breakdown,
        validTill,
        rating: 4.0,
        note,
        mine: true,
      });
      setOnRoad(''); setVariant(''); setInclusions(''); setNote('');
      onDone && onDone();
    }}>
      <p className="text-sm font-bold text-brand-950">Your bid for the {car.name} · {group.city} group</p>
      <div>
        <label className="label">Exact variant this bid covers</label>
        <input className="input" placeholder="e.g. SX(O) Petrol DCT" value={variant} onChange={(e) => setVariant(e.target.value)} required />
        <p className="mt-1 text-[11px] text-slate-400">Bids are compared like-for-like - buyers match the variant before comparing prices.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Final on-road price (₹)</label>
          <input className="input" inputMode="numeric" placeholder="e.g. 1639000" value={onRoad} onChange={(e) => setOnRoad(e.target.value)} required />
        </div>
        <div>
          <label className="label">Offer valid till</label>
          <input className="input" type="date" value={validTill} onChange={(e) => setValidTill(e.target.value)} required />
        </div>
      </div>
      <fieldset className="rounded-lg border border-slate-200 p-3">
        <legend className="px-1 text-xs font-semibold text-slate-500">Itemised charges (optional but recommended - must add up to the on-road price)</legend>
        <div className="grid gap-3 sm:grid-cols-4">
          {[['exShowroom', 'Ex-showroom'], ['rto', 'RTO / road tax'], ['insurance', 'Insurance'], ['other', 'Other / accessories']].map(([k, l]) => (
            <div key={k}>
              <label className="label">{l} (₹)</label>
              <input className="input" inputMode="numeric" value={bd[k]} onChange={(e) => setBd({ ...bd, [k]: e.target.value })} />
            </div>
          ))}
        </div>
        {bdError && <p role="alert" className="mt-2 text-xs font-semibold text-red-400">{bdError}</p>}
      </fieldset>
      <div>
        <label className="label">Inclusions (comma separated)</label>
        <input className="input" placeholder="1st year insurance free, extended warranty, accessories kit" value={inclusions} onChange={(e) => setInclusions(e.target.value)} />
      </div>
      <div>
        <label className="label">Note to the group (optional)</label>
        <input className="input" placeholder="Priority delivery within 2 weeks" value={note} onChange={(e) => setNote(e.target.value)} />
      </div>
      <button className="btn-primary w-full" type="button" onClick={(e) => { const f = e.currentTarget.form; if (f && f.reportValidity()) f.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })); }}>Submit bid to {group.members} buyers</button>
    </form>
  );
}

export default function DealerDashboard() {
  const { state, data } = useApp();
  const nav = useNavigate();
  const [openForm, setOpenForm] = useState(null);

  if (!state.user || state.user.role !== 'dealer') {
    return (
      <div className="container-x py-24 text-center">
        <SectionHeading center kicker="Dealer portal" title="Sign in as a dealer to bid on groups" />
        <Link to="/signin" state={{ back: '/dealer/dashboard', role: 'dealer' }} className="btn-primary mt-6">Dealer sign in</Link>
      </div>
    );
  }

  const myCount = data.groups.reduce((a, g) => a + g.offers.filter((o) => o.mine).length, 0);

  return (
    <div className="container-x py-12">
      <SectionHeading kicker="Dealer portal" title={`Welcome, ${state.user.name}`}
        sub={`${data.groups.length} sample groups are open for bidding (fictional demo data). You have placed ${myCount} bid${myCount === 1 ? '' : 's'}.`} />
      <div className="mt-10 space-y-6">
        {data.groups.map((g) => {
          const car = carById(g.carId);
          const best = bestOffer(g);
          const mine = g.offers.filter((o) => o.mine);
          return (
            <div key={g.id} className="card p-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="font-display text-lg font-bold text-brand-950">{car.name} <span className="font-sans text-sm font-semibold text-slate-400">· {g.city}</span></h3>
                  <p className="text-sm text-slate-500">Ex-showroom {fmtINR(car.exMin)}-{fmtINR(car.exMax)} · {g.offers.length} bid{g.offers.length === 1 ? '' : 's'} placed{g.deliveryBy ? ` · buyers want delivery by ${g.deliveryBy}` : ''}</p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="font-display text-2xl font-extrabold text-brand-900">{g.members}<span className="text-sm text-slate-400">/{g.target}</span></p>
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">ready buyers</p>
                  </div>
                  <Countdown deadline={g.deadline} />
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                {best && <Badge cls="bg-emerald-100 text-emerald-800">Bid to beat: {fmtINR(best.onRoad)} on-road</Badge>}
                {!best && <Badge cls="bg-sky-100 text-sky-800">No bids yet - first mover wins attention</Badge>}
                <button className="btn-primary !px-4 !py-2 !text-xs" onClick={() => setOpenForm(openForm === g.id ? null : g.id)}>
                  {openForm === g.id ? 'Close bid form' : 'Place a bid'}
                </button>
              </div>
              {mine.length > 0 && (
                <div className="mt-4 space-y-2">
                  {mine.map((o) => (
                    <div key={o.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-brand-50 px-4 py-3 text-sm">
                      <span className="font-semibold text-brand-900">Your bid: {fmtINR(o.onRoad)}</span>
                      <span className="text-slate-500">{o.inclusions.join(' · ') || 'No inclusions listed'}</span>
                    </div>
                  ))}
                </div>
              )}
              {openForm === g.id && <OfferForm group={g} onDone={() => setOpenForm(null)} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}
