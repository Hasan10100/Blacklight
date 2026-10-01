/**
 * [OPTIONAL / REFERENCE]
 * Utility to check if routes exist in the legacy example Node.js MCP server (apps/mcp/app).
 * In Blacklight, your active MCP server is Hivemind (.NET 9 C#) on port 5106.
 */

import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

export async function checkForRoutes() {
  try {
    const appDir = join(process.cwd(), 'apps/mcp/app');
    const files = await readdir(appDir);

    // Check if there's anything besides .gitkeep
    const actualContent = files.filter((file) => file !== '.gitkeep');

    return actualContent.length > 0;
  } catch {
    return false;
  }
}
