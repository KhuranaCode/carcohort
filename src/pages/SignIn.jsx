import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../store.jsx';
import { Logo } from '../ui.jsx';

export default function SignIn() {
  const { signIn } = useApp();
  const nav = useNavigate();
  const loc = useLocation();
  const [name, setName] = useState('');
  const [role, setRole] = useState(loc.state?.role || 'buyer');
  const back = loc.state?.back || (role === 'dealer' ? '/dealer/dashboard' : '/dashboard');

  return (
    <div className="container-x flex min-h-[70vh] items-center justify-center py-16">
      <div className="card w-full max-w-md p-8">
        <Logo />
        <h1 className="mt-6 font-display text-2xl font-extrabold text-brand-950">Sign in to CarCohort</h1>
        <p className="mt-2 text-sm text-slate-500">Demo sign-in for the concept build - pick a role and a name. No OTP, no password, nothing leaves your browser.</p>
        <div className="mt-6 grid grid-cols-2 gap-3">
          {[
            ['buyer', 'I am buying a car'],
            ['dealer', 'I run a dealership'],
          ].map(([r, label]) => (
            <button key={r} type="button" onClick={() => setRole(r)}
              className={`rounded-xl border-2 px-4 py-4 text-left text-sm font-semibold transition ${role === r ? 'border-brand-600 bg-brand-50 text-brand-900' : 'border-slate-200 text-slate-500 hover:border-brand-300'}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="mt-5">
          <label className="label">Your {role === 'dealer' ? 'dealership' : 'first'} name</label>
          <input className="input" placeholder={role === 'dealer' ? 'e.g. Sharma Motors' : 'e.g. Aaditya'} value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <button className="btn-primary mt-6 w-full" disabled={!name.trim()}
          onClick={() => { signIn(name.trim(), role); nav(back); }}>
          Continue as {role === 'dealer' ? 'dealer' : 'buyer'}
        </button>
      </div>
    </div>
  );
}
