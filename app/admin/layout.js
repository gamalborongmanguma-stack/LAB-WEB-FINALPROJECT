import { requireRole } from '@/lib/auth';
import { DashNav } from '@/components/ui';

export default async function AdminLayout({ children }) {
  await requireRole('admin');
  return (
    <>
      <DashNav items={[['/admin', 'Ringkasan'], ['/admin/sellers', 'Verifikasi seller'], ['/admin/users', 'Pengguna'], ['/admin/categories', 'Kategori'], ['/admin/products', 'Produk']]} />
      {children}
    </>
  );
}
