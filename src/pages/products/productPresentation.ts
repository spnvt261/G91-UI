import type { ProductStatus } from "../../models/product/product.model";

export const PRODUCT_STATUS_LABEL: Record<ProductStatus, string> = {
  ACTIVE: "Đang kinh doanh",
  INACTIVE: "Ngừng kinh doanh",
};

export const formatProductDateTime = (value?: string): string => {
  if (!value) {
    return "Chưa cập nhật";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
};
