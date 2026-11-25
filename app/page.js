import Link from 'next/link';
import { query } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { PRODUCT_SELECT } from '@/lib/format';
import ProductCard from '@/components/ProductCard';

export default async function Home() {
  const user = await getUser();
  const [products, cats] = await Promise.all([
    query(`${PRODUCT_SELECT} WHERE p.stock > 0 ORDER BY random() LIMIT 8`),
    query('SELECT * FROM categories ORDER BY name'),
  ]);
  return (
    <>
      <section className="mb-12 rounded-3xl border border-line bg-gradient-to-b from-panel to-ink px-6 py-14 text-center sm:py-20">
        <h1 className="mx-auto max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-6xl silver-text">Belanja yang tenang, hasil yang tajam.</h1>
        <p className="mx-auto mt-4 max-w-lg text-silver-400">Temukan produk dari ratusan toko pilihan dalam satu tempat.</p>
        <form action="/products" className="mx-auto mt-8 flex max-w-xl gap-2">
          <input name="q" placeholder="Cari produk…" aria-label="Cari produk" className="input" />
          <button className="btn">Cari</button>
        </form>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {cats.map((c) => <Link key={c.id} href={`/products?category=${c.id}`} className="badge transition hover:border-silver-300 hover:text-white">{c.name}</Link>)}
        </div>
      </section>
      <h2 className="mb-5 text-xl font-bold">{user?.role === 'buyer' ? 'Rekomendasi untuk Anda' : 'Produk pilihan'}</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {products.map((p) => <ProductCard key={p.id} p={p} user={user} />)}
      </div>
    </>
  );
}
