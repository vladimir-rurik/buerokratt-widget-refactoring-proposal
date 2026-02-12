// services/api/types.ts
export interface ApiClientConfig {
  baseURL: string;
  timeout?: number;
}

export interface ApiResponse<T> {
  response: T;
}

export interface ApiError {
  code: string;
  message: string;
}
