import api from "../../apiConfig/axiosConfig";
import { API, withPathParams } from "../../api/URL_const";
import type { PaginationMeta } from "../../models/common/api.model";
import type { InvoiceModel } from "../../models/invoice/invoice.model";
import type {
  SaleOrderActionRequest,
  SaleOrderActionResponseModel,
  SaleOrderCancelRequest,
  SaleOrderCreateInvoiceRequest,
  SaleOrderDetailModel,
  SaleOrderInventoryIssueModel,
  SaleOrderItemModel,
  SaleOrderListQuery,
  SaleOrderModel,
  SaleOrderRelatedInvoiceModel,
  SaleOrderTimelineEventModel,
  SaleOrderTimelineResponseModel,
  SaleOrderStatusUpdateRequest,
} from "../../models/sale-order/sale-order.model";
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

const normalizeTimelineEvent = (payload: unknown): SaleOrderTimelineEventModel => {
  const source = asRecord(payload);
  return {
    id: asString(source.id),
    title: asString(source.title),
    eventType: asString(source.eventType ?? source.type),
    status: asString(source.status ?? source.eventStatus),
    at: asString(source.at ?? source.eventAt ?? source.actualAt ?? source.expectedAt ?? source.createdAt),
    note: asString(source.note ?? source.description),
    trackingNumber: asString(source.trackingNumber),
    actorName: asString(source.actorName),
    actorRole: asString(source.actorRole),
    milestone: asString(source.milestone),
  };
};

const normalizeItem = (payload: unknown): SaleOrderItemModel => {
  const item = asRecord(payload);
  return {
    id: asString(item.id),
    productId: asString(item.productId),
    productCode: asString(item.productCode),
    productName: asString(item.productName),
    description: asString(item.description),
    unit: asString(item.unit),
    quantity: asNumber(item.quantity ?? item.orderedQuantity),
    reservedQuantity: asNumber(item.reservedQuantity),
    pickedQuantity: asNumber(item.pickedQuantity),
    issuedQuantity: asNumber(item.issuedQuantity),
    deliveredQuantity: asNumber(item.deliveredQuantity),
    unitPrice: asNumber(item.unitPrice),
    lineTotal: asNumber(item.lineTotal ?? item.totalAmount ?? item.amount),
    fulfillmentStatus: asString(item.fulfillmentStatus ?? item.status),
  };
};

const normalizeRelatedInvoice = (payload: unknown): SaleOrderRelatedInvoiceModel => {
  const item = asRecord(payload);
  return {
    invoiceId: asString(item.invoiceId ?? item.id),
    invoiceNumber: asString(item.invoiceNumber),
    status: asString(item.status),
    totalAmount: asNumber(item.totalAmount ?? item.grandTotal),
    outstandingAmount: asNumber(item.outstandingAmount ?? item.remainingAmount),
    issuedAt: asString(item.issuedAt ?? item.issueDate),
  };
};

const normalizeInventoryIssue = (payload: unknown): SaleOrderInventoryIssueModel => {
  const item = asRecord(payload);
  return {
    issueId: asString(item.issueId ?? item.id),
    issueNumber: asString(item.issueNumber ?? item.referenceNo),
    status: asString(item.status),
    issuedAt: asString(item.issuedAt ?? item.createdAt),
    note: asString(item.note),
  };
};

const normalizeOrderHeader = (payload: unknown): SaleOrderModel => {
  const source = asRecord(payload);
  const project = asRecord(source.project);

  return {
    id: asString(source.id ?? source.saleOrderId) ?? "",
    saleOrderNumber: asString(source.saleOrderNumber ?? source.orderNumber),
    contractId: asString(source.contractId),
    contractNumber: asString(source.contractNumber),
    customerId: asString(source.customerId),
    customerCode: asString(source.customerCode),
    customerName: asString(source.customerName),
    projectId: asString(source.projectId ?? project.id),
    projectCode: asString(source.projectCode ?? project.code),
    projectName: asString(source.projectName ?? project.name),
    orderDate: asString(source.orderDate ?? source.createdAt ?? source.submittedAt),
    expectedDeliveryDate: asString(source.expectedDeliveryDate),
    actualDeliveryDate: asString(source.actualDeliveryDate),
    status: asString(source.status ?? source.currentStatus) ?? "SUBMITTED",
    totalAmount: asNumber(source.totalAmount ?? source.grandTotal ?? source.amount),
    note: asString(source.note),
    trackingNumber: asString(source.trackingNumber),
  };
};

