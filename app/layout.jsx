import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Script from 'next/script';
export const metadata={title:'NEXA — Objects for Everyday Living',description:'A curated marketplace for considered everyday essentials.'};
export default function RootLayout({children}){return <html lang="id" suppressHydrationWarning><head><Script id="nexa-theme-init" strategy="beforeInteractive">{`(function(){try{var saved=localStorage.getItem('nexa-theme');var dark=saved==='dark';document.documentElement.classList.toggle('dark',dark);document.documentElement.style.colorScheme=dark?'dark':'light';}catch(e){}})();`}</Script></head><body><Navbar/><main>{children}</main><Footer/></body></html>}
