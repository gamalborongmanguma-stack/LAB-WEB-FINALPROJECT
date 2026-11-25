import Link from 'next/link';
import { addToCart } from '@/actions/buyer';

export default function AddToCart({ user, product, withQty }) {
  if (product.stock < 1) return <button disabled className="btn-ghost w-full opacity-60">Stok habis</button>;
  if (!user) return <Link href="/login" className="btn w-full">Tambah ke keranjang</Link>;
  if (user.role !== 'buyer') return null;
  return (
    <form action={addToCart} className="flex gap-2">
      <input type="hidden" name="productId" value={product.id} />
      {withQty && <input type="number" name="quantity" min="1" max={product.stock} defaultValue="1" aria-label="Jumlah" className="input w-24" />}
      <button className="btn flex-1">Tambah ke keranjang</button>
    </form>
  );
}
