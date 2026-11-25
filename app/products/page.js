import Link from 'next/link';
import { query } from '@/lib/db';
import { getUser } from '@/lib/auth';
import { PRODUCT_SELECT } from '@/lib/format';
import ProductCard from '@/components/ProductCard';
import { Flash, Title, Empty } from '@/components/ui';

const SORTS = {
  newest: ['Terbaru', 'p.created_at DESC'],
  price_asc: ['Harga terendah', 'p.price ASC'],
  price_desc: ['Harga tertinggi', 'p.price DESC'],
};

export default async function Products({ searchParams }) {
  const user = await getUser();
  const q = (searchParams.q || '').trim();
  const category = Number(searchParams.category) || 0;
  const min = Number(searchParams.min) || 0;
  const max = Number(searchParams.max) || 0;
  const sort = SORTS[searchParams.sort] ? searchParams.sort : 'newest';

  const where = [];
  const params = [];
  if (q) { params.push(`%${q}%`); where.push(`p.name ILIKE $${params.length}`); }
  if (category) { params.push(category); where.push(`p.category_id = $${params.length}`); }
  if (min) { params.push(min); where.push(`p.price >= $${params.length}`); }
  if (max) { params.push(max); where.push(`p.price <= $${params.length}`); }

  const [products, cats] = await Promise.all([
    query(`${PRODUCT_SELECT} ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY ${SORTS[sort][1]}`, params),
    query('SELECT * FROM categories ORDER BY name'),
  ]);

  return (
    <>
      <Title sub={`${products.length} produk ditemukan`}>Semua produk</Title>
      <Flash sp={searchParams} />
      <form className="card mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
        <input name="q" defaultValue={q} placeholder="Cari nama produk" aria-label="Cari" className="input lg:col-span-2" />
        <select name="category" defaultValue={category || ''} aria-label="Kategori" className="input">
          <option value="">Semua kategori</option>
          {cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input name="min" type="number" min="0" defaultValue={min || ''} placeholder="Harga min" aria-label="Harga minimum" className="input" />
        <input name="max" type="number" min="0" defaultValue={max || ''} placeholder="Harga maks" aria-label="Harga maksimum" className="input" />
        <select name="sort" defaultValue={sort} aria-label="Urutkan" className="input">
          {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v[0]}</option>)}
        </select>
        <div className="flex gap-2 sm:col-span-2 lg:col-span-6">
          <button className="btn">Terapkan</button>
          <Link href="/products" className="btn-ghost">Reset</Link>
        </div>
      </form>
      {products.length === 0 ? <Empty>Tidak ada produk yang cocok. Coba ubah kata kunci atau filter.</Empty> : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {products.map((p) => <ProductCard key={p.id} p={p} user={user} />)}
        </div>
      )}
    </>
  );
}
