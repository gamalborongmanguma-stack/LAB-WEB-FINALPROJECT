'use server';
import { redirect } from 'next/navigation';
import { query } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { str, int, goto } from '@/lib/validate';
import { STATUSES } from '@/lib/format';

async function myStore(u) {
  const [s] = await query('SELECT * FROM stores WHERE user_id=$1', [u.id]);
  return s;
}

async function parseProduct(fd) {
  const d = { name: str(fd, 'name'), description: str(fd, 'description'), price: int(fd, 'price'),
    stock: int(fd, 'stock'), image_url: str(fd, 'image_url'), category_id: int(fd, 'category_id') };
  if (d.name.length < 3) return { error: 'Nama produk minimal 3 karakter.' };
  if (!d.description) return { error: 'Deskripsi wajib diisi.' };
  if (!(d.price >= 0)) return { error: 'Harga harus berupa angka bulat >= 0.' };
  if (!(d.stock >= 0)) return { error: 'Stok harus berupa angka bulat >= 0.' };
  if (!/^https?:\/\//.test(d.image_url)) return { error: 'URL gambar harus diawali http:// atau https://.' };
  const [c] = await query('SELECT 1 FROM categories WHERE id=$1', [d.category_id]);
  if (!c) return { error: 'Pilih kategori yang valid.' };
  return { d };
}

export async function saveStore(fd) {
  const u = await requireRole('seller');
  const name = str(fd, 'name'), description = str(fd, 'description'), image = str(fd, 'image_url');
  if (name.length < 3) redirect(goto('/seller/store', 'error', 'Nama toko minimal 3 karakter.'));
  if (image && !/^https?:\/\//.test(image)) redirect(goto('/seller/store', 'error', 'URL gambar tidak valid.'));
  await query('UPDATE stores SET name=$1, description=$2, image_url=$3 WHERE user_id=$4', [name, description || null, image || null, u.id]);
  redirect(goto('/seller/store', 'ok', 'Informasi toko disimpan.'));
}

export async function createProduct(fd) {
  const u = await requireRole('seller');
  const { d, error } = await parseProduct(fd);
  if (error) redirect(goto('/seller/products/new', 'error', error));
  const s = await myStore(u);
  await query('INSERT INTO products(store_id,category_id,name,description,price,stock,image_url) VALUES($1,$2,$3,$4,$5,$6,$7)',
    [s.id, d.category_id, d.name, d.description, d.price, d.stock, d.image_url]);
  redirect(goto('/seller/products', 'ok', 'Produk ditambahkan.'));
}

export async function updateProduct(fd) {
  const u = await requireRole('seller');
  const id = int(fd, 'id');
  const { d, error } = await parseProduct(fd);
  if (error) redirect(goto(`/seller/products/${id}/edit`, 'error', error));
  const s = await myStore(u);
  await query('UPDATE products SET category_id=$1,name=$2,description=$3,price=$4,stock=$5,image_url=$6 WHERE id=$7 AND store_id=$8',
    [d.category_id, d.name, d.description, d.price, d.stock, d.image_url, id, s.id]);
  redirect(goto('/seller/products', 'ok', 'Produk diperbarui.'));
}

export async function deleteProduct(fd) {
  const u = await requireRole('seller');
  const s = await myStore(u);
  await query('DELETE FROM products WHERE id=$1 AND store_id=$2', [int(fd, 'id'), s.id]);
  redirect(goto('/seller/products', 'ok', 'Produk dihapus.'));
}

export async function updateOrderStatus(fd) {
  const u = await requireRole('seller');
  const status = str(fd, 'status');
  if (!STATUSES.includes(status)) redirect(goto('/seller/orders', 'error', 'Status tidak valid.'));
  const s = await myStore(u);
  await query('UPDATE order_items SET status=$1 WHERE id=$2 AND store_id=$3', [status, int(fd, 'id'), s.id]);
  redirect(goto('/seller/orders', 'ok', 'Status pesanan diperbarui.'));
}
