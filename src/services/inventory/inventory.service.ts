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
  unit?: string;
  currentQuantity?: number;
  onHandQuantity?: number;
  availableQuantity?: number;
  reservedQuantity?: number;
  updatedAt?: string;
}

interface InventoryHistoryApiItem {
  id?: string;
  transactionType?: string;
  productId?: string;
  productCode?: string;
  productName?: string;
  quantity?: number;
  balanceAfter?: number;
  reason?: string;
  note?: string;
  createdAt?: string;
}

const toTransactionType = (value: string | undefined): InventoryTransactionType => {
  if (value === "ISSUE" || value === "ADJUSTMENT") {
    return value;
  }

  return "RECEIPT";
};

const toStatusItem = (row: InventoryStatusApiItem): InventoryStatusItem => ({
  productId: row.productId ?? "",
  productCode: row.productCode,
  productName: row.productName,
  unit: row.unit,
  onHandQuantity: Number(row.onHandQuantity ?? row.currentQuantity ?? 0),
  availableQuantity:
    row.availableQuantity == null ? (row.currentQuantity == null ? undefined : Number(row.currentQuantity)) : Number(row.availableQuantity),
  reservedQuantity: row.reservedQuantity == null ? undefined : Number(row.reservedQuantity),
  updatedAt: row.updatedAt,
});

const toHistoryItem = (row: InventoryHistoryApiItem): InventoryHistoryItem => ({
  id: row.id ?? "",
  transactionType: toTransactionType(row.transactionType),
  productId: row.productId ?? "",
  productCode: row.productCode,
  productName: row.productName,
  quantity: Number(row.quantity ?? 0),
  balanceAfter: row.balanceAfter == null ? undefined : Number(row.balanceAfter),
  reason: row.reason,
  note: row.note,
  createdAt: row.createdAt,
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
    const paged = toPagedResult<InventoryStatusApiItem, InventoryStatusItem>(response.data, { page: query?.page, size: query?.size }, toStatusItem);
    return paged;
  },

  async getHistory(query?: InventoryHistoryQuery): Promise<InventoryHistoryResponse> {
    const response = await api.get<unknown>(API.INVENTORY.HISTORY, { params: query });
    const paged = toPagedResult<InventoryHistoryApiItem, InventoryHistoryItem>(response.data, { page: query?.page, size: query?.size }, toHistoryItem);
    return paged;
  },
};
