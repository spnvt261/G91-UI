import type { PriceListModel } from "../../models/pricing/price-list.model";

export const displayCustomerText = (value?: string | null): string => {
  const normalized = value?.trim();
  return normalized ? normalized : "Chưa cập nhật";
};

export const trimOrUndefined = (value: string | undefined): string | undefined => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
};

export const formatCustomerDateTime = (value?: string): string => {
  if (!value) {
    return "Chưa cập nhật";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return "Chưa cập nhật";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(parsed);
};

export const buildPriceGroupOptionsFromPriceLists = (
  priceLists: PriceListModel[],
  fallbackPriceGroup?: string,
): Array<{ label: string; value: string }> => {
  const groups = new Set<string>();

  priceLists.forEach((priceList) => {
    const customerGroup = priceList.customerGroup?.trim();
    if (customerGroup) {
      groups.add(customerGroup);
    }
  });

  const fallback = fallbackPriceGroup?.trim();
  if (fallback) {
    groups.add(fallback);
  }

  return [...groups]
    .sort((a, b) => a.localeCompare(b, "vi"))
    .map((value) => ({ label: value, value }));
};
