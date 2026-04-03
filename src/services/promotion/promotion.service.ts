import { API, withId } from "../../api/URL_const";
import api from "../../apiConfig/axiosConfig";
import type { PaginationMeta } from "../../models/common/api.model";
import type {
  PromotionCreateRequest,
  PromotionDeleteResponseData,
  PromotionDetail,
  PromotionDetailResponseData,
  PromotionListItem,
  PromotionListQuery,
  PromotionListResponseData,
  PromotionSaveResponseData,
  PromotionStatus,
  PromotionType,
  PromotionUpdateRequest,
} from "../../models/promotion/promotion.model";
import { extractList, extractPagination } from "../service.utils";

interface PromotionApiCreateResponse {
  id: string;
  code?: string;
}

interface PromotionApiScopeProduct {
  productId: string;
  productCode?: string;
  productName?: string;
}

interface PromotionApiDetailResponse {
  id: string;
  code?: string;
  name: string;
  promotionType: string;
  discountValue: number;
  validFrom: string;
  validTo: string;
  status: string;
  priority?: number;
  description?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
  products?: PromotionApiScopeProduct[];
  customerGroups?: string[];
}

interface PromotionApiListItemResponse {
  id: string;
  code?: string;
  name: string;
  promotionType: string;
  discountValue: number;
  validFrom: string;
  validTo: string;
  status: string;
  priority?: number;
  scopeSummary?: string;
  productCount?: number;
  customerGroups?: string[];
  createdAt?: string;
  updatedAt?: string;
}

interface PromotionApiListResponseData {
  items?: PromotionApiListItemResponse[];
  content?: PromotionApiListItemResponse[];
  pagination?: PaginationMeta;
  page?: number;
  size?: number;
  totalElements?: number;
  totalPages?: number;
  filters?: {
    search?: string;
    status?: string;
    promotionType?: string;
    validFrom?: string;
    validTo?: string;
    customerGroup?: string;
    productId?: string;
  };
}

interface PromotionApiWriteRequest {
  name: string;
  promotionType: string;
  discountValue: number;
  validFrom: string;
  validTo: string;
  status?: string;
  priority?: number;
  description?: string;
  productIds?: string[];
  customerGroups?: string[];
}

interface PromotionApiListQuery {
  page?: number;
  size?: number;
  search?: string;
  status?: string;
  promotionType?: string;
  validFrom?: string;
  validTo?: string;
  customerGroup?: string;
  productId?: string;
}

const toUniqueValues = (values?: string[]): string[] =>
  [...new Set((values ?? []).map((value) => value.trim()).filter(Boolean))];

const toApiPromotionType = (type: PromotionType): string => {
  if (type === "FIXED_AMOUNT") {
    return "FIXED_AMOUNT";
  }

  return "PERCENT";
};

const toModelPromotionType = (type: string | undefined): PromotionType => {
  if ((type ?? "").toUpperCase() === "FIXED_AMOUNT") {
    return "FIXED_AMOUNT";
  }

  return "PERCENTAGE";
};

const toModelPromotionStatus = (status: string | undefined): PromotionStatus => {
  const normalized = (status ?? "").trim().toUpperCase();

  if (normalized === "ACTIVE") {
    return "ACTIVE";
  }

  if (normalized === "DRAFT" || normalized === "SCHEDULED" || normalized === "PENDING") {
    return "DRAFT";
  }

  return "INACTIVE";
};

const toNumberValue = (value: number | undefined): number => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  return value;
};

const toModelListItem = (item: PromotionApiListItemResponse): PromotionListItem => ({
  id: item.id,
  code: item.code,
  name: item.name,
  promotionType: toModelPromotionType(item.promotionType),
  discountValue: toNumberValue(item.discountValue),
  startDate: item.validFrom,
  endDate: item.validTo,
  status: toModelPromotionStatus(item.status),
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
  productCount: item.productCount,
  scopeSummary: item.scopeSummary,
  customerGroups: item.customerGroups,
  priority: item.priority,
});

const toModelDetail = (detail: PromotionApiDetailResponse): PromotionDetail => {
  const products = detail.products ?? [];

  return {
    id: detail.id,
    code: detail.code,
    name: detail.name,
    promotionType: toModelPromotionType(detail.promotionType),
    discountValue: toNumberValue(detail.discountValue),
    startDate: detail.validFrom,
    endDate: detail.validTo,
    status: toModelPromotionStatus(detail.status),
    createdBy: detail.createdBy,
    updatedBy: detail.updatedBy,
    createdAt: detail.createdAt,
    updatedAt: detail.updatedAt,
    productIds: products.map((item) => item.productId),
    productCount: products.length,
    applicableProducts: products.map((item) => ({
      productId: item.productId,
      productCode: item.productCode,
      productName: item.productName,
    })),
    customerGroups: detail.customerGroups,
    priority: detail.priority,
    description: detail.description,
  };
};

