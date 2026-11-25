import Link from 'next/link';
import { query } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { rupiah, tanggal } from '@/lib/format';
import { Flash, Title, Empty, StatusBadge } from '@/components/ui';

export default async function Orders({ searchParams }) {
  const user = await requireRole('buyer');
  const orders = await query('SELECT * FROM orders WHERE buyer_id=$1 ORDER BY created_at DESC', [user.id]);
  const items = orders.length
    ? await query(
        `SELECT oi.*, s.name AS store_name FROM order_items oi LEFT JOIN stores s ON s.id=oi.store_id
         WHERE oi.order_id = ANY($1) ORDER BY oi.id`, [orders.map((o) => o.id)])
    : [];

  return (
    <>
      <Title sub="Pantau status setiap pesanan Anda.">Riwayat pesanan</Title>
      <Flash sp={searchParams} />
      {orders.length === 0 ? <Empty>Belum ada pesanan.</Empty> : (
        <div className="space-y-5">
          {orders.map((o) => (
            <section key={o.id} className="card">
              <header className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
                <div><p className="font-semibold">Pesanan #{o.id}</p><p className="text-xs text-silver-500">{tanggal(o.created_at)}</p></div>
                <p className="font-bold">{rupiah(o.total)}</p>
              </header>
              <ul className="space-y-3">
                {items.filter((i) => i.order_id === o.id).map((i) => (
                  <li key={i.id} className="flex flex-wrap items-center justify-between gap-2 text-sm">
                    <div>
                      {i.product_id ? <Link href={`/products/${i.product_id}`} className="font-medium hover:text-white">{i.product_name}</Link> : <span>{i.product_name}</span>}
                      <p className="text-xs text-silver-500">{i.quantity} × {rupiah(i.price)} · {i.store_name || 'Toko dihapus'}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusBadge s={i.status} />
                      {i.status === 'Selesai' && i.product_id && <Link href={`/products/${i.product_id}`} className="btn-ghost !py-1 text-xs">Beri ulasan</Link>}
                    </div>
                  </li>
                ))}
              </ul>
              <p className="mt-4 border-t border-line pt-3 text-xs text-silver-500">Dikirim ke: {o.address}</p>
            </section>
          ))}
        </div>
      )}
    </>
  );
}
