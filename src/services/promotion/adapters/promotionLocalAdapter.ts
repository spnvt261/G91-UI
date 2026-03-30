import type {
  PromotionCreateRequest,
  PromotionDeleteResponseData,
  PromotionDetailResponseData,
  PromotionListQuery,
  PromotionListResponseData,
  PromotionSaveResponseData,
  PromotionSortBy,
  PromotionSortDirection,
  PromotionUpdateRequest,
} from "../../../models/promotion/promotion.model";
import {
  normalizePromotionStorageState,
  toPromotionDetail,
  toPromotionListItem,
  toPromotionProductStorageRecords,
  toPromotionStorageFromCreateRequest,
  toPromotionStorageFromUpdateRequest,
  type PromotionStorageState,
} from "../promotion.mapper";

const STORAGE_KEY = "g91.promotions.v1";
const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 8;
const DEFAULT_SORT_BY: PromotionSortBy = "updatedAt";
const DEFAULT_SORT_DIR: PromotionSortDirection = "desc";

const createSeedState = (): PromotionStorageState => ({
  version: 1,
  promotions: [
    {
      id: "promo-001",
      code: "PROMO-Q1-8P",
      name: "Khuyen mai quy I 8%",
      promotion_type: "PERCENTAGE",
      discount_value: 8,
      start_date: "2026-01-10",
      end_date: "2026-04-15",
      status: "ACTIVE",
      created_by: "owner@g91.local",
      created_at: "2026-01-05T08:00:00.000Z",
      updated_at: "2026-01-20T09:30:00.000Z",
    },
    {
      id: "promo-002",
      code: "PROMO-BULK-15M",
      name: "Giam gia theo goi don lon",
      promotion_type: "FIXED_AMOUNT",
      discount_value: 15_000_000,
      start_date: "2026-02-01",
      end_date: "2026-05-31",
      status: "ACTIVE",
      created_by: "owner@g91.local",
      created_at: "2026-01-28T02:00:00.000Z",
      updated_at: "2026-02-14T02:00:00.000Z",
    },
    {
      id: "promo-003",
      code: "PROMO-APR-5P",
      name: "Chuong trinh thang 4 cho khach hang moi",
      promotion_type: "PERCENTAGE",
      discount_value: 5,
      start_date: "2026-04-01",
      end_date: "2026-04-30",
      status: "DRAFT",
      created_by: "owner@g91.local",
      created_at: "2026-03-15T05:00:00.000Z",
      updated_at: "2026-03-15T05:00:00.000Z",
    },
    {
      id: "promo-004",
      code: "PROMO-ENDYEAR-12P",
      name: "Khuyen mai cuoi nam",
      promotion_type: "PERCENTAGE",
      discount_value: 12,
      start_date: "2025-11-01",
      end_date: "2025-12-31",
      status: "INACTIVE",
      created_by: "owner@g91.local",
      created_at: "2025-10-20T04:15:00.000Z",
      updated_at: "2026-01-01T00:00:00.000Z",
    },
    {
      id: "promo-005",
      code: "PROMO-PIPELINE-7P",
      name: "Uu dai danh muc ong thep",
      promotion_type: "PERCENTAGE",
      discount_value: 7,
      start_date: "2026-02-20",
      end_date: "2026-06-30",
      status: "INACTIVE",
      created_by: "owner@g91.local",
      created_at: "2026-02-19T03:20:00.000Z",
      updated_at: "2026-03-01T03:20:00.000Z",
    },
    {
      id: "promo-006",
      code: "PROMO-PROJECT-25M",
      name: "Ho tro gia tri hop dong du an",
      promotion_type: "FIXED_AMOUNT",
      discount_value: 25_000_000,
      start_date: "2026-03-01",
      end_date: "2026-07-31",
      status: "ACTIVE",
      created_by: "owner@g91.local",
      created_at: "2026-02-25T11:00:00.000Z",
      updated_at: "2026-03-05T11:00:00.000Z",
    },
  ],
  promotionProducts: [
    { id: "promo-001-prod-1", promotion_id: "promo-001", product_id: "prod-001" },
    { id: "promo-001-prod-2", promotion_id: "promo-001", product_id: "prod-002" },
    { id: "promo-002-prod-1", promotion_id: "promo-002", product_id: "prod-003" },
    { id: "promo-002-prod-2", promotion_id: "promo-002", product_id: "prod-004" },
    { id: "promo-002-prod-3", promotion_id: "promo-002", product_id: "prod-005" },
    { id: "promo-003-prod-1", promotion_id: "promo-003", product_id: "prod-001" },
    { id: "promo-004-prod-1", promotion_id: "promo-004", product_id: "prod-006" },
    { id: "promo-005-prod-1", promotion_id: "promo-005", product_id: "prod-007" },
    { id: "promo-006-prod-1", promotion_id: "promo-006", product_id: "prod-002" },
    { id: "promo-006-prod-2", promotion_id: "promo-006", product_id: "prod-008" },
  ],
});

