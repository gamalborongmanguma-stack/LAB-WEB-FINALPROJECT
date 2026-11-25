import { query } from '@/lib/db';
import { setSellerStatus } from '@/actions/admin';
import { tanggal } from '@/lib/format';
import { Flash, Title, Empty, StatusBadge } from '@/components/ui';

export default async function Sellers({ searchParams }) {
  const rows = await query(
    `SELECT u.id,u.name,u.email,u.seller_status,u.created_at,s.name AS store FROM users u LEFT JOIN stores s ON s.user_id=u.id
     WHERE u.role='seller' ORDER BY (u.seller_status='pending') DESC, u.created_at DESC`);
  return (
    <>
      <Title sub="Seller berstatus pending ditampilkan paling atas.">Verifikasi seller</Title>
      <Flash sp={searchParams} />
      {rows.length === 0 ? <Empty>Belum ada seller terdaftar.</Empty> : (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[640px]">
            <thead className="border-b border-line bg-panel"><tr><th className="th">Seller</th><th className="th">Toko</th><th className="th">Daftar</th><th className="th">Status</th><th className="th" /></tr></thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-line last:border-0">
                  <td className="td">{r.name}<p className="text-xs text-silver-500">{r.email}</p></td>
                  <td className="td">{r.store}</td><td className="td">{tanggal(r.created_at)}</td>
                  <td className="td"><StatusBadge s={r.seller_status} /></td>
                  <td className="td"><div className="flex justify-end gap-2">
                    {r.seller_status !== 'approved' && <form action={setSellerStatus}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="approved" /><button className="btn !py-1.5">Approve</button></form>}
                    {r.seller_status !== 'rejected' && <form action={setSellerStatus}><input type="hidden" name="id" value={r.id} /><input type="hidden" name="status" value="rejected" /><button className="btn-danger !py-1.5">Reject</button></form>}
                  </div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
