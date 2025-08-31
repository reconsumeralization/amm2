// src/payload/lib/monitoring.ts
export const yoloMonitoring = {
  // Monitoring utilities for Payload operations
  trackOperation: (operation: string, data?: any) => {
    console.log(`[MONITOR] ${operation}`, data ? JSON.stringify(data, null, 2) : '');
  },

  logValidation: (field: string, value: any, isValid: boolean) => {
    if (!isValid) {
      console.warn(`[VALIDATION] Field "${field}" failed validation:`, value);
    }
  },

  trackCollectionOperation: (collection: string, operation: string, id?: string) => {
    console.log(`[COLLECTION] ${operation} on ${collection}${id ? ` (ID: ${id})` : ''}`);
  },
};

export const monitoringHook = ({ value, field, operation, req }: any) => {
  yoloMonitoring.trackOperation(`${operation}:${field.name}`, {
    value,
    collection: req.collection?.config?.slug,
    user: req.user?.id,
  });
  return value;
};
