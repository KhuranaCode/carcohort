import { Link } from 'react-router-dom';
import { CITIES, savingsVsEstimate } from '../data.js';
import { useApp } from '../store.jsx';
import { SectionHeading, Countdown, ProgressBar, Badge, CarArt } from '../ui.jsx';
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

export default function Landing() {
  const { data } = useApp();
  const GROUPS = data.groups;
  const totalBuyers = GROUPS.reduce((a, g) => a + g.members, 0);
  const savings = GROUPS.map(savingsVsEstimate).filter((s) => s > 0);
  const avgSaving = savings.length ? Math.round(savings.reduce((a, b) => a + b, 0) / savings.length / 1000) * 1000 : 0;
  const preview = [...GROUPS].sort((a, b) => b.members / b.target - a.members / a.target).slice(0, 3);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden bg-brand-950 text-white">
        <div className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="pointer-events-none absolute -left-40 bottom-0 h-96 w-96 rounded-full bg-accent-500/20 blur-3xl" />
        <div className="container-x relative grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <Badge cls="bg-amber-400 text-amber-950">Interactive prototype · fictional sample data</Badge>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Why negotiate alone for a <span className="text-accent-400">₹15 lakh</span> car?
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-slate-300">
              CarCohort groups buyers who want the same vehicle in the same city, then tells
              dealerships: <em className="not-italic font-semibold text-white">"20 ready buyers - your best on-road price?"</em>{' '}
              Dealers compete. You compare. Everyone keeps their own vehicle.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/groups" className="btn-accent !px-7 !py-3.5 !text-base">Find your group</Link>
              <a href="#how" className="btn !px-7 !py-3.5 !text-base border border-white/25 text-white hover:bg-white/10">How it works</a>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              <Badge cls="bg-white/10 text-slate-200">Free for buyers</Badge>
              <Badge cls="bg-white/10 text-slate-200">No obligation to buy</Badge>
              <Badge cls="bg-white/10 text-slate-200">Proposed PDI checklist</Badge>
            </div>
          </div>
          <div className="relative">
            <img src="./hero-carcohort.png" alt="A group of buyers taking delivery of a new car together" className="w-full rounded-3xl shadow-lift ring-1 ring-white/20" />
            <div className="card absolute -bottom-6 -left-4 hidden p-4 sm:block lg:-left-8">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Message dealers see</p>
              <p className="font-display text-2xl font-extrabold text-brand-900">20 ready buyers</p>
            </div>
          </div>
        </div>
      </section>

      {/* STATS (from demo dataset) */}
      <section className="border-b border-slate-200 bg-white">
        <div className="container-x grid grid-cols-2 gap-6 py-8 sm:grid-cols-4">
          {[
            [`${GROUPS.length}`, 'sample groups (demo)'],
            [`${totalBuyers}`, 'sample buyers (demo)'],
            [`${CITIES.length}`, 'cities in demo'],
            [fmtINR(avgSaving), 'sample avg. saving*'],
          ].map(([v, l]) => (
            <div key={l} className="text-center">
              <p className="font-display text-3xl font-extrabold text-brand-900">{v}</p>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-slate-500">{l}</p>
            </div>
          ))}
        </div>
        <p className="container-x pb-4 text-center text-[11px] text-slate-400">*All figures on this page are illustrative sample data, computed from fictional demo groups. Savings are never guaranteed.</p>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="container-x py-20">
        <SectionHeading center kicker="How it works" title="Four steps between you and a fair price"
          sub="The showroom dance - 'sir, best price' and free floor mats - exists because one buyer has no leverage. Twenty buyers do." />
        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s) => (
            <div key={s.n} className="card group p-6 transition hover:shadow-lift">
              <span className="font-display text-sm font-extrabold text-accent-500">{s.n}</span>
              <h3 className="mt-3 text-lg font-bold text-brand-950">{s.t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{s.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* LIVE GROUPS PREVIEW */}
      <section className="bg-white py-20">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <SectionHeading kicker="Fictional sample data" title="Sample groups dealers would bid on" />
            <Link to="/groups" className="btn-ghost">View all {GROUPS.length} sample groups</Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {preview.map((g) => <GroupCard key={g.id} group={g} />)}
          </div>
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
          <CarArt body="SUV" className="w-full" />
        </div>
      </section>

      {/* TRUST / PDI */}
      <section className="bg-white py-20">
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
      <section className="bg-white py-20">
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
        <div className="relative overflow-hidden rounded-3xl bg-brand-900 px-8 py-14 text-center text-white lg:py-20">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-accent-500/25 blur-3xl" />
          <h2 className="mx-auto max-w-2xl text-3xl font-extrabold tracking-tight sm:text-4xl">The best way to negotiate a car price is to show up with 19 other buyers.</h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">Find your car, join your city's group, and let dealerships come to you with their best on-road price.</p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/groups" className="btn-accent !px-8 !py-3.5 !text-base">Join a group - free</Link>
            <Link to="/dealers" className="btn border border-white/25 !px-8 !py-3.5 !text-base text-white hover:bg-white/10">I am a dealer</Link>
          </div>
        </div>
      </section>
    </div>
  );
}
