import { MCPHandler, MCPRequest, MCPResponse } from './types';
import { WebSocketServer, WebSocket } from 'ws';

export class MCPServer {
  private wss: WebSocketServer;
  private handlers: Map<string, MCPHandler> = new Map();

  constructor(port: number) {
    this.wss = new WebSocketServer({ port });

    this.wss.on('connection', (ws: WebSocket) => {
      console.log('New MCP client connected');

      ws.on('message', async (data: string) => {
        try {
          const request = JSON.parse(data) as MCPRequest;
          const handler = this.handlers.get(request.method);

          if (!handler) {
            const response: MCPResponse = {
              id: request.id,
              error: {
                code: 404,
                message: `No handler found for method: ${request.method}`
              },
              timestamp: Date.now()
            };
            ws.send(JSON.stringify(response));
            return;
          }

          if (!handler.validateRequest(request)) {
            const response: MCPResponse = {
              id: request.id,
              error: {
                code: 400,
                message: 'Invalid request'
              },
              timestamp: Date.now()
            };
            ws.send(JSON.stringify(response));
            return;
          }

          try {
            const result = await handler.handleRequest(request);
            const response: MCPResponse = {
              id: request.id,
              result,
              timestamp: Date.now()
            };
            ws.send(JSON.stringify(response));
          } catch (error) {
            const response: MCPResponse = {
              id: request.id,
              error: {
                code: 500,
                message: error instanceof Error ? error.message : 'Internal server error',
                data: error
              },
              timestamp: Date.now()
            };
            ws.send(JSON.stringify(response));
          }
        } catch (error) {
          const response: MCPResponse = {
            id: 'unknown',
            error: {
              code: 400,
              message: 'Invalid request format',
              data: error
            },
            timestamp: Date.now()
          };
          ws.send(JSON.stringify(response));
        }
      });

      ws.on('close', () => {
        console.log('MCP client disconnected');
      });
    });
  }

  registerHandler(method: string, handler: MCPHandler): void {
    this.handlers.set(method, handler);
  }

  unregisterHandler(method: string): void {
    this.handlers.delete(method);
  }

  close(): void {
    this.wss.close();
  }
} 