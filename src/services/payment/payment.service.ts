import api from "../../apiConfig/axiosConfig";
import { API, withId, withPathParams } from "../../api/URL_const";
import type { OpenInvoiceModel, PaymentCreateRequest, PaymentModel } from "../../models/payment/payment.model";
import { unwrapApiResponse } from "../service.utils";

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
  const root = asRecord(payload);
  const payment = asRecord(root.payment);
  const source = Object.keys(payment).length > 0 ? payment : root;
  const allocationsSource = asArray(root.allocations ?? source.allocations ?? source.paymentAllocations);

  return {
    id: asString(source.id) ?? "",
    receiptNumber: asString(source.receiptNumber),
    customerId: asString(source.customerId),
    customerCode: asString(source.customerCode),
    customerName: asString(source.customerName),
    paymentDate: asString(source.paymentDate ?? source.paidAt),
    amount: asNumber(source.amount),
    paymentMethod: asString(source.paymentMethod ?? source.method),
    referenceNo: asString(source.referenceNo),
    note: asString(source.note),
    createdBy: asString(source.createdBy),
    createdAt: asString(source.createdAt),
    allocations: allocationsSource.map((allocation) => {
      const item = asRecord(allocation);
      return {
        invoiceId: asString(item.invoiceId) ?? "",
        invoiceNumber: asString(item.invoiceNumber),
        allocatedAmount: asNumber(item.allocatedAmount ?? item.amount),
        invoiceTotal: asNumber(item.invoiceTotal ?? item.totalAmount),
        invoicePaidAmount: asNumber(item.invoicePaidAmount ?? item.paidAmount),
        invoiceOutstandingAmount: asNumber(
          item.invoiceOutstandingAmount ??
            item.invoiceRemainingAmount ??
            item.remainingAmount ??
            item.outstandingAmount,
        ),
        invoiceRemainingAmount: asNumber(
          item.invoiceRemainingAmount ??
            item.invoiceOutstandingAmount ??
            item.remainingAmount ??
            item.outstandingAmount,
        ),
        invoiceStatus: asString(item.invoiceStatus ?? item.status),
      };
    }),
  };
};

export const paymentService = {
  async create(request: PaymentCreateRequest): Promise<PaymentModel> {
    const response = await api.post<unknown>(API.PAYMENTS.CREATE, request);
    return normalizePayment(unwrapApiResponse(response.data));
  },

  async getDetail(id: string): Promise<PaymentModel> {
    const response = await api.get<unknown>(withId(API.PAYMENTS.DETAIL, id));
    return normalizePayment(unwrapApiResponse(response.data));
  },

  async getOpenInvoices(customerId: string): Promise<OpenInvoiceModel[]> {
    const response = await api.get<unknown>(withPathParams(API.PAYMENTS.OPEN_INVOICES_BY_CUSTOMER, { customerId }));
    const payload = unwrapApiResponse<unknown>(response.data);
    const list = Array.isArray(payload) ? payload : asArray(asRecord(payload).items ?? asRecord(payload).content ?? payload);
    return list.map(normalizeOpenInvoice);
  },
};
