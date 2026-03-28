export type InventoryTransactionType = "RECEIPT" | "ISSUE" | "ADJUSTMENT";

export interface InventoryStatusListQuery {
  page?: number;
  size?: number;
  search?: string;
  productId?: string;
}

export interface InventoryStatusItem {
  productId: string;
  productCode?: string;
  productName?: string;
  unit?: string;
  onHandQuantity: number;
  availableQuantity?: number;
  reservedQuantity?: number;
  updatedAt?: string;
}

export interface InventoryStatusListResponse {
  items: InventoryStatusItem[];
  page: number;
  size: number;
  totalElements: number;
}

export interface InventoryReceiptRequest {
  productId: string;
  quantity: number;
  receiptDate: string;
  supplierName?: string;
  reason?: string;
  note?: string;
}

export interface InventoryIssueRequest {
  productId: string;
  quantity: number;
  relatedOrderId?: string;
  relatedProjectId?: string;
  reason?: string;
  note?: string;
}

export interface InventoryAdjustmentRequest {
  productId: string;
  adjustmentQuantity: number;
  reason?: string;
  note?: string;
}

export interface InventoryHistoryQuery {
  page?: number;
  size?: number;
  search?: string;
  transactionType?: InventoryTransactionType;
  fromDate?: string;
  toDate?: string;
  productId?: string;
}

export interface InventoryHistoryItem {
  id: string;
  transactionType: InventoryTransactionType;
  productId: string;
  productCode?: string;
  productName?: string;
  quantity: number;
  balanceAfter?: number;
  reason?: string;
  note?: string;
  createdAt?: string;
}

export interface InventoryHistoryResponse {
  items: InventoryHistoryItem[];
  page: number;
  size: number;
  totalElements: number;
}
