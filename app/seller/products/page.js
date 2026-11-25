import Link from 'next/link';
import { query } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { rupiah } from '@/lib/format';
import { deleteProduct } from '@/actions/seller';
import { Flash, Title, Empty } from '@/components/ui';

export default async function SellerProducts({ searchParams }) {
  const u = await requireRole('seller');
  const rows = await query(
    `SELECT p.*, c.name AS category FROM products p LEFT JOIN categories c ON c.id=p.category_id
     JOIN stores s ON s.id=p.store_id WHERE s.user_id=$1 ORDER BY p.created_at DESC`, [u.id]);
  return (
    <>
      <Title action={<Link href="/seller/products/new" className="btn">Tambah produk</Link>}>Produk saya</Title>
      <Flash sp={searchParams} />
      {rows.length === 0 ? <Empty>Belum ada produk. Tambahkan produk pertama Anda.</Empty> : (
        <div className="overflow-x-auto rounded-2xl border border-line">
          <table className="w-full min-w-[640px]">
            <thead className="border-b border-line bg-panel"><tr><th className="th">Produk</th><th className="th">Kategori</th><th className="th">Harga</th><th className="th">Stok</th><th className="th" /></tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="td"><div className="flex items-center gap-3">{/* eslint-disable-next-line @next/next/no-img-element */}<img src={p.image_url} alt="" className="h-10 w-10 rounded-lg object-cover" />{p.name}</div></td>
                  <td className="td">{p.category || '-'}</td><td className="td">{rupiah(p.price)}</td><td className="td">{p.stock}</td>
                  <td className="td"><div className="flex justify-end gap-2">
                    <Link href={`/seller/products/${p.id}/edit`} className="btn-ghost !py-1.5">Edit</Link>
                    <form action={deleteProduct}><input type="hidden" name="id" value={p.id} /><button className="btn-danger !py-1.5">Hapus</button></form>
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
