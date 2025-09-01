// =====================================================
// SUPABASE QUERIES: ModernMen Collections
// Generated at: 2025-09-01T00:04:44.263170
// Collections: 80
// =====================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js'
import { Database } from './database.types'

// Import generated types
import {
  Commerce, Coupons, GiftCards, Invoices, Orders, PaymentMethods, Products, Promotions, Returns, ShippingMethods, BlogPosts, Content, FAQ, Gallery, Media, MediaFolders, Navigation, NavigationMenus, PagesMain, Pages, Products, RedirectsMain, Redirects, SEOSettings, Tags, AppointmentsMain, Cancellations, Chatbot, ChatConversations, ChatMessages, Contacts, CustomerNotes, CustomersMain, Customers, CustomerTags, EmailCampaigns, LoyaltyProgram, Reviews, Subscriptions, Testimonials, ClockRecords, Commissions, StaffRoles, StaffSchedules, Stylists, TimeOffRequests, Appointments, AuditLogs, BusinessDocumentation, ChatbotLogs, ChatConversations, Documentation, DocumentationTemplates, DocumentationWorkflows, EditorPlugins, EditorTemplates, EditorThemes, EmailLogs, Events, EventTracking, FeatureFlags, Integrations, Inventory, Locations, MaintenanceRequests, Notifications, PageViews, PushNotifications, RecurringAppointments, Resources, RolesPermissions, ServicePackages, Services, Settings, SiteSections, Tenants, Transactions, Users, WaitList, WebhookLogs,
  CreateCommerce, CreateCoupons, CreateGiftCards, CreateInvoices, CreateOrders, CreatePaymentMethods, CreateProducts, CreatePromotions, CreateReturns, CreateShippingMethods, CreateBlogPosts, CreateContent, CreateFAQ, CreateGallery, CreateMedia, CreateMediaFolders, CreateNavigation, CreateNavigationMenus, CreatePagesMain, CreatePages, CreateProducts, CreateRedirectsMain, CreateRedirects, CreateSEOSettings, CreateTags, CreateAppointmentsMain, CreateCancellations, CreateChatbot, CreateChatConversations, CreateChatMessages, CreateContacts, CreateCustomerNotes, CreateCustomersMain, CreateCustomers, CreateCustomerTags, CreateEmailCampaigns, CreateLoyaltyProgram, CreateReviews, CreateSubscriptions, CreateTestimonials, CreateClockRecords, CreateCommissions, CreateStaffRoles, CreateStaffSchedules, CreateStylists, CreateTimeOffRequests, CreateAppointments, CreateAuditLogs, CreateBusinessDocumentation, CreateChatbotLogs, CreateChatConversations, CreateDocumentation, CreateDocumentationTemplates, CreateDocumentationWorkflows, CreateEditorPlugins, CreateEditorTemplates, CreateEditorThemes, CreateEmailLogs, CreateEvents, CreateEventTracking, CreateFeatureFlags, CreateIntegrations, CreateInventory, CreateLocations, CreateMaintenanceRequests, CreateNotifications, CreatePageViews, CreatePushNotifications, CreateRecurringAppointments, CreateResources, CreateRolesPermissions, CreateServicePackages, CreateServices, CreateSettings, CreateSiteSections, CreateTenants, CreateTransactions, CreateUsers, CreateWaitList, CreateWebhookLogs,
  UpdateCommerce, UpdateCoupons, UpdateGiftCards, UpdateInvoices, UpdateOrders, UpdatePaymentMethods, UpdateProducts, UpdatePromotions, UpdateReturns, UpdateShippingMethods, UpdateBlogPosts, UpdateContent, UpdateFAQ, UpdateGallery, UpdateMedia, UpdateMediaFolders, UpdateNavigation, UpdateNavigationMenus, UpdatePagesMain, UpdatePages, UpdateProducts, UpdateRedirectsMain, UpdateRedirects, UpdateSEOSettings, UpdateTags, UpdateAppointmentsMain, UpdateCancellations, UpdateChatbot, UpdateChatConversations, UpdateChatMessages, UpdateContacts, UpdateCustomerNotes, UpdateCustomersMain, UpdateCustomers, UpdateCustomerTags, UpdateEmailCampaigns, UpdateLoyaltyProgram, UpdateReviews, UpdateSubscriptions, UpdateTestimonials, UpdateClockRecords, UpdateCommissions, UpdateStaffRoles, UpdateStaffSchedules, UpdateStylists, UpdateTimeOffRequests, UpdateAppointments, UpdateAuditLogs, UpdateBusinessDocumentation, UpdateChatbotLogs, UpdateChatConversations, UpdateDocumentation, UpdateDocumentationTemplates, UpdateDocumentationWorkflows, UpdateEditorPlugins, UpdateEditorTemplates, UpdateEditorThemes, UpdateEmailLogs, UpdateEvents, UpdateEventTracking, UpdateFeatureFlags, UpdateIntegrations, UpdateInventory, UpdateLocations, UpdateMaintenanceRequests, UpdateNotifications, UpdatePageViews, UpdatePushNotifications, UpdateRecurringAppointments, UpdateResources, UpdateRolesPermissions, UpdateServicePackages, UpdateServices, UpdateSettings, UpdateSiteSections, UpdateTenants, UpdateTransactions, UpdateUsers, UpdateWaitList, UpdateWebhookLogs
} from './generated-types'

type SupabaseClientType = SupabaseClient<Database>

// =====================================================
// SUPABASE CLIENT SETUP
// =====================================================

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

// =====================================================
// GENERIC COLLECTION OPERATIONS
// =====================================================

export class SupabaseCollectionManager<T extends Record<string, any>> {
  constructor(
    private client: SupabaseClientType,
    private tableName: string
  ) {}

  async create(data: Omit<T, 'id' | 'created_at' | 'updated_at'>): Promise<T | null> {
    const { data: result, error } = await this.client
      .from(this.tableName)
      .insert({ data })
      .select()
      .single()

    if (error) throw error
    return result as T
  }