const normalizeDetail = (payload: unknown): SaleOrderDetailModel => {
  const root = asRecord(payload);
  const detail = asRecord(root.detail);
  const source = Object.keys(detail).length > 0 ? detail : root;
  const headerSource = asRecord(source.header ?? source.saleOrder ?? source.order ?? source);
  const customerSource = asRecord(source.customer);
  const projectSource = asRecord(source.project);
  const timelineSource = asArray(source.timeline);
  const timelineData = asRecord(source.timeline);

  const timelineEvents = [
    ...timelineSource.map(normalizeTimelineEvent),
    ...asArray(timelineData.milestones).map(normalizeTimelineEvent),
    ...asArray(timelineData.events).map(normalizeTimelineEvent),
  ];

  return {
    header: normalizeOrderHeader(headerSource),
    customer:
      Object.keys(customerSource).length > 0
        ? {
            id: asString(customerSource.id ?? customerSource.customerId),
            code: asString(customerSource.code ?? customerSource.customerCode),
            name: asString(customerSource.name ?? customerSource.companyName ?? customerSource.customerName),
            contactPerson: asString(customerSource.contactPerson),
            phone: asString(customerSource.phone),
            email: asString(customerSource.email),
            address: asString(customerSource.address),
          }
        : undefined,
    project:
      Object.keys(projectSource).length > 0
        ? {
            id: asString(projectSource.id ?? projectSource.projectId),
            code: asString(projectSource.code ?? projectSource.projectCode),
            name: asString(projectSource.name ?? projectSource.projectName),
            status: asString(projectSource.status),
          }
        : undefined,
    items: asArray(source.items).map(normalizeItem),
    fulfillment: {
      reservedAt: asString(asRecord(source.fulfillment).reservedAt),
      pickedAt: asString(asRecord(source.fulfillment).pickedAt),
      dispatchedAt: asString(asRecord(source.fulfillment).dispatchedAt),
      deliveredAt: asString(asRecord(source.fulfillment).deliveredAt),
      completedAt: asString(asRecord(source.fulfillment).completedAt),
      cancellationReason: asString(asRecord(source.fulfillment).cancellationReason),
      cancellationNote: asString(asRecord(source.fulfillment).cancellationNote),
    },
    timeline: timelineEvents,
    inventoryIssues: asArray(source.inventoryIssues).map(normalizeInventoryIssue),
    invoices: asArray(source.invoices).map(normalizeRelatedInvoice),
  };
};

const normalizeActionResponse = (payload: unknown): SaleOrderActionResponseModel => {
  const source = asRecord(payload);
  return {
    saleOrderId: asString(source.saleOrderId ?? source.id),
    previousStatus: asString(source.previousStatus),
    currentStatus: asString(source.currentStatus ?? source.status),
    decision: asString(source.decision),
    actedBy: asString(source.actedBy),
    actedAt: asString(source.actedAt),
    trackingNumber: asString(source.trackingNumber),
    note: asString(source.note),
  };
};

const normalizeTimeline = (payload: unknown, fallbackSaleOrderId: string): SaleOrderTimelineResponseModel => {
  const source = asRecord(payload);
  const milestones = asArray(source.milestones).map(normalizeTimelineEvent);
  const events = asArray(source.events).map(normalizeTimelineEvent);

  return {
    saleOrderId: asString(source.saleOrderId) ?? fallbackSaleOrderId,
    currentStatus: asString(source.currentStatus ?? source.status),
    milestones,
    events,
  };
};

const normalizeInvoice = (payload: unknown): InvoiceModel => {
  const source = asRecord(payload);
  const invoice = asRecord(source.invoice);
  const root = Object.keys(invoice).length > 0 ? invoice : source;

  return {
    id: asString(root.id) ?? "",
    invoiceNumber: asString(root.invoiceNumber),
    customerId: asString(root.customerId),
    customerCode: asString(root.customerCode),
    customerName: asString(root.customerName),
    contractId: asString(root.contractId),
    contractNumber: asString(root.contractNumber),
    issueDate: asString(root.issueDate),
    dueDate: asString(root.dueDate),
    status: asString(root.status) ?? "DRAFT",
    subtotalAmount: asNumber(root.subtotalAmount ?? root.subTotalAmount),
    adjustmentAmount: asNumber(root.adjustmentAmount),
    vatAmount: asNumber(root.vatAmount),
    grandTotal: asNumber(root.grandTotal ?? root.totalAmount),
    paidAmount: asNumber(root.paidAmount),
    outstandingAmount: asNumber(root.outstandingAmount ?? root.remainingAmount),
    billingAddress: asString(root.billingAddress),
    paymentTerms: asString(root.paymentTerms),
    note: asString(root.note),
    cancellationReason: asString(root.cancellationReason),
    items: asArray(source.items).map((item) => {
      const invoiceItem = asRecord(item);
      return {
        id: asString(invoiceItem.id),
        productId: asString(invoiceItem.productId),
        description: asString(invoiceItem.description),
        unit: asString(invoiceItem.unit),
        quantity: asNumber(invoiceItem.quantity),
        unitPrice: asNumber(invoiceItem.unitPrice),
        lineTotal: asNumber(invoiceItem.lineTotal ?? invoiceItem.amount),
      };
    }),
    paymentHistory: asArray(source.paymentHistory).map((payment) => {
      const history = asRecord(payment);
      return {
        paymentId: asString(history.paymentId ?? history.id),
        receiptNumber: asString(history.receiptNumber),
        paymentDate: asString(history.paymentDate),
        paymentMethod: asString(history.paymentMethod),
        referenceNo: asString(history.referenceNo),
        allocatedAmount: asNumber(history.allocatedAmount ?? history.amount),
        note: asString(history.note),
      };
    }),
  };
};

