import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <div className="container-x py-24 text-center">
      <p className="font-display text-6xl font-extrabold text-brand-200">404</p>
      <p className="mt-4 text-slate-500">This page took a wrong turn out of the showroom.</p>
      <Link to="/" className="btn-primary mt-6">Back home</Link>
    </div>
  );
}
