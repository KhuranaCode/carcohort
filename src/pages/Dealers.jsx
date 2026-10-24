import { Link } from 'react-router-dom';
import { carById } from '../data.js';
import { Badge, SectionHeading, Countdown } from '../ui.jsx';
import { useApp } from '../store.jsx';

export default function ForDealers() {
  const { state, data } = useApp();
  return (
    <div>
      <section className="bg-paper-deep py-16">
        <div className="container-x grid items-center gap-10 lg:grid-cols-2">
          <div>
            <Badge cls="bg-white/10 text-accent-300">For dealerships</Badge>
            <h1 className="mt-4 text-4xl font-extrabold tracking-tight sm:text-5xl">Twenty ready buyers. One bid. Zero marketing spend.</h1>
            <p className="mt-5 max-w-xl text-lg text-slate-600">
              CarCohort groups are buyers who already chose the model, the city and the timeline.
              Quote your best on-road price against rival dealerships - win the whole group, not one walk-in.
            </p>
            <div className="mt-8 flex gap-3">
              <Link to="/dealer/dashboard" className="btn-accent !px-7 !py-3.5">Open dealer portal</Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              ['Ready demand', 'Every group member has picked model, city and budget. No cold leads.'],
              ['Compete on one number', 'Final on-road price plus inclusions. The cleanest bid wins.'],
              ['Pay per delivery', 'Success fee only when a group member drives out. No listing fees.'],
              ['Move inventory faster', 'Clear slow colour/variant stock by targeting it at a ready group.'],
            ].map(([h, d]) => (
              <div key={h} className="rounded-2xl bg-white/5 p-5 ring-1 ring-white/10">
                <h3 className="font-bold text-accent-300">{h}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-600">{d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container-x py-16">
        <SectionHeading kicker="Open for bidding" title="Sample groups open for bids (fictional demo data)" />
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-400">
                <th className="py-3 pr-4">Group</th><th className="py-3 pr-4">City</th><th className="py-3 pr-4">Ready buyers</th><th className="py-3 pr-4">Current bids</th><th className="py-3 pr-4">Closes</th><th className="py-3"></th>
              </tr>
            </thead>
            <tbody>
              {data.groups.map((g) => {
                const car = carById(g.carId);
                return (
                  <tr key={g.id} className="border-b border-slate-100">
                    <td className="py-4 pr-4 font-semibold text-brand-950">{car.name}</td>
                    <td className="py-4 pr-4 text-slate-600">{g.city}</td>
                    <td className="py-4 pr-4"><span className="font-display font-extrabold text-brand-900">{g.members}</span><span className="text-slate-400">/{g.target}</span></td>
                    <td className="py-4 pr-4 text-slate-600">{g.offers.length}</td>
                    <td className="py-4 pr-4"><Countdown deadline={g.deadline} /></td>
                    <td className="py-4 text-right">
                      <Link to={state.user?.role === 'dealer' ? '/dealer/dashboard' : '/signin'} state={{ back: '/dealer/dashboard' }} className="btn-ghost !px-4 !py-2 !text-xs">Bid on group</Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
