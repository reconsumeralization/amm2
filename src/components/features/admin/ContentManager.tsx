'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from 'sonner';

interface ContentItem {
  id: string;
  title: string;
  type: 'page' | 'post' | 'service' | 'testimonial' | 'faq' | 'announcement';
  status: 'draft' | 'published' | 'archived';
  content: string;
  excerpt?: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  tags: string[];
  featuredImage?: string;
  slug: string;
  metadata: {
    seoTitle?: string;
    seoDescription?: string;
    keywords?: string[];
  };
}

interface ContentFilters {
  type: string;
  status: string;
  author: string;
  dateRange: string;
  tags: string[];
}

export default function ContentManager() {
  const [contentItems, setContentItems] = useState<ContentItem[]>([]);
  const [filteredItems, setFilteredItems] = useState<ContentItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<ContentFilters>({
    type: 'all',
    status: 'all',
    author: 'all',
    dateRange: 'all',
    tags: []
  });
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'title' | 'type' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);

  // Mock data for demonstration
  const mockContent: ContentItem[] = [
    {
      id: '1',
      title: 'Welcome to Modern Men',
      type: 'page',
      status: 'published',
      content: '<p>Welcome to our premier barber shop experience...</p>',
      excerpt: 'Discover premium grooming services at Modern Men',
      author: 'Admin',
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-20T14:30:00Z',
      tags: ['homepage', 'welcome'],
      slug: 'welcome',
      metadata: {
        seoTitle: 'Welcome to Modern Men | Premium Barber Shop',
        seoDescription: 'Experience premium grooming services at Modern Men',
        keywords: ['barber', 'grooming', 'barber']
      }
    },
    {
      id: '2',
      title: 'Haircut Services',
      type: 'service',
      status: 'published',
      content: '<p>Professional haircut services with expert stylists...</p>',
      excerpt: 'Professional haircut services',
      author: 'Manager',
      createdAt: '2024-01-10T09:00:00Z',
      updatedAt: '2024-01-18T11:15:00Z',
      tags: ['services', 'haircut'],
      slug: 'haircut-services',
      metadata: {
        seoTitle: 'Haircut Services | Modern Men',
        seoDescription: 'Professional haircut services by expert stylists',
        keywords: ['haircut', 'styling', 'professional']
      }
    },
    {
      id: '3',
      title: 'Customer Testimonial',
      type: 'testimonial',
      status: 'published',
      content: '<p>"Amazing service! Highly recommended."</p>',
      author: 'John Doe',
      createdAt: '2024-01-12T16:00:00Z',
      updatedAt: '2024-01-12T16:00:00Z',
      tags: ['testimonial', 'customer'],
      slug: 'testimonial-john-doe',
      metadata: {}
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      setContentItems(mockContent);
      setFilteredItems(mockContent);
      setIsLoading(false);
    }, 1000);
  }, []);

  useEffect(() => {
    let filtered = contentItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.content.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filters.type === 'all' || item.type === filters.type;
      const matchesStatus = filters.status === 'all' || item.status === filters.status;
      const matchesAuthor = filters.author === 'all' || item.author === filters.author;

      return matchesSearch && matchesType && matchesStatus && matchesAuthor;
    });

    // Sort items
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.updatedAt);
          bValue = new Date(b.updatedAt);
          break;
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'type':
          aValue = a.type;
          bValue = b.type;
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        default:
          aValue = a.updatedAt;
          bValue = b.updatedAt;
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredItems(filtered);
  }, [contentItems, searchQuery, filters, sortBy, sortOrder]);

  const handleCreate = () => {
    const newItem: ContentItem = {
      id: Date.now().toString(),
      title: 'New Content',
      type: 'page',
      status: 'draft',
      content: '',
      author: 'Current User',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      tags: [],
      slug: 'new-content',
      metadata: {}
    };
    setSelectedItem(newItem);
    setIsCreating(true);
    setIsEditing(true);
  };

  const handleEdit = (item: ContentItem) => {
    setSelectedItem(item);
    setIsEditing(true);
    setIsCreating(false);
  };

  const handleSave = async (item: ContentItem) => {
    try {
      if (isCreating) {
        setContentItems(prev => [...prev, item]);
        toast.success('Content created successfully');
      } else {
        setContentItems(prev => prev.map(existing =>
          existing.id === item.id ? item : existing
        ));
        toast.success('Content updated successfully');
      }
      setIsEditing(false);
      setSelectedItem(null);
    } catch (error) {
      toast.error('Failed to save content');
    }
  };

  const handleDelete = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this content?')) {
      setContentItems(prev => prev.filter(item => item.id !== itemId));
      toast.success('Content deleted successfully');
    }
  };

  const handleDuplicate = (item: ContentItem) => {
    const duplicatedItem: ContentItem = {
      ...item,
      id: Date.now().toString(),
      title: `${item.title} (Copy)`,
      slug: `${item.slug}-copy`,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    setContentItems(prev => [...prev, duplicatedItem]);
    toast.success('Content duplicated successfully');
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      published: 'default',
      draft: 'secondary',
      archived: 'outline'
    } as const;
    return <Badge variant={variants[status as keyof typeof variants]}>{status}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'page': return <span className="text-sm">📄</span>;
      case 'post': return <span className="text-sm">📝</span>;
      case 'service': return <span className="text-sm">🏷️</span>;
      case 'testimonial': return <span className="text-sm">👥</span>;
      case 'faq': return <span className="text-sm">❓</span>;
      case 'announcement': return <span className="text-sm">📅</span>;
      default: return <span className="text-sm">📄</span>;
    }
  };

  const ContentCard = ({ item }: { item: ContentItem }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-2">
            {getTypeIcon(item.type)}
            <CardTitle className="text-lg">{item.title}</CardTitle>
          </div>
          {getStatusBadge(item.status)}
        </div>
        {item.excerpt && (
          <p className="text-sm text-gray-600 mt-2">{item.excerpt}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <span>By {item.author}</span>
          <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
        </div>
        <div className="flex flex-wrap gap-1 mb-3">
          {item.tags.map(tag => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <Button size="sm" variant="outline" onClick={() => handleEdit(item)}>
              ✏️ Edit
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleDuplicate(item)}>
              📄 Duplicate
            </Button>
          </div>
          <Button size="sm" variant="outline" onClick={() => handleDelete(item.id)}>
            🗑️
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Content Manager</h1>
          <p className="text-gray-600 mt-1">
            Manage all your website content in one place
          </p>
        </div>
        <Button onClick={handleCreate}>
          ➕ Create Content
        </Button>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                <Input
                  placeholder="Search content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filters.type} onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="page">Pages</SelectItem>
                  <SelectItem value="post">Posts</SelectItem>
                  <SelectItem value="service">Services</SelectItem>
                  <SelectItem value="testimonial">Testimonials</SelectItem>
                </SelectContent>
              </Select>

              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              >
                {viewMode === 'grid' ? '📋' : '⊞'}
              </Button>

              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Date</SelectItem>
                  <SelectItem value="title">Title</SelectItem>
                  <SelectItem value="type">Type</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Grid/List */}
      <div className={`grid gap-6 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
        {filteredItems.map((item) => (
          <ContentCard key={item.id} item={item} />
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-12">
          <span className="text-6xl mb-4 block">📄</span>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No content found</h3>
          <p className="text-gray-600 mb-4">
            {searchQuery || Object.values(filters).some(v => v !== 'all' && v.length > 0)
              ? 'Try adjusting your search or filters'
              : 'Get started by creating your first piece of content'}
          </p>
          <Button onClick={handleCreate}>
            ➕ Create Content
          </Button>
        </div>
      )}

      {/* Content Editor Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreating ? 'Create New Content' : 'Edit Content'}
            </DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <ContentEditor
              item={selectedItem}
              onSave={handleSave}
              onCancel={() => {
                setIsEditing(false);
                setSelectedItem(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Content Editor Component
function ContentEditor({
  item,
  onSave,
  onCancel
}: {
  item: ContentItem;
  onSave: (item: ContentItem) => void;
  onCancel: () => void;
}) {
  const [editedItem, setEditedItem] = useState<ContentItem>(item);

  const handleSave = () => {
    onSave({
      ...editedItem,
      updatedAt: new Date().toISOString()
    });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Title</label>
          <Input
            value={editedItem.title}
            onChange={(e) => setEditedItem(prev => ({ ...prev, title: e.target.value }))}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Type</label>
          <Select
            value={editedItem.type}
            onValueChange={(value: any) => setEditedItem(prev => ({ ...prev, type: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="page">Page</SelectItem>
              <SelectItem value="post">Post</SelectItem>
              <SelectItem value="service">Service</SelectItem>
              <SelectItem value="testimonial">Testimonial</SelectItem>
              <SelectItem value="faq">FAQ</SelectItem>
              <SelectItem value="announcement">Announcement</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Content</label>
        <Textarea
          value={editedItem.content}
          onChange={(e) => setEditedItem(prev => ({ ...prev, content: e.target.value }))}
          rows={10}
          placeholder="Enter your content here..."
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Status</label>
          <Select
            value={editedItem.status}
            onValueChange={(value: any) => setEditedItem(prev => ({ ...prev, status: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Slug</label>
          <Input
            value={editedItem.slug}
            onChange={(e) => setEditedItem(prev => ({ ...prev, slug: e.target.value }))}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Excerpt</label>
        <Textarea
          value={editedItem.excerpt || ''}
          onChange={(e) => setEditedItem(prev => ({ ...prev, excerpt: e.target.value }))}
          rows={3}
          placeholder="Brief description..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Tags</label>
        <Input
          value={editedItem.tags.join(', ')}
          onChange={(e) => setEditedItem(prev => ({
            ...prev,
            tags: e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0)
          }))}
          placeholder="Enter tags separated by commas"
        />
      </div>

      <Tabs defaultValue="seo" className="w-full">
        <TabsList>
          <TabsTrigger value="seo">SEO</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
        </TabsList>

        <TabsContent value="seo" className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">SEO Title</label>
            <Input
              value={editedItem.metadata.seoTitle || ''}
              onChange={(e) => setEditedItem(prev => ({
                ...prev,
                metadata: { ...prev.metadata, seoTitle: e.target.value }
              }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">SEO Description</label>
            <Textarea
              value={editedItem.metadata.seoDescription || ''}
              onChange={(e) => setEditedItem(prev => ({
                ...prev,
                metadata: { ...prev.metadata, seoDescription: e.target.value }
              }))}
              rows={3}
            />
          </div>
        </TabsContent>

        <TabsContent value="social" className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Featured Image URL</label>
            <Input
              value={editedItem.featuredImage || ''}
              onChange={(e) => setEditedItem(prev => ({ ...prev, featuredImage: e.target.value }))}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button onClick={handleSave}>
          💾 Save Content
        </Button>
      </div>
    </div>
  );
}
