import type { PaginationMeta } from "../common/api.model";
import type { OpenInvoiceModel, PaymentModel } from "../payment/payment.model";

export type DebtStatus = "NO_DEBT" | "OPEN_DEBT" | "PARTIALLY_PAID" | "OVERDUE" | "REMINDER_SENT" | "SETTLED" | string;

export interface DebtListQuery {
  keyword?: string;
  customerCode?: string;
  customerName?: string;
  invoiceNumber?: string;
  status?: DebtStatus;
  overdueOnly?: boolean;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface DebtListItemModel {
  customerId: string;
  customerCode?: string;
  customerName?: string;
  outstandingAmount: number;
  overdueAmount: number;
  status?: DebtStatus;
  lastPaymentDate?: string;
}

export interface DebtListResponse {
  items: DebtListItemModel[];
  pagination: PaginationMeta;
}

export interface DebtAgingBucketModel {
  bucket: string;
  label?: string;
  amount: number;
  invoiceCount?: number;
}

export interface DebtReminderModel {
  id: string;
  customerId?: string;
  customerName?: string;
  invoiceId?: string;
  invoiceNumber?: string;
  reminderType?: string;
  channel?: string;
  status?: string;
  message?: string;
  note?: string;
  sentAt?: string;
}

export interface DebtSettlementModel {
  id: string;
  settledAt?: string;
  note?: string;
  confirmedBy?: string;
  certificateUrl?: string;
}

export interface DebtHistoryItemModel {
  id: string;
  eventType?: string;
  eventDate?: string;
  referenceNo?: string;
  description?: string;
  status?: string;
  amount?: number;
}

export interface DebtSummaryModel {
  customerId?: string;
  customerCode?: string;
  customerName?: string;
  status?: DebtStatus;
  outstandingAmount: number;
  overdueAmount: number;
  totalInvoicedAmount?: number;
  totalPaidAmount?: number;
  lastPaymentDate?: string;
}

export interface DebtStatusDetailModel {
  summary: DebtSummaryModel;
  aging: DebtAgingBucketModel[];
  openInvoices: OpenInvoiceModel[];
  paymentHistory: PaymentModel[];
  reminderHistory: DebtReminderModel[];
  settlements: DebtSettlementModel[];
}

export interface ReminderCreateRequest {
  customerId: string;
  invoiceIds: string[];
  reminderType: "GENTLE" | "FIRM" | "FINAL";
  channel: "EMAIL";
  message?: string;
  note?: string;
}

export interface ReminderListQuery {
  customerId?: string;
  invoiceNumber?: string;
  status?: string;
  reminderType?: string;
  channel?: "EMAIL";
  page?: number;
  pageSize?: number;
}

export interface ReminderListResponse {
  items: DebtReminderModel[];
  pagination: PaginationMeta;
}

export interface SettlementConfirmRequest {
  note?: string;
  generateCertificate?: boolean;
}
