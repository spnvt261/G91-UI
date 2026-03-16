import type { PaginationMeta } from "../common/api.model";

export type ContractStatus =
  | "DRAFT"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "ACTIVE"
  | string;

export interface ContractItemModel {
  productId: string;
  productCode?: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  amount?: number;
}

export interface ContractModel {
  id: string;
  contractNumber?: string;
  quotationId: string;
  customerId: string;
  customerName?: string;
  items: ContractItemModel[];
  totalAmount: number;
  paymentTerms?: string;
  deliveryAddress?: string;
  deliveryTerms?: string;
  status: ContractStatus;
  approvalStatus?: string;
  createdAt?: string;
  expectedDeliveryDate?: string;
}

export interface ContractListQuery {
  keyword?: string;
  contractNumber?: string;
  customerId?: string;
  status?: ContractStatus;
  approvalStatus?: string;
  confidential?: boolean;
  submitted?: boolean;
  createdFrom?: string;
  createdTo?: string;
  deliveryFrom?: string;
  deliveryTo?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface CreateContractFromQuotationRequest {
  paymentTerms: string;
  deliveryAddress: string;
}

export interface ContractFromQuotationResponseData {
  contract: {
    id: string;
    contractNumber?: string;
    customerId: string;
    quotationId: string;
    totalAmount: number;
    status: ContractStatus;
    paymentTerms: string;
    deliveryAddress: string;
    createdAt?: string;
  };
  quotation?: {
    id: string;
    quotationNumber?: string;
    status?: string;
  };
}

export interface ContractApprovalRequest {
  comment?: string;
}

export interface ContractTrackEvent {
  status: string;
  at: string;
  note?: string;
}

export interface ContractTrackingResponse {
  contractId: string;
  currentStatus: ContractStatus;
  timeline: ContractTrackEvent[];
}

export interface ContractListResponseData {
  items: Array<{
    id: string;
    contractNumber?: string;
    customerId: string;
    customerName?: string;
    status: ContractStatus;
    approvalStatus?: string;
    confidential?: boolean;
    totalAmount: number;
    expectedDeliveryDate?: string;
    submittedAt?: string;
    createdAt?: string;
  }>;
  pagination: PaginationMeta;
  filters?: {
    contractNumber?: string;
    customerId?: string;
    status?: string;
    approvalStatus?: string;
    createdFrom?: string;
    createdTo?: string;
    deliveryFrom?: string;
    deliveryTo?: string;
    confidential?: boolean;
    submitted?: boolean;
  };
}

export interface ContractDetailResponseData {
  contract: {
    id: string;
    contractNumber?: string;
    customerId: string;
    customerName?: string;
    quotationId: string;
    status: ContractStatus;
    approvalStatus?: string;
    paymentTerms?: string;
    deliveryAddress?: string;
    deliveryTerms?: string;
    expectedDeliveryDate?: string;
    totalAmount: number;
    createdAt?: string;
  };
  items: Array<{
    productId: string;
    productCode?: string;
    productName?: string;
    quantity: number;
    unitPrice: number;
    totalPrice?: number;
    amount?: number;
  }>;
  customer?: {
    id: string;
    companyName?: string;
  };
  quotation?: {
    id: string;
    quotationNumber?: string;
    status?: string;
  };
}

export interface ContractUpdateRequest {
  customerId: string;
  quotationId?: string;
  paymentTerms: string;
  deliveryAddress: string;
  deliveryTerms?: string;
  note?: string;
  expectedDeliveryDate?: string;
  confidential?: boolean;
  items?: Array<{
    productId: string;
    quantity: number;
    unitPrice: number;
    priceOverrideReason?: string;
  }>;
  changeReason: string;
}
