'use server';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { query, withTx } from '@/lib/db';
import { getUser, requireRole } from '@/lib/auth';
import { str, int, goto } from '@/lib/validate';

export async function addToCart(fd) {
  const u = await getUser();
  if (!u) redirect('/login');
  if (u.role !== 'buyer') redirect('/');
  const pid = int(fd, 'productId');
  const qty = fd.get('quantity') ? int(fd, 'quantity') : 1;
  if (!(pid > 0) || !(qty > 0)) redirect(goto('/products', 'error', 'Data produk tidak valid.'));
  const [p] = await query('SELECT stock FROM products WHERE id=$1', [pid]);
  if (!p || p.stock < 1) redirect(goto('/products', 'error', 'Produk tidak tersedia.'));
  await query(
    `INSERT INTO cart_items(user_id,product_id,quantity) VALUES($1,$2,LEAST($3,$4))
     ON CONFLICT (user_id,product_id) DO UPDATE SET quantity = LEAST(cart_items.quantity + $3, $4)`,
    [u.id, pid, qty, p.stock]
  );
  revalidatePath('/', 'layout');
  redirect('/cart');
}

export async function updateCart(fd) {
  const u = await requireRole('buyer');
  const id = int(fd, 'itemId'), qty = int(fd, 'quantity');
  if (!(id > 0) || Number.isNaN(qty)) return;
  if (qty < 1) await query('DELETE FROM cart_items WHERE id=$1 AND user_id=$2', [id, u.id]);
  else await query(
    `UPDATE cart_items SET quantity=LEAST($1,(SELECT stock FROM products WHERE id=cart_items.product_id))
     WHERE id=$2 AND user_id=$3`, [qty, id, u.id]);
  revalidatePath('/', 'layout');
}

export async function removeCart(fd) {
  const u = await requireRole('buyer');
  await query('DELETE FROM cart_items WHERE id=$1 AND user_id=$2', [int(fd, 'itemId'), u.id]);
  revalidatePath('/', 'layout');
}

export async function checkout(fd) {
  const u = await requireRole('buyer');
  const address = str(fd, 'address');
  if (address.length < 10) redirect(goto('/cart', 'error', 'Alamat pengiriman wajib diisi (minimal 10 karakter).'));
  let err;
  try {
    await withTx(async (q) => {
      const items = await q(
        `SELECT ci.quantity, p.id, p.name, p.price, p.stock, p.store_id FROM cart_items ci
         JOIN products p ON p.id=ci.product_id WHERE ci.user_id=$1 FOR UPDATE OF p`, [u.id]);
      if (!items.length) throw new Error('Keranjang kosong.');
      for (const i of items) if (i.stock < i.quantity) throw new Error(`Stok "${i.name}" tidak cukup (sisa ${i.stock}).`);
      const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
      const [o] = await q('INSERT INTO orders(buyer_id,total,address) VALUES($1,$2,$3) RETURNING id', [u.id, total, address]);
      for (const i of items) {
        await q('INSERT INTO order_items(order_id,product_id,store_id,product_name,price,quantity) VALUES($1,$2,$3,$4,$5,$6)',
          [o.id, i.id, i.store_id, i.name, i.price, i.quantity]);
        await q('UPDATE products SET stock=stock-$1 WHERE id=$2', [i.quantity, i.id]);
      }
      await q('DELETE FROM cart_items WHERE user_id=$1', [u.id]);
      await q('UPDATE users SET address=$1 WHERE id=$2', [address, u.id]);
    });
  } catch (e) { err = e.message; }
  if (err) redirect(goto('/cart', 'error', err));
  revalidatePath('/', 'layout');
  redirect(goto('/orders', 'ok', 'Pesanan berhasil dibuat.'));
}

export async function updateProfile(fd) {
  const u = await requireRole('buyer');
  const name = str(fd, 'name'), phone = str(fd, 'phone'), address = str(fd, 'address');
  if (name.length < 3) redirect(goto('/profile', 'error', 'Nama minimal 3 karakter.'));
  await query('UPDATE users SET name=$1, phone=$2, address=$3 WHERE id=$4', [name, phone || null, address || null, u.id]);
  redirect(goto('/profile', 'ok', 'Profil diperbarui.'));
}

export async function addReview(fd) {
  const u = await requireRole('buyer');
  const pid = int(fd, 'productId'), rating = int(fd, 'rating'), comment = str(fd, 'comment');
  const back = `/products/${pid}`;
  if (!(rating >= 1 && rating <= 5) || comment.length < 3) redirect(goto(back, 'error', 'Isi rating 1-5 dan ulasan.'));
  const ok = await query(
    `SELECT 1 FROM order_items oi JOIN orders o ON o.id=oi.order_id
     WHERE o.buyer_id=$1 AND oi.product_id=$2 AND oi.status='Selesai' LIMIT 1`, [u.id, pid]);
  if (!ok.length) redirect(goto(back, 'error', 'Ulasan hanya untuk pesanan yang sudah selesai.'));
  await query(
    `INSERT INTO reviews(product_id,user_id,rating,comment) VALUES($1,$2,$3,$4)
     ON CONFLICT (product_id,user_id) DO UPDATE SET rating=$3, comment=$4`, [pid, u.id, rating, comment]);
  redirect(goto(back, 'ok', 'Ulasan tersimpan.'));
}
