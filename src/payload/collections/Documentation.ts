/* @ts-ignore: Payload types may not be resolvable in this context */
type CollectionConfig = any;

// Helper function to check if user can manage documentation
const canManageDocumentation = (userRole?: string) => {
  return ['system_admin', 'developer', 'salon_owner'].includes(userRole || '');
};

// Helper function to check if user can edit business documentation
const canEditBusinessDocumentation = (userRole?: string) => {
  return ['system_admin', 'salon_owner'].includes(userRole || '');
};

// Helper function to check if user can approve documentation
const canApproveDocumentation = (userRole?: string) => {
  return ['system_admin', 'salon_owner'].includes(userRole || '');
};

export const Documentation: CollectionConfig = {
  slug: 'documentation',
  admin: {
    usTitle: 'title',
    defaultColumns: ['title', 'type', 'targetRole', 'status', 'priority', 'updatedAt'],
    group: 'Content Management',
    description: 'Manage business documentation, guides, and procedures',
    // Business users can access documentation management
    hidden: ({ user }: { user?: any }) => !canManageDocumentation(user?.role),
  },
  fields: [
    // Basic Information
    {
      name: 'title',
      type: 'text',
      required: true,
      admin: {
        description: 'The title of the documentation',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'URL-friendly version of the title',
      },
    },
    {
      name: 'excerpt',
      type: 'textarea',
      admin: {
        description: 'Brief summary of the documentation content',
      },
    },

    // Classification
    {
      name: 'type',
      type: 'select',
      options: [
        { label: 'Guide', value: 'guide' },
        { label: 'Procedure', value: 'procedure' },
        { label: 'Policy', value: 'policy' },
        { label: 'Training Material', value: 'training' },
        { label: 'FAQ', value: 'faq' },
        { label: 'Troubleshooting', value: 'troubleshooting' },
        { label: 'Announcement', value: 'announcement' },
        { label: 'Tutorial', value: 'tutorial' },
        { label: 'Checklist', value: 'checklist' },
        { label: 'Template', value: 'template' },
      ],
      required: true,
      admin: {
        description: 'Type of documentation content',
      },
    },
    {
      name: 'targetRole',
      type: 'select',
      options: [
        { label: 'Guest', value: 'guest' },
        { label: 'Salon Customer', value: 'salon_customer' },
        { label: 'Salon Employee', value: 'salon_employee' },
        { label: 'Salon Owner', value: 'salon_owner' },
        { label: 'Developer', value: 'developer' },
        { label: 'System Admin', value: 'system_admin' },
      ],
      required: true,
      admin: {
        description: 'Primary target audience for this documentation',
      },
    },
    {
      name: 'category',
      type: 'select',
      options: [
        { label: 'Salon Operations', value: 'salon-operations' },
        { label: 'Customer Service', value: 'customer-service' },
        { label: 'Booking Management', value: 'booking-management' },
        { label: 'Staff Training', value: 'staff-training' },
        { label: 'Safety Procedures', value: 'safety-procedures' },
        { label: 'Marketing', value: 'marketing' },
        { label: 'Financial Management', value: 'financial-management' },
        { label: 'Inventory Management', value: 'inventory-management' },
        { label: 'Compliance', value: 'compliance' },
        { label: 'Technology Setup', value: 'technology-setup' },
        { label: 'Emergency Procedures', value: 'emergency-procedures' },
        { label: 'Quality Assurance', value: 'quality-assurance' },
      ],
      required: true,
      admin: {
        description: 'Business category for this documentation',
      },
    },
    {
      name: 'tags',
      type: 'array',
      fields: [
        {
          name: 'tag',
          type: 'text',
        },
      ],
      admin: {
        description: 'Tags for better rchability and organization',
      },
    },

    // Content
    {
      name: 'content',
      type: 'richText',
      required: true,
      admin: {
        description: 'Main content of the documentation',
      },
    },

    // Authoring and Workflow
    {
      name: 'author',
      type: 'relationship',
      relationTo: 'users',
      required: true,
      admin: {
        description: 'Author of this documentation',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Draft', value: 'draft' },
        { label: 'In Review', value: 'in-review' },
        { label: 'Pending Approval', value: 'pending-approval' },
        { label: 'Approved', value: 'approved' },
        { label: 'Published', value: 'published' },
        { label: 'Scheduled', value: 'scheduled' },
        { label: 'Archived', value: 'archived' },
        { label: 'Deprecated', value: 'deprecated' },
      ],
      defaultValue: 'draft',
      required: true,
      admin: {
        description: 'Current status in the approval workflow',
      },
    },
    {
      name: 'priority',
      type: 'select',
      options: [
        { label: 'Low', value: 'low' },
        { label: 'Medium', value: 'medium' },
        { label: 'High', value: 'high' },
        { label: 'Critical', value: 'critical' },
      ],
      defaultValue: 'medium',
      admin: {
        description: 'Priority level for this documentation',
      },
    },

    // Versioning and Scheduling
    {
      name: 'version',
      type: 'text',
      defaultValue: '1.0.0',
      admin: {
        description: 'Version number (semantic versioning)',
      },
    },
    {
      name: 'publishedAt',
      type: 'date',
      admin: {
        description: 'When this documentation was published',
      },
    },
    {
      name: 'scheduledPublishAt',
      type: 'date',
      admin: {
        description: 'Schedule this documentation for future publication',
      },
    },
    {
      name: 'expirationDate',
      type: 'date',
      admin: {
        description: 'When this documentation expires and needs review',
      },
    },

    // Content Properties
    {
      name: 'difficulty',
      type: 'select',
      options: [
        { label: 'Beginner', value: 'beginner' },
        { label: 'Intermediate', value: 'intermediate' },
        { label: 'Advanced', value: 'advanced' },
      ],
      defaultValue: 'beginner',
      admin: {
        description: 'Difficulty level for the target audience',
      },
    },
    {
      name: 'estimatedReadTime',
      type: 'number',
      admin: {
        description: 'Estimated read time in minutes',
      },
    },

    // Workflow and Approvals
    {
      name: 'workflow',
      type: 'group',
      fields: [
        {
          name: 'currentStep',
          type: 'select',
          options: [
            { label: 'Draft', value: 'draft' },
            { label: 'Content Review', value: 'content-review' },
            { label: 'Technical Review', value: 'technical-review' },
            { label: 'Compliance Review', value: 'compliance-review' },
            { label: 'Final Approval', value: 'final-approval' },
            { label: 'Published', value: 'published' },
          ],
          defaultValue: 'draft',
        },
        {
          name: 'assignedReviewers',
          type: 'array',
          fields: [
            {
              name: 'reviewer',
              type: 'relationship',
              relationTo: 'users',
            },
          ],
        },
        {
          name: 'dueDate',
          type: 'date',
        },
        {
          name: 'comments',
          type: 'array',
          fields: [
            {
              name: 'author',
              type: 'relationship',
              relationTo: 'users',
            },
            {
              name: 'content',
              type: 'textarea',
            },
            {
              name: 'type',
              type: 'select',
              options: [
                { label: 'Comment', value: 'comment' },
                { label: 'Suggestion', value: 'suggestion' },
                { label: 'Approval', value: 'approval' },
                { label: 'Rejection', value: 'rejection' },
              ],
            },
            {
              name: 'createdAt',
              type: 'date',
              defaultValue: () => new Date(),
            },
          ],
        },
      ],
      admin: {
        description: 'Workflow management for approval process',
      },
    },

    // Relationships
    {
      name: 'relatedDocuments',
      type: 'array',
      fields: [
        {
          name: 'document',
          type: 'relationship',
          relationTo: 'documentation',
        },
      ],
      admin: {
        description: 'Related documentation that users might find helpful',
      },
    },

    // Attachments
    {
      name: 'attachments',
      type: 'array',
      fields: [
        {
          name: 'file',
          type: 'upload',
          relationTo: 'media',
        },
        {
          name: 'description',
          type: 'text',
        },
      ],
      admin: {
        description: 'File attachments for this documentation',
      },
    },

    // Metadata and Analytics
    {
      name: 'metadata',
      type: 'group',
      fields: [
        {
          name: 'views',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'uniqueViews',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'rating',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'ratingCount',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'completionRate',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'feedbackCount',
          type: 'number',
          defaultValue: 0,
          admin: {
            readOnly: true,
          },
        },
        {
          name: 'lastReviewDate',
          type: 'date',
        },
        {
          name: 'nextReviewDate',
          type: 'date',
        },
        {
          name: 'isNew',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'isUpdated',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'isDeprecated',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'isFeatured',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'isRequired',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Mark as required reading for target role',
          },
        },
        {
          name: 'complianceRequired',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'trainingRequired',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
      admin: {
        description: 'Metadata and analytics for this documentation',
      },
    },
  ],
  timestamps: true,

  // Access control
  access: {
    // Read access - users can read documentation based on their role
    read: (args: any) => {
      const { req: { user } } = args;
      if (!user) {
        // Guests can only read public documentation
        return {
          or: [
            { targetRole: { equals: 'guest' } },
            { targetRole: { equals: 'salon_customer' } },
          ],
          status: { equals: 'published' },
        };
      }

      // System admins can read everything
      if (user.role === 'system_admin') {
        return true;
      }

      // Users can read documentation for their role and lower privilege levels
      const roleHierarchy = {
        'salon_customer': ['guest', 'salon_customer'],
        'salon_employee': ['guest', 'salon_customer', 'salon_employee'],
        'salon_owner': ['guest', 'salon_customer', 'salon_employee', 'salon_owner'],
        'developer': ['guest', 'salon_customer', 'salon_employee', 'salon_owner', 'developer'],
      };

      const accessibleRoles = roleHierarchy[user.role as keyof typeof roleHierarchy] || [user.role];

      return {
        targetRole: { in: accessibleRoles },
        status: { equals: 'published' },
      };
    },

    // Create access - only business users and above can create documentation
    create: (args: any) => {
      const { req: { user } } = args;
      return canManageDocumentation(user?.role);
    },

    // Update access - authors can edit their own drafts, business users can edit business docs
    update: (args: any) => {
      const { req: { user }, id } = args;
      if (!user) return false;

      if (user.role === 'system_admin') return true;

      // Authors can edit their own documentation
      if (user.role === 'salon_owner' || user.role === 'developer') {
        return true;
      }

      return false;
    },

    // Delete access - only admins and owners can delete
    delete: (args: any) => {
      const { req: { user } } = args;
      return ['system_admin', 'salon_owner'].includes(user?.role || '');
    },
  },

  // Hooks for workflow automation and rch indexing
  hooks: {
    beforeChange: [
      async (args: any) => {
        const { data, req, operation } = args;
        // Auto-set author on create
        if (operation === 'create' && req.user) {
          data.author = req.user.id;
        }

        // Auto-calculate estimated read time if not provided
        if (data.content && !data.estimatedReadTime) {
          const wordCount = data.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
          data.estimatedReadTime = Math.ceil(wordCount / 200); // Average reading speed
        }

        // Set published date when status changes to published
        if (data.status === 'published' && !data.publishedAt) {
          data.publishedAt = new Date();
        }

        // Auto-set next review date based on category
        if (data.category && !data.metadata?.nextReviewDate) {
          const reviewIntervals = {
            'safety-procedures': 90, // 3 months
            'compliance': 180, // 6 months
            'emergency-procedures': 90, // 3 months
            'staff-training': 365, // 1 year
            'default': 365, // 1 year
          };

          const interval = reviewIntervals[data.category as keyof typeof reviewIntervals] || reviewIntervals.default;
          const nextReview = new Date();
          nextReview.setDate(nextReview.getDate() + interval);

          if (!data.metadata) data.metadata = {};
          data.metadata.nextReviewDate = nextReview;
        }

        return data;
      },
    ],

    afterChange: [
      async (args: any) => {
        const { doc, operation, req } = args;
        try {
          // Index the document for rch
          const { DocumentationrchService } = await import('@/lib/rch-service');
          const rchService = new DocumentationrchService({
            provider: 'local',
            indexName: 'documentation',
            maxResults: 50,
            enableFacets: true,
            enableSuggestions: true,
            enableAnalytics: true,
            enableHighlighting: true,
            enableTypoTolerance: true,
            enableSynonyms: true,
            rankingConfig: {
              roleBasedBoost: {
                guest: 1,
                salon_customer: 1.1,
                salon_employee: 1.2,
                salon_owner: 1.3,
                developer: 1.4,
                system_admin: 1.5
              },
              recencyBoost: 0.01,
              popularityBoost: 0.001,
              accuracyBoost: 1.5,
              completionRateBoost: 0.5,
              ratingBoost: 0.3,
              viewsBoost: 0.0001,
              titleBoost: 3,
              descriptionBoost: 2,
              contentBoost: 1,
              tagsBoost: 2
            }
          });

          await rchService.indexDocument({
            id: doc.id,
            title: doc.title,
            description: doc.excerpt || '',
            content: doc.content,
            path: `/documentation/business/${doc.slug}`,
            type: doc.type,
            role: doc.targetRole,
            category: doc.category,
            tags: doc.tags?.map((t: any) => t.tag) ?? [],
            author: doc.author?.id ?? '',
            lastUpdated: doc.updatedAt,
            difficulty: doc.difficulty,
            estimatedReadTime: doc.estimatedReadTime,
            metadata: doc.metadata,
            rchableText: '',
            keywords: [],
          });

          // Send notifications for workflow changes
          if (operation === 'update' && doc.workflow?.currentStep) {
            await sendWorkflowNotification(doc, req.user);
          }

          // Log workflow history
          if (operation === 'update') {
            await logWorkflowHistory(doc, req.user, operation);
          }

        } catch (error) {
          console.error('Error in afterChange hook:', error);
          // Don't fail the main operation if hooks fail
        }
      },
    ],

    beforeDelete: [
      async (args: any) => {
        const { id } = args;
        try {
          // Remove from rch index
          const { DocumentationrchService } = await import('@/lib/rch-service');
          const rchService = new DocumentationrchService({
            provider: 'local',
            indexName: 'documentation',
            maxResults: 50,
            enableFacets: true,
            enableSuggestions: true,
            enableAnalytics: true,
            enableHighlighting: true,
            enableTypoTolerance: true,
            enableSynonyms: true,
            rankingConfig: {
              roleBasedBoost: { guest: 1, salon_customer: 1.1, salon_employee: 1.2, salon_owner: 1.3, developer: 1.4, system_admin: 1.5 },
              recencyBoost: 0.01, popularityBoost: 0.001, accuracyBoost: 1.5, completionRateBoost: 0.5, ratingBoost: 0.3, viewsBoost: 0.0001,
              titleBoost: 3, descriptionBoost: 2, contentBoost: 1, tagsBoost: 2
            }
          });

          await rchService.removeDocument(id);
        } catch (error) {
          console.error('Error removing document from rch index:', error);
        }
      },
    ],
  },
};

// Helper functions for workflow management
async function sendWorkflowNotification(doc: any, user: any) {
  // Implementation for sending notifications to reviewers
  // This would integrate with your notification system
  console.log(`Workflow notification: ${doc.title} moved to ${doc.workflow.currentStep} by ${user?.name}`);
}

async function logWorkflowHistory(doc: any, user: any, action: string) {
  // Implementation for logging workflow history
  // This would store workflow history in a separate collection or database
  console.log(`Workflow history: ${action} on ${doc.title} by ${user?.name} at ${new Date()}`);
}
