export function fmtINR(n) {
  if (n == null || Number.isNaN(n)) return '-';
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1e7) return `${sign}₹${(abs / 1e7).toFixed(2)} crore`;
  if (abs >= 1e5) return `${sign}₹${(abs / 1e5).toFixed(2)} lakh`;
  return `${sign}₹${abs.toLocaleString('en-IN')}`;
}

export function daysLeft(deadline, now = new Date()) {
  const end = new Date(deadline + 'T23:59:59');
  const ms = end.getTime() - now.getTime();
  return Math.max(0, Math.ceil(ms / 86400000));
}

export function fmtDate(iso) {
  return new Date(iso + 'T00:00:00').toLocaleDateString('en-IN', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}
