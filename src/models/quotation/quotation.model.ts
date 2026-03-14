export type QuotationStatus = "DRAFT" | "PENDING" | "APPROVED" | "REJECTED";

export interface QuotationItemModel {
  productId: string;
  productCode?: string;
  productName?: string;
  quantity: number;
  unitPrice?: number;
  amount?: number;
}

export interface QuotationModel {
  id: string;
  customerId: string;
  projectId?: string;
  items: QuotationItemModel[];
  quantity?: number;
  totalAmount: number;
  status: QuotationStatus;
  createdAt?: string;
}

export interface QuotationListQuery {
  page?: number;
  size?: number;
  status?: QuotationStatus;
  keyword?: string;
}

export interface QuotationRequest {
  customerId: string;
  projectId?: string;
  items: QuotationItemModel[];
  note?: string;
}
