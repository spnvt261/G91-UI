import type { PaginationMeta } from "../common/api.model";

export type ContractStatus =
  | "DRAFT"
  | "PENDING_CUSTOMER_APPROVAL"
  | "CUSTOMER_APPROVAL"
  | "PENDING_APPROVAL"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "SUBMITTED"
  | "PROCESSING"
  | "RESERVED"
  | "PICKED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "ACTIVE"
  | string;

export interface ContractItemModel {
  productId: string;
  productCode?: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  amount?: number;
  priceOverrideReason?: string;
}

export interface ContractPaymentOption {
  code: string;
  name: string;
  description?: string;
}

export interface ContractModel {
  id: string;
  contractNumber?: string;
  saleOrderNumber?: string;
  quotationId: string;
  quotationNumber?: string;
  customerId: string;
  customerName?: string;
  items: ContractItemModel[];
  totalAmount: number;
  paymentTerms?: string;
  paymentOptionCode?: string;
  paymentOption?: ContractPaymentOption;
  deliveryAddress?: string;
  deliveryTerms?: string;
  note?: string;
  confidential?: boolean;
  status: ContractStatus;
  approvalStatus?: string;
  approvalTier?: string;
  pendingAction?: string;
  approvalRequestedAt?: string;
  approvalDueAt?: string;
  requiresApproval?: boolean;
  depositPercentage?: number;
  depositAmount?: number;
  creditLimitSnapshot?: number;
  currentDebtSnapshot?: number;
  projectedDebt?: number;
  availableCredit?: number;
  confidentialityNote?: string;
  approvalRequest?: {
    approvalId?: string;
    approvalType?: string;
    approvalTier?: string;
    status?: string;
    pendingAction?: string;
    requestedBy?: string;
    requestedAt?: string;
    dueAt?: string;
    comment?: string;
  };
  reviewInsights?: string[];
  reviewInsightDetails?: {
    customerHistoryMonths?: number;
    creditRiskLevel?: string;
    priceChangePercent?: number;
    creditLimit?: number;
    currentDebt?: number;
    projectedDebt?: number;
    availableCredit?: number;
    profitabilityNote?: string;
    actionRecommendation?: string;
  };
  documents?: Array<{
    id: string;
    name?: string;
    status?: string;
    generatedAt?: string;
    lastExportedAt?: string;
  }>;
  createdAt?: string;
  submittedAt?: string;
  approvedAt?: string;
  cancelledAt?: string;
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
  paymentOptionCode?: string;
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
    paymentOption?: ContractPaymentOption;
    deliveryAddress: string;
    createdAt?: string;
  };
  quotation?: {
    id: string;
    quotationNumber?: string;
    status?: string;
  };
}

export interface ContractApprovalDecisionRequest {
  comment?: string;
}

export interface ContractTrackEvent {
  status: string;
  at: string;
  title?: string;
  note?: string;
  trackingNumber?: string;
}

export interface ContractTrackingResponse {
  contractId: string;
  currentStatus: ContractStatus;
  timeline: ContractTrackEvent[];
}

export interface ContractCreateRequest {
  customerId: string;
  quotationId?: string;
  paymentTerms: string;
  paymentOptionCode?: string;
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
}

export interface ContractPreviewRequest {
  customerId?: string;
  quotationId?: string;
  paymentTerms?: string;
  paymentOptionCode?: string;
  deliveryAddress?: string;
  deliveryTerms?: string;
  note?: string;
  expectedDeliveryDate?: string;
  confidential?: boolean;
  items?: ContractCreateRequest["items"];
}

