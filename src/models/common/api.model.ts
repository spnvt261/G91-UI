export interface ApiResponse<T> {
  code: string;
  message: string;
  data: T;
}

export interface ApiValidationErrorItem {
  field: string;
  message: string;
}

export interface PaginationMeta {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface PageableListResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
}
