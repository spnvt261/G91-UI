export type PriceListStatus = "ACTIVE" | "INACTIVE";

export interface PriceListCreateRequest {
  name: string;
  customerGroup?: string;
  startDate: string;
  endDate: string;
  status?: PriceListStatus;
}

export interface PriceListCreateDataResponse {
  id: string;
}

export interface PriceListListQuery {
  page?: number;
  size?: number;
  status?: PriceListStatus;
  customerGroup?: string;
}

export interface PriceListListItem {
  id: string;
  name: string;
  customerGroup?: string;
  startDate: string;
  endDate: string;
  status: PriceListStatus;
  createdAt: string;
}

export interface PriceListListResponseData {
  content: PriceListListItem[];
  page: number;
  size: number;
  totalElements: number;
}

export interface PriceListItem {
  id: string;
  productId: string;
  productName: string;
  unitPrice: number;
}

export interface PriceListDetailResponse {
  id: string;
  name: string;
  customerGroup?: string;
  startDate: string;
  endDate: string;
  status: PriceListStatus;
  items: PriceListItem[];
}

export interface PriceListUpdateRequest {
  name: string;
  customerGroup?: string;
  startDate: string;
  endDate: string;
  status: PriceListStatus;
}

export interface PriceListItemCreateRequest {
  productId: string;
  unitPrice: number;
}

export interface PriceListItemCreateDataResponse {
  id: string;
}

export interface PriceListItemUpdateRequest {
  unitPrice: number;
}
