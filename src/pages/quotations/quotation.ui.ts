import type { BadgeProps, TagProps } from "antd";
import dayjs from "dayjs";
import type { QuotationDisplayStatus, QuotationStatus } from "../../models/quotation/quotation.model";
import { toCurrency } from "../shared/page.utils";

interface QuotationStatusMeta {
  label: string;
  tagColor: TagProps["color"];
  badgeStatus: BadgeProps["status"];
}

const STATUS_META: Record<QuotationDisplayStatus, QuotationStatusMeta> = {
  DRAFT: {
    label: "Nháp",
    tagColor: "default",
    badgeStatus: "default",
  },
  PENDING: {
    label: "Đang xử lý",
    tagColor: "processing",
    badgeStatus: "processing",
  },
  APPROVED: {
    label: "Đã duyệt",
    tagColor: "success",
    badgeStatus: "success",
  },
  CONVERTED: {
    label: "Đã chốt",
    tagColor: "green",
    badgeStatus: "success",
  },
  REJECTED: {
    label: "Từ chối",
    tagColor: "error",
    badgeStatus: "error",
  },
  EXPIRED: {
    label: "Hết hạn",
    tagColor: "warning",
    badgeStatus: "warning",
  },
};

export const QUOTATION_STATUS_OPTIONS: Array<{ label: string; value: QuotationStatus }> = [
  { label: STATUS_META.DRAFT.label, value: "DRAFT" },
  { label: STATUS_META.PENDING.label, value: "PENDING" },
  { label: STATUS_META.APPROVED.label, value: "APPROVED" },
  { label: STATUS_META.CONVERTED.label, value: "CONVERTED" },
  { label: STATUS_META.REJECTED.label, value: "REJECTED" },
];

export const getQuotationStatusMeta = (status: QuotationDisplayStatus): QuotationStatusMeta => STATUS_META[status] ?? STATUS_META.DRAFT;

export const formatQuotationCurrency = (value?: number | null) => toCurrency(value ?? 0);

export const formatQuotationDate = (value?: string, fallback = "Chưa cập nhật") => {
  if (!value) {
    return fallback;
  }

  const parsed = dayjs(value);
  if (!parsed.isValid()) {
    return fallback;
  }

  return parsed.format("DD/MM/YYYY");
};

export const formatQuotationDateTime = (value?: string, fallback = "Chưa cập nhật") => {
  if (!value) {
    return fallback;
  }

  const parsed = dayjs(value);
  if (!parsed.isValid()) {
    return fallback;
  }

  return parsed.format("DD/MM/YYYY HH:mm");
};
