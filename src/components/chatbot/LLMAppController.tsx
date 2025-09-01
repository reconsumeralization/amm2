'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useMCPController, useMCPQuery, useMCPMutation } from '@/hooks/useMCPController';
import { UserRole } from '@/mcp/rbac-types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Loader2,
  User,
  Users,
  Calendar,
  Scissors,
  Package,
  BarChart3,
  FileText,
  Search,
  Bell
} from 'lucide-react';

interface ChatbotCommand {
  id: string;
  command: string;
  description: string;
  category: string;
  requiredRole?: UserRole;
  parameters?: Array<{
    name: string;
    type: string;
    required: boolean;
    description: string;
  }>;
}

const AVAILABLE_COMMANDS: ChatbotCommand[] = [
  // Authentication
  {
    id: 'auth_login',
    command: 'login',
    description: 'Authenticate with email and password',
    category: 'Authentication',
    parameters: [
      { name: 'email', type: 'string', required: true, description: 'User email address' },
      { name: 'password', type: 'string', required: true, description: 'User password' }
    ]
  },
  {
    id: 'auth_logout',
    command: 'logout',
    description: 'Log out current user',
    category: 'Authentication'
  },

  // User Management
  {
    id: 'users_list',
    command: 'list users',
    description: 'Get list of all users',
    category: 'User Management',
    requiredRole: 'manager'
  },
  {
    id: 'users_get',
    command: 'get user',
    description: 'Get user by ID',
    category: 'User Management',
    requiredRole: 'manager',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'User ID' }
    ]
  },
  {
    id: 'users_create',
    command: 'create user',
    description: 'Create new user',
    category: 'User Management',
    requiredRole: 'manager',
    parameters: [
      { name: 'email', type: 'string', required: true, description: 'User email' },
      { name: 'name', type: 'string', required: true, description: 'User name' },
      { name: 'role', type: 'string', required: false, description: 'User role (admin, manager, barber, customer)' }
    ]
  },
  {
    id: 'users_update',
    command: 'update user',
    description: 'Update user information',
    category: 'User Management',
    requiredRole: 'manager',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'User ID' },
      { name: 'updates', type: 'object', required: true, description: 'User updates' }
    ]
  },

  // Customer Management
  {
    id: 'customers_list',
    command: 'list customers',
    description: 'Get list of all customers',
    category: 'Customer Management',
    requiredRole: 'barber'
  },
  {
    id: 'customers_get',
    command: 'get customer',
    description: 'Get customer by ID',
    category: 'Customer Management',
    requiredRole: 'barber',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'Customer ID' }
    ]
  },
  {
    id: 'customers_create',
    command: 'create customer',
    description: 'Create new customer',
    category: 'Customer Management',
    requiredRole: 'manager',
    parameters: [
      { name: 'name', type: 'string', required: true, description: 'Customer name' },
      { name: 'email', type: 'string', required: true, description: 'Customer email' },
      { name: 'phone', type: 'string', required: false, description: 'Customer phone' }
    ]
  },

  // Appointment Management
  {
    id: 'appointments_list',
    command: 'list appointments',
    description: 'Get list of appointments',
    category: 'Appointment Management',
    requiredRole: 'barber'
  },
  {
    id: 'appointments_get',
    command: 'get appointment',
    description: 'Get appointment by ID',
    category: 'Appointment Management',
    requiredRole: 'customer',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'Appointment ID' }
    ]
  },
  {
    id: 'appointments_book',
    command: 'book appointment',
    description: 'Book new appointment',
    category: 'Appointment Management',
    requiredRole: 'customer',
    parameters: [
      { name: 'service', type: 'string', required: true, description: 'Service ID' },
      { name: 'date', type: 'string', required: true, description: 'Appointment date (YYYY-MM-DD)' },
      { name: 'time', type: 'string', required: true, description: 'Appointment time (HH:MM)' },
      { name: 'stylist', type: 'string', required: false, description: 'Stylist ID' }
    ]
  },
  {
    id: 'appointments_cancel',
    command: 'cancel appointment',
    description: 'Cancel appointment',
    category: 'Appointment Management',
    requiredRole: 'customer',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'Appointment ID' },
      { name: 'reason', type: 'string', required: false, description: 'Cancellation reason' }
    ]
  },

  // Services Management
  {
    id: 'services_list',
    command: 'list services',
    description: 'Get list of all services',
    category: 'Services Management'
  },
  {
    id: 'services_get',
    command: 'get service',
    description: 'Get service by ID',
    category: 'Services Management',
    parameters: [
      { name: 'id', type: 'string', required: true, description: 'Service ID' }
    ]
  },
  {
    id: 'services_create',
    command: 'create service',
    description: 'Create new service',
    category: 'Services Management',
    requiredRole: 'manager',
    parameters: [
      { name: 'name', type: 'string', required: true, description: 'Service name' },
      { name: 'price', type: 'number', required: true, description: 'Service price' },
      { name: 'duration', type: 'number', required: true, description: 'Duration in minutes' }
    ]
  },

  // Analytics
  {
    id: 'analytics_dashboard',
    command: 'get dashboard stats',
    description: 'Get dashboard statistics',
    category: 'Analytics',
    requiredRole: 'manager'
  },
  {
    id: 'analytics_users',
    command: 'get user analytics',
    description: 'Get user analytics',
    category: 'Analytics',
    requiredRole: 'manager'
  },
  {
    id: 'analytics_appointments',
    command: 'get appointment analytics',
    description: 'Get appointment analytics',
    category: 'Analytics',
    requiredRole: 'manager'
  },

  // Search
  {
    id: 'search_global',
    command: 'search',
    description: 'Search across all data',
    category: 'Search',
    parameters: [
      { name: 'query', type: 'string', required: true, description: 'Search query' },
      { name: 'type', type: 'string', required: false, description: 'Search type (users, customers, appointments, services, products)' }
    ]
  },

  // Business Logic
  {
    id: 'loyalty_add',
    command: 'add loyalty points',
    description: 'Add loyalty points to customer',
    category: 'Business Logic',
    requiredRole: 'manager',
    parameters: [
      { name: 'customerId', type: 'string', required: true, description: 'Customer ID' },
      { name: 'points', type: 'number', required: true, description: 'Points to add' },
      { name: 'reason', type: 'string', required: true, description: 'Reason for points' }
    ]
  },

  // Notifications
  {
    id: 'notifications_send',
    command: 'send notification',
    description: 'Send notification to user',
    category: 'Notifications',
    requiredRole: 'manager',
    parameters: [
      { name: 'userId', type: 'string', required: true, description: 'User ID' },
      { name: 'title', type: 'string', required: true, description: 'Notification title' },
      { name: 'message', type: 'string', required: true, description: 'Notification message' }
    ]
  }
];

