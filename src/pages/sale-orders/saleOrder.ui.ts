import type { BadgeProps, TagProps } from "antd";
import dayjs from "dayjs";
import type { SaleOrderStatus } from "../../models/sale-order/sale-order.model";

interface SaleOrderStatusMeta {
  label: string;
  tagColor: TagProps["color"];
  badgeStatus: BadgeProps["status"];
}

export interface SaleOrderFlowStepMeta {
  key: "SUBMITTED" | "RESERVED" | "PICKED" | "DISPATCHED" | "DELIVERED" | "INVOICE_CREATED" | "PAYMENT_RECORDED" | "DEBT_SETTLED";
  label: string;
  owner: "WAREHOUSE" | "ACCOUNTANT";
  description: string;
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
  SUBMITTED: "Đã gửi thực hiện",
  PROCESSING_STARTED: "Bắt đầu xử lý",
  RESERVED: "Dự trữ hàng",
  PICKED: "Soạn hàng",
  SHIPPED: "Xuất giao",
  DISPATCHED: "Xuất giao",
  DELIVERED: "Xác nhận giao hàng",
  COMPLETED: "Hoàn tất đơn bán",
  UPDATED: "Cập nhật đơn bán",
  INVOICE_CREATED: "Tạo hóa đơn",
  PAYMENT_RECORDED: "Ghi nhận thanh toán",
  DEBT_SETTLED: "Xác nhận quyết toán công nợ",
};

const SALE_ORDER_TEXT_LABELS: Record<string, string> = {
  SUBMITTED: "Đã gửi đơn",
  PROCESSING: "Đang xử lý",
  PROCESSING_STARTED: "Bắt đầu xử lý",
  RESERVED: "Đã dự trữ",
  RESERVE: "Dự trữ hàng",
  PICKED: "Đã soạn hàng",
  PICK: "Soạn hàng",
  DISPATCHED: "Đã xuất giao",
  DISPATCH: "Xuất giao",
  SHIPPED: "Đã xuất giao",
  IN_TRANSIT: "Đang vận chuyển",
  DELIVERED: "Đã giao hàng",
  DELIVER: "Giao hàng",
  COMPLETED: "Hoàn tất",
  COMPLETE: "Hoàn tất",
  CANCELLED: "Đã hủy",
  INVOICE: "Hóa đơn",
  CREATE_INVOICE: "Tạo hóa đơn",
  INVOICE_CREATED: "Đã tạo hóa đơn",
  PAYMENT: "Thanh toán",
  PAYMENT_RECORDED: "Đã ghi nhận thanh toán",
  DEBT_SETTLED: "Đã quyết toán công nợ",
  SETTLEMENT: "Quyết toán công nợ",
  RECEIPT: "Biên nhận thanh toán",
  DRAFT: "Nháp",
  ISSUED: "Đã phát hành",
  PARTIALLY_PAID: "Đã thanh toán một phần",
  PAID: "Đã thanh toán",
  OVERDUE: "Quá hạn",
  VOID: "Đã hủy hiệu lực",
  CUSTOMER_REQUEST: "Khách hàng yêu cầu",
  PRICE_DISPUTE: "Tranh chấp giá",
  INVENTORY_SHORTAGE: "Thiếu tồn kho",
  CREDIT_RISK: "Rủi ro tín dụng",
  DATA_ERROR: "Sai dữ liệu",
  OTHER: "Khác",
};

export const SALE_ORDER_FLOW_STEPS: SaleOrderFlowStepMeta[] = [
  {
    key: "SUBMITTED",
    label: "Đã gửi đơn",
    owner: "WAREHOUSE",
    description: "Hợp đồng đã được gửi thực hiện và trở thành đơn bán.",
  },
  {
    key: "RESERVED",
    label: "Dự trữ hàng",
    owner: "WAREHOUSE",
    description: "Kho xác nhận dự trữ đủ tồn kho cho đơn bán.",
  },
  {
    key: "PICKED",
    label: "Soạn hàng",
    owner: "WAREHOUSE",
    description: "Kho soạn hàng theo số lượng đơn bán.",
  },
  {
    key: "DISPATCHED",
    label: "Xuất giao",
    owner: "WAREHOUSE",
    description: "Kho xuất giao và chuyển trạng thái vận chuyển.",
  },
  {
    key: "DELIVERED",
    label: "Giao hàng",
    owner: "WAREHOUSE",
    description: "Kho xác nhận đã giao đủ.",
  },
  {
    key: "INVOICE_CREATED",
    label: "Tạo hóa đơn",
    owner: "ACCOUNTANT",
    description: "Kế toán phát hành hóa đơn từ đơn bán đã giao.",
  },
  {
    key: "PAYMENT_RECORDED",
    label: "Ghi nhận thanh toán",
    owner: "ACCOUNTANT",
    description: "Kế toán ghi nhận thanh toán và phân bổ theo hóa đơn.",
  },
  {
    key: "DEBT_SETTLED",
    label: "Quyết toán công nợ",
    owner: "ACCOUNTANT",
    description: "Kế toán xác nhận quyết toán công nợ khách hàng.",
  },
];

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

