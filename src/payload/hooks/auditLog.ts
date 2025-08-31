// src/payload/hooks/auditLog.ts
import type { FieldHook } from 'payload';

export const auditLog: FieldHook = async ({ req, operation, originalDoc, data }: any) => {
  try {
    const userId = req?.user?.id || 'system';
    const collectionSlug = req?.collection?.slug || 'unknown';

    await req.payload.create({
      collection: 'audit-logs' as any as any,
      data: {
        user: userId,
        collection: collectionSlug,
        docId: data?.id || originalDoc?.id,
        action: operation,
        delta: {
          before: originalDoc || null,
          after: data || null,
        },
        timestamp: new Date().toISOString(),
        ipAddress: req?.headers?.get('x-forwarded-for') || req?.headers?.get('x-real-ip'),
        userAgent: req?.headers?.get('user-agent'),
      },
    });
  } catch (err) {
    console.error('Failed to write audit log:', err);
    // Don't throw error to avoid breaking the main operation
  }
};
