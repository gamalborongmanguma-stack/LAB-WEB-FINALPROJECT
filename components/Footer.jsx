import Link from 'next/link';

const EXPLORE_LINKS = [
  { href: '/products', label: 'All products' },
  { href: '/cart', label: 'Shopping bag' },
  { href: '/register', label: 'Create account' },
];

export default function Footer() {
  return (
    <footer
      className="border-t"
      style={{ borderColor: 'var(--line)' }}
    >
      <div className="container-x grid gap-10 py-14 md:grid-cols-3">
        <div>
          <Link href="/" className="text-2xl font-black tracking-[-2px]">
            NEXA<span className="text-lime-500">.</span>
          </Link>
          <p className="muted mt-4 max-w-xs text-sm leading-6">
            A considered marketplace for better everyday living. Find objects that make every day feel intentional.
          </p>
        </div>

        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-widest">
            Explore
          </p>
          <div className="muted flex flex-col gap-3 text-sm">
            {EXPLORE_LINKS.map((item) => (
              <Link key={item.href} href={item.href}>
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-widest">
            Stay in the loop
          </p>
          <p className="muted text-sm leading-6">
            Thoughtful finds, fresh arrivals, and stories from our community.
          </p>
          <div
            className="mt-4 flex border-b pb-2"
            style={{ borderColor: 'var(--line)' }}
          >
            <input
              className="w-full bg-transparent text-sm outline-none"
              placeholder="Your email address"
            />
            <span className="text-xs font-bold">JOIN ↗</span>
          </div>
        </div>
      </div>

      <div
        className="container-x muted flex flex-col justify-between gap-2 border-t py-5 text-[11px] sm:flex-row"
        style={{ borderColor: 'var(--line)' }}
      >
        <span>© 2026 NEXA Marketplace. All rights reserved.</span>
        <span>Designed for everyday essentials.</span>
      </div>
    </footer>
  );
}