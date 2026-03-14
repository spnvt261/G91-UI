import api from "../../apiConfig/axiosConfig";
import { API, withId } from "../../api/URL_const";
import type { ApiResponse } from "../../models/common/api.model";
import type {
  QuotationListQuery,
  QuotationModel,
  QuotationRequest,
} from "../../models/quotation/quotation.model";

const unwrap = <T>(response: { data: ApiResponse<T> }): T => response.data.data;

export const quotationService = {
  async create(request: QuotationRequest): Promise<QuotationModel> {
    const response = await api.post<ApiResponse<QuotationModel>>(API.QUOTATION.CREATE, request);
    return unwrap(response);
  },

  async getList(params?: QuotationListQuery): Promise<QuotationModel[]> {
    const response = await api.get<ApiResponse<QuotationModel[]>>(API.QUOTATION.LIST, { params });
    return unwrap(response);
  },

  async getDetail(id: string): Promise<QuotationModel> {
    const response = await api.get<ApiResponse<QuotationModel>>(withId(API.QUOTATION.DETAIL, id));
    return unwrap(response);
  },

  async update(id: string, request: QuotationRequest): Promise<QuotationModel> {
    const response = await api.put<ApiResponse<QuotationModel>>(withId(API.QUOTATION.UPDATE, id), request);
    return unwrap(response);
  },

  async submit(id: string): Promise<void> {
    await api.post<ApiResponse<null>>(withId(API.QUOTATION.SUBMIT, id));
  },
};
