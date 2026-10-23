import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const mq = (q) => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(q) : { matches: false, addEventListener() {}, removeEventListener() {} });
export const prefersReducedMotion = () => mq('(prefers-reduced-motion: reduce)').matches;

/** Minimal CarCohort-branded loading transition. Skipped for reduced motion. */
export function Loader() {
  const [done, setDone] = useState(() => prefersReducedMotion());
  useEffect(() => {
    if (done) return undefined;
    const t = setTimeout(() => setDone(true), 900);
    return () => clearTimeout(t);
  }, [done]);
  return (
    <div className={`cc-loader ${done ? 'done' : ''}`} aria-hidden={done} role="status">
      <div className="text-center">
        <p className="font-display text-2xl font-extrabold uppercase tracking-[0.3em] text-white">Car<span className="text-brand-400">Cohort</span></p>
        <div className="cc-loader-line mx-auto"><i /></div>
        <span className="sr-only">Loading</span>
      </div>
    </div>
  );
}

/** Soft red glow that follows the pointer. Desktop fine-pointer only. */
export function CursorGlow() {
  const ref = useRef(null);
  useEffect(() => {
    if (!mq('(hover: hover) and (pointer: fine)').matches || prefersReducedMotion()) return undefined;
    const el = ref.current;
    const move = (e) => {
      el.classList.add('on');
      gsap.to(el, { x: e.clientX, y: e.clientY, duration: 0.6, ease: 'power3.out' });
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);
  return <div ref={ref} className="cursor-glow" aria-hidden="true" />;
}

/** Fade/slide in on first view. */
export function Reveal({ as: Tag = 'div', delay = 0, className = '', children, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (prefersReducedMotion() || !('IntersectionObserver' in window)) { el.classList.add('in'); return undefined; }
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setTimeout(() => el.classList.add('in'), delay); io.disconnect(); }
    }, { threshold: 0.12 });
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);
  return <Tag ref={ref} className={`reveal ${className}`} {...rest}>{children}</Tag>;
}

/** Number that counts up when scrolled into view (final value always in the DOM text once done / for reduced motion). */
export function CountUp({ value, format = (n) => String(n) }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(value);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !('IntersectionObserver' in window)) { setShown(value); return undefined; }
    setShown(0);
    let tween;
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      const o = { n: 0 };
      tween = gsap.to(o, { n: value, duration: 1.4, ease: 'power2.out', onUpdate: () => setShown(Math.round(o.n)) });
      io.disconnect();
    }, { threshold: 0.4 });
    io.observe(el);
    return () => { io.disconnect(); tween && tween.kill(); };
  }, [value]);
  return <span ref={ref}>{format(shown)}</span>;
}

/** Magnetic hover for CTAs; no-op on touch and reduced motion. */
export function useMagnetic() {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || !mq('(hover: hover) and (pointer: fine)').matches || prefersReducedMotion()) return undefined;
    const mv = (e) => {
      const r = el.getBoundingClientRect();
      gsap.to(el, { x: (e.clientX - r.left - r.width / 2) * 0.22, y: (e.clientY - r.top - r.height / 2) * 0.3, duration: 0.35, ease: 'power3.out' });
    };
    const lv = () => gsap.to(el, { x: 0, y: 0, duration: 0.5, ease: 'elastic.out(1,0.5)' });
    el.addEventListener('pointermove', mv); el.addEventListener('pointerleave', lv);
    return () => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerleave', lv); };
  }, []);
  return ref;
}

