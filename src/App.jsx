import { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Loader, CursorGlow } from './cinematic.jsx';
import { AppProvider } from './store.jsx';
import { Navbar, Footer } from './ui.jsx';
import Landing from './pages/Landing.jsx';
import Cars from './pages/Cars.jsx';
import CarDetail from './pages/CarDetail.jsx';
import Groups from './pages/Groups.jsx';
import Compare from './pages/Compare.jsx';
import GroupDetail from './pages/GroupDetail.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ForDealers from './pages/Dealers.jsx';
import DealerDashboard from './pages/DealerDashboard.jsx';
import SignIn from './pages/SignIn.jsx';
import RequestQuote from './pages/RequestQuote.jsx';
import { Terms, Privacy, Security, Credits } from './pages/Legal.jsx';
import NotFound from './pages/NotFound.jsx';

export function Shell() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return (
    <div className="flex min-h-screen flex-col">
      <a href="#main" className="skip-link">Skip to content</a>
      <Loader />
      <CursorGlow />
      <div className="relative z-50 border-b border-white/10 bg-ink-950 px-4 py-1.5 text-center text-[11px] font-semibold uppercase tracking-[0.14em] text-brand-300">
        Interactive prototype · every group, dealer, offer and price is fictional sample data · no real transactions
      </div>
      <Navbar />
      <main id="main" className={`flex-1 ${pathname === '/' ? '' : 'pt-24'}`}>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/cars" element={<Cars />} />
          <Route path="/cars/:id" element={<CarDetail />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/compare" element={<Compare />} />
          <Route path="/groups/:id" element={<GroupDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dealers" element={<ForDealers />} />
          <Route path="/dealer/dashboard" element={<DealerDashboard />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/request" element={<RequestQuote />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/security" element={<Security />} />
          <Route path="/credits" element={<Credits />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Shell />
      </HashRouter>
    </AppProvider>
  );
}
