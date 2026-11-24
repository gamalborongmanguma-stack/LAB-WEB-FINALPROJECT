import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

const secret = () => {
  if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
    throw new Error("SESSION_SECRET harus diisi minimal 32 karakter.");
  }
  return new TextEncoder().encode(process.env.SESSION_SECRET);
};

export async function createSession(user) {
  const token = await new SignJWT({ sub: String(user.id), email: user.email, role: user.role, name: user.name })
    .setProtectedHeader({ alg: "HS256" }).setIssuedAt().setExpirationTime("7d").sign(secret());
  const jar = await cookies();
  jar.set("nocturne_session", token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 7
  });
}
export async function getSession() {
  try {
    const jar = await cookies();
    const token = jar.get("nocturne_session")?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secret());
    return { id: Number(payload.sub), email: payload.email, role: payload.role, name: payload.name };
  } catch { return null; }
}
export async function destroySession() {
  const jar = await cookies();
  jar.set("nocturne_session", "", { httpOnly: true, path: "/", maxAge: 0 });
}
export async function requireUser() {
  const user = await getSession();
  if (!user) return { error: "Silakan login terlebih dahulu.", status: 401 };
  return { user };
}
export async function requireAdmin() {
  const result = await requireUser();
  if (result.error) return result;
  if (result.user.role !== "admin") return { error: "Akses khusus admin.", status: 403 };
  return result;
}
