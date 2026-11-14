import type { Metadata } from 'next';
import { Suspense } from 'react';
import Pagination from '@/app/ui/invoices/pagination';
import Search from '@/app/ui/search';
import InvoicesTable from '@/app/ui/invoices/table';
import { CreateInvoice } from '@/app/ui/invoices/buttons';
import { lusitana } from '@/app/ui/fonts';
import { TableSkeleton } from '@/app/ui/skeletons';
import { fetchInvoicesPages } from '@/app/lib/data';

export const metadata: Metadata = {
  title: 'Invoices',
};

type SearchParams = Promise<{ query?: string; page?: string }>;

export default function Page({ searchParams }: { searchParams: SearchParams }) {
  return (
    <div className="w-full">
      <div className="flex w-full items-center justify-between">
        <h1 className={`${lusitana.className} text-2xl`}>Invoices</h1>
      </div>
      {/* searchParams là dữ liệu động -> phần dùng nó phải nằm trong Suspense */}
      <Suspense fallback={<TableSkeleton />}>
        <InvoicesContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function InvoicesContent({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const query = params?.query || '';
  const currentPage = Number(params?.page) || 1;
  const totalPages = await fetchInvoicesPages(query);

  return (
    <>
      <div className="mt-4 flex items-center justify-between gap-2 md:mt-8">
        <Search placeholder="Search invoices..." />
        <CreateInvoice />
      </div>
      {/* key đổi khi query/page đổi -> Suspense hiện lại skeleton */}
      <Suspense key={query + currentPage} fallback={<TableSkeleton />}>
        <InvoicesTable query={query} currentPage={currentPage} />
      </Suspense>
      <div className="mt-5 flex w-full justify-center">
        <Pagination totalPages={totalPages} />
      </div>
    </>
  );
}
