import type { BadgeProps, TagProps } from "antd";
import dayjs from "dayjs";
import type { SaleOrderStatus } from "../../models/sale-order/sale-order.model";

interface SaleOrderStatusMeta {
  label: string;
  tagColor: TagProps["color"];
  badgeStatus: BadgeProps["status"];
}

const STATUS_META: Record<string, SaleOrderStatusMeta> = {
  SUBMITTED: { label: "Đã gửi", tagColor: "default", badgeStatus: "default" },
  PROCESSING: { label: "Đang xử lý", tagColor: "processing", badgeStatus: "processing" },
  RESERVED: { label: "Đã dự trữ", tagColor: "blue", badgeStatus: "processing" },
  PICKED: { label: "Đã soạn hàng", tagColor: "cyan", badgeStatus: "processing" },
  IN_TRANSIT: { label: "Đang xuất giao", tagColor: "purple", badgeStatus: "processing" },
  DELIVERED: { label: "Đã giao", tagColor: "green", badgeStatus: "success" },
  COMPLETED: { label: "Hoàn tất", tagColor: "success", badgeStatus: "success" },
  CANCELLED: { label: "Đã hủy", tagColor: "error", badgeStatus: "error" },
};

const TRACKING_EVENT_LABELS: Record<string, string> = {
  PROCESSING_STARTED: "Chuyển xử lý",
  RESERVED: "Dự trữ hàng",
  PICKED: "Soạn hàng",
  SHIPPED: "Xuất giao",
  DELIVERED: "Xác nhận đã giao",
  COMPLETED: "Hoàn tất đơn",
  UPDATED: "Cập nhật đơn bán",
};

export const SALE_ORDER_STATUS_OPTIONS = [
  { label: "Đã gửi", value: "SUBMITTED" },
  { label: "Đang xử lý", value: "PROCESSING" },
  { label: "Đã dự trữ", value: "RESERVED" },
  { label: "Đã soạn hàng", value: "PICKED" },
  { label: "Đang xuất giao", value: "IN_TRANSIT" },
  { label: "Đã giao", value: "DELIVERED" },
  { label: "Hoàn tất", value: "COMPLETED" },
  { label: "Đã hủy", value: "CANCELLED" },
];

export const SALE_ORDER_CANCELLATION_REASON_OPTIONS = [
  { label: "Khách hàng yêu cầu", value: "CUSTOMER_REQUEST" },
  { label: "Tranh chấp giá", value: "PRICE_DISPUTE" },
  { label: "Thiếu tồn kho", value: "INVENTORY_SHORTAGE" },
  { label: "Rủi ro tín dụng", value: "CREDIT_RISK" },
  { label: "Sai dữ liệu", value: "DATA_ERROR" },
  { label: "Lý do khác", value: "OTHER" },
];

export const getSaleOrderStatusMeta = (status?: SaleOrderStatus): SaleOrderStatusMeta => {
  const normalized = String(status ?? "SUBMITTED").trim().toUpperCase();
  return (
    STATUS_META[normalized] ?? {
      label: normalized,
      tagColor: "default",
      badgeStatus: "default",
    }
  );
};

export const formatSaleOrderDate = (value?: string, fallback = "Chưa cập nhật"): string => {
  if (!value) {
    return fallback;
  }

  const parsed = dayjs(value);
  if (!parsed.isValid()) {
    return fallback;
  }

  return parsed.format("DD/MM/YYYY");
};

export const formatSaleOrderDateTime = (value?: string, fallback = "Chưa cập nhật"): string => {
  if (!value) {
    return fallback;
  }

  const parsed = dayjs(value);
  if (!parsed.isValid()) {
    return fallback;
  }

  return parsed.format("DD/MM/YYYY HH:mm");
};

export const resolveSaleOrderNumber = (id?: string, saleOrderNumber?: string) => saleOrderNumber || id || "Chưa có mã đơn bán";

export const toSaleOrderTransitionErrorMessage = (message: string): string => {
  const normalized = message.trim().toLowerCase();

  if (normalized.includes("transition") || normalized.includes("status") || normalized.includes("không thể chuyển") || normalized.includes("not allowed")) {
    return "Không thể chuyển trạng thái đơn bán theo thao tác vừa chọn. Vui lòng kiểm tra trạng thái hiện tại và điều kiện thực hiện đơn.";
  }

  if (normalized.includes("inventory") || normalized.includes("tồn kho") || normalized.includes("reserve")) {
    return "Không đủ điều kiện dự trữ hàng hoặc tồn kho chưa đáp ứng cho đơn bán này.";
  }

  if (normalized.includes("issued") || normalized.includes("delivered")) {
    return "Đơn bán chưa đáp ứng điều kiện xuất kho/giao hàng để thực hiện bước tiếp theo.";
  }

  return message;
};

export const getTimelineEventLabel = (eventType?: string, title?: string): string => {
  const normalized = String(eventType ?? "").trim().toUpperCase();
  if (title?.trim()) {
    return title;
  }

  return TRACKING_EVENT_LABELS[normalized] ?? (normalized || "Cập nhật đơn bán");
};