  async findById(id: string): Promise<T | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as T
  }

  async findBySlug(slug: string): Promise<T | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw error
    return data as T
  }

  async findMany({
    page = 1,
    limit = 50,
    orderBy = 'created_at',
    orderDirection = 'desc',
    filters = {}
  }: {
    page?: number
    limit?: number
    orderBy?: string
    orderDirection?: 'asc' | 'desc'
    filters?: Record<string, any>
  } = {}): Promise<{ data: T[], count: number }> {
    let query = this.client
      .from(this.tableName)
      .select('*', { count: 'exact' })

    // Apply filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          query = query.in(key, value)
        } else if (typeof value === 'string' && value.includes('%')) {
          query = query.like(key, value)
        } else {
          query = query.eq(key, value)
        }
      }
    })

    // Apply pagination and ordering
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await query
      .order(orderBy, { ascending: orderDirection === 'asc' })
      .range(from, to)

    if (error) throw error

    return {
      data: (data as T[]) || [],
      count: count || 0
    }
  }

  async update(id: string, updates: Partial<T>): Promise<T | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .update({ data: updates })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as T
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await this.client
      .from(this.tableName)
      .delete()
      .eq('id', id)

    if (error) throw error
    return true
  }

  async search(searchTerm: string, limit = 20): Promise<T[]> {
    const { data, error } = await this.client
      .rpc('search_collections', {
        search_term: searchTerm,
        collection_filter: [this.tableName],
        limit_results: limit
      })

    if (error) throw error
    return (data || []).map((item: any) => item.data as T)
  }
}

// =====================================================
// COLLECTION-SPECIFIC MANAGERS
// =====================================================

export class CommerceManager extends SupabaseCollectionManager<Commerce> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'commerce')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Commerce[]> {
    const { data, error } = await this.client
      .from('commerce')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Commerce[]) || []
  }

  async findByStatus(status: string): Promise<Commerce[]> {
    const { data, error } = await this.client
      .from('commerce')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Commerce[]) || []
  }
}

export const commerceManager = new CommerceManager()

export class CouponsManager extends SupabaseCollectionManager<Coupons> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'coupons')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Coupons[]> {
    const { data, error } = await this.client
      .from('coupons')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Coupons[]) || []
  }

  async findByStatus(status: string): Promise<Coupons[]> {
    const { data, error } = await this.client
      .from('coupons')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Coupons[]) || []
  }
}

export const couponsManager = new CouponsManager()

export class GiftCardsManager extends SupabaseCollectionManager<GiftCards> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'gift_cards')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<GiftCards[]> {
    const { data, error } = await this.client
      .from('gift_cards')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as GiftCards[]) || []
  }

  async findByStatus(status: string): Promise<GiftCards[]> {
    const { data, error } = await this.client
      .from('gift_cards')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as GiftCards[]) || []
  }
}

export const giftcardsManager = new GiftCardsManager()

export class InvoicesManager extends SupabaseCollectionManager<Invoices> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'invoices')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Invoices[]> {
    const { data, error } = await this.client
      .from('invoices')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Invoices[]) || []
  }

  async findByStatus(status: string): Promise<Invoices[]> {
    const { data, error } = await this.client
      .from('invoices')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Invoices[]) || []
  }
}

export const invoicesManager = new InvoicesManager()

export class OrdersManager extends SupabaseCollectionManager<Orders> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'orders')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Orders[]> {
    const { data, error } = await this.client
      .from('orders')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Orders[]) || []
  }

  async findByStatus(status: string): Promise<Orders[]> {
    const { data, error } = await this.client
      .from('orders')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Orders[]) || []
  }
}

export const ordersManager = new OrdersManager()

export class PaymentMethodsManager extends SupabaseCollectionManager<PaymentMethods> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'payment_methods')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<PaymentMethods[]> {
    const { data, error } = await this.client
      .from('payment_methods')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as PaymentMethods[]) || []
  }

  async findByStatus(status: string): Promise<PaymentMethods[]> {
    const { data, error } = await this.client
      .from('payment_methods')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as PaymentMethods[]) || []
  }
}

export const paymentmethodsManager = new PaymentMethodsManager()

export class ProductsManager extends SupabaseCollectionManager<Products> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'products')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Products[]> {
    const { data, error } = await this.client
      .from('products')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Products[]) || []
  }

  async findByStatus(status: string): Promise<Products[]> {
    const { data, error } = await this.client
      .from('products')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Products[]) || []
  }
}

export const productsManager = new ProductsManager()

export class PromotionsManager extends SupabaseCollectionManager<Promotions> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'promotions')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Promotions[]> {
    const { data, error } = await this.client
      .from('promotions')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Promotions[]) || []
  }

  async findByStatus(status: string): Promise<Promotions[]> {
    const { data, error } = await this.client
      .from('promotions')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Promotions[]) || []
  }
}

export const promotionsManager = new PromotionsManager()

export class ReturnsManager extends SupabaseCollectionManager<Returns> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'returns')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Returns[]> {
    const { data, error } = await this.client
      .from('returns')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Returns[]) || []
  }

  async findByStatus(status: string): Promise<Returns[]> {
    const { data, error } = await this.client
      .from('returns')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Returns[]) || []
  }
}

export const returnsManager = new ReturnsManager()

export class ShippingMethodsManager extends SupabaseCollectionManager<ShippingMethods> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'shipping_methods')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<ShippingMethods[]> {
    const { data, error } = await this.client
      .from('shipping_methods')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as ShippingMethods[]) || []
  }

  async findByStatus(status: string): Promise<ShippingMethods[]> {
    const { data, error } = await this.client
      .from('shipping_methods')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as ShippingMethods[]) || []
  }
}

export const shippingmethodsManager = new ShippingMethodsManager()

