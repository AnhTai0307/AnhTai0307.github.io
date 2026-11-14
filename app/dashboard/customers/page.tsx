import type { Metadata } from 'next';
import { Suspense } from 'react';
import Avatar from '@/app/ui/avatar';
import Search from '@/app/ui/search';
import { lusitana } from '@/app/ui/fonts';
import { TableSkeleton } from '@/app/ui/skeletons';
import { fetchFilteredCustomers } from '@/app/lib/data';

export const metadata: Metadata = {
  title: 'Customers',
};

type SearchParams = Promise<{ query?: string }>;

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="w-full">
      <h1 className={`${lusitana.className} mb-8 text-xl md:text-2xl`}>Customers</h1>
      <Suspense fallback={<TableSkeleton />}>
        <CustomersContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function CustomersContent({ searchParams }: { searchParams: SearchParams }) {
  const { query = '' } = await searchParams;
  const customers = await fetchFilteredCustomers(query);

  return (
    <>
      <Search placeholder="Search customers..." />
      <div className="mt-6 overflow-x-auto rounded-md bg-gray-50 p-2">
        <table className="min-w-full text-left text-sm text-gray-900">
          <thead className="rounded-md text-sm font-normal">
            <tr>
              <th scope="col" className="px-4 py-5 font-medium sm:pl-6">Name</th>
              <th scope="col" className="px-3 py-5 font-medium">Email</th>
              <th scope="col" className="px-3 py-5 font-medium">Total Invoices</th>
              <th scope="col" className="px-3 py-5 font-medium">Total Pending</th>
              <th scope="col" className="px-4 py-5 font-medium">Total Paid</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {customers.map((customer) => (
              <tr key={customer.id} className="border-b last-of-type:border-none">
                <td className="whitespace-nowrap py-3 pl-6 pr-3">
                  <div className="flex items-center gap-3">
                    <Avatar name={customer.name} />
                    <p>{customer.name}</p>
                  </div>
                </td>
                <td className="whitespace-nowrap px-3 py-3">{customer.email}</td>
                <td className="whitespace-nowrap px-3 py-3">{customer.total_invoices}</td>
                <td className="whitespace-nowrap px-3 py-3">{customer.total_pending}</td>
                <td className="whitespace-nowrap px-4 py-3">{customer.total_paid}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && (
          <p className="p-6 text-center text-sm text-gray-500">No customers found.</p>
        )}
      </div>
    </>
  );
}
