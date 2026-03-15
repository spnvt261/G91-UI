import type { PaginationMeta } from "../common/api.model";

export type QuotationStatus = "DRAFT" | "PENDING" | "CONVERTED" | "REJECTED" | "APPROVED";

export interface QuotationItemModel {
  productId: string;
  productCode?: string;
  productName?: string;
  quantity: number;
  unitPrice?: number;
  totalPrice?: number;
  amount?: number;
}

export interface QuotationActionModel {
  customerCanEdit: boolean;
  accountantCanCreateContract: boolean;
}

export interface QuotationModel {
  id: string;
  quotationNumber?: string;
  customerId?: string;
  customerName?: string;
  projectId?: string;
  projectName?: string;
  items: QuotationItemModel[];
  quantity?: number;
  totalAmount: number;
  status: QuotationStatus;
  validUntil?: string;
  createdAt?: string;
  deliveryRequirements?: string;
  promotionCode?: string;
  actions?: QuotationActionModel;
}

export interface QuotationListQuery {
  page?: number;
  pageSize?: number;
  status?: QuotationStatus;
  keyword?: string;
  fromDate?: string;
  toDate?: string;
  sortBy?: "createdAt" | "quotationNumber" | "totalAmount" | "validUntil" | "status";
  sortDir?: "asc" | "desc";
}

export interface QuotationRequest {
  customerId?: string;
  projectId?: string;
  items: QuotationItemModel[];
  note?: string;
  deliveryRequirements?: string;
  promotionCode?: string;
}

export interface QuotationFormInitQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  type?: string;
  size?: string;
  thickness?: string;
}

export interface QuotationFormInitProduct {
  id: string;
  productCode: string;
  productName: string;
  type: string;
  size: string;
  thickness: string;
  unit: string;
  referenceWeight?: number;
  status: string;
  referenceUnitPrice?: number;
}

export interface QuotationFormInitProject {
  id: string;
  projectCode?: string;
  name: string;
  status: string;
}

export interface QuotationFormInitResponseData {
  customer?: {
    id: string;
    companyName?: string;
    customerType?: string;
    status?: string;
  };
  products: QuotationFormInitProduct[];
  projects: QuotationFormInitProject[];
  availablePromotions: Array<{
    code: string;
    name: string;
    discountType?: string;
    discountValue?: number;
  }>;
}

export interface CustomerQuotationListItem {
  id: string;
  quotationNumber: string;
  createdAt: string;
  totalAmount: number;
  status: QuotationStatus;
  validUntil?: string;
  actions?: {
    canView?: boolean;
    canEdit?: boolean;
    canTrack?: boolean;
  };
}

export interface CustomerQuotationListResponseData {
  items: CustomerQuotationListItem[];
  pagination: PaginationMeta;
  filters?: {
    status?: string;
    fromDate?: string;
    toDate?: string;
  };
}

export interface CustomerQuotationSummaryResponseData {
  total: number;
  draft: number;
  pending: number;
  converted: number;
  rejected: number;
}

export interface QuotationPreviewResponseData {
  project?: {
    id?: string;
    projectCode?: string;
    name?: string;
  };
  items: QuotationItemModel[];
  summary: {
    subTotal: number;
    discountAmount: number;
    totalAmount: number;
  };
  promotion?: {
    code?: string;
    name?: string;
    applied?: boolean;
  };
  deliveryRequirements?: string;
  validUntil?: string;
  validation?: {
    valid: boolean;
    messages: string[];
  };
}

export interface QuotationSubmitResponseData {
  quotation: {
    id: string;
    quotationNumber?: string;
    customerId: string;
    projectId?: string;
    totalAmount: number;
    status: QuotationStatus;
    validUntil?: string;
    createdAt?: string;
  };
}

export interface QuotationDetailResponseData {
  quotation: {
    id: string;
    quotationNumber?: string;
    status: QuotationStatus;
    totalAmount: number;
    validUntil?: string;
    createdAt?: string;
  };
  customer?: {
    id: string;
    companyName?: string;
  };
  project?: {
    id: string;
    name?: string;
    projectCode?: string;
  };
  items: QuotationItemModel[];
  pricing?: {
    subTotal?: number;
    discountAmount?: number;
    totalAmount?: number;
    promotionCode?: string;
  };
  deliveryRequirements?: string;
  actions?: QuotationActionModel;
}

export interface QuotationSaveResponseData {
  quotation: {
    id: string;
    quotationNumber?: string;
    customerId: string;
    projectId?: string;
    totalAmount: number;
    status: QuotationStatus;
    validUntil?: string;
    createdAt?: string;
  };
  items: QuotationItemModel[];
  metadata?: {
    deliveryRequirements?: string;
    promotionCode?: string;
  };
}

export interface QuotationHistoryResponseData {
  quotationId: string;
  events: Array<{
    id: string;
    action: string;
    actorRole?: string;
    actorName?: string;
    note?: string;
    createdAt: string;
  }>;
}
