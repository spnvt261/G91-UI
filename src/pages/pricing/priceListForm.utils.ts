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
    errors.name = "Name is required.";
  }

  if (!values.validFrom) {
    errors.validFrom = "Valid from is required.";
  }
  if (!values.validTo) {
    errors.validTo = "Valid to is required.";
  }
  if (values.validFrom && values.validTo && values.validFrom > values.validTo) {
    errors.validTo = "Valid to must be greater than or equal to valid from.";
  }

  const activeItems = values.items.filter((item) => item.productId.trim() || item.unitPrice.trim());
  if (activeItems.length === 0) {
    errors.items = "At least one item is required.";
    return errors;
  }

  const productIdSet = new Set<string>();
  const itemProductMap: Record<string, string> = {};
  const itemUnitPriceMap: Record<string, string> = {};

  for (const item of activeItems) {
    const productId = item.productId.trim();
    const unitPrice = toNumber(item.unitPrice);

    if (!productId) {
      itemProductMap[item.rowId] = "Product is required.";
      continue;
    }

    if (productIdSet.has(productId)) {
      itemProductMap[item.rowId] = "Duplicate product is not allowed.";
    } else {
      productIdSet.add(productId);
    }

    if (unitPrice == null || unitPrice <= 0) {
      itemUnitPriceMap[item.rowId] = "Unit price must be greater than 0.";
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
