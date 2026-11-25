import Link from 'next/link';

export function Flash({ sp }) {
  const error = sp?.error, ok = sp?.ok;
  if (!error && !ok) return null;
  return (
    <div role="status" className={`mb-5 rounded-xl border px-4 py-3 text-sm ${error ? 'border-red-500/40 bg-red-500/10 text-red-200' : 'border-silver-300/30 bg-white/5 text-silver-100'}`}>
      {error || ok}
    </div>
  );
}

export function Title({ children, sub, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{children}</h1>
        {sub && <p className="mt-1 text-sm text-silver-400">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

const tone = {
  'Menunggu Pembayaran': 'border-silver-500/50 text-silver-400',
  Diproses: 'border-silver-300/60 text-silver-200',
  Dikirim: 'border-silver-200/70 text-silver-100',
  Selesai: 'border-white/80 bg-white text-ink',
  pending: 'border-silver-500/50 text-silver-400',
  approved: 'border-white/80 bg-white text-ink',
  rejected: 'border-red-500/50 text-red-300',
};
export function StatusBadge({ s }) {
  return <span className={`inline-block whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${tone[s] || 'border-line'}`}>{s}</span>;
}

export function DashNav({ items }) {
  return (
    <nav className="mb-8 flex gap-1 overflow-x-auto border-b border-line pb-3">
      {items.map(([href, label]) => (
        <Link key={href} href={href} className="whitespace-nowrap rounded-lg px-3 py-1.5 text-sm text-silver-300 transition hover:bg-white/5 hover:text-white">{label}</Link>
      ))}
    </nav>
  );
}

export function Empty({ children }) {
  return <div className="rounded-2xl border border-dashed border-line px-6 py-14 text-center text-silver-400">{children}</div>;
}

export function Stars({ value }) {
  const v = Math.round(Number(value) || 0);
  return <span aria-label={`Rating ${value}`} className="tracking-widest text-silver-200">{'★'.repeat(v)}<span className="text-line">{'★'.repeat(5 - v)}</span></span>;
}