export class BlogPostsManager extends SupabaseCollectionManager<BlogPosts> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'blog_posts')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<BlogPosts[]> {
    const { data, error } = await this.client
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as BlogPosts[]) || []
  }

  async findByStatus(status: string): Promise<BlogPosts[]> {
    const { data, error } = await this.client
      .from('blog_posts')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as BlogPosts[]) || []
  }
}

export const blogpostsManager = new BlogPostsManager()

export class ContentManager extends SupabaseCollectionManager<Content> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'content')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Content[]> {
    const { data, error } = await this.client
      .from('content')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Content[]) || []
  }

  async findByStatus(status: string): Promise<Content[]> {
    const { data, error } = await this.client
      .from('content')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Content[]) || []
  }
}

export const contentManager = new ContentManager()

export class FAQManager extends SupabaseCollectionManager<FAQ> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'faq')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<FAQ[]> {
    const { data, error } = await this.client
      .from('faq')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as FAQ[]) || []
  }

  async findByStatus(status: string): Promise<FAQ[]> {
    const { data, error } = await this.client
      .from('faq')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as FAQ[]) || []
  }
}

export const faqManager = new FAQManager()

export class GalleryManager extends SupabaseCollectionManager<Gallery> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'gallery')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Gallery[]> {
    const { data, error } = await this.client
      .from('gallery')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Gallery[]) || []
  }

  async findByStatus(status: string): Promise<Gallery[]> {
    const { data, error } = await this.client
      .from('gallery')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Gallery[]) || []
  }
}

export const galleryManager = new GalleryManager()

export class MediaManager extends SupabaseCollectionManager<Media> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'media')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Media[]> {
    const { data, error } = await this.client
      .from('media')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Media[]) || []
  }

  async findByStatus(status: string): Promise<Media[]> {
    const { data, error } = await this.client
      .from('media')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Media[]) || []
  }
}

export const mediaManager = new MediaManager()

export class MediaFoldersManager extends SupabaseCollectionManager<MediaFolders> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'media_folders')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<MediaFolders[]> {
    const { data, error } = await this.client
      .from('media_folders')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as MediaFolders[]) || []
  }

  async findByStatus(status: string): Promise<MediaFolders[]> {
    const { data, error } = await this.client
      .from('media_folders')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as MediaFolders[]) || []
  }
}

export const mediafoldersManager = new MediaFoldersManager()

export class NavigationManager extends SupabaseCollectionManager<Navigation> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'navigation')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Navigation[]> {
    const { data, error } = await this.client
      .from('navigation')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Navigation[]) || []
  }

  async findByStatus(status: string): Promise<Navigation[]> {
    const { data, error } = await this.client
      .from('navigation')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Navigation[]) || []
  }
}

export const navigationManager = new NavigationManager()

export class NavigationMenusManager extends SupabaseCollectionManager<NavigationMenus> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'navigation_menus')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<NavigationMenus[]> {
    const { data, error } = await this.client
      .from('navigation_menus')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as NavigationMenus[]) || []
  }

  async findByStatus(status: string): Promise<NavigationMenus[]> {
    const { data, error } = await this.client
      .from('navigation_menus')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as NavigationMenus[]) || []
  }
}

export const navigationmenusManager = new NavigationMenusManager()

export class PagesMainManager extends SupabaseCollectionManager<PagesMain> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'pages_main')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<PagesMain[]> {
    const { data, error } = await this.client
      .from('pages_main')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as PagesMain[]) || []
  }

  async findByStatus(status: string): Promise<PagesMain[]> {
    const { data, error } = await this.client
      .from('pages_main')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as PagesMain[]) || []
  }
}

export const pagesmainManager = new PagesMainManager()

export class PagesManager extends SupabaseCollectionManager<Pages> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'pages')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Pages[]> {
    const { data, error } = await this.client
      .from('pages')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Pages[]) || []
  }

  async findByStatus(status: string): Promise<Pages[]> {
    const { data, error } = await this.client
      .from('pages')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Pages[]) || []
  }
}

export const pagesManager = new PagesManager()

export class ProductsManager extends SupabaseCollectionManager<Products> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'products')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Products[]> {
    const { data, error } = await this.client
      .from('products')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Products[]) || []
  }

  async findByStatus(status: string): Promise<Products[]> {
    const { data, error } = await this.client
      .from('products')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Products[]) || []
  }
}

export const productsManager = new ProductsManager()

export class RedirectsMainManager extends SupabaseCollectionManager<RedirectsMain> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'redirects_main')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<RedirectsMain[]> {
    const { data, error } = await this.client
      .from('redirects_main')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as RedirectsMain[]) || []
  }

  async findByStatus(status: string): Promise<RedirectsMain[]> {
    const { data, error } = await this.client
      .from('redirects_main')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as RedirectsMain[]) || []
  }
}

export const redirectsmainManager = new RedirectsMainManager()

export class RedirectsManager extends SupabaseCollectionManager<Redirects> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'redirects')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Redirects[]> {
    const { data, error } = await this.client
      .from('redirects')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Redirects[]) || []
  }

  async findByStatus(status: string): Promise<Redirects[]> {
    const { data, error } = await this.client
      .from('redirects')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Redirects[]) || []
  }
}

export const redirectsManager = new RedirectsManager()

export class SEOSettingsManager extends SupabaseCollectionManager<SEOSettings> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'seosettings')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<SEOSettings[]> {
    const { data, error } = await this.client
      .from('seosettings')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as SEOSettings[]) || []
  }

  async findByStatus(status: string): Promise<SEOSettings[]> {
    const { data, error } = await this.client
      .from('seosettings')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as SEOSettings[]) || []
  }
}

export const seosettingsManager = new SEOSettingsManager()

export class TagsManager extends SupabaseCollectionManager<Tags> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'tags')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Tags[]> {
    const { data, error } = await this.client
      .from('tags')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Tags[]) || []
  }

  async findByStatus(status: string): Promise<Tags[]> {
    const { data, error } = await this.client
      .from('tags')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Tags[]) || []
  }
}

