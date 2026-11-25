import Link from "next/link";
import { register } from "@/actions/auth";
import { Flash } from "@/components/ui";

export default function RegisterPage({ searchParams }) {
  const opt = "flex cursor-pointer items-center gap-2 rounded-xl border border-line p-3 text-sm has-[:checked]:border-silver-200 has-[:checked]:bg-white/5";
  return (
    <div className="mx-auto max-w-md">
      <div className="card">
        <h1 className="mb-1 text-2xl font-bold">Buat akun</h1>
        <p className="mb-6 text-sm text-silver-400">Seller baru perlu disetujui admin sebelum bisa berjualan.</p>
        <Flash sp={searchParams} />
        <form action={register} className="space-y-4">
          <div><label className="label" htmlFor="name">Nama lengkap</label><input id="name" name="name" required minLength={3} className="input" /></div>
          <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required className="input" /></div>
          <div><label className="label" htmlFor="password">Password</label><input id="password" name="password" type="password" required minLength={6} className="input" /></div>
          <fieldset>
            <legend className="label">Daftar sebagai</legend>
            <div className="grid grid-cols-2 gap-2">
              <label className={opt}><input type="radio" name="role" value="buyer" defaultChecked /> Buyer</label>
              <label className={opt}><input type="radio" name="role" value="seller" /> Seller</label>
            </div>
          </fieldset>
          <button className="btn w-full">Daftar</button>
        </form>
        <p className="mt-5 text-center text-sm text-silver-400">Sudah punya akun? <Link href="/login" className="text-silver-100 underline">Masuk</Link></p>
      </div>
    </div>
  );
}
