import { HashRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './store.jsx';
import { Navbar, Footer } from './ui.jsx';
import Landing from './pages/Landing.jsx';
import Cars from './pages/Cars.jsx';
import Groups from './pages/Groups.jsx';
import GroupDetail from './pages/GroupDetail.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ForDealers from './pages/Dealers.jsx';
import DealerDashboard from './pages/DealerDashboard.jsx';
import SignIn from './pages/SignIn.jsx';
import RequestQuote from './pages/RequestQuote.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <div className="flex min-h-screen flex-col">
          <div className="bg-amber-400 px-4 py-1.5 text-center text-xs font-semibold text-amber-950">
            Interactive prototype - every group, dealer, offer and price on this site is fictional sample data. No real transactions.
          </div>
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/cars" element={<Cars />} />
              <Route path="/groups" element={<Groups />} />
              <Route path="/groups/:id" element={<GroupDetail />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/dealers" element={<ForDealers />} />
              <Route path="/dealer/dashboard" element={<DealerDashboard />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/request" element={<RequestQuote />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </HashRouter>
    </AppProvider>
  );
}
