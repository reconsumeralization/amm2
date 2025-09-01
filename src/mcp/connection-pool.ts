import { MCPConfig, MCPConnection, MCPConnectionPool, MCPRequest, MCPResponse } from './types';

export class MCPConnectionPoolImpl implements MCPConnectionPool {
  private connections: Map<string, MCPConnection> = new Map();
  private config: MCPConfig;
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private pendingRequests: Map<string, { resolve: (value: MCPResponse) => void; reject: (reason?: any) => void; timeout: NodeJS.Timeout }> = new Map();
  private eventListeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor(config: MCPConfig) {
    this.config = config;
  }

  async connect(config: MCPConfig): Promise<void> {
    this.config = config;
    this.reconnectAttempts = 0;
    await this.establishConnection();
  }

  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    // Clean up pending requests
    this.pendingRequests.forEach(({ reject, timeout }) => {
      clearTimeout(timeout);
      reject(new Error('Connection closed'));
    });
    this.pendingRequests.clear();
    
    this.connections.clear();
    this.eventListeners.clear();
    this.reconnectAttempts = 0;
  }

  async sendRequest(request: MCPRequest): Promise<MCPResponse> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('No active connection available');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(request.id);
        reject(new Error(`Request timeout after ${this.config.timeout}ms`));
      }, this.config.timeout);

      this.pendingRequests.set(request.id, { resolve, reject, timeout });

      try {
        if (this.ws) {
          this.ws.send(JSON.stringify(request));
          this.updateLastActivity();
        } else {
          this.pendingRequests.delete(request.id);
          clearTimeout(timeout);
          reject(new Error('Connection lost during request'));
        }
      } catch (error) {
        this.pendingRequests.delete(request.id);
        clearTimeout(timeout);
        reject(error);
      }
    });
  }

  getConnection(id: string): MCPConnection | undefined {
    return this.connections.get(id);
  }

  getAllConnections(): MCPConnection[] {
    return Array.from(this.connections.values());
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  getConnectionStatus(): MCPConnection['status'] {
    const connection = this.connections.get('default');
    return connection?.status || 'disconnected';
  }

  addEventListener(event: string, listener: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  removeEventListener(event: string, listener: (data: any) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
      if (listeners.size === 0) {
        this.eventListeners.delete(event);
      }
    }
  }

  private async establishConnection(): Promise<void> {
    try {
      if (this.ws && this.ws.readyState === WebSocket.CONNECTING) {
        return; // Already connecting
      }

      this.ws = new WebSocket(this.config.serverUrl);
      
      this.ws.onopen = () => {
        console.log('MCP Connection established');
        this.reconnectAttempts = 0;
        this.updateConnectionStatus('connected');
        this.emitEvent('connected', { timestamp: Date.now() });
      };

      this.ws.onmessage = (event: MessageEvent) => {
        this.handleMessage(event);
      };

      this.ws.onclose = (event: CloseEvent) => {
        console.log(`MCP Connection closed: ${event.code} - ${event.reason}`);
        this.updateConnectionStatus('disconnected');
        this.emitEvent('disconnected', { code: event.code, reason: event.reason, timestamp: Date.now() });
        
        // Clean up pending requests on close
        this.pendingRequests.forEach(({ reject, timeout }) => {
          clearTimeout(timeout);
          reject(new Error('Connection closed'));
        });
        this.pendingRequests.clear();
        
        if (event.code !== 1000) { // Not a normal closure
          this.scheduleReconnect();
        }
      };

      this.ws.onerror = (error) => {
        console.error('MCP Connection error:', error);
        this.updateConnectionStatus('error');
        this.emitEvent('error', { error, timestamp: Date.now() });
      };

    } catch (error) {
      console.error('Failed to establish MCP connection:', error);
      this.updateConnectionStatus('error');
      this.scheduleReconnect();
    }
  }

  private handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      
      // Handle response to pending request
      if (data.id && this.pendingRequests.has(data.id)) {
        const { resolve, timeout } = this.pendingRequests.get(data.id)!;
        this.pendingRequests.delete(data.id);
        clearTimeout(timeout);
        resolve(data as MCPResponse);
        this.updateLastActivity();
        return;
      }
      
      // Handle server-initiated messages/notifications
      this.emitEvent('message', data);
      this.updateLastActivity();
      
    } catch (error) {
      console.error('Failed to parse message:', error);
      this.emitEvent('parseError', { error, rawData: event.data });
    }
  }

  private updateConnectionStatus(status: MCPConnection['status']): void {
    const connection: MCPConnection = {
      id: 'default',
      status,
      lastActivity: Date.now(),
      metadata: {
        reconnectAttempts: this.reconnectAttempts,
        serverUrl: this.config.serverUrl,
        pendingRequests: this.pendingRequests.size
      }
    };
    this.connections.set('default', connection);
  }

  private updateLastActivity(): void {
    const connection = this.connections.get('default');
    if (connection) {
      connection.lastActivity = Date.now();
      if (connection.metadata) {
        connection.metadata.pendingRequests = this.pendingRequests.size;
      }
    }
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error(`Max reconnection attempts (${this.maxReconnectAttempts}) reached`);
      this.updateConnectionStatus('error');
      this.emitEvent('maxReconnectAttemptsReached', { attempts: this.reconnectAttempts });
      return;
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    const delay = Math.min(
      this.config.reconnectInterval * Math.pow(2, this.reconnectAttempts),
      30000 // Max 30 seconds
    );

    this.reconnectAttempts++;
    console.log(`Scheduling reconnection attempt ${this.reconnectAttempts} in ${delay}ms`);

    this.reconnectTimer = setTimeout(() => {
      this.establishConnection();
    }, delay);
  }

  private emitEvent(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
}
