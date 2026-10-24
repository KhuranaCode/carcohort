import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { CITIES, savingsVsEstimate, carById, bestOffer } from '../data.js';
import { Reveal, CountUp, prefersReducedMotion } from '../cinematic.jsx';
import { useApp } from '../store.jsx';
import { PHOTOS, CREDITS, SHOWN } from '../photos.js';
import { fmtINR } from '../utils.js';

gsap.registerPlugin(ScrollTrigger);

const FAQS = [
  { q: 'Is a discount guaranteed if I join a group?', a: 'No. Group buying gives dealers a reason to compete, and that usually produces better offers than a solo walk-in - but the final discount always depends on the actual offers dealers make. We show you every offer transparently and you decide. If no offer is worth it, you walk away free of charge.' },
  { q: 'Is this car sharing or fractional ownership?', a: 'No. Every buyer in a group buys and fully owns their own new car, registered in their own name, delivered by an authorised dealership. The group only exists to negotiate price. This is not co-ownership, leasing or subscription.' },
  { q: 'What if the group does not reach its target size?', a: 'Dealers bid on the group as it grows. If a group stays small, offers may be weaker or dealers may not bid at all - in that case the group simply expires at its deadline and nobody is charged or committed to anything.' },
  { q: 'How do I know the car is not defective or tampered with?', a: 'Every group deal includes a documented pre-delivery inspection (PDI) and VIN verification before you accept the car. You inspect the vehicle at the dealership before registration, and you can reject a car that fails inspection. Dealers on the platform know a failed PDI is visible to the whole group.' },
  { q: 'What does CarCohort charge buyers?', a: 'Nothing. Buyers join groups and compare offers for free. CarCohort earns a success fee from the dealership for each car a group member actually buys - the same way dealers already pay brokers and lead platforms, except the competition happens in the open.' },
  { q: 'Why is the on-road price so much higher than ex-showroom?', a: 'A large part of an Indian car\'s price is tax: GST and compensation cess are levied by the central government, and each state adds its own road tax and registration charges, plus insurance. That is why every offer on CarCohort is quoted as a final on-road price for your city - it is the only number that matters.' },
];

const STEPS = [
  { t: 'Pick your vehicle and city', d: 'Tell us which model you want and where you will register it. Browse live groups or start a new one in seconds - cars, bikes, scooters and EVs.' },
  { t: 'Join the buyer group', d: 'You join other buyers who want the same vehicle in your city. Joining is free and non-binding - it simply adds your name to the buyer count dealers see.' },
  { t: 'Dealers compete for the group', d: 'We take the group to partner dealerships: "twenty ready buyers - what is your best on-road price?" Dealers bid against each other, not against you.' },
  { t: 'Compare, choose, buy - or walk away', d: 'Every offer lands as a final on-road price with inclusions listed. Pick the best one, do your inspection, and buy directly from the dealer. No obligation if nothing fits.' },
];

const REVIEWS = [
  { stars: 5, text: 'Twelve of us wanted the same SUV in Pune. Watching three dealerships undercut each other in the open - that never happens inside a showroom.', name: 'Sample buyer story', meta: 'Fictional demo review · SUV group, Pune' },
  { stars: 5, text: 'I walked in alone first and got one take-it-or-leave-it price. The group offer came back noticeably lower, with the accessories listed in writing.', name: 'Sample buyer story', meta: 'Fictional demo review · Sedan group, Delhi NCR' },
  { stars: 5, text: 'The inspection checklist before registration is what sold me. VIN, manufacturing month, panel gaps - everything documented before money moved.', name: 'Sample buyer story', meta: 'Fictional demo review · EV group, Bengaluru' },
];

/* Deterministic torn ink edge (Sakura brush-cut between sections). */
function Torn({ fill, flip = false, className = '' }) {
  const pts = [0, 90, 210, 330, 470, 590, 720, 860, 990, 1130, 1260, 1390, 1440];
  const ys = [22, 9, 19, 5, 16, 26, 8, 20, 4, 15, 24, 7, 14];
  const d = `M0,34 L0,${ys[0]} ` + pts.map((x, i) => `L${x},${ys[i]}`).join(' ') + ` L1440,${ys[ys.length - 1]} L1440,34 Z`;
  return (
    <svg viewBox="0 0 1440 34" preserveAspectRatio="none" className={`torn ${flip ? 'rotate-180' : ''} ${className}`} aria-hidden="true">
      <path d={d} fill={fill} />
    </svg>
  );
}

