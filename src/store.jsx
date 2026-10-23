import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import { CARS, GROUPS } from './data.js';

const KEY = 'carcohort-v1';

const initial = {
  user: null,          // { name, role: 'buyer' | 'dealer' }
  joined: [],          // group ids the buyer joined (this browser)
  reservations: {},    // offerId -> { groupId, reservedAt } (this browser)
  alerts: {},          // groupId -> true (this browser)
};

const AppCtx = createContext(null);

async function api(path, opts) {
  const r = await fetch(path, {
    headers: { 'content-type': 'application/json' },
    ...opts,
  });
  if (!r.ok) throw new Error(`api ${path} -> ${r.status}`);
  return r.json();
}

export function AppProvider({ children }) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? { ...initial, ...JSON.parse(raw) } : initial;
    } catch { return initial; }
  });
  // Shared catalogue + groups. Server-backed when the API is reachable
  // (multi-user persistence in server/db.json); seed data otherwise.
  const [data, setData] = useState({ cars: CARS, groups: GROUPS });
  const [apiMode, setApiMode] = useState(false);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  }, [state]);

  useEffect(() => {
    let live = true;
    api('/api/bootstrap')
      .then((b) => { if (live) { setData({ cars: b.cars, groups: b.groups }); setApiMode(true); } })
      .catch(() => { /* static demo mode: seed data, local-only */ });
    return () => { live = false; };
  }, []);

  const replaceGroup = useCallback((group) => {
    setData((d) => ({ ...d, groups: d.groups.map((g) => (g.id === group.id ? { ...group, offers: group.offers.map((o) => ({ ...o })) } : g)) }));
  }, []);

  const api_ = useMemo(() => ({
    signIn: (name, role) => setState((s) => ({ ...s, user: { name, role } })),
    signOut: () => setState((s) => ({ ...s, user: null })),

    joinGroup: (id) => {
      setState((s) => s.joined.includes(id) ? s : { ...s, joined: [...s.joined, id] });
      if (apiMode && state.user) {
        api(`/api/groups/${id}/join`, { method: 'POST', body: JSON.stringify({ name: state.user.name }) })
          .then((r) => replaceGroup(r.group)).catch(() => {});
      } else {
        setData((d) => ({ ...d, groups: d.groups.map((g) => g.id === id ? { ...g, members: g.members + 1 } : g) }));
      }
    },

    leaveGroup: (id) => {
      setState((s) => ({ ...s, joined: s.joined.filter((g) => g !== id) }));
      if (apiMode && state.user) {
        api(`/api/groups/${id}/leave`, { method: 'POST', body: JSON.stringify({ name: state.user.name }) })
          .then((r) => replaceGroup(r.group)).catch(() => {});
      } else {
        setData((d) => ({ ...d, groups: d.groups.map((g) => g.id === id ? { ...g, members: Math.max(0, g.members - 1) } : g) }));
      }
    },

    submitOffer: (groupId, offer) => {
      if (apiMode) {
        return api(`/api/groups/${groupId}/offers`, {
          method: 'POST',
          body: JSON.stringify({
            dealer: offer.dealer, onRoad: offer.onRoad, variant: offer.variant,
            inclusions: offer.inclusions, validTill: offer.validTill, note: offer.note,
          }),
        }).then((r) => {
          replaceGroup({ ...r.group, offers: r.group.offers.map((o) => (o.id === r.offer.id ? { ...o, mine: true } : o)) });
          return r.offer;
        });
      }
      const local = { ...offer, id: `local-${Date.now().toString(36)}` };
      setData((d) => ({ ...d, groups: d.groups.map((g) => g.id === groupId ? { ...g, offers: [...g.offers, local] } : g) }));
      return Promise.resolve(local);
    },

    reserveOffer: (offerId, groupId) => {
      setState((s) => ({
        ...s,
        reservations: { ...s.reservations, [offerId]: { groupId, reservedAt: new Date().toISOString() } },
      }));
      if (apiMode && state.user) {
        api('/api/reserve', { method: 'POST', body: JSON.stringify({ groupId, offerId, name: state.user.name }) }).catch(() => {});
      }
    },

    toggleAlert: (groupId) => setState((s) => {
      const alerts = { ...s.alerts };
      if (alerts[groupId]) delete alerts[groupId]; else alerts[groupId] = true;
      return { ...s, alerts };
    }),
  }), [apiMode, state.user, replaceGroup]);

  const findGroup = useCallback((id) => data.groups.find((g) => g.id === id), [data.groups]);

  return (
    <AppCtx.Provider value={{ state, data, apiMode, findGroup, ...api_ }}>
      {children}
    </AppCtx.Provider>
  );
}

export const useApp = () => useContext(AppCtx);
