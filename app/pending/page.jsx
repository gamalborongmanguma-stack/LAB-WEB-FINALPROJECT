import Link from 'next/link';
import { getUser } from '@/lib/auth';
import { logoutAction, deleteRejectedAccountAction } from '@/lib/actions';

export default async function Pending() {
  const user = await getUser();
  const isRejected = user?.status === 'rejected';

  const description = isRejected
    ? 'Your seller application was not approved. You can contact the platform administrator for more information.'
    : 'Thank you for registering as a seller. Your account is being reviewed by our admin team. You will be able to access your seller dashboard after approval.';

  return (
    <div className="container-x grid min-h-150 place-items-center py-16">
      <div className="surface max-w-lg p-10 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-lime-300 text-2xl text-black">
          ⌛
        </div>

        <p className="muted mt-7 text-[10px] font-bold uppercase tracking-[.25em]">
          Seller verification
        </p>
        <h1 className="mt-3 text-3xl font-semibold">
          Your account is under review.
        </h1>
        <p className="muted mt-4 text-sm leading-7">{description}</p>

        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className="pill">
            Back to home
          </Link>

          {isRejected ? (
            <form action={deleteRejectedAccountAction}>
              <button type="submit" className="btn-primary">
                Delete account
              </button>
            </form>
          ) : (
            <form action={logoutAction}>
              <button type="submit" className="btn-primary">
                Sign out
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}