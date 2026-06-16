export interface ApiResponse<T> {
  statusCode: number;
  message: string;
  data: T;
}

export interface ApiListResponse<T> {
  statusCode: number;
  message: string;
  data: T[];
  meta?: {
    total: number;
    page: number;
    lastPage: number;
  };
}