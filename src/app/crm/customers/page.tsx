// src/app/crm/customers/page.tsx
import React, { Suspense } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import PaginationControls from '@/components/crm/PaginationControls';
import { getPayloadClient } from '@/payload';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

async function getCustomers({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const resolvedSearchParams = await searchParams;
  const session = await getServerSession(authOptions);
  if (!(session as any)?.user || (((session as any).user)?.role !== 'admin' && ((session as any).user)?.role !== 'manager')) {
    throw new Error('Unauthorized');
  }

  const payload = await getPayloadClient();

  const page = typeof resolvedSearchParams.page === 'string' ? parseInt(resolvedSearchParams.page) : 1;
  const limit = typeof resolvedSearchParams.limit === 'string' ? parseInt(resolvedSearchParams.limit) : 10;
  const searchQuery = typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : undefined;

  const where: any = {};
  if (searchQuery) {
    where.or = [
      { fullName: { like: searchQuery } },
      { email: { like: searchQuery } },
    ];
  }

  const customersData = await payload.find({
    collection: 'customers',
    where,
    page,
    limit,
    depth: 1,
  });

  return customersData;
}

const CustomersContent = async ({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) => {
  const customersData = await getCustomers({ searchParams });
  const resolvedSearchParams = await searchParams;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Customers</h1>
        <Button asChild>
          <Link href="/crm/customers/new">New Customer</Link>
        </Button>
      </div>
      <div className="flex items-center justify-between mb-4">
        <form action="/crm/customers" method="GET" className="flex items-center space-x-2">
        <Input name="search" placeholder="Search customers..." className="max-w-sm" defaultValue={typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : ''} />
        <Button type="submit">Search</Button>
      </form>
        {/* Add filter controls here */}
      </div>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>Loyalty Tier</TableHead>
              <TableHead><span className="sr-only">Actions</span></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {customersData.docs.map((customer: any) => (
              <TableRow key={customer.id}>
                <TableCell className="font-medium">{customer.fullName}</TableCell>
                <TableCell>{customer.email}</TableCell>
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{customer.loyaltyProgram?.loyaltyTier}</TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/crm/customers/${customer.id}`}>View</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <PaginationControls
        totalDocs={customersData.totalDocs}
        page={customersData.page ?? 1}
        limit={customersData.limit}
        totalPages={customersData.totalPages}
        hasNextPage={customersData.hasNextPage}
        hasPrevPage={customersData.hasPrevPage}
      />
    </div>
  );
};

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

const CustomersPage = ({ searchParams }: PageProps) => {
    return (
        <Suspense fallback={<div>Loading customers...</div>}>
            <CustomersContent searchParams={searchParams} />
        </Suspense>
    );
};

export default CustomersPage;
