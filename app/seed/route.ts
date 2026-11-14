import bcrypt from 'bcryptjs';
import sql from '@/app/lib/db';
import { customers, invoices, revenue, users } from '@/app/lib/placeholder-data';

// Chạy một lần: mở http://localhost:3000/seed để tạo bảng và chèn dữ liệu mẫu.
// Chỉ cho phép khi đang development, tránh ai đó gọi route này trên bản deploy.
export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return Response.json({ error: 'Seeding is disabled in production.' }, { status: 403 });
  }

  try {
    await sql.begin(async (tx) => {
      // --- users ---
      await tx`
        CREATE TABLE IF NOT EXISTS users (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email TEXT NOT NULL UNIQUE,
          password TEXT NOT NULL
        )`;
      for (const user of users) {
        // hash mật khẩu trước khi lưu, không bao giờ lưu plaintext
        const hashedPassword = await bcrypt.hash(user.password, 10);
        await tx`
          INSERT INTO users (id, name, email, password)
          VALUES (${user.id}, ${user.name}, ${user.email}, ${hashedPassword})
          ON CONFLICT (id) DO NOTHING`;
      }

      // --- customers ---
      await tx`
        CREATE TABLE IF NOT EXISTS customers (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          email VARCHAR(255) NOT NULL
        )`;
      for (const customer of customers) {
        await tx`
          INSERT INTO customers (id, name, email)
          VALUES (${customer.id}, ${customer.name}, ${customer.email})
          ON CONFLICT (id) DO NOTHING`;
      }

      // --- invoices (customer_id là khoá ngoại trỏ tới customers.id) ---
      await tx`
        CREATE TABLE IF NOT EXISTS invoices (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          customer_id UUID NOT NULL REFERENCES customers(id),
          amount INT NOT NULL,
          status VARCHAR(255) NOT NULL,
          date DATE NOT NULL
        )`;
      // chỉ chèn khi bảng còn trống để chạy lại /seed không bị nhân đôi hoá đơn
      const [{ count }] = await tx`SELECT COUNT(*) FROM invoices`;
      if (Number(count) === 0) {
        for (const invoice of invoices) {
          await tx`
            INSERT INTO invoices (customer_id, amount, status, date)
            VALUES (${invoice.customer_id}, ${invoice.amount}, ${invoice.status}, ${invoice.date})`;
        }
      }

      // --- revenue ---
      await tx`
        CREATE TABLE IF NOT EXISTS revenue (
          month VARCHAR(4) NOT NULL UNIQUE,
          revenue INT NOT NULL
        )`;
      for (const rev of revenue) {
        await tx`
          INSERT INTO revenue (month, revenue)
          VALUES (${rev.month}, ${rev.revenue})
          ON CONFLICT (month) DO NOTHING`;
      }
    });

    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error(error);
    return Response.json({ error: 'Seeding failed. Check the server log.' }, { status: 500 });
  }
}
