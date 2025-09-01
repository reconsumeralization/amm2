/**
 * Example LLM Chatbot Integration with MCP
 *
 * This file demonstrates how to integrate an LLM chatbot with the comprehensive
 * MCP (Model Context Protocol) system for the Modern Men Hair BarberShop application.
 */

import { MCPRequest, MCPResponse } from '../types';
import { UserRole } from '../rbac-types';
import { useState, useEffect, useCallback } from 'react';

// MCP Client for LLM Chatbot
export class LLMChatbotMCPClient {
  private ws: WebSocket | null = null;
  private requestId = 0;
  private pendingRequests = new Map<string, {
    resolve: (value: any) => void;
    reject: (error: any) => void;
    timeout: NodeJS.Timeout;
  }>();

  constructor(private serverUrl: string = 'ws://localhost:3001') {}

  // Connect to MCP server
  async connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(this.serverUrl);

      this.ws.onopen = () => {
        console.log('🔗 Connected to MCP Server');
        resolve();
      };

      this.ws.onmessage = (event) => {
        this.handleMessage(event.data);
      };

      this.ws.onerror = (error) => {
        console.error('❌ MCP Connection Error:', error);
        reject(error);
      };

      this.ws.onclose = () => {
        console.log('🔌 Disconnected from MCP Server');
      };
    });
  }

  // Send MCP request
  private async sendRequest(method: string, params: any = {}): Promise<any> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('MCP connection not available');
    }

    const id = `req_${++this.requestId}`;
    const request: MCPRequest = {
      id,
      method,
      params,
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(id);
        reject(new Error('Request timeout'));
      }, 30000);

      this.pendingRequests.set(id, { resolve, reject, timeout });

      this.ws!.send(JSON.stringify(request));
    });
  }

  // Handle incoming messages
  private handleMessage(data: string): void {
    try {
      const response: MCPResponse = JSON.parse(data);
      const pendingRequest = this.pendingRequests.get(response.id);

      if (pendingRequest) {
        clearTimeout(pendingRequest.timeout);
        this.pendingRequests.delete(response.id);

        if (response.error) {
          pendingRequest.reject(new Error(response.error.message));
        } else {
          pendingRequest.resolve(response.result);
        }
      }
    } catch (error) {
      console.error('Failed to parse MCP response:', error);
    }
  }

  // Authentication methods
  async authenticate(email: string, password: string) {
    return this.sendRequest('authenticate', { email, password });
  }

  async logout() {
    return this.sendRequest('logout');
  }

  // User management methods
  async getUsers(filters?: any) {
    return this.sendRequest('getUsers', { filters });
  }

  async createUser(userData: any) {
    return this.sendRequest('createUser', { userData });
  }

  async updateUser(id: string, userData: any) {
    return this.sendRequest('updateUser', { id, userData });
  }

  async getCustomers(filters?: any) {
    return this.sendRequest('getCustomers', { filters });
  }

  async createCustomer(customerData: any) {
    return this.sendRequest('createCustomer', { customerData });
  }

  async getAppointments(filters?: any) {
    return this.sendRequest('getAppointments', { filters });
  }

  async bookAppointment(appointmentData: any) {
    return this.sendRequest('bookAppointment', { appointmentData });
  }

  async cancelAppointment(id: string, reason?: string) {
    return this.sendRequest('cancelAppointment', { id, reason });
  }

  async getServices(filters?: any) {
    return this.sendRequest('getServices', { filters });
  }

  async createService(serviceData: any) {
    return this.sendRequest('createService', { serviceData });
  }

  async getDashboardStats() {
    return this.sendRequest('getDashboardStats');
  }

  async search(query: string, type?: string) {
    return this.sendRequest('search', { query, type });
  }

  // Disconnect from MCP server
  disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
}

// Natural Language Command Parser
export class NaturalLanguageParser {
  private mcpClient: LLMChatbotMCPClient;

  constructor(mcpClient: LLMChatbotMCPClient) {
    this.mcpClient = mcpClient;
  }

