// src/payload/collections/index.ts
import { withDefaultHooks, withSlugField, withSEOFields } from '../utils';
import { generateOGImageHook } from '../hooks/generateOGImageHook';

// Import all collections by domain

// Commerce Collections
import { Coupons } from './commerce/Coupons';
import { GiftCards } from './commerce/GiftCards';
import { Invoices } from './commerce/Invoices';
import { Orders } from './commerce/Orders';
import { PaymentMethods } from './commerce/PaymentMethods';
import { Products } from './commerce/Products';
import { Promotions } from './commerce/Promotions';
import { Returns } from './commerce/Returns';
import { ShippingMethods } from './commerce/ShippingMethods';

// Content Collections
import { BlogPosts } from './content/BlogPosts';
import { Content } from './content/Content';
import { FAQ } from './content/FAQ';
import { Gallery } from './content/Gallery';
import { Media } from './content/Media';
import { MediaFolders } from './content/MediaFolders';
import { Navigation } from './content/Navigation';
import { Pages } from './content/Pages-main'; // Updated: using migrated collection
import { Redirects } from './content/Redirects-main'; // Updated: using migrated collection
import { NavigationMenus } from './content/NavigationMenus'; // Added: migrated from main collections
import { SEOSettings } from './content/SEOSettings';
import { Tags } from './content/Tags';

// CRM Collections
import { Cancellations } from './crm/Cancellations';
import { Contacts } from './crm/Contacts';
import { CustomerNotes } from './crm/CustomerNotes';
import { CustomerTags } from './crm/CustomerTags';
import { Customers } from './crm/Customers-main'; // Updated: using migrated collection
import { EmailCampaigns } from './crm/EmailCampaigns';
import { LoyaltyProgram } from './crm/LoyaltyProgram';
import { Reviews } from './crm/Reviews';
import { Subscriptions } from './crm/Subscriptions';
import { Testimonials } from './crm/Testimonials';
import { Appointments } from './crm/Appointments-main'; // Added: migrated from main collections

// Staff Collections
import { ClockRecords } from './staff/ClockRecords';
import { Commissions } from './staff/Commissions';
import { StaffRoles } from './staff/StaffRoles';
import { StaffSchedules } from './staff/StaffSchedules';
import { Stylists } from './staff/Stylists';
import { TimeOffRequests } from './staff/TimeOffRequests';

// System Collections
// Appointments moved to CRM domain (Appointments-main)
import { AuditLogs } from './system/AuditLogs';
import { BusinessDocumentation } from './system/BusinessDocumentation';
import { ChatConversations } from './system/ChatConversations';
import { ChatbotLogs } from './system/ChatbotLogs';
import { Documentation } from './system/Documentation';
import { DocumentationTemplates } from './system/DocumentationTemplates';
import { DocumentationWorkflows } from './system/DocumentationWorkflows';
import { EmailLogs } from './system/EmailLogs';
import { EditorPlugins } from './system/EditorPlugins';
import { EditorTemplates } from './system/EditorTemplates';
import { EditorThemes } from './system/EditorThemes';
import { Events } from './system/Events';
import { EventTracking } from './system/EventTracking';
import { FeatureFlags } from './system/FeatureFlags';
import { Integrations } from './system/Integrations';
import { Inventory } from './system/Inventory';
import { Locations } from './system/Locations';
import { MaintenanceRequests } from './system/MaintenanceRequests';
import { Notifications } from './system/Notifications';
import { PageViews } from './system/PageViews';
import { PushNotifications } from './system/PushNotifications';
import { RecurringAppointments } from './system/RecurringAppointments';
import { Resources } from './system/Resources';
import { RolesPermissions } from './system/RolesPermissions';
import { ServicePackages } from './system/ServicePackages';
import { Services } from './system/Services';
import { Settings } from './system/Settings';
import { SiteSections } from './system/SiteSections';
import { Tenants } from './system/Tenants';
import { Transactions } from './system/Transactions';
import { Users } from './system/Users';
import { WaitList } from './system/WaitList';
import { WebhookLogs } from './system/WebhookLogs';

