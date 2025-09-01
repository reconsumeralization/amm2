import { MCPHandler, MCPRequest, MCPResponse } from './types';
import { UserRole, Permission } from './rbac-types';
import payload from 'payload';
import { supabase } from '@/lib/supabase';
import { createClient } from '@supabase/supabase-js';

// Role-Based Access Control Types
export interface UserContext {
  id: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
  tenantId?: string;
}

export interface RBACConfig {
  allowPublic: boolean;
  requiredRole?: UserRole;
  requiredPermissions?: Permission[];
  allowSelf?: boolean;
}

// Comprehensive Application Controller
export class ComprehensiveAppController implements MCPHandler {
  private userContext: UserContext | null = null;

  constructor() {
    this.initializeRealtimeSubscriptions();
  }

  // Authentication & Authorization Methods
  async authenticateUser(email: string, password: string): Promise<UserContext> {
    try {
      // Try Payload authentication first (admin/staff)
      const payloadResult = await payload.login({
        collection: 'users',
        data: { email, password }
      });

      if (payloadResult.user) {
        this.userContext = {
          id: payloadResult.user.id,
          email: payloadResult.user.email,
          role: payloadResult.user.role as UserRole,
          permissions: this.getPermissionsForRole(payloadResult.user.role as UserRole),
          tenantId: payloadResult.user.tenant
        };
        return this.userContext;
      }
    } catch (error) {
      // Fall back to Supabase authentication (customers)
      const { data, error: supabaseError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (supabaseError) throw supabaseError;

      if (data.user) {
        this.userContext = {
          id: data.user.id,
          email: data.user.email!,
          role: 'customer' as UserRole,
          permissions: this.getPermissionsForRole('customer'),
          tenantId: data.user.user_metadata?.tenantId
        };
        return this.userContext;
      }
    }

    throw new Error('Authentication failed');
  }

  setUserContext(context: UserContext): void {
    this.userContext = context;
  }

  checkPermission(action: string, resource: string, context?: any): boolean {
    if (!this.userContext) return false;

    // Check role-based permissions
    const hasRolePermission = this.userContext.permissions.some(permission =>
      permission.resource === resource &&
      (permission.actions.includes('*') || permission.actions.includes(action))
    );

    if (!hasRolePermission) return false;

    // Check resource-specific conditions
    if (context && typeof context === 'object') {
      // Allow self-operations
      if (context.allowSelf && context.resourceId === this.userContext.id) {
        return true;
      }

      // Check tenant isolation
      if (this.userContext.tenantId && context.tenantId !== this.userContext.tenantId) {
        return false;
      }
    }

    return true;
  }

  private getPermissionsForRole(role: UserRole): Permission[] {
    const rolePermissions: Record<UserRole, Permission[]> = {
      admin: [
        { resource: '*', actions: ['*'] }
      ],
      manager: [
        { resource: 'users', actions: ['read', 'create', 'update'] },
        { resource: 'customers', actions: ['read', 'create', 'update', 'delete'] },
        { resource: 'appointments', actions: ['read', 'create', 'update', 'cancel'] },
        { resource: 'staff', actions: ['read', 'update'] },
        { resource: 'services', actions: ['read', 'create', 'update'] },
        { resource: 'products', actions: ['read', 'create', 'update'] },
        { resource: 'analytics', actions: ['read'] },
        { resource: 'reports', actions: ['read'] }
      ],
      barber: [
        { resource: 'appointments', actions: ['read', 'update'], conditions: { assignedBarber: 'self' } },
        { resource: 'customers', actions: ['read'], conditions: { hasAppointment: true } },
        { resource: 'services', actions: ['read'] },
        { resource: 'schedule', actions: ['read', 'update'], conditions: { owner: 'self' } }
      ],
      customer: [
        { resource: 'appointments', actions: ['read', 'create', 'cancel'], conditions: { owner: 'self' } },
        { resource: 'profile', actions: ['read', 'update'], conditions: { owner: 'self' } },
        { resource: 'services', actions: ['read'] },
        { resource: 'products', actions: ['read'] },
        { resource: 'loyalty', actions: ['read'], conditions: { owner: 'self' } }
      ]
    };

    return rolePermissions[role] || [];
  }

  // User Management Methods
  async getUsers(filters?: any): Promise<any[]> {
    if (!this.checkPermission('read', 'users')) {
      throw new Error('Insufficient permissions to read users');
    }

    const query = await payload.find({
      collection: 'users',
      where: filters || {},
      limit: 100
    });

    return query.docs;
  }

  async getUser(id: string): Promise<any> {
    if (!this.checkPermission('read', 'users', { resourceId: id })) {
      throw new Error('Insufficient permissions to read user');
    }

    return await payload.findByID({
      collection: 'users',
      id
    });
  }

  async createUser(userData: any): Promise<any> {
    if (!this.checkPermission('create', 'users')) {
      throw new Error('Insufficient permissions to create users');
    }

    return await payload.create({
      collection: 'users',
      data: userData
    });
  }

  async updateUser(id: string, userData: any): Promise<any> {
    if (!this.checkPermission('update', 'users', { resourceId: id })) {
      throw new Error('Insufficient permissions to update user');
    }

    return await payload.update({
      collection: 'users',
      id,
      data: userData
    });
  }

  async deleteUser(id: string): Promise<boolean> {
    if (!this.checkPermission('delete', 'users')) {
      throw new Error('Insufficient permissions to delete users');
    }

    await payload.delete({
      collection: 'users',
      id
    });
    return true;
  }

  async bulkUpdateUsers(userIds: string[], updates: any): Promise<any[]> {
    if (!this.checkPermission('update', 'users')) {
      throw new Error('Insufficient permissions to bulk update users');
    }

    const results = [];
    for (const id of userIds) {
      const updated = await this.updateUser(id, updates);
      results.push(updated);
    }
    return results;
  }

  async changeUserRole(id: string, role: UserRole): Promise<any> {
    if (!this.checkPermission('update', 'users')) {
      throw new Error('Insufficient permissions to change user roles');
    }

    return await this.updateUser(id, { role });
  }

  // Customer Management Methods
  async getCustomers(filters?: any): Promise<any[]> {
    if (!this.checkPermission('read', 'customers')) {
      throw new Error('Insufficient permissions to read customers');
    }

    const query = await payload.find({
      collection: 'customers',
      where: filters || {},
      limit: 100
    });

    return query.docs;
  }

  async getCustomer(id: string): Promise<any> {
    if (!this.checkPermission('read', 'customers')) {
      throw new Error('Insufficient permissions to read customer');
    }

    return await payload.findByID({
      collection: 'customers',
      id
    });
  }

  async createCustomer(customerData: any): Promise<any> {
    if (!this.checkPermission('create', 'customers')) {
      throw new Error('Insufficient permissions to create customers');
    }

    return await payload.create({
      collection: 'customers',
      data: customerData
    });
  }

  async updateCustomer(id: string, customerData: any): Promise<any> {
    if (!this.checkPermission('update', 'customers')) {
      throw new Error('Insufficient permissions to update customers');
    }

    return await payload.update({
      collection: 'customers',
      id,
      data: customerData
    });
  }

  async deleteCustomer(id: string): Promise<boolean> {
    if (!this.checkPermission('delete', 'customers')) {
      throw new Error('Insufficient permissions to delete customers');
    }

    await payload.delete({
      collection: 'customers',
      id
    });
    return true;
  }

  // Appointment Management Methods
  async getAppointments(filters?: any): Promise<any[]> {
    if (!this.checkPermission('read', 'appointments')) {
      throw new Error('Insufficient permissions to read appointments');
    }

    const query = await payload.find({
      collection: 'appointments',
      where: filters || {},
      limit: 100
    });

    return query.docs;
  }

  async getAppointment(id: string): Promise<any> {
    if (!this.checkPermission('read', 'appointments')) {
      throw new Error('Insufficient permissions to read appointment');
    }

    return await payload.findByID({
      collection: 'appointments',
      id
    });
  }

  async createAppointment(appointmentData: any): Promise<any> {
    if (!this.checkPermission('create', 'appointments')) {
      throw new Error('Insufficient permissions to create appointments');
    }

    return await payload.create({
      collection: 'appointments',
      data: appointmentData
    });
  }

  async updateAppointment(id: string, appointmentData: any): Promise<any> {
    if (!this.checkPermission('update', 'appointments')) {
      throw new Error('Insufficient permissions to update appointments');
    }

    return await payload.update({
      collection: 'appointments',
      id,
      data: appointmentData
    });
  }

  async cancelAppointment(id: string, reason?: string): Promise<any> {
    if (!this.checkPermission('cancel', 'appointments')) {
      throw new Error('Insufficient permissions to cancel appointments');
    }

    return await this.updateAppointment(id, {
      status: 'cancelled',
      cancellationReason: reason,
      cancelledAt: new Date().toISOString()
    });
  }

  async getAppointmentAvailability(date: string, serviceId?: string): Promise<any[]> {
    // This can be public or require authentication based on business rules
    const { data, error } = await supabase
      .from('appointment_availability')
      .select('*')
      .eq('date', date)
      .eq(serviceId ? 'service_id' : '', serviceId || '');

    if (error) throw error;
    return data;
  }

  // Staff Management Methods
  async getStaff(filters?: any): Promise<any[]> {
    if (!this.checkPermission('read', 'staff')) {
      throw new Error('Insufficient permissions to read staff');
    }

    const query = await payload.find({
      collection: 'stylists',
      where: filters || {},
      limit: 100
    });

    return query.docs;
  }

  async getStaffMember(id: string): Promise<any> {
    if (!this.checkPermission('read', 'staff')) {
      throw new Error('Insufficient permissions to read staff member');
    }

    return await payload.findByID({
      collection: 'stylists',
      id
    });
  }

  async updateStaffMember(id: string, staffData: any): Promise<any> {
    if (!this.checkPermission('update', 'staff')) {
      throw new Error('Insufficient permissions to update staff');
    }

    return await payload.update({
      collection: 'stylists',
      id,
      data: staffData
    });
  }

  async getStaffSchedule(staffId: string, date?: string): Promise<any[]> {
    if (!this.checkPermission('read', 'schedule')) {
      throw new Error('Insufficient permissions to read staff schedules');
    }

    const query = await payload.find({
      collection: 'staff-schedules',
      where: {
        stylist: { equals: staffId },
        ...(date && { date: { equals: date } })
      }
    });

    return query.docs;
  }

  async updateStaffSchedule(scheduleId: string, scheduleData: any): Promise<any> {
    if (!this.checkPermission('update', 'schedule')) {
      throw new Error('Insufficient permissions to update staff schedules');
    }

    return await payload.update({
      collection: 'staff-schedules',
      id: scheduleId,
      data: scheduleData
    });
  }

  // Services Management Methods
  async getServices(filters?: any): Promise<any[]> {
    // Services are typically public
    const query = await payload.find({
      collection: 'services',
      where: filters || {},
      limit: 100
    });

    return query.docs;
  }

  async getService(id: string): Promise<any> {
    return await payload.findByID({
      collection: 'services',
      id
    });
  }

  async createService(serviceData: any): Promise<any> {
    if (!this.checkPermission('create', 'services')) {
      throw new Error('Insufficient permissions to create services');
    }

    return await payload.create({
      collection: 'services',
      data: serviceData
    });
  }

  async updateService(id: string, serviceData: any): Promise<any> {
    if (!this.checkPermission('update', 'services')) {
      throw new Error('Insufficient permissions to update services');
    }

    return await payload.update({
      collection: 'services',
      id,
      data: serviceData
    });
  }

  // Products Management Methods
  async getProducts(filters?: any): Promise<any[]> {
    // Products are typically public
    const query = await payload.find({
      collection: 'products',
      where: filters || {},
      limit: 100
    });

    return query.docs;
  }

  async getProduct(id: string): Promise<any> {
    return await payload.findByID({
      collection: 'products',
      id
    });
  }

  async createProduct(productData: any): Promise<any> {
    if (!this.checkPermission('create', 'products')) {
      throw new Error('Insufficient permissions to create products');
    }

    return await payload.create({
      collection: 'products',
      data: productData
    });
  }

  async updateProduct(id: string, productData: any): Promise<any> {
    if (!this.checkPermission('update', 'products')) {
      throw new Error('Insufficient permissions to update products');
    }

    return await payload.update({
      collection: 'products',
      id,
      data: productData
    });
  }

  // Analytics and Reporting Methods
  async getAnalytics(type: string, filters?: any): Promise<any> {
    if (!this.checkPermission('read', 'analytics')) {
      throw new Error('Insufficient permissions to read analytics');
    }

    const analyticsTypes = {
      users: async () => {
        const { data, error } = await supabase
          .from('user_analytics')
          .select('*')
          .single();

        if (error) throw error;
        return data;
      },
      appointments: async () => {
        const { data, error } = await supabase
          .from('appointment_analytics')
          .select('*')
          .single();

        if (error) throw error;
        return data;
      },
      revenue: async () => {
        const { data, error } = await supabase
          .from('revenue_analytics')
          .select('*')
          .single();

        if (error) throw error;
        return data;
      }
    };

    if (!analyticsTypes[type]) {
      throw new Error(`Unknown analytics type: ${type}`);
    }

    return await analyticsTypes[type]();
  }

  async getDashboardStats(): Promise<any> {
    if (!this.checkPermission('read', 'analytics')) {
      throw new Error('Insufficient permissions to read dashboard stats');
    }

    const [
      userStats,
      appointmentStats,
      revenueStats
    ] = await Promise.all([
      this.getAnalytics('users'),
      this.getAnalytics('appointments'),
      this.getAnalytics('revenue')
    ]);

    return {
      users: userStats,
      appointments: appointmentStats,
      revenue: revenueStats
    };
  }

  // Content Management Methods
  async getPages(filters?: any): Promise<any[]> {
    const query = await payload.find({
      collection: 'pages',
      where: filters || {},
      limit: 100
    });

    return query.docs;
  }

  async getPage(id: string): Promise<any> {
    return await payload.findByID({
      collection: 'pages',
      id
    });
  }

  async createPage(pageData: any): Promise<any> {
    if (!this.checkPermission('create', 'content')) {
      throw new Error('Insufficient permissions to create pages');
    }

    return await payload.create({
      collection: 'pages',
      data: pageData
    });
  }

  async updatePage(id: string, pageData: any): Promise<any> {
    if (!this.checkPermission('update', 'content')) {
      throw new Error('Insufficient permissions to update pages');
    }

    return await payload.update({
      collection: 'pages',
      id,
      data: pageData
    });
  }

  async getBlogPosts(filters?: any): Promise<any[]> {
    const query = await payload.find({
      collection: 'blog-posts',
      where: filters || {},
      limit: 100
    });

    return query.docs;
  }

  async createBlogPost(postData: any): Promise<any> {
    if (!this.checkPermission('create', 'content')) {
      throw new Error('Insufficient permissions to create blog posts');
    }

    return await payload.create({
      collection: 'blog-posts',
      data: postData
    });
  }

  // Search and Filtering Methods
  async search(query: string, type?: string, filters?: any): Promise<any[]> {
    const searchTypes = {
      users: async () => {
        if (!this.checkPermission('read', 'users')) {
          throw new Error('Insufficient permissions to search users');
        }

        const { data, error } = await supabase
          .from('users')
          .select('*')
          .or(`name.ilike.%${query}%,email.ilike.%${query}%`)
          .limit(50);

        if (error) throw error;
        return data;
      },
      customers: async () => {
        if (!this.checkPermission('read', 'customers')) {
          throw new Error('Insufficient permissions to search customers');
        }

        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%`)
          .limit(50);

        if (error) throw error;
        return data;
      },
      appointments: async () => {
        if (!this.checkPermission('read', 'appointments')) {
          throw new Error('Insufficient permissions to search appointments');
        }

        const { data, error } = await supabase
          .from('appointments')
          .select('*')
          .or(`customer_name.ilike.%${query}%,service_name.ilike.%${query}%`)
          .limit(50);

        if (error) throw error;
        return data;
      },
      services: async () => {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(50);

        if (error) throw error;
        return data;
      },
      products: async () => {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
          .limit(50);

        if (error) throw error;
        return data;
      }
    };

    if (type && searchTypes[type]) {
      return await searchTypes[type]();
    }

    // Global search across all types
    const results = await Promise.allSettled([
      searchTypes.users(),
      searchTypes.customers(),
      searchTypes.appointments(),
      searchTypes.services(),
      searchTypes.products()
    ]);

    return results
      .filter(result => result.status === 'fulfilled')
      .flatMap(result => (result as PromiseFulfilledResult<any[]>).value);
  }

  // Business Logic Methods
  async bookAppointment(appointmentData: any): Promise<any> {
    if (!this.checkPermission('create', 'appointments')) {
      throw new Error('Insufficient permissions to book appointments');
    }

    // Check availability
    const availability = await this.getAppointmentAvailability(
      appointmentData.date,
      appointmentData.service
    );

    if (availability.length === 0) {
      throw new Error('No availability for the selected date and service');
    }

    // Check for conflicts
    const conflicts = await payload.find({
      collection: 'appointments',
      where: {
        date: { equals: appointmentData.date },
        time: { equals: appointmentData.time },
        stylist: { equals: appointmentData.stylist },
        status: { not_in: ['cancelled'] }
      }
    });

    if (conflicts.docs.length > 0) {
      throw new Error('Time slot is already booked');
    }

    // Create appointment
    return await this.createAppointment({
      ...appointmentData,
      status: 'confirmed',
      bookedAt: new Date().toISOString(),
      bookedBy: this.userContext?.id
    });
  }

  async processPayment(paymentData: any): Promise<any> {
    if (!this.checkPermission('create', 'payments')) {
      throw new Error('Insufficient permissions to process payments');
    }

    // Integration with payment processor (Stripe, etc.)
    const { data, error } = await supabase.functions.invoke('process-payment', {
      body: paymentData
    });

    if (error) throw error;
    return data;
  }

  async addLoyaltyPoints(customerId: string, points: number, reason: string): Promise<any> {
    if (!this.checkPermission('update', 'loyalty')) {
      throw new Error('Insufficient permissions to manage loyalty points');
    }

    const { data, error } = await supabase
      .from('loyalty_transactions')
      .insert({
        customer_id: customerId,
        points,
        reason,
        created_by: this.userContext?.id
      });

    if (error) throw error;

    // Update customer's total points
    const { data: customer } = await supabase
      .from('customers')
      .select('loyalty_points')
      .eq('id', customerId)
      .single();

    const newPoints = (customer?.loyalty_points || 0) + points;

    await supabase
      .from('customers')
      .update({ loyalty_points: newPoints })
      .eq('id', customerId);

    return { newPoints, transaction: data };
  }

  async generateReport(type: string, filters?: any): Promise<any> {
    if (!this.checkPermission('read', 'reports')) {
      throw new Error('Insufficient permissions to generate reports');
    }

    const reportTypes = {
      appointments: async () => {
        const { data, error } = await supabase
          .from('appointment_reports')
          .select('*')
          .match(filters || {});

        if (error) throw error;
        return data;
      },
      revenue: async () => {
        const { data, error } = await supabase
          .from('revenue_reports')
          .select('*')
          .match(filters || {});

        if (error) throw error;
        return data;
      },
      customer: async () => {
        const { data, error } = await supabase
          .from('customer_reports')
          .select('*')
          .match(filters || {});

        if (error) throw error;
        return data;
      }
    };

    if (!reportTypes[type]) {
      throw new Error(`Unknown report type: ${type}`);
    }

    return await reportTypes[type]();
  }

  // Real-time Methods
  private initializeRealtimeSubscriptions(): void {
    if (!supabase) return;

    // Appointments real-time updates
    supabase
      .channel('appointments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'appointments'
        },
        (payload) => {
          this.handleRealtimeUpdate('appointments', payload);
        }
      )
      .subscribe();

    // Users real-time updates
    supabase
      .channel('users_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'users'
        },
        (payload) => {
          this.handleRealtimeUpdate('users', payload);
        }
      )
      .subscribe();

    // Customers real-time updates
    supabase
      .channel('customers_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers'
        },
        (payload) => {
          this.handleRealtimeUpdate('customers', payload);
        }
      )
      .subscribe();
  }

  private handleRealtimeUpdate(table: string, payload: any): void {
    // Emit events for real-time updates
    // This can be used by hooks or UI components
    const event = new CustomEvent(`realtime:${table}`, {
      detail: payload
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(event);
    }
  }

  // Notification Methods
  async sendNotification(userId: string, notification: any): Promise<any> {
    if (!this.checkPermission('create', 'notifications')) {
      throw new Error('Insufficient permissions to send notifications');
    }

    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        ...notification,
        created_by: this.userContext?.id
      });

    if (error) throw error;
    return data;
  }

  async getNotifications(userId?: string): Promise<any[]> {
    const targetUserId = userId || this.userContext?.id;
    if (!targetUserId) {
      throw new Error('User ID required');
    }

    if (!this.checkPermission('read', 'notifications', { resourceId: targetUserId })) {
      throw new Error('Insufficient permissions to read notifications');
    }

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;
    return data;
  }

  // MCP Handler Implementation
  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    const { method, params } = request;

    try {
      let result: any;

      switch (method) {
        // Authentication
        case 'authenticate':
          result = await this.authenticateUser(params.email, params.password);
          break;

        // User Management
        case 'getUsers':
          result = await this.getUsers(params.filters);
          break;
        case 'getUser':
          result = await this.getUser(params.id);
          break;
        case 'createUser':
          result = await this.createUser(params.userData);
          break;
        case 'updateUser':
          result = await this.updateUser(params.id, params.userData);
          break;
        case 'deleteUser':
          result = await this.deleteUser(params.id);
          break;
        case 'changeUserRole':
          result = await this.changeUserRole(params.id, params.role);
          break;

        // Customer Management
        case 'getCustomers':
          result = await this.getCustomers(params.filters);
          break;
        case 'getCustomer':
          result = await this.getCustomer(params.id);
          break;
        case 'createCustomer':
          result = await this.createCustomer(params.customerData);
          break;
        case 'updateCustomer':
          result = await this.updateCustomer(params.id, params.customerData);
          break;
        case 'deleteCustomer':
          result = await this.deleteCustomer(params.id);
          break;

        // Appointment Management
        case 'getAppointments':
          result = await this.getAppointments(params.filters);
          break;
        case 'getAppointment':
          result = await this.getAppointment(params.id);
          break;
        case 'createAppointment':
          result = await this.createAppointment(params.appointmentData);
          break;
        case 'updateAppointment':
          result = await this.updateAppointment(params.id, params.appointmentData);
          break;
        case 'cancelAppointment':
          result = await this.cancelAppointment(params.id, params.reason);
          break;
        case 'bookAppointment':
          result = await this.bookAppointment(params.appointmentData);
          break;
        case 'getAppointmentAvailability':
          result = await this.getAppointmentAvailability(params.date, params.serviceId);
          break;

        // Staff Management
        case 'getStaff':
          result = await this.getStaff(params.filters);
          break;
        case 'getStaffMember':
          result = await this.getStaffMember(params.id);
          break;
        case 'updateStaffMember':
          result = await this.updateStaffMember(params.id, params.staffData);
          break;
        case 'getStaffSchedule':
          result = await this.getStaffSchedule(params.staffId, params.date);
          break;
        case 'updateStaffSchedule':
          result = await this.updateStaffSchedule(params.scheduleId, params.scheduleData);
          break;

        // Services Management
        case 'getServices':
          result = await this.getServices(params.filters);
          break;
        case 'getService':
          result = await this.getService(params.id);
          break;
        case 'createService':
          result = await this.createService(params.serviceData);
          break;
        case 'updateService':
          result = await this.updateService(params.id, params.serviceData);
          break;

        // Products Management
        case 'getProducts':
          result = await this.getProducts(params.filters);
          break;
        case 'getProduct':
          result = await this.getProduct(params.id);
          break;
        case 'createProduct':
          result = await this.createProduct(params.productData);
          break;
        case 'updateProduct':
          result = await this.updateProduct(params.id, params.productData);
          break;

        // Analytics & Reporting
        case 'getAnalytics':
          result = await this.getAnalytics(params.type, params.filters);
          break;
        case 'getDashboardStats':
          result = await this.getDashboardStats();
          break;
        case 'generateReport':
          result = await this.generateReport(params.type, params.filters);
          break;

        // Content Management
        case 'getPages':
          result = await this.getPages(params.filters);
          break;
        case 'getPage':
          result = await this.getPage(params.id);
          break;
        case 'createPage':
          result = await this.createPage(params.pageData);
          break;
        case 'updatePage':
          result = await this.updatePage(params.id, params.pageData);
          break;
        case 'getBlogPosts':
          result = await this.getBlogPosts(params.filters);
          break;
        case 'createBlogPost':
          result = await this.createBlogPost(params.postData);
          break;

        // Search & Business Logic
        case 'search':
          result = await this.search(params.query, params.type, params.filters);
          break;
        case 'processPayment':
          result = await this.processPayment(params.paymentData);
          break;
        case 'addLoyaltyPoints':
          result = await this.addLoyaltyPoints(params.customerId, params.points, params.reason);
          break;

        // Notifications
        case 'sendNotification':
          result = await this.sendNotification(params.userId, params.notification);
          break;
        case 'getNotifications':
          result = await this.getNotifications(params.userId);
          break;

        // Bulk Operations
        case 'bulkUpdateUsers':
          result = await this.bulkUpdateUsers(params.userIds, params.updates);
          break;

        default:
          throw new Error(`Unknown method: ${method}`);
      }

      return {
        id: request.id,
        result,
        timestamp: Date.now()
      };
    } catch (error) {
      return {
        id: request.id,
        error: {
          code: 500,
          message: error instanceof Error ? error.message : 'Internal server error',
          data: error
        },
        timestamp: Date.now()
      };
    }
  }

  validateRequest(request: MCPRequest): boolean {
    if (!request.id || !request.method) {
      return false;
    }

    // Validate method exists
    const validMethods = [
      'authenticate',
      'getUsers', 'getUser', 'createUser', 'updateUser', 'deleteUser', 'changeUserRole',
      'getCustomers', 'getCustomer', 'createCustomer', 'updateCustomer', 'deleteCustomer',
      'getAppointments', 'getAppointment', 'createAppointment', 'updateAppointment', 'cancelAppointment', 'bookAppointment', 'getAppointmentAvailability',
      'getStaff', 'getStaffMember', 'updateStaffMember', 'getStaffSchedule', 'updateStaffSchedule',
      'getServices', 'getService', 'createService', 'updateService',
      'getProducts', 'getProduct', 'createProduct', 'updateProduct',
      'getAnalytics', 'getDashboardStats', 'generateReport',
      'getPages', 'getPage', 'createPage', 'updatePage', 'getBlogPosts', 'createBlogPost',
      'search', 'processPayment', 'addLoyaltyPoints',
      'sendNotification', 'getNotifications',
      'bulkUpdateUsers'
    ];

    return validMethods.includes(request.method);
  }

  // Utility Methods
  getCurrentUser(): UserContext | null {
    return this.userContext;
  }

  hasPermission(action: string, resource: string): boolean {
    return this.checkPermission(action, resource);
  }

  logout(): void {
    this.userContext = null;
  }
}

// Export singleton instance
export const appController = new ComprehensiveAppController();
