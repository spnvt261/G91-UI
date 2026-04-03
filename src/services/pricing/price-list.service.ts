import api from "../../apiConfig/axiosConfig";
import { API, withId } from "../../api/URL_const";
import type {
  PriceListItemModel,
  PriceListListQuery,
  PriceListListResponseData,
  PriceListModel,
  PriceListStatus,
  PriceListWriteRequest,
} from "../../models/pricing/price-list.model";
import { extractList, extractPagination } from "../service.utils";

interface PriceListApiItem {
  id?: string;
  productId?: string;
  productCode?: string;
  productName?: string;
  unitPriceVnd?: number;
  unitPrice?: number;
  unit_price_vnd?: number;
  unitPriceVND?: number;
  pricingRuleType?: string;
  note?: string;
}

interface PriceListApiModel {
  id: string;
  name: string;
  customerGroup?: string;
  validFrom?: string;
  validTo?: string;
  startDate?: string;
  endDate?: string;
  status?: string;
  itemCount?: number;
  items?: PriceListApiItem[];
  createdBy?: string;
  updatedBy?: string;
  createdAt?: string;
  updatedAt?: string;
}

const toPriceListStatus = (value: string | undefined): PriceListStatus => {
  return value === "INACTIVE" ? "INACTIVE" : "ACTIVE";
};

const toItemModel = (item: PriceListApiItem): PriceListItemModel => ({
  id: item.id,
  productId: item.productId ?? "",
  productCode: item.productCode,
  productName: item.productName,
  unitPriceVnd: Number(item.unitPriceVnd ?? item.unitPrice ?? item.unit_price_vnd ?? item.unitPriceVND ?? 0),
  pricingRuleType: item.pricingRuleType,
  note: item.note,
});

const toModel = (item: PriceListApiModel): PriceListModel => {
  const items = (item.items ?? []).map(toItemModel).filter((row) => Boolean(row.productId));

  return {
    id: item.id,
    name: item.name,
    customerGroup: item.customerGroup,
    validFrom: item.validFrom ?? item.startDate ?? "",
    validTo: item.validTo ?? item.endDate ?? "",
    status: toPriceListStatus(item.status),
    itemCount: Number(item.itemCount ?? items.length),
    items,
    createdBy: item.createdBy,
    updatedBy: item.updatedBy,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
  };
};

const toWritePayload = (payload: PriceListWriteRequest) => ({
  name: payload.name.trim(),
  customerGroup: payload.customerGroup?.trim() || undefined,
  validFrom: payload.validFrom,
  validTo: payload.validTo,
  status: payload.status,
  items: payload.items.map((item) => ({
    productId: item.productId,
    unitPriceVnd: item.unitPriceVnd,
    pricingRuleType: item.pricingRuleType,
    note: item.note,
  })),
});

export const priceListService = {
  async create(payload: PriceListWriteRequest): Promise<{ id: string }> {
    const response = await api.post<{ id: string }>(API.PRICE_LISTS.CREATE, toWritePayload(payload));
    return response.data;
  },

  async getList(query?: PriceListListQuery): Promise<PriceListListResponseData> {
    const response = await api.get<unknown>(API.PRICE_LISTS.LIST, { params: query });
    const payload = response.data;
    const items = extractList<PriceListApiModel>(payload).map(toModel);
    const pagination = extractPagination(payload, {
      page: query?.page ?? 1,
      pageSize: query?.size ?? 10,
      totalItems: items.length,
    });

    return {
      items,
      page: pagination.page,
      size: pagination.pageSize,
      totalElements: pagination.totalItems,
    };
  },

  async getDetail(id: string): Promise<PriceListModel> {
    const response = await api.get<PriceListApiModel>(withId(API.PRICE_LISTS.DETAIL, id));
    return toModel(response.data);
  },

  async update(id: string, payload: PriceListWriteRequest): Promise<void> {
    await api.put<void>(withId(API.PRICE_LISTS.UPDATE, id), toWritePayload(payload));
  },

  async remove(id: string): Promise<void> {
    await api.delete<void>(withId(API.PRICE_LISTS.DELETE, id));
  },
};
