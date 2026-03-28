export type PriceListStatus = "ACTIVE" | "INACTIVE";

export interface PriceListItemModel {
  id?: string;
  productId: string;
  productCode?: string;
  productName?: string;
  unitPrice: number;
}

export interface PriceListModel {
  id: string;
  name: string;
  customerGroup?: string;
  validFrom: string;
  validTo: string;
  status: PriceListStatus;
  itemCount: number;
  items: PriceListItemModel[];
  createdAt?: string;
  updatedAt?: string;
}

export interface PriceListWriteRequest {
  name: string;
  customerGroup?: string;
  validFrom: string;
  validTo: string;
  status: PriceListStatus;
  items: PriceListItemModel[];
}

export interface PriceListListQuery {
  page?: number;
  size?: number;
  search?: string;
  status?: PriceListStatus;
  customerGroup?: string;
  validFrom?: string;
  validTo?: string;
}

export interface PriceListListResponseData {
  items: PriceListModel[];
  page: number;
  size: number;
  totalElements: number;
}
