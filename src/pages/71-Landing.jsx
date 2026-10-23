import { Link } from 'react-router-dom';
import { CITIES, savingsVsEstimate, carById, bestOffer } from '../data.js';
import { HorizontalJourney, Reveal, CountUp, Rail, useMagnetic } from '../cinematic.jsx';
import { useApp } from '../store.jsx';
import { PHOTOS, CREDITS, SHOWN } from '../photos.js';
import { SectionHeading, Countdown, ProgressBar, Badge, CarPhoto } from '../ui.jsx';
import { fmtINR } from '../utils.js';
import { GroupCard } from './Groups.jsx';

const FAQS = [
  { q: 'Is a discount guaranteed if I join a group?', a: 'No. Group buying gives dealers a reason to compete, and that usually produces better offers than a solo walk-in - but the final discount always depends on the actual offers dealers make. We show you every offer transparently and you decide. If no offer is worth it, you walk away free of charge.' },
  { q: 'Is this car sharing or fractional ownership?', a: 'No. Every buyer in a group buys and fully owns their own new car, registered in their own name, delivered by an authorised dealership. The group only exists to negotiate price. This is not co-ownership, leasing or subscription.' },
  { q: 'What if the group does not reach its target size?', a: 'Dealers bid on the group as it grows. If a group stays small, offers may be weaker or dealers may not bid at all - in that case the group simply expires at its deadline and nobody is charged or committed to anything.' },
  { q: 'How do I know the car is not defective or tampered with?', a: 'Every group deal includes a documented pre-delivery inspection (PDI) and VIN verification before you accept the car. You inspect the vehicle at the dealership before registration, and you can reject a car that fails inspection. Dealers on the platform know a failed PDI is visible to the whole group.' },
  { q: 'What does CarCohort charge buyers?', a: 'Nothing. Buyers join groups and compare offers for free. CarCohort earns a success fee from the dealership for each car a group member actually buys - the same way dealers already pay brokers and lead platforms, except the competition happens in the open.' },
  { q: 'Why is the on-road price so much higher than ex-showroom?', a: 'A large part of an Indian car\'s price is tax: GST and compensation cess are levied by the central government, and each state adds its own road tax and registration charges, plus insurance. That is why every offer on CarCohort is quoted as a final on-road price for your city - it is the only number that matters.' },
];

const STEPS = [
  { n: '01', t: 'Pick your vehicle and city', d: 'Tell us which model you want and where you will register it. Browse live groups or start a new one in seconds.' },
  { n: '02', t: 'Join the buyer group', d: 'You join other buyers who want the same car in your city. Joining is free and non-binding - it simply adds your name to the buyer count dealers see.' },
  { n: '03', t: 'Dealers compete for the group', d: 'We take the group to partner dealerships: "20 ready buyers - what is your best on-road price?" Dealers bid against each other, not against you.' },
  { n: '04', t: 'Compare, choose, buy - or walk away', d: 'Every offer lands as a final on-road price with inclusions listed. Pick the best one, do your PDI, and buy directly from the dealer. No obligation if nothing fits.' },
];

function Magnetic({ to, className, children, href }) {
  const ref = useMagnetic();
  return href
    ? <a ref={ref} href={href} className={className}>{children}</a>
    : <Link ref={ref} to={to} className={className}>{children}</Link>;
}

const cr = (k) => `${SHOWN[k]} · ${CREDITS[k].author} (${CREDITS[k].license})`;
const img_hero = PHOTOS.thar, img_discover = PHOTOS.baleno, img_perf = PHOTOS.xuv700, img_lux = PHOTOS.innova, img_ev = PHOTOS['nexon-ev'], img_deal = PHOTOS.punch, img_group = PHOTOS.creta;
const fmtCr = (n) => fmtINR(n);
const carLine = (c) => `${fmtINR(c.exMin)} - ${fmtINR(c.exMax)} ex-showroom`;

function Spec({ k, v }) {
  return (
    <div className="border-l border-white/20 pl-4" data-rise>
      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/50">{k}</p>
      <p className="mt-1 font-display text-xl font-extrabold text-white sm:text-2xl">{v}</p>
    </div>
  );
}

