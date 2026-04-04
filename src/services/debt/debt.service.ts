import api from "../../apiConfig/axiosConfig";
import { API, withPathParams } from "../../api/URL_const";
import type {
  DebtAgingBucketModel,
  DebtHistoryItemModel,
  DebtListItemModel,
  DebtListQuery,
  DebtListResponse,
  DebtReminderModel,
  DebtSettlementModel,
  DebtStatusDetailModel,
  DebtSummaryModel,
  ReminderCreateRequest,
  ReminderListQuery,
  ReminderListResponse,
  SettlementConfirmRequest,
} from "../../models/debt/debt.model";
import type { OpenInvoiceModel, PaymentModel } from "../../models/payment/payment.model";
import { extractList, extractPagination, unwrapApiResponse } from "../service.utils";

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord => (typeof value === "object" && value !== null ? (value as UnknownRecord) : {});
const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const asString = (value: unknown): string | undefined => (typeof value === "string" ? value : undefined);
const asNumber = (value: unknown): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return 0;
};

const normalizeOpenInvoice = (payload: unknown): OpenInvoiceModel => {
  const item = asRecord(payload);
  return {
    invoiceId: asString(item.invoiceId) ?? asString(item.id) ?? "",
    invoiceNumber: asString(item.invoiceNumber),
    contractId: asString(item.contractId),
    issueDate: asString(item.issueDate),
    dueDate: asString(item.dueDate),
    totalAmount: asNumber(item.totalAmount ?? item.grandTotal),
    paidAmount: asNumber(item.paidAmount),
    remainingAmount: asNumber(item.remainingAmount ?? item.outstandingAmount ?? item.dueAmount),
    overdueDays: asNumber(item.overdueDays ?? item.daysOverdue),
    status: asString(item.status),
  };
};

const normalizePayment = (payload: unknown): PaymentModel => {
  const source = asRecord(payload);
  const allocations = asArray(source.allocations).map((allocation) => {
    const item = asRecord(allocation);
    return {
      invoiceId: asString(item.invoiceId) ?? "",
      invoiceNumber: asString(item.invoiceNumber),
      allocatedAmount: asNumber(item.allocatedAmount ?? item.amount),
      invoiceTotal: asNumber(item.invoiceTotal ?? item.totalAmount),
      invoicePaidAmount: asNumber(item.invoicePaidAmount ?? item.paidAmount),
      invoiceOutstandingAmount: asNumber(item.invoiceOutstandingAmount ?? item.remainingAmount ?? item.outstandingAmount),
    };
  });

  return {
    id: asString(source.id) ?? "",
    receiptNumber: asString(source.receiptNumber),
    customerId: asString(source.customerId),
    customerCode: asString(source.customerCode),
    customerName: asString(source.customerName),
    paymentDate: asString(source.paymentDate ?? source.paidAt),
    amount: asNumber(source.amount),
    paymentMethod: asString(source.paymentMethod),
    referenceNo: asString(source.referenceNo),
    note: asString(source.note),
    allocations,
  };
};

const normalizeDebtListItem = (payload: unknown): DebtListItemModel => {
  const item = asRecord(payload);
  return {
    customerId: asString(item.customerId) ?? "",
    customerCode: asString(item.customerCode),
    customerName: asString(item.customerName),
    outstandingAmount: asNumber(item.outstandingAmount ?? item.totalDebt),
    overdueAmount: asNumber(item.overdueAmount ?? item.overdueDebt),
    status: asString(item.status),
    lastPaymentDate: asString(item.lastPaymentDate),
  };
};

const normalizeAgingBucket = (payload: unknown): DebtAgingBucketModel => {
  const item = asRecord(payload);
  return {
    bucket: asString(item.bucket) ?? asString(item.label) ?? "UNKNOWN",
    label: asString(item.label),
    amount: asNumber(item.amount),
    invoiceCount: asNumber(item.invoiceCount),
  };
};

const normalizeReminder = (payload: unknown): DebtReminderModel => {
  const item = asRecord(payload);
  return {
    id: asString(item.id) ?? "",
    customerId: asString(item.customerId),
    customerName: asString(item.customerName),
    invoiceId: asString(item.invoiceId),
    invoiceNumber: asString(item.invoiceNumber),
    reminderType: asString(item.reminderType),
    channel: asString(item.channel),
    status: asString(item.status),
    message: asString(item.message),
    note: asString(item.note),
    sentAt: asString(item.sentAt ?? item.createdAt),
  };
};

const normalizeSettlement = (payload: unknown): DebtSettlementModel => {
  const item = asRecord(payload);
  return {
    id: asString(item.id) ?? "",
    settledAt: asString(item.settledAt ?? item.createdAt),
    note: asString(item.note),
    confirmedBy: asString(item.confirmedBy),
    certificateUrl: asString(item.certificateUrl),
  };
};

