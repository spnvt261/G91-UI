import type { PaginationMeta } from "../common/api.model";

export type ProductStatus = "ACTIVE" | "INACTIVE";

export interface ProductModel {
  id: string;
  productCode: string;
  productName: string;
  type: string;
  size: string;
  thickness: string;
  unit: string;
  weightConversion?: number | null;
  referenceWeight?: number | null;
  status: ProductStatus;
  createdAt?: string;
}

export interface ProductListQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  type?: string;
  size?: string;
  thickness?: string;
  unit?: string;
  status?: ProductStatus;
  sortBy?: "createdAt" | "productCode" | "productName";
  sortDir?: "asc" | "desc";
}

export interface ProductListResponse {
  items: ProductModel[];
  pagination: PaginationMeta;
  filters: Omit<ProductListQuery, "page" | "pageSize" | "sortBy" | "sortDir">;
}

export type ProductCreateRequest = Omit<ProductModel, "id" | "createdAt">;
export type ProductUpdateRequest = Omit<ProductModel, "id" | "createdAt">;

export interface ProductStatusUpdateRequest {
  status: ProductStatus;
  reason?: string;
  requestedByRole?: string;
}

export interface ProductStatusResponse {
  id: string;
  productCode: string;
  productName: string;
  status: ProductStatus;
  createdAt?: string;
}
