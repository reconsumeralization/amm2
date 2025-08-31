// src/payload/collections/types-only.ts
// Lightweight export of all collection configs without global wrappers or hooks.

// Commerce Collections
import { Coupons } from './commerce/Coupons'
import { GiftCards } from './commerce/GiftCards'
import { Invoices } from './commerce/Invoices'
import { Orders } from './commerce/Orders'
import { PaymentMethods } from './commerce/PaymentMethods'
import { Products } from './commerce/Products'
import { Promotions } from './commerce/Promotions'
import { Returns } from './commerce/Returns'
import { ShippingMethods } from './commerce/ShippingMethods'

// Content Collections
import { BlogPosts } from './content/BlogPosts'
import { Content } from './content/Content'
import { FAQ } from './content/FAQ'
import { Gallery } from './content/Gallery'
import { Media } from './content/Media'
import { MediaFolders } from './content/MediaFolders'
import { Navigation } from './content/Navigation'
import { Pages } from './content/Pages-main'
import { Redirects } from './content/Redirects-main'
import { NavigationMenus } from './content/NavigationMenus'
import { SEOSettings } from './content/SEOSettings'
import { Tags } from './content/Tags'

// CRM Collections
import { Appointments } from './crm/Appointments-main'
import { Cancellations } from './crm/Cancellations'
import { Chatbot } from './crm/Chatbot'
import { ChatConversations as CRMChatConversations } from './crm/ChatConversations'
import { ChatMessages } from './crm/ChatMessages'
import { Contacts } from './crm/Contacts'
import { CustomerNotes } from './crm/CustomerNotes'
import { CustomerTags } from './crm/CustomerTags'
import { Customers } from './crm/Customers-main'
import { EmailCampaigns } from './crm/EmailCampaigns'
import { LoyaltyProgram } from './crm/LoyaltyProgram'
import { Reviews } from './crm/Reviews'
import { Subscriptions } from './crm/Subscriptions'
import { Testimonials } from './crm/Testimonials'

// Staff Collections
import { ClockRecords } from './staff/ClockRecords'
import { Commissions } from './staff/Commissions'
import { StaffRoles } from './staff/StaffRoles'
import { StaffSchedules } from './staff/StaffSchedules'
import { Stylists } from './staff/Stylists'
import { TimeOffRequests } from './staff/TimeOffRequests'

// System Collections
import { AuditLogs } from './system/AuditLogs'
import { BusinessDocumentation } from './system/BusinessDocumentation'
import { ChatConversations } from './system/ChatConversations'
import { ChatbotLogs } from './system/ChatbotLogs'
import { Documentation } from './system/Documentation'
import { DocumentationTemplates } from './system/DocumentationTemplates'
import { DocumentationWorkflows } from './system/DocumentationWorkflows'
import { EmailLogs } from './system/EmailLogs'
import { EditorPlugins } from './system/EditorPlugins'
import { EditorTemplates } from './system/EditorTemplates'
import { EditorThemes } from './system/EditorThemes'
import { Events } from './system/Events'
import { EventTracking } from './system/EventTracking'
import { FeatureFlags } from './system/FeatureFlags'
import { Integrations } from './system/Integrations'
import { Inventory } from './system/Inventory'
import { Locations } from './system/Locations'
import { MaintenanceRequests } from './system/MaintenanceRequests'
import { Notifications } from './system/Notifications'
import { PageViews } from './system/PageViews'
import { PushNotifications } from './system/PushNotifications'
import { RecurringAppointments } from './system/RecurringAppointments'
import { Resources } from './system/Resources'
import { RolesPermissions } from './system/RolesPermissions'
import { ServicePackages } from './system/ServicePackages'
import { Services } from './system/Services'
import { Settings } from './system/Settings'
import { SiteSections } from './system/SiteSections'
import { Tenants } from './system/Tenants'
import { Transactions } from './system/Transactions'
import { Users } from './system/Users'
import { WaitList } from './system/WaitList'
import { WebhookLogs } from './system/WebhookLogs'

// Visual Builder Collections
import { Animations } from './builder/Animations'
import { BlockRevisions } from './builder/BlockRevisions'
import { Blocks } from './builder/Blocks-main'
import { ConditionalRules } from './builder/ConditionalRules'
import { Drafts } from './builder/Drafts'
import { Forms } from './builder/Forms'
import { DynamicData } from './builder/DynamicData'
import { GlobalStyles } from './builder/GlobalStyles'
import { Integrations as BuilderIntegrations } from './builder/Integrations'
import { Layouts } from './builder/Layouts'
import { PageRevisions } from './builder/PageRevisions'
import { Pages as BuilderPages } from './builder/Pages'
import { PublishQueue } from './builder/PublishQueue'
import { ReusableComponents } from './builder/ReusableComponents'
import { Sections } from './builder/Sections'
import { SEO as BuilderSEO } from './builder/SEO'
import { Templates } from './builder/Templates'
import { Themes } from './builder/Themes'
import { BuilderTranslations as Translations } from './builder/Translations'

const collections = [
  // Commerce
  Coupons,
  GiftCards,
  Invoices,
  Orders,
  PaymentMethods,
  Products,
  Promotions,
  Returns,
  ShippingMethods,

  // Content
  BlogPosts,
  Content,
  FAQ,
  Gallery,
  Media,
  MediaFolders,
  Navigation,
  Pages,
  Redirects,
  NavigationMenus,
  SEOSettings,
  Tags,

  // CRM
  Appointments,
  Cancellations,
  Chatbot,
  CRMChatConversations,
  ChatMessages,
  Contacts,
  CustomerNotes,
  CustomerTags,
  Customers,
  EmailCampaigns,
  LoyaltyProgram,
  Reviews,
  Subscriptions,
  Testimonials,

  // Staff
  ClockRecords,
  Commissions,
  StaffRoles,
  StaffSchedules,
  Stylists,
  TimeOffRequests,

  // System
  AuditLogs,
  BusinessDocumentation,
  ChatConversations,
  ChatbotLogs,
  Documentation,
  DocumentationTemplates,
  DocumentationWorkflows,
  EmailLogs,
  EditorPlugins,
  EditorTemplates,
  EditorThemes,
  Events,
  EventTracking,
  FeatureFlags,
  Integrations,
  Inventory,
  Locations,
  MaintenanceRequests,
  Notifications,
  PageViews,
  PushNotifications,
  RecurringAppointments,
  Resources,
  RolesPermissions,
  ServicePackages,
  Services,
  Settings,
  SiteSections,
  Tenants,
  Transactions,
  Users,
  WaitList,
  WebhookLogs,

  // Builder
  Animations,
  BlockRevisions,
  Blocks,
  ConditionalRules,
  Drafts,
  Forms,
  DynamicData,
  GlobalStyles,
  BuilderIntegrations,
  Layouts,
  PageRevisions,
  BuilderPages,
  PublishQueue,
  ReusableComponents,
  Sections,
  BuilderSEO,
  Templates,
  Themes,
  Translations,
]

export default collections
