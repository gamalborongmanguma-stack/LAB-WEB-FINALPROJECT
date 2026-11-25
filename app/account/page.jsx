import Link from 'next/link';
import { Package, ShoppingBag, UserRound } from 'lucide-react';
import { getUser } from '@/lib/auth';
import { profileAction } from '@/lib/actions';
import { query } from '@/lib/db';
import { money } from '@/lib/data';

export default async function Account() {
  const user = await getUser();

  if (!user) {
    return (
      <div className="container-x py-28 text-center">
        <h1 className="text-3xl font-semibold">Sign in to continue</h1>
        <Link href="/login" className="btn-primary mt-6 inline-block">
          Sign in
        </Link>
      </div>
    );
  }

  let orders = [];

  try {
    const result = await query(
      'SELECT id,total,status,created_at FROM orders WHERE buyer_id=$1 ORDER BY created_at DESC',
      [user.id]
    );
    orders = result.rows;
  } catch {}

  const firstName = user.name?.split(' ')[0];

  return (
    <div className="container-x py-14">
      <p className="muted text-[10px] font-bold uppercase tracking-[.25em]">
        Your space
      </p>
      <h1 className="mt-3 text-5xl font-semibold tracking-[-.06em]">
        Hello, <span className="font-serif italic font-normal">{firstName}.</span>
      </h1>

      <div className="mt-10 grid gap-5 md:grid-cols-3">
        <div className="surface p-6">
          <UserRound size={20} />
          <p className="muted mt-5 text-xs">Account</p>
          <p className="mt-1 font-semibold">{user.name}</p>
          <p className="muted mt-1 text-xs">{user.email}</p>
        </div>

        <Link href="/cart" className="surface p-6">
          <ShoppingBag size={20} />
          <p className="muted mt-5 text-xs">Shopping</p>
          <p className="mt-1 font-semibold">Your bag</p>
          <p className="muted mt-1 text-xs">Review selected products</p>
        </Link>

        <Link href="/orders" className="surface p-6">
          <Package size={20} />
          <p className="muted mt-5 text-xs">Purchases</p>
          <p className="mt-1 font-semibold">Order history</p>
          <p className="muted mt-1 text-xs">Track your orders</p>
        </Link>
      </div>

      <section className="surface mt-8 max-w-xl p-6">
        <h2 className="text-lg font-semibold">Profile management</h2>
        <form action={profileAction} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            name="name"
            defaultValue={user.name}
            required
            className="input"
          />
          <input
            name="email"
            type="email"
            defaultValue={user.email}
            required
            className="input"
          />
          <button type="submit" className="btn-primary sm:col-span-2">
            Update profile
          </button>
        </form>
      </section>

      <div className="mt-14 flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Recent orders</h2>
        <Link href="/orders" className="text-xs underline">
          View all
        </Link>
      </div>

      <div className="mt-5">
        {orders.length ? (
          orders.slice(0, 5).map((order) => (
            <div
              key={order.id}
              className="flex justify-between border-b py-4 text-sm"
              style={{ borderColor: 'var(--line)' }}
            >
              <div>
                <p className="font-semibold">Order #{order.id}</p>
                <p className="muted mt-1 text-xs">
                  {new Date(order.created_at).toLocaleDateString('id-ID')}
                </p>
              </div>
              <div className="text-right">
                <p className="font-semibold">{money(order.total)}</p>
                <p className="muted mt-1 text-xs">{order.status}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="muted py-10 text-sm">
            You haven't placed an order yet.
          </p>
        )}
      </div>
    </div>
  );
}