export const tagsManager = new TagsManager()

export class AppointmentsMainManager extends SupabaseCollectionManager<AppointmentsMain> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'appointments_main')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<AppointmentsMain[]> {
    const { data, error } = await this.client
      .from('appointments_main')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as AppointmentsMain[]) || []
  }

  async findByStatus(status: string): Promise<AppointmentsMain[]> {
    const { data, error } = await this.client
      .from('appointments_main')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as AppointmentsMain[]) || []
  }
}

export const appointmentsmainManager = new AppointmentsMainManager()

export class CancellationsManager extends SupabaseCollectionManager<Cancellations> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'cancellations')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Cancellations[]> {
    const { data, error } = await this.client
      .from('cancellations')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Cancellations[]) || []
  }

  async findByStatus(status: string): Promise<Cancellations[]> {
    const { data, error } = await this.client
      .from('cancellations')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Cancellations[]) || []
  }
}

export const cancellationsManager = new CancellationsManager()

export class ChatbotManager extends SupabaseCollectionManager<Chatbot> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'chatbot')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Chatbot[]> {
    const { data, error } = await this.client
      .from('chatbot')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Chatbot[]) || []
  }

  async findByStatus(status: string): Promise<Chatbot[]> {
    const { data, error } = await this.client
      .from('chatbot')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Chatbot[]) || []
  }
}

export const chatbotManager = new ChatbotManager()

export class ChatConversationsManager extends SupabaseCollectionManager<ChatConversations> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'chat_conversations')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<ChatConversations[]> {
    const { data, error } = await this.client
      .from('chat_conversations')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as ChatConversations[]) || []
  }

  async findByStatus(status: string): Promise<ChatConversations[]> {
    const { data, error } = await this.client
      .from('chat_conversations')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as ChatConversations[]) || []
  }
}

export const chatconversationsManager = new ChatConversationsManager()

export class ChatMessagesManager extends SupabaseCollectionManager<ChatMessages> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'chat_messages')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<ChatMessages[]> {
    const { data, error } = await this.client
      .from('chat_messages')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as ChatMessages[]) || []
  }

  async findByStatus(status: string): Promise<ChatMessages[]> {
    const { data, error } = await this.client
      .from('chat_messages')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as ChatMessages[]) || []
  }
}

export const chatmessagesManager = new ChatMessagesManager()

export class ContactsManager extends SupabaseCollectionManager<Contacts> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'contacts')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Contacts[]> {
    const { data, error } = await this.client
      .from('contacts')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Contacts[]) || []
  }

  async findByStatus(status: string): Promise<Contacts[]> {
    const { data, error } = await this.client
      .from('contacts')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Contacts[]) || []
  }
}

export const contactsManager = new ContactsManager()

export class CustomerNotesManager extends SupabaseCollectionManager<CustomerNotes> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'customer_notes')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<CustomerNotes[]> {
    const { data, error } = await this.client
      .from('customer_notes')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as CustomerNotes[]) || []
  }

  async findByStatus(status: string): Promise<CustomerNotes[]> {
    const { data, error } = await this.client
      .from('customer_notes')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as CustomerNotes[]) || []
  }
}

export const customernotesManager = new CustomerNotesManager()

export class CustomersMainManager extends SupabaseCollectionManager<CustomersMain> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'customers_main')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<CustomersMain[]> {
    const { data, error } = await this.client
      .from('customers_main')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as CustomersMain[]) || []
  }

  async findByStatus(status: string): Promise<CustomersMain[]> {
    const { data, error } = await this.client
      .from('customers_main')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as CustomersMain[]) || []
  }
}

export const customersmainManager = new CustomersMainManager()

export class CustomersManager extends SupabaseCollectionManager<Customers> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'customers')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Customers[]> {
    const { data, error } = await this.client
      .from('customers')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Customers[]) || []
  }

  async findByStatus(status: string): Promise<Customers[]> {
    const { data, error } = await this.client
      .from('customers')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Customers[]) || []
  }
}

export const customersManager = new CustomersManager()

export class CustomerTagsManager extends SupabaseCollectionManager<CustomerTags> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'customer_tags')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<CustomerTags[]> {
    const { data, error } = await this.client
      .from('customer_tags')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as CustomerTags[]) || []
  }

  async findByStatus(status: string): Promise<CustomerTags[]> {
    const { data, error } = await this.client
      .from('customer_tags')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as CustomerTags[]) || []
  }
}

export const customertagsManager = new CustomerTagsManager()

export class EmailCampaignsManager extends SupabaseCollectionManager<EmailCampaigns> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'email_campaigns')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<EmailCampaigns[]> {
    const { data, error } = await this.client
      .from('email_campaigns')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as EmailCampaigns[]) || []
  }

  async findByStatus(status: string): Promise<EmailCampaigns[]> {
    const { data, error } = await this.client
      .from('email_campaigns')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as EmailCampaigns[]) || []
  }
}

export const emailcampaignsManager = new EmailCampaignsManager()

export class LoyaltyProgramManager extends SupabaseCollectionManager<LoyaltyProgram> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'loyalty_program')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<LoyaltyProgram[]> {
    const { data, error } = await this.client
      .from('loyalty_program')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as LoyaltyProgram[]) || []
  }

  async findByStatus(status: string): Promise<LoyaltyProgram[]> {
    const { data, error } = await this.client
      .from('loyalty_program')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as LoyaltyProgram[]) || []
  }
}

export const loyaltyprogramManager = new LoyaltyProgramManager()

export class ReviewsManager extends SupabaseCollectionManager<Reviews> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'reviews')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Reviews[]> {
    const { data, error } = await this.client
      .from('reviews')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Reviews[]) || []
  }

  async findByStatus(status: string): Promise<Reviews[]> {
    const { data, error } = await this.client
      .from('reviews')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Reviews[]) || []
  }
}