const parseDateValue = (value: string | undefined): number | undefined => {
  if (!value) {
    return undefined;
  }

  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? undefined : parsed;
};

const normalizeKeyword = (value: string | undefined): string => value?.trim().toLowerCase() ?? "";

const comparePrimitive = (left: string | number | undefined, right: string | number | undefined): number => {
  if (typeof left === "number" && typeof right === "number") {
    return left - right;
  }

  const leftValue = String(left ?? "").toLowerCase();
  const rightValue = String(right ?? "").toLowerCase();

  if (leftValue < rightValue) {
    return -1;
  }
  if (leftValue > rightValue) {
    return 1;
  }
  return 0;
};

const createPromotionId = (): string => {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }

  return `promo-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
};

const readState = (): PromotionStorageState => {
  const fallback = createSeedState();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
      return fallback;
    }

    const parsed = JSON.parse(raw) as Partial<PromotionStorageState> | null;
    if (!parsed || parsed.version !== 1 || !Array.isArray(parsed.promotions) || !Array.isArray(parsed.promotionProducts)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
      return fallback;
    }

    return normalizePromotionStorageState({
      version: 1,
      promotions: parsed.promotions,
      promotionProducts: parsed.promotionProducts,
    });
  } catch {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fallback));
    return fallback;
  }
};

const writeState = (state: PromotionStorageState) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizePromotionStorageState(state)));
};

const getProductIdsByPromotionId = (state: PromotionStorageState, promotionId: string): string[] => {
  return state.promotionProducts
    .filter((item) => item.promotion_id === promotionId)
    .map((item) => item.product_id);
};

const buildSortValue = (item: ReturnType<typeof toPromotionListItem>, sortBy: PromotionSortBy): string | number | undefined => {
  switch (sortBy) {
    case "name":
      return item.name;
    case "promotionType":
      return item.promotionType;
    case "discountValue":
      return item.discountValue;
    case "startDate":
      return parseDateValue(item.startDate) ?? 0;
    case "endDate":
      return parseDateValue(item.endDate) ?? 0;
    case "status":
      return item.status;
    case "createdAt":
      return parseDateValue(item.createdAt);
    case "updatedAt":
      return parseDateValue(item.updatedAt);
    default:
      return parseDateValue(item.updatedAt);
  }
};

const filterList = (
  items: ReturnType<typeof toPromotionListItem>[],
  query?: PromotionListQuery,
): ReturnType<typeof toPromotionListItem>[] => {
  const keyword = normalizeKeyword(query?.keyword);
  const startFromTime = parseDateValue(query?.startFrom);
  const startToTime = parseDateValue(query?.startTo);
  const endFromTime = parseDateValue(query?.endFrom);
  const endToTime = parseDateValue(query?.endTo);

  return items.filter((item) => {
    if (keyword.length > 0) {
      const searchTarget = `${item.name} ${item.code ?? ""}`.toLowerCase();
      if (!searchTarget.includes(keyword)) {
        return false;
      }
    }

    if (query?.status && item.status !== query.status) {
      return false;
    }

    if (query?.promotionType && item.promotionType !== query.promotionType) {
      return false;
    }

    const startDateTime = parseDateValue(item.startDate);
    const endDateTime = parseDateValue(item.endDate);

    if (startFromTime != null && (startDateTime == null || startDateTime < startFromTime)) {
      return false;
    }

    if (startToTime != null && (startDateTime == null || startDateTime > startToTime)) {
      return false;
    }

    if (endFromTime != null && (endDateTime == null || endDateTime < endFromTime)) {
      return false;
    }

    if (endToTime != null && (endDateTime == null || endDateTime > endToTime)) {
      return false;
    }

    return true;
  });
};

const sortList = (
  items: ReturnType<typeof toPromotionListItem>[],
  sortBy: PromotionSortBy,
  sortDir: PromotionSortDirection,
): ReturnType<typeof toPromotionListItem>[] => {
  const multiplier = sortDir === "asc" ? 1 : -1;

  return [...items].sort((left, right) => {
    const leftValue = buildSortValue(left, sortBy);
    const rightValue = buildSortValue(right, sortBy);
    return comparePrimitive(leftValue, rightValue) * multiplier;
  });
};

export const promotionLocalAdapter = {
  async getList(query?: PromotionListQuery): Promise<PromotionListResponseData> {
    const state = readState();
    const mapped = state.promotions.map((promotion) =>
      toPromotionListItem(promotion, getProductIdsByPromotionId(state, promotion.id)),
    );

    const filtered = filterList(mapped, query);
    const sortBy = query?.sortBy ?? DEFAULT_SORT_BY;
    const sortDir = query?.sortDir ?? DEFAULT_SORT_DIR;
    const sorted = sortList(filtered, sortBy, sortDir);

    const page = Math.max(DEFAULT_PAGE, query?.page ?? DEFAULT_PAGE);
    const pageSize = Math.max(1, query?.pageSize ?? DEFAULT_PAGE_SIZE);
    const totalItems = sorted.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const pagedItems = sorted.slice(startIndex, startIndex + pageSize);

    return {
      items: pagedItems,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
      },
      filters: {
        keyword: query?.keyword,
        status: query?.status,
        promotionType: query?.promotionType,
        startFrom: query?.startFrom,
        startTo: query?.startTo,
        endFrom: query?.endFrom,
        endTo: query?.endTo,
      },
    };
  },

  async getDetail(id: string): Promise<PromotionDetailResponseData> {
    const state = readState();
    const promotion = state.promotions.find((item) => item.id === id);

    if (!promotion) {
      throw new Error("Promotion not found.");
    }

    const productIds = getProductIdsByPromotionId(state, promotion.id);

    return {
      promotion: toPromotionDetail(
        promotion,
        productIds,
        productIds.map((productId) => ({ productId })),
      ),
    };
  },

  async create(payload: PromotionCreateRequest): Promise<PromotionSaveResponseData> {
    const state = readState();
    const nowIso = new Date().toISOString();
    const newId = createPromotionId();
    const promotionRecord = toPromotionStorageFromCreateRequest(newId, payload, nowIso);
    const productRecords = toPromotionProductStorageRecords(newId, payload.productIds);

    const nextState: PromotionStorageState = {
      ...state,
      promotions: [promotionRecord, ...state.promotions],
      promotionProducts: [...state.promotionProducts, ...productRecords],
    };

    writeState(nextState);

    return {
      promotion: toPromotionDetail(
        promotionRecord,
        productRecords.map((item) => item.product_id),
        productRecords.map((item) => ({ productId: item.product_id })),
      ),
    };
  },

  async update(id: string, payload: PromotionUpdateRequest): Promise<PromotionSaveResponseData> {
    const state = readState();
    const existing = state.promotions.find((item) => item.id === id);

    if (!existing) {
      throw new Error("Promotion not found.");
    }

    const nowIso = new Date().toISOString();
    const updatedRecord = toPromotionStorageFromUpdateRequest(existing, payload, nowIso);
    const updatedProductRecords = toPromotionProductStorageRecords(id, payload.productIds);

    const nextState: PromotionStorageState = {
      ...state,
      promotions: state.promotions.map((item) => (item.id === id ? updatedRecord : item)),
      promotionProducts: [...state.promotionProducts.filter((item) => item.promotion_id !== id), ...updatedProductRecords],
    };

    writeState(nextState);

    return {
      promotion: toPromotionDetail(
        updatedRecord,
        updatedProductRecords.map((item) => item.product_id),
        updatedProductRecords.map((item) => ({ productId: item.product_id })),
      ),
    };
  },

  async delete(id: string): Promise<PromotionDeleteResponseData> {
    const state = readState();
    const target = state.promotions.find((item) => item.id === id);

    if (!target) {
      throw new Error("Promotion not found.");
    }

    const deletedAt = new Date().toISOString();
    const nextState: PromotionStorageState = {
      ...state,
      promotions: state.promotions.filter((item) => item.id !== id),
      promotionProducts: state.promotionProducts.filter((item) => item.promotion_id !== id),
    };

    writeState(nextState);

    return {
      id,
      deleted: true,
      deletedAt,
    };
  },
};
