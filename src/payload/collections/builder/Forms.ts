// src/payload/collections/builder/Forms.ts
import type { CollectionConfig } from 'payload'

export const Forms: CollectionConfig = {
  slug: 'forms',
  admin: {
    useAsTitle: 'name',
    group: 'Builder',
    description: 'Reusable forms for data collection.',
  },
  access: {
    read: () => true,
    create: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'manager',
    update: ({ req }) => req.user?.role === 'admin' || req.user?.role === 'manager',
    delete: ({ req }) => req.user?.role === 'admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      unique: true,
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
                    { label: 'Email', value: 'email' },
                    { label: 'Number', value: 'number' },
                    { label: 'Checkbox', value: 'checkbox' },
                    { label: 'Select', value: 'select' },
                ],
                required: true,
            },
            {
                name: 'required',
                type: 'checkbox',
                defaultValue: false,
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
                    condition: (data, siblingData) => siblingData.type === 'select',
                },
            },
        ],
    },
    {
        name: 'submitButtonText',
        type: 'text',
        defaultValue: 'Submit',
    },
    {
        name: 'redirectUrl',
        type: 'text',
        admin: {
            description: 'Redirect to this URL after submission.',
        },
    },
  ],
  timestamps: true,
}