  // Parse natural language commands
  async parseAndExecute(command: string): Promise<any> {
    const lowerCommand = command.toLowerCase().trim();

    // Authentication commands
    if (lowerCommand.includes('login') || lowerCommand.includes('log in')) {
      return this.handleLoginCommand(command);
    }

    if (lowerCommand.includes('logout') || lowerCommand.includes('log out')) {
      return this.mcpClient.logout();
    }

    // User management commands
    if (lowerCommand.includes('list users') || lowerCommand.includes('show users')) {
      return this.mcpClient.getUsers();
    }

    if (lowerCommand.includes('create user') || lowerCommand.includes('add user')) {
      return this.handleCreateUserCommand(command);
    }

    // Customer management commands
    if (lowerCommand.includes('list customers') || lowerCommand.includes('show customers')) {
      return this.mcpClient.getCustomers();
    }

    if (lowerCommand.includes('create customer') || lowerCommand.includes('add customer')) {
      return this.handleCreateCustomerCommand(command);
    }

    // Appointment commands
    if (lowerCommand.includes('book appointment') || lowerCommand.includes('schedule appointment')) {
      return this.handleBookAppointmentCommand(command);
    }

    if (lowerCommand.includes('cancel appointment')) {
      return this.handleCancelAppointmentCommand(command);
    }

    if (lowerCommand.includes('list appointments') || lowerCommand.includes('show appointments')) {
      return this.mcpClient.getAppointments();
    }

    // Service commands
    if (lowerCommand.includes('list services') || lowerCommand.includes('show services')) {
      return this.mcpClient.getServices();
    }

    if (lowerCommand.includes('create service') || lowerCommand.includes('add service')) {
      return this.handleCreateServiceCommand(command);
    }

    // Analytics commands
    if (lowerCommand.includes('dashboard') || lowerCommand.includes('stats')) {
      return this.mcpClient.getDashboardStats();
    }

    // Search commands
    if (lowerCommand.includes('search') || lowerCommand.includes('find')) {
      return this.handleSearchCommand(command);
    }

    // Help command
    if (lowerCommand.includes('help')) {
      return this.getHelpText();
    }

    return { error: 'Command not recognized. Try "help" for available commands.' };
  }

  private async handleLoginCommand(command: string): Promise<any> {
    // Extract email and password from command
    const emailMatch = command.match(/email[:\s]+([^\s]+)/i);
    const passwordMatch = command.match(/password[:\s]+([^\s]+)/i);

    if (!emailMatch || !passwordMatch) {
      return { error: 'Please provide email and password. Example: login email:admin@example.com password:password' };
    }

    return this.mcpClient.authenticate(emailMatch[1], passwordMatch[1]);
  }

  private async handleCreateUserCommand(command: string): Promise<any> {
    const emailMatch = command.match(/email[:\s]+([^\s]+)/i);
    const nameMatch = command.match(/name[:\s]+([^\s]+)/i);
    const roleMatch = command.match(/role[:\s]+([^\s]+)/i);

    if (!emailMatch || !nameMatch) {
      return { error: 'Please provide email and name. Example: create user email:user@example.com name:John Doe role:customer' };
    }

    return this.mcpClient.createUser({
      email: emailMatch[1],
      name: nameMatch[1],
      role: roleMatch ? roleMatch[1] as UserRole : 'customer'
    });
  }

  private async handleCreateCustomerCommand(command: string): Promise<any> {
    const nameMatch = command.match(/name[:\s]+([^\s]+)/i);
    const emailMatch = command.match(/email[:\s]+([^\s]+)/i);
    const phoneMatch = command.match(/phone[:\s]+([^\s]+)/i);

    if (!nameMatch || !emailMatch) {
      return { error: 'Please provide name and email. Example: create customer name:John Doe email:john@example.com phone:+1234567890' };
    }

    return this.mcpClient.createCustomer({
      name: nameMatch[1],
      email: emailMatch[1],
      phone: phoneMatch ? phoneMatch[1] : undefined
    });
  }

  private async handleBookAppointmentCommand(command: string): Promise<any> {
    const serviceMatch = command.match(/service[:\s]+([^\s]+)/i);
    const dateMatch = command.match(/date[:\s]+([^\s]+)/i);
    const timeMatch = command.match(/time[:\s]+([^\s]+)/i);
    const stylistMatch = command.match(/stylist[:\s]+([^\s]+)/i);

    if (!serviceMatch || !dateMatch || !timeMatch) {
      return { error: 'Please provide service, date, and time. Example: book appointment service:haircut date:2024-01-15 time:10:00 stylist:john' };
    }

    return this.mcpClient.bookAppointment({
      service: serviceMatch[1],
      date: dateMatch[1],
      time: timeMatch[1],
      stylist: stylistMatch ? stylistMatch[1] : undefined
    });
  }

  private async handleCancelAppointmentCommand(command: string): Promise<any> {
    const idMatch = command.match(/id[:\s]+([^\s]+)/i);
    const reasonMatch = command.match(/reason[:\s]+(.+)$/i);

    if (!idMatch) {
      return { error: 'Please provide appointment ID. Example: cancel appointment id:123 reason:Customer requested' };
    }

    return this.mcpClient.cancelAppointment(idMatch[1], reasonMatch ? reasonMatch[1].trim() : undefined);
  }

