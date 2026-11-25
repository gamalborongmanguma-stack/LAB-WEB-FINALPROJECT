import Link from 'next/link';
import { query } from '@/lib/db';
import { Title } from '@/components/ui';

export default async function AdminHome() {
  const [s] = await query(
    `SELECT (SELECT COUNT(*) FROM users WHERE role='buyer')::int buyers,
            (SELECT COUNT(*) FROM users WHERE role='seller' AND seller_status='approved')::int sellers,
            (SELECT COUNT(*) FROM users WHERE role='seller' AND seller_status='pending')::int pending,
            (SELECT COUNT(*) FROM products)::int products,
            (SELECT COUNT(*) FROM orders)::int orders`);
  const stat = [['Buyer', s.buyers], ['Seller aktif', s.sellers], ['Seller menunggu', s.pending], ['Produk', s.products], ['Pesanan', s.orders]];
  return (
    <>
      <Title sub="Kondisi platform saat ini.">Dashboard admin</Title>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stat.map(([k, v]) => <div key={k} className="card"><p className="text-sm text-silver-400">{k}</p><p className="mt-1 text-3xl font-extrabold silver-text">{v}</p></div>)}
      </div>
      {s.pending > 0 && <Link href="/admin/sellers" className="btn mt-6">Tinjau {s.pending} seller menunggu</Link>}
    </>
  );
}