export interface ContractListResponseData {
  items: Array<{
    id: string;
    contractNumber?: string;
    saleOrderNumber?: string;
    quotationId?: string;
    quotationNumber?: string;
    customerId: string;
    customerName?: string;
    status: ContractStatus;
    approvalStatus?: string;
    approvalTier?: string;
    confidential?: boolean;
    requiresApproval?: boolean;
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

export interface PendingContractApprovalListQuery {
  keyword?: string;
  customerId?: string;
  pendingAction?: string;
  approvalTier?: string;
  requestedFrom?: string;
  requestedTo?: string;
  minAmount?: number;
  maxAmount?: number;
  page?: number;
  pageSize?: number;
  sortBy?: "approvalRequestedAt" | "totalAmount" | "contractNumber" | "submittedAt";
  sortDir?: "asc" | "desc";
}

export interface PendingContractApprovalListResponseData {
  items: Array<{
    contractId: string;
    contractNumber?: string;
    customerId?: string;
    customerName?: string;
    totalAmount: number;
    approvalStatus?: string;
    approvalTier?: string;
    pendingAction?: string;
    requestedBy?: string;
    requestedAt?: string;
    dueAt?: string;
    submittedAt?: string;
  }>;
  pagination: PaginationMeta;
  filters?: {
    keyword?: string;
    customerId?: string;
    pendingAction?: string;
    approvalTier?: string;
    minAmount?: number;
    maxAmount?: number;
    requestedFrom?: string;
    requestedTo?: string;
  };
  totalPending: number;
}

export interface ContractDetailResponseData {
  contract: {
    id: string;
    contractNumber?: string;
    saleOrderNumber?: string;
    customerId: string;
    customerName?: string;
    quotationId: string;
    status: ContractStatus;
    approvalStatus?: string;
    approvalTier?: string;
    requiresApproval?: boolean;
    paymentTerms?: string;
    paymentOption?: ContractPaymentOption;
    deliveryAddress?: string;
    deliveryTerms?: string;
    note?: string;
    confidential?: boolean;
    expectedDeliveryDate?: string;
    totalAmount: number;
    depositPercentage?: number;
    depositAmount?: number;
    creditLimitSnapshot?: number;
    currentDebtSnapshot?: number;
    createdAt?: string;
    submittedAt?: string;
    approvedAt?: string;
    cancelledAt?: string;
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
  approval?: {
    requiresApproval?: boolean;
    approvalStatus?: string;
    approvalTier?: string;
    pendingAction?: string;
    requestedAt?: string;
    dueAt?: string;
    decidedBy?: string;
    decidedAt?: string;
  };
  credit?: {
    creditLimit?: number;
    currentDebt?: number;
    projectedDebt?: number;
    availableCredit?: number;
  };
}

export interface ContractApprovalReviewResponseData {
  detail: ContractDetailResponseData;
  approvalRequest?: {
    approvalId?: string;
    approvalType?: string;
    approvalTier?: string;
    status?: string;
    pendingAction?: string;
    requestedBy?: string;
    requestedAt?: string;
    dueAt?: string;
    comment?: string;
  };
  insights?: {
    approvalReasons?: string[];
    customerHistoryMonths?: number;
    creditRiskLevel?: string;
    priceChangePercent?: number;
    creditLimit?: number;
    currentDebt?: number;
    projectedDebt?: number;
    availableCredit?: number;
    profitabilityNote?: string;
    actionRecommendation?: string;
  };
}

export interface ContractFormInitResponseData {
  customer?: {
    id: string;
    companyName?: string;
    customerType?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
    creditLimit?: number;
    currentDebt?: number;
    availableCredit?: number;
    depositPercentage?: number;
  };
  quotation?: {
    id: string;
    quotationNumber?: string;
    status?: string;
    validUntil?: string;
    projectId?: string;
    projectCode?: string;
    projectName?: string;
    deliveryRequirements?: string;
    note?: string;
    paymentOption?: ContractPaymentOption;
  };
  defaults?: {
    suggestedPaymentTerms?: string;
    suggestedDeliveryAddress?: string;
    suggestedDeliveryTerms?: string;
    suggestedPaymentOption?: ContractPaymentOption;
  };
  items: Array<{
    productId: string;
    productCode?: string;
    productName?: string;
    unit?: string;
    quantity?: number;
    quotedUnitPrice?: number;
    baseUnitPrice?: number;
    suggestedUnitPrice?: number;
    totalPrice?: number;
  }>;
  warnings: string[];
  availablePaymentOptions: ContractPaymentOption[];
}

export interface ContractUpdateRequest {
  customerId: ContractCreateRequest["customerId"];
  quotationId?: ContractCreateRequest["quotationId"];
  paymentTerms: ContractCreateRequest["paymentTerms"];
  deliveryAddress: ContractCreateRequest["deliveryAddress"];
  deliveryTerms?: ContractCreateRequest["deliveryTerms"];
  note?: ContractCreateRequest["note"];
  expectedDeliveryDate?: ContractCreateRequest["expectedDeliveryDate"];
  confidential?: ContractCreateRequest["confidential"];
  items?: ContractCreateRequest["items"];
  changeReason: string;
}

export interface ContractSubmitRequest {
  scheduledSubmissionAt?: string;
  submissionNote?: string;
}

export interface ContractCancelRequest {
  cancellationReason: "CUSTOMER_REQUEST" | "PRICE_DISPUTE" | "INVENTORY_SHORTAGE" | "CREDIT_RISK" | "DATA_ERROR" | "OTHER" | string;
  cancellationNote?: string;
}

export interface ContractApprovalResponseData {
  contractId: string;
  contractNumber?: string;
  approvalStatus?: string;
  contractStatus?: string;
  decision?: string;
  decidedBy?: string;
  decidedAt?: string;
  comment?: string;
}

export interface ContractDocumentGenerateRequest {
  templateType?: string;
  regenerate?: boolean;
}

export interface ContractDocumentExportRequest {
  format?: string;
}

export interface ContractDocumentEmailRequest {
  recipients: string[];
  cc?: string[];
  subject?: string;
  message?: string;
}
