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

const MOCK_GALLERY_SIZE = 6;

const getMockImage = (seed: string, index: number) =>
  `https://picsum.photos/seed/${encodeURIComponent(`${seed}-${index}`)}/1200/800`;

const normalizeProductWithImages = (product: ProductModel): ProductModel => {
  const raw = product as ProductModel & { image?: string; images?: string[] };
  const seed = product.id || product.productCode || product.productName || "product";
  const generatedImages = Array.from({ length: MOCK_GALLERY_SIZE }, (_, index) => getMockImage(seed, index + 1));
  const serverImages = Array.isArray(raw.images) ? raw.images.filter(Boolean) : [];
  const mainImage = raw.mainImage || raw.image || serverImages[0] || generatedImages[0];
  const images = [mainImage, ...serverImages, ...generatedImages]
    .filter((image, index, current) => Boolean(image) && current.indexOf(image) === index)
    .slice(0, MOCK_GALLERY_SIZE);

  return {
    ...product,
    mainImage,
    images,
  };
};

export const productService = {
  async getList(params?: ProductListQuery): Promise<ProductListResponse> {
    const response = await api.get<unknown>(API.PRODUCTS.LIST, { params });
    const data = response.data as Partial<ProductListResponse> | undefined;
    const items = extractList<ProductListResponse["items"][number]>(data).map(normalizeProductWithImages);

    return {
      items,
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
    return normalizeProductWithImages(response.data);
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
