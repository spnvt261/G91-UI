import api from "../../apiConfig/axiosConfig";
import { API, withId } from "../../api/URL_const";
import type { ApiResponse } from "../../models/common/api.model";
import type {
  CustomerCreateRequest,
  CustomerListQuery,
  CustomerModel,
  CustomerUpdateRequest,
} from "../../models/customer/customer.model";

const unwrap = <T>(response: { data: ApiResponse<T> }): T => response.data.data;

export const customerService = {
  async create(request: CustomerCreateRequest): Promise<CustomerModel> {
    const response = await api.post<ApiResponse<CustomerModel>>(API.CUSTOMER.CREATE, request);
    return unwrap(response);
  },

  async getList(params?: CustomerListQuery): Promise<CustomerModel[]> {
    const response = await api.get<ApiResponse<CustomerModel[]>>(API.CUSTOMER.LIST, { params });
    return unwrap(response);
  },

  async getDetail(id: string): Promise<CustomerModel> {
    const response = await api.get<ApiResponse<CustomerModel>>(withId(API.CUSTOMER.DETAIL, id));
    return unwrap(response);
  },

  async update(id: string, request: CustomerUpdateRequest): Promise<CustomerModel> {
    const response = await api.put<ApiResponse<CustomerModel>>(withId(API.CUSTOMER.UPDATE, id), request);
    return unwrap(response);
  },
};