function ModelRow({ ids }) {
  return (
    <div className="mt-8 grid gap-3 sm:grid-cols-3" >
      {ids.map((id, ix) => {
        const c = carById(id);
        return (
          <Link key={id} to="/cars" className={`glass group rounded-xl p-4 transition hover:border-white/40 ${ix > 1 ? 'max-sm:hidden' : ''}`} data-rise>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-300">{c.body}</p>
            <p className="mt-1 font-display text-lg font-extrabold text-white">{c.name}</p>
            <p className="mt-2 text-xs text-white/70">{carLine(c)} (indicative demo)</p>
          </Link>
        );
      })}
    </div>
  );
}

function journeyPanels(groups, cars) {
  const featured = [...groups].sort((a, b) => b.members / b.target - a.members / a.target).slice(0, 3);
  return [
    { id: 'discover', credit: cr('baleno'), kicker: 'Discover', image: img_discover, content: (
      <div className="max-w-5xl">
        <p className="kicker" data-rise>01 · Discover</p>
        <h2 className="display-xl mt-4 text-[13vw] text-white sm:text-[9vw] lg:text-[7.4vw]" data-speed="0.6">Drive something<br /><span className="text-brand-400">different.</span></h2>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75" data-rise>Cars, bikes, scooters and EVs. Pick what you want, pick your city, and join other buyers who want the same thing.</p>
      </div>) },
    { id: 'power', credit: cr('xuv700'), kicker: 'Power & presence', image: img_perf, content: (
      <div className="max-w-5xl">
        <p className="kicker" data-rise>02 · Power</p>
        <h2 className="display-xl mt-4 text-[11vw] text-white sm:text-[7vw] lg:text-[5.6vw]" data-speed="0.5">Built for the<br />open road.</h2>
        <div className="mt-8 grid max-w-2xl grid-cols-3 gap-6"><Spec k="Vehicles in demo" v={cars.length} /><Spec k="Sample cities" v={CITIES.length} /><Spec k="Sample groups" v={groups.length} /></div>
        <ModelRow ids={['thar', 'xuv700', 'creta']} />
      </div>) },
    { id: 'comfort', credit: cr('innova'), kicker: 'Everyday luxury', image: img_lux, content: (
      <div className="max-w-5xl">
        <p className="kicker" data-rise>03 · Comfort</p>
        <h2 className="display-xl mt-4 text-[11vw] text-white sm:text-[7vw] lg:text-[5.6vw]" data-speed="0.5">Quiet, refined,<br />yours.</h2>
        <p className="mt-5 max-w-xl text-white/75" data-rise>Sedans, MPVs and family SUVs. Every buyer still buys and owns their own car.</p>
        <ModelRow ids={['city', 'hector', 'innova']} />
      </div>) },
    { id: 'electric', credit: cr('nexon-ev'), kicker: 'Electric future', image: img_ev, content: (
      <div className="max-w-5xl">
        <p className="kicker" data-rise>04 · Electric</p>
        <h2 className="display-xl mt-4 text-[11vw] text-white sm:text-[7vw] lg:text-[5.6vw]" data-speed="0.5">Plug into<br />the group.</h2>
        <p className="mt-5 max-w-xl text-white/75" data-rise>EV cars and scooters, grouped like any other vehicle. Prices are indicative demo figures, not live quotes.</p>
        <ModelRow ids={['nexon-ev', 'ola-s1', 'ather-450']} />
      </div>) },
    { id: 'groups', credit: cr('creta'), kicker: 'Your next vehicle', image: img_group, content: (
      <div className="max-w-6xl">
        <p className="kicker" data-rise>05 · Your next vehicle</p>
        <h2 className="display-xl mt-4 text-[11vw] text-white sm:text-[6vw] lg:text-[4.6vw]" data-speed="0.4">Pick a group. Join.<br />Let dealers compete.</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {featured.map((g, gi) => {
            const c = carById(g.carId); const best = bestOffer(g);
            return (
              <Link key={g.id} to={`/groups/${g.id}`} className={`glass group rounded-xl p-5 transition hover:border-white/40 ${gi > 1 ? 'max-md:hidden' : ''}`} data-rise>
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-300">{g.city}</p>
                <p className="mt-1 font-display text-xl font-extrabold text-white">{c.name}</p>
                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/15"><div className="h-full bg-brand-500" style={{ width: `${Math.min(100, Math.round((g.members / g.target) * 100))}%` }} /></div>
                <p className="mt-2 text-xs text-white/70">{g.members} of {g.target} buyers · {g.offers.length} offer{g.offers.length === 1 ? '' : 's'}</p>
                <p className="mt-3 text-sm font-semibold text-white">{best ? `Lowest listed ${fmtINR(best.onRoad)} on-road` : 'Offers open as the group grows'}</p>
                <span className="mt-4 inline-block text-xs font-bold uppercase tracking-[0.18em] text-white group-hover:text-brand-300">View group →</span>
              </Link>
            );
          })}
        </div>
      </div>) },
    { id: 'dealers', credit: cr('punch'), kicker: 'For dealers', image: img_deal, content: (
      <div className="max-w-5xl">
        <p className="kicker" data-rise>06 · Dealers</p>
        <h2 className="display-xl mt-4 text-[11vw] text-white sm:text-[7vw] lg:text-[5.4vw]" data-speed="0.5">Your showroom,<br />a ready group.</h2>
        <p className="mt-5 max-w-xl text-white/75" data-rise>Bid on groups of buyers who already know the exact vehicle and city. In this prototype, dealers and offers are fictional.</p>
        <div className="mt-8 flex flex-wrap gap-3" data-rise>
          <Magnetic to="/dealers" className="btn-accent !px-8 !py-4">See the dealer side</Magnetic>
          <Magnetic to="/request" className="btn-ghost !px-8 !py-4">Request a quote</Magnetic>
        </div>
      </div>) },
  ];
}

