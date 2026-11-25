import Link from "next/link";
import { login } from "@/actions/auth";
import { Flash } from "@/components/ui";

export default function LoginPage({ searchParams }) {
  return (
    <div className="mx-auto max-w-md">
      <div className="card">
        <h1 className="mb-1 text-2xl font-bold">Masuk</h1>
        <p className="mb-6 text-sm text-silver-400">Gunakan akun Admin, Seller, atau Buyer.</p>
        <Flash sp={searchParams} />
        <form action={login} className="space-y-4">
          <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required className="input" /></div>
          <div><label className="label" htmlFor="password">Password</label><input id="password" name="password" type="password" required className="input" /></div>
          <button className="btn w-full">Masuk</button>
        </form>
        <p className="mt-5 text-center text-sm text-silver-400">Belum punya akun? <Link href="/register" className="text-silver-100 underline">Daftar</Link></p>
      </div>
    </div>
  );
}
