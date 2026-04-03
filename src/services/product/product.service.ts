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
  ProductUploadImagesResponse,
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
  description?: string;
  status?: string;
  imageUrls?: string[];
  images?: string[];
  mainImage?: string;
  image?: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string;
}

interface ProductApiListResponse {
  items?: ProductApiModel[];
  content?: ProductApiModel[];
  pagination?: {
    page?: number;
    pageSize?: number;
    size?: number;
    total?: number;
    totalCount?: number;
    totalElements?: number;
    totalItems?: number;
    totalPages?: number;
  };
  page?: number;
  pageSize?: number;
  size?: number;
  total?: number;
  totalCount?: number;
  totalItems?: number;
  totalElements?: number;
  filters?: Record<string, string | undefined>;
}

const toStatus = (value: string | undefined): ProductStatus => {
  const normalized = value?.trim().toUpperCase();

  if (!normalized) {
    return "ACTIVE";
  }

  if (normalized === "ACTIVE" || normalized === "AVAILABLE" || normalized === "ENABLED") {
    return "ACTIVE";
  }

  return "INACTIVE";
};

const toFiniteNumber = (value: unknown): number | undefined => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const resolvePaginationNumber = (candidates: unknown[], fallback: number): number => {
  for (const candidate of candidates) {
    const value = toFiniteNumber(candidate);
    if (value != null) {
      return value;
    }
  }

  return fallback;
};

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
    description: payload.description,
    status: toStatus(payload.status),
    imageUrls,
    mainImage,
    images: imageUrls,
    createdAt: payload.createdAt,
    updatedAt: payload.updatedAt,
    deletedAt: payload.deletedAt,
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
  description: payload.description?.trim() || undefined,
  status: payload.status,
  imageUrls: toUniqueImageUrls(payload.imageUrls),
});

export const productService = {
  async getList(query?: ProductListQuery): Promise<ProductListResponse> {
    const params = {
      page: query?.page,
      pageSize: query?.pageSize,
      keyword: query?.keyword ?? query?.search,
      search: query?.search,
      type: query?.type,
      size: query?.size ?? query?.sizeValue,
      thickness: query?.thickness,
      unit: query?.unit,
      status: query?.status,
      sortBy: query?.sortBy,
      sortDir: query?.sortDir,
    };

    const response = await api.get<unknown>(API.PRODUCTS.LIST, { params });
    const payload = response.data as ProductApiListResponse | ProductApiModel[] | undefined;
    const items = extractList<ProductApiModel>(payload).map(toModel);
    const pagination = payload && typeof payload === "object" && "pagination" in payload ? payload.pagination : undefined;

    return {
      items,
      pagination: {
        page: resolvePaginationNumber(
          [
            pagination?.page,
            payload && typeof payload === "object" && "page" in payload ? payload.page : undefined,
            query?.page,
          ],
          1,
        ),
        pageSize: resolvePaginationNumber(
          [
            pagination?.pageSize,
            pagination?.size,
            payload && typeof payload === "object" && "pageSize" in payload ? payload.pageSize : undefined,
            payload && typeof payload === "object" && "size" in payload ? payload.size : undefined,
            query?.pageSize,
          ],
          10,
        ),
        totalItems: resolvePaginationNumber(
          [
            pagination?.totalItems,
            pagination?.totalElements,
            pagination?.totalCount,
            pagination?.total,
            payload && typeof payload === "object" && "totalItems" in payload ? payload.totalItems : undefined,
            payload && typeof payload === "object" && "totalElements" in payload ? payload.totalElements : undefined,
            payload && typeof payload === "object" && "totalCount" in payload ? payload.totalCount : undefined,
            payload && typeof payload === "object" && "total" in payload ? payload.total : undefined,
          ],
          items.length,
        ),
        totalPages: resolvePaginationNumber([pagination?.totalPages], 0),
      },
      filters: {
        keyword: query?.keyword ?? query?.search,
        type: query?.type,
        size: query?.size ?? query?.sizeValue,
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

  async uploadImages(files: File[]): Promise<string[]> {
    if (!files.length) {
      return [];
    }

    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });

    const response = await api.post<ProductUploadImagesResponse | string[]>(API.PRODUCTS.UPLOAD_IMAGES, formData);
    const payload = response.data;

    if (Array.isArray(payload)) {
      return payload.map((value) => String(value)).filter(Boolean);
    }

    return (payload.imageUrls ?? []).map((value) => String(value)).filter(Boolean);
  },

  async updateStatus(id: string, payload: ProductStatusUpdateRequest): Promise<ProductStatusResponse> {
    const response = await api.patch<ProductStatusResponse>(withId(API.PRODUCTS.STATUS, id), payload);
    return response.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete<void>(withId(API.PRODUCTS.DELETE, id));
  },
};
