import api from "../../apiConfig/axiosConfig";
import { API, withId } from "../../api/URL_const";
import type {
  ConfirmPaymentConfirmationRequest,
  CreatePaymentConfirmationRequest,
  PaymentConfirmationRequestDetailModel,
  PaymentConfirmationRequestListQuery,
  PaymentConfirmationRequestListResponse,
  PaymentConfirmationRequestModel,
  PaymentInstructionModel,
  RejectPaymentConfirmationRequest,
} from "../../models/payment-confirmation/payment-confirmation.model";
import { extractList, extractPagination, unwrapApiResponse } from "../service.utils";

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord => (typeof value === "object" && value !== null ? (value as UnknownRecord) : {});
const asString = (value: unknown): string | undefined => (typeof value === "string" ? value : undefined);
const asNullableString = (value: unknown): string | null | undefined => (value == null ? null : asString(value));
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

const normalizePaymentInstruction = (payload: unknown): PaymentInstructionModel => {
  const item = asRecord(payload);
  return {
    paymentMethod: asString(item.paymentMethod),
    invoiceId: asString(item.invoiceId) ?? "",
    invoiceNumber: asString(item.invoiceNumber),
    customerId: asString(item.customerId),
    grandTotal: asNumber(item.grandTotal),
    paidAmount: asNumber(item.paidAmount),
    outstandingAmount: asNumber(item.outstandingAmount),
    bankName: asString(item.bankName),
    bankAccountName: asString(item.bankAccountName),
    bankAccountNo: asString(item.bankAccountNo),
    transferContent: asString(item.transferContent),
    qrContent: asString(item.qrContent),
    qrImageUrl: asNullableString(item.qrImageUrl) ?? null,
  };
};

const normalizePaymentConfirmationRequest = (payload: unknown): PaymentConfirmationRequestModel => {
  const item = asRecord(payload);
  return {
    id: asString(item.id) ?? "",
    invoiceId: asString(item.invoiceId) ?? "",
    invoiceNumber: asString(item.invoiceNumber),
    customerId: asString(item.customerId),
    customerCode: asString(item.customerCode),
    customerName: asString(item.customerName),
    requestedAmount: asNumber(item.requestedAmount),
    confirmedAmount: item.confirmedAmount == null ? null : asNumber(item.confirmedAmount),
    transferTime: asString(item.transferTime),
    senderBankName: asString(item.senderBankName),
    senderAccountName: asString(item.senderAccountName),
    senderAccountNo: asString(item.senderAccountNo),
    referenceCode: asString(item.referenceCode),
    proofDocumentUrl: asString(item.proofDocumentUrl),
    status: asString(item.status) ?? "PENDING_REVIEW",
    reviewNote: asNullableString(item.reviewNote) ?? null,
    reviewedBy: asNullableString(item.reviewedBy) ?? null,
    reviewedAt: asNullableString(item.reviewedAt) ?? null,
    paymentId: asNullableString(item.paymentId) ?? null,
    createdAt: asString(item.createdAt),
  };
};

const normalizePaymentConfirmationRequestDetail = (payload: unknown): PaymentConfirmationRequestDetailModel => {
  const item = asRecord(payload);
  const base = normalizePaymentConfirmationRequest(item);

  return {
    ...base,
    note: asString(item.note),
    createdBy: asString(item.createdBy),
    updatedBy: asString(item.updatedBy),
    updatedAt: asString(item.updatedAt),
    invoiceGrandTotal: asNumber(item.invoiceGrandTotal),
    invoicePaidAmount: asNumber(item.invoicePaidAmount),
    invoiceOutstandingAmount: asNumber(item.invoiceOutstandingAmount),
    invoiceStatus: asString(item.invoiceStatus),
  };
};

export const paymentConfirmationService = {
  async getInvoicePaymentInstruction(invoiceId: string): Promise<PaymentInstructionModel> {
    const response = await api.get<unknown>(withId(API.INVOICES.PAYMENT_INSTRUCTION, invoiceId));
    return normalizePaymentInstruction(unwrapApiResponse(response.data));
  },

  async getInvoiceRequests(invoiceId: string, query?: PaymentConfirmationRequestListQuery): Promise<PaymentConfirmationRequestListResponse> {
    const response = await api.get<unknown>(withId(API.INVOICES.PAYMENT_CONFIRMATION_REQUESTS, invoiceId), { params: query });
    const payload = unwrapApiResponse<unknown>(response.data);
    const items = extractList<unknown>(payload).map(normalizePaymentConfirmationRequest);

    return {
      items,
      pagination: extractPagination(payload, {
        page: query?.page ?? 1,
        pageSize: query?.pageSize ?? 20,
        totalItems: items.length,
      }),
      filters: asRecord(payload).filters as Record<string, unknown> | undefined,
    };
  },

  async createInvoiceRequest(invoiceId: string, request: CreatePaymentConfirmationRequest): Promise<PaymentConfirmationRequestDetailModel> {
    const response = await api.post<unknown>(withId(API.INVOICES.PAYMENT_CONFIRMATION_REQUESTS, invoiceId), request);
    return normalizePaymentConfirmationRequestDetail(unwrapApiResponse(response.data));
  },

  async getList(query?: PaymentConfirmationRequestListQuery): Promise<PaymentConfirmationRequestListResponse> {
    const response = await api.get<unknown>(API.PAYMENT_CONFIRMATION_REQUESTS.LIST, { params: query });
    const payload = unwrapApiResponse<unknown>(response.data);
    const items = extractList<unknown>(payload).map(normalizePaymentConfirmationRequest);

    return {
      items,
      pagination: extractPagination(payload, {
        page: query?.page ?? 1,
        pageSize: query?.pageSize ?? 20,
        totalItems: items.length,
      }),
      filters: asRecord(payload).filters as Record<string, unknown> | undefined,
    };
  },

  async getDetail(id: string): Promise<PaymentConfirmationRequestDetailModel> {
    const response = await api.get<unknown>(withId(API.PAYMENT_CONFIRMATION_REQUESTS.DETAIL, id));
    return normalizePaymentConfirmationRequestDetail(unwrapApiResponse(response.data));
  },

  async confirm(id: string, request: ConfirmPaymentConfirmationRequest): Promise<PaymentConfirmationRequestDetailModel> {
    const response = await api.post<unknown>(withId(API.PAYMENT_CONFIRMATION_REQUESTS.CONFIRM, id), request);
    return normalizePaymentConfirmationRequestDetail(unwrapApiResponse(response.data));
  },

  async reject(id: string, request: RejectPaymentConfirmationRequest): Promise<PaymentConfirmationRequestDetailModel> {
    const response = await api.post<unknown>(withId(API.PAYMENT_CONFIRMATION_REQUESTS.REJECT, id), request);
    return normalizePaymentConfirmationRequestDetail(unwrapApiResponse(response.data));
  },
};
