import { mcpTool } from '@inkeep/agents-sdk';

export const hivemindMcpTool = mcpTool({
  id: 'hivemind-mcp',
  name: 'Hivemind MCP Tools',
  serverUrl: 'http://127.0.0.1:5106/mcp',
});
