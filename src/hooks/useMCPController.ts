import { useState, useEffect, useCallback, useRef } from 'react';
import { MCPRequest, MCPResponse } from '@/mcp/types';
import { UserRole } from '@/mcp/rbac-types';

export interface MCPConnectionState {
  isConnected: boolean;
  isAuthenticated: boolean;
  userRole?: UserRole;
  userId?: string;
  tenantId?: string;
  lastActivity: number;
  error?: string;
}

export interface MCPHookResult<T = any> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (method: string, params?: Record<string, unknown>) => Promise<T>;
  connectionState: MCPConnectionState;
}

export function useMCPController() {
  const [connectionState, setConnectionState] = useState<MCPConnectionState>({
    isConnected: false,
    isAuthenticated: false,
    lastActivity: Date.now()
  });

  const wsRef = useRef<WebSocket | null>(null);
  const requestIdRef = useRef(0);
  const pendingRequestsRef = useRef<Map<string, {
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }>>(new Map());

  // Initialize WebSocket connection
  useEffect(() => {
    const connect = () => {
      try {
        const ws = new WebSocket(`ws://localhost:3001`);

        ws.onopen = () => {
          console.log('MCP WebSocket connected');
          setConnectionState(prev => ({
            ...prev,
            isConnected: true,
            error: undefined
          }));
        };

        ws.onmessage = (event) => {
          try {
            const response: MCPResponse = JSON.parse(event.data);
            const pendingRequest = pendingRequestsRef.current.get(response.id);

            if (pendingRequest) {
              if (response.error) {
                pendingRequest.reject(new Error(response.error.message));
              } else {
                pendingRequest.resolve(response.result);
              }
              pendingRequestsRef.current.delete(response.id);
            }

            setConnectionState(prev => ({
              ...prev,
              lastActivity: Date.now()
            }));
          } catch (error) {
            console.error('Failed to parse MCP response:', error);
          }
        };

        ws.onclose = () => {
          console.log('MCP WebSocket disconnected');
          setConnectionState(prev => ({
            ...prev,
            isConnected: false,
            isAuthenticated: false
          }));

          // Attempt to reconnect after 5 seconds
          setTimeout(connect, 5000);
        };

        ws.onerror = (error) => {
          console.error('MCP WebSocket error:', error);
          setConnectionState(prev => ({
            ...prev,
            error: 'Connection error'
          }));
        };

        wsRef.current = ws;
      } catch (error) {
        console.error('Failed to connect to MCP:', error);
        setConnectionState(prev => ({
          ...prev,
          error: 'Failed to connect'
        }));
      }
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Send MCP request
  const sendRequest = useCallback(async <T = any>(
    method: string,
    params: Record<string, unknown> = {}
  ): Promise<T> => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      throw new Error('MCP connection not available');
    }

    const requestId = `req_${++requestIdRef.current}`;
    const request: MCPRequest = {
      id: requestId,
      method,
      params,
      timestamp: Date.now()
    };

    return new Promise<T>((resolve, reject) => {
      pendingRequestsRef.current.set(requestId, { resolve, reject });

      try {
        wsRef.current!.send(JSON.stringify(request));

        // Timeout after 30 seconds
        setTimeout(() => {
          if (pendingRequestsRef.current.has(requestId)) {
            pendingRequestsRef.current.delete(requestId);
            reject(new Error('Request timeout'));
          }
        }, 30000);
      } catch (error) {
        pendingRequestsRef.current.delete(requestId);
        reject(error);
      }
    });
  }, []);

  // Authentication methods
  const authenticate = useCallback(async (email: string, password: string) => {
    try {
      const result = await sendRequest('authenticate', { email, password });

      setConnectionState(prev => ({
        ...prev,
        isAuthenticated: true,
        userRole: result.role,
        userId: result.id,
        tenantId: result.tenantId
      }));

      return result;
    } catch (error) {
      setConnectionState(prev => ({
        ...prev,
        isAuthenticated: false,
        error: error instanceof Error ? error.message : 'Authentication failed'
      }));
      throw error;
    }
  }, [sendRequest]);

  const logout = useCallback(() => {
    setConnectionState(prev => ({
      ...prev,
      isAuthenticated: false,
      userRole: undefined,
      userId: undefined,
      tenantId: undefined
    }));
  }, []);

  // User management methods
  const getUsers = useCallback(async (filters?: any) => {
    return sendRequest('getUsers', { filters });
  }, [sendRequest]);

  const getUser = useCallback(async (id: string) => {
    return sendRequest('getUser', { id });
  }, [sendRequest]);

  const createUser = useCallback(async (userData: any) => {
    return sendRequest('createUser', { userData });
  }, [sendRequest]);

  const updateUser = useCallback(async (id: string, userData: any) => {
    return sendRequest('updateUser', { id, userData });
  }, [sendRequest]);

  const deleteUser = useCallback(async (id: string) => {
    return sendRequest('deleteUser', { id });
  }, [sendRequest]);

  // Customer management methods
  const getCustomers = useCallback(async (filters?: any) => {
    return sendRequest('getCustomers', { filters });
  }, [sendRequest]);

  const getCustomer = useCallback(async (id: string) => {
    return sendRequest('getCustomer', { id });
  }, [sendRequest]);

  const createCustomer = useCallback(async (customerData: any) => {
    return sendRequest('createCustomer', { customerData });
  }, [sendRequest]);

  const updateCustomer = useCallback(async (id: string, customerData: any) => {
    return sendRequest('updateCustomer', { id, customerData });
  }, [sendRequest]);

  const deleteCustomer = useCallback(async (id: string) => {
    return sendRequest('deleteCustomer', { id });
  }, [sendRequest]);

  // Appointment management methods
  const getAppointments = useCallback(async (filters?: any) => {
    return sendRequest('getAppointments', { filters });
  }, [sendRequest]);

  const getAppointment = useCallback(async (id: string) => {
    return sendRequest('getAppointment', { id });
  }, [sendRequest]);

  const createAppointment = useCallback(async (appointmentData: any) => {
    return sendRequest('createAppointment', { appointmentData });
  }, [sendRequest]);

  const updateAppointment = useCallback(async (id: string, appointmentData: any) => {
    return sendRequest('updateAppointment', { id, appointmentData });
  }, [sendRequest]);

  const cancelAppointment = useCallback(async (id: string, reason?: string) => {
    return sendRequest('cancelAppointment', { id, reason });
  }, [sendRequest]);

  const bookAppointment = useCallback(async (appointmentData: any) => {
    return sendRequest('bookAppointment', { appointmentData });
  }, [sendRequest]);

  const getAppointmentAvailability = useCallback(async (date: string, serviceId?: string) => {
    return sendRequest('getAppointmentAvailability', { date, serviceId });
  }, [sendRequest]);

  // Staff management methods
  const getStaff = useCallback(async (filters?: any) => {
    return sendRequest('getStaff', { filters });
  }, [sendRequest]);

  const getStaffMember = useCallback(async (id: string) => {
    return sendRequest('getStaffMember', { id });
  }, [sendRequest]);

  const updateStaffMember = useCallback(async (id: string, staffData: any) => {
    return sendRequest('updateStaffMember', { id, staffData });
  }, [sendRequest]);

  // Services management methods
  const getServices = useCallback(async (filters?: any) => {
    return sendRequest('getServices', { filters });
  }, [sendRequest]);

  const getService = useCallback(async (id: string) => {
    return sendRequest('getService', { id });
  }, [sendRequest]);

  const createService = useCallback(async (serviceData: any) => {
    return sendRequest('createService', { serviceData });
  }, [sendRequest]);

  const updateService = useCallback(async (id: string, serviceData: any) => {
    return sendRequest('updateService', { id, serviceData });
  }, [sendRequest]);

  // Products management methods
  const getProducts = useCallback(async (filters?: any) => {
    return sendRequest('getProducts', { filters });
  }, [sendRequest]);

  const getProduct = useCallback(async (id: string) => {
    return sendRequest('getProduct', { id });
  }, [sendRequest]);

  const createProduct = useCallback(async (productData: any) => {
    return sendRequest('createProduct', { productData });
  }, [sendRequest]);

  const updateProduct = useCallback(async (id: string, productData: any) => {
    return sendRequest('updateProduct', { id, productData });
  }, [sendRequest]);

  // Analytics and reporting methods
  const getAnalytics = useCallback(async (type: string, filters?: any) => {
    return sendRequest('getAnalytics', { type, filters });
  }, [sendRequest]);

  const getDashboardStats = useCallback(async () => {
    return sendRequest('getDashboardStats');
  }, [sendRequest]);

  const generateReport = useCallback(async (type: string, filters?: any) => {
    return sendRequest('generateReport', { type, filters });
  }, [sendRequest]);

  // Content management methods
  const getPages = useCallback(async (filters?: any) => {
    return sendRequest('getPages', { filters });
  }, [sendRequest]);

  const getPage = useCallback(async (id: string) => {
    return sendRequest('getPage', { id });
  }, [sendRequest]);

  const createPage = useCallback(async (pageData: any) => {
    return sendRequest('createPage', { pageData });
  }, [sendRequest]);

  const updatePage = useCallback(async (id: string, pageData: any) => {
    return sendRequest('updatePage', { id, pageData });
  }, [sendRequest]);

  const getBlogPosts = useCallback(async (filters?: any) => {
    return sendRequest('getBlogPosts', { filters });
  }, [sendRequest]);

  const createBlogPost = useCallback(async (postData: any) => {
    return sendRequest('createBlogPost', { postData });
  }, [sendRequest]);

  // Search methods
  const search = useCallback(async (query: string, type?: string, filters?: any) => {
    return sendRequest('search', { query, type, filters });
  }, [sendRequest]);

  // Business logic methods
  const processPayment = useCallback(async (paymentData: any) => {
    return sendRequest('processPayment', { paymentData });
  }, [sendRequest]);

  const addLoyaltyPoints = useCallback(async (customerId: string, points: number, reason: string) => {
    return sendRequest('addLoyaltyPoints', { customerId, points, reason });
  }, [sendRequest]);

  // Notification methods
  const sendNotification = useCallback(async (userId: string, notification: any) => {
    return sendRequest('sendNotification', { userId, notification });
  }, [sendRequest]);

  const getNotifications = useCallback(async (userId?: string) => {
    return sendRequest('getNotifications', { userId });
  }, [sendRequest]);

  // Bulk operations
  const bulkUpdateUsers = useCallback(async (userIds: string[], updates: any) => {
    return sendRequest('bulkUpdateUsers', { userIds, updates });
  }, [sendRequest]);

  return {
    // Connection state
    connectionState,

    // Authentication
    authenticate,
    logout,

    // User management
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,

    // Customer management
    getCustomers,
    getCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,

    // Appointment management
    getAppointments,
    getAppointment,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    bookAppointment,
    getAppointmentAvailability,

    // Staff management
    getStaff,
    getStaffMember,
    updateStaffMember,

    // Services management
    getServices,
    getService,
    createService,
    updateService,

    // Products management
    getProducts,
    getProduct,
    createProduct,
    updateProduct,

    // Analytics and reporting
    getAnalytics,
    getDashboardStats,
    generateReport,

    // Content management
    getPages,
    getPage,
    createPage,
    updatePage,
    getBlogPosts,
    createBlogPost,

    // Search
    search,

    // Business logic
    processPayment,
    addLoyaltyPoints,

    // Notifications
    sendNotification,
    getNotifications,

    // Bulk operations
    bulkUpdateUsers
  };
}

// Specialized hooks for specific use cases
export function useMCPQuery<T = any>(
  method: string,
  params?: Record<string, unknown>,
  options?: {
    enabled?: boolean;
    refetchInterval?: number;
  }
): MCPHookResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { connectionState } = useMCPController();

  const execute = useCallback(async () => {
    if (!options?.enabled && options?.enabled !== undefined) return;

    setLoading(true);
    setError(null);

    try {
      const ws = new WebSocket(`ws://localhost:3001`);
      const requestId = `req_${Date.now()}`;

      return new Promise<T>((resolve, reject) => {
        ws.onopen = () => {
          const request = {
            id: requestId,
            method,
            params: params || {},
            timestamp: Date.now()
          };
          ws.send(JSON.stringify(request));
        };

        ws.onmessage = (event) => {
          const response = JSON.parse(event.data);
          if (response.id === requestId) {
            if (response.error) {
              reject(new Error(response.error.message));
            } else {
              resolve(response.result);
            }
            ws.close();
          }
        };

        ws.onerror = () => {
          reject(new Error('WebSocket error'));
          ws.close();
        };

        // Timeout
        setTimeout(() => {
          reject(new Error('Request timeout'));
          ws.close();
        }, 30000);
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Request failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [method, params, options?.enabled]);

  useEffect(() => {
    if (options?.enabled !== false) {
      execute().then(setData).catch(setError);
    }
  }, [execute]);

  useEffect(() => {
    if (options?.refetchInterval) {
      const interval = setInterval(() => {
        execute().then(setData).catch(setError);
      }, options.refetchInterval);

      return () => clearInterval(interval);
    }
  }, [execute, options?.refetchInterval]);

  return {
    data,
    loading,
    error,
    execute,
    connectionState
  };
}

export function useMCPMutation<T = any>(
  method: string
): MCPHookResult<T> & { mutate: (params?: Record<string, unknown>) => Promise<T> } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { connectionState } = useMCPController();

  const execute = useCallback(async (params?: Record<string, unknown>) => {
    setLoading(true);
    setError(null);

    try {
      const ws = new WebSocket(`ws://localhost:3001`);
      const requestId = `req_${Date.now()}`;

      return new Promise<T>((resolve, reject) => {
        ws.onopen = () => {
          const request = {
            id: requestId,
            method,
            params: params || {},
            timestamp: Date.now()
          };
          ws.send(JSON.stringify(request));
        };

        ws.onmessage = (event) => {
          const response = JSON.parse(event.data);
          if (response.id === requestId) {
            if (response.error) {
              reject(new Error(response.error.message));
            } else {
              resolve(response.result);
            }
            ws.close();
          }
        };

        ws.onerror = () => {
          reject(new Error('WebSocket error'));
          ws.close();
        };

        // Timeout
        setTimeout(() => {
          reject(new Error('Request timeout'));
          ws.close();
        }, 30000);
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Mutation failed';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [method]);

  const mutate = useCallback(async (params?: Record<string, unknown>) => {
    const result = await execute(params);
    setData(result);
    return result;
  }, [execute]);

  return {
    data,
    loading,
    error,
    execute,
    connectionState,
    mutate
  };
}