const normalizeHistory = (payload: unknown): DebtHistoryItemModel => {
  const item = asRecord(payload);
  return {
    id: asString(item.id) ?? asString(item.referenceNo) ?? "",
    eventType: asString(item.eventType ?? item.type),
    eventDate: asString(item.eventDate ?? item.createdAt),
    referenceNo: asString(item.referenceNo),
    description: asString(item.description ?? item.note ?? item.message),
    status: asString(item.status),
    amount: asNumber(item.amount),
  };
};

const normalizeSummary = (payload: unknown): DebtSummaryModel => {
  const item = asRecord(payload);
  return {
    customerId: asString(item.customerId),
    customerCode: asString(item.customerCode),
    customerName: asString(item.customerName),
    status: asString(item.status),
    outstandingAmount: asNumber(item.outstandingAmount ?? item.totalDebt),
    overdueAmount: asNumber(item.overdueAmount ?? item.overdueDebt),
    totalInvoicedAmount: asNumber(item.totalInvoicedAmount),
    totalPaidAmount: asNumber(item.totalPaidAmount ?? item.totalPaymentsReceived),
    lastPaymentDate: asString(item.lastPaymentDate),
  };
};

const normalizeDetail = (payload: unknown): DebtStatusDetailModel => {
  const data = asRecord(payload);
  const summary = normalizeSummary(data.summary ?? payload);
  const agingFromArray = asArray(data.aging);
  const agingObject = asRecord(data.aging);
  const aging =
    agingFromArray.length > 0
      ? agingFromArray.map(normalizeAgingBucket)
      : Object.entries(agingObject).map(([bucket, amount]) => ({
          bucket,
          amount: asNumber(amount),
          label: bucket,
          invoiceCount: 0,
        }));

  return {
    summary,
    aging,
    openInvoices: asArray(data.openInvoices).map(normalizeOpenInvoice),
    paymentHistory: asArray(data.paymentHistory).map(normalizePayment),
    reminderHistory: asArray(data.reminderHistory).map(normalizeReminder),
    settlements: asArray(data.settlements).map(normalizeSettlement),
  };
};

export const debtService = {
  async getList(query?: DebtListQuery): Promise<DebtListResponse> {
    const response = await api.get<unknown>(API.DEBTS.LIST, { params: query });
    const payload = unwrapApiResponse<unknown>(response.data);
    const items = extractList<unknown>(payload).map(normalizeDebtListItem);
    const pagination = extractPagination(payload, {
      page: query?.page ?? 1,
      pageSize: query?.pageSize ?? 10,
      totalItems: items.length,
    });

    return {
      items,
      pagination,
    };
  },

  async exportCsv(query?: DebtListQuery): Promise<Blob> {
    const response = await api.get<Blob>(API.DEBTS.EXPORT, {
      params: query,
      responseType: "blob",
    });
    return response.data;
  },

  async sendReminder(request: ReminderCreateRequest): Promise<void> {
    await api.post(API.DEBTS.REMINDERS, request);
  },

  async getReminders(query?: ReminderListQuery): Promise<ReminderListResponse> {
    const response = await api.get<unknown>(API.DEBTS.REMINDERS, { params: query });
    const payload = unwrapApiResponse<unknown>(response.data);
    const items = extractList<unknown>(payload).map(normalizeReminder);
    const pagination = extractPagination(payload, {
      page: query?.page ?? 1,
      pageSize: query?.pageSize ?? 10,
      totalItems: items.length,
    });

    return {
      items,
      pagination,
    };
  },

  async getDetail(customerId: string): Promise<DebtStatusDetailModel> {
    const response = await api.get<unknown>(withPathParams(API.DEBTS.DETAIL, { customerId }));
    return normalizeDetail(unwrapApiResponse(response.data));
  },

  async getAging(customerId: string): Promise<DebtAgingBucketModel[]> {
    const response = await api.get<unknown>(withPathParams(API.DEBTS.AGING, { customerId }));
    const payload = unwrapApiResponse<unknown>(response.data);
    const list = Array.isArray(payload) ? payload : asArray(asRecord(payload).items ?? payload);
    return list.map(normalizeAgingBucket);
  },

  async getHistory(customerId: string): Promise<DebtHistoryItemModel[]> {
    const response = await api.get<unknown>(withPathParams(API.DEBTS.HISTORY, { customerId }));
    const payload = unwrapApiResponse<unknown>(response.data);
    const list = Array.isArray(payload) ? payload : asArray(asRecord(payload).items ?? payload);
    return list.map(normalizeHistory);
  },

  async confirmSettlement(customerId: string, request: SettlementConfirmRequest): Promise<void> {
    await api.post(withPathParams(API.DEBTS.SETTLEMENT_CONFIRMATION, { customerId }), request);
  },

  async getSettlements(customerId: string): Promise<DebtSettlementModel[]> {
    const response = await api.get<unknown>(withPathParams(API.DEBTS.SETTLEMENTS, { customerId }));
    const payload = unwrapApiResponse<unknown>(response.data);
    const list = Array.isArray(payload) ? payload : asArray(asRecord(payload).items ?? payload);
    return list.map(normalizeSettlement);
  },
};
