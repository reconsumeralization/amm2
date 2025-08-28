import { MCPServer } from './server';
import { GitHubMCPHandler } from './github-handler';
import { MCPConnectionPoolImpl } from './connection-pool';
import { MCPConfig } from './types';

async function main() {
  // Create and start the MCP server
  const server = new MCPServer(8080);
  console.log('MCP Server started on port 8080');

  // Register the GitHub handler
  const githubHandler = new GitHubMCPHandler('your-github-token');
  server.registerHandler('github.readFile', githubHandler);
  server.registerHandler('github.listFiles', githubHandler);
  server.registerHandler('github.getRepoInfo', githubHandler);

  // Create a client connection pool
  const clientConfig: MCPConfig = {
    serverUrl: 'ws://localhost:8080',
    reconnectInterval: 5000,
    maxRetries: 3,
    timeout: 10000
  };

  const client = new MCPConnectionPoolImpl(clientConfig);
  await client.connect(clientConfig);

  // Example: Read a file from GitHub
  try {
    const request = {
      id: '1',
      method: 'github.readFile',
      params: {
        owner: 'octocat',
        repo: 'Hello-World',
        path: 'README.md'
      },
      timestamp: Date.now()
    };

    const response = await client.sendRequest(request);
    console.log('File content:', response.result);
  } catch (error) {
    console.error('Error reading file:', error);
  }

  // Cleanup
  await client.disconnect();
  server.close();
}

main().catch(console.error); 