import type { PaginationMeta } from "../common/api.model";
import type { InvoiceStatus } from "../invoice/invoice.model";

export type PaymentConfirmationStatus = "PENDING_REVIEW" | "CONFIRMED" | "REJECTED" | "CANCELLED" | string;
export type PaymentInstructionMethod = "BANK_TRANSFER_QR" | string;

export interface PaymentInstructionModel {
  paymentMethod?: PaymentInstructionMethod;
  invoiceId: string;
  invoiceNumber?: string;
  customerId?: string;
  grandTotal: number;
  paidAmount: number;
  outstandingAmount: number;
  bankName?: string;
  bankAccountName?: string;
  bankAccountNo?: string;
  transferContent?: string;
  qrContent?: string;
  qrImageUrl?: string | null;
}

export interface PaymentConfirmationRequestModel {
  id: string;
  invoiceId: string;
  invoiceNumber?: string;
  customerId?: string;
  customerCode?: string;
  customerName?: string;
  requestedAmount: number;
  confirmedAmount?: number | null;
  transferTime?: string;
  senderBankName?: string;
  senderAccountName?: string;
  senderAccountNo?: string;
  referenceCode?: string;
  proofDocumentUrl?: string;
  status: PaymentConfirmationStatus;
  reviewNote?: string | null;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  paymentId?: string | null;
  createdAt?: string;
}

export interface PaymentConfirmationRequestDetailModel extends PaymentConfirmationRequestModel {
  note?: string;
  createdBy?: string;
  updatedBy?: string;
  updatedAt?: string;
  invoiceGrandTotal: number;
  invoicePaidAmount: number;
  invoiceOutstandingAmount: number;
  invoiceStatus?: InvoiceStatus;
}

export interface PaymentConfirmationRequestListQuery {
  keyword?: string;
  invoiceId?: string;
  customerId?: string;
  status?: PaymentConfirmationStatus;
  createdFrom?: string;
  createdTo?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface PaymentConfirmationRequestListResponse {
  items: PaymentConfirmationRequestModel[];
  pagination: PaginationMeta;
  filters?: Record<string, unknown>;
}

export interface CreatePaymentConfirmationRequest {
  requestedAmount: number;
  transferTime: string;
  senderBankName: string;
  senderAccountName: string;
  senderAccountNo: string;
  referenceCode: string;
  proofDocumentUrl?: string;
  note?: string;
}

export interface ConfirmPaymentConfirmationRequest {
  confirmedAmount: number;
  reviewNote?: string;
}

export interface RejectPaymentConfirmationRequest {
  reason: string;
}
