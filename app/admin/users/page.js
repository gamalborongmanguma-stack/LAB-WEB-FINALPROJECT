import Link from 'next/link';
import { query } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { deleteUser } from '@/actions/admin';
import { tanggal } from '@/lib/format';
import { Flash, Title } from '@/components/ui';

export default async function Users({ searchParams }) {
  const me = await requireRole('admin');
  const rows = await query('SELECT id,name,email,role,created_at FROM users ORDER BY role, created_at DESC');
  return (
    <>
      <Title sub={`${rows.length} pengguna terdaftar`}>Manajemen pengguna</Title>
      <Flash sp={searchParams} />
      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[640px]">
          <thead className="border-b border-line bg-panel"><tr><th className="th">Nama</th><th className="th">Email</th><th className="th">Role</th><th className="th">Daftar</th><th className="th" /></tr></thead>
          <tbody>
            {rows.map((u) => (
              <tr key={u.id} className="border-b border-line last:border-0">
                <td className="td">{u.name}</td><td className="td">{u.email}</td><td className="td"><span className="badge">{u.role}</span></td><td className="td">{tanggal(u.created_at)}</td>
                <td className="td"><div className="flex justify-end gap-2">
                  <Link href={`/admin/users/${u.id}`} className="btn-ghost !py-1.5">Edit</Link>
                  {u.id !== me.id && <form action={deleteUser}><input type="hidden" name="id" value={u.id} /><button className="btn-danger !py-1.5">Hapus</button></form>}
                </div></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
