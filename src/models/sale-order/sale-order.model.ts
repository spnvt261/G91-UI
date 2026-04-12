export type SaleOrderStatus =
  | "SUBMITTED"
  | "PROCESSING"
  | "RESERVED"
  | "PICKED"
  | "IN_TRANSIT"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED"
  | string;

export type SaleOrderTimelineStageKey =
  | "SUBMITTED"
  | "RESERVED"
  | "PICKED"
  | "DISPATCHED"
  | "DELIVERED"
  | "INVOICE_CREATED"
  | "PAYMENT_RECORDED"
  | "DEBT_SETTLED";

export interface SaleOrderModel {
  id: string;
  saleOrderNumber?: string;
  contractId?: string;
  contractNumber?: string;
  customerId?: string;
  customerCode?: string;
  customerName?: string;
  projectId?: string;
  projectCode?: string;
  projectName?: string;
  orderDate?: string;
  expectedDeliveryDate?: string;
  actualDeliveryDate?: string;
  status: SaleOrderStatus;
  totalAmount: number;
  note?: string;
  trackingNumber?: string;
}

export interface SaleOrderItemModel {
  id?: string;
  productId?: string;
  productCode?: string;
  productName?: string;
  description?: string;
  unit?: string;
  quantity: number;
  reservedQuantity?: number;
  pickedQuantity?: number;
  issuedQuantity?: number;
  deliveredQuantity?: number;
  unitPrice?: number;
  lineTotal?: number;
  fulfillmentStatus?: string;
}

export interface SaleOrderTimelineEventModel {
  id?: string;
  title?: string;
  eventType?: string;
  status?: string;
  at?: string;
  note?: string;
  trackingNumber?: string;
  actorName?: string;
  actorRole?: string;
  milestone?: string;
}

export interface SaleOrderRelatedInvoiceModel {
  invoiceId?: string;
  invoiceNumber?: string;
  contractId?: string;
  contractNumber?: string;
  status?: string;
  issueDate?: string;
  dueDate?: string;
  totalAmount?: number;
  paidAmount?: number;
  outstandingAmount?: number;
}

export interface SaleOrderInventoryIssueModel {
  transactionId?: string;
  transactionCode?: string;
  transactionType?: string;
  productId?: string;
  productCode?: string;
  productName?: string;
  quantity?: number;
  quantityBefore?: number;
  quantityAfter?: number;
  transactionDate?: string;
  operatorId?: string;
  operatorEmail?: string;
  reason?: string;
  note?: string;
  relatedOrderId?: string;
}

export interface SaleOrderFulfillmentModel {
  totalOrderedQuantity?: number;
  totalReservedQuantity?: number;
  totalIssuedQuantity?: number;
  totalDeliveredQuantity?: number;
  inventoryIssueCount?: number;
  invoiceCount?: number;
  reservedAt?: string;
  pickedAt?: string;
  dispatchedAt?: string;
  deliveredAt?: string;
  completedAt?: string;
  cancellationReason?: string;
  cancellationNote?: string;
}

export interface SaleOrderDetailModel {
  header: SaleOrderModel;
  customer?: {
    id?: string;
    code?: string;
    name?: string;
    contactPerson?: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  project?: {
    id?: string;
    code?: string;
    name?: string;
    status?: string;
    linkedOrderReference?: string;
  };
  items: SaleOrderItemModel[];
  fulfillment?: SaleOrderFulfillmentModel;
  timeline: SaleOrderTimelineEventModel[];
  inventoryIssues: SaleOrderInventoryIssueModel[];
  invoices: SaleOrderRelatedInvoiceModel[];
}

export interface SaleOrderListQuery {
  page?: number;
  pageSize?: number;
  keyword?: string;
  saleOrderNumber?: string;
  contractNumber?: string;
  customerId?: string;
  projectId?: string;
  status?: SaleOrderStatus;
  orderFrom?: string;
  orderTo?: string;
  deliveryFrom?: string;
  deliveryTo?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
}

export interface SaleOrderStatusUpdateRequest {
  status: Exclude<SaleOrderStatus, "SUBMITTED" | "CANCELLED">;
  note?: string;
  trackingNumber?: string;
  actualDeliveryDate?: string;
}

export interface SaleOrderActionRequest {
  note?: string;
  trackingNumber?: string;
  actualDeliveryDate?: string;
}

export interface SaleOrderCancelRequest {
  cancellationReason: "CUSTOMER_REQUEST" | "PRICE_DISPUTE" | "INVENTORY_SHORTAGE" | "CREDIT_RISK" | "DATA_ERROR" | "OTHER" | string;
  comment?: string;
}

export interface SaleOrderInvoiceItemRequest {
  productId?: string;
  description?: string;
  unit?: string;
  quantity?: number;
  unitPrice?: number;
}

export interface SaleOrderCreateInvoiceRequest {
  dueDate: string;
  issueDate?: string;
  adjustmentAmount?: number;
  billingAddress?: string;
  paymentTerms?: string;
  note?: string;
  status?: "DRAFT" | "ISSUED" | "OPEN";
  items?: SaleOrderInvoiceItemRequest[];
}

export interface SaleOrderActionResponseModel {
  saleOrderId?: string;
  saleOrderNumber?: string;
  contractNumber?: string;
  previousStatus?: SaleOrderStatus;
  currentStatus?: SaleOrderStatus;
  approvalStatus?: string;
  decision?: string;
  actedBy?: string;
  actedAt?: string;
  trackingNumber?: string;
  note?: string;
}

export interface SaleOrderTimelineResponseModel {
  saleOrderId: string;
  currentStatus?: SaleOrderStatus;
  milestones: SaleOrderTimelineEventModel[];
  events: SaleOrderTimelineEventModel[];
}
