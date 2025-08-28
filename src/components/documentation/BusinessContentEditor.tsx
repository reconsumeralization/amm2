'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Save, Eye, Send, FileText, Tag, Clock, User, AlertTriangle, CheckCircle, XCircle, Upload, Link, MessageSquare } from '@/lib/icon-mapping'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  BusinessDocumentation, 
  BusinessDocumentationCreateRequest,
  BusinessDocumentationUpdateRequest,
  DocumentationTemplate,
  BusinessDocumentationType,
  BusinessDocumentationCategory,
  DifficultyLevel,
  PriorityLevel
} from '@/types/business-documentation'
import { UserRole } from '@/types/documentation'
import { BusinessDocumentationService } from '@/lib/business-documentation-service'
import { usePermissions } from '@/contexts/DocumentationContext'

interface BusinessContentEditorProps {
  documentId?: string
  template?: DocumentationTemplate
  onSave?: (document: BusinessDocumentation) => void
  onCancel?: () => void
}

export function BusinessContentEditor({ 
  documentId, 
  template, 
  onSave, 
  onCancel 
}: BusinessContentEditorProps) {
  const router = useRouter()
  const { user, hasPermission } = usePermissions()
  
  // Form state
  const [formData, setFormData] = useState<Partial<BusinessDocumentationCreateRequest>>({
    title: '',
    type: 'guide',
    targetRole: 'salon_employee',
    category: 'salon-operations',
    content: '',
    excerpt: '',
    tags: [],
    difficulty: 'beginner',
    priority: 'medium',
    estimatedReadTime: 5,
    relatedDocuments: []
  })

  // UI state
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showPreview, setShowPreview] = useState(false)
  const [availableTemplates, setAvailableTemplates] = useState<DocumentationTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentationTemplate | null>(template || null)
  const [workflowComments, setWorkflowComments] = useState<string>('')
  const [attachments, setAttachments] = useState<File[]>([])

  // Service instance
  const [docService] = useState(() => new BusinessDocumentationService({
    payloadApiUrl: process.env.NEXT_PUBLIC_PAYLOAD_URL || '/api',
    enableWorkflowAutomation: true,
    enableNotifications: true,
    enableAnalytics: true
  }))

  // Load existing document or apply template
  useEffect(() => {
    if (documentId) {
      loadDocument()
    } else if (template) {
      applyTemplate(template)
    }
    loadTemplates()
  }, [documentId, template])

  const loadDocument = async () => {
    if (!documentId) return
    
    setIsLoading(true)
    try {
      const doc = await docService.getDocumentationById(documentId)
      if (doc) {
        setFormData({
          title: doc.title,
          type: doc.type,
          targetRole: doc.targetRole,
          category: doc.category,
          content: doc.content,
          excerpt: doc.excerpt,
          tags: doc.tags,
          difficulty: doc.difficulty,
          priority: doc.priority,
          estimatedReadTime: doc.estimatedReadTime,
          relatedDocuments: doc.relatedDocuments
        })
      }
    } catch (error) {
      console.error('Error loading document:', error)
      setErrors({ general: 'Failed to load document' })
    } finally {
      setIsLoading(false)
    }
  }

  const loadTemplates = async () => {
    try {
      const templates = await docService.getTemplates()
      setAvailableTemplates(templates)
    } catch (error) {
      console.error('Error loading templates:', error)
    }
  }

  const applyTemplate = (template: DocumentationTemplate) => {
    setSelectedTemplate(template)
    setFormData(prev => ({
      ...prev,
      type: template.type,
      category: template.category,
      content: template.template,
      targetRole: template.targetRole[0] || 'salon_employee'
    }))
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.title?.trim()) {
      newErrors.title = 'Title is required'
    }

    if (!formData.content?.trim()) {
      newErrors.content = 'Content is required'
    }

    if (formData.content && formData.content.length < 50) {
      newErrors.content = 'Content must be at least 50 characters'
    }

    if (!formData.excerpt?.trim()) {
      newErrors.excerpt = 'Excerpt is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async (action: 'save' | 'submit' | 'publish' = 'save') => {
    if (!validateForm()) return

    setIsSaving(true)
    try {
      if (documentId) {
        // Update existing document
        const updateRequest: BusinessDocumentationUpdateRequest = {
          id: documentId,
          ...formData,
          workflowAction: action === 'submit' ? 'submit-for-review' : action === 'publish' ? 'publish' : undefined,
          comment: workflowComments || undefined
        }
        
        const updatedDoc = await docService.updateDocumentation(updateRequest, user?.id || '')
        onSave?.(updatedDoc)
        
        if (action === 'save') {
          setErrors({ success: 'Document saved successfully' })
        } else if (action === 'submit') {
          setErrors({ success: 'Document submitted for review' })
        } else if (action === 'publish') {
          setErrors({ success: 'Document published successfully' })
        }
      } else {
        // Create new document
        const createRequest: BusinessDocumentationCreateRequest = {
          ...formData as BusinessDocumentationCreateRequest
        }
        
        const newDoc = await docService.createDocumentation(createRequest, user?.id || '')
        onSave?.(newDoc)
        
        setErrors({ success: 'Document created successfully' })
        
        // Redirect to edit mode
        router.push(`/documentation/business/edit/${newDoc.id}`)
      }
    } catch (error) {
      console.error('Error saving document:', error)
      setErrors({ general: 'Failed to save document' })
    } finally {
      setIsSaving(false)
      setWorkflowComments('')
    }
  }

  const handleTagAdd = (tag: string) => {
    if (tag.trim() && !formData.tags?.includes(tag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), tag.trim()]
      }))
    }
  }

  const handleTagRemove = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }))
  }

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      setAttachments(prev => [...prev, ...Array.from(files)])
    }
  }

  const canEdit = hasPermission('documentation.edit') || hasPermission('content.business.edit')
  const canPublish = hasPermission('documentation.admin') || user?.role === 'salon_owner'

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">
            {documentId ? 'Edit Documentation' : 'Create Documentation'}
          </h1>
          <p className="text-slate-400 mt-1">
            {documentId ? 'Update existing documentation' : 'Create new business documentation'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {showPreview ? 'Edit' : 'Preview'}
          </Button>
          
          {onCancel && (
            <Button variant="ghost" onClick={onCancel}>
              Cancel
            </Button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {errors.success && (
        <Alert className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            {errors.success}
          </AlertDescription>
        </Alert>
      )}

      {errors.general && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {errors.general}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="content" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="workflow">Workflow</TabsTrigger>
          <TabsTrigger value="attachments">Attachments</TabsTrigger>
        </TabsList>

        {/* Content Tab */}
        <TabsContent value="content" className="space-y-6">
          {/* Template Selection */}
          {!documentId && availableTemplates.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Choose Template
                </CardTitle>
                <CardDescription>
                  Start with a template to speed up content creation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Select
                  value={selectedTemplate?.id || ''}
                  onValueChange={(value) => {
                    const template = availableTemplates.find(t => t.id === value)
                    if (template) applyTemplate(template)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a template..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTemplates.map(template => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} - {template.type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="Enter document title..."
                  className={errors.title ? 'border-red-500' : ''}
                  disabled={!canEdit}
                />
                {errors.title && (
                  <p className="text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt *</Label>
                <Textarea
                  id="excerpt"
                  value={formData.excerpt || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))}
                  placeholder="Brief summary of the content..."
                  rows={3}
                  className={errors.excerpt ? 'border-red-500' : ''}
                  disabled={!canEdit}
                />
                {errors.excerpt && (
                  <p className="text-sm text-red-500">{errors.excerpt}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  value={formData.content || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Enter the main content..."
                  rows={15}
                  className={errors.content ? 'border-red-500' : ''}
                  disabled={!canEdit}
                />
                {errors.content && (
                  <p className="text-sm text-red-500">{errors.content}</p>
                )}
                <p className="text-sm text-slate-500">
                  {formData.content?.length || 0} characters
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Document Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Document Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: BusinessDocumentationType) => 
                      setFormData(prev => ({ ...prev, type: value }))
                    }
                    disabled={!canEdit}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guide">Guide</SelectItem>
                      <SelectItem value="procedure">Procedure</SelectItem>
                      <SelectItem value="policy">Policy</SelectItem>
                      <SelectItem value="training">Training Material</SelectItem>
                      <SelectItem value="faq">FAQ</SelectItem>
                      <SelectItem value="troubleshooting">Troubleshooting</SelectItem>
                      <SelectItem value="announcement">Announcement</SelectItem>
                      <SelectItem value="tutorial">Tutorial</SelectItem>
                      <SelectItem value="checklist">Checklist</SelectItem>
                      <SelectItem value="template">Template</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value: BusinessDocumentationCategory) => 
                      setFormData(prev => ({ ...prev, category: value }))
                    }
                    disabled={!canEdit}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="salon-operations">Salon Operations</SelectItem>
                      <SelectItem value="customer-service">Customer Service</SelectItem>
                      <SelectItem value="booking-management">Booking Management</SelectItem>
                      <SelectItem value="staff-training">Staff Training</SelectItem>
                      <SelectItem value="safety-procedures">Safety Procedures</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="financial-management">Financial Management</SelectItem>
                      <SelectItem value="inventory-management">Inventory Management</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="technology-setup">Technology Setup</SelectItem>
                      <SelectItem value="emergency-procedures">Emergency Procedures</SelectItem>
                      <SelectItem value="quality-assurance">Quality Assurance</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Target Role</Label>
                  <Select
                    value={formData.targetRole}
                    onValueChange={(value: UserRole) => 
                      setFormData(prev => ({ ...prev, targetRole: value }))
                    }
                    disabled={!canEdit}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="guest">Guest</SelectItem>
                      <SelectItem value="salon_customer">Salon Customer</SelectItem>
                      <SelectItem value="salon_employee">Salon Employee</SelectItem>
                      <SelectItem value="salon_owner">Salon Owner</SelectItem>
                      <SelectItem value="developer">Developer</SelectItem>
                      <SelectItem value="system_admin">System Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Difficulty</Label>
                  <Select
                    value={formData.difficulty}
                    onValueChange={(value: DifficultyLevel) => 
                      setFormData(prev => ({ ...prev, difficulty: value }))
                    }
                    disabled={!canEdit}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: PriorityLevel) => 
                      setFormData(prev => ({ ...prev, priority: value }))
                    }
                    disabled={!canEdit}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Estimated Read Time (minutes)</Label>
                <Input
                  type="number"
                  value={formData.estimatedReadTime || 5}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    estimatedReadTime: parseInt(e.target.value) || 5 
                  }))}
                  min={1}
                  max={120}
                  disabled={!canEdit}
                />
              </div>

              {/* Tags */}
              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags?.map(tag => (
                    <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                      <Tag className="h-3 w-3" />
                      {tag}
                      {canEdit && (
                        <button
                          onClick={() => handleTagRemove(tag)}
                          className="ml-1 hover:text-red-500"
                        >
                          ×
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
                {canEdit && (
                  <Input
                    placeholder="Add tag and press Enter..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleTagAdd(e.currentTarget.value)
                        e.currentTarget.value = ''
                      }
                    }}
                  />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Workflow Tab */}
        <TabsContent value="workflow" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Workflow & Comments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Workflow Comment</Label>
                <Textarea
                  value={workflowComments}
                  onChange={(e) => setWorkflowComments(e.target.value)}
                  placeholder="Add a comment about this change..."
                  rows={3}
                  disabled={!canEdit}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Attachments Tab */}
        <TabsContent value="attachments" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                File Attachments
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {canEdit && (
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    multiple
                    onChange={(e) => handleFileUpload(e.target.files)}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      Click to upload files or drag and drop
                    </p>
                  </label>
                </div>
              )}

              {attachments.length > 0 && (
                <div className="space-y-2">
                  <Label>Uploaded Files</Label>
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="text-sm">{file.name}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setAttachments(prev => prev.filter((_, i) => i !== index))}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      {canEdit && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-700">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <span className="text-sm text-slate-400">
              Auto-saved • Last saved 2 minutes ago
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => handleSave('save')}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? 'Saving...' : 'Save Draft'}
            </Button>

            <Button
              onClick={() => handleSave('submit')}
              disabled={isSaving}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              Submit for Review
            </Button>

            {canPublish && (
              <Button
                onClick={() => handleSave('publish')}
                disabled={isSaving}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="h-4 w-4" />
                Publish
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}