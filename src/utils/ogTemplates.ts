// src/utils/ogTemplates.ts
export const ogTemplates: Record<string, string> = {
  // Blog & Content Collections
  'blog-posts': 'blogTemplate',
  'pages': 'blogTemplate',
  'documentation': 'blogTemplate',
  'business-documentation': 'blogTemplate',

  // Product Collections
  'products': 'productTemplate',
  'gift-cards': 'productTemplate',
  'service-packages': 'productTemplate',

  // Event Collections
  'events': 'eventTemplate',
  'promotions': 'eventTemplate',

  // Service Collections
  'services': 'serviceTemplate',
  'appointments': 'serviceTemplate',

  // Customer Collections
  'customers': 'customerTemplate',
  'users': 'customerTemplate',
  'testimonials': 'customerTemplate',

  // Default fallback
  'default': 'defaultTemplate',
};

// Template descriptions for documentation
export const templateDescriptions: Record<string, string> = {
  blogTemplate: 'Elegant layout with serif typography, perfect for articles and blog posts',
  productTemplate: 'Modern gradient background with shopping icon, ideal for products',
  eventTemplate: 'Centered layout with calendar icon, great for events and promotions',
  serviceTemplate: 'Clean white background with scissors icon, perfect for BarberShop services',
  customerTemplate: 'Light background with customer icon, suitable for testimonials and profiles',
  defaultTemplate: 'Universal dark background template that works for any content',
};

// Color schemes per collection type
export const collectionColors: Record<string, string> = {
  'blog-posts': '#2d3748',
  'products': '#4a5568',
  'services': '#38a169',
  'events': '#3182ce',
  'customers': '#805ad5',
  'testimonials': '#d53f8c',
  'default': '#1a202c',
};
