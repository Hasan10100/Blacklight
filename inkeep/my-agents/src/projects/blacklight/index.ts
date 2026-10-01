import { project } from '@inkeep/agents-sdk';
import { operationsAgent } from './agents/operations-agent';
import { hivemindMcpTool } from './tools/hivemind-mcp';

export const blacklightProject = project({
  id: 'blacklight',
  name: 'Blacklight',
  description: 'Blacklight AI Agent platform with C# Hivemind MCP integration',
  models: {
    base: {
      model: 'google/gemini-3.1-flash-lite',
    },
    structuredOutput: {
      model: 'google/gemini-3.1-flash-lite',
    },
    summarizer: {
      model: 'google/gemini-3.1-flash-lite',
    },
  },
  agents: () => [operationsAgent],
  tools: () => [hivemindMcpTool],
});
