// src/payload/hooks/index.ts
export { slugGenerator } from './slugGenerator';
export { auditLog } from './auditLog';
export { cacheInvalidation } from './cacheInvalidation';
export { searchIndex } from './searchIndex';
export { universalOGHook } from './universalOGHook';
export { generateOGImageHook, blogOGHook, productOGHook, serviceOGHook, eventOGHook, customerOGHook } from './generateOGImageHook';
export { autoUpdateOGImageHook } from './autoUpdateOGImageHook';
export {
  isAdmin,
  isManager,
  isStaff,
  isLoggedIn,
  ownsDocument,
  ownsTenant,
  sameTenant,
  hideSensitiveData
} from './accessControl';
