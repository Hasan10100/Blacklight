import { defineConfig } from '@inkeep/agents-cli/config';
    
const config = defineConfig({
  tenantId: "default",
  agentsManageApi: {
    url: 'http://127.0.0.1:3002',
    apiKey: process.env.INKEEP_AGENTS_MANAGE_API_BYPASS_SECRET || 'dev-bypass-secret-123',
  },
  agentsRunApi: {
    url: 'http://127.0.0.1:3002',
    apiKey: process.env.INKEEP_AGENTS_RUN_API_BYPASS_SECRET || 'dev-bypass-secret-123',
  },
});

export default config;