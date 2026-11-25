import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { query } from '@/lib/db';

const key = new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-secret-change-me-please-32chars!!');

export async function createSession(user) {
  const token = await new SignJWT({ id: user.id, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(key);
  const cookieStore = await cookies();
  cookieStore.set('session', token, {
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function getSession() {
  const cookieStore = await cookies();
  const t = cookieStore.get('session')?.value;
  if (!t) return null;
  try {
    return (await jwtVerify(t, key)).payload;
  } catch {
    return null;
  }
}

// Selalu baca ulang dari DB agar perubahan role/status langsung berlaku.
export async function getUser() {
  const s = await getSession();
  if (!s) return null;
  const rows = await query(
    'SELECT id,name,email,role,seller_status,phone,address FROM users WHERE id=$1',
    [s.id]
  );
  return rows[0] || null;
}

export async function requireRole(...roles) {
  const u = await getUser();
  if (!u) redirect('/login');
  if (!roles.includes(u.role)) redirect('/');
  if (u.role === 'seller' && u.seller_status !== 'approved') redirect('/pending-seller');
  return u;
}