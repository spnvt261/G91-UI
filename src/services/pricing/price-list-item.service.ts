import api from "../../apiConfig/axiosConfig";
import { API, withId } from "../../api/URL_const";
import type {
  PriceListItemCreateDataResponse,
  PriceListItemCreateRequest,
  PriceListItemUpdateRequest,
} from "../../models/pricing/price-list.model";

export const priceListItemService = {
  async create(priceListId: string, requestBody: PriceListItemCreateRequest): Promise<PriceListItemCreateDataResponse> {
    const response = await api.post<PriceListItemCreateDataResponse>(withId(API.PRICE_LISTS.ADD_ITEM, priceListId), requestBody);
    return response.data;
  },

  async update(id: string, requestBody: PriceListItemUpdateRequest): Promise<void> {
    await api.put<void>(withId(API.PRICE_LIST_ITEMS.UPDATE, id), requestBody);
  },

  async remove(id: string): Promise<void> {
    await api.delete<void>(withId(API.PRICE_LIST_ITEMS.DELETE, id));
  },
};
