# Acme Dashboard

Ứng dụng quản lý hoá đơn (invoice) xây dựng cho **Lab 5 – Part 2**, theo khoá học
[Next.js Learn – Dashboard App](https://nextjs.org/learn/dashboard-app).

**Công nghệ:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS 4 ·
Supabase (PostgreSQL) · NextAuth v5 · Zod

## Tính năng

- **Dashboard:** thẻ thống kê, biểu đồ doanh thu, hoá đơn mới nhất. Mỗi khối được stream
  độc lập bằng `<Suspense>` + skeleton, kết hợp Partial Prerendering (`cacheComponents`).
- **Invoices:** xem danh sách, tìm kiếm (debounce) và phân trang qua URL search params,
  tạo / sửa / xoá bằng Server Actions, validate bằng Zod, lưu tiền theo cents.
- **Customers:** danh sách khách hàng, tìm kiếm, tổng tiền pending / paid.
- **Xác thực:** đăng nhập bằng email + mật khẩu (NextAuth, mật khẩu hash bằng bcrypt),
  `proxy.ts` chặn mọi route `/dashboard/*` khi chưa đăng nhập.
- **Xử lý lỗi:** `error.tsx` cho lỗi bất ngờ, `not-found.tsx` cho invoice không tồn tại.
- **Accessibility:** `label htmlFor`, `aria-describedby`, `aria-live` cho thông báo lỗi.
- **SEO:** Metadata API với title template và Open Graph.
- **Hiệu năng:** `next/font` và `next/image`.

## Cấu trúc thư mục

```
app/
├── page.tsx                      Trang chủ
├── login/                        Trang đăng nhập
├── seed/route.ts                 Tạo bảng + dữ liệu mẫu (chỉ chạy ở development)
├── dashboard/
│   ├── layout.tsx                Layout dùng chung (sidebar)
│   ├── page.tsx                  Tổng quan
│   ├── invoices/                 Danh sách, create/, [id]/edit/, error.tsx
│   └── customers/                Danh sách khách hàng
├── lib/                          db.ts, data.ts (truy vấn), actions.ts (Server Actions)
└── ui/                           Component giao diện
auth.ts / auth.config.ts          Cấu hình NextAuth
proxy.ts                          Bảo vệ route (tên mới của middleware trong Next 16)
```

## Chạy trên máy

**Yêu cầu:** Node.js 20+ và một project Supabase.

1. Cài thư viện:

   ```bash
   npm install
   ```

2. Tạo file môi trường:

   ```bash
   cp .env.example .env.local
   ```

   Điền hai biến trong `.env.local`:

   | Biến | Lấy ở đâu |
   | --- | --- |
   | `DATABASE_URL` | Supabase → **Connect** → Transaction pooler (cổng 6543) → URI. Thay `[YOUR-PASSWORD]` bằng mật khẩu database. |
   | `AUTH_SECRET` | Chạy `npx auth secret` hoặc `openssl rand -base64 32` |

   Nếu mật khẩu có ký tự đặc biệt, hãy mã hoá URL (`@` → `%40`, `#` → `%23`).
   `.env.local` đã nằm trong `.gitignore`, không commit file này.

3. Chạy server:

   ```bash
   npm run dev
   ```

4. Mở <http://localhost:3000/seed> một lần để tạo bảng và chèn dữ liệu mẫu. Thấy
   `Database seeded successfully` là xong.

5. Mở <http://localhost:3000/login> và đăng nhập bằng tài khoản mẫu `user@nextmail.com`
   (mật khẩu xem trong `app/lib/placeholder-data.ts`).

## Lệnh

| Lệnh | Tác dụng |
| --- | --- |
| `npm run dev` | Chạy chế độ development |
| `npm run build` | Build production |
| `npm run start` | Chạy bản build |

## Lưu ý

- Route `/seed` bị tắt khi `NODE_ENV=production`.
- Supabase pooler dùng IPv6 theo mặc định. Nếu mạng chỉ có IPv4 và không kết nối được,
  dùng **Session pooler** (cổng 5432).
- Khi deploy, nhớ đặt `DATABASE_URL`, `AUTH_SECRET` trong biến môi trường của nền tảng
  và đổi `metadataBase` trong `app/layout.tsx` sang URL thật.
