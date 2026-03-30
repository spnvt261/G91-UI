import type { BadgeProps, TagProps } from "antd";
import dayjs from "dayjs";
import type { InvoiceModel } from "../../models/payment/payment.model";

export type InvoiceDisplayStatus = InvoiceModel["status"] | "OVERDUE" | "DUE_SOON";

interface InvoiceStatusMeta {
  label: string;
  tagColor: TagProps["color"];
  badgeStatus: BadgeProps["status"];
}

const STATUS_META: Record<InvoiceDisplayStatus, InvoiceStatusMeta> = {
  UNPAID: {
    label: "Chờ thanh toán",
    tagColor: "gold",
    badgeStatus: "warning",
  },
  PARTIAL: {
    label: "Thanh toán một phần",
    tagColor: "processing",
    badgeStatus: "processing",
  },
  PAID: {
    label: "Đã thanh toán",
    tagColor: "success",
    badgeStatus: "success",
  },
  OVERDUE: {
    label: "Quá hạn",
    tagColor: "error",
    badgeStatus: "error",
  },
  DUE_SOON: {
    label: "Sắp đến hạn",
    tagColor: "orange",
    badgeStatus: "warning",
  },
};

export const PAYMENT_STATUS_OPTIONS: Array<{ label: string; value: InvoiceDisplayStatus }> = [
  { label: STATUS_META.UNPAID.label, value: "UNPAID" },
  { label: STATUS_META.PARTIAL.label, value: "PARTIAL" },
  { label: STATUS_META.OVERDUE.label, value: "OVERDUE" },
  { label: STATUS_META.DUE_SOON.label, value: "DUE_SOON" },
  { label: STATUS_META.PAID.label, value: "PAID" },
];

export const PAYMENT_METHOD_OPTIONS = [
  { label: "Chuyển khoản ngân hàng", value: "BANK_TRANSFER" },
  { label: "Tiền mặt", value: "CASH" },
  { label: "Thẻ ngân hàng", value: "CARD" },
  { label: "Ví điện tử", value: "E_WALLET" },
  { label: "Khác", value: "OTHER" },
];

export const getPaymentMethodLabel = (method?: string) =>
  PAYMENT_METHOD_OPTIONS.find((item) => item.value === method)?.label ?? "Khác";

export const getInvoiceDisplayStatus = (
  invoice: Pick<InvoiceModel, "status" | "dueDate" | "dueAmount">,
  referenceDate = dayjs(),
): InvoiceDisplayStatus => {
  if (invoice.status === "PAID" || invoice.dueAmount <= 0) {
    return "PAID";
  }

  const dueDate = invoice.dueDate ? dayjs(invoice.dueDate) : null;
  if (dueDate?.isValid()) {
    const dueDay = dueDate.startOf("day");
    const today = referenceDate.startOf("day");

    if (dueDay.isBefore(today)) {
      return "OVERDUE";
    }

    if (dueDay.diff(today, "day") <= 3) {
      return "DUE_SOON";
    }
  }

  if (invoice.status === "PARTIAL") {
    return "PARTIAL";
  }

  return "UNPAID";
};

export const getInvoiceStatusMeta = (status: InvoiceDisplayStatus): InvoiceStatusMeta => STATUS_META[status];

export const formatPaymentDate = (value?: string, fallback = "Chưa cập nhật") => {
  if (!value) {
    return fallback;
  }

  const parsed = dayjs(value);
  if (!parsed.isValid()) {
    return fallback;
  }

  return parsed.format("DD/MM/YYYY");
};

export const formatPaymentDateTime = (value?: string, fallback = "Chưa cập nhật") => {
  if (!value) {
    return fallback;
  }

  const parsed = dayjs(value);
  if (!parsed.isValid()) {
    return fallback;
  }

  return parsed.format("DD/MM/YYYY HH:mm");
};
