// src/app/crm/layout.tsx
import React from 'react';
import Link from 'next/link';
import { Bell, Home, Users, Calendar, BarChart } from '@/lib/icon-mapping';

const CrmLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-200">CRM</h2>
        </div>
        <nav className="mt-4">
          <ul>
            <li>
              <Link href="/crm/dashboard" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
                <Home className="w-5 h-5 mr-2" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/crm/customers" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
                <Users className="w-5 h-5 mr-2" />
                Customers
              </Link>
            </li>
            <li>
              <Link href="/crm/calendar" className="flex items-center px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700">
                <Calendar className="w-5 h-5 mr-2" />
                Calendar
              </Link>
            </li>
            {/* Add more links as needed */}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default CrmLayout;