export default function Landing() {
  const { data } = useApp();
  const GROUPS = data.groups;
  const totalBuyers = GROUPS.reduce((a, g) => a + g.members, 0);
  const savings = GROUPS.map(savingsVsEstimate).filter((s) => s > 0);
  const avgSaving = savings.length ? Math.round(savings.reduce((a, b) => a + b, 0) / savings.length / 1000) * 1000 : 0;
  const panels = journeyPanels(GROUPS, data.cars);
  const byPop = (t) => data.cars.filter(t);
  const rails = [
    ['Trending vehicles', byPop((c) => c.popular)],
    ['Under Rs 12 lakh ex-showroom', byPop((c) => c.exMin < 1200000 && c.type === 'car')],
    ['Electric revolution', byPop((c) => c.fuel === 'Electric')],
    ['Two-wheelers', byPop((c) => c.type === 'bike' || c.type === 'scooter')],
  ];
  const ctaA = useMagnetic();

  return (
    <div>
      {/* HERO */}
      <section className="relative isolate flex min-h-[var(--cc-vh,100svh)] items-end overflow-hidden bg-ink-950 text-white">
        <img src={img_hero} alt="A black Mahindra Thar on wet tarmac (photo credit on the Credits page)" className="absolute inset-0 -z-10 h-full w-full object-cover object-center" fetchpriority="high" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-r from-ink-950 via-ink-950/60 to-transparent" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-t from-ink-950 via-transparent to-ink-950/40" />
        <div className="container-x relative pb-20 pt-40 lg:pb-24">
          <p className="kicker">Group car buying · India</p>
          <h1 className="display-xl mt-5 max-w-4xl text-[14vw] sm:text-[9vw] lg:text-[7.2vw]">Buy together.<br /><span className="text-brand-400">Let dealers</span><br />compete.</h1>
          <p className="mt-6 max-w-xl text-lg leading-relaxed text-white/75">
            CarCohort groups buyers who want the same vehicle in the same city, then asks dealerships for their best final on-road price. Dealers compete. You compare. Everyone keeps their own vehicle.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Link ref={ctaA} to="/groups" className="btn-accent !px-8 !py-4 !text-base">Find your group</Link>
            <a href="#journey" className="btn-ghost !px-8 !py-4 !text-base">Explore the journey</a>
            <Link to="/request" className="btn-ghost !px-8 !py-4 !text-base">Get a quote</Link>
          </div>
          <div className="mt-8 flex flex-wrap gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/60">
            <span>Free for buyers</span><span>·</span><span>No obligation to buy</span><span>·</span><span>Savings never guaranteed</span>
          </div>
        </div>
        <div className="pointer-events-none absolute bottom-6 right-6 hidden items-center gap-3 text-[10px] font-bold uppercase tracking-[0.3em] text-white/60 md:flex" aria-hidden="true">
          Scroll <span className="relative block h-12 w-px overflow-hidden bg-white/20"><i className="absolute inset-x-0 top-0 block h-5 bg-brand-500 [animation:ccdrop_1.8s_ease-in-out_infinite]" /></span>
        </div>
        <style>{`@keyframes ccdrop{0%{transform:translateY(-100%)}100%{transform:translateY(260%)}}`}</style>
      </section>

      {/* SIGNATURE JOURNEY */}
      <HorizontalJourney panels={panels} label="CarCohort scenes" />
      <span id="after-journey" tabIndex={-1} />

      {/* STATS (from demo dataset) */}
      <section className="border-y border-white/10 bg-ink-950">
        <div className="container-x grid grid-cols-2 gap-8 py-14 sm:grid-cols-4">
          {[
            [<CountUp key="a" value={GROUPS.length} />, 'sample groups (demo)'],
            [<CountUp key="b" value={totalBuyers} />, 'sample buyers (demo)'],
            [<CountUp key="c" value={CITIES.length} />, 'cities in demo'],
            [<CountUp key="d" value={avgSaving} format={(n) => fmtINR(n)} />, 'sample avg. saving*'],
          ].map(([v, l]) => (
            <Reveal key={l} className="text-center">
              <p className="font-display text-4xl font-extrabold text-white sm:text-5xl">{v}</p>
              <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.2em] text-slate-500">{l}</p>
            </Reveal>
          ))}
        </div>
        <p className="container-x pb-6 text-center text-[11px] text-slate-400">*All figures on this page are illustrative sample data, computed from fictional demo groups. Savings are never guaranteed.</p>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="container-x py-24">
        <SectionHeading center kicker="How it works" title="Four steps between you and a fair price"
          sub="Haggling alone for the 'best price' is tiring. Showing up as twenty ready buyers can change the conversation." />
        <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 90} className="group bg-ink-900 p-7 transition hover:bg-ink-800">
              <span className="font-display text-sm font-extrabold tracking-[0.2em] text-brand-400">{s.n}</span>
              <h3 className="mt-4 text-lg font-extrabold text-white">{s.t}</h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600">{s.d}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* CAROUSELS */}
      <section className="border-t border-white/10 bg-ink-950 py-20">
        <div className="container-x space-y-16">
          <div>
            <div className="flex items-end justify-between gap-4"><SectionHeading kicker="Live sample groups" title="Groups dealers would bid on" /></div>
            <div className="mt-6">
              <Rail label="Live sample groups">
                {[...GROUPS].sort((a, b) => b.members / b.target - a.members / a.target).map((g) => <GroupCard key={g.id} group={g} />)}
              </Rail>
            </div>
            <div className="mt-6"><Link to="/groups" className="btn-ghost">View all {GROUPS.length} sample groups</Link></div>
          </div>
          {rails.filter(([, list]) => list.length).map(([title, list]) => (
            <div key={title}>
              <h3 className="font-display text-2xl font-extrabold text-white">{title}</h3>
              <div className="mt-4">
                <Rail label={title}>
                  {list.map((c) => (
                    <Link key={c.id} to="/cars" className="card group overflow-hidden p-5 transition duration-300 hover:-translate-y-1 hover:shadow-lift">
                      <div className="overflow-hidden rounded-lg bg-gradient-to-br from-brand-50 to-ink-800 p-3"><CarPhoto car={c} className="mx-auto w-full" /></div>
                      <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-brand-300">{c.body} · {c.fuel}</p>
                      <p className="mt-1 font-display text-lg font-extrabold text-white">{c.name}</p>
                      <p className="mt-1 text-sm text-slate-600">{carLine(c)}</p>
                    </Link>
                  ))}
                </Rail>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* NOT CAR SHARING */}
      <section className="container-x py-20">
        <div className="card grid items-center gap-10 overflow-hidden p-8 lg:grid-cols-2 lg:p-12">
          <div>
            <SectionHeading kicker="Yours, fully" title="Group price. Individual ownership."
              sub="Fractional ownership apps split one car between strangers. CarCohort does the opposite: strangers team up to negotiate, then each drives home in their own brand-new car, registered in their own name." />
            <ul className="mt-6 space-y-3">
              {[
                'You would buy from a partner dealership, invoice in your name',
                'Standard manufacturer warranty, finance and exchange options apply',
                'No co-owners, no usage calendars, no sharing ever',
                'The group dissolves once everyone has their car',
              ].map((t) => (
                <li key={t} className="flex gap-3 text-sm text-slate-700">
                  <svg className="mt-0.5 shrink-0 text-emerald-600" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 6L9 17l-5-5" /></svg>
                  {t}
                </li>
              ))}
            </ul>
          </div>
          <CarPhoto car={carById('creta')} className="w-full" />
        </div>
      </section>

      {/* TRUST / PDI */}
      <section className="bg-ink-900 py-20">
        <div className="container-x">
          <SectionHeading center kicker="Proposed trust features" title="How a group deal would stay safe"
          sub="These are design commitments for a live launch - not verified operating processes yet." />
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {[
              { t: 'Pre-delivery inspection, documented', d: 'Planned: a full PDI checklist completed and shared before registration - panel gaps, paint, electronics, odometer, manufacturing date.' },
              { t: 'VIN verified before you pay', d: 'Planned: the vehicle identification number shared with the buyer before delivery, so manufacturing month and year are known before money moves.' },
              { t: 'Group visibility keeps dealers honest', d: 'The design goal: a dealer who slips a defective unit to one buyer loses twenty. Every group member would see the same inspection standard applied.' },
            ].map((c) => (
              <div key={c.t} className="card p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-700">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-4z" /><path d="M9 12l2 2 4-4" /></svg>
                </div>
                <h3 className="mt-4 text-lg font-bold text-brand-950">{c.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BUSINESS MODEL */}
      <section className="container-x py-20">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading kicker="Proposed business model" title="Free for buyers. Worth it for dealers."
              sub="The intended model: dealerships already spend on ads, brokers and walk-in discounts to move inventory, so a ready group of committed buyers is valuable to them. In a live launch they would pay a success fee per car delivered to a group member. No dealership is currently partnered." />
          </div>
          <div className="space-y-4">
            {[
              ['Buyers', '₹0 - joining, comparing and walking away are all free.'],
              ['Dealers', 'Would pay a per-car success fee only when a group member takes delivery.'],
              ['You keep', 'Every rupee of the negotiated saving. The on-road price would never be marked up.'],
            ].map(([h, d]) => (
              <div key={h} className="card flex gap-4 p-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 font-display text-sm font-extrabold text-amber-700">{h[0]}</div>
                <div><p className="font-bold text-brand-950">{h}</p><p className="text-sm text-slate-600">{d}</p></div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-ink-900 py-20">
        <div className="container-x max-w-3xl">
          <SectionHeading center kicker="Honest answers" title="Questions everyone asks" />
          <div className="mt-10 space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="card group p-5 open:shadow-lift">
                <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-brand-950">
                  {f.q}
                  <svg className="shrink-0 text-slate-400 transition group-open:rotate-180" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-x py-20">
        <div className="relative overflow-hidden rounded-xl bg-ink-800 ring-1 ring-white/10 px-8 py-14 text-center text-white lg:py-20">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent-500/25 blur-3xl" />
          <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">Negotiating with a showroom alone is hard. Twenty ready buyers can change the conversation.</h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-600">Find your car, join your city's group, and let dealerships come to you with their best on-road price.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/groups" className="btn-accent !px-8 !py-3.5 !text-base">Join a group - free</Link>
            <Link to="/dealers" className="btn border border-white/25 !px-8 !py-3.5 !text-base text-white hover:bg-white/10">I am a dealer</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
