// =====================================================
// SUPABASE REACT HOOKS: ModernMen Collections
// Generated at: 2025-01-09T00:04:44
// Type-safe React hooks for Supabase operations
// =====================================================

import { useState, useEffect, useCallback, useMemo } from 'react'
import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase, collectionManagers, searchAllCollections } from './supabase-queries'

// Import generated types
import {
  Commerce, Coupons, GiftCards, Invoices, Orders, PaymentMethods,
  Products, Promotions, Returns, ShippingMethods, BlogPosts, Content,
  FAQ, Gallery, Media, MediaFolders, Navigation, NavigationMenus,
  PagesMain, Pages, RedirectsMain, Redirects, SEOSettings, Tags,
  AppointmentsMain, Cancellations, Chatbot, ChatConversations, ChatMessages,
  Contacts, CustomerNotes, CustomersMain, Customers, CustomerTags,
  EmailCampaigns, LoyaltyProgram, Reviews, Subscriptions, Testimonials,
  ClockRecords, Commissions, StaffRoles, StaffSchedules, Stylists,
  TimeOffRequests, Appointments, AuditLogs, BusinessDocumentation,
  ChatbotLogs, Documentation, DocumentationTemplates, DocumentationWorkflows,
  EditorPlugins, EditorTemplates, EditorThemes, EmailLogs, Events,
  EventTracking, FeatureFlags, Integrations, Inventory, Locations,
  MaintenanceRequests, Notifications, PageViews, PushNotifications,
  RecurringAppointments, Resources, RolesPermissions, ServicePackages,
  Services, Settings, SiteSections, Tenants, Transactions, Users,
  WaitList, WebhookLogs
} from './generated-types'

// =====================================================
// GENERIC HOOKS
// =====================================================

interface UseCollectionOptions {
  page?: number
  limit?: number
  orderBy?: string
  orderDirection?: 'asc' | 'desc'
  filters?: Record<string, any>
  realtime?: boolean
}

interface UseCollectionResult<T> {
  data: T[]
  loading: boolean
  error: Error | null
  count: number
  refetch: () => Promise<void>
  loadMore: () => Promise<void>
  hasMore: boolean
}

export function useCollection<T extends Record<string, any>>(
  tableName: string,
  options: UseCollectionOptions = {}
): UseCollectionResult<T> {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [count, setCount] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const {
    page = 1,
    limit = 50,
    orderBy = 'created_at',
    orderDirection = 'desc',
    filters = {},
    realtime = false
  } = options

  const fetchData = useCallback(async (reset = false) => {
    try {
      if (reset) setLoading(true)
      setError(null)

      const ManagerClass = (collectionManagers as any)[tableName.replace(/_/g, '').toLowerCase()]
      if (!ManagerClass) {
        throw new Error(`No manager found for table: ${tableName}`)
      }
      const manager = new ManagerClass(supabase)
      if (!manager) {
        throw new Error(`No manager found for table: ${tableName}`)
      }

      const result = await manager.findMany({
        page: reset ? 1 : page,
        limit,
        orderBy,
        orderDirection,
        filters
      })

      if (reset) {
        setData(result.data)
      } else {
        setData(prev => [...prev, ...result.data])
      }
      
      setCount(result.count)
      setHasMore(result.data.length === limit)
    } catch (err) {
      setError(err as Error)
    } finally {
      setLoading(false)
    }
  }, [tableName, page, limit, orderBy, orderDirection, JSON.stringify(filters)])

  const refetch = useCallback(() => fetchData(true), [fetchData])
  const loadMore = useCallback(() => fetchData(false), [fetchData])

  useEffect(() => {
    fetchData(true)
  }, [fetchData])

  // Realtime subscription
  useEffect(() => {
    if (!realtime) return

    const channel = supabase
      .channel(`${tableName}_changes`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: tableName },
        () => refetch()
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tableName, realtime, refetch])

  return {
    data,
    loading,
    error,
    count,
    refetch,
    loadMore,
    hasMore
  }
}

// =====================================================
// CRUD HOOKS
// =====================================================

interface UseCRUDResult<T> {
  create: (data: Omit<T, 'id' | 'created_at' | 'updated_at'>) => Promise<T | null>
  update: (id: string, data: Partial<T>) => Promise<T | null>
  delete: (id: string) => Promise<boolean>
  loading: boolean
  error: Error | null
}

