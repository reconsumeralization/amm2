// src/payload/collections/system/Settings.ts
import type { CollectionConfig } from 'payload';
import { withDefaultHooks } from '../../utils';

export const Settings: CollectionConfig = withDefaultHooks({
  slug: 'settings',
  admin: {
    useAsTitle: 'name',
    group: 'Admin',
    description: 'Global and tenant-specific settings for ModernMen features.',
    defaultColumns: ['name', 'tenant', 'updatedAt'],
    listSearchableFields: ['name'],
  },
  access: {
    read: ({ req }: any) => {
      if (!req.user) return false;
      return (req.user as any)?.role === 'admin' || (req.user as any)?.role === 'manager';
    },
    create: ({ req }: any) => {
      if (!req.user) return false;
      return (req.user as any)?.role === 'admin' || (req.user as any)?.role === 'manager';
    },
    update: ({ req }: any) => {
      if (!req.user) return false;
      return (req.user as any)?.role === 'admin' || (req.user as any)?.role === 'manager';
    },
    delete: ({ req }: any) => {
      if (!req.user) return false;
      return (req.user as any)?.role === 'admin'; // Only admins can delete settings
    },
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      defaultValue: 'Global Settings',
      admin: {
        description: 'Name for this settings configuration',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants' as any as any,
      admin: { 
        description: 'Leave blank for global settings.' 
      },
    },
    {
      name: 'chatbot',
      type: 'group',
      admin: {
        description: 'Configure AI-powered chatbot functionality',
      },
      fields: [
        { 
          name: 'enabled', 
          type: 'checkbox', 
          defaultValue: true,
          admin: {
            description: 'Enable chatbot functionality',
          },
        },
        {
          name: 'displayPaths',
          type: 'array',
          fields: [{ 
            name: 'path', 
            type: 'text', 
            required: true,
            admin: {
              description: 'URL path where chatbot should appear',
            },
          }],
          defaultValue: [{ path: '/portal' }, { path: '/book' }, { path: '/services' }],
          admin: {
            description: 'Pages where the chatbot will be displayed',
          },
        },
        {
          name: 'roles',
          type: 'select',
          hasMany: true,
          options: ['customer', 'staff', 'admin'],
          defaultValue: ['customer', 'staff'],
          admin: {
            description: 'User roles that can access the chatbot',
          },
        },
        {
          name: 'aiTriggers',
          type: 'group',
          admin: {
            description: 'Configure when the chatbot should automatically appear',
          },
          fields: [
            { 
              name: 'pendingAppointments', 
              type: 'checkbox', 
              defaultValue: true,
              admin: {
                description: 'Trigger chatbot for pending appointments',
              },
            },
            { 
              name: 'staffAvailability', 
              type: 'checkbox', 
              defaultValue: true,
              admin: {
                description: 'Trigger chatbot based on staff availability',
              },
            },
            { 
              name: 'userActivityThreshold', 
              type: 'number', 
              defaultValue: 5, 
              admin: { 
                description: 'Minutes of inactivity before hiding chatbot.' 
              } 
            },
            { 
              name: 'pageScrollTrigger', 
              type: 'number', 
              defaultValue: 50, 
              admin: { 
                description: 'Percentage of page scroll before showing chatbot.' 
              } 
            },
            { 
              name: 'exitIntentTrigger', 
              type: 'checkbox', 
              defaultValue: true,
              admin: {
                description: 'Show chatbot when user attempts to leave page',
              },
            },
          ],
        },
        {
          name: 'styles',
          type: 'group',
          admin: {
            description: 'Customize chatbot appearance and styling',
          },
          fields: [
            { 
              name: 'position', 
              type: 'select', 
              options: ['bottom-right', 'bottom-left', 'top-right', 'top-left'], 
              defaultValue: 'bottom-right',
              admin: {
                description: 'Position of the chatbot widget on screen',
              },
            },
            { 
              name: 'backgroundColor', 
              type: 'text', 
              defaultValue: '#ffffff',
              admin: {
                description: 'Background color of the chatbot widget',
              },
            },
            { 
              name: 'primaryColor', 
              type: 'text', 
              defaultValue: '#2563eb',
              admin: {
                description: 'Primary color for buttons and accents',
              },
            },
            { 
              name: 'textColor', 
              type: 'text', 
              defaultValue: '#1f2937',
              admin: {
                description: 'Text color for chatbot messages',
              },
            },
            { 
              name: 'borderRadius', 
              type: 'text', 
              defaultValue: '12px',
              admin: {
                description: 'Border radius for the chatbot widget',
              },
            },
            { 
              name: 'maxWidth', 
              type: 'text', 
              defaultValue: '400px',
              admin: {
                description: 'Maximum width of the chatbot widget',
              },
            },
            { 
              name: 'maxHeight', 
              type: 'text', 
              defaultValue: '600px',
              admin: {
                description: 'Maximum height of the chatbot widget',
              },
            },
            { 
              name: 'animation', 
              type: 'select', 
              options: ['none', 'fade', 'slide', 'bounce'], 
              defaultValue: 'fade',
              admin: {
                description: 'Animation style for chatbot appearance',
              },
            },
            { 
              name: 'shadow', 
              type: 'text', 
              defaultValue: '0 10px 25px rgba(0, 0, 0, 0.1)',
              admin: {
                description: 'Box shadow for the chatbot widget',
              },
            },
          ],
        },
        {
          name: 'behavior',
          type: 'group',
          admin: {
            description: 'Configure chatbot behavior and interactions',
          },
          fields: [
            { 
              name: 'autoOpen', 
              type: 'checkbox', 
              defaultValue: false,
              admin: {
                description: 'Automatically open chatbot on page load',
              },
            },
            { 
              name: 'autoOpenDelay', 
              type: 'number', 
              defaultValue: 3000,
              admin: {
                description: 'Delay in milliseconds before auto-opening chatbot',
              },
            },
            { 
              name: 'welcomeMessage', 
              type: 'textarea', 
              defaultValue: 'Hello! I\'m your ModernMen assistant. I can help you book appointments, check schedules, or answer questions about our services. How can I help you today?',
              admin: {
                description: 'Initial message displayed when chatbot opens',
                rows: 3,
              },
            },
            { 
              name: 'typingIndicator', 
              type: 'checkbox', 
              defaultValue: true,
              admin: {
                description: 'Show typing indicator when AI is responding',
              },
            },
            { 
              name: 'soundEnabled', 
              type: 'checkbox', 
              defaultValue: false,
              admin: {
                description: 'Enable sound notifications for new messages',
              },
            },
            { 
              name: 'persistConversation', 
              type: 'checkbox', 
              defaultValue: true,
              admin: {
                description: 'Remember conversation history across sessions',
              },
            },
            { 
              name: 'maxMessageHistory', 
              type: 'number', 
              defaultValue: 50,
              admin: {
                description: 'Maximum number of messages to keep in history',
              },
            },
          ],
        },
        {
          name: 'quickReplies',
          type: 'array',
          fields: [
            { 
              name: 'text', 
              type: 'text', 
              required: true,
              admin: {
                description: 'Quick reply button text',
              },
            },
            { 
              name: 'response', 
              type: 'textarea',
              admin: {
                description: 'Automated response when this quick reply is selected',
                rows: 2,
              },
            },
          ],
          defaultValue: [
            { text: 'Book Appointment', response: 'I\'d be happy to help you book an appointment. What service are you interested in?' },
            { text: 'Check Hours', response: 'We\'re open Monday-Saturday 9AM-7PM, and Sunday 10AM-5PM.' },
            { text: 'View Services', response: 'We offer haircuts, beard trims, styling, and more. Would you like to see our full service menu?' },
          ],
          admin: {
            description: 'Pre-defined quick reply options for common questions',
          },
        },
      ],
    },
    {
      name: 'clock',
      type: 'group',
      admin: {
        description: 'Configure time tracking and clock-in/out functionality',
      },
      fields: [
        { 
          name: 'enabled', 
          type: 'checkbox', 
          defaultValue: true,
          admin: {
            description: 'Enable time clock functionality',
          },
        },
        {
          name: 'notifications',
          type: 'group',
          admin: {
            description: 'Configure notifications for clock events',
          },
          fields: [
            { 
              name: 'emailAdmins', 
              type: 'checkbox', 
              defaultValue: true,
              admin: {
                description: 'Send email notifications to admins for clock events',
              },
            },
            { 
              name: 'emailTemplate', 
              type: 'textarea', 
              defaultValue: '<p>{{staffName}} {{action}} at {{timestamp}}.</p>',
              admin: {
                description: 'Email template for clock notifications',
                rows: 3,
              },
            },
            { 
              name: 'googleCalendarSync', 
              type: 'checkbox', 
              defaultValue: true,
              admin: {
                description: 'Sync clock events with Google Calendar',
              },
            },
            { 
              name: 'slackWebhook', 
              type: 'text',
              admin: {
                description: 'Slack webhook URL for clock notifications',
              },
            },
          ],
        },
        {
          name: 'shiftRules',
          type: 'group',
          admin: {
            description: 'Configure shift and working hour rules',
          },
          fields: [
            { 
              name: 'minShiftHours', 
              type: 'number', 
              defaultValue: 4,
              admin: {
                description: 'Minimum hours for a shift',
              },
            },
            { 
              name: 'maxShiftHours', 
              type: 'number', 
              defaultValue: 8,
              admin: {
                description: 'Maximum hours for a shift',
              },
            },
            { 
              name: 'maxWeeklyHours', 
              type: 'number', 
              defaultValue: 40,
              admin: {
                description: 'Maximum weekly hours for staff',
              },
            },
            { 
              name: 'overtimeThreshold', 
              type: 'number', 
              defaultValue: 40,
              admin: {
                description: 'Hours threshold for overtime calculation',
              },
            },
            { 
              name: 'breakDuration', 
              type: 'number', 
              defaultValue: 30,
              admin: {
                description: 'Default break duration in minutes',
              },
            },
            { 
              name: 'autoBreakAfterHours', 
              type: 'number', 
              defaultValue: 6,
              admin: {
                description: 'Automatically suggest break after this many hours',
              },
            },
          ],
        },
        {
          name: 'geofencing',
          type: 'group',
          admin: {
            description: 'Location-based clock-in restrictions',
          },
          fields: [
            { 
              name: 'enabled', 
              type: 'checkbox', 
              defaultValue: false,
              admin: {
                description: 'Enable location-based clock restrictions',
              },
            },
            { 
              name: 'latitude', 
              type: 'number',
              admin: {
                description: 'Business location latitude',
              },
            },
            { 
              name: 'longitude', 
              type: 'number',
              admin: {
                description: 'Business location longitude',
              },
            },
            { 
              name: 'radius', 
              type: 'number', 
              defaultValue: 100,
              admin: {
                description: 'Allowed radius in meters for clock-in',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'editor',
      type: 'group',
      admin: {
        description: 'Configure content editor settings and plugins',
      },
      fields: [
        { 
          name: 'enabledPlugins', 
          type: 'select', 
          hasMany: true, 
          options: ['image', 'serviceTemplate', 'productEmbed', 'aiContent', 'hairSimulator', 'pageBuilder', 'imageEditor', 'videoEmbed', 'socialMedia', 'analytics'], 
          defaultValue: ['image', 'serviceTemplate', 'productEmbed', 'aiContent', 'hairSimulator', 'pageBuilder', 'imageEditor'],
          admin: {
            description: 'Available plugins for the content editor',
          },
        },
        {
          name: 'theme',
          type: 'group',
          admin: {
            description: 'Customize editor theme and styling',
          },
          fields: [
            { 
              name: 'heading', 
              type: 'text', 
              defaultValue: 'text-2xl font-bold',
              admin: {
                description: 'CSS classes for heading styles',
              },
            },
            { 
              name: 'subheading', 
              type: 'text', 
              defaultValue: 'text-xl font-semibold',
              admin: {
                description: 'CSS classes for subheading styles',
              },
            },
            { 
              name: 'paragraph', 
              type: 'text', 
              defaultValue: 'text-base leading-relaxed',
              admin: {
                description: 'CSS classes for paragraph styles',
              },
            },
            { 
              name: 'link', 
              type: 'text', 
              defaultValue: 'text-blue-500 underline hover:text-blue-700',
              admin: {
                description: 'CSS classes for link styles',
              },
            },
            { 
              name: 'fontFamily', 
              type: 'text', 
              defaultValue: 'Inter, sans-serif',
              admin: {
                description: 'Default font family for editor content',
              },
            },
            { 
              name: 'fontSize', 
              type: 'text', 
              defaultValue: '16px',
              admin: {
                description: 'Default font size for editor content',
              },
            },
            { 
              name: 'lineHeight', 
              type: 'text', 
              defaultValue: '1.6',
              admin: {
                description: 'Default line height for editor content',
              },
            },
          ],
        },
        {
          name: 'imageOptimization',
          type: 'group',
          admin: {
            description: 'Configure image upload and optimization settings',
          },
          fields: [
            { 
              name: 'maxImageSize', 
              type: 'number', 
              defaultValue: 5242880, 
              admin: { 
                description: 'Max image upload size in bytes (default: 5MB).' 
              } 
            },
            {
              name: 'responsiveSizes',
              type: 'array',
              fields: [
                { 
                  name: 'width', 
                  type: 'number', 
                  required: true, 
                  admin: { 
                    description: 'Width in pixels.' 
                  } 
                },
                { 
                  name: 'label', 
                  type: 'text', 
                  required: true, 
                  admin: { 
                    description: 'e.g., mobile, tablet, desktop' 
                  } 
                },
              ],
              defaultValue: [
                { width: 320, label: 'mobile' },
                { width: 768, label: 'tablet' },
                { width: 1200, label: 'desktop' },
                { width: 1920, label: 'large-desktop' },
              ],
              admin: {
                description: 'Responsive image sizes for optimization',
              },
            },
            { 
              name: 'formats', 
              type: 'select', 
              hasMany: true, 
              options: ['jpeg', 'png', 'webp', 'avif'], 
              defaultValue: ['jpeg', 'webp'],
              admin: {
                description: 'Supported image formats',
              },
            },
            { 
              name: 'quality', 
              type: 'number', 
              defaultValue: 80, 
              admin: { 
                description: 'Image quality (1-100) for lossy formats.' 
              } 
            },
            { 
              name: 'autoOptimize', 
              type: 'checkbox', 
              defaultValue: true,
              admin: {
                description: 'Automatically optimize images on upload',
              },
            },
            { 
              name: 'lazyLoading', 
              type: 'checkbox', 
              defaultValue: true,
              admin: {
                description: 'Enable lazy loading for images',
              },
            },
          ],
        },
        {
          name: 'imageEditor',
          type: 'group',
          admin: {
            description: 'Configure built-in image editing capabilities',
          },
          fields: [
            { 
              name: 'enabled', 
              type: 'checkbox', 
              defaultValue: true,
              admin: {
                description: 'Enable image editing functionality',
              },
            },
            {
              name: 'effects',
              type: 'select',
              hasMany: true,
              options: ['brightness', 'contrast', 'grayscale', 'sepia', 'blur', 'sharpen', 'vintage', 'vignette'],
              defaultValue: ['brightness', 'contrast', 'grayscale', 'sepia'],
              admin: { 
                description: 'Available image editing effects.' 
              },
            },
            {
              name: 'cropAspectRatios',
              type: 'array',
              fields: [
                { 
                  name: 'label', 
                  type: 'text', 
                  required: true,
                  admin: {
                    description: 'Display name for aspect ratio',
                  },
                },
                { 
                  name: 'ratio', 
                  type: 'text', 
                  required: true,
                  admin: {
                    description: 'Aspect ratio (e.g., 16:9, 1:1, 4:3)',
                  },
                },
              ],
              defaultValue: [
                { label: 'Square', ratio: '1:1' },
                { label: 'Landscape', ratio: '16:9' },
                { label: 'Portrait', ratio: '9:16' },
                { label: 'Standard', ratio: '4:3' },
              ],
              admin: {
                description: 'Available crop aspect ratios',
              },
            },
          ],
        },
        {
          name: 'pageBuilder',
          type: 'group',
          admin: {
            description: 'Configure drag-and-drop page builder',
          },
          fields: [
            { 
              name: 'enabled', 
              type: 'checkbox', 
              defaultValue: true,
              admin: {
                description: 'Enable page builder functionality',
              },
            },
            {
              name: 'components',
              type: 'select',
              hasMany: true,
              options: ['text', 'image', 'button', 'bookingChatbot', 'barberProfile', 'testimonial', 'gallery', 'video', 'map', 'contact-form', 'pricing-table', 'faq'],
              defaultValue: ['text', 'image', 'button', 'bookingChatbot', 'barberProfile', 'testimonial', 'gallery'],
              admin: { 
                description: 'Available components for page builder.' 
              },
            },
            {
              name: 'templates',
              type: 'array',
              fields: [
                { 
                  name: 'name', 
                  type: 'text', 
                  required: true,
                  admin: {
                    description: 'Template name',
                  },
                },
                { 
                  name: 'description', 
                  type: 'textarea',
                  admin: {
                    description: 'Template description',
                    rows: 2,
                  },
                },
                { 
                  name: 'category', 
                  type: 'select',
                  options: ['landing', 'service', 'about', 'contact', 'blog'],
                  admin: {
                    description: 'Template category',
                  },
                },
              ],
              defaultValue: [
                { name: 'Service Landing', description: 'Landing page for barbershop services', category: 'landing' },
                { name: 'About Us', description: 'About page template', category: 'about' },
              ],
              admin: {
                description: 'Pre-built page templates',
              },
            },
          ],
        },
        {
          name: 'aiContent',
          type: 'group',
          admin: {
            description: 'Configure AI-powered content generation',
          },
          fields: [
            { 
              name: 'enabled', 
              type: 'checkbox', 
              defaultValue: true,
              admin: {
                description: 'Enable AI content generation',
              },
            },
            { 
              name: 'contentTypes', 
              type: 'select', 
              hasMany: true, 
              options: ['blog-posts', 'service-descriptions', 'social-media', 'email-templates', 'product-descriptions'], 
              defaultValue: ['blog-posts', 'service-descriptions'],
              admin: {
                description: 'Types of content AI can generate',
              },
            },
            { 
              name: 'toneOptions', 
              type: 'select', 
              hasMany: true, 
              options: ['professional', 'casual', 'friendly', 'authoritative', 'creative'], 
              defaultValue: ['professional', 'friendly'],
              admin: {
                description: 'Available tone options for AI content',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'barberProfiles',
      type: 'group',
      admin: {
        description: 'Configure barber profile features and social interactions',
      },
      fields: [
        { 
          name: 'enabled', 
          type: 'checkbox', 
          defaultValue: true,
          admin: {
            description: 'Enable barber profile functionality',
          },
        },
        { 
          name: 'allowComments', 
          type: 'checkbox', 
          defaultValue: true,
          admin: {
            description: 'Allow comments on barber profiles',
          },
        },
        { 
          name: 'allowLikes', 
          type: 'checkbox', 
          defaultValue: true,
          admin: {
            description: 'Allow likes on barber profiles',
          },
        },
        { 
          name: 'allowSharing', 
          type: 'checkbox', 
          defaultValue: true,
          admin: {
            description: 'Allow sharing of barber profiles',
          },
        },
        { 
          name: 'allowFollow', 
          type: 'checkbox', 
          defaultValue: true,
          admin: {
            description: 'Allow following barber profiles',
          },
        },
        { 
          name: 'allowRatings', 
          type: 'checkbox', 
          defaultValue: true,
          admin: {
            description: 'Allow rating barber profiles',
          },
        },
        { 
          name: 'maxPhotos', 
          type: 'number', 
          defaultValue: 20,
          admin: {
            description: 'Maximum photos per barber profile',
          },
        },
        { 
          name: 'moderateComments', 
          type: 'checkbox', 
          defaultValue: false,
          admin: {
            description: 'Require comment moderation before publishing',
          },
        },
        {
          name: 'socialLinks',
          type: 'array',
          fields: [
            { 
              name: 'platform', 
              type: 'select',
              options: ['instagram', 'facebook', 'twitter', 'tiktok', 'youtube', 'linkedin'],
              required: true,
              admin: {
                description: 'Social media platform',
              },
            },
            { 
              name: 'enabled', 
              type: 'checkbox', 
              defaultValue: true,
              admin: {
                description: 'Allow this social platform on profiles',
              },
            },
          ],
          defaultValue: [
            { platform: 'instagram', enabled: true },
            { platform: 'facebook', enabled: true },
            { platform: 'twitter', enabled: false },
          ],
          admin: {
            description: 'Available social media platforms for barber profiles',
          },
        },
      ],
    },
    {
      name: 'barbershop',
      type: 'group',
      admin: {
        description: 'Configure barbershop services, loyalty program, and features',
      },
      fields: [
        {
          name: 'services',
          type: 'array',
          fields: [
            { 
              name: 'name', 
              type: 'text', 
              required: true,
              admin: {
                description: 'Service name',
              },
            },
            { 
              name: 'description', 
              type: 'textarea',
              admin: {
                description: 'Service description',
                rows: 2,
              },
            },
            { 
              name: 'price', 
              type: 'number',
              admin: {
                description: 'Service price',
              },
            },
            { 
              name: 'duration', 
              type: 'number', 
              admin: { 
                description: 'Duration in minutes.' 
              } 
            },
            { 
              name: 'category', 
              type: 'select',
              options: ['haircut', 'beard', 'styling', 'treatment', 'package'],
              admin: {
                description: 'Service category',
              },
            },
            { 
              name: 'skillLevel', 
              type: 'select',
              options: ['junior', 'senior', 'master'],
              defaultValue: 'senior',
              admin: {
                description: 'Required skill level for this service',
              },
            },
          ],
          defaultValue: [
            { name: 'Haircut', description: 'Precision haircut with wash.', price: 30, duration: 30, category: 'haircut', skillLevel: 'senior' },
            { name: 'Beard Trim', description: 'Groomed beard with oil.', price: 20, duration: 15, category: 'beard', skillLevel: 'junior' },
            { name: 'Hot Towel Shave', description: 'Traditional hot towel shave experience.', price: 40, duration: 45, category: 'treatment', skillLevel: 'master' },
          ],
          admin: {
            description: 'Available barbershop services',
          },
        },
        {
          name: 'loyalty',
          type: 'group',
          admin: {
            description: 'Configure customer loyalty and rewards program',
          },
          fields: [
            { 
              name: 'enabled', 
              type: 'checkbox', 
              defaultValue: true,
              admin: {
                description: 'Enable loyalty program',
              },
            },
            { 
              name: 'pointsPerBooking', 
              type: 'number', 
              defaultValue: 10,
              admin: {
                description: 'Points awarded per booking',
              },
            },
            { 
              name: 'pointsPerDollar', 
              type: 'number', 
              defaultValue: 1,
              admin: {
                description: 'Points awarded per dollar spent',
              },
            },
            { 
              name: 'pointsPerReferral', 
              type: 'number', 
              defaultValue: 50,
              admin: {
                description: 'Points awarded per successful referral',
              },
            },
            { 
              name: 'badgeThreshold', 
              type: 'number', 
              defaultValue: 100,
              admin: {
                description: 'Points required for loyalty badge',
              },
            },
            { 
              name: 'rewardThreshold', 
              type: 'number', 
              defaultValue: 200,
              admin: {
                description: 'Points required for reward redemption',
              },
            },
            { 
              name: 'rewardDiscount', 
              type: 'number', 
              defaultValue: 10, 
              admin: { 
                description: 'Discount percentage for reward redemption.' 
              } 
            },
            { 
              name: 'birthdayBonus', 
              type: 'number', 
              defaultValue: 25,
              admin: {
                description: 'Bonus points awarded on customer birthday',
              },
            },
            { 
              name: 'anniversaryBonus', 
              type: 'number', 
              defaultValue: 50,
              admin: {
                description: 'Bonus points awarded on customer anniversary',
              },
            },
          ],
        },
        {
          name: 'simulator',
          type: 'group',
          admin: {
            description: 'Configure AI-powered hair style simulator',
          },
          fields: [
            { 
              name: 'enabled', 
              type: 'checkbox', 
              defaultValue: true,
              admin: {
                description: 'Enable hair simulator functionality',
              },
            },
            { 
              name: 'styles', 
              type: 'array', 
              fields: [
                { 
                  name: 'style', 
                  type: 'text',
                  required: true,
                  admin: {
                    description: 'Hair style name',
                  },
                },
                { 
                  name: 'category', 
                  type: 'select',
                  options: ['classic', 'modern', 'trendy', 'formal', 'casual'],
                  admin: {
                    description: 'Style category',
                  },
                },
                { 
                  name: 'difficulty', 
                  type: 'select',
                  options: ['easy', 'medium', 'hard'],
                  admin: {
                    description: 'Styling difficulty',
                  },
                },
              ], 
              defaultValue: [
                { style: 'Classic Fade', category: 'classic', difficulty: 'medium' },
                { style: 'Modern Pompadour', category: 'modern', difficulty: 'hard' },
                { style: 'Textured Crop', category: 'trendy', difficulty: 'easy' },
              ],
              admin: {
                description: 'Available hair styles for simulation',
              },
            },
            { 
              name: 'maxImageResolution', 
              type: 'number', 
              defaultValue: 1024, 
              admin: { 
                description: 'Max resolution for simulator images (px).' 
              } 
            },
            { 
              name: 'processingTimeout', 
              type: 'number', 
              defaultValue: 30, 
              admin: { 
                description: 'Processing timeout in seconds.' 
              } 
            },
            { 
              name: 'allowSaveResults', 
              type: 'checkbox', 
              defaultValue: true,
              admin: {
                description: 'Allow users to save simulation results',
              },
            },
          ],
        },
        {
          name: 'events',
          type: 'group',
          admin: {
            description: 'Configure special events and group bookings',
          },
          fields: [
            { 
              name: 'enabled', 
              type: 'checkbox', 
              defaultValue: true,
              admin: {
                description: 'Enable events functionality',
              },
            },
            { 
              name: 'maxAttendees', 
              type: 'number', 
              defaultValue: 50,
              admin: {
                description: 'Maximum attendees per event',
              },
            },
            { 
              name: 'bookingWindowDays', 
              type: 'number', 
              defaultValue: 30,
              admin: {
                description: 'Days in advance events can be booked',
              },
            },
            { 
              name: 'requireDeposit', 
              type: 'checkbox', 
              defaultValue: true,
              admin: {
                description: 'Require deposit for event bookings',
              },
            },
            { 
              name: 'depositPercentage', 
              type: 'number', 
              defaultValue: 25,
              admin: {
                description: 'Deposit percentage required for events',
              },
            },
            { 
              name: 'cancellationPolicy', 
              type: 'textarea',
              defaultValue: 'Events can be cancelled up to 48 hours in advance for a full refund.',
              admin: {
                description: 'Event cancellation policy text',
                rows: 3,
              },
            },
          ],
        },
        {
          name: 'inventory',
          type: 'group',
          admin: {
            description: 'Configure product inventory and retail features',
          },
          fields: [
            { 
              name: 'enabled', 
              type: 'checkbox', 
              defaultValue: false,
              admin: {
                description: 'Enable inventory management',
              },
            },
            { 
              name: 'lowStockThreshold', 
              type: 'number', 
              defaultValue: 10,
              admin: {
                description: 'Low stock alert threshold',
              },
            },
            { 
              name: 'autoReorderEnabled', 
              type: 'checkbox', 
              defaultValue: false,
              admin: {
                description: 'Enable automatic reordering',
              },
            },
            { 
              name: 'trackExpiration', 
              type: 'checkbox', 
              defaultValue: true,
              admin: {
                description: 'Track product expiration dates',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'dashboard',
      type: 'group',
      admin: {
        description: 'Configure admin dashboard widgets and analytics',
      },
      fields: [
        { 
          name: 'enabledWidgets', 
          type: 'select', 
          hasMany: true, 
          options: ['appointments', 'revenue', 'clock', 'schedules', 'analytics', 'reviews', 'inventory', 'staff-performance'], 
          defaultValue: ['appointments', 'revenue', 'clock', 'schedules', 'analytics'],
          admin: {
            description: 'Widgets to display on dashboard',
          },
        },
        { 
          name: 'chartType', 
          type: 'select', 
          options: ['line', 'bar', 'area', 'pie', 'doughnut'], 
          defaultValue: 'line',
          admin: {
            description: 'Default chart type for dashboard',
          },
        },
        { 
          name: 'refreshInterval', 
          type: 'number', 
          defaultValue: 300, 
          admin: { 
            description: 'Dashboard refresh interval in seconds.' 
          } 
        },
        { 
          name: 'dateRange', 
          type: 'select', 
          options: ['7days', '30days', '90days', '1year'], 
          defaultValue: '30days',
          admin: {
            description: 'Default date range for analytics',
          },
        },
        { 
          name: 'showKPIs', 
          type: 'checkbox', 
          defaultValue: true,
          admin: {
            description: 'Show key performance indicators',
          },
        },
        {
          name: 'customMetrics',
          type: 'array',
          fields: [
            { 
              name: 'name', 
              type: 'text', 
              required: true,
              admin: {
                description: 'Metric name',
              },
            },
            { 
              name: 'query', 
              type: 'textarea',
              admin: {
                description: 'Database query for custom metric',
                rows: 3,
              },
            },
            { 
              name: 'chartType', 
              type: 'select',
              options: ['line', 'bar', 'area', 'number'],
              defaultValue: 'number',
              admin: {
                description: 'Display type for this metric',
              },
            },
          ],
          admin: {
            description: 'Custom metrics to track on dashboard',
          },
        },
      ],
    },
    {
      name: 'portal',
      type: 'group',
      admin: {
        description: 'Configure customer and staff portal features',
      },
      fields: [
        { 
          name: 'showServices', 
          type: 'checkbox', 
          defaultValue: true,
          admin: {
            description: 'Show services section in portal',
          },
        },
        { 
          name: 'showAppointments', 
          type: 'checkbox', 
          defaultValue: true,
          admin: {
            description: 'Show appointments section in portal',
          },
        },
        { 
          name: 'showTrends', 
          type: 'checkbox', 
          defaultValue: true,
          admin: {
            description: 'Show trends section in portal',
          },
        },
        { 
          name: 'showLoyalty', 
          type: 'checkbox', 
          defaultValue: true,
          admin: {
            description: 'Show loyalty points in portal',
          },
        },
        { 
          name: 'showReviews', 
          type: 'checkbox', 
          defaultValue: true,
          admin: {
            description: 'Show reviews section in portal',
          },
        },
        { 
          name: 'themeColor', 
          type: 'text', 
          defaultValue: '#2563eb',
          admin: {
            description: 'Primary theme color for portal',
          },
        },
        { 
          name: 'accentColor', 
          type: 'text', 
          defaultValue: '#10b981',
          admin: {
            description: 'Accent color for portal',
          },
        },
        { 
          name: 'allowProfileEdit', 
          type: 'checkbox', 
          defaultValue: true,
          admin: {
            description: 'Allow users to edit their profiles',
          },
        },
        { 
          name: 'allowAppointmentReschedule', 
          type: 'checkbox', 
          defaultValue: true,
          admin: {
            description: 'Allow users to reschedule appointments',
          },
        },
        { 
          name: 'rescheduleTimeLimit', 
          type: 'number', 
          defaultValue: 24,
          admin: {
            description: 'Hours before appointment when rescheduling is allowed',
          },
        },
      ],
    },
    {
      name: 'email',
      type: 'group',
      admin: {
        description: 'Configure email settings and templates',
      },
      fields: [
        { 
          name: 'fromAddress', 
          type: 'text', 
          defaultValue: 'no-reply@modernmen.com',
          admin: {
            description: 'Default from email address',
          },
        },
        { 
          name: 'fromName', 
          type: 'text', 
          defaultValue: 'ModernMen',
          admin: {
            description: 'Default from name',
          },
        },
        { 
          name: 'replyToAddress', 
          type: 'text',
          admin: {
            description: 'Reply-to email address',
          },
        },
        { 
          name: 'signature', 
          type: 'textarea', 
          defaultValue: 'Best regards,\nThe ModernMen Team',
          admin: {
            description: 'Default email signature',
            rows: 3,
          },
        },
        { 
          name: 'enableNotifications', 
          type: 'checkbox', 
          defaultValue: true,
          admin: {
            description: 'Enable email notifications',
          },
        },
        {
          name: 'templates',
          type: 'group',
          admin: {
            description: 'Email template configurations',
          },
          fields: [
            { 
              name: 'appointmentConfirmation', 
              type: 'textarea',
              defaultValue: 'Your appointment has been confirmed for {{date}} at {{time}} with {{barber}}.',
              admin: {
                description: 'Appointment confirmation email template',
                rows: 3,
              },
            },
            { 
              name: 'appointmentReminder', 
              type: 'textarea',
              defaultValue: 'Reminder: You have an appointment tomorrow at {{time}} with {{barber}}.',
              admin: {
                description: 'Appointment reminder email template',
                rows: 3,
              },
            },
            { 
              name: 'appointmentCancellation', 
              type: 'textarea',
              defaultValue: 'Your appointment scheduled for {{date}} at {{time}} has been cancelled.',
              admin: {
                description: 'Appointment cancellation email template',
                rows: 3,
              },
            },
            { 
              name: 'welcomeEmail', 
              type: 'textarea',
              defaultValue: 'Welcome to ModernMen! We\'re excited to have you as a customer.',
              admin: {
                description: 'Welcome email template for new customers',
                rows: 3,
              },
            },
          ],
        },
        {
          name: 'automation',
          type: 'group',
          admin: {
            description: 'Email automation settings',
          },
          fields: [
            { 
              name: 'reminderHours', 
              type: 'number', 
              defaultValue: 24,
              admin: {
                description: 'Hours before appointment to send reminder',
              },
            },
            { 
              name: 'followUpDays', 
              type: 'number', 
              defaultValue: 7,
              admin: {
                description: 'Days after appointment to send follow-up',
              },
            },
            { 
              name: 'birthdayEmails', 
              type: 'checkbox', 
              defaultValue: true,
              admin: {
                description: 'Send birthday emails to customers',
              },
            },
            { 
              name: 'loyaltyEmails', 
              type: 'checkbox', 
              defaultValue: true,
              admin: {
                description: 'Send loyalty program emails',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'stripe',
      type: 'group',
      admin: {
        description: 'Configure Stripe payment processing',
      },
      fields: [
        { 
          name: 'currency', 
          type: 'text', 
          defaultValue: 'usd', 
          required: true,
          admin: {
            description: 'Default currency for payments',
          },
        },
        { 
          name: 'taxRate', 
          type: 'number', 
          defaultValue: 0.1, 
          admin: { 
            description: 'Tax rate as a decimal (e.g., 0.1 for 10%).' 
          } 
        },
        { 
          name: 'webhookSecret', 
          type: 'text', 
          admin: { 
            description: 'Stripe webhook secret for payment verification.' 
          } 
        },
        { 
          name: 'successUrl', 
          type: 'text', 
          defaultValue: '/booking/success',
          admin: {
            description: 'URL to redirect after successful payment',
          },
        },
        { 
          name: 'cancelUrl', 
          type: 'text', 
          defaultValue: '/booking/cancel',
          admin: {
            description: 'URL to redirect after cancelled payment',
          },
        },
        { 
          name: 'allowTips', 
          type: 'checkbox', 
          defaultValue: true,
          admin: {
            description: 'Allow customers to add tips during payment',
          },
        },
        {
          name: 'tipOptions',
          type: 'array',
          fields: [
            { 
              name: 'percentage', 
              type: 'number', 
              required: true,
              admin: {
                description: 'Tip percentage option',
              },
            },
          ],
          defaultValue: [
            { percentage: 15 },
            { percentage: 18 },
            { percentage: 20 },
            { percentage: 25 },
          ],
          admin: {
            description: 'Pre-defined tip percentage options',
          },
        },
        { 
          name: 'savePaymentMethods', 
          type: 'checkbox', 
          defaultValue: true,
          admin: {
            description: 'Allow customers to save payment methods',
          },
        },
        { 
          name: 'requireCVV', 
          type: 'checkbox', 
          defaultValue: true,
          admin: {
            description: 'Require CVV for saved payment methods',
          },
        },
      ],
    },
    {
      name: 'googleCalendar',
      type: 'group',
      admin: {
        description: 'Configure Google Calendar integration',
      },
      fields: [
        { 
          name: 'enabled', 
          type: 'checkbox', 
          defaultValue: true,
          admin: {
            description: 'Enable Google Calendar integration',
          },
        },
        { 
          name: 'calendarId', 
          type: 'text', 
          defaultValue: 'primary', 
          required: true,
          admin: {
            description: 'Google Calendar ID to sync with',
          },
        },
        { 
          name: 'eventPrefix', 
          type: 'text', 
          defaultValue: 'ModernMen - ',
          admin: {
            description: 'Prefix for calendar event titles',
          },
        },
        { 
          name: 'timezone', 
          type: 'text', 
          defaultValue: 'America/New_York',
          admin: {
            description: 'Default timezone for calendar events',
          },
        },
        { 
          name: 'syncInterval', 
          type: 'number', 
          defaultValue: 300, 
          admin: { 
            description: 'Sync interval in seconds.' 
          } 
        },
        { 
          name: 'createMeetLinks', 
          type: 'checkbox', 
          defaultValue: false,
          admin: {
            description: 'Create Google Meet links for virtual consultations',
          },
        },
        { 
          name: 'sendInvites', 
          type: 'checkbox', 
          defaultValue: true,
          admin: {
            description: 'Send calendar invites to customers',
          },
        },
        { 
          name: 'reminderMinutes', 
          type: 'array',
          fields: [
            { 
              name: 'minutes', 
              type: 'number', 
              required: true,
              admin: {
                description: 'Minutes before event to send reminder',
              },
            },
          ],
          defaultValue: [
            { minutes: 60 },
            { minutes: 1440 }, // 24 hours
          ],
          admin: {
            description: 'Calendar reminder times',
          },
        },
      ],
    },
    {
      name: 'ai',
      type: 'group',
      admin: {
        description: 'Configure AI and machine learning features',
      },
      fields: [
        { 
          name: 'model', 
          type: 'text', 
          defaultValue: 'gpt-3.5-turbo',
          admin: {
            description: 'AI model to use for content generation',
          },
        },
        { 
          name: 'maxTokens', 
          type: 'number', 
          defaultValue: 500,
          admin: {
            description: 'Maximum tokens for AI responses',
          },
        },
        { 
          name: 'temperature', 
          type: 'number', 
          defaultValue: 0.7, 
          admin: { 
            description: 'AI response creativity (0 to 1).' 
          } 
        },
        { 
          name: 'enablePersonalization', 
          type: 'checkbox', 
          defaultValue: true,
          admin: {
            description: 'Enable AI-powered personalization',
          },
        },
        { 
          name: 'enableRecommendations', 
          type: 'checkbox', 
          defaultValue: true,
          admin: {
            description: 'Enable AI service recommendations',
          },
        },
        { 
          name: 'enableSentimentAnalysis', 
          type: 'checkbox', 
          defaultValue: false,
          admin: {
            description: 'Enable sentiment analysis for reviews',
          },
        },
        {
          name: 'prompts',
          type: 'group',
          admin: {
            description: 'AI prompt templates for different use cases',
          },
          fields: [
            { 
              name: 'serviceRecommendation', 
              type: 'textarea',
              defaultValue: 'Based on the customer\'s hair type and preferences, recommend the best services.',
              admin: {
                description: 'Prompt for service recommendations',
                rows: 3,
              },
            },
            { 
              name: 'contentGeneration', 
              type: 'textarea',
              defaultValue: 'Generate engaging content about barbershop services and trends.',
              admin: {
                description: 'Prompt for content generation',
                rows: 3,
              },
            },
            { 
              name: 'customerSupport', 
              type: 'textarea',
              defaultValue: 'Provide helpful and friendly customer support responses.',
              admin: {
                description: 'Prompt for customer support chatbot',
                rows: 3,
              },
            },
          ],
        },
      ],
    },
    {
      name: 'analytics',
      type: 'group',
      admin: {
        description: 'Configure analytics and tracking',
      },
      fields: [
        { 
          name: 'googleAnalyticsId', 
          type: 'text',
          admin: {
            description: 'Google Analytics tracking ID',
          },
        },
        { 
          name: 'facebookPixelId', 
          type: 'text',
          admin: {
            description: 'Facebook Pixel ID for conversion tracking',
          },
        },
        { 
          name: 'enableHeatmaps', 
          type: 'checkbox', 
          defaultValue: false,
          admin: {
            description: 'Enable heatmap tracking',
          },
        },
        { 
          name: 'trackUserJourney', 
          type: 'checkbox', 
          defaultValue: true,
          admin: {
            description: 'Track user journey and behavior',
          },
        },
        { 
          name: 'enableABTesting', 
          type: 'checkbox', 
          defaultValue: false,
          admin: {
            description: 'Enable A/B testing capabilities',
          },
        },
        {
          name: 'customEvents',
          type: 'array',
          fields: [
            { 
              name: 'name', 
              type: 'text', 
              required: true,
              admin: {
                description: 'Event name',
              },
            },
            { 
              name: 'description', 
              type: 'textarea',
              admin: {
                description: 'Event description',
                rows: 2,
              },
            },
            { 
              name: 'category', 
              type: 'select',
              options: ['booking', 'engagement', 'conversion', 'retention'],
              admin: {
                description: 'Event category',
              },
            },
          ],
          admin: {
            description: 'Custom events to track',
          },
        },
      ],
    },
    {
      name: 'security',
      type: 'group',
      admin: {
        description: 'Configure security and privacy settings',
      },
      fields: [
        { 
          name: 'enableTwoFactor', 
          type: 'checkbox', 
          defaultValue: false,
          admin: {
            description: 'Enable two-factor authentication',
          },
        },
        { 
          name: 'sessionTimeout', 
          type: 'number', 
          defaultValue: 3600,
          admin: {
            description: 'Session timeout in seconds',
          },
        },
        { 
          name: 'maxLoginAttempts', 
          type: 'number', 
          defaultValue: 5,
          admin: {
            description: 'Maximum login attempts before lockout',
          },
        },
        { 
          name: 'lockoutDuration', 
          type: 'number', 
          defaultValue: 900,
          admin: {
            description: 'Account lockout duration in seconds',
          },
        },
        { 
          name: 'enableCaptcha', 
          type: 'checkbox', 
          defaultValue: true,
          admin: {
            description: 'Enable CAPTCHA for forms',
          },
        },
        { 
          name: 'dataRetentionDays', 
          type: 'number', 
          defaultValue: 2555, // 7 years
          admin: {
            description: 'Data retention period in days',
          },
        },
        { 
          name: 'enableGDPRCompliance', 
          type: 'checkbox', 
          defaultValue: true,
          admin: {
            description: 'Enable GDPR compliance features',
          },
        },
        { 
          name: 'cookieConsentRequired', 
          type: 'checkbox', 
          defaultValue: true,
          admin: {
            description: 'Require cookie consent',
          },
        },
      ],
    },
  ],
});
