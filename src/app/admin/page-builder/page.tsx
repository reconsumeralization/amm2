'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { AdminNavigation } from '@/components/features/admin/AdminNavigation';
import PageEditor from '@/components/features/admin/PageEditor';

export default function PageBuilderAdmin() {
  const { data: session } = useSession();
  const [selectedPage, setSelectedPage] = useState<string | null>(null);
  const [pageTitle, setPageTitle] = useState('');
  const [tenantId, setTenantId] = useState('tenant-id-placeholder');

  // Common page templates
  const pageTemplates = [
    { slug: 'home', title: 'Homepage', description: 'Main landing page' },
    { slug: 'services', title: 'Services', description: 'Services and pricing' },
    { slug: 'about', title: 'About Us', description: 'About the barbershop' },
    { slug: 'contact', title: 'Contact', description: 'Contact information' },
    { slug: 'gallery', title: 'Gallery', description: 'Photo gallery' },
    { slug: 'booking', title: 'Booking', description: 'Appointment booking page' },
  ];

  if (!session?.user || session.user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You need admin privileges to access this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNavigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Page Builder</h1>
          <p className="text-gray-600">
            Create and edit pages using the visual page builder. Drag and drop components to build beautiful pages.
          </p>
        </div>

        {!selectedPage ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Create New Page */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Create New Page</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Page Title
                  </label>
                  <input
                    type="text"
                    value={pageTitle}
                    onChange={(e) => setPageTitle(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter page title"
                  />
                </div>
                <button
                  onClick={() => {
                    if (pageTitle.trim()) {
                      setSelectedPage(pageTitle.toLowerCase().replace(/\s+/g, '-'));
                    }
                  }}
                  disabled={!pageTitle.trim()}
                  className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create New Page
                </button>
              </div>
            </div>

            {/* Page Templates */}
            {pageTemplates.map((template) => (
              <div
                key={template.slug}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedPage(template.slug)}
              >
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {template.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {template.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">Slug: {template.slug}</span>
                  <button className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 text-sm">
                    Edit
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">
                  Editing: {selectedPage}
                </h2>
                <button
                  onClick={() => setSelectedPage(null)}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                >
                  Back to Pages
                </button>
              </div>
            </div>
            
            <div className="p-6">
              <PageEditor
                slug={selectedPage}
                tenantId={tenantId}
                title={pageTitle || selectedPage}
              />
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">How to Use the Page Builder</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Adding Components</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Click the "+" buttons to add different types of content</li>
                <li>• Images can be edited with cropping and effects</li>
                <li>• Text components can be customized with your content</li>
                <li>• Buttons can link to other pages or external URLs</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Managing Layout</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Drag components up and down to reorder them</li>
                <li>• Click "Edit" on any component to modify its content</li>
                <li>• Use "Delete" to remove unwanted components</li>
                <li>• All changes are automatically saved</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

