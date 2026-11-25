import Link from 'next/link';
import { query } from '@/lib/db';
import { rupiah } from '@/lib/format';
import { adminDeleteProduct } from '@/actions/admin';
import { Flash, Title, Empty } from '@/components/ui';

export default async function AdminProducts({ searchParams }) {
  const rows = await query('SELECT p.id,p.name,p.price,p.stock,s.name AS store FROM products p JOIN stores s ON s.id=p.store_id ORDER BY p.created_at DESC');
  return (
    <>
      <Title sub="Hapus produk yang melanggar ketentuan.">Moderasi produk</Title>
      <Flash sp={searchParams} />
      {rows.length === 0 ? <Empty>Belum ada produk.</Empty> : (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[600px]">
            <thead className="border-b border-line bg-panel"><tr><th className="th">Produk</th><th className="th">Toko</th><th className="th">Harga</th><th className="th">Stok</th><th className="th" /></tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="td"><Link href={`/products/${p.id}`} className="hover:text-white">{p.name}</Link></td><td className="td">{p.store}</td><td className="td">{rupiah(p.price)}</td><td className="td">{p.stock}</td>
                  <td className="td text-right"><form action={adminDeleteProduct}><input type="hidden" name="id" value={p.id} /><button className="btn-danger !py-1.5">Hapus</button></form></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
