import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Star, ShieldCheck, Truck } from 'lucide-react';
import { getProduct, money } from '@/lib/data';
import { getUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { addToCartAction, reviewAction } from '@/lib/actions';

export default async function ProductDetail({ params }) {
  const { id } = await params;
  const product = await getProduct(id);
  if (!product) return notFound();

  const user = await getUser();
  let reviews = [];

  try {
    const reviewsResult = await query(
      `SELECT r.rating,r.comment,r.created_at,u.name
       FROM reviews r
       JOIN users u ON u.id=r.user_id
       WHERE r.product_id=$1
       ORDER BY r.created_at DESC`,
      [id]
    );
    reviews = reviewsResult.rows;
  } catch {}

  return (
    <div className="container-x py-10">
      <Link href="/products" className="muted inline-flex items-center gap-2 text-xs">
        <ArrowLeft size={14} /> Back to products
      </Link>

      <div className="mt-8 grid gap-10 md:grid-cols-2 md:gap-16">
        <div className="product-image aspect-[.9]">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        </div>

        <div className="flex flex-col justify-center">
          <p className="muted text-[10px] font-bold uppercase tracking-[.25em]">
            {product.category} / {product.store_name}
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-[-.05em] sm:text-5xl">
            {product.name}
          </h1>

          <div className="mt-5 flex items-center gap-2 text-sm">
            <Star size={15} fill="currentColor" />
            {product.rating || '4.8'}{' '}
            <span className="muted">· Customer rating</span>
          </div>

          <p className="mt-6 text-2xl font-semibold">{money(product.price)}</p>
          <p className="muted mt-6 max-w-lg text-sm leading-7">
            {product.description}
          </p>
          <p className="mt-5 text-xs">
            {product.stock > 0
              ? `${product.stock} items available`
              : 'Out of stock'}
          </p>

          <form action={addToCartAction} className="mt-8 flex flex-wrap gap-3">
            <input type="hidden" name="productId" value={product.id} />
            <input
              type="number"
              name="quantity"
              min="1"
              max={product.stock}
              defaultValue="1"
              className="input w-20"
            />
            <button
              type="submit"
              disabled={!product.stock}
              className="btn-primary disabled:opacity-40"
            >
              {user?.role === 'buyer' ? 'Add to bag' : 'Login to add to bag'}
            </button>
          </form>

          <div
            className="mt-9 grid grid-cols-2 gap-4 border-t pt-6"
            style={{ borderColor: 'var(--line)' }}
          >
            <div className="flex gap-3">
              <Truck size={18} />
              <div>
                <p className="text-xs font-semibold">Delivery</p>
                <p className="muted mt-1 text-[10px]">
                  Shipping calculated at checkout
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <ShieldCheck size={18} />
              <div>
                <p className="text-xs font-semibold">Quality checked</p>
                <p className="muted mt-1 text-[10px]">
                  Curated seller community
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <section
        className="mt-20 border-t pt-10"
        style={{ borderColor: 'var(--line)' }}
      >
        <h2 className="text-2xl font-semibold">Reviews & ratings</h2>
        <p className="muted mt-2 text-sm">
          Share your experience after your order is completed.
        </p>

        {reviews.map((review, index) => (
          <div
            key={index}
            className="mt-5 max-w-xl border-b pb-4"
            style={{ borderColor: 'var(--line)' }}
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">{review.name}</p>
              <p className="text-xs">
                {'★'.repeat(review.rating)}
                {'☆'.repeat(5 - review.rating)}
              </p>
            </div>
            <p className="muted mt-2 text-sm">{review.comment}</p>
          </div>
        ))}

        {!reviews.length && (
          <p className="muted mt-5 text-xs">No reviews yet.</p>
        )}

        {user?.role === 'buyer' ? (
          <form action={reviewAction} className="mt-6 grid max-w-xl gap-3">
            <input type="hidden" name="productId" value={product.id} />
            <select name="rating" className="input">
              <option value="5">5 — Excellent</option>
              <option value="4">4 — Very good</option>
              <option value="3">3 — Good</option>
              <option value="2">2 — Fair</option>
              <option value="1">1 — Poor</option>
            </select>
            <textarea
              name="comment"
              className="input"
              rows="3"
              placeholder="Write your review..."
            />
            <button type="submit" className="btn-primary justify-self-start">
              Submit review
            </button>
          </form>
        ) : (
          <Link href="/login" className="mt-5 inline-block text-xs underline">
            Sign in as a buyer to review
          </Link>
        )}
      </section>
    </div>
  );
}