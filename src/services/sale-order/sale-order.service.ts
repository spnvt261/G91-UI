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
  SaleOrderStatusUpdateRequest,
  SaleOrderTimelineEventModel,
  SaleOrderTimelineResponseModel,
} from "../../models/sale-order/sale-order.model";
import { extractList, extractPagination, unwrapApiResponse } from "../service.utils";

type UnknownRecord = Record<string, unknown>;

const asRecord = (value: unknown): UnknownRecord => (typeof value === "object" && value !== null ? (value as UnknownRecord) : {});
const asArray = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);
const asString = (value: unknown): string | undefined => (typeof value === "string" ? value : undefined);

const asNumber = (value: unknown, fallback = 0): number => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
};

const asOptionalNumber = (value: unknown): number | undefined => {
  const parsed = asNumber(value, Number.NaN);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const normalizeTimelineEvent = (payload: unknown): SaleOrderTimelineEventModel => {
  const source = asRecord(payload);
  return {
    id: asString(source.id ?? source.eventId),
    title: asString(source.title ?? source.name),
    eventType: asString(source.eventType ?? source.type ?? source.milestone),
    status: asString(source.status ?? source.eventStatus ?? source.milestoneStatus),
    at: asString(source.at ?? source.eventAt ?? source.actualAt ?? source.expectedAt ?? source.actedAt ?? source.createdAt),
    note: asString(source.note ?? source.description ?? source.comment),
    trackingNumber: asString(source.trackingNumber ?? source.trackingNo),
    actorName: asString(source.actorName ?? source.actedBy),
    actorRole: asString(source.actorRole),
    milestone: asString(source.milestone),
  };
};

const dedupeTimelineEvents = (events: SaleOrderTimelineEventModel[]): SaleOrderTimelineEventModel[] => {
  const seen = new Set<string>();
  return events.filter((event) => {
    const key = `${event.id ?? ""}|${event.eventType ?? ""}|${event.status ?? ""}|${event.at ?? ""}|${event.title ?? ""}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const normalizeItem = (payload: unknown): SaleOrderItemModel => {
  const source = asRecord(payload);
  return {
    id: asString(source.id),
    productId: asString(source.productId),
    productCode: asString(source.productCode),
    productName: asString(source.productName),
    description: asString(source.description),
    unit: asString(source.unit),
    quantity: asNumber(source.quantity ?? source.orderedQuantity),
    reservedQuantity: asOptionalNumber(source.reservedQuantity),
    pickedQuantity: asOptionalNumber(source.pickedQuantity),
    issuedQuantity: asOptionalNumber(source.issuedQuantity),
    deliveredQuantity: asOptionalNumber(source.deliveredQuantity),
    unitPrice: asOptionalNumber(source.unitPrice),
    lineTotal: asOptionalNumber(source.lineTotal ?? source.totalAmount ?? source.amount),
    fulfillmentStatus: asString(source.fulfillmentStatus ?? source.status),
  };
};

const normalizeRelatedInvoice = (payload: unknown): SaleOrderRelatedInvoiceModel => {
  const source = asRecord(payload);
  return {
    invoiceId: asString(source.invoiceId ?? source.id),
    invoiceNumber: asString(source.invoiceNumber),
    contractId: asString(source.contractId),
    contractNumber: asString(source.contractNumber),
    status: asString(source.status),
    issueDate: asString(source.issueDate ?? source.issuedAt ?? source.createdAt),
    dueDate: asString(source.dueDate),
    totalAmount: asOptionalNumber(source.totalAmount ?? source.grandTotal),
    paidAmount: asOptionalNumber(source.paidAmount),
    outstandingAmount: asOptionalNumber(source.outstandingAmount ?? source.remainingAmount),
  };
};

const normalizeInventoryIssue = (payload: unknown): SaleOrderInventoryIssueModel => {
  const source = asRecord(payload);
  return {
    transactionId: asString(source.transactionId ?? source.id ?? source.issueId),
    transactionCode: asString(source.transactionCode ?? source.issueNumber ?? source.referenceNo),
    transactionType: asString(source.transactionType ?? source.type ?? source.status),
    productId: asString(source.productId),
    productCode: asString(source.productCode),
    productName: asString(source.productName),
    quantity: asOptionalNumber(source.quantity),
    quantityBefore: asOptionalNumber(source.quantityBefore),
    quantityAfter: asOptionalNumber(source.quantityAfter ?? source.balanceAfter),
    transactionDate: asString(source.transactionDate ?? source.issuedAt ?? source.createdAt),
    operatorId: asString(source.operatorId),
    operatorEmail: asString(source.operatorEmail),
    reason: asString(source.reason),
    note: asString(source.note),
    relatedOrderId: asString(source.relatedOrderId),
  };
};

const normalizeOrderHeader = (payload: unknown): SaleOrderModel => {
  const source = asRecord(payload);
  const project = asRecord(source.project);
  const headerId = asString(source.id ?? source.saleOrderId ?? source.contractId) ?? "";

  return {
    id: headerId,
    saleOrderNumber: asString(source.saleOrderNumber ?? source.orderNumber),
    contractId: asString(source.contractId) ?? headerId,
    contractNumber: asString(source.contractNumber),
    customerId: asString(source.customerId),
    customerCode: asString(source.customerCode),
    customerName: asString(source.customerName),
    projectId: asString(source.projectId ?? project.id),
    projectCode: asString(source.projectCode ?? project.code),
    projectName: asString(source.projectName ?? project.name),
    orderDate: asString(source.orderDate ?? source.submittedAt ?? source.createdAt),
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
  const fulfillmentSource = asRecord(source.fulfillment);

  const timelineSource = asArray(source.timeline);
  const timelineData = asRecord(source.timeline);
  const timeline = dedupeTimelineEvents([
    ...timelineSource.map(normalizeTimelineEvent),
    ...asArray(timelineData.milestones).map(normalizeTimelineEvent),
    ...asArray(timelineData.events).map(normalizeTimelineEvent),
  ]);

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
            linkedOrderReference: asString(projectSource.linkedOrderReference),
          }
        : undefined,
    items: asArray(source.items).map(normalizeItem),
    fulfillment:
      Object.keys(fulfillmentSource).length > 0
        ? {
            totalOrderedQuantity: asOptionalNumber(fulfillmentSource.totalOrderedQuantity),
            totalReservedQuantity: asOptionalNumber(fulfillmentSource.totalReservedQuantity),
            totalIssuedQuantity: asOptionalNumber(fulfillmentSource.totalIssuedQuantity),
            totalDeliveredQuantity: asOptionalNumber(fulfillmentSource.totalDeliveredQuantity),
            inventoryIssueCount: asOptionalNumber(fulfillmentSource.inventoryIssueCount),
            invoiceCount: asOptionalNumber(fulfillmentSource.invoiceCount),
            reservedAt: asString(fulfillmentSource.reservedAt),
            pickedAt: asString(fulfillmentSource.pickedAt),
            dispatchedAt: asString(fulfillmentSource.dispatchedAt),
            deliveredAt: asString(fulfillmentSource.deliveredAt),
            completedAt: asString(fulfillmentSource.completedAt),
            cancellationReason: asString(fulfillmentSource.cancellationReason),
            cancellationNote: asString(fulfillmentSource.cancellationNote),
          }
        : undefined,
    timeline,
    inventoryIssues: asArray(source.inventoryIssues).map(normalizeInventoryIssue),
    invoices: asArray(source.invoices).map(normalizeRelatedInvoice),
  };
};

const normalizeActionResponse = (payload: unknown): SaleOrderActionResponseModel => {
  const source = asRecord(payload);
  return {
    saleOrderId: asString(source.saleOrderId ?? source.id),
    saleOrderNumber: asString(source.saleOrderNumber),
    contractNumber: asString(source.contractNumber),
    previousStatus: asString(source.previousStatus),
    currentStatus: asString(source.currentStatus ?? source.status),
    approvalStatus: asString(source.approvalStatus),
    decision: asString(source.decision),
    actedBy: asString(source.actedBy),
    actedAt: asString(source.actedAt),
    trackingNumber: asString(source.trackingNumber),
    note: asString(source.note),
  };
};

const normalizeTimeline = (payload: unknown, fallbackSaleOrderId: string): SaleOrderTimelineResponseModel => {
  const source = asRecord(payload);
  return {
    saleOrderId: asString(source.saleOrderId) ?? fallbackSaleOrderId,
    currentStatus: asString(source.currentStatus ?? source.status),
    milestones: dedupeTimelineEvents(asArray(source.milestones).map(normalizeTimelineEvent)),
    events: dedupeTimelineEvents(asArray(source.events).map(normalizeTimelineEvent)),
  };
};

const normalizeInvoice = (payload: unknown): InvoiceModel => {
  const source = asRecord(payload);
  const invoice = asRecord(source.invoice);
  const root = Object.keys(invoice).length > 0 ? invoice : source;
  const items = asArray(source.items ?? root.items);
  const paymentHistory = asArray(source.paymentHistory ?? root.paymentHistory);

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
    items: items.map((itemPayload) => {
      const item = asRecord(itemPayload);
      return {
        id: asString(item.id),
        productId: asString(item.productId),
        description: asString(item.description),
        unit: asString(item.unit),
        quantity: asNumber(item.quantity),
        unitPrice: asNumber(item.unitPrice),
        lineTotal: asNumber(item.lineTotal ?? item.amount),
      };
    }),
    paymentHistory: paymentHistory.map((paymentPayload) => {
      const payment = asRecord(paymentPayload);
      return {
        paymentId: asString(payment.paymentId ?? payment.id),
        receiptNumber: asString(payment.receiptNumber),
        paymentDate: asString(payment.paymentDate),
        paymentMethod: asString(payment.paymentMethod),
        referenceNo: asString(payment.referenceNo),
        allocatedAmount: asNumber(payment.allocatedAmount ?? payment.amount),
        note: asString(payment.note),
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
