import { query } from '@/lib/db';
import { createCategory, updateCategory, deleteCategory } from '@/actions/admin';
import { Flash, Title } from '@/components/ui';

export default async function Categories({ searchParams }) {
  const rows = await query('SELECT c.*, (SELECT COUNT(*) FROM products WHERE category_id=c.id)::int AS total FROM categories c ORDER BY name');
  return (
    <div className="mx-auto max-w-2xl">
      <Title sub="Kategori dipakai seller saat menambahkan produk.">Kategori produk</Title>
      <Flash sp={searchParams} />
      <form action={createCategory} className="card mb-6 flex gap-2">
        <input name="name" placeholder="Nama kategori baru" aria-label="Nama kategori" required minLength={2} className="input" />
        <button className="btn whitespace-nowrap">Tambah</button>
      </form>
      <ul className="space-y-2">
        {rows.map((c) => (
          <li key={c.id} className="card flex flex-wrap items-center gap-2 !p-3">
            <form action={updateCategory} className="flex min-w-0 flex-1 gap-2">
              <input type="hidden" name="id" value={c.id} />
              <input name="name" defaultValue={c.name} aria-label="Nama kategori" required minLength={2} className="input !py-1.5" />
              <button className="btn-ghost !py-1.5">Ubah</button>
            </form>
            <span className="text-xs text-silver-500">{c.total} produk</span>
            <form action={deleteCategory}><input type="hidden" name="id" value={c.id} /><button className="btn-danger !py-1.5">Hapus</button></form>
          </li>
        ))}
      </ul>
    </div>
  );
}
