import type { PaginationMeta } from "../common/api.model";

export type PromotionStatus = "DRAFT" | "ACTIVE" | "INACTIVE";
export type PromotionType = "PERCENTAGE" | "FIXED_AMOUNT";
export type PromotionSortBy = "name" | "promotionType" | "discountValue" | "startDate" | "endDate" | "status" | "createdAt" | "updatedAt";
export type PromotionSortDirection = "asc" | "desc";

export interface PromotionListQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  status?: PromotionStatus;
  promotionType?: PromotionType;
  startFrom?: string;
  startTo?: string;
  endFrom?: string;
  endTo?: string;
  customerGroup?: string;
  productId?: string;
  sortBy?: PromotionSortBy;
  sortDir?: PromotionSortDirection;
}

export interface PromotionProductItem {
  productId: string;
  productCode?: string;
  productName?: string;
  type?: string;
  size?: string;
  thickness?: string;
  unit?: string;
  mainImage?: string;
  imageUrls?: string[];
  images?: string[];
}

export interface PromotionListItem {
  id: string;
  code?: string;
  name: string;
  promotionType: PromotionType;
  discountValue: number;
  startDate: string;
  endDate: string;
  status: PromotionStatus;
  createdBy?: string;
  createdAt?: string;
  updatedAt?: string;
  productIds?: string[];
  productCount?: number;
  scopeSummary?: string;
  customerGroups?: string[];
  priority?: number;
  description?: string;
}

export interface PromotionDetail extends PromotionListItem {
  applicableProducts?: PromotionProductItem[];
  updatedBy?: string;
}

export interface PromotionCreateRequest {
  code?: string;
  name: string;
  promotionType: PromotionType;
  discountValue: number;
  startDate: string;
  endDate: string;
  status: PromotionStatus;
  productIds?: string[];
  customerGroups?: string[];
  priority?: number;
  description?: string;
}

export interface PromotionUpdateRequest {
  code?: string;
  name: string;
  promotionType: PromotionType;
  discountValue: number;
  startDate: string;
  endDate: string;
  status: PromotionStatus;
  productIds?: string[];
  customerGroups?: string[];
  priority?: number;
  description?: string;
}

export interface PromotionDeleteRequest {
  id: string;
}

export interface PromotionListResponseData {
  items: PromotionListItem[];
  pagination: PaginationMeta;
  filters?: Omit<PromotionListQuery, "page" | "pageSize" | "sortBy" | "sortDir">;
}

export interface PromotionDetailResponseData {
  promotion: PromotionDetail;
}

export interface PromotionSaveResponseData {
  promotion: PromotionDetail;
}

export interface PromotionDeleteResponseData {
  id: string;
  deleted: boolean;
  deletedAt?: string;
}
