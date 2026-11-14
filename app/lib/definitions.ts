// Kiểu dữ liệu dùng chung. Trong một dự án thật, có thể sinh tự động từ ORM.
export type User = {
  id: string;
  name: string;
  email: string;
  password: string;
};

export type Customer = {
  id: string;
  name: string;
  email: string;
};

export type Invoice = {
  id: string;
  customer_id: string;
  amount: number; // lưu bằng cents (số nguyên)
  date: string;
  // Trong TypeScript, union type giới hạn giá trị chỉ còn 'pending' hoặc 'paid'
  status: 'pending' | 'paid';
};

export type Revenue = {
  month: string;
  revenue: number;
};

export type LatestInvoice = {
  id: string;
  name: string;
  email: string;
  amount: string; // đã format thành tiền
};

export type InvoicesTable = {
  id: string;
  customer_id: string;
  name: string;
  email: string;
  date: string;
  amount: number;
  status: 'pending' | 'paid';
};

export type CustomersTableType = {
  id: string;
  name: string;
  email: string;
  total_invoices: number;
  total_pending: string;
  total_paid: string;
};

export type CustomerField = {
  id: string;
  name: string;
};

export type InvoiceForm = {
  id: string;
  customer_id: string;
  amount: number; // đơn vị: dollars (đã chia 100)
  status: 'pending' | 'paid';
};
