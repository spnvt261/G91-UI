import type { PaginationMeta } from "../common/api.model";

export type InvoiceStatus =
  | "DRAFT"
  | "ISSUED"
  | "PARTIALLY_PAID"
  | "PAID"
  | "SETTLED"
  | "CANCELLED"
  | "VOID"
  | string;

export interface InvoiceItemModel {
  id?: string;
  productId?: string;
  description?: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
  lineTotal?: number;
}

export interface InvoicePaymentHistoryModel {
  paymentId?: string;
  receiptNumber?: string;
  paymentDate?: string;
  paymentMethod?: string;
  referenceNo?: string;
  allocatedAmount: number;
  note?: string;
}

export interface InvoiceModel {
  id: string;
  invoiceNumber?: string;
  customerId?: string;
  customerCode?: string;
  customerName?: string;
  contractId?: string;
  contractNumber?: string;
  issueDate?: string;
  dueDate?: string;
  status: InvoiceStatus;
  subtotalAmount: number;
  adjustmentAmount: number;
  vatAmount: number;
  grandTotal: number;
  paidAmount: number;
  outstandingAmount: number;
  billingAddress?: string;
  paymentTerms?: string;
  note?: string;
  cancellationReason?: string;
  items: InvoiceItemModel[];
  paymentHistory: InvoicePaymentHistoryModel[];
}

export interface InvoiceListQuery {
  keyword?: string;
  invoiceNumber?: string;
  customerId?: string;
  contractId?: string;
  status?: InvoiceStatus;
  issueFrom?: string;
  issueTo?: string;
  dueFrom?: string;
  dueTo?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface InvoiceListResponse {
  items: InvoiceModel[];
  pagination: PaginationMeta;
}

export interface InvoiceItemRequest {
  productId?: string;
  description?: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
}

export interface InvoiceCreateRequest {
  contractId: string;
  dueDate: string;
  issueDate?: string;
  adjustmentAmount?: number;
  billingAddress?: string;
  paymentTerms?: string;
  note?: string;
  status?: "DRAFT" | "ISSUED";
  items?: InvoiceItemRequest[];
}

export interface ConvertContractToInvoiceRequest {
  dueDate: string;
  issueDate?: string;
  adjustmentAmount?: number;
  billingAddress?: string;
  paymentTerms?: string;
  note?: string;
  status?: "DRAFT" | "ISSUED";
  items?: InvoiceItemRequest[];
}

export interface InvoiceUpdateRequest {
  dueDate?: string;
  issueDate?: string;
  adjustmentAmount?: number;
  billingAddress?: string;
  paymentTerms?: string;
  note?: string;
  status?: "DRAFT" | "ISSUED";
  items?: InvoiceItemRequest[];
}

export interface InvoiceCancelRequest {
  cancellationReason: string;
}
