'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import bcrypt from 'bcryptjs';
import { pool, query } from './db';
import { createSession, getUser, logout } from './auth';

function isRedirectError(error) {
  return Boolean(error?.message?.includes('NEXT_REDIRECT'));
}

export async function registerAction(_prevState, form) {
  const name = String(form.get('name') || '').trim();
  const email = String(form.get('email') || '').trim().toLowerCase();
  const password = String(form.get('password') || '');
  const role = String(form.get('role') || 'buyer');

  if (!name || !email || password.length < 8 || !['buyer', 'seller'].includes(role)) {
    return { error: 'Lengkapi data. Password minimal 8 karakter.' };
  }

  try {
    const hash = await bcrypt.hash(password, 12);
    const status = role === 'seller' ? 'pending' : 'approved';
    const result = await query(
      'INSERT INTO users(name,email,password_hash,role,status) VALUES($1,$2,$3,$4,$5) RETURNING id,name,email,role,status',
      [name, email, hash, role, status]
    );
    const createdUser = result.rows[0];

    if (role === 'seller') {
      await query(
        'INSERT INTO stores(owner_id,name,description) VALUES($1,$2,$3)',
        [createdUser.id, `${name} Store`, 'Welcome to our store.']
      );
      await createSession(createdUser);
      redirect('/pending');
    }

    await createSession(createdUser);
    redirect('/account');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return {
      error:
        error.code === '23505'
          ? 'Email sudah digunakan.'
          : 'Pendaftaran gagal. Pastikan database sudah disiapkan.',
    };
  }
}

export async function loginAction(_prevState, form) {
  const email = String(form.get('email') || '').trim().toLowerCase();
  const password = String(form.get('password') || '');

  try {
    const result = await query(
      'SELECT id,name,email,password_hash,role,status FROM users WHERE email=$1',
      [email]
    );
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return { error: 'Email atau password tidak sesuai.' };
    }

    if (user.role === 'seller' && user.status !== 'approved') {
      await createSession(user);
      redirect('/pending');
    }

    await createSession(user);
    const targetPath =
      user.role === 'admin' ? '/admin' : user.role === 'seller' ? '/seller' : '/account';
    redirect(targetPath);
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return { error: 'Tidak dapat masuk. Periksa koneksi PostgreSQL.' };
  }
}

export async function logoutAction() {
  await logout();
  redirect('/');
}

export async function addToCartAction(form) {
  const user = await getUser();
  if (!user || user.role !== 'buyer') redirect('/login');

  const productId = Number(form.get('productId'));
  const qty = Math.max(1, Number(form.get('quantity') || 1));

  try {
    await query(
      `INSERT INTO cart_items(user_id,product_id,quantity)
       SELECT $1,$2,$3 WHERE EXISTS(SELECT 1 FROM products WHERE id=$2 AND is_active=true)
       ON CONFLICT(user_id,product_id) DO UPDATE SET quantity=cart_items.quantity+EXCLUDED.quantity`,
      [user.id, productId, qty]
    );
    revalidatePath('/cart');
    redirect('/cart');
  } catch (error) {
    if (isRedirectError(error)) throw error;
    return;
  }
}

export async function updateCartAction(form) {
  const user = await getUser();
  if (!user) redirect('/login');

  const id = Number(form.get('itemId'));
  const qty = Number(form.get('quantity'));

  if (qty <= 0) {
    await query('DELETE FROM cart_items WHERE id=$1 AND user_id=$2', [id, user.id]);
  } else {
    await query('UPDATE cart_items SET quantity=$1 WHERE id=$2 AND user_id=$3', [qty, id, user.id]);
  }

  revalidatePath('/cart');
}

