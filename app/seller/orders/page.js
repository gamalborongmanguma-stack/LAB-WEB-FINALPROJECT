import { query } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { rupiah, tanggal, STATUSES } from '@/lib/format';
import { updateOrderStatus } from '@/actions/seller';
import { Flash, Title, Empty } from '@/components/ui';

export default async function SellerOrders({ searchParams }) {
  const u = await requireRole('seller');
  const rows = await query(
    `SELECT oi.*, o.created_at, o.address, b.name AS buyer FROM order_items oi
     JOIN stores s ON s.id=oi.store_id JOIN orders o ON o.id=oi.order_id JOIN users b ON b.id=o.buyer_id
     WHERE s.user_id=$1 ORDER BY o.created_at DESC`, [u.id]);
  return (
    <>
      <Title sub="Perbarui status agar pembeli bisa melacak pesanannya.">Pesanan masuk</Title>
      <Flash sp={searchParams} />
      {rows.length === 0 ? <Empty>Belum ada pesanan masuk.</Empty> : (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[760px]">
            <thead className="border-b border-line bg-panel"><tr><th className="th">Pesanan</th><th className="th">Pembeli</th><th className="th">Item</th><th className="th">Total</th><th className="th">Status</th></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0">
                  <td className="td">#{r.order_id}<p className="text-xs text-silver-500">{tanggal(r.created_at)}</p></td>
                  <td className="td">{r.buyer}<p className="max-w-[200px] truncate text-xs text-silver-500">{r.address}</p></td>
                  <td className="td">{r.product_name} × {r.quantity}</td>
                  <td className="td">{rupiah(r.price * r.quantity)}</td>
                  <td className="td">
                    <form action={updateOrderStatus} className="flex gap-2">
                      <input type="hidden" name="id" value={r.id} />
                      <select name="status" defaultValue={r.status} aria-label="Status" className="input !w-48 !py-1.5">{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
                      <button className="btn-ghost !py-1.5">Simpan</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
