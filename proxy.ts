import NextAuth from 'next-auth';
import { authConfig } from './auth.config';

// Next.js 16 đổi tên "middleware" thành "proxy".
// Chạy trước mọi request khớp matcher và áp dụng callback `authorized`.
export default NextAuth(authConfig).auth;

export const config = {
  // bỏ qua api, file tĩnh, ảnh và route /seed
  matcher: ['/((?!api|seed|_next/static|_next/image|.*\\.png$|.*\\.svg$).*)'],
};
