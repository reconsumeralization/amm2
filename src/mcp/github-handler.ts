import { MCPHandler, MCPRequest, MCPResponse } from './types';

interface GitHubFileContent {
  content: string;
  encoding: string;
}

export class GitHubMCPHandler implements MCPHandler {
  private readonly validMethods = ['github.readFile', 'github.listFiles', 'github.getRepoInfo'];
  private readonly baseUrl = 'https://api.github.com';
  private readonly token: string;

  constructor(token: string) {
    this.token = token;
  }

  validateRequest(request: MCPRequest): boolean {
    return this.validMethods.includes(request.method);
  }

  async handleRequest(request: MCPRequest): Promise<MCPResponse> {
    switch (request.method) {
      case 'github.readFile':
        return this.handleReadFile(request);
      case 'github.listFiles':
        return this.handleListFiles(request);
      case 'github.getRepoInfo':
        return this.handleGetRepoInfo(request);
      default:
        throw new Error(`Unsupported method: ${request.method}`);
    }
  }

  private async handleReadFile(request: MCPRequest): Promise<MCPResponse> {
    const { owner, repo, path } = request.params as { owner: string; repo: string; path: string };
    
    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to read file: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      id: request.id,
      result,
      timestamp: Date.now()
    };
  }

  private async handleListFiles(request: MCPRequest): Promise<MCPResponse> {
    const { owner, repo, path = '' } = request.params as { owner: string; repo: string; path?: string };
    
    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}/contents/${path}`, {
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to list files: ${response.statusText}`);
    }

    const files = await response.json();
    return {
      id: request.id,
      result: files.map((file: any) => file.path),
      timestamp: Date.now()
    };
  }

  private async handleGetRepoInfo(request: MCPRequest): Promise<MCPResponse> {
    const { owner, repo } = request.params as { owner: string; repo: string };
    
    const response = await fetch(`${this.baseUrl}/repos/${owner}/${repo}`, {
      headers: {
        'Authorization': `token ${this.token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to get repo info: ${response.statusText}`);
    }

    const result = await response.json();
    return {
      id: request.id,
      result,
      timestamp: Date.now()
    };
  }
} 