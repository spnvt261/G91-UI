import api from "../../apiConfig/axiosConfig";
import { API, withId } from "../../api/URL_const";
import type {
  AccountCreateDataResponse,
  AccountCreateRequest,
  AccountDeactivateRequest,
  AccountDetailResponse,
  AccountListQuery,
  AccountListResponseData,
  AccountUpdateRequest,
} from "../../models/account/account.model";

export const accountService = {
  async create(requestBody: AccountCreateRequest): Promise<AccountCreateDataResponse> {
    const response = await api.post<AccountCreateDataResponse>(API.ACCOUNTS.CREATE, requestBody);
    return response.data;
  },

  async getList(params?: AccountListQuery): Promise<AccountListResponseData> {
    const response = await api.get<AccountListResponseData>(API.ACCOUNTS.LIST, { params });
    return response.data;
  },

  async getDetail(id: string): Promise<AccountDetailResponse> {
    const response = await api.get<AccountDetailResponse>(withId(API.ACCOUNTS.DETAIL, id));
    return response.data;
  },

  async update(id: string, requestBody: AccountUpdateRequest): Promise<void> {
    await api.put<void>(withId(API.ACCOUNTS.UPDATE, id), requestBody);
  },

  async deactivate(id: string, requestBody?: AccountDeactivateRequest): Promise<void> {
    await api.patch<void>(withId(API.ACCOUNTS.DEACTIVATE, id), requestBody);
  },
};
