import { requireRole } from '@/lib/auth';
import { updateProfile } from '@/actions/buyer';
import { Flash, Title } from '@/components/ui';

export default async function Profile({ searchParams }) {
  const u = await requireRole('buyer');
  return (
    <div className="mx-auto max-w-lg">
      <Title sub={u.email}>Profil saya</Title>
      <Flash sp={searchParams} />
      <form action={updateProfile} className="card space-y-4">
        <div><label className="label" htmlFor="name">Nama</label><input id="name" name="name" defaultValue={u.name} required minLength={3} className="input" /></div>
        <div><label className="label" htmlFor="phone">Telepon</label><input id="phone" name="phone" defaultValue={u.phone || ''} className="input" /></div>
        <div><label className="label" htmlFor="address">Alamat pengiriman</label><textarea id="address" name="address" rows={3} defaultValue={u.address || ''} className="input" /></div>
        <button className="btn">Simpan profil</button>
      </form>
    </div>
  );
}
