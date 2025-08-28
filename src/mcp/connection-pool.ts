import { MCPConfig, MCPConnection, MCPConnectionPool, MCPRequest, MCPResponse } from './types';

export class MCPConnectionPoolImpl implements MCPConnectionPool {
  private connections: Map<string, MCPConnection> = new Map();
  private config: MCPConfig;
  private ws: WebSocket | null = null;
  private reconnectTimer: NodeJS.Timeout | null = null;

  constructor(config: MCPConfig) {
    this.config = config;
  }

  async connect(config: MCPConfig): Promise<void> {
    this.config = config;
    await this.establishConnection();
  }

  async disconnect(): Promise<void> {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.connections.clear();
  }

  async sendRequest(request: MCPRequest): Promise<MCPResponse> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new Error('No active connection');
    }

    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Request timeout'));
      }, this.config.timeout);

      const messageHandler = (event: MessageEvent) => {
        try {
          const response = JSON.parse(event.data) as MCPResponse;
          if (response.id === request.id) {
            if (this.ws) {
              this.ws.removeEventListener('message', messageHandler);
            }
            clearTimeout(timeout);
            resolve(response);
          }
        } catch (error) {
          if (this.ws) {
            this.ws.removeEventListener('message', messageHandler);
          }
          clearTimeout(timeout);
          reject(error);
        }
      };

      if (this.ws) {
        this.ws.addEventListener('message', messageHandler);
        this.ws.send(JSON.stringify(request));
      } else {
        reject(new Error('No active connection'));
      }
    });
  }

  getConnection(id: string): MCPConnection | undefined {
    return this.connections.get(id);
  }

  getAllConnections(): MCPConnection[] {
    return Array.from(this.connections.values());
  }

  private async establishConnection(): Promise<void> {
    try {
      this.ws = new WebSocket(this.config.serverUrl);
      
      this.ws.onopen = () => {
        console.log('MCP Connection established');
        this.updateConnectionStatus('connected');
      };

      this.ws.onclose = () => {
        console.log('MCP Connection closed');
        this.updateConnectionStatus('disconnected');
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('MCP Connection error:', error);
        this.updateConnectionStatus('error');
      };

    } catch (error) {
      console.error('Failed to establish MCP connection:', error);
      this.scheduleReconnect();
    }
  }

  private updateConnectionStatus(status: MCPConnection['status']): void {
    const connection: MCPConnection = {
      id: 'default',
      status,
      lastActivity: Date.now(),
      metadata: {}
    };
    this.connections.set('default', connection);
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectTimer = setTimeout(() => {
      this.establishConnection();
    }, this.config.reconnectInterval);
  }
} 