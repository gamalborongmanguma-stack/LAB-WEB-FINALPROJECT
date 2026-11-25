import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
export const metadata={title:'NEXA — Objects for Everyday Living',description:'A curated marketplace for considered everyday essentials.'};
export default function RootLayout({children}){return <html lang="id" suppressHydrationWarning><body><Navbar/><main>{children}</main><Footer/></body></html>}
