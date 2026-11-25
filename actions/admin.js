'use server';
import { redirect } from 'next/navigation';
import { query } from '@/lib/db';
import { requireRole } from '@/lib/auth';
import { str, int, validEmail, goto } from '@/lib/validate';

export async function setSellerStatus(fd) {
  await requireRole('admin');
  const status = str(fd, 'status');
  if (!['approved', 'rejected'].includes(status)) redirect(goto('/admin/sellers', 'error', 'Status tidak valid.'));
  await query("UPDATE users SET seller_status=$1 WHERE id=$2 AND role='seller'", [status, int(fd, 'id')]);
  redirect(goto('/admin/sellers', 'ok', `Seller ${status === 'approved' ? 'disetujui' : 'ditolak'}.`));
}

export async function updateUser(fd) {
  await requireRole('admin');
  const id = int(fd, 'id'), name = str(fd, 'name'), email = str(fd, 'email').toLowerCase();
  const back = `/admin/users/${id}`;
  if (name.length < 3) redirect(goto(back, 'error', 'Nama minimal 3 karakter.'));
  if (!validEmail(email)) redirect(goto(back, 'error', 'Format email tidak valid.'));
  let err;
  try { await query('UPDATE users SET name=$1, email=$2 WHERE id=$3', [name, email, id]); }
  catch (e) { err = e.code === '23505' ? 'Email sudah dipakai.' : 'Gagal menyimpan.'; }
  if (err) redirect(goto(back, 'error', err));
  redirect(goto('/admin/users', 'ok', 'Pengguna diperbarui.'));
}

export async function deleteUser(fd) {
  const me = await requireRole('admin');
  const id = int(fd, 'id');
  if (id === me.id) redirect(goto('/admin/users', 'error', 'Anda tidak dapat menghapus akun sendiri.'));
  await query('DELETE FROM users WHERE id=$1', [id]);
  redirect(goto('/admin/users', 'ok', 'Pengguna dihapus.'));
}

export async function createCategory(fd) {
  await requireRole('admin');
  const name = str(fd, 'name');
  if (name.length < 2) redirect(goto('/admin/categories', 'error', 'Nama kategori minimal 2 karakter.'));
  let err;
  try { await query('INSERT INTO categories(name) VALUES($1)', [name]); }
  catch (e) { err = e.code === '23505' ? 'Kategori sudah ada.' : 'Gagal menyimpan.'; }
  redirect(err ? goto('/admin/categories', 'error', err) : goto('/admin/categories', 'ok', 'Kategori ditambahkan.'));
}

export async function updateCategory(fd) {
  await requireRole('admin');
  const name = str(fd, 'name');
  if (name.length < 2) redirect(goto('/admin/categories', 'error', 'Nama kategori minimal 2 karakter.'));
  let err;
  try { await query('UPDATE categories SET name=$1 WHERE id=$2', [name, int(fd, 'id')]); }
  catch (e) { err = e.code === '23505' ? 'Kategori sudah ada.' : 'Gagal menyimpan.'; }
  redirect(err ? goto('/admin/categories', 'error', err) : goto('/admin/categories', 'ok', 'Kategori diperbarui.'));
}

export async function deleteCategory(fd) {
  await requireRole('admin');
  await query('DELETE FROM categories WHERE id=$1', [int(fd, 'id')]);
  redirect(goto('/admin/categories', 'ok', 'Kategori dihapus.'));
}

export async function adminDeleteProduct(fd) {
  await requireRole('admin');
  await query('DELETE FROM products WHERE id=$1', [int(fd, 'id')]);
  redirect(goto('/admin/products', 'ok', 'Produk dihapus.'));
}