export async function checkoutAction() {
  const user = await getUser();
  if (!user || user.role !== 'buyer') redirect('/login');

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const cart = await client.query(
      `SELECT ci.product_id,ci.quantity,p.price,p.stock,p.store_id
       FROM cart_items ci
       JOIN products p ON p.id=ci.product_id
       WHERE ci.user_id=$1
       FOR UPDATE`,
      [user.id]
    );

    if (!cart.rows.length) throw new Error('Keranjang kosong');

    for (const item of cart.rows) {
      if (item.stock < item.quantity) {
        throw new Error('Stok produk tidak mencukupi');
      }
    }

    const total = cart.rows.reduce(
      (sum, item) => sum + Number(item.price) * item.quantity,
      0
    );

    const order = await client.query(
      'INSERT INTO orders(buyer_id,total,status) VALUES($1,$2,$3) RETURNING id',
      [user.id, total, 'Menunggu Pembayaran']
    );
    const orderId = order.rows[0].id;

    for (const item of cart.rows) {
      await client.query(
        'INSERT INTO order_items(order_id,product_id,store_id,quantity,price) VALUES($1,$2,$3,$4,$5)',
        [orderId, item.product_id, item.store_id, item.quantity, item.price]
      );
      await client.query(
        'UPDATE products SET stock=stock-$1 WHERE id=$2',
        [item.quantity, item.product_id]
      );
    }

    await client.query('DELETE FROM cart_items WHERE user_id=$1', [user.id]);
    await client.query('COMMIT');

    revalidatePath('/cart');
    redirect('/orders');
  } catch (error) {
    await client.query('ROLLBACK');
    if (isRedirectError(error)) throw error;
    throw new Error(error.message || 'Checkout gagal');
  } finally {
    client.release();
  }
}

export async function productAction(form) {
  const user = await getUser();
  if (!user || user.role !== 'seller') redirect('/login');

  const id = form.get('id');
  const name = String(form.get('name') || '').trim();
  const description = String(form.get('description') || '').trim();
  const price = Number(form.get('price'));
  const stock = Number(form.get('stock'));
  const category = Number(form.get('category'));
  const image = String(form.get('image') || '');

  if (!name || !description || price <= 0 || stock < 0 || !category || !image) {
    throw new Error('Semua field produk wajib diisi dengan benar.');
  }

  const storeResult = await query('SELECT id FROM stores WHERE owner_id=$1', [user.id]);
  const store = storeResult.rows[0];
  if (!store) throw new Error('Lengkapi toko terlebih dahulu.');

  if (id) {
    await query(
      'UPDATE products SET name=$1,description=$2,price=$3,stock=$4,category_id=$5,image_url=$6 WHERE id=$7 AND store_id=$8',
      [name, description, price, stock, category, image, id, store.id]
    );
  } else {
    await query(
      'INSERT INTO products(store_id,category_id,name,description,price,stock,image_url) VALUES($1,$2,$3,$4,$5,$6,$7)',
      [store.id, category, name, description, price, stock, image]
    );
  }

  revalidatePath('/seller');
}

export async function updateOrderAction(form) {
  const user = await getUser();
  if (!user || user.role !== 'seller') redirect('/login');

  const id = Number(form.get('orderId'));
  const status = String(form.get('status'));
  if (!['Diproses', 'Dikirim', 'Selesai'].includes(status)) return;

  await query(
    `UPDATE orders o
     SET status=$1
     FROM order_items oi
     JOIN stores s ON s.id=oi.store_id
     WHERE o.id=$2 AND oi.order_id=o.id AND s.owner_id=$3`,
    [status, id, user.id]
  );

  revalidatePath('/seller');
}

export async function sellerDecisionAction(form) {
  const user = await getUser();
  if (!user || user.role !== 'admin') redirect('/login');

  const id = Number(form.get('userId'));
  const status = String(form.get('status'));
  if (!['approved', 'rejected'].includes(status)) return;

  await query(
    'UPDATE users SET status=$1 WHERE id=$2 AND role=$3',
    [status, id, 'seller']
  );

  revalidatePath('/admin');
}

export async function categoryAction(form) {
  const user = await getUser();
  if (!user || user.role !== 'admin') redirect('/login');

  const name = String(form.get('name') || '').trim();
  if (name) {
    await query(
      'INSERT INTO categories(name) VALUES($1) ON CONFLICT(name) DO NOTHING',
      [name]
    );
  }

  revalidatePath('/admin');
}