export const reviewsManager = new ReviewsManager()

export class SubscriptionsManager extends SupabaseCollectionManager<Subscriptions> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'subscriptions')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Subscriptions[]> {
    const { data, error } = await this.client
      .from('subscriptions')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Subscriptions[]) || []
  }

  async findByStatus(status: string): Promise<Subscriptions[]> {
    const { data, error } = await this.client
      .from('subscriptions')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Subscriptions[]) || []
  }
}

export const subscriptionsManager = new SubscriptionsManager()

export class TestimonialsManager extends SupabaseCollectionManager<Testimonials> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'testimonials')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Testimonials[]> {
    const { data, error } = await this.client
      .from('testimonials')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Testimonials[]) || []
  }

  async findByStatus(status: string): Promise<Testimonials[]> {
    const { data, error } = await this.client
      .from('testimonials')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Testimonials[]) || []
  }
}

export const testimonialsManager = new TestimonialsManager()

export class ClockRecordsManager extends SupabaseCollectionManager<ClockRecords> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'clock_records')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<ClockRecords[]> {
    const { data, error } = await this.client
      .from('clock_records')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as ClockRecords[]) || []
  }

  async findByStatus(status: string): Promise<ClockRecords[]> {
    const { data, error } = await this.client
      .from('clock_records')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as ClockRecords[]) || []
  }
}

export const clockrecordsManager = new ClockRecordsManager()

export class CommissionsManager extends SupabaseCollectionManager<Commissions> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'commissions')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Commissions[]> {
    const { data, error } = await this.client
      .from('commissions')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Commissions[]) || []
  }

  async findByStatus(status: string): Promise<Commissions[]> {
    const { data, error } = await this.client
      .from('commissions')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Commissions[]) || []
  }
}

export const commissionsManager = new CommissionsManager()

export class StaffRolesManager extends SupabaseCollectionManager<StaffRoles> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'staff_roles')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<StaffRoles[]> {
    const { data, error } = await this.client
      .from('staff_roles')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as StaffRoles[]) || []
  }

  async findByStatus(status: string): Promise<StaffRoles[]> {
    const { data, error } = await this.client
      .from('staff_roles')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as StaffRoles[]) || []
  }
}

export const staffrolesManager = new StaffRolesManager()

export class StaffSchedulesManager extends SupabaseCollectionManager<StaffSchedules> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'staff_schedules')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<StaffSchedules[]> {
    const { data, error } = await this.client
      .from('staff_schedules')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as StaffSchedules[]) || []
  }

  async findByStatus(status: string): Promise<StaffSchedules[]> {
    const { data, error } = await this.client
      .from('staff_schedules')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as StaffSchedules[]) || []
  }
}

export const staffschedulesManager = new StaffSchedulesManager()

export class StylistsManager extends SupabaseCollectionManager<Stylists> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'stylists')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Stylists[]> {
    const { data, error } = await this.client
      .from('stylists')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Stylists[]) || []
  }

  async findByStatus(status: string): Promise<Stylists[]> {
    const { data, error } = await this.client
      .from('stylists')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Stylists[]) || []
  }
}

export const stylistsManager = new StylistsManager()

export class TimeOffRequestsManager extends SupabaseCollectionManager<TimeOffRequests> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'time_off_requests')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<TimeOffRequests[]> {
    const { data, error } = await this.client
      .from('time_off_requests')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as TimeOffRequests[]) || []
  }

  async findByStatus(status: string): Promise<TimeOffRequests[]> {
    const { data, error } = await this.client
      .from('time_off_requests')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as TimeOffRequests[]) || []
  }
}

export const timeoffrequestsManager = new TimeOffRequestsManager()

export class AppointmentsManager extends SupabaseCollectionManager<Appointments> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'appointments')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Appointments[]> {
    const { data, error } = await this.client
      .from('appointments')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Appointments[]) || []
  }

  async findByStatus(status: string): Promise<Appointments[]> {
    const { data, error } = await this.client
      .from('appointments')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Appointments[]) || []
  }
}

export const appointmentsManager = new AppointmentsManager()

export class AuditLogsManager extends SupabaseCollectionManager<AuditLogs> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'audit_logs')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<AuditLogs[]> {
    const { data, error } = await this.client
      .from('audit_logs')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as AuditLogs[]) || []
  }

  async findByStatus(status: string): Promise<AuditLogs[]> {
    const { data, error } = await this.client
      .from('audit_logs')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as AuditLogs[]) || []
  }
}

export const auditlogsManager = new AuditLogsManager()

export class BusinessDocumentationManager extends SupabaseCollectionManager<BusinessDocumentation> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'business_documentation')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<BusinessDocumentation[]> {
    const { data, error } = await this.client
      .from('business_documentation')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as BusinessDocumentation[]) || []
  }

  async findByStatus(status: string): Promise<BusinessDocumentation[]> {
    const { data, error } = await this.client
      .from('business_documentation')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as BusinessDocumentation[]) || []
  }
}

export const businessdocumentationManager = new BusinessDocumentationManager()

export class ChatbotLogsManager extends SupabaseCollectionManager<ChatbotLogs> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'chatbot_logs')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<ChatbotLogs[]> {
    const { data, error } = await this.client
      .from('chatbot_logs')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as ChatbotLogs[]) || []
  }

  async findByStatus(status: string): Promise<ChatbotLogs[]> {
    const { data, error } = await this.client
      .from('chatbot_logs')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as ChatbotLogs[]) || []
  }
}

export const chatbotlogsManager = new ChatbotLogsManager()

export class ChatConversationsManager extends SupabaseCollectionManager<ChatConversations> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'chat_conversations')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<ChatConversations[]> {
    const { data, error } = await this.client
      .from('chat_conversations')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as ChatConversations[]) || []
  }

  async findByStatus(status: string): Promise<ChatConversations[]> {
    const { data, error } = await this.client
      .from('chat_conversations')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as ChatConversations[]) || []
  }
}

