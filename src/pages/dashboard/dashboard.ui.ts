import type { TagProps } from "antd";

interface DashboardStatusMeta {
  label: string;
  color: TagProps["color"];
}

const DATE_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const ROLE_LABELS: Record<string, string> = {
  OWNER: "Chủ sở hữu",
  ACCOUNTANT: "Kế toán",
  WAREHOUSE: "Kho",
  CUSTOMER: "Khách hàng",
};

const STATUS_META: Record<string, DashboardStatusMeta> = {
  PENDING: { label: "Chờ xử lý", color: "gold" },
  PENDING_APPROVAL: { label: "Chờ phê duyệt", color: "gold" },
  PENDING_REVIEW: { label: "Chờ xác nhận", color: "processing" },
  READY_FOR_CONFIRMATION: { label: "Chờ khách hàng xác nhận", color: "gold" },
  APPROVED: { label: "Đã phê duyệt", color: "success" },
  CONFIRMED: { label: "Đã xác nhận", color: "success" },
  REJECTED: { label: "Đã từ chối", color: "error" },
  CANCELLED: { label: "Đã hủy", color: "default" },
  CANCELED: { label: "Đã hủy", color: "default" },
  DRAFT: { label: "Nháp", color: "default" },
  ISSUED: { label: "Đã phát hành", color: "processing" },
  PARTIALLY_PAID: { label: "Thanh toán một phần", color: "gold" },
  PAID: { label: "Đã thanh toán", color: "success" },
  SETTLED: { label: "Đã quyết toán", color: "cyan" },
  CLOSED: { label: "Đã đóng", color: "default" },
  VOID: { label: "Vô hiệu", color: "error" },
  OVERDUE: { label: "Quá hạn", color: "error" },
  SUBMITTED: { label: "Đã gửi xử lý", color: "blue" },
  PROCESSING: { label: "Đang xử lý", color: "processing" },
  RESERVED: { label: "Đã giữ hàng", color: "cyan" },
  PICKED: { label: "Đã soạn hàng", color: "purple" },
  IN_TRANSIT: { label: "Đang giao hàng", color: "geekblue" },
  DELIVERED: { label: "Đã giao", color: "green" },
  COMPLETED: { label: "Hoàn tất", color: "success" },
  NOT_REQUIRED: { label: "Không cần duyệt", color: "default" },
  MODIFICATION_REQUESTED: { label: "Yêu cầu chỉnh sửa", color: "orange" },
};

const APPROVAL_TYPE_LABELS: Record<string, string> = {
  SUBMISSION: "Gửi phê duyệt",
  CANCELLATION: "Hủy hợp đồng",
  PRICE_OVERRIDE: "Điều chỉnh giá",
  CREDIT_LIMIT: "Vượt hạn mức tín dụng",
  CONTRACT_VALUE: "Giá trị hợp đồng lớn",
};

const APPROVAL_TIER_LABELS: Record<string, string> = {
  OWNER: "Chủ sở hữu",
  MANAGER: "Quản lý",
};

const PENDING_ACTION_LABELS: Record<string, string> = {
  APPROVE: "Phê duyệt",
  REJECT: "Từ chối",
  REQUEST_MODIFICATION: "Yêu cầu chỉnh sửa",
  CUSTOMER_APPROVE: "Khách hàng xác nhận",
  CUSTOMER_REJECT: "Khách hàng từ chối",
  ACCOUNTANT_REJECT: "Kế toán từ chối",
  SUBMIT: "Gửi xử lý",
  CANCEL: "Hủy",
};

export const formatDashboardNumber = (value?: number | null) =>
  new Intl.NumberFormat("vi-VN", {
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));

export const formatDashboardCurrency = (value?: number | null) =>
  new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Number(value ?? 0));

export const formatDashboardDate = (value?: string | null, fallback = "Chưa cập nhật") => {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : DATE_FORMATTER.format(date);
};

export const formatDashboardDateTime = (value?: string | null, fallback = "Chưa cập nhật") => {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? fallback : DATE_TIME_FORMATTER.format(date);
};

export const getDashboardRoleLabel = (role?: string | null) => ROLE_LABELS[String(role ?? "").toUpperCase()] ?? "Quản trị";

export const getDashboardStatusMeta = (status?: string | null): DashboardStatusMeta =>
  STATUS_META[String(status ?? "").trim().toUpperCase()] ?? { label: "Chưa phân loại", color: "default" };

export const getApprovalTypeLabel = (value?: string | null) =>
  APPROVAL_TYPE_LABELS[String(value ?? "").trim().toUpperCase()] ?? "Nghiệp vụ cần duyệt";

export const getApprovalTierLabel = (value?: string | null) =>
  APPROVAL_TIER_LABELS[String(value ?? "").trim().toUpperCase()] ?? "Chưa xác định";

export const getPendingActionLabel = (value?: string | null) =>
  PENDING_ACTION_LABELS[String(value ?? "").trim().toUpperCase()] ?? "Chờ xử lý";

export const getDisplayValue = (value?: string | null, fallback = "Chưa cập nhật") => {
  const text = String(value ?? "").trim();
  return text || fallback;
};
