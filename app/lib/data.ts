import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import sql from './db';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  LatestInvoice,
  Revenue,
  User,
} from './definitions';
import { formatCurrency } from './utils';

// Server Component gọi thẳng database, không cần tầng API trung gian.

export async function fetchRevenue() {
  await connection(); // dữ liệu động: chỉ chạy khi có request, không chạy lúc build
  try {
    const data = await sql<Revenue[]>`SELECT * FROM revenue`;
    return data;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  await connection(); // dữ liệu động: chỉ chạy khi có request, không chạy lúc build
  try {
    const data = await sql<
      { id: string; name: string; email: string; amount: number }[]
    >`
      SELECT invoices.amount, customers.name, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    const latestInvoices: LatestInvoice[] = data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  await connection(); // dữ liệu động: chỉ chạy khi có request, không chạy lúc build
  try {
    // 3 truy vấn độc lập -> chạy song song bằng Promise.all để tránh waterfall
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    return {
      numberOfInvoices: Number(data[0][0].count ?? '0'),
      numberOfCustomers: Number(data[1][0].count ?? '0'),
      totalPaidInvoices: formatCurrency(Number(data[2][0].paid ?? '0')),
      totalPendingInvoices: formatCurrency(Number(data[2][0].pending ?? '0')),
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 6;

export async function fetchFilteredInvoices(query: string, currentPage: number) {
  await connection(); // dữ liệu động: chỉ chạy khi có request, không chạy lúc build
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await sql<InvoicesTable[]>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}`;

    return invoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchInvoicesPages(query: string) {
  await connection(); // dữ liệu động: chỉ chạy khi có request, không chạy lúc build
  try {
    const data = await sql`
      SELECT COUNT(*)
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}`;

    return Math.ceil(Number(data[0].count) / ITEMS_PER_PAGE);
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  await connection(); // dữ liệu động: chỉ chạy khi có request, không chạy lúc build
  // id không phải UUID hợp lệ -> coi như không tồn tại
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuid.test(id)) {
    notFound();
  }

  try {
    const data = await sql<InvoiceForm[]>`
      SELECT invoices.id, invoices.customer_id, invoices.amount, invoices.status
      FROM invoices
      WHERE invoices.id = ${id}`;

    if (data.length === 0) {
      return undefined;
    }

    // đổi cents -> dollars để hiển thị trong form
    return { ...data[0], amount: data[0].amount / 100 };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  await connection(); // dữ liệu động: chỉ chạy khi có request, không chạy lúc build
  try {
    const customers = await sql<CustomerField[]>`
      SELECT id, name
      FROM customers
      ORDER BY name ASC`;
    return customers;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  await connection(); // dữ liệu động: chỉ chạy khi có request, không chạy lúc build
  try {
    const data = await sql<
      Omit<CustomersTableType, 'total_pending' | 'total_paid'> & {
        total_pending: number;
        total_paid: number;
      }[]
    >`
      SELECT
        customers.id,
        customers.name,
        customers.email,
        COUNT(invoices.id) AS total_invoices,
        SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
        SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
      FROM customers
      LEFT JOIN invoices ON customers.id = invoices.customer_id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
      GROUP BY customers.id, customers.name, customers.email
      ORDER BY customers.name ASC`;

    return data.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(Number(customer.total_pending)),
      total_paid: formatCurrency(Number(customer.total_paid)),
    })) as CustomersTableType[];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch customer table.');
  }
}

export async function getUser(email: string) {
  try {
    const user = await sql<User[]>`SELECT * FROM users WHERE email = ${email}`;
    return user[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}
