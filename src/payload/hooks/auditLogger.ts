// src/payload/hooks/auditLogger.ts
import type { CollectionAfterChangeHook, CollectionBeforeDeleteHook } from 'payload'

interface AuditLogData {
  action: 'create' | 'update' | 'delete'
  collection: string
  docID: string
  user?: string
  userId?: string
  tenant?: string
  ipAddress?: string
  userAgent?: string
  payload?: any
  oldData?: any
  newData?: any
  changes?: any
  severity?: 'low' | 'medium' | 'high' | 'critical'
  error?: string
}

// Create audit log entry
export const createAuditLog = async (
  payload: any,
  data: AuditLogData
): Promise<void> => {
  try {
    await payload.create({
      collection: 'audit-logs' as any as any,
      data: {
        ...data,
        createdAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Failed to create audit log:', error)
    // Don't throw error to prevent breaking the main operation
  }
}

// Hook for logging collection operations
export const createAuditHook = (
  collectionName: string,
  severity: 'low' | 'medium' | 'high' | 'critical' = 'low'
): CollectionAfterChangeHook => {
  return async ({ doc, operation, req, previousDoc }) => {
    const changes: any = {}

    if (operation === 'update' && previousDoc) {
      // Calculate what changed
      Object.keys(doc).forEach(key => {
        if (JSON.stringify(previousDoc[key]) !== JSON.stringify(doc[key])) {
          changes[key] = {
            from: previousDoc[key],
            to: doc[key]
          }
        }
      })
    }

    await createAuditLog(req.payload, {
      action: operation,
      collection: collectionName,
      docID: doc.id?.toString() || 'unknown',
      user: req.user?.email || 'system',
      userId: req.user?.id?.toString() || 'unknown',
      tenant: req.user?.tenant?.id || doc.tenant,
      ipAddress: req.headers?.get('x-forwarded-for') || req.headers?.get('x-real-ip') || 'unknown',
      userAgent: req.headers?.get('user-agent') || 'unknown',
      payload: operation === 'create' ? doc : undefined,
      oldData: previousDoc,
      newData: operation === 'update' ? doc : undefined,
      changes,
      severity,
    })
  }
}

// Hook for logging deletions
export const createDeleteAuditHook = (
  collectionName: string
): CollectionBeforeDeleteHook => {
  return async ({ req, id }) => {
    try {
      // Get the document before deletion for logging
      const doc = await req.payload.findByID({
        collection: collectionName,
        id,
      })

      if (doc) {
        await createAuditLog(req.payload, {
          action: 'delete',
          collection: collectionName,
          docID: id?.toString() || 'unknown',
          user: req.user?.email || 'system',
          userId: req.user?.id?.toString() || 'unknown',
          tenant: req.user?.tenant?.id || doc.tenant,
          ipAddress: req.headers?.get('x-forwarded-for') || req.headers?.get('x-real-ip') || 'unknown',
          userAgent: req.headers?.get('user-agent') || 'unknown',
          oldData: doc,
          severity: 'high', // Deletions are high severity
        })
      }
    } catch (error) {
      console.error('Failed to create delete audit log:', error)
    }
  }
}

// Specialized hooks for different operation types
export const createSecurityAuditHook = (
  collectionName: string
): CollectionAfterChangeHook => {
  return createAuditHook(collectionName, 'high')
}

export const createFinancialAuditHook = (
  collectionName: string
): CollectionAfterChangeHook => {
  return createAuditHook(collectionName, 'critical')
}

// Helper function to get user info for audit logs
export const getUserInfo = (req: any) => ({
  user: req.user?.email || 'system',
  userId: req.user?.id,
  tenant: req.user?.tenant?.id,
  ipAddress: req.headers?.['x-forwarded-for'] || req.headers?.['x-real-ip'],
  userAgent: req.headers?.['user-agent'],
})
