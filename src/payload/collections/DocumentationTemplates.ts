import type { CollectionConfig, Access, FieldHook } from 'payload/types'

// Define types for access control context
interface AccessContext {
  req: {
    user?: {
      id: string;
      role?: string;
    };
  };
}

interface HookContext {
  data: any;
  req: {
    user?: {
      id: string;
      role?: string;
    };
  };
  operation: 'create' | 'update' | 'delete';
}

export const DocumentationTemplates: any = {
  slug: 'documentation-templates',
  admin: {
    usTitle: 'name',
    defaultColumns: ['name', 'type', 'category', 'isDefault', 'usageCount'],
    group: 'Content Management',
    description: 'Manage documentation templates for consistent content creation',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: {
        description: 'Name of the template',
      },
    },
    {
      name: 'description',
      type: 'textarea',
      admin: {
        description: 'Description of what this template is for',
      },
    },
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
    },
    {
      name: 'targetRoles',
      type: 'array',
      fields: [
        {
          name: 'role',
          type: 'select',
          options: [
            { label: 'Guest', value: 'guest' },
            { label: 'Salon Customer', value: 'salon_customer' },
            { label: 'Salon Employee', value: 'salon_employee' },
            { label: 'Salon Owner', value: 'salon_owner' },
            { label: 'Developer', value: 'developer' },
            { label: 'System Admin', value: 'system_admin' },
          ],
        },
      ],
      admin: {
        description: 'Roles this template is designed for',
      },
    },
    {
      name: 'template',
      type: 'richText',
      required: true,
      admin: {
        description: 'Template content with placeholders',
      },
    },
    {
      name: 'fields',
      type: 'array',
      fields: [
        {
          name: 'name',
          type: 'text',
          required: true,
        },
        {
          name: 'label',
          type: 'text',
          required: true,
        },
        {
          name: 'type',
          type: 'select',
          options: [
            { label: 'Text', value: 'text' },
            { label: 'Textarea', value: 'textarea' },
            { label: 'Select', value: 'select' },
            { label: 'Checkbox', value: 'checkbox' },
            { label: 'Date', value: 'date' },
            { label: 'Number', value: 'number' },
            { label: 'File', value: 'file' },
          ],
          required: true,
        },
        {
          name: 'required',
          type: 'checkbox',
          defaultValue: false,
        },
        {
          name: 'placeholder',
          type: 'text',
        },
        {
          name: 'options',
          type: 'array',
          fields: [
            {
              name: 'option',
              type: 'text',
            },
          ],
          admin: {
            condition: (data: any, siblingData: any) => siblingData.type === 'select',
          },
        },
      ],
      admin: {
        description: 'Dynamic fields for this template',
      },
    },
    {
      name: 'isDefault',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        description: 'Use as default template for this type/category',
      },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Template is available for use',
      },
    },
    {
      name: 'createdBy',
      type: 'relationship',
      relationTo: 'users',
      required: true,
    },
    {
      name: 'usageCount',
      type: 'number',
      defaultValue: 0,
      admin: {
        readOnly: true,
        description: 'Number of times this template has been used',
      },
    },
  ],
  timestamps: true,
  access: {
    read: () => true, // All authenticated users can read templates
    create: ({ req: { user } }: AccessContext) => ['system_admin', 'salon_owner', 'developer'].includes(user?.role || ''),
    update: ({ req: { user } }: AccessContext) => ['system_admin', 'salon_owner', 'developer'].includes(user?.role || ''),
    delete: ({ req: { user } }: AccessContext) => ['system_admin', 'salon_owner'].includes(user?.role || ''),
  },
  hooks: {
    beforeChange: [
      async ({ data, req, operation }: HookContext) => {
        if (operation === 'create' && req.user) {
          data.createdBy = req.user.id;
        }
        return data;
      },
    ],
  },
};