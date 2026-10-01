declare module '@inkeep/agents-cli/config' {
  export interface InkeepConfig {
    tenantId?: string;
    agentsManageApi?: {
      url?: string;
      apiKey?: string;
    };
    agentsRunApi?: {
      url?: string;
      apiKey?: string;
    };
    [key: string]: any;
  }

  export function defineConfig<T extends InkeepConfig = InkeepConfig>(config: T): T;
}
