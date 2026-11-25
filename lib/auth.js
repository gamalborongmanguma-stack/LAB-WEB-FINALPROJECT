import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';

const COOKIE_NAME = 'nexa_session';
const SEVEN_DAYS_SECONDS = 60 * 60 * 24 * 7;
const FALLBACK_SECRET = 'development-secret-change-this-before-deploying-123';

const secret = new TextEncoder().encode(
  process.env.JWT_SECRET || FALLBACK_SECRET
);

export async function createSession(user) {
  const token = await new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    status: user.status,
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secret);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SEVEN_DAYS_SECONDS,
  });
}

export async function getUser() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}