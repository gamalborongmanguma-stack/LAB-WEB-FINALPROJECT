import { query } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { rupiah } from '@/lib/format';
import { Title } from '@/components/ui';

export default async function SellerHome() {
  const u = await requireRole('seller');
  const [s] = await query(
    `SELECT st.name,
      (SELECT COUNT(*) FROM products WHERE store_id=st.id)::int AS products,
      (SELECT COUNT(*) FROM order_items WHERE store_id=st.id AND status<>'Selesai')::int AS open_orders,
      (SELECT COALESCE(SUM(price*quantity),0) FROM order_items WHERE store_id=st.id AND status='Selesai') AS revenue
     FROM stores st WHERE st.user_id=$1`, [u.id]);
  const stat = [['Produk', s.products], ['Pesanan aktif', s.open_orders], ['Pendapatan selesai', rupiah(s.revenue)]];
  return (
    <>
      <Title sub="Ringkasan toko Anda.">{s.name}</Title>
      <div className="grid gap-4 sm:grid-cols-3">
        {stat.map(([k, v]) => <div key={k} className="card"><p className="text-sm text-silver-400">{k}</p><p className="mt-1 text-3xl font-extrabold silver-text">{v}</p></div>)}
      </div>
    </>
  );
}
