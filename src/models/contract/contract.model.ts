export type ContractStatus =
  | "DRAFT"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "ACTIVE";

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
  items: ContractItemModel[];
  totalAmount: number;
  paymentTerms?: string;
  deliveryAddress?: string;
  status: ContractStatus;
  createdAt?: string;
}

export interface ContractListQuery {
  page?: number;
  size?: number;
  status?: ContractStatus;
  keyword?: string;
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
  decision: "APPROVE" | "REJECT" | "REQUEST_MODIFICATION";
  note?: string;
}

export interface ContractTrackEvent {
  status: "ORDER_CONFIRMED" | "INVENTORY_RESERVED" | "PICKED" | "SHIPPED" | "DELIVERED";
  at: string;
  note?: string;
}

export interface ContractTrackingResponse {
  contractId: string;
  currentStatus: ContractStatus;
  timeline: ContractTrackEvent[];
}