export const chatconversationsManager = new ChatConversationsManager()

export class DocumentationManager extends SupabaseCollectionManager<Documentation> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'documentation')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Documentation[]> {
    const { data, error } = await this.client
      .from('documentation')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Documentation[]) || []
  }

  async findByStatus(status: string): Promise<Documentation[]> {
    const { data, error } = await this.client
      .from('documentation')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Documentation[]) || []
  }
}

export const documentationManager = new DocumentationManager()

export class DocumentationTemplatesManager extends SupabaseCollectionManager<DocumentationTemplates> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'documentation_templates')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<DocumentationTemplates[]> {
    const { data, error } = await this.client
      .from('documentation_templates')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as DocumentationTemplates[]) || []
  }

  async findByStatus(status: string): Promise<DocumentationTemplates[]> {
    const { data, error } = await this.client
      .from('documentation_templates')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as DocumentationTemplates[]) || []
  }
}

export const documentationtemplatesManager = new DocumentationTemplatesManager()

export class DocumentationWorkflowsManager extends SupabaseCollectionManager<DocumentationWorkflows> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'documentation_workflows')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<DocumentationWorkflows[]> {
    const { data, error } = await this.client
      .from('documentation_workflows')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as DocumentationWorkflows[]) || []
  }

  async findByStatus(status: string): Promise<DocumentationWorkflows[]> {
    const { data, error } = await this.client
      .from('documentation_workflows')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as DocumentationWorkflows[]) || []
  }
}

export const documentationworkflowsManager = new DocumentationWorkflowsManager()

export class EditorPluginsManager extends SupabaseCollectionManager<EditorPlugins> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'editor_plugins')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<EditorPlugins[]> {
    const { data, error } = await this.client
      .from('editor_plugins')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as EditorPlugins[]) || []
  }

  async findByStatus(status: string): Promise<EditorPlugins[]> {
    const { data, error } = await this.client
      .from('editor_plugins')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as EditorPlugins[]) || []
  }
}

export const editorpluginsManager = new EditorPluginsManager()

export class EditorTemplatesManager extends SupabaseCollectionManager<EditorTemplates> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'editor_templates')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<EditorTemplates[]> {
    const { data, error } = await this.client
      .from('editor_templates')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as EditorTemplates[]) || []
  }

  async findByStatus(status: string): Promise<EditorTemplates[]> {
    const { data, error } = await this.client
      .from('editor_templates')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as EditorTemplates[]) || []
  }
}

export const editortemplatesManager = new EditorTemplatesManager()

export class EditorThemesManager extends SupabaseCollectionManager<EditorThemes> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'editor_themes')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<EditorThemes[]> {
    const { data, error } = await this.client
      .from('editor_themes')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as EditorThemes[]) || []
  }

  async findByStatus(status: string): Promise<EditorThemes[]> {
    const { data, error } = await this.client
      .from('editor_themes')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as EditorThemes[]) || []
  }
}

export const editorthemesManager = new EditorThemesManager()

export class EmailLogsManager extends SupabaseCollectionManager<EmailLogs> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'email_logs')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<EmailLogs[]> {
    const { data, error } = await this.client
      .from('email_logs')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as EmailLogs[]) || []
  }

  async findByStatus(status: string): Promise<EmailLogs[]> {
    const { data, error } = await this.client
      .from('email_logs')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as EmailLogs[]) || []
  }
}

export const emaillogsManager = new EmailLogsManager()

export class EventsManager extends SupabaseCollectionManager<Events> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'events')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Events[]> {
    const { data, error } = await this.client
      .from('events')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Events[]) || []
  }

  async findByStatus(status: string): Promise<Events[]> {
    const { data, error } = await this.client
      .from('events')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Events[]) || []
  }
}

export const eventsManager = new EventsManager()

export class EventTrackingManager extends SupabaseCollectionManager<EventTracking> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'event_tracking')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<EventTracking[]> {
    const { data, error } = await this.client
      .from('event_tracking')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as EventTracking[]) || []
  }

  async findByStatus(status: string): Promise<EventTracking[]> {
    const { data, error } = await this.client
      .from('event_tracking')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as EventTracking[]) || []
  }
}

export const eventtrackingManager = new EventTrackingManager()

export class FeatureFlagsManager extends SupabaseCollectionManager<FeatureFlags> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'feature_flags')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<FeatureFlags[]> {
    const { data, error } = await this.client
      .from('feature_flags')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as FeatureFlags[]) || []
  }

  async findByStatus(status: string): Promise<FeatureFlags[]> {
    const { data, error } = await this.client
      .from('feature_flags')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as FeatureFlags[]) || []
  }
}

export const featureflagsManager = new FeatureFlagsManager()

export class IntegrationsManager extends SupabaseCollectionManager<Integrations> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'integrations')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Integrations[]> {
    const { data, error } = await this.client
      .from('integrations')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Integrations[]) || []
  }

  async findByStatus(status: string): Promise<Integrations[]> {
    const { data, error } = await this.client
      .from('integrations')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Integrations[]) || []
  }
}

export const integrationsManager = new IntegrationsManager()

export class InventoryManager extends SupabaseCollectionManager<Inventory> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'inventory')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Inventory[]> {
    const { data, error } = await this.client
      .from('inventory')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Inventory[]) || []
  }

  async findByStatus(status: string): Promise<Inventory[]> {
    const { data, error } = await this.client
      .from('inventory')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Inventory[]) || []
  }
}

export const inventoryManager = new InventoryManager()

export class LocationsManager extends SupabaseCollectionManager<Locations> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'locations')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Locations[]> {
    const { data, error } = await this.client
      .from('locations')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Locations[]) || []
  }

  async findByStatus(status: string): Promise<Locations[]> {
    const { data, error } = await this.client
      .from('locations')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Locations[]) || []
  }
}

export const locationsManager = new LocationsManager()

