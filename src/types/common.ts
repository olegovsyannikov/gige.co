export type JsonSchema = Record<string, any>;

export interface ApiResponse<T> {
  data: T;
  error?: {
    message: string;
    status: number;
  };
}
