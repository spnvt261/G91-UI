import type { BadgeProps, TagProps } from "antd";
import dayjs from "dayjs";
import type { InvoiceStatus } from "../../models/invoice/invoice.model";

interface InvoiceStatusMeta {
  label: string;
  tagColor: TagProps["color"];
  badgeStatus: BadgeProps["status"];
}

const INVOICE_STATUS_META: Record<string, InvoiceStatusMeta> = {
  DRAFT: {
    label: "Nháp",
    tagColor: "default",
    badgeStatus: "default",
  },
  ISSUED: {
    label: "Đã phát hành",
    tagColor: "processing",
    badgeStatus: "processing",
  },
  PARTIALLY_PAID: {
    label: "Thanh toán một phần",
    tagColor: "gold",
    badgeStatus: "warning",
  },
  PAID: {
    label: "Đã thanh toán",
    tagColor: "success",
    badgeStatus: "success",
  },
  SETTLED: {
    label: "Đã quyết toán",
    tagColor: "cyan",
    badgeStatus: "processing",
  },
  CANCELLED: {
    label: "Đã hủy",
    tagColor: "volcano",
    badgeStatus: "error",
  },
  VOID: {
    label: "Vô hiệu",
    tagColor: "red",
    badgeStatus: "error",
  },
};

export const INVOICE_STATUS_OPTIONS = [
  { label: "Nháp", value: "DRAFT" },
  { label: "Đã phát hành", value: "ISSUED" },
  { label: "Thanh toán một phần", value: "PARTIALLY_PAID" },
  { label: "Đã thanh toán", value: "PAID" },
  { label: "Đã quyết toán", value: "SETTLED" },
  { label: "Đã hủy", value: "CANCELLED" },
  { label: "Vô hiệu", value: "VOID" },
];

export const getInvoiceStatusMeta = (status?: InvoiceStatus): InvoiceStatusMeta => {
  const normalized = String(status ?? "DRAFT").trim().toUpperCase();
  return (
    INVOICE_STATUS_META[normalized] ?? {
      label: "Trạng thái khác",
      tagColor: "default",
      badgeStatus: "default",
    }
  );
};

export const formatInvoiceDate = (value?: string, fallback = "Chưa cập nhật"): string => {
  if (!value) {
    return fallback;
  }

  const parsed = dayjs(value);
  if (!parsed.isValid()) {
    return fallback;
  }

  return parsed.format("DD/MM/YYYY");
};

export const formatInvoiceDateTime = (value?: string, fallback = "Chưa cập nhật"): string => {
  if (!value) {
    return fallback;
  }

  const parsed = dayjs(value);
  if (!parsed.isValid()) {
    return fallback;
  }

  return parsed.format("DD/MM/YYYY HH:mm");
};

export const resolveInvoiceNumber = (invoiceId?: string, invoiceNumber?: string): string => {
  return invoiceNumber || invoiceId || "Chưa có số hóa đơn";
};
