import { execSync } from 'node:child_process';
import dotenv from 'dotenv';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const env = {
  ...process.env,
  INKEEP_CI: 'true',
  INKEEP_API_KEY: process.env.INKEEP_AGENTS_MANAGE_API_BYPASS_SECRET || 'dev-bypass-secret-123',
  INKEEP_AGENTS_API_URL: process.env.INKEEP_AGENTS_MANAGE_API_URL || 'http://127.0.0.1:3002',
  INKEEP_TENANT_ID: 'default',
};

console.log('🚀 Pushing project to local Inkeep platform...');
execSync('pnpm inkeep push --config src/inkeep.config.ts --project src/projects/blacklight', {
  stdio: 'inherit',
  env,
});
