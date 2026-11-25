'use server';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { query, withTx } from '@/lib/db';
import { createSession, getUser } from '@/lib/auth';
import { str, validEmail, goto } from '@/lib/validate';

export async function login(fd) {
  const email = str(fd, 'email').toLowerCase();
  const password = String(fd.get('password') ?? '');
  if (!email || !password) redirect(goto('/login', 'error', 'Email dan password wajib diisi.'));
  const [u] = await query('SELECT * FROM users WHERE email=$1', [email]);
  if (!u || !(await bcrypt.compare(password, u.password))) redirect(goto('/login', 'error', 'Email atau password salah.'));
  await createSession(u);
  if (u.role === 'admin') redirect('/admin');
  if (u.role === 'seller') redirect(u.seller_status === 'approved' ? '/seller' : '/pending-seller');
  redirect('/');
}

export async function register(fd) {
  const name = str(fd, 'name'), email = str(fd, 'email').toLowerCase(), password = String(fd.get('password') ?? ''), role = str(fd, 'role');
  if (name.length < 3) redirect(goto('/register', 'error', 'Nama minimal 3 karakter.'));
  if (!validEmail(email)) redirect(goto('/register', 'error', 'Format email tidak valid.'));
  if (password.length < 6) redirect(goto('/register', 'error', 'Password minimal 6 karakter.'));
  if (!['buyer', 'seller'].includes(role)) redirect(goto('/register', 'error', 'Pilih jenis akun.'));
  let user, err;
  try {
    user = await withTx(async (q) => {
      const hash = await bcrypt.hash(password, 10);
      const [u] = await q(
        'INSERT INTO users(name,email,password,role,seller_status) VALUES($1,$2,$3,$4,$5) RETURNING *',
        [name, email, hash, role, role === 'seller' ? 'pending' : null]
      );
      if (role === 'seller') await q('INSERT INTO stores(user_id,name) VALUES($1,$2)', [u.id, `Toko ${name}`]);
      return u;
    });
  } catch (e) {
    err = e.code === '23505' ? 'Email sudah terdaftar.' : 'Pendaftaran gagal, coba lagi.';
  }
  if (err) redirect(goto('/register', 'error', err));
  await createSession(user);
  redirect(role === 'seller' ? '/pending-seller' : '/');
}

export async function logout() {
  cookies().delete('session');
  redirect('/');
}

export async function deleteMyAccount() {
  const u = await getUser();
  if (!u || u.role !== 'seller' || u.seller_status !== 'rejected') redirect('/');
  await query('DELETE FROM users WHERE id=$1', [u.id]);
  cookies().delete('session');
  redirect('/');
}
