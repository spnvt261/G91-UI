import dayjs, { type Dayjs } from "dayjs";
import type { PriceListModel, PriceListStatus } from "../../models/pricing/price-list.model";

export interface PriceListProductOption {
  label: string;
  value: string;
  productCode?: string;
  productName?: string;
}

export type PriceListValidityState = "upcoming" | "active" | "expiring" | "expired" | "invalid";

export interface PriceListSummaryMetrics {
  total: number;
  activeNow: number;
  expiringSoon: number;
  inactiveOrExpired: number;
}

const EXPIRING_DAYS_THRESHOLD = 7;

const toDate = (value?: string): Dayjs | null => {
  if (!value?.trim()) {
    return null;
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
};

export const formatDateVi = (value?: string) => {
  const parsed = toDate(value);
  return parsed ? parsed.format("DD/MM/YYYY") : "Chưa thiết lập";
};

export const formatDateTimeVi = (value?: string) => {
  if (!value?.trim()) {
    return "Chưa cập nhật";
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("HH:mm DD/MM/YYYY") : "Chưa cập nhật";
};

export const calculateValidityDays = (validFrom?: string, validTo?: string) => {
  const from = toDate(validFrom);
  const to = toDate(validTo);

  if (!from || !to || from.isAfter(to, "day")) {
    return 0;
  }

  return to.startOf("day").diff(from.startOf("day"), "day") + 1;
};

export const getPriceListStatusText = (status: PriceListStatus) => {
  return status === "ACTIVE" ? "Đang áp dụng" : "Tạm ngừng";
};

export const getPriceListValidityState = (validFrom?: string, validTo?: string, referenceDate = dayjs()): PriceListValidityState => {
  const from = toDate(validFrom);
  const to = toDate(validTo);
  const today = referenceDate.startOf("day");

  if (!from || !to || from.isAfter(to, "day")) {
    return "invalid";
  }

  if (today.isBefore(from, "day")) {
    return "upcoming";
  }

  if (today.isAfter(to, "day")) {
    return "expired";
  }

  const dayDiff = to.endOf("day").diff(today.startOf("day"), "day");
  if (dayDiff <= EXPIRING_DAYS_THRESHOLD) {
    return "expiring";
  }

  return "active";
};

export const getPriceListValidityText = (state: PriceListValidityState) => {
  switch (state) {
    case "active":
      return "Còn hiệu lực";
    case "expiring":
      return "Sắp hết hạn";
    case "expired":
      return "Đã hết hạn";
    case "upcoming":
      return "Sắp có hiệu lực";
    default:
      return "Thiếu dữ liệu hiệu lực";
  }
};

export const calculatePriceListSummary = (items: PriceListModel[]): PriceListSummaryMetrics => {
  const metrics: PriceListSummaryMetrics = {
    total: items.length,
    activeNow: 0,
    expiringSoon: 0,
    inactiveOrExpired: 0,
  };

  for (const item of items) {
    const validity = getPriceListValidityState(item.validFrom, item.validTo);
    const isActiveStatus = item.status === "ACTIVE";
    const isCurrentlyEffective = isActiveStatus && (validity === "active" || validity === "expiring");

    if (isCurrentlyEffective) {
      metrics.activeNow += 1;
    }

    if (isActiveStatus && validity === "expiring") {
      metrics.expiringSoon += 1;
    }

    if (!isActiveStatus || validity === "expired") {
      metrics.inactiveOrExpired += 1;
    }
  }

  return metrics;
};
