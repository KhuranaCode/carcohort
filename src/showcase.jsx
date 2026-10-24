import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { Reveal } from './cinematic.jsx';
import { Tilt } from './ui.jsx';
import Atmosphere from './three/Atmosphere.jsx';
import ConceptCar from './three/ConceptCar.jsx';

gsap.registerPlugin(ScrollTrigger);

const mq = (q) => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(q) : { matches: false, addEventListener() {}, removeEventListener() {} });
const reduced = () => mq('(prefers-reduced-motion: reduce)').matches;


/**
 * Scene B2 - "The concept in motion". A licensed concept 3D model rendered
 * live in WebGL: the user's scroll turns it on a studio turntable. Clearly
 * labelled as a licensed visual demo, NOT a specific catalogue model -
 * the catalogue itself keeps real, credited photography.
 */
const CONCEPT_CAPS = [
  {
    kicker: 'Interactive 3D demo',
    title: 'Turn it with your scroll.',
    sub: 'A Ferrari F40 model rendered live - your scroll drives the turntable.',
  },
  {
    kicker: 'Physically based materials',
    title: 'Clearcoat paint. Studio light.',
    sub: 'Real lighting, reflections and shadows computed live on your device - no video, no pre-rendered clip, no flat image pretending to rotate.',
  },
  {
    kicker: 'Honesty stays',
    title: 'The catalogue stays real.',
    sub: 'Every vehicle you can actually browse carries a real photograph, its licence and plain labels. The Ferrari F40 is a visual demo, not inventory.',
  },
];

