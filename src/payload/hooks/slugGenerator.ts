// src/payload/hooks/slugGenerator.ts
import type { FieldHook } from 'payload';

export const slugGenerator: FieldHook = async ({ value, data }: any) => {
  if (value) return value;
  if (!data?.title) return '';

  return data.title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 60);
};
