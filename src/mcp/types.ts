export interface MCPRequest {
  id: string;
  method: string;
  params: Record<string, unknown>;
  timestamp: number;
}

export interface MCPResponse {
  id: string;
  result?: unknown;
  error?: {
    code: number;
    message: string;
    data?: unknown;
  };
  timestamp: number;
}

export interface MCPConnection {
  id: string;
  status: 'connected' | 'disconnected' | 'error';
  lastActivity: number;
  metadata: Record<string, unknown>;
}

export interface MCPConfig {
  serverUrl: string;
  reconnectInterval: number;
  maxRetries: number;
  timeout: number;
}

export interface MCPHandler {
  handleRequest(request: MCPRequest): Promise<MCPResponse>;
  validateRequest(request: MCPRequest): boolean;
}

export interface MCPConnectionPool {
  connect(config: MCPConfig): Promise<void>;
  disconnect(): Promise<void>;
  sendRequest(request: MCPRequest): Promise<MCPResponse>;
  getConnection(id: string): MCPConnection | undefined;
  getAllConnections(): MCPConnection[];
} 