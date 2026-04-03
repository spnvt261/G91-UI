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
  description?: string;
  status: ProductStatus;
  imageUrls?: string[];
  mainImage?: string;
  images?: string[];
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

export interface ProductListQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  search?: string;
  type?: string;
  size?: string;
  sizeValue?: string;
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

export interface ProductCreateRequest {
  productCode: string;
  productName: string;
  type: string;
  size: string;
  thickness: string;
  unit: string;
  weightConversion?: number | null;
  referenceWeight?: number | null;
  description?: string;
  status?: ProductStatus;
  imageUrls?: string[];
}

export interface ProductUpdateRequest {
  productCode: string;
  productName: string;
  type: string;
  size: string;
  thickness: string;
  unit: string;
  weightConversion?: number | null;
  referenceWeight?: number | null;
  description?: string;
  status?: ProductStatus;
  imageUrls?: string[];
}

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
  updatedAt?: string;
}

export interface ProductUploadImagesResponse {
  imageUrls: string[];
}
