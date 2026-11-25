import Link from 'next/link';
import { query } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { rupiah } from '@/lib/format';
import { updateCart, removeCart, checkout } from '@/actions/buyer';
import { Flash, Title, Empty } from '@/components/ui';

export default async function Cart({ searchParams }) {
  const user = await requireRole('buyer');
  const items = await query(
    `SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.price, p.stock, p.image_url, s.name AS store_name
     FROM cart_items ci JOIN products p ON p.id=ci.product_id JOIN stores s ON s.id=p.store_id
     WHERE ci.user_id=$1 ORDER BY ci.id`, [user.id]);
  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <>
      <Title sub="Atur jumlah, lalu checkout.">Keranjang</Title>
      <Flash sp={searchParams} />
      {items.length === 0 ? (
        <Empty>Keranjang masih kosong. <Link href="/products" className="text-silver-100 underline">Jelajahi produk</Link></Empty>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <ul className="space-y-3 lg:col-span-2">
            {items.map((i) => (
              <li key={i.id} className="card flex gap-4 !p-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={i.image_url} alt="" className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <Link href={`/products/${i.product_id}`} className="truncate font-semibold hover:text-white">{i.name}</Link>
                  <span className="text-xs text-silver-500">{i.store_name} · stok {i.stock}</span>
                  <div className="flex flex-wrap items-center gap-2">
                    <form action={updateCart} className="flex gap-2">
                      <input type="hidden" name="itemId" value={i.id} />
                      <input type="number" name="quantity" min="0" max={i.stock} defaultValue={i.quantity} aria-label="Jumlah" className="input !w-20 !py-1.5" />
                      <button className="btn-ghost !py-1.5">Ubah</button>
                    </form>
                    <form action={removeCart}><input type="hidden" name="itemId" value={i.id} /><button className="btn-danger !py-1.5">Hapus</button></form>
                  </div>
                </div>
                <p className="font-bold">{rupiah(i.price * i.quantity)}</p>
              </li>
            ))}
          </ul>
          <form action={checkout} className="card h-fit space-y-4">
            <div className="flex items-center justify-between"><span className="text-silver-400">Total</span><span className="text-2xl font-extrabold silver-text">{rupiah(total)}</span></div>
            <div><label className="label" htmlFor="address">Alamat pengiriman</label>
              <textarea id="address" name="address" rows={3} required defaultValue={user.address || ''} className="input" /></div>
            <button className="btn w-full">Checkout</button>
          </form>
        </div>
      )}
    </>
  );
}
