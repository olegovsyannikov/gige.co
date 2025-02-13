export type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

export type JsonSchema = {
  type?: string | string[];
  properties?: Record<string, JsonSchema>;
  items?: JsonSchema | JsonSchema[];
  required?: string[];
  description?: string;
  title?: string;
  default?: JsonValue;
  enum?: JsonValue[];
  const?: JsonValue;
  allOf?: JsonSchema[];
  anyOf?: JsonSchema[];
  oneOf?: JsonSchema[];
  not?: JsonSchema;
  definitions?: Record<string, JsonSchema>;
  $ref?: string;
  $id?: string;
  $schema?: string;
};

export interface ApiResponse<T> {
  data: T;
  error?: {
    message: string;
    status: number;
  };
}
