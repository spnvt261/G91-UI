import api from "../../apiConfig/axiosConfig";
import { API, withId } from "../../api/URL_const";
import type { ApiResponse } from "../../models/common/api.model";
import type {
  ProductCreateRequest,
  ProductListQuery,
  ProductListResponse,
  ProductModel,
  ProductStatusResponse,
  ProductStatusUpdateRequest,
  ProductUpdateRequest,
} from "../../models/product/product.model";

const unwrap = <T>(response: { data: ApiResponse<T> }): T => response.data.data;

export const productService = {
  async getList(params?: ProductListQuery): Promise<ProductListResponse> {
    const response = await api.get<ApiResponse<ProductListResponse>>(API.PRODUCT.LIST, { params });
    return unwrap(response);
  },

  async getDetail(id: string): Promise<ProductModel> {
    const response = await api.get<ApiResponse<ProductModel>>(withId(API.PRODUCT.DETAIL, id));
    return unwrap(response);
  },

  async create(request: ProductCreateRequest): Promise<ProductModel> {
    const response = await api.post<ApiResponse<ProductModel>>(API.PRODUCT.CREATE, request);
    return unwrap(response);
  },

  async update(id: string, request: ProductUpdateRequest): Promise<ProductModel> {
    const response = await api.put<ApiResponse<ProductModel>>(withId(API.PRODUCT.UPDATE, id), request);
    return unwrap(response);
  },

  async updateStatus(id: string, request: ProductStatusUpdateRequest): Promise<ProductStatusResponse> {
    const response = await api.patch<ApiResponse<ProductStatusResponse>>(withId(API.PRODUCT.STATUS, id), request);
    return unwrap(response);
  },
};
