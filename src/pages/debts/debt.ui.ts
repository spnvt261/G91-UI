import type { BadgeProps, TagProps } from "antd";
import dayjs from "dayjs";
import type { DebtStatus } from "../../models/debt/debt.model";

interface DebtStatusMeta {
  label: string;
  tagColor: TagProps["color"];
  badgeStatus: BadgeProps["status"];
}

const DEBT_STATUS_META: Record<string, DebtStatusMeta> = {
  NO_DEBT: {
    label: "Không có công nợ",
    tagColor: "success",
    badgeStatus: "success",
  },
  OPEN_DEBT: {
    label: "Đang có công nợ",
    tagColor: "processing",
    badgeStatus: "processing",
  },
  PARTIALLY_PAID: {
    label: "Thanh toán một phần",
    tagColor: "gold",
    badgeStatus: "warning",
  },
  OVERDUE: {
    label: "Quá hạn",
    tagColor: "error",
    badgeStatus: "error",
  },
  REMINDER_SENT: {
    label: "Đã gửi nhắc nợ",
    tagColor: "orange",
    badgeStatus: "warning",
  },
  SETTLED: {
    label: "Đã quyết toán",
    tagColor: "cyan",
    badgeStatus: "processing",
  },
};

export const DEBT_STATUS_OPTIONS = [
  { label: "Không có công nợ", value: "NO_DEBT" },
  { label: "Đang có công nợ", value: "OPEN_DEBT" },
  { label: "Thanh toán một phần", value: "PARTIALLY_PAID" },
  { label: "Quá hạn", value: "OVERDUE" },
  { label: "Đã gửi nhắc nợ", value: "REMINDER_SENT" },
  { label: "Đã quyết toán", value: "SETTLED" },
];

export const getDebtStatusMeta = (status?: DebtStatus): DebtStatusMeta => {
  const normalized = String(status ?? "OPEN_DEBT").trim().toUpperCase();
  return (
    DEBT_STATUS_META[normalized] ?? {
      label: normalized,
      tagColor: "default",
      badgeStatus: "default",
    }
  );
};

export const formatDebtDate = (value?: string, fallback = "Chưa cập nhật"): string => {
  if (!value) {
    return fallback;
  }

  const parsed = dayjs(value);
  if (!parsed.isValid()) {
    return fallback;
  }

  return parsed.format("DD/MM/YYYY");
};

export const formatDebtDateTime = (value?: string, fallback = "Chưa cập nhật"): string => {
  if (!value) {
    return fallback;
  }

  const parsed = dayjs(value);
  if (!parsed.isValid()) {
    return fallback;
  }

  return parsed.format("DD/MM/YYYY HH:mm");
};

export const getReminderTypeLabel = (value?: string) => {
  const normalized = String(value ?? "").toUpperCase();
  switch (normalized) {
    case "GENTLE":
      return "Nhắc nhẹ";
    case "FIRM":
      return "Nhắc mạnh";
    case "FINAL":
      return "Nhắc cuối";
    default:
      return value || "Chưa cập nhật";
  }
};
