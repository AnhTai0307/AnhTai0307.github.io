import { Inter, Lusitana } from 'next/font/google';

// next/font tải font lúc build và nhúng vào CSS -> không có request mạng lúc chạy, giảm CLS
export const inter = Inter({ subsets: ['latin'] });

export const lusitana = Lusitana({
  weight: ['400', '700'],
  subsets: ['latin'],
});
