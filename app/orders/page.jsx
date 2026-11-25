import Link from 'next/link';
import { getUser } from '@/lib/auth';
import { query } from '@/lib/db';
import { money } from '@/lib/data';

export default async function Orders() {
  const user = await getUser();

  if (!user) {
    return (
      <div className="container-x py-24 text-center">
        <h1 className="text-3xl font-semibold">Your orders</h1>
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

  return (
    <div className="container-x min-h-125 py-14">
      <p className="muted text-[10px] font-bold uppercase tracking-[.25em]">
        Your purchases
      </p>
      <h1 className="mt-3 text-5xl font-semibold tracking-tighter">
        Order <span className="font-serif italic font-normal">history.</span>
      </h1>

      <div className="mt-10">
        {orders.length ? (
          orders.map((order) => (
            <div
              key={order.id}
              className="surface mb-3 flex flex-col justify-between gap-4 p-5 sm:flex-row sm:items-center"
            >
              <div>
                <p className="font-semibold">Order #{order.id}</p>
                <p className="muted mt-1 text-xs">
                  {new Date(order.created_at).toLocaleString('id-ID')}
                </p>
              </div>

              <div className="flex items-center gap-8">
                <div>
                  <p className="muted text-[10px]">TOTAL</p>
                  <p className="mt-1 text-sm font-semibold">
                    {money(order.total)}
                  </p>
                </div>
                <span className="rounded-full bg-lime-300/20 px-3 py-2 text-xs">
                  {order.status}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="py-20 text-center">
            <p className="muted text-sm">No orders yet.</p>
            <Link href="/products" className="btn-primary mt-5 inline-block">
              Start shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}