export interface PaginationMetadata {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
}

export interface PaginatedApiResponse<T> {
  data: T[];
  pagination: PaginationMetadata;
  message?: string;
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  details?: unknown;
}

export interface ApiErrorResponse {
  error: ApiErrorDetail;
}
