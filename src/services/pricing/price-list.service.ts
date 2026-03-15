import api from "../../apiConfig/axiosConfig";
import { API, withId } from "../../api/URL_const";
import type {
  PriceListCreateDataResponse,
  PriceListCreateRequest,
  PriceListDetailResponse,
  PriceListItemCreateDataResponse,
  PriceListItemCreateRequest,
  PriceListItemUpdateRequest,
  PriceListListQuery,
  PriceListListResponseData,
  PriceListUpdateRequest,
} from "../../models/pricing/price-list.model";

export const priceListService = {
  async create(requestBody: PriceListCreateRequest): Promise<PriceListCreateDataResponse> {
    const response = await api.post<PriceListCreateDataResponse>(API.PRICE_LISTS.CREATE, requestBody);
    return response.data;
  },

  async getList(params?: PriceListListQuery): Promise<PriceListListResponseData> {
    const response = await api.get<PriceListListResponseData>(API.PRICE_LISTS.LIST, { params });
    return response.data;
  },

  async getDetail(id: string): Promise<PriceListDetailResponse> {
    const response = await api.get<PriceListDetailResponse>(withId(API.PRICE_LISTS.DETAIL, id));
    return response.data;
  },

  async update(id: string, requestBody: PriceListUpdateRequest): Promise<void> {
    await api.put<void>(withId(API.PRICE_LISTS.UPDATE, id), requestBody);
  },

  async remove(id: string): Promise<void> {
    await api.delete<void>(withId(API.PRICE_LISTS.DELETE, id));
  },

  async addItem(id: string, requestBody: PriceListItemCreateRequest): Promise<PriceListItemCreateDataResponse> {
    const response = await api.post<PriceListItemCreateDataResponse>(withId(API.PRICE_LISTS.ADD_ITEM, id), requestBody);
    return response.data;
  },

  async updateItem(id: string, requestBody: PriceListItemUpdateRequest): Promise<void> {
    await api.put<void>(withId(API.PRICE_LIST_ITEMS.UPDATE, id), requestBody);
  },

  async deleteItem(id: string): Promise<void> {
    await api.delete<void>(withId(API.PRICE_LIST_ITEMS.DELETE, id));
  },
};