const toApiListQuery = (query?: PromotionListQuery): PromotionApiListQuery => ({
  page: query?.page,
  size: query?.pageSize,
  search: query?.keyword,
  status: query?.status,
  promotionType: query?.promotionType ? toApiPromotionType(query.promotionType) : undefined,
  validFrom: query?.startFrom,
  validTo: query?.endTo,
  customerGroup: query?.customerGroup,
  productId: query?.productId,
});

const toApiWritePayload = (payload: PromotionCreateRequest | PromotionUpdateRequest): PromotionApiWriteRequest => ({
  name: payload.name.trim(),
  promotionType: toApiPromotionType(payload.promotionType),
  discountValue: payload.discountValue,
  validFrom: payload.startDate,
  validTo: payload.endDate,
  status: payload.status || undefined,
  priority: payload.priority,
  description: payload.description?.trim() || undefined,
  productIds: toUniqueValues(payload.productIds),
  customerGroups: toUniqueValues(payload.customerGroups),
});

const toFallbackModelAfterCreate = (id: string, code: string | undefined, payload: PromotionCreateRequest): PromotionDetail => {
  const productIds = toUniqueValues(payload.productIds);

  return {
    id,
    code,
    name: payload.name,
    promotionType: payload.promotionType,
    discountValue: payload.discountValue,
    startDate: payload.startDate,
    endDate: payload.endDate,
    status: payload.status,
    productIds,
    productCount: productIds.length,
    applicableProducts: productIds.map((productId) => ({ productId })),
    customerGroups: toUniqueValues(payload.customerGroups),
    priority: payload.priority,
    description: payload.description,
  };
};

export const promotionService = {
  async getList(query?: PromotionListQuery): Promise<PromotionListResponseData> {
    const response = await api.get<PromotionApiListResponseData>(API.PROMOTIONS.LIST, { params: toApiListQuery(query) });
    const payload = response.data;
    const items = extractList<PromotionApiListItemResponse>(payload).map(toModelListItem);
    const pagination = extractPagination(payload, {
      page: query?.page ?? 1,
      pageSize: query?.pageSize ?? 10,
      totalItems: items.length,
    });

    return {
      items,
      pagination,
      filters: {
        keyword: payload.filters?.search ?? query?.keyword,
        status: payload.filters?.status ? toModelPromotionStatus(payload.filters.status) : undefined,
        promotionType: payload.filters?.promotionType ? toModelPromotionType(payload.filters.promotionType) : undefined,
        startFrom: payload.filters?.validFrom ?? query?.startFrom,
        endTo: payload.filters?.validTo ?? query?.endTo,
        customerGroup: payload.filters?.customerGroup,
        productId: payload.filters?.productId,
      },
    };
  },

  async getDetail(id: string): Promise<PromotionDetailResponseData> {
    const response = await api.get<PromotionApiDetailResponse>(withId(API.PROMOTIONS.DETAIL, id));
    return {
      promotion: toModelDetail(response.data),
    };
  },

  async create(payload: PromotionCreateRequest): Promise<PromotionSaveResponseData> {
    const response = await api.post<PromotionApiCreateResponse>(API.PROMOTIONS.CREATE, toApiWritePayload(payload));

    try {
      const detailResponse = await api.get<PromotionApiDetailResponse>(withId(API.PROMOTIONS.DETAIL, response.data.id));
      return {
        promotion: toModelDetail(detailResponse.data),
      };
    } catch {
      return {
        promotion: toFallbackModelAfterCreate(response.data.id, response.data.code, payload),
      };
    }
  },

  async update(id: string, payload: PromotionUpdateRequest): Promise<PromotionSaveResponseData> {
    const response = await api.put<PromotionApiDetailResponse>(withId(API.PROMOTIONS.UPDATE, id), toApiWritePayload(payload));
    return {
      promotion: toModelDetail(response.data),
    };
  },

  async delete(id: string): Promise<PromotionDeleteResponseData> {
    await api.delete<void>(withId(API.PROMOTIONS.DELETE, id));
    return {
      id,
      deleted: true,
      deletedAt: new Date().toISOString(),
    };
  },
};
