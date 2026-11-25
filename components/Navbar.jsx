import Link from 'next/link';
import { getUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { logout } from '@/actions/auth';

export default async function Navbar() {
  const user = await getUser();
  let count = 0;
  if (user?.role === 'buyer') {
    const [r] = await query('SELECT COALESCE(SUM(quantity),0)::int AS n FROM cart_items WHERE user_id=$1', [user.id]);
    count = r.n;
  }
  const link = 'rounded-lg px-3 py-1.5 text-sm text-silver-300 transition hover:bg-white/5 hover:text-white';
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-ink/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="text-xl font-extrabold tracking-tight silver-text">SILVERA</Link>
        <nav className="flex flex-wrap items-center gap-1">
          <Link href="/products" className={link}>Produk</Link>
          {!user && (<><Link href="/login" className={link}>Masuk</Link><Link href="/register" className="btn !py-1.5">Daftar</Link></>)}
          {user?.role === 'buyer' && (<>
            <Link href="/cart" className={link}>Keranjang{count > 0 && <span className="ml-1.5 rounded-full bg-silver-200 px-1.5 text-xs font-bold text-ink">{count}</span>}</Link>
            <Link href="/orders" className={link}>Pesanan</Link>
            <Link href="/profile" className={link}>Profil</Link>
          </>)}
          {user?.role === 'seller' && <Link href={user.seller_status === 'approved' ? '/seller' : '/pending-seller'} className={link}>Dashboard toko</Link>}
          {user?.role === 'admin' && <Link href="/admin" className={link}>Dashboard admin</Link>}
          {user && <form action={logout}><button className="btn-ghost !py-1.5">Keluar</button></form>}
        </nav>
      </div>
    </header>
  );
}