export function ConceptStage() {
  const root = useRef(null);
  const bar = useRef(null);
  const progressRef = useRef(0);
  const [pinned, setPinned] = useState(false);
  const [active, setActive] = useState(0);
  const n = CONCEPT_CAPS.length;

  useEffect(() => {
    const q = mq('(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    const hosted = typeof window !== 'undefined' && window.__CC_HOSTED__;
    const upd = () => setPinned(!hosted && q.matches);
    upd();
    q.addEventListener('change', upd);
    return () => q.removeEventListener('change', upd);
  }, []);

  useLayoutEffect(() => {
    if (!pinned) return undefined;
    const el = root.current;
    const ctx = gsap.context(() => {
      const caps = el.querySelectorAll('.concept-cap');
      gsap.set(caps, { autoAlpha: 0, y: 42 });
      gsap.set(caps[0], { autoAlpha: 1, y: 0 });
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el, start: 'top top', end: `+=${n * 85}%`, pin: true, scrub: 0.6, anticipatePin: 1,
          onUpdate: (self) => {
            progressRef.current = self.progress;
            if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
            setActive(Math.min(n - 1, Math.floor(self.progress * n)));
          },
        },
      });
      caps.forEach((cap, i) => {
        if (i > 0) tl.fromTo(cap, { autoAlpha: 0, y: 42 }, { autoAlpha: 1, y: 0, duration: 0.45, ease: 'power3.out' }, i);
        if (i < caps.length - 1) tl.to(cap, { autoAlpha: 0, y: -42, duration: 0.45, ease: 'power3.in' }, i + 0.72);
      });
      tl.to({}, { duration: 0.35 });
    }, el);
    return () => ctx.revert();
  }, [pinned, n]);

  return (
    <section ref={root} className="relative border-t border-white/10 bg-ink-950" aria-label="Ferrari F40 production-car model, rendered live">
      {(() => {
        const stage = (
          <>
            <div className="absolute inset-0 bg-[radial-gradient(70%_60%_at_50%_62%,#15161c_0%,#08080a_70%)]" />
            <ConceptCar progressRef={progressRef} autoSpin={!pinned} className="absolute inset-0" />
            <div className="pointer-events-none absolute inset-0 hidden lg:block bg-gradient-to-r from-ink-950/80 via-ink-950/20 to-transparent" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink-950/90 via-transparent to-transparent lg:to-ink-950/20" />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[4] px-6 pb-20 sm:px-12 lg:px-20 lg:pb-24">
              {CONCEPT_CAPS.map((c, i) => (
                <div key={c.kicker} className={pinned ? 'concept-cap absolute bottom-20 left-6 right-6 max-w-2xl sm:left-12 lg:bottom-24 lg:left-20' : 'absolute bottom-24 left-6 right-6 max-w-2xl'} style={pinned ? undefined : { display: i === 0 ? 'block' : 'none' }}>
                  <p className="kicker">{c.kicker}</p>
                  <h3 className="display-xl mt-3 text-[9vw] text-white sm:text-[5vw] lg:text-[3.6vw]">{c.title}</h3>
                  <p className="mt-4 max-w-xl text-sm leading-relaxed text-white sm:text-base" style={{ textShadow: '0 2px 16px rgba(0,0,0,0.95)' }}>{c.sub}</p>
                  {i === n - 1 && pinned && (
                    <div className="pointer-events-auto mt-6">
                      <Link to="/cars" className="btn-ghost !px-6 !py-3">Browse the real catalogue →</Link>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="absolute right-4 top-20 z-[4] rounded-full border border-white/15 bg-ink-950/70 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/60 backdrop-blur sm:right-8">
              Ferrari F40 · licensed 3D demo · not inventory
            </p>
            <p className="absolute bottom-20 right-4 z-[4] hidden max-w-[240px] text-right text-[10px] leading-tight text-white/45 sm:right-8 md:block lg:bottom-24">
              3D model: "Ferrari f40" by Black Snow (CC-BY 4.0), via Sketchfab. Production-car depiction; visual demo only, not inventory or manufacturer endorsement.
            </p>
            {pinned && (
              <>
                <div className="absolute inset-x-0 bottom-0 z-[6] flex items-center justify-between px-6 pb-5 sm:px-12">
                  <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/70" aria-live="polite">
                    {String(active + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}<span className="hidden sm:inline"> · {CONCEPT_CAPS[active].kicker}</span>
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Scroll to turn it</p>
                </div>
                <div className="hj-progress" aria-hidden="true"><i ref={bar} /></div>
              </>
            )}
          </>
        );
        // Pinned (desktop): the section pins and scroll scrubs the turntable.
        // Unpinned (mobile/touch): a simple sticky stage - the car stays in
        // place in the viewport while the page's scroll turns it, no
        // vertical entrance or camera drift.
        return pinned ? (
          <div className="relative h-[var(--cc-vh,100svh)] overflow-hidden">{stage}</div>
        ) : (
          <div className="relative h-[170svh]">
            <div className="sticky top-0 h-[100svh] overflow-hidden">{stage}</div>
          </div>
        );
      })()}
    </section>
  );
}

/**
 * Scene C - "Design in motion". A pinned, scroll-driven sequence of shots
 * through the real photo set: stance -> detail -> departure. These are
 * photographs (each credited), choreographed with perspective, scale and
 * cross-dissolve - no fake 3D rotation of a flat image. Desktop pins and
 * scrubs; touch, small screens and reduced motion get a stacked version.
 */
export function Shots({ shots }) {
  const root = useRef(null);
  const bar = useRef(null);
  const [pinned, setPinned] = useState(false);
  const [active, setActive] = useState(0);
  const n = shots.length;

  useEffect(() => {
    const q = mq('(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    const hosted = typeof window !== 'undefined' && window.__CC_HOSTED__;
    const upd = () => setPinned(!hosted && q.matches);
    upd();
    q.addEventListener('change', upd);
    return () => q.removeEventListener('change', upd);
  }, []);

  useLayoutEffect(() => {
    if (!pinned) return undefined;
    const el = root.current;
    const ctx = gsap.context(() => {
      const layers = el.querySelectorAll('.shot-layer');
      gsap.set(layers, { clipPath: 'inset(100% 0% 0% 0%)' });
      gsap.set(layers[0], { clipPath: 'inset(0% 0% 0% 0%)' });
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: el, start: 'top top', end: `+=${n * 90}%`, pin: true, scrub: 0.6, anticipatePin: 1,
          onUpdate: (self) => {
            if (bar.current) bar.current.style.transform = `scaleX(${self.progress})`;
            setActive(Math.min(n - 1, Math.floor(self.progress * n)));
          },
        },
      });
      layers.forEach((layer, i) => {
        const img = layer.querySelector('.shot-img');
        const cap = layer.querySelectorAll('.shot-cap');
        if (i > 0) {
          tl.to(layers[i - 1], { clipPath: 'inset(0% 0% 100% 0%)', ease: 'power2.inOut', duration: 1 }, i)
            .fromTo(layer, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', ease: 'power2.inOut', duration: 1 }, i)
            .fromTo(img, { scale: 1.22, yPercent: 10 }, { scale: 1.04, yPercent: 0, ease: 'power2.out', duration: 1 }, i)
            .fromTo(cap, { y: 44, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.08, duration: 0.5, ease: 'power3.out' }, i + 0.45);
        } else {
          tl.fromTo(img, { scale: 1.12 }, { scale: 1.04, ease: 'none', duration: 1 }, 0);
        }
        // slow drift while the shot is on screen
        tl.to(img, { yPercent: -4, ease: 'none', duration: 0.6 }, i + 0.4);
      });
      tl.to({}, { duration: 0.4 }); // settle beat at the end
    }, el);
    return () => ctx.revert();
  }, [pinned, n]);

  return (
    <section ref={root} className="shots relative bg-ink-950" aria-roledescription="carousel" aria-label="Design in motion">
      <div className={pinned ? 'relative h-[var(--cc-vh,100svh)] overflow-hidden' : ''}>
        <Atmosphere className="absolute inset-0 z-[3]" density={0.7} glow={0.35} />
        {shots.map((s, i) => (
          <article key={s.id} className={pinned
            ? 'shot-layer absolute inset-0 overflow-hidden'
            : 'shot-layer relative mx-4 mb-6 aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 sm:mx-8 sm:aspect-[16/9]'}>
            <img src={s.image} alt={s.alt} loading={i === 0 ? 'eager' : 'lazy'} decoding="async"
              className={`shot-img absolute inset-0 h-full w-full object-cover ${s.focus || ''}`} />
            <div className="absolute inset-0 bg-gradient-to-r from-ink-950/95 via-ink-950/60 to-ink-950/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-ink-950/90 via-ink-950/15 to-ink-950/40" />
            <div className="shot-capwrap relative z-[4] flex h-full flex-col justify-end px-6 pb-20 pt-24 sm:px-12 lg:px-20 lg:pb-24">
              <p className="shot-cap kicker">{s.kicker}</p>
              <h3 className="shot-cap display-xl mt-3 max-w-3xl text-[11vw] text-white sm:text-[6.5vw] lg:text-[4.8vw]">{s.title}</h3>
              {s.specs && (
                <div className="shot-cap mt-6 flex flex-wrap gap-x-8 gap-y-4">
                  {s.specs.map(([k, v]) => (
                    <div key={k} className="border-l border-white/25 pl-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-white/50">{k}</p>
                      <p className="mt-1 font-display text-lg font-extrabold text-white sm:text-xl">{v}</p>
                    </div>
                  ))}
                </div>
              )}
              {s.specs && (
                <p className="shot-cap mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">Sample catalogue figures - not certified ratings</p>
              )}
              {s.link && (
                <div className="shot-cap mt-7">
                  <Link to={s.link.to} className="btn-ghost !px-6 !py-3">{s.link.label} →</Link>
                </div>
              )}
              <p className="shot-cap mt-6 max-w-md text-[10px] leading-tight text-white/55">{s.credit}</p>
            </div>
          </article>
        ))}
        {pinned && (
          <>
            <div className="absolute inset-x-0 bottom-0 z-[6] flex items-center justify-between px-6 pb-5 sm:px-12">
              <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/70" aria-live="polite">
                {String(active + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}<span className="hidden sm:inline"> · {shots[active] && shots[active].kicker}</span>
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Keep scrolling</p>
            </div>
            <div className="hj-progress" aria-hidden="true"><i ref={bar} /></div>
          </>
        )}
      </div>
    </section>
  );
}

/** Scene D - featured vehicles with real specs and links to detail pages. */
export function Featured({ cars }) {
  return (
    <section className="relative border-t border-white/10 bg-ink-950 py-24 overflow-hidden">
      <Atmosphere className="absolute inset-0" density={0.45} glow={0.28} />
      <div className="container-x relative">
        <Reveal>
          <p className="kicker">Featured this week</p>
          <h2 className="mt-3 max-w-2xl text-3xl font-extrabold tracking-tight text-white sm:text-5xl">The ones buyers group up for</h2>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-slate-500">Real catalogue entries, sample buyer groups. Prices, mileage and safety figures are sample catalogue data - indicative demo values, not certified or current ratings.</p>
        </Reveal>
        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {cars.map((c, i) => (
            <Reveal key={c.id} delay={i * 110}>
              <Tilt className="h-full">
                <div className="card group flex h-full flex-col overflow-hidden">
                  <Link to={`/cars/${c.id}`} className="relative block overflow-hidden" aria-label={`${c.name} details`}>
                    <div className="mask-reveal">
                      <img src={c.photo} alt={c.photoAlt} loading="lazy" decoding="async"
                        className="aspect-[16/10] w-full object-cover transition duration-700 group-hover:scale-[1.05]" />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-ink-950/70 to-transparent opacity-70" />
                    <p className="absolute bottom-3 left-4 text-[10px] text-white/60">{c.photoNote}</p>
                  </Link>
                  <div className="flex flex-1 flex-col p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-300">{c.body} · {c.fuel}</p>
                    <Link to={`/cars/${c.id}`} className="mt-1 font-display text-xl font-extrabold text-white hover:text-brand-300">{c.name}</Link>
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {c.chips.map((chip) => <span key={chip} className="chip bg-white/5 text-[11px] text-slate-400">{chip}</span>)}
                    </div>
                    <p className="mt-3 font-display text-lg font-extrabold text-brand-900">{c.price} <span className="text-xs font-semibold text-slate-400">ex-showroom (indicative)</span></p>
                    <div className="mt-auto flex gap-2 pt-4">
                      <Link to={`/cars/${c.id}`} className="btn-primary flex-1 !py-2.5">Full details</Link>
                      <Link to="/groups" className="btn-ghost !px-4 !py-2.5">Groups</Link>
                    </div>
                  </div>
                </div>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Scene E - craftsmanship: editorial masked reveals over the real photo set. */
export function Craft({ rows }) {
  return (
    <section className="border-t border-white/10 bg-ink-900 py-24">
      <div className="container-x">
        <Reveal className="max-w-2xl">
          <p className="kicker">Up close</p>
          <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">Every angle, honestly labelled</h2>
          <p className="mt-3 text-base leading-relaxed text-slate-500">
            What you see is the actual photograph we hold for each vehicle - author, licence, generation and market,
            all disclosed on the credits page. No render passed off as a car you could buy.
          </p>
        </Reveal>
        <div className="mt-14 space-y-16">
          {rows.map((r, i) => (
            <div key={r.title} className={`grid items-center gap-8 lg:grid-cols-2 ${i % 2 ? 'lg:[&>*:first-child]:order-2' : ''}`}>
              <Reveal>
                <Link to={r.to || '/cars'} className="group relative block overflow-hidden rounded-2xl border border-white/10">
                  <div className="mask-reveal">
                    <img src={r.image} alt={r.alt} loading="lazy" decoding="async"
                      className={`aspect-[16/9] w-full object-cover transition duration-700 group-hover:scale-[1.04] ${r.focus || ''}`} />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/60 to-transparent" />
                  <p className="absolute bottom-3 left-4 right-4 text-[10px] leading-tight text-white/60">{r.credit}</p>
                </Link>
              </Reveal>
              <Reveal delay={120}>
                <p className="kicker">{r.kicker}</p>
                <h3 className="mt-3 text-2xl font-extrabold tracking-tight text-white sm:text-3xl">{r.title}</h3>
                <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-500">{r.body}</p>
                {r.link && <Link to={r.link.to} className="mt-5 inline-block text-sm font-bold text-brand-300 hover:text-brand-400">{r.link.label} →</Link>}
              </Reveal>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
