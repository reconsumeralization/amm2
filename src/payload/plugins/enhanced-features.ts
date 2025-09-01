import { Config } from 'payload/config'
import { CollectionConfig, Field, FieldHook } from 'payload/types'

export interface EnhancedFeaturesOptions {
  enableSEO?: boolean
  enableOGImages?: boolean
  enableAuditLogs?: boolean
  enableVersioning?: boolean
  enableWorkflows?: boolean
  collections?: string[]
}

export const enhancedFeatures = (options: EnhancedFeaturesOptions = {}) => {
  const {
    enableSEO = true,
    enableOGImages = true,
    enableAuditLogs = true,
    enableVersioning = true,
    enableWorkflows = false,
    collections = []
  } = options

  return (config: Config): Config => {
    let enhancedConfig = { ...config }

    // Add global SEO fields if enabled
    if (enableSEO) {
      enhancedConfig = addSEOFields(enhancedConfig, collections)
    }

    // Add OG image generation if enabled
    if (enableOGImages) {
      enhancedConfig = addOGImageGeneration(enhancedConfig, collections)
    }

    // Add audit logging if enabled
    if (enableAuditLogs) {
      enhancedConfig = addAuditLogging(enhancedConfig, collections)
    }

    // Add versioning if enabled
    if (enableVersioning) {
      enhancedConfig = addVersioning(enhancedConfig, collections)
    }

    // Add workflow support if enabled
    if (enableWorkflows) {
      enhancedConfig = addWorkflowSupport(enhancedConfig, collections)
    }

    return enhancedConfig
  }
}

// SEO Fields Enhancement
function addSEOFields(config: Config, targetCollections: string[]): Config {
  const enhancedCollections = config.collections?.map(collection => {
    // Apply to all collections or only specified ones
    if (targetCollections.length === 0 || targetCollections.includes(collection.slug)) {
      return {
        ...collection,
        fields: [
          ...collection.fields,
          // SEO Title
          {
            name: 'seoTitle',
            type: 'text',
            admin: {
              description: 'SEO title (50-60 characters recommended)',
              condition: () => true
            },
            hooks: {
              beforeValidate: [validateSEOTitle]
            }
          },
          // SEO Description
          {
            name: 'seoDescription',
            type: 'textarea',
            admin: {
              description: 'SEO description (150-160 characters recommended)',
              condition: () => true
            },
            hooks: {
              beforeValidate: [validateSEODescription]
            }
          },
          // SEO Keywords
          {
            name: 'seoKeywords',
            type: 'text',
            admin: {
              description: 'SEO keywords (comma-separated)',
              condition: () => true
            }
          },
          // Canonical URL
          {
            name: 'canonicalUrl',
            type: 'text',
            admin: {
              description: 'Canonical URL for SEO',
              condition: () => true
            }
          },
          // No Index
          {
            name: 'noIndex',
            type: 'checkbox',
            label: 'No Index',
            admin: {
              description: 'Prevent search engines from indexing this page',
              condition: () => true
            }
          }
        ]
      }
    }
    return collection
  })

  return {
    ...config,
    collections: enhancedCollections
  }
}

// OG Image Generation
function addOGImageGeneration(config: Config, targetCollections: string[]): Config {
  const enhancedCollections = config.collections?.map(collection => {
    if (targetCollections.length === 0 || targetCollections.includes(collection.slug)) {
      const existingHooks = collection.hooks || {}

      return {
        ...collection,
        fields: [
          ...collection.fields,
          // OG Image
          {
            name: 'ogImage',
            type: 'upload',
            relationTo: 'media',
            admin: {
              description: 'Open Graph image for social media sharing',
              condition: () => true
            }
          },
          // OG Title
          {
            name: 'ogTitle',
            type: 'text',
            admin: {
              description: 'Open Graph title',
              condition: () => true
            }
          },
          // OG Description
          {
            name: 'ogDescription',
            type: 'textarea',
            admin: {
              description: 'Open Graph description',
              condition: () => true
            }
          }
        ],
        hooks: {
          ...existingHooks,
          afterChange: [
            ...(existingHooks.afterChange || []),
            generateOGImageHook
          ]
        }
      }
    }
    return collection
  })

  return {
    ...config,
    collections: enhancedCollections
  }
}

// Audit Logging
function addAuditLogging(config: Config, targetCollections: string[]): Config {
  const enhancedCollections = config.collections?.map(collection => {
    if (targetCollections.length === 0 || targetCollections.includes(collection.slug)) {
      const existingHooks = collection.hooks || {}

      return {
        ...collection,
        hooks: {
          ...existingHooks,
          afterChange: [
            ...(existingHooks.afterChange || []),
            auditLogHook
          ],
          afterDelete: [
            ...(existingHooks.afterDelete || []),
            auditDeleteHook
          ]
        }
      }
    }
    return collection
  })

  return {
    ...config,
    collections: enhancedCollections
  }
}

