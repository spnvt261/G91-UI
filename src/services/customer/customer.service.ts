import api from "../../apiConfig/axiosConfig";
import { API, withId } from "../../api/URL_const";
import type {
  CustomerCreateRequest,
  CustomerListQuery,
  CustomerModel,
  CustomerUpdateRequest,
} from "../../models/customer/customer.model";
import { extractList } from "../service.utils";

export const customerService = {
  async create(request: CustomerCreateRequest): Promise<CustomerModel> {
    const response = await api.post<CustomerModel>(API.CUSTOMER.CREATE, request);
    return response.data;
  },

  async getList(params?: CustomerListQuery): Promise<CustomerModel[]> {
    const response = await api.get<unknown>(API.CUSTOMER.LIST, { params });
    return extractList<CustomerModel>(response.data);
  },

  async getDetail(id: string): Promise<CustomerModel> {
    const response = await api.get<CustomerModel>(withId(API.CUSTOMER.DETAIL, id));
    return response.data;
  },

  async update(id: string, request: CustomerUpdateRequest): Promise<CustomerModel> {
    const response = await api.put<CustomerModel>(withId(API.CUSTOMER.UPDATE, id), request);
    return response.data;
  },
};
