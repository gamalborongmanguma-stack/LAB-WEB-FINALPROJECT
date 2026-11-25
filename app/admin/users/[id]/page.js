import { notFound } from 'next/navigation';
import { query } from '@/lib/db';
import { updateUser } from '@/actions/admin';
import { Flash, Title } from '@/components/ui';

export default async function EditUser({ params, searchParams }) {
  const [u] = await query('SELECT id,name,email,role FROM users WHERE id=$1', [Number(params.id) || 0]);
  if (!u) notFound();
  return (
    <div className="mx-auto max-w-md">
      <Title sub={`Role: ${u.role}`}>Edit pengguna</Title>
      <Flash sp={searchParams} />
      <form action={updateUser} className="card space-y-4">
        <input type="hidden" name="id" value={u.id} />
        <div><label className="label" htmlFor="name">Nama</label><input id="name" name="name" defaultValue={u.name} required minLength={3} className="input" /></div>
        <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" defaultValue={u.email} required className="input" /></div>
        <button className="btn">Simpan</button>
      </form>
    </div>
  );
}