function Callout({ children, className = '' }) {
  return <p className={`callout ${className}`}><span className="line" />{children}</p>;
}

function Hero({ totalBuyers, groupCount }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const el = ref.current;
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.hero-line', { yPercent: 110, duration: 1.05, stagger: 0.14 }, 0.15)
        .from('.hero-el', { y: 30, opacity: 0, duration: 0.85, stagger: 0.1 }, 0.7)
        .fromTo('.hero-photo', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'power4.out' }, 0.35)
        .fromTo('.hero-sweep', { xPercent: -130 }, { xPercent: 130, duration: 1.6, ease: 'power2.inOut' }, 0.9)
        .from('.hero-callout', { opacity: 0, x: 24, duration: 0.7 }, 1.5);
      gsap.to('.hero-photo-img', {
        yPercent: -11, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom top', scrub: true },
      });
      gsap.to('.hero-copy', {
        yPercent: 14, opacity: 0.25, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top top', end: 'bottom 30%', scrub: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={ref} className="relative isolate overflow-hidden bg-paper" aria-label="CarCohort introduction">
      <div className="container-x grid min-h-[var(--cc-vh,100svh)] items-center gap-10 pb-24 pt-32 lg:grid-cols-2 lg:gap-6 lg:pb-16">
        <div className="hero-copy relative z-[2]">
          <h1 className="font-display font-medium leading-[0.98] text-ink-900">
            <span className="block overflow-hidden"><span className="hero-line block text-[13.5vw] font-bold sm:text-[9.5vw] lg:text-[5.6vw]">Your dream car.</span></span>
            <span className="block overflow-hidden"><span className="hero-line block text-[13.5vw] font-bold text-brand-500 sm:text-[9.5vw] lg:text-[5.6vw]">Bought together.</span></span>
            <span className="block overflow-hidden"><span className="hero-line mt-3 block max-w-xl text-[6.4vw] font-normal text-ink-900 sm:text-[4vw] lg:text-[2.1vw] lg:leading-[1.15]">- one group, dealers competing for your best on-road price</span></span>
          </h1>
          <div className="hero-el mt-9 flex flex-wrap gap-3">
            <Link to="/cars" className="btn-ghost !px-8">Browse vehicles</Link>
            <Link to="/groups" className="btn-primary !px-8">Find your group</Link>
          </div>
          <p className="hero-el mt-7 flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
            <span>{groupCount} sample groups</span><span aria-hidden="true">·</span><span>{totalBuyers} sample buyers</span><span aria-hidden="true">·</span><span>Free to join</span>
          </p>
        </div>
        <div className="relative">
          <div className="hero-photo relative overflow-hidden rounded-[6px]" data-hover>
            <img src={PHOTOS.thar} alt={`Mahindra Thar photograph (${SHOWN.thar})`} fetchpriority="high"
              className="hero-photo-img aspect-[4/3] w-full scale-[1.12] object-cover" />
            <div className="hero-sweep pointer-events-none absolute inset-0" aria-hidden="true" />
          </div>
          <Callout className="hero-callout absolute -bottom-5 right-2 sm:right-6">Mahindra Thar · 4 seats</Callout>
          <p className="mt-8 text-[10px] leading-tight text-slate-600">
            Photo: {SHOWN.thar} · {CREDITS.thar.author} ({CREDITS.thar.license}) · <Link className="underline" to="/credits">credits</Link>
          </p>
        </div>
      </div>
      <div className="pointer-events-none absolute bottom-7 left-5 z-[2] flex flex-col items-center gap-2 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 sm:left-8" aria-hidden="true">
        Scroll down
        <svg width="14" height="20" viewBox="0 0 14 20" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M7 1v16m0 0l-5-5m5 5l5-5" /></svg>
      </div>
      <p className="side-label pointer-events-none absolute bottom-24 right-4 z-[2] hidden text-[10px] font-bold uppercase text-slate-400 lg:block" aria-hidden="true">Group buying · India</p>
    </section>
  );
}