/** Independent horizontal carousel: drag (mouse), swipe (touch), arrows, scroll-snap. */
export function Rail({ label, children }) {
  const ref = useRef(null);
  const drag = useRef({ down: false, x: 0, left: 0, moved: false });
  const by = (dir) => ref.current && ref.current.scrollBy({ left: dir * Math.max(300, ref.current.clientWidth * 0.8), behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  const onDown = (e) => {
    if (e.pointerType !== 'mouse') return;
    drag.current = { down: true, x: e.clientX, left: ref.current.scrollLeft, moved: false };
  };
  const onMove = (e) => {
    const d = drag.current;
    if (!d.down) return;
    const dx = e.clientX - d.x;
    if (Math.abs(dx) > 5) { d.moved = true; ref.current.classList.add('dragging'); }
    ref.current.scrollLeft = d.left - dx;
  };
  const end = () => { drag.current.down = false; ref.current && ref.current.classList.remove('dragging'); };
  const onClickCapture = (e) => { if (drag.current.moved) { e.preventDefault(); e.stopPropagation(); drag.current.moved = false; } };
  return (
    <div>
      <div className="mb-4 flex justify-end gap-2">
        <button type="button" className="btn-ghost !h-10 !w-10 !px-0" aria-label={`${label}: previous`} onClick={() => by(-1)}>←</button>
        <button type="button" className="btn-ghost !h-10 !w-10 !px-0" aria-label={`${label}: next`} onClick={() => by(1)}>→</button>
      </div>
      <div ref={ref} className="rail" role="group" aria-label={label} tabIndex={0}
        onPointerDown={onDown} onPointerMove={onMove} onPointerUp={end} onPointerLeave={end} onClickCapture={onClickCapture}
        onKeyDown={(e) => { if (e.key === 'ArrowRight') by(1); if (e.key === 'ArrowLeft') by(-1); }}>
        {children}
      </div>
    </div>
  );
}

/**
 * Signature pinned horizontal journey. Vertical scroll drives a horizontal
 * translate (GSAP ScrollTrigger) on desktop. Touch devices, small screens and
 * reduced-motion users get a native swipeable, scroll-snapped row instead, so
 * normal page scrolling is never trapped.
 */
export function HorizontalJourney({ panels, label = 'CarCohort journey' }) {
  const root = useRef(null);
  const track = useRef(null);
  const bar = useRef(null);
  const st = useRef(null);
  const [swipe, setSwipe] = useState(true);
  const [active, setActive] = useState(0);
  const n = panels.length;

  useEffect(() => {
    const q = mq('(min-width: 1024px) and (hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    // Hosted File previews render inside an auto-height iframe: no inner scroll, so pinning cannot work. Use swipe mode there.
    const hosted = typeof window !== 'undefined' && window.__CC_HOSTED__;
    const upd = () => setSwipe(hosted || !q.matches);
    upd();
    q.addEventListener('change', upd);
    return () => q.removeEventListener('change', upd);
  }, []);

  // pinned desktop mode
  useLayoutEffect(() => {
    if (swipe) return undefined;
    const el = root.current; const tr = track.current;
    const dist = () => Math.max(0, tr.scrollWidth - window.innerWidth);
    const ctx = gsap.context(() => {
      const tween = gsap.to(tr, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: {
          trigger: el, start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true,
          onUpdate: (self) => {
            gsap.set(bar.current, { scaleX: self.progress });
            setActive(Math.min(n - 1, Math.round(self.progress * (n - 1))));
          },
        },
      });
      st.current = tween.scrollTrigger;
      el.querySelectorAll('.hj-panel').forEach((p, pi) => {
        const bg = p.querySelector('.hj-bg');
        if (bg) gsap.fromTo(bg, { xPercent: -5 }, { xPercent: 5, ease: 'none', scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
        p.querySelectorAll('[data-speed]').forEach((t) => {
          const s = parseFloat(t.dataset.speed);
          gsap.fromTo(t, { x: 90 * s }, { x: -90 * s, ease: 'none', scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
        });
        if (pi > 0) p.querySelectorAll('[data-rise]').forEach((t, i) => {
          gsap.from(t, { y: 40, opacity: 0, duration: 0.9, ease: 'power3.out', delay: i * 0.08, scrollTrigger: { trigger: p, containerAnimation: tween, start: 'left 70%', toggleActions: 'play none none reverse' } });
        });
      }, el);
    }, el);
    const refresh = () => ScrollTrigger.refresh();
    window.addEventListener('load', refresh);
    const imgs = [...el.querySelectorAll('img')];
    imgs.forEach((i) => { if (!i.complete) i.addEventListener('load', refresh, { once: true }); });
    return () => { window.removeEventListener('load', refresh); ctx.revert(); st.current = null; gsap.set(tr, { clearProps: 'all' }); };
  }, [swipe, n]);

  // swipe mode: derive active panel from scroll position
  useEffect(() => {
    if (!swipe) return undefined;
    const tr = track.current;
    const onScroll = () => {
      setActive(Math.round(tr.scrollLeft / tr.clientWidth));
      if (bar.current) bar.current.style.transform = `scaleX(${tr.scrollWidth > tr.clientWidth ? tr.scrollLeft / (tr.scrollWidth - tr.clientWidth) : 0})`;
    };
    onScroll();
    tr.addEventListener('scroll', onScroll, { passive: true });
    return () => tr.removeEventListener('scroll', onScroll);
  }, [swipe]);

  const goTo = useCallback((i) => {
    const idx = Math.max(0, Math.min(n - 1, i));
    if (swipe) {
      const tr = track.current;
      tr.scrollTo({ left: idx * tr.clientWidth, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    } else if (st.current) {
      const y = st.current.start + (st.current.end - st.current.start) * (idx / (n - 1));
      window.scrollTo({ top: y, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }
  }, [swipe, n]);

  return (
    <section ref={root} className={`hj ${swipe ? 'is-swipe' : ''}`} aria-roledescription="carousel" aria-label={label} id="journey">
      <div className="pointer-events-none absolute inset-x-0 top-20 z-10 hidden justify-end px-8 md:flex">
        <a href="#after-journey" className="pointer-events-auto glass rounded-full px-4 py-2 text-xs font-semibold tracking-wide text-white">Skip journey ↓</a>
      </div>
      <div ref={track} className="hj-track" tabIndex={swipe ? 0 : -1} aria-live="off"
        onKeyDown={(e) => { if (e.key === 'ArrowRight') { e.preventDefault(); goTo(active + 1); } if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(active - 1); } }}>
        {panels.map((p, i) => (
          <article key={p.id} className="hj-panel" role="group" aria-roledescription="slide" aria-label={`${i + 1} of ${n}: ${p.kicker}`}
            onFocusCapture={() => { if (!swipe && i !== active) goTo(i); }}>
            {p.image && <img className="hj-bg" src={p.image} alt="" loading={i < 2 ? 'eager' : 'lazy'} decoding="async" />}
            <div className="hj-shade" />
            <div className="hj-inner relative z-[2] flex h-full flex-col px-6 pb-24 pt-24 sm:px-12 lg:px-20 lg:pb-28 lg:pt-28"><div className="mt-auto">{p.content}</div></div>
            <p className="absolute bottom-[3.7rem] left-4 right-4 z-[3] text-[10px] normal-case leading-tight tracking-normal text-white/70 sm:left-auto sm:top-[4.5rem] sm:bottom-auto sm:right-4 sm:text-white/55 lg:right-8 lg:top-auto lg:bottom-14">{p.credit ? <>Photo: {p.credit} · <Link className="pointer-events-auto underline" to="/credits">credits</Link></> : 'Photo'}</p>
          </article>
        ))}
      </div>
      <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between gap-4 px-4 pb-4 sm:px-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-white/70" aria-live="polite">{String(active + 1).padStart(2, '0')} / {String(n).padStart(2, '0')}<span className="hidden sm:inline"> · {panels[active] && panels[active].kicker}</span></p>
        <div className="hj-dots flex items-center" role="tablist" aria-label="Journey scenes">
          {panels.map((p, i) => (
            <button key={p.id} type="button" role="tab" aria-selected={i === active} aria-current={i === active} aria-label={`Go to ${p.kicker}`} onClick={() => goTo(i)}><span /></button>
          ))}
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-ghost !h-10 !w-10 !px-0" aria-label="Previous scene" onClick={() => goTo(active - 1)} disabled={active === 0}>←</button>
          <button type="button" className="btn-ghost !h-10 !w-10 !px-0" aria-label="Next scene" onClick={() => goTo(active + 1)} disabled={active === n - 1}>→</button>
        </div>
      </div>
      <div className="hj-progress" aria-hidden="true"><i ref={bar} /></div>
    </section>
  );
}