export function useCRUD<T extends Record<string, any>>(tableName: string): UseCRUDResult<T> {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const execute = useCallback(async <R>(operation: () => Promise<R>): Promise<R | null> => {
    try {
      setLoading(true)
      setError(null)
      return await operation()
    } catch (err) {
      setError(err as Error)
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  const manager = useMemo(() => {
    const managerName = tableName.replace(/_/g, '').toLowerCase()
    return (collectionManagers as any)[managerName]
  }, [tableName])

  const create = useCallback((data: Omit<T, 'id' | 'created_at' | 'updated_at'>) => 
    execute(() => manager.create(data)), [execute, manager])

  const update = useCallback((id: string, data: Partial<T>) => 
    execute(() => manager.update(id, data)), [execute, manager])

  const deleteRecord = useCallback((id: string) => 
    execute(() => manager.delete(id)), [execute, manager])

  return {
    create,
    update,
    delete: deleteRecord,
    loading,
    error
  }
}

// =====================================================
// SEARCH HOOKS
// =====================================================

interface UseSearchResult {
  results: Array<{
    collection_name: string
    id: string
    title: string
    slug: string
    excerpt: string
    rank: number
    data: any
  }>
  loading: boolean
  error: Error | null
  search: (term: string, collections?: string[]) => Promise<void>
  clear: () => void
}

export function useSearch(): UseSearchResult {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const search = useCallback(async (term: string, collections?: string[]) => {
    try {
      setLoading(true)
      setError(null)
      const data = await searchAllCollections(term, collections)
      setResults(data)
    } catch (err) {
      setError(err as Error)
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const clear = useCallback(() => {
    setResults([])
    setError(null)
  }, [])

  return { results, loading, error, search, clear }
}

// =====================================================
// REALTIME HOOKS
// =====================================================

export function useRealtime(
  tableName: string,
  callback: (payload: any) => void,
  filter?: string
) {
  useEffect(() => {
    const channel = supabase
      .channel(`${tableName}_realtime`)
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: tableName,
          filter: filter || undefined
        },
        callback
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [tableName, callback, filter])
}

// =====================================================
// COLLECTION-SPECIFIC HOOKS
// =====================================================

// Products hooks
export function useProducts(options?: UseCollectionOptions) {
  return useCollection<Products>('products', options)
}

export function useProductsCRUD() {
  return useCRUD<Products>('products')
}

// Blog Posts hooks
export function useBlogPosts(options?: UseCollectionOptions) {
  return useCollection<BlogPosts>('blog_posts', options)
}

export function useBlogPostsCRUD() {
  return useCRUD<BlogPosts>('blog_posts')
}

// Appointments hooks
export function useAppointments(options?: UseCollectionOptions) {
  return useCollection<Appointments>('appointments', options)
}

export function useAppointmentsCRUD() {
  return useCRUD<Appointments>('appointments')
}

// Customers hooks
export function useCustomers(options?: UseCollectionOptions) {
  return useCollection<Customers>('customers', options)
}

export function useCustomersCRUD() {
  return useCRUD<Customers>('customers')
}

// Services hooks
export function useServices(options?: UseCollectionOptions) {
  return useCollection<Services>('services', options)
}

export function useServicesCRUD() {
  return useCRUD<Services>('services')
}

// Staff/Stylists hooks
export function useStylists(options?: UseCollectionOptions) {
  return useCollection<Stylists>('stylists', options)
}

export function useStylistsCRUD() {
  return useCRUD<Stylists>('stylists')
}

// Reviews hooks
export function useReviews(options?: UseCollectionOptions) {
  return useCollection<Reviews>('reviews', options)
}

export function useReviewsCRUD() {
  return useCRUD<Reviews>('reviews')
}

// Inventory hooks
export function useInventory(options?: UseCollectionOptions) {
  return useCollection<Inventory>('inventory', options)
}

export function useInventoryCRUD() {
  return useCRUD<Inventory>('inventory')
}

// =====================================================
// UTILITY HOOKS
// =====================================================

export function useAuth() {
  const [user, setUser] = useState(supabase.auth.getUser())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user as any)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user || null)
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  return {
    user,
    loading,
    signIn: supabase.auth.signInWithPassword,
    signUp: supabase.auth.signUp,
    signOut: supabase.auth.signOut,
    resetPassword: supabase.auth.resetPasswordForEmail
  }
}

export function useSupabaseStatus() {
  const [status, setStatus] = useState<'connecting' | 'open' | 'closed'>('connecting')

  useEffect(() => {
    const channel = supabase.channel('status')
    
    channel.on('system', {}, (payload) => {
      if (payload.status === 'ok') setStatus('open')
    })

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') setStatus('open')
      if (status === 'CLOSED') setStatus('closed')
    })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return status
}

// =====================================================
// PAGINATION HOOK
// =====================================================

interface UsePaginationOptions {
  totalItems: number
  itemsPerPage: number
  initialPage?: number
}

export function usePagination({ totalItems, itemsPerPage, initialPage = 1 }: UsePaginationOptions) {
  const [currentPage, setCurrentPage] = useState(initialPage)

  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems)

  const goToPage = useCallback((page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }, [totalPages])

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      setCurrentPage(prev => prev + 1)
    }
  }, [currentPage, totalPages])

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      setCurrentPage(prev => prev - 1)
    }
  }, [currentPage])

  return {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    goToPage,
    nextPage,
    prevPage,
    hasNext: currentPage < totalPages,
    hasPrev: currentPage > 1
  }
}

// =====================================================
// FORM HOOKS FOR SUPABASE
// =====================================================

interface UseFormOptions<T> {
  initialValues: T
  onSubmit: (values: T) => Promise<void>
  validate?: (values: T) => Record<string, string>
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  onSubmit,
  validate
}: UseFormOptions<T>) {
  const [values, setValues] = useState(initialValues)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleChange = useCallback((name: keyof T, value: any) => {
    setValues(prev => ({ ...prev, [name]: value }))
    if (errors[name as string]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }, [errors])

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    if (e) e.preventDefault()

    const validationErrors = validate ? validate(values) : {}
    setErrors(validationErrors)

    if (Object.keys(validationErrors).length === 0) {
      try {
        setLoading(true)
        await onSubmit(values)
      } catch (error) {
        console.error('Form submission error:', error)
      } finally {
        setLoading(false)
      }
    }
  }, [values, validate, onSubmit])

  const reset = useCallback(() => {
    setValues(initialValues)
    setErrors({})
  }, [initialValues])

  return {
    values,
    errors,
    loading,
    handleChange,
    handleSubmit,
    reset,
    setValues,
    setErrors
  }
}