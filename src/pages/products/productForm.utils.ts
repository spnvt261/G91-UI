import type { ProductCreateRequest, ProductModel, ProductUpdateRequest } from "../../models/product/product.model";

export interface ProductFormValues {
  productCode: string;
  productName: string;
  type: string;
  size: string;
  thickness: string;
  unit: string;
  weightConversion: string;
  referenceWeight: string;
  description: string;
  status: "ACTIVE" | "INACTIVE";
  imageUrlsText: string;
}

export type ProductFormErrors = Partial<Record<keyof ProductFormValues, string>>;

export const createInitialProductFormValues = (product?: ProductModel): ProductFormValues => ({
  productCode: product?.productCode ?? "",
  productName: product?.productName ?? "",
  type: product?.type ?? "",
  size: product?.size ?? "",
  thickness: product?.thickness ?? "",
  unit: product?.unit ?? "",
  weightConversion: product?.weightConversion == null ? "" : String(product.weightConversion),
  referenceWeight: product?.referenceWeight == null ? "" : String(product.referenceWeight),
  description: product?.description ?? "",
  status: product?.status ?? "ACTIVE",
  imageUrlsText: (product?.imageUrls ?? product?.images ?? []).join("\n"),
});

const resolveApiOrigin = (): string => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

  try {
    const url = new URL(apiBaseUrl, window.location.origin);
    return url.origin;
  } catch {
    return window.location.origin;
  }
};

const API_ORIGIN = resolveApiOrigin();

const isValidImageReference = (value: string): boolean => {
  const normalized = value.trim();
  if (!normalized) {
    return false;
  }

  if (normalized.startsWith("/")) {
    return true;
  }

  try {
    const url = new URL(normalized);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

export const toDisplayImageUrl = (value: string): string => {
  const normalized = value.trim();
  if (!normalized) {
    return "";
  }

  if (normalized.startsWith("/")) {
    return `${API_ORIGIN}${normalized}`;
  }

  return normalized;
};

export const shouldUseAuthenticatedImageRequest = (value: string): boolean => {
  const normalized = value.trim();
  if (!normalized) {
    return false;
  }

  if (normalized.startsWith("/")) {
    return true;
  }

  try {
    const resolved = new URL(toDisplayImageUrl(normalized));
    return resolved.origin === API_ORIGIN && resolved.pathname.startsWith("/uploads/");
  } catch {
    return false;
  }
};

const toOptionalNumber = (value: string): number | undefined => {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const parseImageUrls = (value: string): string[] => {
  return [...new Set(value.split(/\r?\n|,/g).map((item) => item.trim()).filter(Boolean))];
};

export const validateProductForm = (values: ProductFormValues): ProductFormErrors => {
  const errors: ProductFormErrors = {};

  if (!values.productCode.trim()) {
    errors.productCode = "Vui lòng nhập mã sản phẩm.";
  }
  if (!values.productName.trim()) {
    errors.productName = "Vui lòng nhập tên sản phẩm.";
  }
  if (!values.type.trim()) {
    errors.type = "Vui lòng nhập loại sản phẩm.";
  }
  if (!values.size.trim()) {
    errors.size = "Vui lòng nhập kích thước.";
  }
  if (!values.thickness.trim()) {
    errors.thickness = "Vui lòng nhập độ dày.";
  }
  if (!values.unit.trim()) {
    errors.unit = "Vui lòng nhập đơn vị.";
  }
  if (values.description.trim().length > 1000) {
    errors.description = "Mô tả tối đa 1000 ký tự.";
  }

  if (values.weightConversion.trim() && toOptionalNumber(values.weightConversion) == null) {
    errors.weightConversion = "Hệ số quy đổi phải là số hợp lệ.";
  }

  if (values.referenceWeight.trim() && toOptionalNumber(values.referenceWeight) == null) {
    errors.referenceWeight = "Khối lượng tham chiếu phải là số hợp lệ.";
  }

  const imageUrls = parseImageUrls(values.imageUrlsText);
  if (imageUrls.some((item) => !isValidImageReference(item))) {
    errors.imageUrlsText = "Mỗi URL ảnh phải là đường dẫn /uploads/... hoặc URL http/https hợp lệ.";
  }

  return errors;
};

export const toProductWritePayload = (values: ProductFormValues): ProductCreateRequest | ProductUpdateRequest => ({
  productCode: values.productCode.trim(),
  productName: values.productName.trim(),
  type: values.type.trim(),
  size: values.size.trim(),
  thickness: values.thickness.trim(),
  unit: values.unit.trim(),
  weightConversion: toOptionalNumber(values.weightConversion),
  referenceWeight: toOptionalNumber(values.referenceWeight),
  description: values.description.trim() || undefined,
  status: values.status,
  imageUrls: parseImageUrls(values.imageUrlsText),
});
