import type { ProductModel } from "../../models/product/product.model";

export interface InventoryProductOption {
  value: string;
  label: string;
}

export const toInventoryProductOptions = (products: ProductModel[]): InventoryProductOption[] =>
  products.map((item) => ({
    value: item.id,
    label: `${item.productCode} - ${item.productName}`,
  }));

export const getInventoryProductLabel = (options: InventoryProductOption[], productId?: string) => {
  if (!productId) {
    return "Chưa chọn sản phẩm";
  }

  return options.find((item) => item.value === productId)?.label ?? productId;
};
