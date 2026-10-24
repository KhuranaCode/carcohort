import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { carById, estimateOnRoad, bestOffer, savingsVsEstimate, STATUS_META, CITY_UPLIFT } from '../data.js';
import { Badge, Countdown, ProgressBar, CarPhoto, Modal } from '../ui.jsx';
import { fmtINR, fmtDate, daysLeft } from '../utils.js';
import { useApp } from '../store.jsx';

const isExpired = (o) => !!o.validTill && o.validTill < new Date().toISOString().slice(0, 10);

export default function GroupDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { state, joinGroup, leaveGroup, reserveOffer, toggleAlert, findGroup, data } = useApp();
  const group = findGroup(id);
  // Buyer's own request for this model+city (if any) drives per-offer eligibility signals.
  const myRequest = state.user
    ? (data.requests || []).find((r) => r.carId === group?.carId && r.city === group?.city && (r.name || '').toLowerCase() === state.user.name.toLowerCase())
    : null;
  const [confirmOffer, setConfirmOffer] = useState(null);

  // Offers are only comparable within the same variant - group them so a
  // cheaper quote on a different variant never reads as the better deal.
  const variantGroups = useMemo(() => {
    if (!group) return [];
    const byVariant = new Map();
    for (const o of group.offers) {
      const key = (o.variant || '').trim() || 'Variant not specified';
      if (!byVariant.has(key)) byVariant.set(key, []);
      byVariant.get(key).push(o);
    }
    return [...byVariant.entries()]
      .map(([variant, list]) => ({ variant, offers: [...list].sort((a, b) => a.onRoad - b.onRoad) }))
      .sort((a, b) => a.offers[0].onRoad - b.offers[0].onRoad);
  }, [group]);
  const offers = useMemo(() => variantGroups.flatMap((v) => v.offers), [variantGroups]);

  if (!group) {
    return <div className="container-x py-24 text-center"><p className="text-slate-500">Group not found.</p><Link to="/groups" className="btn-primary mt-4">Back to groups</Link></div>;
  }

  const car = carById(group.carId);
  const joined = state.joined.includes(group.id);
  const members = group.members;
  const meta = STATUS_META[group.status];
  const est = estimateOnRoad(car, group.city);
  const saving = savingsVsEstimate(group);
  const alertOn = !!state.alerts[group.id];

  const onJoin = () => {
    if (!state.user) { nav('/signin', { state: { back: `/groups/${group.id}` } }); return; }
    joined ? leaveGroup(group.id) : joinGroup(group.id);
  };

  return (
    <div className="container-x py-10">
      <Link to="/groups" className="text-sm font-semibold text-brand-700 hover:underline">← All groups</Link>

      {/* Header */}
      <div className="card mt-4 overflow-hidden">
        <div className="grid lg:grid-cols-5">
          <div className="bg-gradient-to-br from-ink-700 to-ink-950 p-8 text-white lg:col-span-2">
            <div className="flex items-center gap-2"><Badge cls={meta.cls}>{meta.label}</Badge><Countdown deadline={group.deadline} /></div>
            <h1 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-white">{car.name}</h1>
            <p className="mt-1 text-white/65">{car.body} · {car.fuel}{group.deliveryBy ? ` · requested delivery by ${fmtDate(group.deliveryBy)}` : ''}</p>
            <CarPhoto car={car} className="mx-auto mt-4 w-full max-w-sm" />
            <p className="mt-2 text-center text-xs text-slate-400">Ex-showroom {fmtINR(car.exMin)} - {fmtINR(car.exMax)} (indicative)</p>
          </div>
          <div className="p-8 lg:col-span-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="font-display text-2xl font-extrabold text-brand-950">{group.city} buyer group</h2>
              <div className="flex flex-col items-end gap-1.5"><Badge cls="bg-brand-50 text-brand-800">Closes {fmtDate(group.deadline)}</Badge>{group.invited ? <Badge cls="bg-slate-100 text-slate-600">{group.invited} dealers invited to bid</Badge> : null}</div>
            </div>
            <div className="mt-6 max-w-md"><ProgressBar value={members} max={group.target} /></div>
            <div className="mt-6 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-slate-50 p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Est. on-road ({group.city})</p><p className="font-display text-lg font-extrabold text-slate-700">{fmtINR(est)}</p></div>
              <div className="rounded-xl bg-emerald-50 p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">Lowest listed offer</p><p className="font-display text-lg font-extrabold text-emerald-700">{offers.length ? fmtINR(offers[0].onRoad) : 'Awaiting bids'}</p>{offers.length > 0 && <p className="mt-0.5 text-[11px] text-emerald-600">{offers[0].variant || 'Variant not specified'} - check it matches your request</p>}</div>
              <div className="rounded-xl bg-amber-50 p-4"><p className="text-[11px] font-semibold uppercase tracking-wide text-amber-600">Indicative saving</p><p className="font-display text-lg font-extrabold text-amber-700">{saving > 0 ? fmtINR(saving) : '-'}</p></div>
            </div>
            <p className="mt-3 text-[11px] text-slate-400">Estimates use an indicative {Math.round((CITY_UPLIFT[group.city] || 0.13) * 100)}% on-road uplift for {group.city}. Final prices come only from dealer offers. Savings are never guaranteed.</p>
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={onJoin} className={joined ? 'btn-ghost' : 'btn-primary'}>
                {joined ? 'Leave group' : state.user ? 'Join this group - free' : 'Sign in to join - free'}
              </button>
              <button onClick={() => toggleAlert(group.id)} className="btn-ghost">
                {alertOn ? '🔔 Price alerts on' : '🔕 Get price alerts'}
              </button>
            </div>
            {joined && <p className="mt-3 text-sm text-emerald-700">You're buyer #{members} in this group. Joining is non-binding - you only buy if you pick an offer.</p>}
          </div>
        </div>
      </div>

      {/* Offers */}
      <h2 className="mt-12 font-display text-2xl font-extrabold text-brand-950">Dealer offers <span className="text-base font-semibold text-slate-400">({offers.length} · fictional sample offers)</span></h2>
      <p className="mt-2 max-w-2xl text-sm text-slate-500">Each offer names the exact variant it covers. Compare like-for-like - a lower price on a different variant is not the same deal. Your request's variant, budget and delivery date are what dealers bid against.</p>
      {offers.length === 0 ? (
        <div className="card mt-4 p-8 text-center text-slate-500">
          <p className="font-semibold">No offers yet.</p>
          <p className="mt-1 text-sm">We take this group to partner dealerships as it grows. Dealers start bidding once the buyer count is worth competing for.</p>
        </div>
      ) : (
        <div className="mt-4 space-y-8">
          {variantGroups.map((vg) => (
          <div key={vg.variant}>
            <h3 className="font-display text-sm font-bold uppercase tracking-wide text-slate-500">Variant: <span className="text-brand-900">{vg.variant}</span></h3>
            <div className="mt-3 space-y-4">
          {vg.offers.map((o, i) => {
            const reserved = !!state.reservations[o.id];
            return (
              <div key={o.id} className={`card p-6 ${i === 0 ? 'ring-2 ring-emerald-400' : ''}`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-lg font-bold text-brand-950">{o.dealer}</h3>
                      {i === 0 && vg.offers.length > 1 && <Badge cls="bg-emerald-100 text-emerald-800">Lowest listed on-road (this variant)</Badge>}
                      {i === 0 && vg.offers.length === 1 && <Badge cls="bg-slate-100 text-slate-600">Only offer for this variant</Badge>}
                      {myRequest && (() => {
                        const want = (myRequest.variantText || '').trim().toLowerCase();
                        const got = (o.variant || '').trim().toLowerCase();
                        if (!want) return <Badge cls="bg-slate-100 text-slate-600">Variant unconfirmed on your request - confirm before comparing</Badge>;
                        if (want !== got) return <Badge cls="bg-amber-100 text-amber-800">Different variant than your request ({myRequest.variantText}) - not directly comparable</Badge>;
                        return (
                          <>
                            <Badge cls="bg-emerald-100 text-emerald-800">Matches your requested variant</Badge>
                            {o.onRoad <= myRequest.budget
                              ? <Badge cls="bg-emerald-100 text-emerald-800">Within your {fmtINR(myRequest.budget)} budget</Badge>
                              : <Badge cls="bg-amber-100 text-amber-800">Above your {fmtINR(myRequest.budget)} budget</Badge>}
                            {group.deliveryBy && myRequest.deliveryBy && group.deliveryBy > myRequest.deliveryBy
                              && <Badge cls="bg-amber-100 text-amber-800">Group delivery later than your {fmtDate(myRequest.deliveryBy)}</Badge>}
                          </>
                        );
                      })()}
                      {o.mine && <Badge cls="bg-brand-50 text-brand-800">Your offer</Badge>}
                    </div>
                    <p className="mt-0.5 text-xs text-slate-500">★ {o.rating} dealer rating (unverified sample) · valid till {fmtDate(o.validTill)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Final on-road price</p>
                    <p className="font-display text-2xl font-extrabold text-brand-900">{fmtINR(o.onRoad)}</p>
                    {est > o.onRoad && <p className="text-xs font-semibold text-emerald-600">{fmtINR(est - o.onRoad)} below estimate</p>}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {o.inclusions.map((inc) => <Badge key={inc} cls="bg-slate-100 text-slate-700">{inc}</Badge>)}
                </div>
                {o.breakdown ? (
                  <p className="mt-3 text-xs text-slate-400">
                    Itemised by the dealer: ex-showroom {fmtINR(o.breakdown.exShowroom)} · RTO {fmtINR(o.breakdown.rto)} · insurance {fmtINR(o.breakdown.insurance)} · other {fmtINR(o.breakdown.other)}
                  </p>
                ) : (
                  <p className="mt-3 text-xs font-semibold text-amber-400">Not itemised. Before relying on this price, ask the dealer in writing for ex-showroom, RTO, insurance and any accessories or fees.</p>
                )}
                {o.note && <p className="mt-3 text-sm italic text-slate-500">"{o.note}"</p>}
                <div className="mt-5 flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                  {isExpired(o) ? (
                    <Badge cls="bg-slate-700 text-slate-200 !px-4 !py-2">Offer expired {fmtDate(o.validTill)} - ask for a fresh quote</Badge>
                  ) : reserved ? (
                    <Badge cls="bg-emerald-600 text-white !px-4 !py-2">✓ Reserved (demo) - in a live launch the dealer would contact you</Badge>
                  ) : (
                    <button className="btn-primary !py-2.5" onClick={() => {
                      if (!state.user) { nav('/signin', { state: { back: `/groups/${group.id}` } }); return; }
                      setConfirmOffer(o);
                    }}>Reserve this offer</button>
                  )}
                  <span className="self-center text-xs text-slate-400">Reservation is free, non-binding, and involves no payment on CarCohort.</span>
                </div>
              </div>
            );
          })}
            </div>
          </div>
          ))}
        </div>
      )}

      {/* How the rest of the deal works */}
      <div className="card mt-12 p-8">
        <h3 className="font-display text-xl font-extrabold text-brand-950">After you reserve <span className="text-sm font-semibold text-slate-400">(proposed live flow)</span></h3>
        <ol className="mt-4 space-y-3 text-sm text-slate-600">
          {[
            'The dealership contacts you directly with the proforma invoice for the final on-road price you saw here.',
            'You verify the VIN and manufacturing date, and the PDI checklist is completed with you before registration.',
            'Payment, finance and registration happen directly between you and the dealership - CarCohort never touches your money.',
            'If the car fails inspection or the dealer changes the price, the deal is off and the dealer risks losing the whole group.',
          ].map((t, i) => (
            <li key={i} className="flex gap-3"><span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-700">{i + 1}</span>{t}</li>
          ))}
        </ol>
      </div>

      {confirmOffer && (
        <Modal title="Reserve this offer?" onClose={() => setConfirmOffer(null)}>
          <p className="text-sm text-slate-600">
            You're reserving <strong>{confirmOffer.dealer}</strong>'s offer of <strong>{fmtINR(confirmOffer.onRoad)}</strong> on-road
            for the {car.name} ({group.city} group).
          </p>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>· Free and non-binding - no payment on CarCohort, ever</li>
            <li>· Demo only: nothing is held for you. The offer states a validity date of {fmtDate(confirmOffer.validTill)}; a live launch would need the dealer's written commitment</li>
            <li>· You complete PDI and payment directly at the dealership</li>
          </ul>
          <button className="btn-primary mt-6 w-full" onClick={() => { reserveOffer(confirmOffer.id, group.id); setConfirmOffer(null); }}>
            Confirm reservation
          </button>
        </Modal>
      )}
    </div>
  );
              }
