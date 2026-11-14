'use server'; // mọi hàm export trong file này chỉ chạy trên server

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { AuthError } from 'next-auth';
import sql from './db';
import { signIn } from '@/auth';

const FormSchema = z.object({
  id: z.string(),
  customerId: z.string({ error: 'Please select a customer.' }).min(1, 'Please select a customer.'),
  amount: z.coerce.number().gt(0, 'Please enter an amount greater than $0.'),
  status: z.enum(['pending', 'paid'], { error: 'Please select an invoice status.' }),
  date: z.string(),
});

const CreateInvoice = FormSchema.omit({ id: true, date: true });
const UpdateInvoice = FormSchema.omit({ id: true, date: true });

export type State = {
  errors?: {
    customerId?: string[];
    amount?: string[];
    status?: string[];
  };
  message?: string | null;
};

export async function createInvoice(prevState: State, formData: FormData): Promise<State> {
  // Bước 1: validate trên server (không tin dữ liệu từ client)
  const validatedFields = CreateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: z.flattenError(validatedFields.error).fieldErrors,
      message: 'Missing Fields. Failed to Create Invoice.',
    };
  }

  // Bước 2: chuẩn bị dữ liệu. Lưu tiền bằng cents để tránh lỗi số thực
  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = Math.round(amount * 100);
  const date = new Date().toISOString().split('T')[0];

  // Bước 3: ghi vào database
  try {
    await sql`
      INSERT INTO invoices (customer_id, amount, status, date)
      VALUES (${customerId}, ${amountInCents}, ${status}, ${date})`;
  } catch (error) {
    console.error(error);
    return { message: 'Database Error: Failed to Create Invoice.' };
  }

  // Bước 4: xoá cache và điều hướng.
  // redirect() ném một signal đặc biệt nên phải đặt NGOÀI try/catch.
  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function updateInvoice(
  id: string,
  prevState: State,
  formData: FormData,
): Promise<State> {
  const validatedFields = UpdateInvoice.safeParse({
    customerId: formData.get('customerId'),
    amount: formData.get('amount'),
    status: formData.get('status'),
  });

  if (!validatedFields.success) {
    return {
      errors: z.flattenError(validatedFields.error).fieldErrors,
      message: 'Missing Fields. Failed to Update Invoice.',
    };
  }

  const { customerId, amount, status } = validatedFields.data;
  const amountInCents = Math.round(amount * 100);

  try {
    await sql`
      UPDATE invoices
      SET customer_id = ${customerId}, amount = ${amountInCents}, status = ${status}
      WHERE id = ${id}`;
  } catch (error) {
    console.error(error);
    return { message: 'Database Error: Failed to Update Invoice.' };
  }

  revalidatePath('/dashboard/invoices');
  redirect('/dashboard/invoices');
}

export async function deleteInvoice(id: string) {
  await sql`DELETE FROM invoices WHERE id = ${id}`;
  revalidatePath('/dashboard/invoices');
}

export async function authenticate(
  prevState: string | undefined,
  formData: FormData,
) {
  try {
    await signIn('credentials', formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return 'Invalid credentials.';
        default:
          return 'Something went wrong.';
      }
    }
    // signIn thành công sẽ redirect (ném signal), phải ném tiếp ra ngoài
    throw error;
  }
}
