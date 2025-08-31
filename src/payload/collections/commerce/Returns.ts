// src/payload/collections/Returns.ts
import type { CollectionConfig } from 'payload';
import { withDefaultHooks } from '../../utils';

export const Returns: CollectionConfig = withDefaultHooks({
  slug: 'returns',
  admin: {
    useAsTitle: 'returnId',
    group: 'Commerce',
    description: 'Manage product returns and refunds',
    defaultColumns: ['returnId', 'order', 'customer', 'status', 'returnValue', 'createdAt'],
    listSearchableFields: ['returnId', 'order.id', '(customer as any)?.email', 'reason'],
  },
  access: {
    read: ({ req }: any) => {
      if (!req.user) return false;
      if ((req.user as any)?.role === 'admin') return true;
      if ((req.user as any)?.role === 'manager') return true;
      // Customers can only view their own returns
      return { customer: { equals: req.user.id } };
    },
    create: ({ req }: any) => {
      if (!req.user) return false;
      return ['admin', 'manager'].includes((req.user as any)?.role);
    },
    update: ({ req }: any) => {
      if (!req.user) return false;
      if ((req.user as any)?.role === 'admin') return true;
      if ((req.user as any)?.role === 'manager') return true;
      return false;
    },
    delete: ({ req }: any) => {
      if (!req.user) return false;
      return (req.user as any)?.role === 'admin';
    },
  },
  fields: [
    {
      name: 'returnId',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        description: 'Unique return identifier',
      },
      hooks: {
        beforeValidate: [
          ({ value, operation, data }: any) => {
            if (operation === 'create' && !value) {
              return `R${Date.now().toString().slice(-8)}`;
            }
            return value;
          },
        ],
      },
    },
    {
      name: 'order',
      type: 'relationship',
      relationTo: 'orders' as any as any,
      required: true,
      admin: {
        description: 'Original order for this return',
      },
    },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers' as any as any,
      required: true,
      admin: {
        description: 'Customer requesting the return',
      },
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Requested', value: 'requested' },
        { label: 'Approved', value: 'approved' },
        { label: 'Rejected', value: 'rejected' },
        { label: 'Received', value: 'received' },
        { label: 'Processing', value: 'processing' },
        { label: 'Refunded', value: 'refunded' },
        { label: 'Completed', value: 'completed' },
        { label: 'Cancelled', value: 'cancelled' },
      ],
      defaultValue: 'requested',
      admin: {
        description: 'Current status of the return request',
      },
    },
    {
      name: 'returnItems',
      type: 'array',
      required: true,
      admin: {
        description: 'Items being returned',
      },
      fields: [
        {
          name: 'product',
          type: 'relationship',
          relationTo: 'products' as any as any,
          required: true,
          admin: {
            description: 'Product being returned',
          },
        },
        {
          name: 'quantity',
          type: 'number',
          required: true,
          min: 1,
          admin: {
            description: 'Quantity being returned',
          },
        },
        {
          name: 'reason',
          type: 'select',
          options: [
            { label: 'Defective', value: 'defective' },
            { label: 'Wrong Item', value: 'wrong_item' },
            { label: 'Not as Described', value: 'not_as_described' },
            { label: 'Changed Mind', value: 'changed_mind' },
            { label: 'Damaged in Transit', value: 'damaged_transit' },
            { label: 'Late Delivery', value: 'late_delivery' },
            { label: 'Other', value: 'other' },
          ],
          required: true,
          admin: {
            description: 'Reason for return',
          },
        },
        {
          name: 'condition',
          type: 'select',
          options: [
            { label: 'New', value: 'new' },
            { label: 'Opened', value: 'opened' },
            { label: 'Used', value: 'used' },
            { label: 'Damaged', value: 'damaged' },
          ],
          defaultValue: 'new',
          admin: {
            description: 'Condition of the returned item',
          },
        },
        {
          name: 'refundAmount',
          type: 'number',
          admin: {
            description: 'Refund amount for this item in cents',
          },
        },
        {
          name: 'notes',
          type: 'textarea',
          admin: {
            description: 'Additional notes about this item',
          },
        },
      ],
    },
    {
      name: 'returnValue',
      type: 'number',
      admin: {
        description: 'Total value of the return in cents',
        readOnly: true,
      },
    },
    {
      name: 'refundMethod',
      type: 'select',
      options: [
        { label: 'Original Payment Method', value: 'original' },
        { label: 'Store Credit', value: 'store_credit' },
        { label: 'Bank Transfer', value: 'bank_transfer' },
        { label: 'Check', value: 'check' },
        { label: 'Gift Card', value: 'gift_card' },
      ],
      defaultValue: 'original',
      admin: {
        description: 'Method used for refund',
      },
    },
    {
      name: 'refundAmount',
      type: 'number',
      admin: {
        description: 'Total refund amount in cents',
        readOnly: true,
      },
    },
    {
      name: 'refundTransactionId',
      type: 'text',
      admin: {
        description: 'Transaction ID for the refund',
        readOnly: true,
      },
    },
    {
      name: 'refundedAt',
      type: 'date',
      admin: {
        description: 'When the refund was processed',
        readOnly: true,
      },
    },
    {
      name: 'shippingRequired',
      type: 'checkbox',
      defaultValue: true,
      admin: {
        description: 'Whether customer needs to ship items back',
      },
    },
    {
      name: 'shippingLabel',
      type: 'group',
      admin: {
        description: 'Return shipping information',
        condition: (data: any) => data?.shippingRequired === true,
      },
      fields: [
        {
          name: 'trackingNumber',
          type: 'text',
          admin: {
            description: 'Return shipping tracking number',
          },
        },
        {
          name: 'carrier',
          type: 'text',
          admin: {
            description: 'Shipping carrier for return',
          },
        },
        {
          name: 'shippingCost',
          type: 'number',
          admin: {
            description: 'Cost of return shipping in cents',
          },
        },
        {
          name: 'labelUrl',
          type: 'text',
          admin: {
            description: 'URL to download return shipping label',
          },
        },
      ],
    },
    {
      name: 'receivedAt',
      type: 'date',
      admin: {
        description: 'When the return items were received',
        readOnly: true,
      },
    },
    {
      name: 'processedAt',
      type: 'date',
      admin: {
        description: 'When the return was processed',
        readOnly: true,
      },
    },
    {
      name: 'approvedBy',
      type: 'relationship',
      relationTo: 'users' as any as any,
      admin: {
        description: 'User who approved the return',
        readOnly: true,
      },
    },
    {
      name: 'approvedAt',
      type: 'date',
      admin: {
        description: 'When the return was approved',
        readOnly: true,
      },
    },
    {
      name: 'rejectionReason',
      type: 'textarea',
      admin: {
        description: 'Reason for rejection (if applicable)',
        condition: (data: any) => data?.status === 'rejected',
      },
    },
    {
      name: 'customerNotes',
      type: 'textarea',
      admin: {
        description: 'Notes from the customer about the return',
      },
    },
    {
      name: 'internalNotes',
      type: 'textarea',
      admin: {
        description: 'Internal notes about the return',
      },
    },
    {
      name: 'photos',
      type: 'array',
      admin: {
        description: 'Photos of returned items',
      },
      fields: [
        {
          name: 'photo',
          type: 'upload',
          relationTo: 'media' as any as any,
          required: true,
        },
        {
          name: 'description',
          type: 'text',
          admin: {
            description: 'Description of the photo',
          },
        },
      ],
    },
    {
      name: 'restockingFee',
      type: 'number',
      defaultValue: 0,
      admin: {
        description: 'Restocking fee in cents',
      },
    },
    {
      name: 'disposition',
      type: 'select',
      options: [
        { label: 'Refund', value: 'refund' },
        { label: 'Exchange', value: 'exchange' },
        { label: 'Store Credit', value: 'store_credit' },
        { label: 'Repair', value: 'repair' },
        { label: 'Discard', value: 'discard' },
        { label: 'Resell', value: 'resell' },
      ],
      defaultValue: 'refund',
      admin: {
        description: 'How the returned items will be handled',
      },
    },
    {
      name: 'tenant',
      type: 'relationship',
      relationTo: 'tenants' as any as any,
      required: true,
      admin: {
        position: 'sidebar',
        description: 'The tenant this return belongs to',
        condition: (data: any, siblingData: any, { user }: any) => user?.role === 'admin',
      },
      hooks: {
        beforeChange: [
          ({ req, value }: any) => {
            if (!value && req.user && (req.user as any)?.role !== 'admin') {
              return (req.user as any)?.tenant?.id;
            }
            return value;
          },
        ],
      },
    },
  ],
  hooks: {
    beforeChange: [
      ({ data, operation, req }: any) => {
        // Auto-set tenant for non-admin users
        if (!data.tenant && req.user && (req.user as any)?.role !== 'admin') {
          data.tenant = (req.user as any)?.tenant?.id;
        }

        // Calculate return value and refund amount
        if (data.returnItems && data.returnItems.length > 0) {
          let totalValue = 0;
          data.returnItems.forEach((item: any) => {
            if (item.refundAmount) {
              totalValue += item.refundAmount;
            }
          });
          data.returnValue = totalValue;
          data.refundAmount = Math.max(0, totalValue - (data.restockingFee || 0));
        }

        // Set timestamps based on status
        const now = new Date().toISOString();
        if (data.status === 'approved' && !data.approvedAt) {
          data.approvedAt = now;
          data.approvedBy = req.user?.id;
        }
        if (data.status === 'received' && !data.receivedAt) {
          data.receivedAt = now;
        }
        if (data.status === 'refunded' && !data.refundedAt) {
          data.refundedAt = now;
        }
        if (data.status === 'completed' && !data.processedAt) {
          data.processedAt = now;
        }

        return data;
      },
    ],
    afterChange: [
      ({ doc, operation, req }: any) => {
        if (operation === 'update') {
          if (doc.status === 'approved') {
            console.log(`Return ${doc.returnId} has been approved`);
          }
          if (doc.status === 'refunded') {
            console.log(`Return ${doc.returnId} has been refunded for $${(doc.refundAmount / 100).toFixed(2)}`);
          }
        }
      },
    ],
  },
  timestamps: true,
});
