import './globals.css';
import { Manrope } from 'next/font/google';
import Navbar from '@/components/Navbar';

const manrope = Manrope({ subsets: ['latin'], variable: '--font-manrope' });

export const metadata = { title: 'Silvera — Belanja online', description: 'Marketplace multi-toko bertema dark & silver.' };

export default function RootLayout({ children }) {
  return (
    <html lang="id" className={manrope.variable}>
      <body className="min-h-screen font-sans">
        <Navbar />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="border-t border-line py-8 text-center text-sm text-silver-500">© 2026 Silvera</footer>
      </body>
    </html>
  );
}