// Versioning Support
function addVersioning(config: Config, targetCollections: string[]): Config {
  const enhancedCollections = config.collections?.map(collection => {
    if (targetCollections.length === 0 || targetCollections.includes(collection.slug)) {
      return {
        ...collection,
        fields: [
          ...collection.fields,
          // Version
          {
            name: 'version',
            type: 'number',
            defaultValue: 1,
            admin: {
              description: 'Content version number',
              readOnly: true
            }
          },
          // Version History
          {
            name: 'versionHistory',
            type: 'json',
            admin: {
              description: 'Version history (auto-managed)',
              readOnly: true
            }
          }
        ],
        hooks: {
          ...collection.hooks,
          beforeChange: [
            ...(collection.hooks?.beforeChange || []),
            versionControlHook
          ]
        }
      }
    }
    return collection
  })

  return {
    ...config,
    collections: enhancedCollections
  }
}

// Workflow Support
function addWorkflowSupport(config: Config, targetCollections: string[]): Config {
  const enhancedCollections = config.collections?.map(collection => {
    if (targetCollections.length === 0 || targetCollections.includes(collection.slug)) {
      return {
        ...collection,
        fields: [
          ...collection.fields,
          // Workflow Status
          {
            name: 'workflowStatus',
            type: 'select',
            options: [
              { label: 'Draft', value: 'draft' },
              { label: 'In Review', value: 'in_review' },
              { label: 'Approved', value: 'approved' },
              { label: 'Published', value: 'published' },
              { label: 'Archived', value: 'archived' }
            ],
            defaultValue: 'draft',
            admin: {
              description: 'Current workflow status'
            }
          },
          // Assigned To
          {
            name: 'assignedTo',
            type: 'relationship',
            relationTo: 'users',
            admin: {
              description: 'User assigned to this item'
            }
          },
          // Review Notes
          {
            name: 'reviewNotes',
            type: 'textarea',
            admin: {
              description: 'Review notes and feedback'
            }
          }
        ]
      }
    }
    return collection
  })

  return {
    ...config,
    collections: enhancedCollections
  }
}

// Hook Functions
const validateSEOTitle: FieldHook = ({ value, data }) => {
  if (value && value.length > 60) {
    console.warn('SEO title exceeds recommended length of 60 characters')
  }
  return value
}

const validateSEODescription: FieldHook = ({ value, data }) => {
  if (value && value.length > 160) {
    console.warn('SEO description exceeds recommended length of 160 characters')
  }
  return value
}

const generateOGImageHook: FieldHook = async ({ doc, operation, req }) => {
  try {
    // Generate OG image if not provided and title exists
    if (!doc.ogImage && doc.title && operation === 'create') {
      console.log('Generating OG image for:', doc.title)
      // Implementation would call OG image generation service
    }
  } catch (error) {
    console.error('OG image generation failed:', error)
  }

  return doc
}

const auditLogHook: FieldHook = async ({ doc, operation, req }) => {
  try {
    if (req?.user) {
      console.log(`Audit: ${operation} on ${doc.collection} by ${req.user.email}`)
      // Implementation would save to audit logs collection
    }
  } catch (error) {
    console.error('Audit logging failed:', error)
  }

  return doc
}

const auditDeleteHook: FieldHook = async ({ doc, req }) => {
  try {
    if (req?.user) {
      console.log(`Audit: delete on ${doc.collection} by ${req.user.email}`)
      // Implementation would save deletion to audit logs
    }
  } catch (error) {
    console.error('Audit delete logging failed:', error)
  }

  return doc
}

const versionControlHook: FieldHook = ({ doc, operation, previousDoc }) => {
  if (operation === 'update' && previousDoc) {
    // Increment version
    doc.version = (previousDoc.version || 1) + 1

    // Add to version history
    const history = previousDoc.versionHistory || []
    history.push({
      version: previousDoc.version || 1,
      changedAt: previousDoc.updatedAt || new Date(),
      changes: getChanges(previousDoc, doc)
    })

    doc.versionHistory = history
  }

  return doc
}

function getChanges(oldDoc: any, newDoc: any): any {
  const changes: any = {}

  // Compare fields and track changes
  Object.keys(newDoc).forEach(key => {
    if (JSON.stringify(oldDoc[key]) !== JSON.stringify(newDoc[key])) {
      changes[key] = {
        from: oldDoc[key],
        to: newDoc[key]
      }
    }
  })

  return changes
}

export default enhancedFeatures
