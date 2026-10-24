import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CITIES, TYPE_META, variantTiers, estimateOnRoad, CITY_UPLIFT, bestOffer, savingsVsEstimate } from '../data.js';
import { PHOTOS, CREDITS, SHOWN } from '../photos.js';
import { useApp } from '../store.jsx';
import { Badge, Countdown, ProgressBar, SectionHeading } from '../ui.jsx';
import { Reveal } from '../cinematic.jsx';
import { fmtINR, fmtDate } from '../utils.js';

// Vehicle detail - everything here derives from the demo catalogue entry
// (src/data.js) and the verified photo set (src/photos.js). Prices stay
// labelled indicative; on-road figures are estimates from sample uplifts.
export default function CarDetail() {
  const { id } = useParams();
  const { data } = useApp();
  const car = data.cars.find((c) => c.id === id);
  const [city, setCity] = useState(CITIES[0]);

  const groups = useMemo(() => (car ? data.groups.filter((g) => g.carId === car.id) : []), [data.groups, car]);

  if (!car) {
    return (
      <div className="container-x py-24 text-center">
        <SectionHeading center kicker="Not found" title="No such vehicle in the demo catalogue" />
        <Link to="/cars" className="btn-primary mt-6">Back to the catalogue</Link>
      </div>
    );
  }

  const photo = PHOTOS[car.id];
  const credit = CREDITS[car.id];
  const tiers = variantTiers(car);
  const onRoad = estimateOnRoad(car, city);
  const related = data.cars.filter((c) => c.id !== car.id && (c.body === car.body || c.type === car.type)).slice(0, 3);

  return (
    <div>
      {/* presentation hero */}
      <section className="relative overflow-hidden bg-paper">
        <div className="container-x grid items-center gap-10 py-12 lg:grid-cols-[1.2fr_1fr] lg:py-16">
          <Reveal>
            <div className="relative overflow-hidden rounded-2xl border border-ink-900/10">
              {photo ? (
                <div className="mask-reveal">
                  <img src={photo} alt={`${car.name} photograph (${SHOWN[car.id]})`} className="aspect-[16/10] w-full object-cover" fetchpriority="high" />
                </div>
              ) : (
                <div className="flex aspect-[16/10] items-center justify-center border border-dashed border-ink-900/15 bg-paper-deep px-6 text-center text-sm text-slate-400">
                  {car.name}: no verified, openly licensed photo yet - shown as a labelled placeholder rather than the wrong car.
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 to-transparent" />
              {photo && credit && (
                <p className="absolute bottom-3 left-4 right-4 rounded bg-ink-950/70 px-2 py-1.5 text-[10px] leading-tight text-white/90 backdrop-blur-sm">
                  Photo shows: {SHOWN[car.id]} · {credit.author} · {credit.license} · <Link className="underline" to="/credits">credits</Link>
                </p>
              )}
            </div>
          </Reveal>
          <Reveal delay={100}>
            <p className="kicker">{TYPE_META[car.type]?.label} · {car.body}</p>
            <h1 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink-900 sm:text-5xl">{car.name}</h1>
            <p className="mt-2 text-sm text-slate-500">{car.brand} · {car.fuel}</p>
            <p className="mt-5 font-display text-2xl font-extrabold text-brand-900">
              {fmtINR(car.exMin)} - {fmtINR(car.exMax)}
              <span className="ml-2 align-middle text-xs font-semibold text-slate-400">ex-showroom, indicative demo figures</span>
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="card !rounded-xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Fuel</p>
                <p className="mt-1 font-display text-lg font-extrabold text-ink-900">{car.fuel}</p>
              </div>
              <div className="card !rounded-xl p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Seats</p>
                <p className="mt-1 font-display text-lg font-extrabold text-ink-900">{car.seats}</p>
              </div>
            </div>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link to="/groups" className="btn-accent !px-7 !py-3.5">Find a buying group</Link>
              <Link to="/request" className="btn-ghost !px-7 !py-3.5">Request a quote</Link>
              <Link to="/compare" className="btn-ghost !px-7 !py-3.5">Compare offers</Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* variant tiers + on-road estimator */}
      <section className="border-t border-ink-900/10 bg-paper-deep py-16">
        <div className="container-x grid gap-10 lg:grid-cols-2">
          <Reveal>
            <SectionHeading kicker="Variants" title="Three indicative tiers"
              sub="Derived from the public ex-showroom range for this model. Actual variant names, features and prices differ by dealer and city." />
            <div className="mt-8 overflow-hidden rounded-xl border border-ink-900/10">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-ink-900/10 bg-paper text-xs uppercase tracking-wide text-slate-400">
                    <th className="px-5 py-3">Tier</th>
                    <th className="px-5 py-3">Ex-showroom (indicative)</th>
                  </tr>
                </thead>
                <tbody>
                  {tiers.map((v) => (
                    <tr key={v.id} className="border-b border-ink-900/5 last:border-0">
                      <td className="px-5 py-4 font-semibold text-ink-900">{v.label}</td>
                      <td className="px-5 py-4 font-display font-extrabold text-brand-900">{fmtINR(v.ex)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
          <Reveal delay={120}>
            <SectionHeading kicker="On-road estimate" title="What it could cost in your city"
              sub="Mid-tier variant plus a sample uplift for road tax, registration and insurance. An estimate for orientation - not a quote." />
            <div className="card mt-8 p-6">
              <label className="label" htmlFor="city-est">City of registration</label>
              <select id="city-est" className="input" value={city} onChange={(e) => setCity(e.target.value)}>
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
              <div className="mt-5 flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Estimated on-road, mid tier</p>
                  <p className="mt-1 font-display text-3xl font-extrabold text-ink-900">{fmtINR(onRoad)}</p>
                </div>
                <Badge cls="bg-slate-100 text-slate-600">+{Math.round((CITY_UPLIFT[city] ?? 0.13) * 1000) / 10}% sample uplift</Badge>
              </div>
              <p className="mt-4 text-xs leading-relaxed text-slate-500">
                Real on-road prices vary by variant, insurer and RTO. Group offers are quoted as final on-road prices so comparisons stay honest.
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* groups for this vehicle */}
      <section className="border-t border-ink-900/10 bg-paper py-16">
        <div className="container-x">
          <SectionHeading kicker="Sample buying groups" title={`Groups forming for the ${car.name}`}
            sub="Fictional demo groups. Joining is free and non-binding; dealers would then bid a final on-road price for the whole group." />
          {groups.length === 0 ? (
            <div className="card mt-8 p-10 text-center">
              <p className="font-semibold text-slate-500">No sample group for this vehicle yet.</p>
              <Link to="/request" className="btn-primary mt-5">Request a quote instead</Link>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {groups.map((g) => {
                const best = bestOffer(g);
                const saving = savingsVsEstimate(g);
                return (
                  <Reveal key={g.id}>
                    <Link to={`/groups/${g.id}`} className="card group block p-6 transition hover:shadow-lift">
                      <div className="flex items-center justify-between">
                        <p className="font-display text-lg font-extrabold text-ink-900">{g.city}</p>
                        <Countdown deadline={g.deadline} />
                      </div>
                      <div className="mt-4"><ProgressBar value={g.members} max={g.target} /></div>
                      <div className="mt-4 flex items-end justify-between border-t border-ink-900/10 pt-4">
                        {best ? (
                          <div>
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Lowest listed (on-road)</p>
                            <p className="font-display text-xl font-extrabold text-brand-900">{fmtINR(best.onRoad)}</p>
                            {best.variant && <p className="mt-0.5 text-[11px] font-semibold text-brand-600">{best.variant}</p>}
                          </div>
                        ) : <p className="text-sm font-semibold text-slate-500">Offers open as the group grows</p>}
                        {saving > 0 && <Badge cls="bg-emerald-100 text-emerald-800">Save {fmtINR(saving)}*</Badge>}
                      </div>
                      <p className="mt-3 text-[11px] text-slate-400">{g.offers.length} fictional offer{g.offers.length === 1 ? '' : 's'} · delivery target {fmtDate(g.deliveryBy)} · *indicative</p>
                      <span className="mt-3 inline-block text-xs font-bold uppercase tracking-[0.18em] text-ink-900 group-hover:text-brand-300">View group →</span>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* related */}
      {related.length > 0 && (
        <section className="border-t border-ink-900/10 bg-paper-deep py-16">
          <div className="container-x">
            <SectionHeading kicker="Keep looking" title="Similar vehicles" />
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((c) => (
                <Link key={c.id} to={`/cars/${c.id}`} className="card group overflow-hidden transition hover:shadow-lift">
                  {PHOTOS[c.id] && <img src={PHOTOS[c.id]} alt={`${c.name} photograph`} loading="lazy" className="aspect-[16/9] w-full object-cover transition duration-700 group-hover:scale-[1.04]" />}
                  <div className="p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-300">{c.body} · {c.fuel}</p>
                    <p className="mt-1 font-display text-lg font-extrabold text-ink-900">{c.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{fmtINR(c.exMin)} - {fmtINR(c.exMax)} ex-showroom</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
