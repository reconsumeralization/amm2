import type { CollectionConfig } from 'payload';

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  admin: {
    useAsTitle: 'name',
    group: 'Admin',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'email',
      type: 'email',
      required: true,
    },
    {
      name: 'status',
      type: 'select',
      options: [
        { label: 'Active', value: 'active' },
        { label: 'Suspended', value: 'suspended' },
        { label: 'Pending', value: 'pending' },
        { label: 'Deactivated', value: 'deactivated' }
      ],
      defaultValue: 'pending',
      required: true,
    },
    {
      name: 'suspensionReason',
      type: 'textarea',
      admin: {
        condition: (data) => data.status === 'suspended',
        description: 'Reason for suspension'
      }
    },
    {
      name: 'subscriptionPlan',
      type: 'select',
      options: [
        { label: 'Basic', value: 'basic' },
        { label: 'Professional', value: 'professional' },
        { label: 'Enterprise', value: 'enterprise' }
      ],
      defaultValue: 'basic',
    },
    {
      name: 'lastActivity',
      type: 'date',
      admin: {
        readOnly: true,
      }
    },
    {
      name: 'createdAt',
      type: 'date',
      admin: {
        readOnly: true,
      }
    }
  ],
  hooks: {
    beforeChange: [
      async ({ data, req, operation }) => {
        if (operation === 'create') {
          data.createdAt = new Date()
          data.lastActivity = new Date()
        }
        return data
      }
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        // Handle status changes with notifications
        if (operation === 'update' && doc.status !== previousDoc?.status) {
          try {
            const { emailService } = await import('@/lib/email-service')

            switch (doc.status) {
              case 'suspended':
                // Implement suspension logic
                console.log(`Tenant ${doc.name} suspended:`, doc.suspensionReason)
                
                // Send suspension notification
                if (doc.email) {
                  await emailService.sendEmail({
                    to: doc.email,
                    subject: 'Account Suspended - ModernMen',
                    html: `
                      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #dc3545;">Account Suspended</h2>
                        <p>Hi ${doc.name},</p>
                        <p>Your ModernMen account has been temporarily suspended.</p>
                        ${doc.suspensionReason ? `<p><strong>Reason:</strong> ${doc.suspensionReason}</p>` : ''}
                        <p>If you believe this is an error or would like to resolve this issue, please contact our support team.</p>
                        <p>Best regards,<br>The ModernMen Team</p>
                      </div>
                    `,
                    text: `Hi ${doc.name},\n\nYour ModernMen account has been temporarily suspended.\n\n${doc.suspensionReason ? `Reason: ${doc.suspensionReason}\n\n` : ''}If you believe this is an error or would like to resolve this issue, please contact our support team.\n\nBest regards,\nThe ModernMen Team`
                  })
                }
                
                // Here you would implement additional suspension logic:
                // - Disable access to services
                // - Cancel active appointments (handled separately)
                // - Pause subscriptions
                break

              case 'active':
                if (previousDoc?.status === 'suspended' || previousDoc?.status === 'pending') {
                  // Implement activation logic
                  console.log(`Tenant ${doc.name} activated`)
                  
                  // Send activation notification
                  if (doc.email) {
                    await emailService.sendEmail({
                      to: doc.email,
                      subject: 'Account Activated - ModernMen',
                      html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                          <h2 style="color: #28a745;">Account Activated</h2>
                          <p>Hi ${doc.name},</p>
                          <p>Great news! Your ModernMen account has been activated and is ready to use.</p>
                          <p>You can now access all features of your ${doc.subscriptionPlan} plan.</p>
                          <p>Welcome to ModernMen!</p>
                          <p>Best regards,<br>The ModernMen Team</p>
                        </div>
                      `,
                      text: `Hi ${doc.name},\n\nGreat news! Your ModernMen account has been activated and is ready to use.\n\nYou can now access all features of your ${doc.subscriptionPlan} plan.\n\nWelcome to ModernMen!\n\nBest regards,\nThe ModernMen Team`
                    })
                  }
                  
                  // Here you would implement additional activation logic:
                  // - Restore access to services
                  // - Resume subscriptions
                  // - Send welcome/onboarding materials
                }
                break

              case 'deactivated':
                console.log(`Tenant ${doc.name} deactivated`)
                
                // Send deactivation notification
                if (doc.email) {
                  await emailService.sendEmail({
                    to: doc.email,
                    subject: 'Account Deactivated - ModernMen',
                    html: `
                      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #6c757d;">Account Deactivated</h2>
                        <p>Hi ${doc.name},</p>
                        <p>Your ModernMen account has been deactivated as requested.</p>
                        <p>If you'd like to reactivate your account in the future, please contact our support team.</p>
                        <p>Thank you for being part of ModernMen.</p>
                        <p>Best regards,<br>The ModernMen Team</p>
                      </div>
                    `,
                    text: `Hi ${doc.name},\n\nYour ModernMen account has been deactivated as requested.\n\nIf you'd like to reactivate your account in the future, please contact our support team.\n\nThank you for being part of ModernMen.\n\nBest regards,\nThe ModernMen Team`
                  })
                }
                break
            }
          } catch (error) {
            console.error('Error handling tenant status change:', error)
          }
        }
      }
    ]
  }
};