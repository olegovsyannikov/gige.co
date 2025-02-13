export interface JsonSchema {
  type: string;
  description?: string;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  additionalProperties?: boolean;
}

export interface JsonSchemaProperty {
  type: string;
  description?: string;
  title?: string;
  format?: string;
  enum?: string[];
  items?: JsonSchemaProperty;
  properties?: Record<string, JsonSchemaProperty>;
  required?: string[];
  minimum?: number;
  maximum?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
}

export interface Agent {
  id: string;
  name: string;
  description: string;
  keywords: string;
  endpointURL: string;
  inputSchema: JsonSchema;
  outputSchema: JsonSchema;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count: {
    jobs: number;
    jobLogs: number;
  };
}

export interface AgentListItem {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  inputSchema: JsonSchema | null;
  _count?: {
    jobs: number;
  };
}
