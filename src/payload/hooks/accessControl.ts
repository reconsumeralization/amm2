// src/payload/hooks/accessControl.ts
import type { Access } from 'payload';

export const isAdmin: Access = ({ req }: any) => {
  return Boolean(req.user?.role === 'admin' || req.user?.roles?.includes('admin'));
};

export const isManager: Access = ({ req }: any) => {
  return Boolean(
    req.user?.role === 'admin' ||
    req.user?.role === 'manager' ||
    req.user?.roles?.includes('admin') ||
    req.user?.roles?.includes('manager')
  );
};

export const isStaff: Access = ({ req }: any) => {
  return Boolean(
    req.user?.role === 'admin' ||
    req.user?.role === 'manager' ||
    req.user?.role === 'barber' ||
    req.user?.roles?.includes('admin') ||
    req.user?.roles?.includes('manager') ||
    req.user?.roles?.includes('barber')
  );
};

export const isLoggedIn: Access = ({ req }: any) => {
  return Boolean(req.user);
};

export const ownsDocument: Access = ({ req, id }: any) => {
  return Boolean(
    req.user?.id === id ||
    req.user?.role === 'admin' ||
    req.user?.roles?.includes('admin')
  );
};

export const ownsTenant: Access = ({ req, data }: any) => {
  return Boolean(
    req.user?.tenant?.id === data?.tenant ||
    req.user?.role === 'admin' ||
    req.user?.roles?.includes('admin')
  );
};

export const sameTenant: Access = ({ req, data }: any) => {
  if (!req.user) return false;
  if (req.user.role === 'admin') return true;

  // For new documents, check if user can create in their tenant
  if (!data?.id) {
    return Boolean(req.user.tenant?.id);
  }

  // For existing documents, check tenant matches
  return Boolean(req.user.tenant?.id === data?.tenant);
};

// Field-level access control
export const hideSensitiveData = ({ req, data }: any) => {
  // Remove sensitive fields for non-admin users
  if (!isAdmin({ req })) {
    const { password, ...safeData } = data || {};
    return safeData;
  }
  return data;
};
