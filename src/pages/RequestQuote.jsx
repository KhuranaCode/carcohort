import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CITIES, carById, variantTiers, TYPE_META } from '../data.js';
import { Badge, SectionHeading } from '../ui.jsx';
import { fmtINR, fmtDate } from '../utils.js';
import { useApp } from '../store.jsx';

export default function RequestQuote() {
  const { state, data, apiMode } = useApp();
  const nav = useNavigate();
  const [type, setType] = useState('car');
  const [carId, setCarId] = useState('');
  const [variant, setVariant] = useState('mid');
  const [variantText, setVariantText] = useState('');
  const [city, setCity] = useState('Mumbai');
  const [budget, setBudget] = useState('');
  const [deliveryBy, setDeliveryBy] = useState('');
  const [done, setDone] = useState(null);
  const [error, setError] = useState('');

  const models = useMemo(() => data.cars.filter((c) => c.type === type), [data.cars, type]);
  const car = carId ? carById(carId) : null;
  const tiers = car ? variantTiers(car) : [];

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!state.user) { nav('/signin', { state: { back: '/request' } }); return; }
    const payload = { name: state.user.name, carId, variant, variantText: variantText.trim(), city, budget, deliveryBy };
    if (apiMode) {
      try {
        const r = await fetch('/api/requests', {
          method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify(payload),
        });
        const body = await r.json();
        if (!r.ok) throw new Error(body.error || 'request failed');
        setDone({ ...body.request, matchedGroup: body.groupId, created: body.created });
        return;
      } catch (err) { setError(err.message); return; }
    }
    setDone({ ...payload, id: 'local-demo', matchedGroup: data.groups.find((g) => g.carId === carId && g.city === city)?.id || null, created: false });
  };

  if (done) {
    const c = carById(done.carId);
    return (
      <div className="container-x max-w-2xl py-16">
        <div className="card p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
          </div>
          <h1 className="mt-5 font-display text-2xl font-extrabold text-brand-950">Quote request saved</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            {c.name} · {variantTiers(c).find((v) => v.id === done.variant)?.label} · {done.city} ·
            budget {fmtINR(Number(done.budget))} · requested delivery by {fmtDate(done.deliveryBy)}.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-slate-600">
            In a live launch, partner dealerships would now be invited to bid their best final
            on-road price against your exact variant, budget and delivery date - and you would
            see the lowest comparable offer first, with charges and delivery terms listed.
          </p>
          {done.matchedGroup ? (
            <div className="mt-6 rounded-xl bg-brand-50 p-4 text-sm text-brand-900">
              {done.created
                ? `Your request started a brand-new buyer group for this model in ${done.city} - you are buyer #1.`
                : `A buyer group already exists for this model in ${done.city}.`}
              <Link to={`/groups/${done.matchedGroup}`} className="btn-primary mt-3 w-full">
                {done.created ? 'View your new group' : 'View the group'}
              </Link>
            </div>
          ) : (
            <p className="mt-6 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
              In this static demo mode your request is saved locally only.
            </p>
          )}
          <Link to="/groups" className="btn-ghost mt-6">Browse sample groups</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-x max-w-3xl py-12">
      <SectionHeading kicker="Buyer request" title="Tell dealers exactly what you want"
        sub="Pick your vehicle, exact variant, budget and delivery date. Dealers then bid against your request - you see the lowest comparable final on-road price first. Demo: requests save to the local server only; no real dealer is contacted." />
      <form onSubmit={submit} className="card mt-8 space-y-6 p-8">
        <div>
          <label className="label">Vehicle type</label>
          <div className="grid grid-cols-4 gap-2">
            {Object.entries(TYPE_META).map(([t, m]) => (
              <button type="button" key={t} onClick={() => { setType(t); setCarId(''); }}
                className={`rounded-xl border-2 px-2 py-2.5 text-sm font-semibold transition ${type === t ? 'border-brand-600 bg-brand-50 text-brand-900' : 'border-slate-200 text-slate-500 hover:border-brand-300'}`}>
                {m.label}
              </button>
            ))}
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label">Model</label>
            <select className="input" value={carId} onChange={(e) => setCarId(e.target.value)} required>
              <option value="" disabled>Select model</option>
              {models.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Variant</label>
            <select className="input" value={variant} onChange={(e) => setVariant(e.target.value)} disabled={!car}>
              {tiers.map((v) => <option key={v.id} value={v.id}>{v.label} (~{fmtINR(v.ex)} ex-showroom)</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Exact variant name (as the brochure calls it)</label>
            <input className="input" placeholder="e.g. SX(O) Petrol DCT - offers are matched against this" value={variantText} onChange={(e) => setVariantText(e.target.value)} />
            <p className="mt-1 text-[11px] text-slate-400">Dealer offers name the exact variant they cover; we only mark an offer eligible for you when this matches.</p>
          </div>
          <div>
            <label className="label">Registration city</label>
            <select className="input" value={city} onChange={(e) => setCity(e.target.value)}>
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Your budget / max you can pay (₹)</label>
            <input className="input" inputMode="numeric" placeholder="e.g. 1700000" value={budget} onChange={(e) => setBudget(e.target.value)} required />
          </div>
          <div>
            <label className="label">Requested delivery by</label>
            <input className="input" type="date" value={deliveryBy} onChange={(e) => setDeliveryBy(e.target.value)} required />
          </div>
        </div>
        {car && (
          <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
            {car.name} · {car.body} · {car.fuel} · indicative ex-showroom {fmtINR(car.exMin)}-{fmtINR(car.exMax)}.
            Dealers quote final on-road prices for {city}; discounts depend on actual offers and are never guaranteed.
          </div>
        )}
        {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
        <button className="btn-primary w-full !py-3.5" type="button" onClick={(e) => { const f = e.currentTarget.form; if (f && f.reportValidity()) f.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true })); }}>
          {state.user ? 'Save request & invite dealer bids (demo)' : 'Sign in to submit your request'}
        </button>
      </form>
    </div>
  );
}
