import { AdminNavigation } from '@/components/features/admin/AdminNavigation'
import { redirect } from 'next/navigation'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Editor from '@/components/features/editor/Editor'

export default async function AdminEditorPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user || session.user.role !== 'admin') {
    redirect('/auth/signin?callbackUrl=/admin/editor')
  }

  const handleSave = (content: string) => {
    console.log('Editor content saved:', content)
    // Here you would typically save to Payload CMS
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold text-gray-900">Content Editor</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Editor Features</h2>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <h3 className="font-medium text-blue-900">Rich Text Editing</h3>
                  <p className="text-sm text-blue-700">Bold, italic, headings, lists, links</p>
                </div>
                <div className="p-3 bg-green-50 rounded-lg">
                  <h3 className="font-medium text-green-900">Image Upload</h3>
                  <p className="text-sm text-green-700">Responsive images with optimization</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <h3 className="font-medium text-purple-900">AI Content</h3>
                  <p className="text-sm text-purple-700">Rewrite and summarize text</p>
                </div>
                <div className="p-3 bg-orange-50 rounded-lg">
                  <h3 className="font-medium text-orange-900">Service Templates</h3>
                  <p className="text-sm text-orange-700">Insert service descriptions</p>
                </div>
                <div className="p-3 bg-indigo-50 rounded-lg">
                  <h3 className="font-medium text-indigo-900">Product Embeds</h3>
                  <p className="text-sm text-indigo-700">Embed product information</p>
                </div>
                <div className="p-3 bg-pink-50 rounded-lg">
                  <h3 className="font-medium text-pink-900">Hair Simulator</h3>
                  <p className="text-sm text-pink-700">Insert style previews</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Editor */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Content Editor</h2>
              <p className="text-gray-600 mb-6">
                Use the toolbar above to format your content. You can upload images, insert service templates, 
                embed products, and use AI to enhance your content.
              </p>
              
              <Editor 
                initialContent="Welcome to Modern Men Hair BarberShop! We offer premium grooming services tailored to your style."
                onSaveAction={handleSave}
                tenantId="demo-tenant"
              />
              
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Editor Tips:</h3>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Use the toolbar buttons to format your text</li>
                  <li>• Upload images for responsive display</li>
                  <li>• Select text and use AI features to enhance content</li>
                  <li>• Insert service templates and product information</li>
                  <li>• Use the hair simulator to show style previews</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

