import type { Metadata } from 'next';
import { Suspense } from 'react';
import Breadcrumbs from '@/app/ui/invoices/breadcrumbs';
import InvoiceForm from '@/app/ui/invoices/invoice-form';
import { FormSkeleton } from '@/app/ui/skeletons';
import { fetchCustomers } from '@/app/lib/data';
import { createInvoice } from '@/app/lib/actions';

export const metadata: Metadata = {
  title: 'Create Invoice',
};

export default function Page() {
  return (
    <main>
      <Breadcrumbs
        breadcrumbs={[
          { label: 'Invoices', href: '/dashboard/invoices' },
          { label: 'Create Invoice', href: '/dashboard/invoices/create', active: true },
        ]}
      />
      <Suspense fallback={<FormSkeleton />}>
        <CreateForm />
      </Suspense>
    </main>
  );
}

async function CreateForm() {
  const customers = await fetchCustomers();
  return <InvoiceForm customers={customers} action={createInvoice} submitLabel="Create Invoice" />;
}