export function LLMAppController() {
  const mcp = useMCPController();
  const [command, setCommand] = useState('');
  const [parameters, setParameters] = useState<Record<string, any>>({});
  const [selectedCommand, setSelectedCommand] = useState<ChatbotCommand | null>(null);
  const [commandHistory, setCommandHistory] = useState<Array<{
    command: string;
    result: any;
    timestamp: number;
    error?: string;
  }>>([]);

  // Parse natural language command
  const parseCommand = useCallback((input: string) => {
    const lowerInput = input.toLowerCase().trim();

    // Find matching command
    const matchedCommand = AVAILABLE_COMMANDS.find(cmd =>
      lowerInput.includes(cmd.command.toLowerCase()) ||
      cmd.command.toLowerCase().split(' ').every(word => lowerInput.includes(word))
    );

    if (!matchedCommand) {
      return { error: 'Command not recognized. Type "help" for available commands.' };
    }

    // Check permissions
    if (matchedCommand.requiredRole && !mcp.connectionState.isAuthenticated) {
      return { error: 'Authentication required for this command.' };
    }

    if (matchedCommand.requiredRole && mcp.connectionState.userRole) {
      const roleHierarchy = { admin: 4, manager: 3, barber: 2, customer: 1 };
      const requiredLevel = roleHierarchy[matchedCommand.requiredRole];
      const userLevel = roleHierarchy[mcp.connectionState.userRole];

      if (userLevel < requiredLevel) {
        return { error: `Insufficient permissions. Required role: ${matchedCommand.requiredRole}` };
      }
    }

    return { command: matchedCommand };
  }, [mcp.connectionState]);

  // Execute command
  const executeCommand = useCallback(async (cmd: ChatbotCommand, params: Record<string, any>) => {
    try {
      let result: any;

      switch (cmd.id) {
        case 'auth_login':
          result = await mcp.authenticate(params.email, params.password);
          break;
        case 'auth_logout':
          mcp.logout();
          result = { message: 'Logged out successfully' };
          break;
        case 'users_list':
          result = await mcp.getUsers(params.filters);
          break;
        case 'users_get':
          result = await mcp.getUser(params.id);
          break;
        case 'users_create':
          result = await mcp.createUser({
            email: params.email,
            name: params.name,
            role: params.role || 'customer'
          });
          break;
        case 'users_update':
          result = await mcp.updateUser(params.id, params.updates);
          break;
        case 'customers_list':
          result = await mcp.getCustomers(params.filters);
          break;
        case 'customers_get':
          result = await mcp.getCustomer(params.id);
          break;
        case 'customers_create':
          result = await mcp.createCustomer({
            name: params.name,
            email: params.email,
            phone: params.phone
          });
          break;
        case 'appointments_list':
          result = await mcp.getAppointments(params.filters);
          break;
        case 'appointments_get':
          result = await mcp.getAppointment(params.id);
          break;
        case 'appointments_book':
          result = await mcp.bookAppointment({
            service: params.service,
            date: params.date,
            time: params.time,
            stylist: params.stylist
          });
          break;
        case 'appointments_cancel':
          result = await mcp.cancelAppointment(params.id, params.reason);
          break;
        case 'services_list':
          result = await mcp.getServices(params.filters);
          break;
        case 'services_get':
          result = await mcp.getService(params.id);
          break;
        case 'services_create':
          result = await mcp.createService({
            name: params.name,
            price: params.price,
            duration: params.duration
          });
          break;
        case 'analytics_dashboard':
          result = await mcp.getDashboardStats();
          break;
        case 'analytics_users':
          result = await mcp.getAnalytics('users');
          break;
        case 'analytics_appointments':
          result = await mcp.getAnalytics('appointments');
          break;
        case 'search_global':
          result = await mcp.search(params.query, params.type);
          break;
        case 'loyalty_add':
          result = await mcp.addLoyaltyPoints(params.customerId, params.points, params.reason);
          break;
        case 'notifications_send':
          result = await mcp.sendNotification(params.userId, {
            title: params.title,
            message: params.message,
            type: 'info'
          });
          break;
        default:
          throw new Error('Command not implemented');
      }

      setCommandHistory(prev => [{
        command: cmd.command,
        result,
        timestamp: Date.now()
      }, ...prev.slice(0, 9)]); // Keep last 10 commands

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Command execution failed';

      setCommandHistory(prev => [{
        command: cmd.command,
        result: null,
        timestamp: Date.now(),
        error: errorMessage
      }, ...prev.slice(0, 9)]);

      throw error;
    }
  }, [mcp]);

  // Handle command input
  const handleCommand = useCallback(async () => {
    if (!command.trim()) return;

    const parsed = parseCommand(command);

    if (parsed.error) {
      setCommandHistory(prev => [{
        command,
        result: null,
        timestamp: Date.now(),
        error: parsed.error
      }, ...prev.slice(0, 9)]);
      setCommand('');
      return;
    }

    const cmd = parsed.command!;
    setSelectedCommand(cmd);

    // Check if command needs parameters
    if (cmd.parameters && cmd.parameters.length > 0) {
      // For now, use simple parameter extraction from command string
      // In a real implementation, you'd want a more sophisticated parser
      const paramValues: Record<string, any> = {};

      cmd.parameters.forEach(param => {
        // Simple parameter extraction - you'd want to improve this
        const regex = new RegExp(`${param.name}\\s*:\\s*([^\\s]+)`, 'i');
        const match = command.match(regex);
        if (match) {
          paramValues[param.name] = match[1];
        }
      });

      setParameters(paramValues);
    }

    try {
      const result = await executeCommand(cmd, parameters);
      console.log('Command result:', result);
    } catch (error) {
      console.error('Command error:', error);
    }

    setCommand('');
    setParameters({});
    setSelectedCommand(null);
  }, [command, parseCommand, executeCommand, parameters]);

  // Show help
  const showHelp = useCallback(() => {
    const helpText = AVAILABLE_COMMANDS
      .filter(cmd => !cmd.requiredRole || mcp.connectionState.userRole)
      .map(cmd => `${cmd.command} - ${cmd.description}`)
      .join('\n');

    setCommandHistory(prev => [{
      command: 'help',
      result: helpText,
      timestamp: Date.now()
    }, ...prev.slice(0, 9)]);
  }, [mcp.connectionState.userRole]);

  // Handle special commands
  useEffect(() => {
    if (command.toLowerCase().trim() === 'help') {
      showHelp();
      setCommand('');
    }
  }, [command, showHelp]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Authentication': return <User className="w-4 h-4" />;
      case 'User Management': return <Users className="w-4 h-4" />;
      case 'Customer Management': return <Users className="w-4 h-4" />;
      case 'Appointment Management': return <Calendar className="w-4 h-4" />;
      case 'Services Management': return <Scissors className="w-4 h-4" />;
      case 'Analytics': return <BarChart3 className="w-4 h-4" />;
      case 'Search': return <Search className="w-4 h-4" />;
      case 'Notifications': return <Bell className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Connection Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${
              mcp.connectionState.isConnected ? 'bg-green-500' : 'bg-red-500'
            }`} />
            MCP Controller Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant={mcp.connectionState.isConnected ? 'default' : 'destructive'}>
              {mcp.connectionState.isConnected ? 'Connected' : 'Disconnected'}
            </Badge>
            {mcp.connectionState.isAuthenticated && (
              <Badge variant="secondary">
                Role: {mcp.connectionState.userRole}
              </Badge>
            )}
            {mcp.connectionState.error && (
              <Alert className="flex-1">
                <AlertDescription>{mcp.connectionState.error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Command Input */}
      <Card>
        <CardHeader>
          <CardTitle>LLM App Controller</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Enter command (e.g., 'list customers', 'book appointment service:123 date:2024-01-15', 'help')"
              onKeyPress={(e) => e.key === 'Enter' && handleCommand()}
              className="flex-1"
            />
            <Button onClick={handleCommand} disabled={!command.trim()}>
              Execute
            </Button>
          </div>

          {selectedCommand && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h4 className="font-semibold">{selectedCommand.command}</h4>
              <p className="text-sm text-muted-foreground">{selectedCommand.description}</p>
              {selectedCommand.parameters && (
                <div className="mt-2">
                  <p className="text-sm font-medium">Parameters:</p>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {selectedCommand.parameters.map(param => (
                      <div key={param.name} className="text-sm">
                        <span className="font-medium">{param.name}</span>
                        {param.required && <span className="text-red-500">*</span>}
                        <span className="text-muted-foreground"> ({param.type})</span>
                        <br />
                        <span className="text-xs">{param.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Commands */}
      <Card>
        <CardHeader>
          <CardTitle>Available Commands</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {AVAILABLE_COMMANDS
              .filter(cmd => !cmd.requiredRole ||
                (mcp.connectionState.userRole &&
                 ['admin', 'manager'].includes(mcp.connectionState.userRole)))
              .map(cmd => (
                <div
                  key={cmd.id}
                  className="p-3 border rounded-lg hover:bg-muted cursor-pointer"
                  onClick={() => setCommand(cmd.command)}
                >
                  <div className="flex items-center gap-2 mb-1">
                    {getCategoryIcon(cmd.category)}
                    <Badge variant="outline" className="text-xs">
                      {cmd.category}
                    </Badge>
                  </div>
                  <h4 className="font-medium">{cmd.command}</h4>
                  <p className="text-sm text-muted-foreground">{cmd.description}</p>
                  {cmd.requiredRole && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      {cmd.requiredRole}
                    </Badge>
                  )}
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Command History */}
      <Card>
        <CardHeader>
          <CardTitle>Command History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {commandHistory.map((entry, index) => (
              <div key={index} className="p-3 border rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <code className="text-sm bg-muted px-2 py-1 rounded">
                    {entry.command}
                  </code>
                  <span className="text-xs text-muted-foreground">
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                {entry.error ? (
                  <Alert variant="destructive">
                    <AlertDescription>{entry.error}</AlertDescription>
                  </Alert>
                ) : (
                  <pre className="text-sm bg-muted p-2 rounded overflow-x-auto">
                    {JSON.stringify(entry.result, null, 2)}
                  </pre>
                )}
              </div>
            ))}

            {commandHistory.length === 0 && (
              <p className="text-muted-foreground text-center py-8">
                No commands executed yet. Try "help" to see available commands.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
