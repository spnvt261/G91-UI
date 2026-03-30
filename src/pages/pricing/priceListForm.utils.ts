import type { PriceListModel, PriceListStatus, PriceListWriteRequest } from "../../models/pricing/price-list.model";

export interface PriceListFormItemValues {
  rowId: string;
  productId: string;
  unitPrice: string;
}

export interface PriceListFormValues {
  name: string;
  customerGroup: string;
  validFrom: string;
  validTo: string;
  status: PriceListStatus;
  items: PriceListFormItemValues[];
}

export type PriceListFormErrors = {
  name?: string;
  validFrom?: string;
  validTo?: string;
  items?: string;
  itemProductMap?: Record<string, string>;
  itemUnitPriceMap?: Record<string, string>;
};

const createRowId = () => `row-${Date.now()}-${Math.random().toString(16).slice(2)}`;

export const createEmptyPriceListItem = (): PriceListFormItemValues => ({
  rowId: createRowId(),
  productId: "",
  unitPrice: "",
});

export const createInitialPriceListFormValues = (model?: PriceListModel): PriceListFormValues => ({
  name: model?.name ?? "",
  customerGroup: model?.customerGroup ?? "",
  validFrom: model?.validFrom ?? "",
  validTo: model?.validTo ?? "",
  status: model?.status ?? "ACTIVE",
  items:
    model?.items?.length && model.items.length > 0
      ? model.items.map((item) => ({
          rowId: createRowId(),
          productId: item.productId,
          unitPrice: String(item.unitPriceVnd ?? ""),
        }))
      : [],
});

const toNumber = (value: string): number | undefined => {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

export const validatePriceListForm = (values: PriceListFormValues): PriceListFormErrors => {
  const errors: PriceListFormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Vui lòng nhập tên bảng giá.";
  }

  if (!values.validFrom) {
    errors.validFrom = "Vui lòng chọn ngày bắt đầu hiệu lực.";
  }
  if (!values.validTo) {
    errors.validTo = "Vui lòng chọn ngày kết thúc hiệu lực.";
  }
  if (values.validFrom && values.validTo && values.validFrom > values.validTo) {
    errors.validTo = "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu.";
  }

  const activeItems = values.items.filter((item) => item.productId.trim() || item.unitPrice.trim());
  if (activeItems.length === 0) {
    errors.items = "Vui lòng thêm ít nhất một sản phẩm.";
    return errors;
  }

  const productIdSet = new Set<string>();
  const itemProductMap: Record<string, string> = {};
  const itemUnitPriceMap: Record<string, string> = {};

  for (const item of activeItems) {
    const productId = item.productId.trim();
    const unitPrice = toNumber(item.unitPrice);

    if (!productId) {
      itemProductMap[item.rowId] = "Vui lòng chọn sản phẩm.";
      continue;
    }

    if (productIdSet.has(productId)) {
      itemProductMap[item.rowId] = "Sản phẩm đã tồn tại trong bảng giá.";
    } else {
      productIdSet.add(productId);
    }

    if (unitPrice == null || unitPrice <= 0) {
      itemUnitPriceMap[item.rowId] = "Đơn giá phải lớn hơn 0.";
    }
  }

  if (Object.keys(itemProductMap).length > 0) {
    errors.itemProductMap = itemProductMap;
  }
  if (Object.keys(itemUnitPriceMap).length > 0) {
    errors.itemUnitPriceMap = itemUnitPriceMap;
  }

  return errors;
};

export const toPriceListWritePayload = (values: PriceListFormValues): PriceListWriteRequest => ({
  name: values.name.trim(),
  customerGroup: values.customerGroup.trim() || undefined,
  validFrom: values.validFrom,
  validTo: values.validTo,
  status: values.status,
  items: values.items
    .map((item) => ({
      productId: item.productId.trim(),
      unitPriceVnd: Number(item.unitPrice),
    }))
    .filter((item) => item.productId && Number.isFinite(item.unitPriceVnd) && item.unitPriceVnd > 0),
});
