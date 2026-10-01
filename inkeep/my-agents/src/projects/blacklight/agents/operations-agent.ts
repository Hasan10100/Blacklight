import { agent, subAgent } from '@inkeep/agents-sdk';
import { hivemindMcpTool } from '../tools/hivemind-mcp';

const operationsSubAgent = subAgent({
  id: 'operations-subagent',
  name: 'Operations Assistant',
  models: {
    base: {
      model: 'google/gemini-3.1-flash-lite',
    },
  },
  description: 'Assistant with live access to the C# Backend and PostgreSQL database',
  prompt: `You are an intelligent assistant with access to the Hivemind MCP server.
When the user asks about operations in the system:
1. Use the 'get_all_operations' tool to fetch all current operations from the database.
2. Use the 'create_operation' tool to insert a new operation into PostgreSQL with a name and description.`,
  canUse: () => [hivemindMcpTool],
});

export const operationsAgent = agent({
  id: 'operations-agent',
  name: 'Operations Agent',
  description: 'AI agent connected to the C# Hivemind MCP server and PostgreSQL',
  defaultSubAgent: operationsSubAgent,
  subAgents: () => [operationsSubAgent],
});
