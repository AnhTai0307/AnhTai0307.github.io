import type { Metadata } from 'next';
import { inter } from '@/app/ui/fonts';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | Acme Dashboard',
    // %s là placeholder: mỗi trang tự điền tên trang vào đây
    default: 'Acme Dashboard',
  },
  description: 'An invoice dashboard built with the Next.js App Router, Supabase and NextAuth.',
  metadataBase: new URL('http://localhost:3000'), // đổi thành URL thật khi deploy
  openGraph: {
    title: 'Acme Dashboard',
    description: 'Manage your invoices and customers.',
    type: 'website',
    images: ['/hero.svg'],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  );
}
