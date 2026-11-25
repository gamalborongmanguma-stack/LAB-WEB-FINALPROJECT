'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ShoppingBag, Menu, X, Sun, Moon, UserRound } from 'lucide-react';

const NAV_LINKS = [
  { href: '/products', label: 'Discover' },
  { href: '/#categories', label: 'Categories' },
  { href: '/#about', label: 'Our Story' },
];

export default function Navbar() {
  const [dark, setDark] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDark(isDark);
  }, []);

  function toggleTheme() {
    const nextDark = !dark;
    setDark(nextDark);
    document.documentElement.classList.toggle('dark', nextDark);
    document.documentElement.style.colorScheme = nextDark ? 'dark' : 'light';
    localStorage.setItem('nexa-theme', nextDark ? 'dark' : 'light');
  }

  return (
    <header
      className="sticky top-0 z-50 border-b"
      style={{ background: 'var(--surface)', borderColor: 'var(--line)' }}
    >
      <div className="container-x flex h-[76px] items-center justify-between">
        <Link href="/" className="text-[25px] font-black tracking-[-2px]">
          NEXA<span className="text-lime-500">.</span>
        </Link>

        <nav className="hidden items-center gap-9 text-[13px] md:flex">
          {NAV_LINKS.map((item) => (
            <Link key={item.href} href={item.href} className="hover:opacity-60">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Ganti tema"
            className="rounded-full p-3 hover:bg-black/5"
          >
            {dark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <Link href="/cart" className="rounded-full p-3 hover:bg-black/5">
            <ShoppingBag size={18} />
          </Link>

          <Link
            href="/login"
            className="hidden items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-semibold sm:flex"
            style={{ borderColor: 'var(--line)' }}
          >
            Sign in <UserRound size={15} />
          </Link>

          <button
            type="button"
            className="p-2 md:hidden"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Toggle menu"
          >
            {open ? <X /> : <Menu />}
          </button>
        </div>
      </div>

      {open && (
        <div
          className="border-t px-6 py-5 md:hidden"
          style={{ borderColor: 'var(--line)' }}
        >
          <div className="flex flex-col gap-4 text-sm">
            {NAV_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link href="/login" onClick={() => setOpen(false)}>
              Sign in / Register
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}