export class MaintenanceRequestsManager extends SupabaseCollectionManager<MaintenanceRequests> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'maintenance_requests')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<MaintenanceRequests[]> {
    const { data, error } = await this.client
      .from('maintenance_requests')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as MaintenanceRequests[]) || []
  }

  async findByStatus(status: string): Promise<MaintenanceRequests[]> {
    const { data, error } = await this.client
      .from('maintenance_requests')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as MaintenanceRequests[]) || []
  }
}

export const maintenancerequestsManager = new MaintenanceRequestsManager()

export class NotificationsManager extends SupabaseCollectionManager<Notifications> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'notifications')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Notifications[]> {
    const { data, error } = await this.client
      .from('notifications')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Notifications[]) || []
  }

  async findByStatus(status: string): Promise<Notifications[]> {
    const { data, error } = await this.client
      .from('notifications')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Notifications[]) || []
  }
}

export const notificationsManager = new NotificationsManager()

export class PageViewsManager extends SupabaseCollectionManager<PageViews> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'page_views')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<PageViews[]> {
    const { data, error } = await this.client
      .from('page_views')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as PageViews[]) || []
  }

  async findByStatus(status: string): Promise<PageViews[]> {
    const { data, error } = await this.client
      .from('page_views')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as PageViews[]) || []
  }
}

export const pageviewsManager = new PageViewsManager()

export class PushNotificationsManager extends SupabaseCollectionManager<PushNotifications> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'push_notifications')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<PushNotifications[]> {
    const { data, error } = await this.client
      .from('push_notifications')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as PushNotifications[]) || []
  }

  async findByStatus(status: string): Promise<PushNotifications[]> {
    const { data, error } = await this.client
      .from('push_notifications')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as PushNotifications[]) || []
  }
}

export const pushnotificationsManager = new PushNotificationsManager()

export class RecurringAppointmentsManager extends SupabaseCollectionManager<RecurringAppointments> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'recurring_appointments')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<RecurringAppointments[]> {
    const { data, error } = await this.client
      .from('recurring_appointments')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as RecurringAppointments[]) || []
  }

  async findByStatus(status: string): Promise<RecurringAppointments[]> {
    const { data, error } = await this.client
      .from('recurring_appointments')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as RecurringAppointments[]) || []
  }
}

export const recurringappointmentsManager = new RecurringAppointmentsManager()

export class ResourcesManager extends SupabaseCollectionManager<Resources> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'resources')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Resources[]> {
    const { data, error } = await this.client
      .from('resources')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Resources[]) || []
  }

  async findByStatus(status: string): Promise<Resources[]> {
    const { data, error } = await this.client
      .from('resources')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Resources[]) || []
  }
}

export const resourcesManager = new ResourcesManager()

export class RolesPermissionsManager extends SupabaseCollectionManager<RolesPermissions> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'roles_permissions')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<RolesPermissions[]> {
    const { data, error } = await this.client
      .from('roles_permissions')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as RolesPermissions[]) || []
  }

  async findByStatus(status: string): Promise<RolesPermissions[]> {
    const { data, error } = await this.client
      .from('roles_permissions')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as RolesPermissions[]) || []
  }
}

export const rolespermissionsManager = new RolesPermissionsManager()

export class ServicePackagesManager extends SupabaseCollectionManager<ServicePackages> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'service_packages')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<ServicePackages[]> {
    const { data, error } = await this.client
      .from('service_packages')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as ServicePackages[]) || []
  }

  async findByStatus(status: string): Promise<ServicePackages[]> {
    const { data, error } = await this.client
      .from('service_packages')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as ServicePackages[]) || []
  }
}

export const servicepackagesManager = new ServicePackagesManager()

export class ServicesManager extends SupabaseCollectionManager<Services> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'services')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Services[]> {
    const { data, error } = await this.client
      .from('services')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Services[]) || []
  }

  async findByStatus(status: string): Promise<Services[]> {
    const { data, error } = await this.client
      .from('services')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Services[]) || []
  }
}

export const servicesManager = new ServicesManager()

export class SettingsManager extends SupabaseCollectionManager<Settings> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'settings')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Settings[]> {
    const { data, error } = await this.client
      .from('settings')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Settings[]) || []
  }

  async findByStatus(status: string): Promise<Settings[]> {
    const { data, error } = await this.client
      .from('settings')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Settings[]) || []
  }
}

export const settingsManager = new SettingsManager()

export class SiteSectionsManager extends SupabaseCollectionManager<SiteSections> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'site_sections')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<SiteSections[]> {
    const { data, error } = await this.client
      .from('site_sections')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as SiteSections[]) || []
  }

  async findByStatus(status: string): Promise<SiteSections[]> {
    const { data, error } = await this.client
      .from('site_sections')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as SiteSections[]) || []
  }
}

export const sitesectionsManager = new SiteSectionsManager()

export class TenantsManager extends SupabaseCollectionManager<Tenants> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'tenants')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Tenants[]> {
    const { data, error } = await this.client
      .from('tenants')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Tenants[]) || []
  }

  async findByStatus(status: string): Promise<Tenants[]> {
    const { data, error } = await this.client
      .from('tenants')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Tenants[]) || []
  }
}

export const tenantsManager = new TenantsManager()

export class TransactionsManager extends SupabaseCollectionManager<Transactions> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'transactions')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Transactions[]> {
    const { data, error } = await this.client
      .from('transactions')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Transactions[]) || []
  }

  async findByStatus(status: string): Promise<Transactions[]> {
    const { data, error } = await this.client
      .from('transactions')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Transactions[]) || []
  }
}

export const transactionsManager = new TransactionsManager()

export class UsersManager extends SupabaseCollectionManager<Users> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'users')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<Users[]> {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Users[]) || []
  }

  async findByStatus(status: string): Promise<Users[]> {
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as Users[]) || []
  }
}

export const usersManager = new UsersManager()

