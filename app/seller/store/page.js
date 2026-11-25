import { query } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { saveStore } from '@/actions/seller';
import { Flash, Title } from '@/components/ui';

export default async function StorePage({ searchParams }) {
  const u = await requireRole('seller');
  const [s] = await query('SELECT * FROM stores WHERE user_id=$1', [u.id]);
  return (
    <div className="mx-auto max-w-xl">
      <Title sub="Informasi ini tampil di halaman produk.">Pengaturan toko</Title>
      <Flash sp={searchParams} />
      <form action={saveStore} className="card space-y-4">
        <div><label className="label" htmlFor="name">Nama toko</label><input id="name" name="name" defaultValue={s.name} required minLength={3} className="input" /></div>
        <div><label className="label" htmlFor="description">Deskripsi</label><textarea id="description" name="description" rows={3} defaultValue={s.description || ''} className="input" /></div>
        <div><label className="label" htmlFor="image_url">URL gambar toko</label><input id="image_url" name="image_url" defaultValue={s.image_url || ''} placeholder="https://" className="input" /></div>
        <button className="btn">Simpan</button>
      </form>
    </div>
  );
}