// Visual Builder Collections
import { Animations } from './builder/Animations';
import { BlockRevisions } from './builder/BlockRevisions';
import { Blocks } from './builder/Blocks-main'; // Updated: using migrated collection
import { ConditionalRules } from './builder/ConditionalRules';
import { Drafts } from './builder/Drafts';
import { Forms } from './builder/Forms';
import { DynamicData } from './builder/DynamicData';
import { GlobalStyles } from './builder/GlobalStyles';
import { Integrations as BuilderIntegrations } from './builder/Integrations';
import { Layouts } from './builder/Layouts';
import { PageRevisions } from './builder/PageRevisions';
import { Pages as BuilderPages } from './builder/Pages';
import { PublishQueue } from './builder/PublishQueue';
import { ReusableComponents } from './builder/ReusableComponents';
import { Sections } from './builder/Sections';
import { SEO as BuilderSEO } from './builder/SEO';
import { Templates } from './builder/Templates';
import { Themes } from './builder/Themes';
import { BuilderTranslations as Translations } from './builder/Translations';

// Define collections that should have OG image generation
const collectionsWithOGImages = [
  'pages',
  'blog-posts',
  'products',
  'services',
  'events',
  'testimonials',
  'email-campaigns',
  'push-notifications',
  'shipping-methods',
  'payment-methods',
  'maintenance-requests',
  // Visual Builder Collections
  'pages', // Builder pages
  'sections',
  'blocks',
  'templates',
  'reusable-components'
];

// Raw collection definitions organized by domain
const rawCollections = [
  // Commerce Collections
  Coupons,
  GiftCards,
  Invoices,
  Orders,
  PaymentMethods,
  Products,
  Promotions,
  Returns,
  ShippingMethods,

  // Content Collections
  BlogPosts,
  Content,
  FAQ,
  Gallery,
  Media,
  MediaFolders,
  Navigation,
  Pages, // Migrated from main collections
  Redirects, // Migrated from main collections
  NavigationMenus, // Migrated from main collections
  SEOSettings,
  Tags,

  // CRM Collections
  Cancellations,
  Contacts,
  CustomerNotes,
  CustomerTags,
  Customers, // Migrated from main collections
  EmailCampaigns,
  LoyaltyProgram,
  Reviews,
  Subscriptions,
  Testimonials,
  Appointments, // Migrated from main collections

  // Staff Collections
  ClockRecords,
  Commissions,
  StaffRoles,
  StaffSchedules,
  Stylists,
  TimeOffRequests,

  // System Collections
  // Appointments moved to CRM domain
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

  // Visual Builder Collections
  Animations,
  BlockRevisions,
  Blocks, // Migrated from main collections
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
];

// Apply global utilities to all collections
const collections = rawCollections.map((collection) => {
  let enhancedCollection = withDefaultHooks(collection);
  enhancedCollection = withSlugField(enhancedCollection);
  enhancedCollection = withSEOFields(enhancedCollection);

  // Add OG image field to all collections with title
  const hasTitle = enhancedCollection.fields?.some((f: any) => f.name === 'title');
  if (hasTitle && !enhancedCollection.fields?.some((f: any) => f.name === 'ogImage')) {
    enhancedCollection.fields = [
      ...(enhancedCollection.fields || []),
      {
        name: 'ogImage',
        type: 'text',
        admin: {
          readOnly: true,
          description: 'Auto-generated Open Graph image URL',
          position: 'sidebar',
        },
      },
      {
        name: 'categoryColor',
        type: 'text',
        admin: {
          description: 'Hex color for OG image background (optional)',
          placeholder: '#1a1a1a',
        },
      },
      {
        name: 'logoUrl',
        type: 'text',
        admin: {
          description: 'Custom logo URL for OG image (optional)',
          placeholder: '/logo.png',
        },
      },
    ];
  }

  // Add OG image generation hook to collections with title
  if (hasTitle) {
    const userHooks = enhancedCollection.hooks || {};
    enhancedCollection.hooks = {
      ...userHooks,
      afterChange: [
        ...(userHooks.afterChange || []),
        generateOGImageHook({
          titleField: 'title',
          excerptField: 'excerpt',
          categoryField: 'category',
          categoryColorField: 'categoryColor',
          logoUrlField: 'logoUrl',
        }),
      ],
    };
  }

  return enhancedCollection;
});

export default collections;
