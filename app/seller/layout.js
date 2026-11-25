import { requireRole } from '@/lib/auth';
import { DashNav } from '@/components/ui';

export default async function SellerLayout({ children }) {
  await requireRole('seller');
  return (
    <>
      <DashNav items={[['/seller', 'Ringkasan'], ['/seller/store', 'Toko'], ['/seller/products', 'Produk'], ['/seller/orders', 'Pesanan masuk']]} />
      {children}
    </>
  );
}
