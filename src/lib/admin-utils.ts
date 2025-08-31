// Admin utilities and constants
// This file contains common utilities, constants, and helper functions for admin components

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Utility for combining Tailwind classes
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Date and time utilities
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function formatRelativeTime(date: string | Date): string {
  const now = new Date();
  const d = new Date(date);
  const diffInMinutes = Math.floor((now.getTime() - d.getTime()) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  return formatDate(d);
}

// Currency and number formatting
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US').format(num);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

// File size formatting
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Status and badge utilities
export type StatusType = 'success' | 'warning' | 'error' | 'info' | 'pending';

export function getStatusColor(status: StatusType): string {
  const colors = {
    success: 'text-green-600 bg-green-50 border-green-200',
    warning: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    error: 'text-red-600 bg-red-50 border-red-200',
    info: 'text-blue-600 bg-blue-50 border-blue-200',
    pending: 'text-gray-600 bg-gray-50 border-gray-200'
  };
  return colors[status] || colors.info;
}

export function getStatusIcon(status: StatusType) {
  // Import icons dynamically to avoid circular imports
  return status;
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
  return phoneRegex.test(phone);
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Array and object utilities
export function groupBy<T, K extends keyof any>(
  array: T[],
  key: (item: T) => K
): Record<K, T[]> {
  return array.reduce((result, item) => {
    const groupKey = key(item);
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {} as Record<K, T[]>);
}

export function sortBy<T>(
  array: T[],
  key: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Permission and role utilities
export const USER_ROLES = {
  admin: 'admin',
  manager: 'manager',
  barber: 'barber',
  customer: 'customer'
} as const;

export const PERMISSIONS = {
  view_dashboard: 'view_dashboard',
  manage_users: 'manage_users',
  manage_appointments: 'manage_appointments',
  manage_services: 'manage_services',
  manage_inventory: 'manage_inventory',
  view_reports: 'view_reports',
  manage_content: 'manage_content',
  manage_settings: 'manage_settings',
  manage_billing: 'manage_billing',
  manage_staff: 'manage_staff',
  view_analytics: 'view_analytics',
  export_data: 'export_data'
} as const;

export const ROLE_PERMISSIONS = {
  [USER_ROLES.admin]: Object.values(PERMISSIONS),
  [USER_ROLES.manager]: [
    PERMISSIONS.view_dashboard,
    PERMISSIONS.manage_users,
    PERMISSIONS.manage_appointments,
    PERMISSIONS.manage_services,
    PERMISSIONS.view_reports,
    PERMISSIONS.manage_content,
    PERMISSIONS.manage_staff,
    PERMISSIONS.view_analytics,
    PERMISSIONS.export_data
  ],
  [USER_ROLES.barber]: [
    PERMISSIONS.view_dashboard,
    PERMISSIONS.manage_appointments,
    PERMISSIONS.view_reports
  ],
  [USER_ROLES.customer]: [
    PERMISSIONS.manage_appointments
  ]
};

export function hasPermission(
  userRole: string,
  permission: string
): boolean {
  const rolePermissions = ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS];
  return rolePermissions ? rolePermissions.includes(permission) : false;
}

export function canAccessAdmin(userRole: string): boolean {
  return [USER_ROLES.admin, USER_ROLES.manager].includes(userRole as any);
}

// API utilities
export function createApiUrl(endpoint: string): string {
  return `/api${endpoint}`;
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const response = await fetch(createApiUrl(endpoint), {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    console.error(`API Error [${endpoint}]:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Local storage utilities for admin preferences
export const ADMIN_STORAGE_KEYS = {
  sidebarCollapsed: 'admin_sidebar_collapsed',
  theme: 'admin_theme',
  dateRange: 'admin_date_range',
  tablePageSize: 'admin_table_page_size',
  lastVisitedPage: 'admin_last_visited_page'
} as const;

export function getAdminPreference<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;

  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch {
    return defaultValue;
  }
}

export function setAdminPreference<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Failed to save admin preference:', error);
  }
}

// Table utilities
export interface TableColumn<T = any> {
  key: keyof T | string;
  title: string;
  sortable?: boolean;
  render?: (value: any, record: T) => React.ReactNode;
  width?: string;
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  emptyText?: string;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  className?: string;
}

// Form utilities
export function createFormData(data: Record<string, any>): FormData {
  const formData = new FormData();

  Object.entries(data).forEach(([key, value]) => {
    if (value !== null && value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach((item, index) => {
          formData.append(`${key}[${index}]`, item);
        });
      } else if (typeof value === 'object' && !(value instanceof File)) {
        formData.append(key, JSON.stringify(value));
      } else {
        formData.append(key, value);
      }
    }
  });

  return formData;
}

// Notification utilities
export function showToast(
  message: string,
  type: 'success' | 'error' | 'warning' | 'info' = 'info'
) {
  // This would integrate with your toast system
  console.log(`[${type.toUpperCase()}] ${message}`);
}

// Search and filter utilities
export function filterData<T>(
  data: T[],
  searchQuery: string,
  searchFields: (keyof T)[]
): T[] {
  if (!searchQuery) return data;

  const query = searchQuery.toLowerCase();
  return data.filter(item =>
    searchFields.some(field => {
      const value = item[field];
      return value && String(value).toLowerCase().includes(query);
    })
  );
}

export function paginateData<T>(
  data: T[],
  page: number,
  pageSize: number
): { data: T[]; total: number; totalPages: number } {
  const total = data.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  return {
    data: data.slice(startIndex, endIndex),
    total,
    totalPages
  };
}

// Export everything for easy importing
export * from './admin-api';
