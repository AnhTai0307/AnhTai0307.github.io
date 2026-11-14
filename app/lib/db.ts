import postgres from 'postgres';

// Chuỗi kết nối nằm trong .env.local (KHÔNG commit lên Git).
// Supabase: Project Settings -> Database -> Connection string.
let client: postgres.Sql | undefined;

// Tạo kết nối khi cần dùng lần đầu (lazy). Nhờ vậy thiếu DATABASE_URL
// chỉ gây lỗi lúc truy vấn, không làm sập các trang không dùng database (ví dụ /login).
function getClient() {
  if (!client) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error(
        'DATABASE_URL is not set. Fill it in .env.local (see .env.example) and restart the dev server.',
      );
    }
    // prepare: false -> bắt buộc khi dùng Supabase pooler (transaction mode, cổng 6543)
    client = postgres(connectionString, { ssl: 'require', prepare: false });
  }
  return client;
}

// `sql` dùng như tagged template (sql`SELECT ...`) và như đối tượng (sql.begin(...))
const sql = new Proxy(function () {} as unknown as postgres.Sql, {
  apply: (_target, _thisArg, args) =>
    (getClient() as unknown as (...a: unknown[]) => unknown)(...args),
  get: (_target, prop) => Reflect.get(getClient(), prop),
}) as postgres.Sql;

export default sql;
