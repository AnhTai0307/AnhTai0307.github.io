import type { NextAuthConfig } from 'next-auth';

// File này KHÔNG được import module Node.js nặng (bcrypt, database...),
// vì nó được dùng trong proxy (chạy trước mọi request).
export const authConfig = {
  pages: {
    signIn: '/login', // chưa đăng nhập -> chuyển về đây
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      if (isOnDashboard) {
        if (isLoggedIn) return true;
        return false; // false -> redirect về /login
      } else if (isLoggedIn && nextUrl.pathname === '/login') {
        return Response.redirect(new URL('/dashboard', nextUrl));
      }
      return true;
    },
  },
  providers: [], // thêm provider ở auth.ts
} satisfies NextAuthConfig;