export const saleOrderService = {
  async getList(query?: SaleOrderListQuery): Promise<{ items: SaleOrderModel[]; pagination: PaginationMeta }> {
    const response = await api.get<unknown>(API.SALE_ORDERS.LIST, { params: query });
    const payload = unwrapApiResponse<unknown>(response.data);
    const items = extractList<unknown>(payload).map(normalizeOrderHeader);
    const pagination = extractPagination(payload, {
      page: query?.page ?? 1,
      pageSize: query?.pageSize ?? 10,
      totalItems: items.length,
    });

    return { items, pagination };
  },

  async getDetail(saleOrderId: string): Promise<SaleOrderDetailModel> {
    const response = await api.get<unknown>(withPathParams(API.SALE_ORDERS.DETAIL, { saleOrderId }));
    return normalizeDetail(unwrapApiResponse(response.data));
  },

  async getTimeline(saleOrderId: string): Promise<SaleOrderTimelineResponseModel> {
    const response = await api.get<unknown>(withPathParams(API.SALE_ORDERS.TIMELINE, { saleOrderId }));
    return normalizeTimeline(unwrapApiResponse(response.data), saleOrderId);
  },

  async updateStatus(saleOrderId: string, request: SaleOrderStatusUpdateRequest): Promise<SaleOrderActionResponseModel> {
    const response = await api.patch<unknown>(withPathParams(API.SALE_ORDERS.UPDATE_STATUS, { saleOrderId }), request);
    return normalizeActionResponse(unwrapApiResponse(response.data));
  },

  async reserve(saleOrderId: string, request: SaleOrderActionRequest = {}): Promise<SaleOrderActionResponseModel> {
    const response = await api.post<unknown>(withPathParams(API.SALE_ORDERS.RESERVE, { saleOrderId }), request);
    return normalizeActionResponse(unwrapApiResponse(response.data));
  },

  async pick(saleOrderId: string, request: SaleOrderActionRequest = {}): Promise<SaleOrderActionResponseModel> {
    const response = await api.post<unknown>(withPathParams(API.SALE_ORDERS.PICK, { saleOrderId }), request);
    return normalizeActionResponse(unwrapApiResponse(response.data));
  },

  async dispatch(saleOrderId: string, request: SaleOrderActionRequest = {}): Promise<SaleOrderActionResponseModel> {
    const response = await api.post<unknown>(withPathParams(API.SALE_ORDERS.DISPATCH, { saleOrderId }), request);
    return normalizeActionResponse(unwrapApiResponse(response.data));
  },

  async deliver(saleOrderId: string, request: SaleOrderActionRequest = {}): Promise<SaleOrderActionResponseModel> {
    const response = await api.post<unknown>(withPathParams(API.SALE_ORDERS.DELIVER, { saleOrderId }), request);
    return normalizeActionResponse(unwrapApiResponse(response.data));
  },

  async complete(saleOrderId: string, request: SaleOrderActionRequest = {}): Promise<SaleOrderActionResponseModel> {
    const response = await api.post<unknown>(withPathParams(API.SALE_ORDERS.COMPLETE, { saleOrderId }), request);
    return normalizeActionResponse(unwrapApiResponse(response.data));
  },

  async cancel(saleOrderId: string, request: SaleOrderCancelRequest): Promise<SaleOrderActionResponseModel> {
    const response = await api.post<unknown>(withPathParams(API.SALE_ORDERS.CANCEL, { saleOrderId }), request);
    return normalizeActionResponse(unwrapApiResponse(response.data));
  },

  async createInvoice(saleOrderId: string, request: SaleOrderCreateInvoiceRequest): Promise<InvoiceModel> {
    const response = await api.post<unknown>(withPathParams(API.SALE_ORDERS.CREATE_INVOICE, { saleOrderId }), request);
    return normalizeInvoice(unwrapApiResponse(response.data));
  },
};
