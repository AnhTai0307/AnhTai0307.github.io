import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense } from 'react';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import InvoiceForm from '@/app/ui/invoices/invoice-form';
import { FormSkeleton } from '@/app/ui/skeletons';
import { fetchCustomers, fetchInvoiceById } from '@/app/lib/data';
import { updateInvoice } from '@/app/lib/actions';

export const metadata: Metadata = {
  title: 'Edit Invoice',
};

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  return (
    <main>
      <Suspense fallback={<FormSkeleton />}>
        <EditContent params={params} />
      </Suspense>
    </main>
  );
}

async function EditContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 2 truy vấn độc lập -> chạy song song
  const [invoice, customers] = await Promise.all([fetchInvoiceById(id), fetchCustomers()]);

  if (!invoice) {
    notFound(); // render not-found.tsx
  }

  // .bind(null, id): gắn sẵn id vào Server Action; useActionState sẽ truyền tiếp (prevState, formData)
  const updateInvoiceWithId = updateInvoice.bind(null, id);

  return (
    <>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          { label: 'Edit Invoice', href: `/dashboard/invoices/${id}/edit`, active: true },
        ]}
      />
      <InvoiceForm
        invoice={invoice}
        customers={customers}
        action={updateInvoiceWithId}
        submitLabel="Edit Invoice"
      />
    </>
  );
}