function Why() {
  return (
    <section className="bg-paper py-24 lg:py-32">
      <div className="container-x max-w-4xl">
        <Reveal>
          <h2 className="font-display text-[9vw] font-medium leading-[1.06] text-ink-900 sm:text-6xl lg:text-7xl">
            Why are you still <span className="serif-accent">negotiating alone</span> for your car?
          </h2>
        </Reveal>
        <Reveal delay={120}>
          <p className="mt-8 max-w-2xl text-base leading-[1.9] text-slate-600">
            One buyer walking into a showroom has no leverage. Twenty buyers who want the exact same
            vehicle in the same city are a conversation dealerships cannot ignore. CarCohort brings those
            buyers together, takes the group to dealers, and puts every competing final on-road price
            side by side - <strong className="text-ink-900">so the market works for you, not against you</strong>.
          </p>
        </Reveal>
        <Reveal delay={200}>
          <div className="mt-10"><a href="#how" className="btn-ghost">See how it works</a></div>
        </Reveal>
      </div>
    </section>
  );
}

function Showcase() {
  const ref = useRef(null);
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const el = ref.current;
    const ctx = gsap.context(() => {
      gsap.fromTo('.showcase-img', { yPercent: 8, scale: 1.08 }, {
        yPercent: -6, scale: 1, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <section ref={ref} className="relative overflow-hidden bg-paper pb-8 pt-4 lg:pb-14" aria-label="Featured vehicle">
      <div className="container-x relative">
        <svg viewBox="0 0 900 420" className="pointer-events-none absolute -top-10 left-1/2 w-[130%] max-w-none -translate-x-1/2 opacity-[0.16] sm:w-[90%]" aria-hidden="true">
          <path d="M40 210 Q120 90 300 110 T560 90 Q740 70 820 160 Q900 250 800 320 T520 360 Q340 390 200 340 T40 210 Z" fill="#3d3b36" />
        </svg>
        <Reveal className="relative">
          <div className="mask-reveal overflow-hidden rounded-[6px]">
            <img src={PHOTOS.xuv700} alt={`Mahindra XUV700 photograph (${SHOWN.xuv700})`} loading="lazy"
              className="showcase-img aspect-[16/9] w-full object-cover sm:aspect-[21/9]" />
          </div>
          <Callout className="mt-4 justify-end">Mahindra XUV700 · 7 seats</Callout>
          <p className="mt-2 text-right text-[10px] leading-tight text-slate-600">Photo: {SHOWN.xuv700} · {CREDITS.xuv700.author} ({CREDITS.xuv700.license})</p>
        </Reveal>
      </div>
    </section>
  );
}

function About({ groupCount, totalBuyers, carCount }) {
  return (
    <section data-header-dark className="relative bg-ink-900 pb-24 pt-20 text-white lg:pb-32 lg:pt-24">
      <Torn fill="#161616" className="absolute inset-x-0 top-0 -translate-y-full rotate-180" />
      <div className="container-x grid gap-14 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <Reveal>
            <h2 className="font-display text-[8.4vw] font-medium leading-[1.06] text-white sm:text-5xl lg:text-6xl">
              <span className="serif-accent font-bold">We help you</span> win your dream car at a fair, honest price
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <p className="mt-8 max-w-xl text-base leading-[1.9] text-white/70">
              CarCohort is a group-buying concept built for India: buyers who want the same vehicle in the
              same city join one group, and dealerships bid for the whole group at once. Every offer is a
              final on-road price, in the open, next to its competition. This site is an interactive
              prototype - every group, dealer, offer and price is fictional sample data.
            </p>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-10"><Link to="/groups" className="btn-ghost-light">See live sample groups</Link></div>
          </Reveal>
        </div>
        <div className="lg:col-span-5">
          <dl className="grid gap-10 sm:grid-cols-3 lg:grid-cols-1 lg:gap-14 lg:text-right">
            {[
              [<CountUp key="c" value={carCount} />, 'vehicles in the demo catalogue'],
              [<CountUp key="g" value={groupCount} />, 'sample buying groups'],
              [<CountUp key="b" value={totalBuyers} />, 'sample buyers grouped'],
            ].map(([v, l], i) => (
              <Reveal key={l} delay={i * 120}>
                <dt className="order-2 mt-2 text-sm text-white/55">{l}</dt>
                <dd className="order-1 font-display text-6xl font-medium leading-none lg:text-7xl">{v}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

function Offer() {
  const items = [
    { t: 'Real catalogue', d: 'Nineteen vehicles Indian buyers actually cross-shop - each with a real, licensed photograph and indicative ex-showroom range.' },
    { t: 'Open group bidding', d: 'Dealers see the group size and bid their best final on-road price. Every offer is visible next to its competition.' },
    { t: 'Inspection first', d: 'Planned for launch: documented pre-delivery inspection and VIN verification before you accept any vehicle.' },
    { t: 'Walk away free', d: 'Joining costs nothing and commits you to nothing. If no offer is worth it, the group expires and that is the end of it.' },
  ];
  return (
    <section data-header-dark className="relative overflow-hidden bg-ink-900 py-24 text-white lg:py-32" aria-label="What CarCohort does">
      <span className="bg-word text-[26vw]" aria-hidden="true">CARCOHORT</span>
      <div className="container-x relative">
        <Reveal className="mx-auto max-w-3xl text-center">
          <h2 className="font-display text-[8.4vw] font-medium leading-[1.08] text-white sm:text-5xl lg:text-6xl">Group buying - <span className="serif-accent font-bold">what we do</span></h2>
          <p className="mx-auto mt-6 max-w-2xl text-base leading-[1.9] text-white/65">
            Everything on CarCohort exists to do one thing: move the bargaining power from the showroom
            floor to the buyer group.
          </p>
        </Reveal>
        <div className="mt-16 grid gap-x-10 gap-y-14 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((it, i) => (
            <Reveal key={it.t} delay={i * 110} className="text-center">
              <svg viewBox="0 0 40 40" className="mx-auto h-10 w-10" aria-hidden="true">
                <circle cx="20" cy="20" r="8" fill="#e03e39" opacity="0.28" />
                <circle cx="20" cy="20" r="4" fill="#e03e39" />
              </svg>
              <h3 className="mt-5 font-display text-2xl font-bold text-white">{it.t}</h3>
              <p className="mt-3 text-sm leading-[1.8] text-white/60">{it.d}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const [i, setI] = useState(0);
  const [fade, setFade] = useState(false);
  const go = (n) => {
    setFade(true);
    setTimeout(() => { setI((n + REVIEWS.length) % REVIEWS.length); setFade(false); }, 320);
  };
  const r = REVIEWS[i];
  return (
    <section data-header-dark className="relative bg-brand-500 pb-24 pt-28 text-white lg:pb-32" aria-label="Buyer stories">
      <Torn fill="#e03e39" className="absolute inset-x-0 top-0 -translate-y-full rotate-180" />
      <span className="bg-word top-6 text-[24vw]" style={{ color: 'rgba(255,255,255,0.07)' }} aria-hidden="true">WHICH CAR?</span>
      <div className="container-x relative -mt-40 mb-10 lg:-mt-48">
        <Reveal>
          <img src={PHOTOS.creta} alt={`Hyundai Creta photograph (${SHOWN.creta})`} loading="lazy"
            className="mx-auto w-full max-w-3xl rounded-[6px] object-cover shadow-lift" />
        </Reveal>
        <p className="mx-auto mt-2 max-w-3xl text-[10px] leading-tight text-white/85">Photo: {SHOWN.creta} · {CREDITS.creta.author} ({CREDITS.creta.license})</p>
      </div>
      <div className="container-x relative grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <h2 className="font-display text-[9vw] font-medium uppercase leading-[1.05] text-white sm:text-5xl lg:text-6xl">What our<br />buyers say</h2>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/80">Every review below is fictional sample content inside this prototype - real buyer stories would live here after launch.</p>
          <div className="mt-8 flex gap-3">
            <button onClick={() => go(i - 1)} aria-label="Previous review" className="grid h-12 w-12 place-items-center rounded-full border border-white/60 transition hover:bg-white hover:text-brand-500">
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M17 7H2m0 0l5-5M2 7l5 5" /></svg>
            </button>
            <button onClick={() => go(i + 1)} aria-label="Next review" className="grid h-12 w-12 place-items-center rounded-full border border-white/60 transition hover:bg-white hover:text-brand-500">
              <svg width="18" height="14" viewBox="0 0 18 14" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M1 7h15m0 0l-5-5m5 5l-5 5" /></svg>
            </button>
          </div>
        </Reveal>
        <Reveal delay={140}>
          <div className={`quote-slide border-l border-white/40 pl-8 ${fade ? 'out' : ''}`} aria-live="polite">
            <div className="flex gap-1.5" aria-label={`${r.stars} out of 5 stars`}>
              {Array.from({ length: r.stars }).map((_, s) => (
                <svg key={s} width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.2 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8L12 2z" /></svg>
              ))}
            </div>
            <blockquote className="mt-6 text-lg italic leading-[1.9] text-white/95">&ldquo;{r.text}&rdquo;</blockquote>
            <p className="mt-6 font-display text-xl font-bold">{r.name}</p>
            <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/70">{r.meta}</p>
            <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.24em] text-white/60">{String(i + 1).padStart(2, '0')} / {String(REVIEWS.length).padStart(2, '0')}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Cities() {
  return (
    <section className="relative bg-paper py-16 lg:py-20" aria-label="Sample cities">
      <Torn fill="#f2f1ed" className="absolute inset-x-0 top-0 -translate-y-full" />
      <div className="container-x flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-center">
        <span className="text-xs font-bold uppercase tracking-[0.24em] text-slate-400">Live sample cities</span>
        {CITIES.map((c) => (
          <span key={c} className="flex items-center gap-2 font-display text-xl font-medium text-ink-900 sm:text-2xl">
            <span className="h-2 w-2 rounded-full bg-brand-500" aria-hidden="true" />{c}
          </span>
        ))}
      </div>
    </section>
  );
}

function Process() {
  const ref = useRef(null);
  const bar = useRef(null);
  useLayoutEffect(() => {
    if (prefersReducedMotion()) return undefined;
    const el = ref.current;
    const ctx = gsap.context(() => {
      gsap.fromTo(bar.current, { scaleY: 0 }, {
        scaleY: 1, ease: 'none',
        scrollTrigger: { trigger: el, start: 'top 60%', end: 'bottom 80%', scrub: true },
      });
      el.querySelectorAll('.process-step').forEach((s) => {
        gsap.from(s.querySelectorAll('.step-in'), {
          y: 60, opacity: 0, duration: 0.9, ease: 'power3.out', stagger: 0.08,
          scrollTrigger: { trigger: s, start: 'top 72%', toggleActions: 'play none none reverse' },
        });
      });
    }, el);
    return () => ctx.revert();
  }, []);
  return (
    <section id="how" ref={ref} className="relative bg-paper py-24 lg:py-32" aria-label="How it works">
      <div className="container-x grid gap-16 lg:grid-cols-12">
        <div className="relative lg:col-span-5">
          <div className="lg:sticky lg:top-32">
            <Reveal>
              <h2 className="font-display text-[8.6vw] font-medium leading-[1.06] text-ink-900 sm:text-5xl lg:text-6xl">
                <span className="serif-accent font-bold">CarCohort</span> - help at every step of the purchase
              </h2>
            </Reveal>
            <Reveal delay={120}>
              <p className="mt-7 max-w-sm text-base leading-[1.9] text-slate-600">
                Before your dream car reaches your driveway, the whole process covers four stages:
              </p>
            </Reveal>
            <div className="mt-10 hidden h-40 w-px bg-slate-300 lg:block" aria-hidden="true">
              <i ref={bar} className="block h-full w-[2px] origin-top bg-brand-500" />
            </div>
          </div>
        </div>
        <div className="lg:col-span-7">
          {STEPS.map((s, i) => (
            <div key={s.t} className="process-step flex min-h-[46vh] items-start gap-7 border-b border-dashed border-slate-300 py-14 first:pt-0 lg:min-h-[62vh] lg:gap-12">
              <span className="step-in font-display text-[22vw] font-medium leading-[0.8] text-brand-500 sm:text-[9rem] lg:text-[11rem]">{i + 1}</span>
              <div className="pt-4 lg:pt-10">
                <h3 className="step-in font-display text-3xl font-bold leading-[1.1] text-brand-500 sm:text-4xl lg:text-[2.6rem]">{s.t}</h3>
                <p className="step-in mt-6 max-w-md text-base leading-[1.9] text-slate-600">{s.d}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Popular() {
  const picks = ['swift', 'thar', 'creta', 'nexon-ev', 'classic350', 'innova'];
  return (
    <section className="bg-paper pb-24 pt-4 lg:pb-32" aria-label="Popular vehicles">
      <div className="container-x grid items-center gap-14 lg:grid-cols-2">
        <Reveal>
          <img src={PHOTOS.innova} alt={`Toyota Innova Crysta photograph (${SHOWN.innova})`} loading="lazy" className="w-full rounded-[6px] object-cover shadow-card" />
          <p className="mt-2 text-[10px] leading-tight text-slate-600">Photo: {SHOWN.innova} · {CREDITS.innova.author} ({CREDITS.innova.license})</p>
        </Reveal>
        <div>
          <Reveal>
            <h2 className="font-display text-[8.6vw] font-medium leading-[1.06] text-ink-900 sm:text-5xl lg:text-6xl">
              Models buyers are <span className="serif-accent font-bold">grouping right now</span>
            </h2>
          </Reveal>
          <Reveal delay={120}>
            <ul className="mt-10 space-y-4">
              {picks.map((id) => {
                const c = carById(id);
                return (
                  <li key={id}>
                    <Link to={`/cars/${id}`} className="group flex items-baseline justify-between gap-4 border-b border-slate-200 pb-4">
                      <span className="font-display text-2xl font-medium text-ink-900 underline decoration-brand-500/0 decoration-2 underline-offset-8 transition group-hover:text-brand-500 group-hover:decoration-brand-500 sm:text-3xl">{c.name}</span>
                      <span className="whitespace-nowrap text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{fmtINR(c.exMin)}+</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Reveal>
          <Reveal delay={200}>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/cars" className="btn-ghost">Full catalogue</Link>
              <Link to="/request" className="btn-primary">Get a quote</Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function GroupCards({ groups }) {
  const featured = [...groups].sort((a, b) => b.members / b.target - a.members / a.target).slice(0, 3);
  return (
    <section className="bg-paper-deep py-24 lg:py-32" aria-label="Live sample groups">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal>
            <h2 className="max-w-xl font-display text-[8.6vw] font-medium leading-[1.06] text-ink-900 sm:text-5xl lg:text-6xl">
              Groups dealers would <span className="serif-accent font-bold">bid on today</span>
            </h2>
          </Reveal>
          <Reveal delay={120}><Link to="/groups" className="btn-ghost">All {groups.length} sample groups</Link></Reveal>
        </div>
        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {featured.map((g, i) => {
            const c = carById(g.carId);
            const best = bestOffer(g);
            return (
              <Reveal key={g.id} delay={i * 110}>
                <Link to={`/groups/${g.id}`} className="card group flex h-full flex-col p-7 transition duration-300 hover:-translate-y-1.5 hover:shadow-lift">
                  <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-500">{g.city} · closes in {g.members >= g.target ? '0' : ''}{Math.max(1, Math.ceil((new Date(g.deadline) - Date.now()) / 86400000))} days</p>
                  <h3 className="mt-3 font-display text-[1.65rem] font-bold leading-[1.15] text-ink-900">{c.name}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-slate-500">{g.members} of {g.target} buyers joined · {g.offers.length} dealer offer{g.offers.length === 1 ? '' : 's'} so far.</p>
                  <div className="mt-4 h-1 overflow-hidden rounded-full bg-slate-200"><div className="h-full bg-brand-500 transition-all" style={{ width: `${Math.min(100, Math.round((g.members / g.target) * 100))}%` }} /></div>
                  <p className="mt-4 text-sm font-semibold text-ink-900">{best ? `Lowest listed ${fmtINR(best.onRoad)} on-road` : 'Offers open as the group grows'}</p>
                  <span className="mt-auto pt-6 text-sm font-bold text-ink-900 transition group-hover:text-brand-500">View group <span aria-hidden="true">→</span></span>
                </Link>
              </Reveal>
            );
          })}
        </div>
        <p className="mt-8 text-center text-xs text-slate-400">Fictional sample groups and offers - demonstration data only.</p>
      </div>
    </section>
  );
}

function Faq() {
  return (
    <section className="bg-paper py-24 lg:py-32">
      <div className="container-x max-w-3xl">
        <Reveal className="text-center">
          <h2 className="font-display text-[8.6vw] font-medium leading-[1.06] text-ink-900 sm:text-5xl">Honest answers, <span className="serif-accent font-bold">up front</span></h2>
        </Reveal>
        <div className="mt-12 space-y-3">
          {FAQS.map((f, i) => (
            <Reveal key={f.q} delay={i * 60}>
              <details className="card group p-6 open:shadow-lift">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg font-bold text-ink-900">
                  {f.q}
                  <svg className="shrink-0 text-brand-500 transition group-open:rotate-180" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                </summary>
                <p className="mt-3 text-sm leading-[1.85] text-slate-600">{f.a}</p>
              </details>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Cta() {
  return (
    <section data-header-dark className="relative overflow-hidden bg-brand-500 pb-24 pt-24 text-white lg:pb-32 lg:pt-28" aria-label="Get started">
      <Torn fill="#e03e39" className="absolute inset-x-0 top-0 -translate-y-full rotate-180" />
      <div className="container-x relative grid items-center gap-12 lg:grid-cols-2">
        <Reveal>
          <h2 className="font-display text-[10vw] font-medium leading-[1.04] text-white sm:text-6xl lg:text-7xl">How can we help?</h2>
          <p className="mt-6 max-w-md text-base leading-[1.9] text-white/85">
            Tell us the vehicle and the city. We will show you the group forming around it - or start one.
            In this prototype the request is a demo and no dealer is contacted.
          </p>
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/request" className="btn bg-ink-900 !px-9 !py-4 text-white hover:bg-ink-700">Request a quote</Link>
            <Link to="/cars" className="btn-ghost-light !px-9 !py-4">Browse vehicles</Link>
          </div>
        </Reveal>
        <Reveal delay={140} className="relative">
          <svg viewBox="0 0 432 190" className="mx-auto w-full max-w-lg opacity-90" aria-hidden="true">
            <path d="M104 80 L144 46 Q152 40 164 40 L262 40 Q274 40 282 52 L306 80 L326 88 Q344 94 344 112 L344 136 Q344 148 332 148 L96 148 Q84 148 84 136 L84 112 Q84 86 104 80 Z" fill="#161616" />
            <rect x="160" y="54" width="52" height="30" rx="6" fill="#2e2e2e" />
            <rect x="222" y="54" width="52" height="30" rx="6" fill="#2e2e2e" />
            <circle cx="150" cy="140" r="24" fill="#161616" stroke="#f2f1ed" strokeOpacity="0.25" strokeWidth="3" /><circle cx="150" cy="140" r="10" fill="#3a3a3a" />
            <circle cx="286" cy="140" r="24" fill="#161616" stroke="#f2f1ed" strokeOpacity="0.25" strokeWidth="3" /><circle cx="286" cy="140" r="10" fill="#3a3a3a" />
            <rect x="96" y="98" width="18" height="8" rx="4" fill="#f2f1ed" opacity="0.8" />
            <ellipse cx="214" cy="164" rx="180" ry="10" fill="#161616" opacity="0.5" />
          </svg>
          <p className="mt-6 text-center text-[11px] font-bold uppercase tracking-[0.3em] text-white/60">Buy together · own fully · walk away free</p>
        </Reveal>
      </div>
    </section>
  );
}

export default function Landing() {
  const { data } = useApp();
  const GROUPS = data.groups;
  const totalBuyers = GROUPS.reduce((a, g) => a + g.members, 0);
  const savings = GROUPS.map(savingsVsEstimate).filter((s) => s > 0);
  void savings;
  return (
    <div>
      <Hero totalBuyers={totalBuyers} groupCount={GROUPS.length} />
      <Why />
      <Showcase />
      <About groupCount={GROUPS.length} totalBuyers={totalBuyers} carCount={data.cars.length} />
      <Offer />
      <Testimonials />
      <Cities />
      <Process />
      <Popular />
      <GroupCards groups={GROUPS} />
      <Faq />
      <Cta />
    </div>
  );
}
