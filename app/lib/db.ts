import postgres from 'postgres';

// Chuỗi kết nối nằm trong .env.local (KHÔNG commit lên Git).
// Supabase: Project Settings -> Database -> Connection string.
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    'DATABASE_URL is not set. Copy .env.example to .env.local and fill it in.',
  );
}

// prepare: false -> bắt buộc khi dùng Supabase pooler (transaction mode, cổng 6543)
const sql = postgres(connectionString, { ssl: 'require', prepare: false });

export default sql;
