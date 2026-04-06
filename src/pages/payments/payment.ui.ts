import dayjs from "dayjs";

export const PAYMENT_METHOD_OPTIONS = [
  { label: "Tiền mặt", value: "CASH" },
  { label: "Chuyển khoản ngân hàng", value: "BANK_TRANSFER" },
  { label: "Khác", value: "OTHER" },
];

export const getPaymentMethodLabel = (method?: string) => {
  const normalized = String(method ?? "").toUpperCase();
  return PAYMENT_METHOD_OPTIONS.find((item) => item.value === normalized)?.label ?? (method || "Chưa cập nhật");
};

export const formatPaymentDate = (value?: string, fallback = "Chưa cập nhật"): string => {
  if (!value) {
    return fallback;
  }
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD/MM/YYYY") : fallback;
};

export const formatPaymentDateTime = (value?: string, fallback = "Chưa cập nhật"): string => {
  if (!value) {
    return fallback;
  }
  const parsed = dayjs(value);
  return parsed.isValid() ? parsed.format("DD/MM/YYYY HH:mm") : fallback;
};
