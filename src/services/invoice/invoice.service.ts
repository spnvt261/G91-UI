import api from "../../apiConfig/axiosConfig";
import { API, withId } from "../../api/URL_const";
import type {
  InvoiceCancelRequest,
  InvoiceCreateRequest,
  InvoiceItemModel,
  InvoiceListQuery,
  InvoiceListResponse,
  InvoiceModel,
  InvoicePaymentHistoryModel,
  InvoiceUpdateRequest,
} from "../../models/invoice/invoice.model";
import { extractList, extractPagination, unwrapApiResponse } from "../service.utils";

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord => (typeof value === "object" && value !== null ? (value as UnknownRecord) : {});
const asString = (value: unknown): string | undefined => (typeof value === "string" ? value : undefined);
const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
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

const normalizeItem = (payload: unknown): InvoiceItemModel => {
  const item = asRecord(payload);
  return {
    id: asString(item.id),
    productId: asString(item.productId),
    description: asString(item.description ?? item.productName),
    unit: asString(item.unit),
    quantity: asNumber(item.quantity),
    unitPrice: asNumber(item.unitPrice),
    lineTotal: asNumber(item.lineTotal ?? item.amount ?? item.totalPrice),
  };
};

const normalizePaymentHistory = (payload: unknown): InvoicePaymentHistoryModel => {
  const item = asRecord(payload);
  return {
    paymentId: asString(item.paymentId ?? item.id),
    receiptNumber: asString(item.receiptNumber),
    paymentDate: asString(item.paymentDate ?? item.paidAt),
    paymentMethod: asString(item.paymentMethod),
    referenceNo: asString(item.referenceNo),
    allocatedAmount: asNumber(item.allocatedAmount ?? item.amount),
    note: asString(item.note),
  };
};

const normalizeInvoice = (payload: unknown): InvoiceModel => {
  const root = asRecord(payload);
  const invoiceData = asRecord(root.invoice);
  const source = Object.keys(invoiceData).length > 0 ? invoiceData : root;
  const itemsSource = asArray(root.items ?? source.items);
  const paymentHistorySource = asArray(root.paymentHistory ?? root.allocations ?? source.paymentHistory ?? source.allocations);

  return {
    id: asString(source.id) ?? "",
    invoiceNumber: asString(source.invoiceNumber),
    customerId: asString(source.customerId),
    customerCode: asString(source.customerCode),
    customerName: asString(source.customerName),
    contractId: asString(source.contractId),
    contractNumber: asString(source.contractNumber),
    issueDate: asString(source.issueDate),
    dueDate: asString(source.dueDate),
    status: asString(source.status) ?? "DRAFT",
    subtotalAmount: asNumber(source.subtotalAmount ?? source.subTotalAmount),
    adjustmentAmount: asNumber(source.adjustmentAmount),
    vatAmount: asNumber(source.vatAmount),
    grandTotal: asNumber(source.grandTotal ?? source.totalAmount),
    paidAmount: asNumber(source.paidAmount),
    outstandingAmount: asNumber(source.outstandingAmount ?? source.remainingAmount ?? source.dueAmount),
    billingAddress: asString(source.billingAddress),
    paymentTerms: asString(source.paymentTerms),
    note: asString(source.note),
    cancellationReason: asString(source.cancellationReason),
    items: itemsSource.map(normalizeItem),
    paymentHistory: paymentHistorySource.map(normalizePaymentHistory),
  };
};

export const invoiceService = {
  async getList(query?: InvoiceListQuery): Promise<InvoiceListResponse> {
    const response = await api.get<unknown>(API.INVOICES.LIST, { params: query });
    const payload = unwrapApiResponse<unknown>(response.data);
    const items = extractList<unknown>(payload).map(normalizeInvoice);
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

  async getDetail(id: string): Promise<InvoiceModel> {
    const response = await api.get<unknown>(withId(API.INVOICES.DETAIL, id));
    return normalizeInvoice(unwrapApiResponse(response.data));
  },

  async create(request: InvoiceCreateRequest): Promise<InvoiceModel> {
    const response = await api.post<unknown>(API.INVOICES.CREATE, request);
    return normalizeInvoice(unwrapApiResponse(response.data));
  },

  async update(id: string, request: InvoiceUpdateRequest): Promise<InvoiceModel> {
    const response = await api.put<unknown>(withId(API.INVOICES.UPDATE, id), request);
    return normalizeInvoice(unwrapApiResponse(response.data));
  },

  async cancel(id: string, request: InvoiceCancelRequest): Promise<InvoiceModel> {
    const response = await api.post<unknown>(withId(API.INVOICES.CANCEL, id), request);
    return normalizeInvoice(unwrapApiResponse(response.data));
  },
};