export async function reviewAction(form) {
  const user = await getUser();
  if (!user || user.role !== 'buyer') redirect('/login');

  const productId = Number(form.get('productId'));
  const rating = Number(form.get('rating'));
  const comment = String(form.get('comment') || '').trim();

  const bought = await query(
    `SELECT 1
     FROM order_items oi
     JOIN orders o ON o.id=oi.order_id
     WHERE o.buyer_id=$1 AND oi.product_id=$2 AND o.status='Selesai'
     LIMIT 1`,
    [user.id, productId]
  );

  if (!bought.rows.length || rating < 1 || rating > 5) return;

  await query(
    `INSERT INTO reviews(user_id,product_id,rating,comment)
     VALUES($1,$2,$3,$4)
     ON CONFLICT(user_id,product_id) DO UPDATE SET rating=EXCLUDED.rating,comment=EXCLUDED.comment`,
    [user.id, productId, rating, comment]
  );

  revalidatePath(`/products/${productId}`);
}

export async function deleteProductAction(form) {
  const user = await getUser();
  if (!user || user.role !== 'seller') redirect('/login');

  const productId = Number(form.get('productId'));
  await query(
    'DELETE FROM products p USING stores s WHERE p.store_id=s.id AND s.owner_id=$1 AND p.id=$2',
    [user.id, productId]
  );

  revalidatePath('/seller');
}

export async function storeAction(form) {
  const user = await getUser();
  if (!user || user.role !== 'seller') redirect('/login');

  const name = String(form.get('name') || '').trim();
  const description = String(form.get('description') || '').trim();
  const image = String(form.get('image') || '');

  if (!name || !description) {
    throw new Error('Nama dan deskripsi toko wajib diisi.');
  }

  await query(
    'UPDATE stores SET name=$1,description=$2,image_url=$3 WHERE owner_id=$4',
    [name, description, image || null, user.id]
  );

  revalidatePath('/seller');
}

export async function adminUserAction(form) {
  const user = await getUser();
  if (!user || user.role !== 'admin') redirect('/login');

  const id = Number(form.get('userId'));
  const name = String(form.get('name') || '').trim();
  const email = String(form.get('email') || '').trim().toLowerCase();
  const status = String(form.get('status') || 'approved');

  if (!id || !name || !email || !['pending', 'approved', 'rejected'].includes(status)) {
    return;
  }

  await query(
    'UPDATE users SET name=$1,email=$2,status=$3 WHERE id=$4 AND id<>$5',
    [name, email, status, id, user.id]
  );

  revalidatePath('/admin');
}

export async function deleteUserAction(form) {
  const user = await getUser();
  if (!user || user.role !== 'admin') redirect('/login');

  const id = Number(form.get('userId'));
  if (id !== Number(user.id)) {
    await query('DELETE FROM users WHERE id=$1 AND role<>$2', [id, 'admin']);
  }

  revalidatePath('/admin');
}

export async function deleteCategoryAction(form) {
  const user = await getUser();
  if (!user || user.role !== 'admin') redirect('/login');

  const id = Number(form.get('categoryId'));
  await query(
    'DELETE FROM categories c WHERE c.id=$1 AND NOT EXISTS(SELECT 1 FROM products p WHERE p.category_id=c.id)',
    [id]
  );

  revalidatePath('/admin');
}

export async function deleteRejectedAccountAction() {
  const user = await getUser();
  if (!user || user.role !== 'seller' || user.status !== 'rejected') {
    redirect('/');
  }

  await query('DELETE FROM users WHERE id=$1', [user.id]);
  await logout();
  redirect('/');
}

export async function profileAction(form) {
  const user = await getUser();
  if (!user) redirect('/login');

  const name = String(form.get('name') || '').trim();
  const email = String(form.get('email') || '').trim().toLowerCase();
  if (!name || !email) return;

  await query('UPDATE users SET name=$1,email=$2 WHERE id=$3', [name, email, user.id]);
  revalidatePath('/account');
}

export async function adminDeleteProductAction(form) {
  const user = await getUser();
  if (!user || user.role !== 'admin') redirect('/login');

  const productId = Number(form.get('productId'));
  await query('DELETE FROM products WHERE id=$1', [productId]);

  revalidatePath('/admin');
}

export async function updateCategoryAction(form) {
  const user = await getUser();
  if (!user || user.role !== 'admin') redirect('/login');

  const id = Number(form.get('categoryId'));
  const name = String(form.get('name') || '').trim();

  if (id && name) {
    await query('UPDATE categories SET name=$1 WHERE id=$2', [name, id]);
  }

  revalidatePath('/admin');
}