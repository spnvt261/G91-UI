import api from "../../apiConfig/axiosConfig";
import { API, withId } from "../../api/URL_const";
import type {
  ProductCreateRequest,
  ProductListQuery,
  ProductListResponse,
  ProductModel,
  ProductStatusResponse,
  ProductStatusUpdateRequest,
  ProductUpdateRequest,
} from "../../models/product/product.model";
import { extractList } from "../service.utils";

export const productService = {
  async getList(params?: ProductListQuery): Promise<ProductListResponse> {
    const response = await api.get<unknown>(API.PRODUCTS.LIST, { params });
    const data = response.data as Partial<ProductListResponse> | undefined;

    return {
      items: extractList<ProductListResponse["items"][number]>(data),
      pagination: data?.pagination ?? {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 0,
        totalItems: 0,
        totalPages: 0,
      },
      filters: data?.filters ?? {},
    };
  },

  async getDetail(id: string): Promise<ProductModel> {
    const response = await api.get<ProductModel>(withId(API.PRODUCTS.DETAIL, id));
    return response.data;
  },

  async create(request: ProductCreateRequest): Promise<ProductModel> {
    const response = await api.post<ProductModel>(API.PRODUCTS.CREATE, request);
    return response.data;
  },

  async update(id: string, request: ProductUpdateRequest): Promise<ProductModel> {
    const response = await api.put<ProductModel>(withId(API.PRODUCTS.UPDATE, id), request);
    return response.data;
  },

  async updateStatus(id: string, request: ProductStatusUpdateRequest): Promise<ProductStatusResponse> {
    const response = await api.patch<ProductStatusResponse>(withId(API.PRODUCTS.STATUS, id), request);
    return response.data;
  },
};
