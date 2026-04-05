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
  status?: string;
  totalAmount?: number;
  outstandingAmount?: number;
  issuedAt?: string;
}

export interface SaleOrderInventoryIssueModel {
  issueId?: string;
  issueNumber?: string;
  status?: string;
  issuedAt?: string;
  note?: string;
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
  };
  items: SaleOrderItemModel[];
  fulfillment?: {
    reservedAt?: string;
    pickedAt?: string;
    dispatchedAt?: string;
    deliveredAt?: string;
    completedAt?: string;
    cancellationReason?: string;
    cancellationNote?: string;
  };
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
  cancellationReason: string;
  comment?: string;
}

export interface SaleOrderInvoiceItemRequest {
  productId?: string;
  description?: string;
  unit?: string;
  quantity: number;
  unitPrice: number;
}

export interface SaleOrderCreateInvoiceRequest {
  dueDate: string;
  issueDate?: string;
  adjustmentAmount?: number;
  billingAddress?: string;
  paymentTerms?: string;
  note?: string;
  status?: "DRAFT" | "ISSUED";
  items?: SaleOrderInvoiceItemRequest[];
}

export interface SaleOrderActionResponseModel {
  saleOrderId?: string;
  previousStatus?: SaleOrderStatus;
  currentStatus?: SaleOrderStatus;
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
