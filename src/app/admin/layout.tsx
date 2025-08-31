'use client';
import '../globals.css';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { AdminNavigation } from '@/components/features/admin/AdminNavigation';
import { NotificationCenter } from '@/components/features/admin/NotificationCenter';
import { motion } from 'framer-motion';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      router.push('/portal/login');
      return;
    }

    if ((session as any).user?.role !== 'admin' &&
        (session as any).user?.role !== 'manager') {
      router.push('/portal');
      return;
    }
  }, [session, status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-600">Loading admin panel...</span>
        </div>
      </div>
    );
  }

  if (!session || ((session as any).user?.role !== 'admin' &&
                   (session as any).user?.role !== 'manager')) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <AdminNavigation />

      {/* Enhanced Header with Notifications */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-lg"
              >
                <span className="text-white font-bold text-lg">M</span>
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Modern Men Admin</h1>
                <p className="text-xs text-gray-500">Manage your barber shop operations</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {/* System Health Indicator */}
              <div className="hidden md:flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">System Online</span>
              </div>

              {/* Notifications */}
              <NotificationCenter />

              {/* Quick Actions */}
              <div className="hidden md:flex items-center space-x-2">
                <span className="text-sm text-gray-600">Welcome back,</span>
                <span className="font-medium text-gray-900">
                  {(session as any)?.user?.name || 'Admin'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        {children}
      </motion.main>
    </div>
  );
}