const STATUS_PROGRESS_ORDER = ["SUBMITTED", "PROCESSING", "RESERVED", "PICKED", "IN_TRANSIT", "DELIVERED", "COMPLETED"] as const;

export const normalizeSaleOrderStatus = (value?: string): string => String(value ?? "").trim().toUpperCase();

export const isSaleOrderTerminalStatus = (value?: string): boolean => {
  const status = normalizeSaleOrderStatus(value);
  return status === "COMPLETED" || status === "CANCELLED";
};

export const isStatusReached = (currentStatus: string | undefined, targetStatus: (typeof STATUS_PROGRESS_ORDER)[number]): boolean => {
  const current = normalizeSaleOrderStatus(currentStatus);
  const currentIndex = STATUS_PROGRESS_ORDER.indexOf(current as (typeof STATUS_PROGRESS_ORDER)[number]);
  const targetIndex = STATUS_PROGRESS_ORDER.indexOf(targetStatus);
  return currentIndex >= 0 && targetIndex >= 0 && currentIndex >= targetIndex;
};

export const getNextFulfillmentAction = (
  status?: string,
): { key: "reserve" | "pick" | "dispatch" | "deliver"; label: string; successMessage: string } | null => {
  const current = normalizeSaleOrderStatus(status);
  if (current === "SUBMITTED" || current === "PROCESSING") {
    return { key: "reserve", label: "Dự trữ hàng", successMessage: "Đã chuyển đơn bán sang bước dự trữ hàng." };
  }

  if (current === "RESERVED") {
    return { key: "pick", label: "Soạn hàng", successMessage: "Đã chuyển đơn bán sang bước soạn hàng." };
  }

  if (current === "PICKED") {
    return { key: "dispatch", label: "Xuất giao", successMessage: "Đã chuyển đơn bán sang bước xuất giao." };
  }

  if (current === "IN_TRANSIT") {
    return { key: "deliver", label: "Giao hàng", successMessage: "Đã xác nhận giao hàng cho đơn bán." };
  }

  return null;
};

export const getSaleOrderStatusMeta = (status?: SaleOrderStatus): SaleOrderStatusMeta => {
  const normalized = normalizeSaleOrderStatus(status);
  return (
    STATUS_META[normalized] ?? {
      label: normalized ? translateSaleOrderText(normalized, "Trạng thái khác") : "Chưa cập nhật",
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

export const translateSaleOrderText = (value?: string, fallback = "Chưa cập nhật"): string => {
  const raw = String(value ?? "").trim();
  if (!raw) {
    return fallback;
  }

  const normalized = raw.toUpperCase().replace(/[\s-]+/g, "_");
  const mapped = SALE_ORDER_TEXT_LABELS[normalized] ?? TRACKING_EVENT_LABELS[normalized];
  if (mapped) {
    return mapped;
  }

  if (/^[A-Z0-9_]+$/.test(normalized)) {
    return fallback;
  }

  return raw;
};

export const toSaleOrderTransitionErrorMessage = (message: string): string => {
  const normalized = message.trim().toLowerCase();

  if (normalized.includes("transition") || normalized.includes("status") || normalized.includes("không thể chuyển") || normalized.includes("not allowed")) {
    return "Không thể chuyển trạng thái đơn bán theo thao tác vừa chọn. Vui lòng kiểm tra trạng thái hiện tại và điều kiện nghiệp vụ.";
  }

  if (normalized.includes("inventory") || normalized.includes("tồn kho") || normalized.includes("reserve")) {
    return "Không đủ điều kiện dự trữ hàng hoặc tồn kho chưa đáp ứng cho đơn bán này.";
  }

  if (normalized.includes("issued") || normalized.includes("delivered")) {
    return "Đơn bán chưa đáp ứng điều kiện xuất kho/giao hàng để thực hiện bước tiếp theo.";
  }

  if (/^[A-Za-z0-9_./: -]+$/.test(message)) {
    return "Không thể thực hiện thao tác với đơn bán. Vui lòng kiểm tra điều kiện nghiệp vụ và thử lại.";
  }

  return message;
};

export const getTimelineEventLabel = (eventType?: string, title?: string): string => {
  const normalized = normalizeSaleOrderStatus(eventType);
  if (title?.trim()) {
    return translateSaleOrderText(title, "Cập nhật đơn bán");
  }

  return TRACKING_EVENT_LABELS[normalized] ?? translateSaleOrderText(normalized, "Cập nhật đơn bán");
};
