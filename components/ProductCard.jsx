import Link from 'next/link';
import { rupiah } from '@/lib/format';
import { Stars } from '@/components/ui';
import AddToCart from '@/components/AddToCart';

export default function ProductCard({ p, user }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-panel/80 transition hover:border-silver-400">
      <Link href={`/products/${p.id}`} className="block aspect-square overflow-hidden bg-gradient-to-br from-line to-ink">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={p.image_url} alt={p.name} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" />
      </Link>
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <span className="text-xs text-silver-500">{p.category || 'Tanpa kategori'} · {p.store_name}</span>
        <Link href={`/products/${p.id}`} className="line-clamp-2 font-semibold leading-snug hover:text-white">{p.name}</Link>
        <div className="flex items-center gap-2 text-xs text-silver-400">
          {p.rating ? <><Stars value={p.rating} /> {Number(p.rating)}</> : 'Belum ada ulasan'}
        </div>
        <p className="mt-auto pt-2 text-lg font-bold silver-text">{rupiah(p.price)}</p>
        <div className="pt-2"><AddToCart user={user} product={p} /></div>
      </div>
    </article>
  );
}