export class WaitListManager extends SupabaseCollectionManager<WaitList> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'wait_list')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<WaitList[]> {
    const { data, error } = await this.client
      .from('wait_list')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as WaitList[]) || []
  }

  async findByStatus(status: string): Promise<WaitList[]> {
    const { data, error } = await this.client
      .from('wait_list')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as WaitList[]) || []
  }
}

export const waitlistManager = new WaitListManager()

export class WebhookLogsManager extends SupabaseCollectionManager<WebhookLogs> {
  constructor(client: SupabaseClientType = supabase) {
    super(client, 'webhook_logs')
  }

  // Collection-specific methods can be added here
  async findPublished(): Promise<WebhookLogs[]> {
    const { data, error } = await this.client
      .from('webhook_logs')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as WebhookLogs[]) || []
  }

  async findByStatus(status: string): Promise<WebhookLogs[]> {
    const { data, error } = await this.client
      .from('webhook_logs')
      .select('*')
      .eq('status', status)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data as WebhookLogs[]) || []
  }
}

export const webhooklogsManager = new WebhookLogsManager()


// =====================================================
// CONVENIENCE EXPORTS
// =====================================================

// Export all managers
export const collectionManagers = {
  commerce: commerceManager,
  coupons: couponsManager,
  giftcards: giftcardsManager,
  invoices: invoicesManager,
  orders: ordersManager,
  paymentmethods: paymentmethodsManager,
  products: productsManager,
  promotions: promotionsManager,
  returns: returnsManager,
  shippingmethods: shippingmethodsManager,
  blogposts: blogpostsManager,
  content: contentManager,
  faq: faqManager,
  gallery: galleryManager,
  media: mediaManager,
  mediafolders: mediafoldersManager,
  navigation: navigationManager,
  navigationmenus: navigationmenusManager,
  pagesmain: pagesmainManager,
  pages: pagesManager,
  products: productsManager,
  redirectsmain: redirectsmainManager,
  redirects: redirectsManager,
  seosettings: seosettingsManager,
  tags: tagsManager,
  appointmentsmain: appointmentsmainManager,
  cancellations: cancellationsManager,
  chatbot: chatbotManager,
  chatconversations: chatconversationsManager,
  chatmessages: chatmessagesManager,
  contacts: contactsManager,
  customernotes: customernotesManager,
  customersmain: customersmainManager,
  customers: customersManager,
  customertags: customertagsManager,
  emailcampaigns: emailcampaignsManager,
  loyaltyprogram: loyaltyprogramManager,
  reviews: reviewsManager,
  subscriptions: subscriptionsManager,
  testimonials: testimonialsManager,
  clockrecords: clockrecordsManager,
  commissions: commissionsManager,
  staffroles: staffrolesManager,
  staffschedules: staffschedulesManager,
  stylists: stylistsManager,
  timeoffrequests: timeoffrequestsManager,
  appointments: appointmentsManager,
  auditlogs: auditlogsManager,
  businessdocumentation: businessdocumentationManager,
  chatbotlogs: chatbotlogsManager,
  chatconversations: chatconversationsManager,
  documentation: documentationManager,
  documentationtemplates: documentationtemplatesManager,
  documentationworkflows: documentationworkflowsManager,
  editorplugins: editorpluginsManager,
  editortemplates: editortemplatesManager,
  editorthemes: editorthemesManager,
  emaillogs: emaillogsManager,
  events: eventsManager,
  eventtracking: eventtrackingManager,
  featureflags: featureflagsManager,
  integrations: integrationsManager,
  inventory: inventoryManager,
  locations: locationsManager,
  maintenancerequests: maintenancerequestsManager,
  notifications: notificationsManager,
  pageviews: pageviewsManager,
  pushnotifications: pushnotificationsManager,
  recurringappointments: recurringappointmentsManager,
  resources: resourcesManager,
  rolespermissions: rolespermissionsManager,
  servicepackages: servicepackagesManager,
  services: servicesManager,
  settings: settingsManager,
  sitesections: sitesectionsManager,
  tenants: tenantsManager,
  transactions: transactionsManager,
  users: usersManager,
  waitlist: waitlistManager,
  webhooklogs: webhooklogsManager,
}

// Generic search across all collections
export async function searchAllCollections(
  searchTerm: string,
  collections?: string[],
  limit = 50
): Promise<Array<{
  collection_name: string
  id: string
  title: string
  slug: string
  excerpt: string
  rank: number
  data: any
}>> {
  const { data, error } = await supabase
    .rpc('search_collections', {
      search_term: searchTerm,
      collection_filter: collections || null,
      limit_results: limit
    })

  if (error) throw error
  return data || []
}

// Get collection statistics
export async function getCollectionStats(): Promise<Array<{
  collection_name: string
  record_count: number
  avg_data_size: number
  last_updated: string
}>> {
  const { data, error } = await supabase
    .rpc('get_collection_stats')

  if (error) throw error
  return data || []
}

// Batch operations
export async function batchCreate<T>(
  tableName: string,
  records: Array<Omit<T, 'id' | 'created_at' | 'updated_at'>>
): Promise<T[]> {
  const { data, error } = await supabase
    .from(tableName)
    .insert(records.map(record => ({ data: record })))
    .select()

  if (error) throw error
  return (data as T[]) || []
}

export async function batchUpdate<T>(
  tableName: string,
  updates: Array<{ id: string; data: Partial<T> }>
): Promise<T[]> {
  const results: T[] = []
  
  for (const update of updates) {
    const { data, error } = await supabase
      .from(tableName)
      .update({ data: update.data })
      .eq('id', update.id)
      .select()
      .single()

    if (error) throw error
    if (data) results.push(data as T)
  }

  return results
}

export async function batchDelete(
  tableName: string,
  ids: string[]
): Promise<boolean> {
  const { error } = await supabase
    .from(tableName)
    .delete()
    .in('id', ids)

  if (error) throw error
  return true
}
