import { PHOTOS, CREDITS, SHOWN } from './photos.js';
import gsap from 'gsap';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from './store.jsx';
import { daysLeft } from './utils.js';

export function Logo({ light = false }) {
  return (
    <Link to="/" className="flex items-baseline gap-0.5" aria-label="CarCohort home">
      <span className={`font-display text-[22px] font-bold uppercase leading-none tracking-[0.06em] ${light ? 'text-white' : 'text-ink-900'}`}>
        Car<span className="text-brand-500">/</span>Cohort
      </span>
      <span className={`ml-2 hidden text-[9px] font-bold uppercase tracking-[0.24em] sm:block ${light ? 'text-white/55' : 'text-slate-400'}`}>Group buying · India</span>
    </Link>
  );
}

const MENU_ITEMS = [
  { to: '/', label: 'Start' },
  { to: '/cars', label: 'Vehicles' },
  { to: '/groups', label: 'Live groups' },
  { to: '/compare', label: 'Compare' },
  { to: '/dealers', label: 'For dealers' },
  { to: '/request', label: 'Get a quote' },
];

export function Navbar() {
  const { state, signOut } = useApp();
  const nav = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const headerRef = useRef(null);

  // Sakura-style: header inverts over dark sections.
  useEffect(() => {
    const sections = [...document.querySelectorAll('[data-header-dark]')];
    if (!sections.length) { setDark(false); return undefined; }
    const onScroll = () => {
      setScrolled(window.scrollY > 8);
      const hr = headerRef.current ? headerRef.current.getBoundingClientRect() : { top: 0, height: 76 };
      const y = hr.top + hr.height / 2;
      setDark(sections.some((s) => { const r = s.getBoundingClientRect(); return r.top <= y && r.bottom >= y; }));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [pathname]);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  const light = dark || open;
  const dash = state.user?.role === 'dealer' ? '/dealer/dashboard' : '/dashboard';
  const items = [...MENU_ITEMS.slice(0, 5), { to: dash, label: state.user?.role === 'dealer' ? 'Dealer dashboard' : 'My dashboard' }, MENU_ITEMS[5]];

  return (
    <>
      <header ref={headerRef} className={`fixed inset-x-0 top-9 transition-colors duration-300 sm:top-6 ${open ? 'z-[80]' : 'z-50'} ${scrolled && !open ? (light ? 'bg-ink-950/75 backdrop-blur-md' : 'bg-paper/85 backdrop-blur-md') : ''}`}>
        <div className="container-x flex h-[76px] items-center justify-between">
          <Logo light={light} />
          <div className="flex items-center gap-2 sm:gap-3">
            <nav className={`hidden items-center gap-6 text-[13px] font-bold uppercase tracking-[0.14em] lg:flex ${light ? 'text-white/85' : 'text-ink-900'}`}>
              <NavLink to="/cars" className="transition hover:text-brand-500">Vehicles</NavLink>
              <NavLink to="/groups" className="transition hover:text-brand-500">Groups</NavLink>
              <NavLink to="/compare" className="transition hover:text-brand-500">Compare</NavLink>
            </nav>
            {state.user ? (
              <button onClick={() => { signOut(); nav('/'); }} className={`hidden rounded-full border px-4 py-2 text-[12px] font-bold uppercase tracking-[0.12em] transition sm:block ${light ? 'border-white/40 text-white hover:bg-white hover:text-ink-900' : 'border-ink-900/40 text-ink-900 hover:bg-ink-900 hover:text-paper'}`}>
                Sign out · {state.user.name}
              </button>
            ) : (
              <Link to="/signin" className={`hidden rounded-full px-4 py-2 text-[12px] font-bold uppercase tracking-[0.12em] transition sm:block ${light ? 'text-white hover:text-brand-300' : 'text-ink-900 hover:text-brand-500'}`}>Sign in</Link>
            )}
            <Link to="/request" className={`hidden rounded-full px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.12em] transition sm:block ${light ? 'bg-white text-ink-900 hover:bg-brand-500 hover:text-white' : 'bg-ink-900 text-paper hover:bg-brand-500 hover:text-white'}`}>Get a quote</Link>
            <button
              onClick={() => setOpen(!open)}
              aria-expanded={open}
              aria-label={open ? 'Close menu' : 'Open menu'}
              className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-[12px] font-bold uppercase tracking-[0.12em] transition ${open ? 'z-[75] border-white/50 text-white hover:bg-white hover:text-ink-900' : dark ? 'border-white/50 text-white hover:bg-white hover:text-ink-900' : 'border-ink-900/50 text-ink-900 hover:bg-ink-900 hover:text-paper'}`}
            >
              {open ? 'Close' : 'Menu'}
              {open
                ? <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M6 6l12 12M18 6L6 18" /></svg>
                : <svg width="16" height="12" viewBox="0 0 24 18" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M2 2h20M2 9h20M2 16h20" /></svg>}
            </button>
          </div>
        </div>
      </header>

      {/* Sakura-style right slide-in menu panel */}
      <div className={`menu-scrim ${open ? 'open' : ''}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <aside className={`menu-panel ${open ? 'open' : ''}`} aria-hidden={!open} aria-label="Site menu">
        <div className="pointer-events-none absolute inset-0 opacity-[0.10]">
          <img src={PHOTOS.thar} alt="" className="h-full w-full object-cover" />
        </div>
        <div className="relative flex h-full flex-col justify-between px-8 pb-10 pt-28 sm:px-12">
          <nav className="space-y-1">
            {items.map((m, i) => (
              <span key={m.to} className="menu-item block" style={{ transitionDelay: open ? `${120 + i * 60}ms` : '0ms' }}>
                <NavLink to={m.to} className={({ isActive }) => `menu-link ${isActive ? 'active' : ''}`}>{m.label}</NavLink>
              </span>
            ))}
            {state.user && (
              <span className="menu-item block" style={{ transitionDelay: open ? `${120 + items.length * 60}ms` : '0ms' }}>
                <button className="menu-link" onClick={() => { signOut(); setOpen(false); nav('/'); }}>Sign out</button>
              </span>
            )}
          </nav>
          <div className="menu-item space-y-4" style={{ transitionDelay: open ? `${200 + items.length * 60}ms` : '0ms' }}>
            <Link to="/request" className="btn-primary w-full !py-4 !text-[13px]" onClick={() => setOpen(false)}>Request a group quote</Link>
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/45">Interactive prototype · all data fictional</p>
          </div>
        </div>
      </aside>
    </>
  );
}

export function Footer() {
  return (
    <footer data-header-dark className="bg-ink-950 text-white/70">
      <div className="container-x grid gap-12 py-16 lg:grid-cols-12 lg:py-20">
        <div className="lg:col-span-5">
          <h2 className="font-display text-4xl font-medium leading-[1.05] text-white sm:text-5xl">
            Your next car,<br /><span className="serif-accent">bought together.</span>
          </h2>
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/60">
            A group vehicle-buying prototype for India. Buyers who want the same vehicle in the same city team up, dealerships compete for the group, and every final on-road price sits side by side.
          </p>
          <span className="chip mt-6 border border-white/15 bg-white/5 text-accent-300">Interactive prototype · all data fictional</span>
        </div>
        <div className="lg:col-span-3">
          <h4 className="text-xs font-bold uppercase tracking-[0.22em] text-white/45">Navigate</h4>
          <ul className="mt-5 space-y-2.5 text-sm">
            <li><Link className="transition hover:text-brand-300" to="/cars">Browse vehicles</Link></li>
            <li><Link className="transition hover:text-brand-300" to="/groups">Live buying groups</Link></li>
            <li><Link className="transition hover:text-brand-300" to="/compare">Compare offers</Link></li>
            <li><Link className="transition hover:text-brand-300" to="/dealers">Partner with us</Link></li>
            <li><Link className="transition hover:text-brand-300" to="/dashboard">Buyer dashboard</Link></li>
            <li><Link className="transition hover:text-brand-300" to="/request">Get a quote</Link></li>
          </ul>
        </div>
        <div className="lg:col-span-2">
          <h4 className="text-xs font-bold uppercase tracking-[0.22em] text-white/45">Legal</h4>
          <ul className="mt-5 space-y-2.5 text-sm">
            <li><Link className="transition hover:text-brand-300" to="/terms">Terms</Link></li>
            <li><Link className="transition hover:text-brand-300" to="/privacy">Privacy</Link></li>
            <li><Link className="transition hover:text-brand-300" to="/security">Security</Link></li>
            <li><Link className="transition hover:text-brand-300" to="/credits">Photo credits</Link></li>
          </ul>
        </div>
        <div className="lg:col-span-2">
          <h4 className="text-xs font-bold uppercase tracking-[0.22em] text-white/45">Sample cities</h4>
          <p className="mt-5 text-sm leading-relaxed text-white/60">Mumbai · Delhi NCR · Bengaluru · Pune · Chandigarh</p>
          <p className="mt-4 text-xs leading-relaxed text-white/40">Every buyer owns their own vehicle. No sharing, no fractional ownership.</p>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/40">
        CarCohort prototype. Prices shown are indicative demo figures, not live dealer quotes.
      </div>
    </footer>
  );
}

export function Badge({ children, cls = 'bg-slate-100 text-slate-700' }) {
  return <span className={`chip ${cls}`}>{children}</span>;
}

export function ProgressBar({ value, max }) {
  const pct = Math.min(100, Math.round((value / max) * 100));
  return (
    <div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-accent-500 transition-all" style={{ width: `${pct}%` }} />
      </div>
      <div className="mt-1.5 flex justify-between text-xs font-semibold text-slate-500">
        <span>{value} joined</span><span>target {max}</span>
      </div>
    </div>
  );
}

export function Countdown({ deadline }) {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(t);
  }, []);
  const d = daysLeft(deadline, now);
  return (
    <span className={`chip ${d <= 3 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-700'}`}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 3" /></svg>
      {d === 0 ? 'Closes today' : `${d} day${d === 1 ? '' : 's'} left`}
    </span>
  );
}

