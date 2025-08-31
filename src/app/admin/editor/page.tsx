'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Icons } from '@/components/ui/icons'
import { AdminNavigation } from '@/components/admin/AdminNavigation'
import Editor from '@/components/editor/Editor'
import { motion } from 'framer-motion'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ContentTemplate {
  id: string
  name: string
  category: string
  content: string
  description: string
}

export default function AdminEditorPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTemplate, setActiveTemplate] = useState<string>('')
  const [savedContent, setSavedContent] = useState<string>('')
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [isAutoSaving, setIsAutoSaving] = useState(false)

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/portal/login')
      return
    }

    if ((session as any).user?.role !== 'admin' && (session as any).user?.role !== 'manager') {
      router.push('/portal')
      return
    }
  }, [session, status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Icons.spinner className="h-6 w-6 animate-spin text-amber-600" />
          <span className="text-gray-600">Loading editor...</span>
        </div>
      </div>
    )
  }

  if (!session || ((session as any).user?.role !== 'admin' && (session as any).user?.role !== 'manager')) {
    return null // Will redirect in useEffect
  }

  const contentTemplates: ContentTemplate[] = [
    {
      id: 'welcome',
      name: 'Welcome Message',
      category: 'General',
      content: 'Welcome to Modern Men barber shop! We offer premium grooming services tailored to your style.',
      description: 'Standard welcome message for new customers'
    },
    {
      id: 'services-intro',
      name: 'Services Introduction',
      category: 'Services',
      content: 'Our expert barbers provide a full range of services including precision cuts, beard styling, and premium grooming treatments.',
      description: 'Introduction to service offerings'
    },
    {
      id: 'booking-cta',
      name: 'Booking Call-to-Action',
      category: 'Marketing',
      content: 'Ready for your next cut? Book your appointment today and experience the Modern Men difference.',
      description: 'Encourage customers to book appointments'
    },
    {
      id: 'product-highlight',
      name: 'Product Highlight',
      category: 'Products',
      content: 'Discover our curated selection of premium grooming products, carefully chosen to maintain your style between visits.',
      description: 'Showcase retail products'
    }
  ]

  const handleSave = async (content: string) => {
    setIsAutoSaving(true)
    try {
      // Simulate API call to save content
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSavedContent(content)
      setLastSaved(new Date())
      console.log('Editor content saved:', content)
    } catch (error) {
      console.error('Failed to save content:', error)
    } finally {
      setIsAutoSaving(false)
    }
  }

  const loadTemplate = (templateId: string) => {
    const template = contentTemplates.find(t => t.id === templateId)
    if (template) {
      setActiveTemplate(templateId)
      // This would trigger the editor to load the template content
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-blue-50">
      <AdminNavigation />
      
      {/* Enhanced Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white shadow-sm border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Icons.edit className="h-6 w-6 text-amber-600" />
              <h1 className="text-xl font-bold text-gray-900">Content Editor</h1>
              <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                Advanced
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              {lastSaved && (
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <svg className="h-4 w-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span>Saved {lastSaved.toLocaleTimeString()}</span>
                </div>
              )}
              {isAutoSaving && (
                <div className="flex items-center space-x-2 text-sm text-amber-600">
                  <Icons.spinner className="h-4 w-4 animate-spin" />
                  <span>Saving...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Enhanced Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1 space-y-6"
          >
            {/* Content Templates */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span>Templates</span>
                </CardTitle>
                <CardDescription>
                  Quick-start content templates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select value={activeTemplate} onValueChange={loadTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTemplates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {activeTemplate && (
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <p className="text-sm text-amber-800">
                      {contentTemplates.find(t => t.id === activeTemplate)?.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Editor Features */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <span>Features</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-3 bg-blue-50 rounded-lg cursor-pointer"
                >
                  <h3 className="font-medium text-blue-900 flex items-center space-x-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span>Rich Text</span>
                  </h3>
                  <p className="text-sm text-blue-700">Bold, italic, headings, lists, links</p>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-3 bg-green-50 rounded-lg cursor-pointer"
                >
                  <h3 className="font-medium text-green-900 flex items-center space-x-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Media Upload</span>
                  </h3>
                  <p className="text-sm text-green-700">Images, videos with optimization</p>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-3 bg-purple-50 rounded-lg cursor-pointer"
                >
                  <h3 className="font-medium text-purple-900 flex items-center space-x-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                    </svg>
                    <span>AI Assistant</span>
                  </h3>
                  <p className="text-sm text-purple-700">Rewrite, summarize, enhance</p>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-3 bg-orange-50 rounded-lg cursor-pointer"
                >
                  <h3 className="font-medium text-orange-900 flex items-center space-x-2">
                    <Icons.scissors className="h-4 w-4" />
                    <span>Service Blocks</span>
                  </h3>
                  <p className="text-sm text-orange-700">Insert service descriptions</p>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-3 bg-indigo-50 rounded-lg cursor-pointer"
                >
                  <h3 className="font-medium text-indigo-900 flex items-center space-x-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <span>Product Embeds</span>
                  </h3>
                  <p className="text-sm text-indigo-700">Showcase products inline</p>
                </motion.div>
                
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  className="p-3 bg-pink-50 rounded-lg cursor-pointer"
                >
                  <h3 className="font-medium text-pink-900 flex items-center space-x-2">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    <span>Style Preview</span>
                  </h3>
                  <p className="text-sm text-pink-700">Hair simulator integration</p>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Enhanced Main Editor */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <Tabs defaultValue="editor" className="space-y-6">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="editor" className="flex items-center space-x-2">
                  <Icons.edit className="h-4 w-4" />
                  <span>Editor</span>
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center space-x-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  <span>Preview</span>
                </TabsTrigger>
                <TabsTrigger value="settings" className="flex items-center space-x-2">
                  <Icons.settings className="h-4 w-4" />
                  <span>Settings</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="editor">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>Content Editor</span>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm">
                          <Icons.save className="h-4 w-4 mr-2" />
                          Save Draft
                        </Button>
                        <Button size="sm" className="bg-amber-600 hover:bg-amber-700">
                          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                          </svg>
                          Publish
                        </Button>
                      </div>
                    </CardTitle>
                    <CardDescription>
                      Create and edit content with our advanced editor. Auto-saves every 30 seconds.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Editor 
                      initialContent="Welcome to Modern Men barber shop! We offer premium grooming services tailored to your style."
                      onSaveAction={handleSave}
                      tenantId="demo-tenant"
                    />
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preview">
                <Card>
                  <CardHeader>
                    <CardTitle>Content Preview</CardTitle>
                    <CardDescription>
                      See how your content will appear to customers
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="prose max-w-none">
                      <div className="p-6 bg-gray-50 rounded-lg">
                        <p className="text-gray-600">Preview will show here...</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Editor Settings</CardTitle>
                    <CardDescription>
                      Configure editor preferences and publishing options
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Auto-save Interval</label>
                        <Select defaultValue="30">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="15">15 seconds</SelectItem>
                            <SelectItem value="30">30 seconds</SelectItem>
                            <SelectItem value="60">1 minute</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Content Type</label>
                        <Select defaultValue="page">
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="page">Page Content</SelectItem>
                            <SelectItem value="blog">Blog Post</SelectItem>
                            <SelectItem value="service">Service Description</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Enhanced Tips Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <svg className="h-5 w-5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span>Pro Tips</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Formatting</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Use headings to structure content</li>
                      <li>• Bold important information</li>
                      <li>• Add links to external resources</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Media</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Upload high-quality images</li>
                      <li>• Use alt text for accessibility</li>
                      <li>• Optimize file sizes for web</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">AI Features</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Select text to enhance with AI</li>
                      <li>• Use rewrite for better clarity</li>
                      <li>• Summarize long content</li>
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Templates</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Start with pre-built templates</li>
                      <li>• Customize for your brand</li>
                      <li>• Save custom templates</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
