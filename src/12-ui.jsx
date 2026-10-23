import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useApp } from './store.jsx';
import { daysLeft } from './utils.js';

export function Logo({ light = false }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <svg width="34" height="34" viewBox="0 0 64 64" aria-hidden="true">
        <rect width="64" height="64" rx="4" fill="#e50914" />
        <path d="M14 38l4-10a6 6 0 0 1 5.5-3.5h17A6 6 0 0 1 46 28l4 10a4 4 0 0 1 2 3.2V46a2 2 0 0 1-2 2h-2.5a2 2 0 0 1-2-2v-1h-27v1a2 2 0 0 1-2 2H14a2 2 0 0 1-2-2v-4.8a4 4 0 0 1 2-3.2z" fill="#fff" />
        <circle cx="23" cy="44" r="4.5" fill="#e50914" stroke="#fff" strokeWidth="2" />
        <circle cx="41" cy="44" r="4.5" fill="#e50914" stroke="#fff" strokeWidth="2" />
      </svg>
      <span className={`font-display text-lg font-extrabold uppercase tracking-[0.12em] text-white`}>
        Car<span className="text-brand-400">Cohort</span>
      </span>
    </Link>
  );
}

export function Navbar() {
  const { state, signOut } = useApp();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const linkCls = ({ isActive }) =>
    `rounded-full px-3 py-2 text-[13px] font-semibold tracking-wide transition ${isActive ? 'bg-white/10 text-white' : 'text-slate-600 hover:text-white'}`;
  return (
    <header className="sticky top-0 z-40 h-0 px-3 sm:px-6">
      <div className="glass mx-auto mt-3 flex h-14 max-w-7xl items-center justify-between rounded-full px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/cars" className={linkCls}>Vehicles</NavLink>
          <NavLink to="/groups" className={linkCls}>Live groups</NavLink>
          <NavLink to="/compare" className={linkCls}>Compare</NavLink>
          <NavLink to="/dealers" className={linkCls}>For dealers</NavLink>
          {state.user?.role === 'dealer'
            ? <NavLink to="/dealer/dashboard" className={linkCls}>Dealer dashboard</NavLink>
            : <NavLink to="/dashboard" className={linkCls}>My dashboard</NavLink>}
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          <Link to="/request" className="btn-accent !px-4 !py-2">Get a quote</Link>
          {state.user ? (
            <>
              <span className="chip bg-white/10 text-slate-800">{state.user.role === 'dealer' ? 'Dealer' : 'Buyer'} · {state.user.name}</span>
              <button className="btn-ghost !px-4 !py-2" onClick={() => { signOut(); nav('/'); }}>Sign out</button>
            </>
          ) : (
            <Link to="/signin" className="btn-primary !px-4 !py-2">Sign in</Link>
          )}
        </div>
        <button className="md:hidden rounded-full p-2 text-white" aria-expanded={open} onClick={() => setOpen(!open)} aria-label="Menu">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 7h16M4 12h16M4 17h16" /></svg>
        </button>
      </div>
      {open && (
        <div className="glass mx-auto mt-2 max-w-7xl rounded-2xl md:hidden">
          <div className="flex flex-col gap-1 p-3" onClick={() => setOpen(false)}>
            <NavLink to="/cars" className={linkCls}>Vehicles</NavLink>
            <NavLink to="/groups" className={linkCls}>Live groups</NavLink>
            <NavLink to="/compare" className={linkCls}>Compare</NavLink>
            <NavLink to="/dealers" className={linkCls}>For dealers</NavLink>
            {state.user?.role === 'dealer'
              ? <NavLink to="/dealer/dashboard" className={linkCls}>Dealer dashboard</NavLink>
              : <NavLink to="/dashboard" className={linkCls}>My dashboard</NavLink>}
            {state.user
              ? <button className="btn-ghost mt-2" onClick={() => { signOut(); nav('/'); }}>Sign out ({state.user.name})</button>
              : <Link to="/signin" className="btn-primary mt-2">Sign in</Link>}
          </div>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-ink-950 text-slate-600">
      <div className="container-x grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-2">
          <Logo light />
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-slate-400">
            India's group vehicle-buying platform. We bring together buyers who want the
            same vehicle in the same city, let dealerships compete for the group, and put
            every final on-road price side by side.
          </p>
          <span className="chip mt-4 bg-white/10 text-accent-300">Interactive prototype · all data fictional</span>
        </div>
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-white">Product</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link className="hover:text-white" to="/cars">Browse vehicles</Link></li>
            <li><Link className="hover:text-white" to="/groups">Live buying groups</Link></li>
            <li><Link className="hover:text-white" to="/dealers">Partner with us</Link></li>
            <li><Link className="hover:text-white" to="/dashboard">Buyer dashboard</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-white">Company</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li>Mumbai · Delhi NCR · Bengaluru · Pune · Chandigarh (sample cities)</li>
            <li className="text-slate-500">Every buyer owns their own vehicle. No vehicle sharing, no fractional ownership.</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-slate-500">
        © 2026 CarCohort. Prices shown are indicative demo figures, not live dealer quotes.
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

// Stylised car artwork per body type - cohesive illustration, not stock photos.
export function CarArt({ body = 'SUV', type = 'car', className = '' }) {
  if (type === 'bike' || type === 'scooter' || body === 'Scooter' || body === 'Cruiser' || body === 'Commuter') {
    return (
      <svg viewBox="0 0 432 190" className={className} role="img" aria-label={`${body} illustration`}>
        <ellipse cx="214" cy="162" rx="150" ry="10" fill="#ffffff" fillOpacity="0.07" />
        <path d="M150 96 L190 60 Q196 54 206 54 L250 54 Q260 54 266 62 L292 96 L306 100 Q318 104 318 116 L318 126 L300 126 Q296 106 278 106 Q260 106 256 126 L180 126 Q176 106 158 106 Q140 106 136 126 L118 126 L118 116 Q118 102 134 98 Z" fill="url(#cg-bike)" />
        <defs><linearGradient id="cg-bike" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#34343c" /><stop offset="100%" stopColor="#0e0e11" /></linearGradient></defs>
        <rect x="196" y="60" width="46" height="16" rx="6" fill="#1d2a36" opacity="0.85" />
        <circle cx="157" cy="130" r="22" fill="#050506" /><circle cx="157" cy="130" r="9" fill="#8d8d99" />
        <circle cx="279" cy="130" r="22" fill="#050506" /><circle cx="279" cy="130" r="9" fill="#8d8d99" />
        <rect x="112" y="106" width="14" height="7" rx="3.5" fill="#ff3b30" />
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
          <stop offset="0%" stopColor="#34343c" /><stop offset="100%" stopColor="#0e0e11" />
        </linearGradient>
      </defs>
      <ellipse cx="214" cy="162" rx="180" ry="12" fill="#ffffff" fillOpacity="0.07" />
      <path d={path} fill={`url(#cg-${body.replace(/\s/g, '')})`} />
      <path d={path} fill="none" stroke="#ff4d44" strokeOpacity="0.5" strokeWidth="2" />
      <rect x="160" y="54" width="52" height="30" rx="6" fill="#1d2a36" opacity="0.85" />
      <rect x="222" y="54" width="52" height="30" rx="6" fill="#1d2a36" opacity="0.85" />
      <circle cx="150" cy="140" r="24" fill="#050506" /><circle cx="150" cy="140" r="11" fill="#8d8d99" />
      <circle cx="286" cy="140" r="24" fill="#050506" /><circle cx="286" cy="140" r="11" fill="#8d8d99" />
      <rect x="96" y="98" width="18" height="8" rx="4" fill="#ff3b30" />
    </svg>
  );
}

export function Modal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold text-brand-950">{title}</h3>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700" aria-label="Close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export function SectionHeading({ kicker, title, sub, center = false }) {
  return (
    <div className={`${center ? 'text-center mx-auto' : ''} max-w-2xl`}>
      <p className="kicker">{kicker}</p>
      <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-5xl">{title}</h2>
      {sub && <p className="mt-3 text-base leading-relaxed text-slate-600">{sub}</p>}
    </div>
  );
}
