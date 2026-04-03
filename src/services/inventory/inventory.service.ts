import api from "../../apiConfig/axiosConfig";
import { API } from "../../api/URL_const";
import type {
  InventoryAdjustmentRequest,
  InventoryHistoryItem,
  InventoryHistoryQuery,
  InventoryHistoryResponse,
  InventoryIssueRequest,
  InventoryReceiptRequest,
  InventoryStatusItem,
  InventoryStatusListQuery,
  InventoryStatusListResponse,
  InventoryTransactionType,
} from "../../models/inventory/inventory.model";
import { extractList } from "../service.utils";

interface PagedApiResponse<T> {
  content?: T[];
  items?: T[];
  pagination?: {
    page?: number;
    size?: number;
    pageSize?: number;
    totalItems?: number;
    totalElements?: number;
  };
  page?: number;
  size?: number;
  pageSize?: number;
  totalItems?: number;
  totalElements?: number;
  data?: unknown;
}

interface InventoryStatusApiItem {
  productId?: string;
  productCode?: string;
  productName?: string;
  type?: string;
  unit?: string;
  currentQuantity?: number;
  onHandQuantity?: number;
  availableQuantity?: number;
  reservedQuantity?: number;
  updatedAt?: string;
}

interface InventoryHistoryApiItem {
  id?: string;
  transactionId?: string;
  transactionCode?: string;
  transactionType?: string;
  productId?: string;
  productCode?: string;
  productName?: string;
  quantity?: number;
  quantityBefore?: number;
  quantityAfter?: number;
  balanceAfter?: number;
  transactionDate?: string;
  createdAt?: string;
  operatorId?: string;
  operatorEmail?: string;
  supplierName?: string;
  relatedOrderId?: string;
  relatedProjectId?: string;
  reason?: string;
  note?: string;
}

const toTransactionType = (value: string | undefined): InventoryTransactionType => {
  if (value === "ISSUE" || value === "ADJUSTMENT") {
    return value;
  }

  return "RECEIPT";
};

const toNumber = (value: unknown, fallback = 0): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const toStatusItem = (row: InventoryStatusApiItem): InventoryStatusItem => {
  const currentQuantity = toNumber(row.currentQuantity ?? row.onHandQuantity, 0);

  return {
    productId: row.productId ?? "",
    productCode: row.productCode,
    productName: row.productName,
    type: row.type,
    unit: row.unit,
    currentQuantity,
    onHandQuantity: currentQuantity,
    availableQuantity: row.availableQuantity == null ? undefined : toNumber(row.availableQuantity),
    reservedQuantity: row.reservedQuantity == null ? undefined : toNumber(row.reservedQuantity),
    updatedAt: row.updatedAt,
  };
};

const toHistoryItem = (row: InventoryHistoryApiItem): InventoryHistoryItem => ({
  id: row.id ?? row.transactionId ?? "",
  transactionId: row.transactionId ?? row.id ?? "",
  transactionCode: row.transactionCode,
  transactionType: toTransactionType(row.transactionType),
  productId: row.productId ?? "",
  productCode: row.productCode,
  productName: row.productName,
  quantity: toNumber(row.quantity, 0),
  quantityBefore: row.quantityBefore == null ? undefined : toNumber(row.quantityBefore),
  quantityAfter: row.quantityAfter == null ? undefined : toNumber(row.quantityAfter),
  balanceAfter: row.balanceAfter == null ? undefined : toNumber(row.balanceAfter),
  transactionDate: row.transactionDate,
  createdAt: row.createdAt,
  operatorId: row.operatorId,
  operatorEmail: row.operatorEmail,
  supplierName: row.supplierName,
  relatedOrderId: row.relatedOrderId,
  relatedProjectId: row.relatedProjectId,
  reason: row.reason,
  note: row.note,
});

const toPagedResult = <TInput, TOutput>(
  payload: unknown,
  query: { page?: number; size?: number },
  mapper: (value: TInput) => TOutput,
) => {
  const data = payload as PagedApiResponse<TInput> | TInput[] | undefined;
  const items = extractList<TInput>(data).map(mapper);
  const paged = data && typeof data === "object" && !Array.isArray(data) ? data : undefined;
  const nestedData =
    paged && typeof paged.data === "object" && paged.data !== null && !Array.isArray(paged.data)
      ? (paged.data as PagedApiResponse<TInput>)
      : undefined;
  const source = nestedData ?? paged;
  const pagination = source?.pagination;

  return {
    items,
    page: Number(pagination?.page ?? source?.page ?? query.page ?? 1),
    size: Number(pagination?.size ?? pagination?.pageSize ?? source?.size ?? source?.pageSize ?? query.size ?? 10),
    totalElements: Number(pagination?.totalItems ?? pagination?.totalElements ?? source?.totalItems ?? source?.totalElements ?? items.length),
  };
};

export const inventoryService = {
  async createReceipt(payload: InventoryReceiptRequest): Promise<void> {
    await api.post<void>(API.INVENTORY.RECEIPTS_CREATE, payload);
  },

  async createIssue(payload: InventoryIssueRequest): Promise<void> {
    await api.post<void>(API.INVENTORY.ISSUES_CREATE, payload);
  },

  async createAdjustment(payload: InventoryAdjustmentRequest): Promise<void> {
    await api.post<void>(API.INVENTORY.ADJUSTMENTS_CREATE, payload);
  },

  async getStatus(query?: InventoryStatusListQuery): Promise<InventoryStatusListResponse> {
    const response = await api.get<unknown>(API.INVENTORY.STATUS, { params: query });
    return toPagedResult<InventoryStatusApiItem, InventoryStatusItem>(response.data, { page: query?.page, size: query?.size }, toStatusItem);
  },

  async getHistory(query?: InventoryHistoryQuery): Promise<InventoryHistoryResponse> {
    const response = await api.get<unknown>(API.INVENTORY.HISTORY, { params: query });
    return toPagedResult<InventoryHistoryApiItem, InventoryHistoryItem>(response.data, { page: query?.page, size: query?.size }, toHistoryItem);
  },
};
