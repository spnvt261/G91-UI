import type { BadgeProps, TagProps } from "antd";
import dayjs from "dayjs";
import type { InvoiceModel } from "../../models/invoice/invoice.model";
import type { PaymentConfirmationRequestModel, PaymentConfirmationStatus } from "../../models/payment-confirmation/payment-confirmation.model";

interface PaymentConfirmationStatusMeta {
  label: string;
  tagColor: TagProps["color"];
  badgeStatus: BadgeProps["status"];
}

const PAYMENT_CONFIRMATION_STATUS_META: Record<string, PaymentConfirmationStatusMeta> = {
  PENDING_REVIEW: {
    label: "Chờ duyệt",
    tagColor: "processing",
    badgeStatus: "processing",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    tagColor: "success",
    badgeStatus: "success",
  },
  REJECTED: {
    label: "Đã từ chối",
    tagColor: "error",
    badgeStatus: "error",
  },
  CANCELLED: {
    label: "Đã hủy",
    tagColor: "default",
    badgeStatus: "default",
  },
};

export const PAYMENT_CONFIRMATION_STATUS_OPTIONS = [
  { label: "Chờ duyệt", value: "PENDING_REVIEW" },
  { label: "Đã xác nhận", value: "CONFIRMED" },
  { label: "Đã từ chối", value: "REJECTED" },
  { label: "Đã hủy", value: "CANCELLED" },
];

export const getPaymentConfirmationStatusMeta = (status?: PaymentConfirmationStatus): PaymentConfirmationStatusMeta => {
  const normalized = String(status ?? "PENDING_REVIEW").trim().toUpperCase();
  return (
    PAYMENT_CONFIRMATION_STATUS_META[normalized] ?? {
      label: "Trạng thái khác",
      tagColor: "default",
      badgeStatus: "default",
    }
  );
};

const roundHalfUp = (value: number): number => Math.round((Number(value ?? 0) + Number.EPSILON) * 100) / 100;

export const formatPaymentConfirmationAmount = (value?: number | null, fallback = "0.00"): string => {
  if (value == null || Number.isNaN(Number(value))) {
    return fallback;
  }

  return new Intl.NumberFormat("vi-VN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(roundHalfUp(Number(value)));
};

export const formatPaymentConfirmationAmountWithCurrency = (value?: number | null, fallback = "0.00 VND"): string => {
  if (value == null || Number.isNaN(Number(value))) {
    return fallback;
  }

  return `${formatPaymentConfirmationAmount(value)} VND`;
};

export const formatPaymentConfirmationDateTime = (value?: string | null, fallback = "Chưa cập nhật"): string => {
  if (!value) {
    return fallback;
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD/MM/YYYY HH:mm") : fallback;
};

export const isInvoicePayableForConfirmation = (invoice?: InvoiceModel | null): boolean => {
  if (!invoice) {
    return false;
  }

  const status = String(invoice.status ?? "").toUpperCase();
  return (status === "ISSUED" || status === "PARTIALLY_PAID") && Number(invoice.outstandingAmount ?? 0) > 0;
};

export const hasPendingPaymentConfirmationRequest = (items: PaymentConfirmationRequestModel[]): boolean =>
  items.some((item) => String(item.status).toUpperCase() === "PENDING_REVIEW");
