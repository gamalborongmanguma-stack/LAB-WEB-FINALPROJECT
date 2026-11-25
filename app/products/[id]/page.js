import { notFound } from 'next/navigation';
import { query } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { PRODUCT_SELECT, rupiah, tanggal } from '@/lib/format';
import { addReview } from '@/actions/buyer';
import AddToCart from '@/components/AddToCart';
import { Flash, Stars, Empty } from '@/components/ui';

export default async function ProductDetail({ params, searchParams }) {
  const id = Number(params.id);
  if (!Number.isInteger(id)) notFound();
  const user = await getUser();
  const [p] = await query(`${PRODUCT_SELECT} WHERE p.id=$1`, [id]);
  if (!p) notFound();
  const reviews = await query(
    'SELECT r.*, u.name FROM reviews r JOIN users u ON u.id=r.user_id WHERE r.product_id=$1 ORDER BY r.created_at DESC', [id]);

  let canReview = false;
  if (user?.role === 'buyer') {
    const done = await query(
      `SELECT 1 FROM order_items oi JOIN orders o ON o.id=oi.order_id
       WHERE o.buyer_id=$1 AND oi.product_id=$2 AND oi.status='Selesai' LIMIT 1`, [user.id, id]);
    canReview = done.length > 0;
  }

  return (
    <>
      <Flash sp={searchParams} />
      <div className="grid gap-8 md:grid-cols-2">
        <div className="aspect-square overflow-hidden rounded-3xl border border-line bg-panel">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={p.image_url} alt={p.name} className="h-full w-full object-cover" />
        </div>
        <div className="flex flex-col gap-4">
          <span className="badge w-fit">{p.category || 'Tanpa kategori'}</span>
          <h1 className="text-3xl font-bold tracking-tight">{p.name}</h1>
          <div className="flex items-center gap-2 text-sm text-silver-400">
            {p.rating ? <><Stars value={p.rating} /> {Number(p.rating)} ({reviews.length} ulasan)</> : 'Belum ada ulasan'}
          </div>
          <p className="text-4xl font-extrabold silver-text">{rupiah(p.price)}</p>
          <p className="leading-relaxed text-silver-300">{p.description}</p>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div className="card !p-3"><dt className="text-silver-500">Toko</dt><dd className="font-semibold">{p.store_name}</dd></div>
            <div className="card !p-3"><dt className="text-silver-500">Stok</dt><dd className="font-semibold">{p.stock}</dd></div>
          </dl>
          <AddToCart user={user} product={p} withQty />
          {!user && <p className="text-sm text-silver-500">Masuk sebagai buyer untuk membeli produk ini.</p>}
        </div>
      </div>

      <section className="mt-14">
        <h2 className="mb-5 text-xl font-bold">Ulasan pembeli</h2>
        {canReview && (
          <form action={addReview} className="card mb-6 space-y-3">
            <input type="hidden" name="productId" value={id} />
            <div className="flex flex-wrap gap-3">
              <div><label className="label" htmlFor="rating">Rating</label>
                <select id="rating" name="rating" className="input w-32" defaultValue="5">
                  {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} bintang</option>)}
                </select></div>
              <div className="min-w-[200px] flex-1"><label className="label" htmlFor="comment">Ulasan</label>
                <input id="comment" name="comment" required minLength={3} className="input" /></div>
            </div>
            <button className="btn">Kirim ulasan</button>
          </form>
        )}
        {reviews.length === 0 ? <Empty>Belum ada ulasan untuk produk ini.</Empty> : (
          <ul className="space-y-3">
            {reviews.map((r) => (
              <li key={r.id} className="card !p-4">
                <div className="flex items-center justify-between text-sm"><span className="font-semibold">{r.name}</span><span className="text-silver-500">{tanggal(r.created_at)}</span></div>
                <Stars value={r.rating} />
                <p className="mt-1 text-silver-300">{r.comment}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
