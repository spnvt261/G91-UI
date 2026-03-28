import api from "../../apiConfig/axiosConfig";
import { API, withId } from "../../api/URL_const";
import type {
  ProductCreateRequest,
  ProductListQuery,
  ProductListResponse,
  ProductModel,
  ProductStatus,
  ProductStatusResponse,
  ProductStatusUpdateRequest,
  ProductUpdateRequest,
} from "../../models/product/product.model";
import { extractList } from "../service.utils";

interface ProductApiModel {
  id: string;
  productCode: string;
  productName: string;
  type: string;
  size: string;
  thickness: string;
  unit: string;
  weightConversion?: number | null;
  referenceWeight?: number | null;
  status?: string;
  imageUrls?: string[];
  images?: string[];
  mainImage?: string;
  image?: string;
  createdAt?: string;
}

interface ProductApiListResponse {
  items?: ProductApiModel[];
  content?: ProductApiModel[];
  pagination?: {
    page?: number;
    pageSize?: number;
    totalItems?: number;
    totalPages?: number;
  };
  page?: number;
  size?: number;
  totalElements?: number;
  filters?: Record<string, string | undefined>;
}

const toStatus = (value: string | undefined): ProductStatus => (value === "INACTIVE" ? "INACTIVE" : "ACTIVE");

const toUniqueImageUrls = (...sources: Array<string[] | undefined>): string[] => {
  const all = sources.flatMap((source) => source ?? []).map((item) => item.trim()).filter(Boolean);
  return [...new Set(all)];
};

const toModel = (payload: ProductApiModel): ProductModel => {
  const imageUrls = toUniqueImageUrls(payload.imageUrls, payload.images);
  const mainImage = payload.mainImage ?? payload.image ?? imageUrls[0];

  return {
    id: payload.id,
    productCode: payload.productCode,
    productName: payload.productName,
    type: payload.type,
    size: payload.size,
    thickness: payload.thickness,
    unit: payload.unit,
    weightConversion: payload.weightConversion,
    referenceWeight: payload.referenceWeight,
    status: toStatus(payload.status),
    imageUrls,
    mainImage,
    images: imageUrls,
    createdAt: payload.createdAt,
  };
};

const toWritePayload = (payload: ProductCreateRequest | ProductUpdateRequest) => ({
  productCode: payload.productCode.trim(),
  productName: payload.productName.trim(),
  type: payload.type.trim(),
  size: payload.size.trim(),
  thickness: payload.thickness.trim(),
  unit: payload.unit.trim(),
  weightConversion: payload.weightConversion,
  referenceWeight: payload.referenceWeight,
  status: payload.status,
  imageUrls: toUniqueImageUrls(payload.imageUrls),
});

export const productService = {
  async getList(query?: ProductListQuery): Promise<ProductListResponse> {
    const params = {
      ...query,
      page: query?.page,
      size: query?.size ?? query?.pageSize,
      search: query?.search ?? query?.keyword,
    };

    const response = await api.get<unknown>(API.PRODUCTS.LIST, { params });
    const payload = response.data as ProductApiListResponse | ProductApiModel[] | undefined;
    const items = extractList<ProductApiModel>(payload).map(toModel);
    const pagination = payload && typeof payload === "object" && "pagination" in payload ? payload.pagination : undefined;

    return {
      items,
      pagination: {
        page: Number(pagination?.page ?? (payload && typeof payload === "object" && "page" in payload ? payload.page : query?.page) ?? 1),
        pageSize: Number(
          pagination?.pageSize ?? (payload && typeof payload === "object" && "size" in payload ? payload.size : query?.size ?? query?.pageSize) ?? 10,
        ),
        totalItems: Number(
          pagination?.totalItems ?? (payload && typeof payload === "object" && "totalElements" in payload ? payload.totalElements : items.length) ?? items.length,
        ),
        totalPages: Number(pagination?.totalPages ?? 0),
      },
      filters: {
        keyword: query?.keyword ?? query?.search,
        type: query?.type,
        thickness: query?.thickness,
        unit: query?.unit,
        status: query?.status,
      },
    };
  },

  async getDetail(id: string): Promise<ProductModel> {
    const response = await api.get<ProductApiModel>(withId(API.PRODUCTS.DETAIL, id));
    return toModel(response.data);
  },

  async create(payload: ProductCreateRequest): Promise<ProductModel> {
    const response = await api.post<ProductApiModel>(API.PRODUCTS.CREATE, toWritePayload(payload));
    return toModel(response.data);
  },

  async update(id: string, payload: ProductUpdateRequest): Promise<ProductModel> {
    const response = await api.put<ProductApiModel>(withId(API.PRODUCTS.UPDATE, id), toWritePayload(payload));
    return toModel(response.data);
  },

  async updateStatus(id: string, payload: ProductStatusUpdateRequest): Promise<ProductStatusResponse> {
    const response = await api.patch<ProductStatusResponse>(withId(API.PRODUCTS.STATUS, id), payload);
    return response.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete<void>(withId(API.PRODUCTS.DELETE, id));
  },
};