export function CarPhoto({ car, className = '' }) {
  const src = car && PHOTOS[car.id];
  const c = car && CREDITS[car.id];
  if (!src) {
    return (
      <div className={`flex aspect-[4/3] items-center justify-center rounded-[6px] border border-dashed border-ink-900/20 bg-paper-deep px-4 text-center text-xs text-slate-500 ${className}`}>
        {car ? `${car.name}: no verified, openly licensed photo yet` : 'Photo not available'}
      </div>
    );
  }
  return (
    <figure className={className}>
      <img src={src} alt={`${car.name} photograph (see photo credits for the exact model year shown)`} loading="lazy" className="aspect-[4/3] w-full rounded-[6px] object-cover" />
      <figcaption className="mt-1 inline-block rounded bg-paper px-2 py-1 text-[10px] leading-tight text-slate-600">
        Photo shows: {SHOWN[car.id]} · {c.author} · {c.license} · <Link className="underline" to="/credits">credits</Link>
      </figcaption>
    </figure>
  );
}

export function CarArt({ body = 'SUV', type = 'car', className = '' }) {
  if (type === 'bike' || type === 'scooter' || body === 'Scooter' || body === 'Cruiser' || body === 'Commuter') {
    return (
      <svg viewBox="0 0 432 190" className={className} role="img" aria-label={`${body} illustration`}>
        <ellipse cx="214" cy="162" rx="150" ry="10" fill="#252525" fillOpacity="0.08" />
        <path d="M150 96 L190 60 Q196 54 206 54 L250 54 Q260 54 266 62 L292 96 L306 100 Q318 104 318 116 L318 126 L300 126 Q296 106 278 106 Q260 106 256 126 L180 126 Q176 106 158 106 Q140 106 136 126 L118 126 L118 116 Q118 102 134 98 Z" fill="url(#cg-bike)" />
        <defs><linearGradient id="cg-bike" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#dcdad2" /><stop offset="100%" stopColor="#b9b6ac" /></linearGradient></defs>
        <rect x="196" y="60" width="46" height="16" rx="6" fill="#9fb6c4" opacity="0.85" />
        <circle cx="157" cy="130" r="22" fill="#252525" /><circle cx="157" cy="130" r="9" fill="#918e84" />
        <circle cx="279" cy="130" r="22" fill="#252525" /><circle cx="279" cy="130" r="9" fill="#918e84" />
        <rect x="112" y="106" width="14" height="7" rx="3.5" fill="#e03e39" />
      </svg>
    );
  }
  const shapes = {
    Hatchback: 'M120 78 L150 52 Q156 46 166 46 L246 46 Q258 46 266 54 L292 78 L316 84 Q336 89 336 108 L336 128 Q336 140 324 140 L104 140 Q92 140 92 128 L92 108 Q92 84 120 78 Z',
    'Micro SUV': 'M112 84 L146 54 Q154 46 166 46 L252 46 Q264 46 272 56 L296 84 L318 90 Q336 96 336 112 L336 132 Q336 144 324 144 L104 144 Q92 144 92 132 L92 112 Q92 90 112 84 Z',
    'Compact SUV': 'M110 82 L148 50 Q156 44 168 44 L256 44 Q268 44 276 54 L300 82 L322 88 Q340 94 340 112 L340 134 Q340 146 328 146 L100 146 Q88 146 88 134 L88 112 Q88 88 110 82 Z',
    SUV: 'M104 80 L144 46 Q152 40 164 40 L262 40 Q274 40 282 52 L306 80 L326 88 Q344 94 344 112 L344 136 Q344 148 332 148 L96 148 Q84 148 84 136 L84 112 Q84 86 104 80 Z',
    Sedan: 'M108 86 L158 56 Q166 50 178 50 L250 50 Q262 50 270 58 L296 82 L322 88 Q340 94 340 110 L340 130 Q340 142 328 142 L100 142 Q88 142 88 130 L88 112 Q88 92 108 86 Z',
    MPV: 'M100 76 L138 44 Q146 38 158 38 L268 38 Q280 38 288 50 L310 78 L328 86 Q344 92 344 110 L344 134 Q344 146 332 146 L96 146 Q84 146 84 134 L84 108 Q84 82 100 76 Z',
  };
  const path = shapes[body] || shapes.SUV;
  return (
    <svg viewBox="0 0 432 190" className={className} role="img" aria-label={`${body} illustration`}>
      <defs>
        <linearGradient id={`cg-${body.replace(/\s/g, '')}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#dcdad2" /><stop offset="100%" stopColor="#b9b6ac" />
        </linearGradient>
      </defs>
      <ellipse cx="214" cy="162" rx="180" ry="12" fill="#252525" fillOpacity="0.08" />
      <path d={path} fill={`url(#cg-${body.replace(/\s/g, '')})`} />
      <path d={path} fill="none" stroke="#e03e39" strokeOpacity="0.55" strokeWidth="2" />
      <rect x="160" y="54" width="52" height="30" rx="6" fill="#9fb6c4" opacity="0.85" />
      <rect x="222" y="54" width="52" height="30" rx="6" fill="#9fb6c4" opacity="0.85" />
      <circle cx="150" cy="140" r="24" fill="#252525" /><circle cx="150" cy="140" r="11" fill="#918e84" />
      <circle cx="286" cy="140" r="24" fill="#252525" /><circle cx="286" cy="140" r="11" fill="#918e84" />
      <rect x="96" y="98" width="18" height="8" rx="4" fill="#e03e39" />
    </svg>
  );
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <h3 className="font-display text-xl font-bold text-ink-900">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export function SectionHeading({ kicker, title, sub, center = false, dark = false }) {
  return (
    <div className={`${center ? 'text-center mx-auto' : ''} max-w-2xl`}>
      <p className="kicker">{kicker}</p>
      <h2 className={`mt-4 font-display text-4xl font-medium leading-[1.04] sm:text-5xl ${dark ? 'text-white' : 'text-ink-900'}`}>{title}</h2>
      {sub && <p className={`mt-4 text-base leading-relaxed ${dark ? 'text-white/65' : 'text-slate-500'}`}>{sub}</p>}
    </div>
  );
}

/** Subtle pointer tilt for cards. Desktop fine-pointer only; inert otherwise. */
export function Tilt({ className = '', children, max = 4 }) {
  const ref = useRef(null);
  useEffect(() => {
    const el = ref.current;
    const fine = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduced = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!el || !fine || reduced) return undefined;
    const mv = (e) => {
      const r = el.getBoundingClientRect();
      const rx = ((e.clientY - r.top) / r.height - 0.5) * -2 * max;
      const ry = ((e.clientX - r.left) / r.width - 0.5) * 2 * max;
      gsap.to(el, { rotationX: rx, rotationY: ry, transformPerspective: 900, duration: 0.5, ease: 'power3.out' });
    };
    const lv = () => gsap.to(el, { rotationX: 0, rotationY: 0, duration: 0.7, ease: 'power3.out' });
    el.addEventListener('pointermove', mv);
    el.addEventListener('pointerleave', lv);
    return () => { el.removeEventListener('pointermove', mv); el.removeEventListener('pointerleave', lv); };
  }, [max]);
  return <div ref={ref} className={className} style={{ transformStyle: 'preserve-3d' }}>{children}</div>;
}
