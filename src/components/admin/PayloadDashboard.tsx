'use client'

import React, { useState, useEffect } from 'react'
import { 
  Database, 
  Search, 
  Users, 
  Calendar, 
  FileText, 
  BarChart3, 
  Settings,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from '@/lib/icons'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePayloadIntegration } from '@/hooks/usePayloadIntegration'
import { usePermissions } from '@/contexts/DocumentationContext'
import { AdminOnly } from '@/components/documentation/AccessControl'



export function PayloadDashboard() {
  const { user, isAdmin, isOwner } = usePermissions()
  const {
    isLoading,
    error,
    globalSearch,
    getSalonAnalytics,
    syncAppointments,
    getBusinessDocumentation,
    clearError
  } = usePayloadIntegration()

  // State
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any>(null)
  const [analytics, setAnalytics] = useState<any>(null)
  const [documentation, setDocumentation] = useState<any>(null)
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle')

  // Load initial data
  useEffect(() => {
    if (user && (isAdmin || isOwner)) {
      loadAnalytics()
      loadDocumentation()
    }
  }, [user, isAdmin, isOwner])

  const loadAnalytics = async () => {
    try {
      const result = await getSalonAnalytics()
      setAnalytics(result)
    } catch (error) {
      console.error('Error loading analytics:', error)
    }
  }

  const loadDocumentation = async () => {
    try {
      const result = await getBusinessDocumentation({ limit: 10 })
      setDocumentation(result)
    } catch (error) {
      console.error('Error loading documentation:', error)
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) return

    try {
      const results = await globalSearch(searchQuery)
      setSearchResults(results)
    } catch (error) {
      console.error('Error performing search:', error)
    }
  }

  const handleSyncAppointments = async () => {
    setSyncStatus('syncing')
    try {
      const success = await syncAppointments()
      setSyncStatus(success ? 'success' : 'error')
      
      // Reset status after 3 seconds
      setTimeout(() => setSyncStatus('idle'), 3000)
    } catch (error) {
      setSyncStatus('error')
      setTimeout(() => setSyncStatus('idle'), 3000)
    }
  }

  if (!user || (!isAdmin && !isOwner)) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            You need administrator or owner permissions to access the Payload dashboard.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-100 flex items-center gap-2">
            <Database className="h-8 w-8 text-cyan-500" />
            Payload CMS Dashboard
          </h1>
          <p className="text-slate-400 mt-1">
            Manage your salon data and content through Payload CMS integration
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSyncAppointments}
            disabled={syncStatus === 'syncing'}
            className="flex items-center gap-2"
          >
          <RefreshCw className={`h-4 w-4 ${syncStatus === 'syncing' ? 'animate-spin' : ''}`} />
            {syncStatus === 'syncing' ? 'Syncing...' : 'Sync Appointments'}
          </Button>
          
          {syncStatus === 'success' && (
            <Badge variant="default" className="bg-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Synced
            </Badge>
          )}
          
          {syncStatus === 'error' && (
            <Badge variant="destructive">
              <AlertCircle className="h-3 w-3 mr-1" />
              Error
            </Badge>
          )}
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800 dark:text-red-200">
            {error}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={clearError}
              className="ml-2 h-auto p-0 text-red-600 hover:text-red-800"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="search">Search</TabsTrigger>
          <TabsTrigger value="documentation">Documentation</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Analytics Cards */}
          {analytics && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.appointments}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    +12% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.customers}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    +8% from last month
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Services</CardTitle>
                  <Settings className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.services}</div>
                  <p className="text-xs text-muted-foreground">
                    +2 new services added
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${analytics.revenue.toLocaleString()}</div>
                  <p className="text-xs text-muted-foreground">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    +15% from last month
                  </p>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Top Services and Stylists */}
          {analytics && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Services</CardTitle>
                  <CardDescription>Most popular services this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.topServices?.slice(0, 5).map((service: any, index: number) => (
                      <div key={service.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-cyan-500">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">{service.name}</p>
                            <p className="text-sm text-muted-foreground">
                              ${service.price}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {service.bookingCount || 0} bookings
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Top Stylists</CardTitle>
                  <CardDescription>Most booked stylists this month</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.topStylists?.slice(0, 5).map((stylist: any, index: number) => (
                      <div key={stylist.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                            <span className="text-sm font-medium text-green-500">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium">
                              {stylist.firstName} {stylist.lastName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {stylist.specialties?.join(', ') || 'General'}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary">
                          {stylist.totalBookings || 0} bookings
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* Search Tab */}
        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5" />
                Global Search
              </CardTitle>
              <CardDescription>
                Search across all Payload collections including services, customers, stylists, and documentation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Search for anything..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="flex-1"
                />
                <Button onClick={handleSearch} disabled={isLoading || !searchQuery.trim()}>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {searchResults && (
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                      Found {searchResults.total} results
                    </p>
                    <div className="flex gap-2">
                      {searchResults.collections && Object.entries(searchResults.collections).map(([collection, count]) => (
                        <Badge key={collection} variant="outline">
                          {collection}: {count as number}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    {searchResults.results.map((result: any) => (
                      <div key={`${result._collection}-${result.id}`} className="p-3 border rounded-lg">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {result.name || result.title || `${result.firstName} ${result.lastName}`}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {result.description || result.excerpt || result.email}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {result.type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Documentation Tab */}
        <TabsContent value="documentation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Recent Documentation
              </CardTitle>
              <CardDescription>
                Latest business documentation managed through Payload CMS
              </CardDescription>
            </CardHeader>
            <CardContent>
              {documentation && (
                <div className="space-y-3">
                  {documentation.docs.map((doc: any) => (
                    <div key={doc.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <p className="font-medium">{doc.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {doc.excerpt}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline">{doc.type}</Badge>
                            <Badge variant="outline">{doc.category}</Badge>
                            <Badge variant="outline">{doc.status}</Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-muted-foreground">
                            <Clock className="h-3 w-3 inline mr-1" />
                            {new Date(doc.lastUpdated).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <AdminOnly>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Payload CMS Settings
                </CardTitle>
                <CardDescription>
                  Configure Payload CMS integration settings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Server URL</label>
                    <Input 
                      value={process.env.NEXT_PUBLIC_PAYLOAD_URL || 'http://localhost:3000'}
                      disabled
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Database</label>
                    <Input 
                      value="PostgreSQL (Connected)"
                      disabled
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Collections</label>
                    <Input 
                      value="13 Active Collections"
                      disabled
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Status</label>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm">Connected</span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    onClick={() => window.open('/admin', '_blank')}
                    className="w-full"
                  >
                    Open Payload Admin Panel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </AdminOnly>
        </TabsContent>
      </Tabs>
    </div>
  )
}
