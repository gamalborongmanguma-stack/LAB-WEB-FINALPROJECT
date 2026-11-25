import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { deleteMyAccount } from "@/actions/auth";

export default async function PendingSeller() {
  const u = await getUser();
  if (!u) redirect("/login");
  if (u.role !== "seller") redirect("/");
  if (u.seller_status === "approved") redirect("/seller");
  const rejected = u.seller_status === "rejected";
  return (
    <div className="mx-auto max-w-md text-center">
      <div className="card py-12">
        <h1 className="text-2xl font-bold">{rejected ? "Pendaftaran ditolak" : "Akun Anda sedang ditinjau."}</h1>
        <p className="mt-3 text-silver-400">
          {rejected ? "Admin menolak pendaftaran seller Anda. Anda dapat menghapus akun ini." : "Admin akan memeriksa pendaftaran Anda. Silakan cek kembali nanti."}
        </p>
        {rejected && <form action={deleteMyAccount} className="mt-6"><button className="btn-danger">Hapus akun</button></form>}
      </div>
    </div>
  );
}
