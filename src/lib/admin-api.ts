// Centralized admin API client
// This file consolidates all admin-related API calls to reduce duplication

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

class AdminApiClient {
  private baseUrl = '/api';

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
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
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  // Analytics APIs
  async getPageViews(params?: { dateRange?: string }) {
    return this.request('/admin/analytics/page-views', {
      method: 'GET',
      body: params ? JSON.stringify(params) : undefined,
    });
  }

  async getUserAnalytics(params?: { dateRange?: string }) {
    return this.request('/admin/analytics/users', {
      method: 'GET',
      body: params ? JSON.stringify(params) : undefined,
    });
  }

  async getRevenueAnalytics(params?: { dateRange?: string }) {
    return this.request('/admin/analytics/revenue', {
      method: 'GET',
      body: params ? JSON.stringify(params) : undefined,
    });
  }

  async getAppointmentAnalytics(params?: { dateRange?: string }) {
    return this.request('/admin/analytics/appointments', {
      method: 'GET',
      body: params ? JSON.stringify(params) : undefined,
    });
  }

  async getCustomerAnalytics(params?: { dateRange?: string }) {
    return this.request('/admin/analytics/customers', {
      method: 'GET',
      body: params ? JSON.stringify(params) : undefined,
    });
  }

  async getActivityFeed(params?: { limit?: number; type?: string }) {
    return this.request('/admin/analytics/activities', {
      method: 'GET',
      body: params ? JSON.stringify(params) : undefined,
    });
  }

  // Content Management APIs
  async getContent(params?: { type?: string; status?: string; limit?: number }) {
    return this.request('/admin/content', {
      method: 'GET',
      body: params ? JSON.stringify(params) : undefined,
    });
  }

  async createContent(content: any) {
    return this.request('/admin/content', {
      method: 'POST',
      body: JSON.stringify(content),
    });
  }

  async updateContent(id: string, content: any) {
    return this.request(`/admin/content/${id}`, {
      method: 'PUT',
      body: JSON.stringify(content),
    });
  }

  async deleteContent(id: string) {
    return this.request(`/admin/content/${id}`, {
      method: 'DELETE',
    });
  }

  // User Management APIs
  async getUsers(params?: { role?: string; status?: string; limit?: number }) {
    return this.request('/admin/users', {
      method: 'GET',
      body: params ? JSON.stringify(params) : undefined,
    });
  }

  async createUser(user: any) {
    return this.request('/admin/users', {
      method: 'POST',
      body: JSON.stringify(user),
    });
  }

  async updateUser(id: string, user: any) {
    return this.request(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  async bulkUpdateUsers(userIds: string[], updates: any) {
    return this.request('/admin/users/bulk', {
      method: 'PUT',
      body: JSON.stringify({ userIds, updates }),
    });
  }

  // Settings APIs
  async getSettings() {
    return this.request('/admin/settings', {
      method: 'GET',
    });
  }

  async updateSettings(settings: any) {
    return this.request('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    });
  }

  async resetSettings() {
    return this.request('/admin/settings/reset', {
      method: 'POST',
    });
  }

  // Backup APIs
  async getBackups() {
    return this.request('/admin/backups', {
      method: 'GET',
    });
  }

  async createBackup(options?: { type?: string; include?: string[] }) {
    return this.request('/admin/backups', {
      method: 'POST',
      body: JSON.stringify(options || {}),
    });
  }

  async downloadBackup(backupId: string) {
    return this.request(`/admin/backups/${backupId}/download`, {
      method: 'GET',
    });
  }

  async deleteBackup(backupId: string) {
    return this.request(`/admin/backups/${backupId}`, {
      method: 'DELETE',
    });
  }

  async restoreBackup(backupId: string, options?: any) {
    return this.request(`/admin/backups/${backupId}/restore`, {
      method: 'POST',
      body: JSON.stringify(options || {}),
    });
  }

  // Notification APIs
  async getNotifications(params?: { unread?: boolean; limit?: number }) {
    return this.request('/admin/notifications', {
      method: 'GET',
      body: params ? JSON.stringify(params) : undefined,
    });
  }

  async markNotificationRead(notificationId: string) {
    return this.request(`/admin/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async markAllNotificationsRead() {
    return this.request('/admin/notifications/mark-all-read', {
      method: 'PUT',
    });
  }

  async deleteNotification(notificationId: string) {
    return this.request(`/admin/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }

  // System Health APIs
  async getSystemHealth() {
    return this.request('/admin/system/health', {
      method: 'GET',
    });
  }

  async getSystemLogs(params?: { level?: string; limit?: number; since?: string }) {
    return this.request('/admin/system/logs', {
      method: 'GET',
      body: params ? JSON.stringify(params) : undefined,
    });
  }

  async clearSystemCache() {
    return this.request('/admin/system/cache/clear', {
      method: 'POST',
    });
  }

  // Page Builder APIs
  async getPages(params?: { status?: string; limit?: number }) {
    return this.request('/admin/pages', {
      method: 'GET',
      body: params ? JSON.stringify(params) : undefined,
    });
  }

  async createPage(page: any) {
    return this.request('/admin/pages', {
      method: 'POST',
      body: JSON.stringify(page),
    });
  }

  async updatePage(id: string, page: any) {
    return this.request(`/admin/pages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(page),
    });
  }

  async publishPage(id: string) {
    return this.request(`/admin/pages/${id}/publish`, {
      method: 'POST',
    });
  }

  async deletePage(id: string) {
    return this.request(`/admin/pages/${id}`, {
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const adminApi = new AdminApiClient();

// Export types
export type { ApiResponse };