  private async handleCreateServiceCommand(command: string): Promise<any> {
    const nameMatch = command.match(/name[:\s]+([^\s]+)/i);
    const priceMatch = command.match(/price[:\s]+([^\s]+)/i);
    const durationMatch = command.match(/duration[:\s]+([^\s]+)/i);

    if (!nameMatch || !priceMatch || !durationMatch) {
      return { error: 'Please provide name, price, and duration. Example: create service name:Haircut price:45 duration:60' };
    }

    return this.mcpClient.createService({
      name: nameMatch[1],
      price: parseFloat(priceMatch[1]) * 100, // Convert to cents
      duration: parseInt(durationMatch[1])
    });
  }

  private async handleSearchCommand(command: string): Promise<any> {
    const queryMatch = command.match(/(?:search|find)[:\s]+(.+?)(?:\s+type[:\s]+([^\s]+))?/i);

    if (!queryMatch) {
      return { error: 'Please provide search query. Example: search john doe type:customers' };
    }

    return this.mcpClient.search(queryMatch[1], queryMatch[2]);
  }

  private getHelpText(): string {
    return `
🤖 Available Commands:

🔐 Authentication:
  • login email:admin@example.com password:password
  • logout

👥 User Management:
  • list users
  • create user email:user@example.com name:John Doe role:customer
  • update user id:123 name:Updated Name

👨‍💼 Customer Management:
  • list customers
  • create customer name:John Doe email:john@example.com phone:+1234567890

📅 Appointments:
  • list appointments
  • book appointment service:haircut date:2024-01-15 time:10:00 stylist:john
  • cancel appointment id:123 reason:Customer requested

💇‍♂️ Services:
  • list services
  • create service name:Haircut price:45 duration:60

📊 Analytics:
  • get dashboard stats

🔍 Search:
  • search john doe
  • search haircut type:services

📝 Help:
  • help

💡 Tip: You can use natural language like "book an appointment for tomorrow at 2pm"
    `;
  }
}

// Example usage in a chatbot application
export async function exampleChatbotUsage() {
  console.log('🎯 Starting LLM Chatbot with MCP Integration\n');

  // Initialize MCP client
  const mcpClient = new LLMChatbotMCPClient();
  const parser = new NaturalLanguageParser(mcpClient);

  try {
    // Connect to MCP server
    await mcpClient.connect();
    console.log('✅ Connected to MCP Server\n');

    // Example conversation flow
    const commands = [
      'login email:admin@example.com password:admin123',
      'list customers',
      'create customer name:Jane Smith email:jane@example.com phone:+1987654321',
      'book appointment service:haircut date:2024-01-20 time:14:00 stylist:sarah',
      'list appointments',
      'get dashboard stats',
      'search jane',
      'logout'
    ];

    for (const command of commands) {
      console.log(`🤖 User: ${command}`);

      try {
        const result = await parser.parseAndExecute(command);
        console.log(`💻 Response:`, JSON.stringify(result, null, 2));
      } catch (error) {
        console.error(`❌ Error:`, error instanceof Error ? error.message : error);
      }

      console.log('─'.repeat(50));
      // Add delay between commands
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

  } catch (error) {
    console.error('💥 Fatal error:', error);
  } finally {
    // Cleanup
    mcpClient.disconnect();
  }
}

// React Hook for LLM Chatbot Integration
export function useLLMChatbot() {
  const [mcpClient] = useState(() => new LLMChatbotMCPClient());
  const [parser] = useState(() => new NaturalLanguageParser(mcpClient));
  const [isConnected, setIsConnected] = useState(false);
  const [conversation, setConversation] = useState<Array<{
    id: string;
    user: string;
    response: any;
    timestamp: number;
    error?: string;
  }>>([]);

  const connect = useCallback(async () => {
    try {
      await mcpClient.connect();
      setIsConnected(true);
    } catch (error) {
      console.error('Failed to connect to MCP:', error);
    }
  }, [mcpClient]);

  const executeCommand = useCallback(async (command: string) => {
    const id = `msg_${Date.now()}`;

    try {
      const result = await parser.parseAndExecute(command);

      setConversation(prev => [...prev, {
        id,
        user: command,
        response: result,
        timestamp: Date.now()
      }]);

      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      setConversation(prev => [...prev, {
        id,
        user: command,
        response: null,
        timestamp: Date.now(),
        error: errorMessage
      }]);

      throw error;
    }
  }, [parser]);

  const clearConversation = useCallback(() => {
    setConversation([]);
  }, []);

  useEffect(() => {
    connect();
    return () => {
      mcpClient.disconnect();
    };
  }, [connect, mcpClient]);

  return {
    isConnected,
    conversation,
    executeCommand,
    clearConversation
  };
}

// Export for use in other files
export { MCPRequest, MCPResponse };
