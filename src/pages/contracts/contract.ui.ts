import type { BadgeProps, TagProps } from "antd";
import type { ContractModel } from "../../models/contract/contract.model";
import { toCurrency } from "../shared/page.utils";

interface ContractStatusMeta {
  label: string;
  tagColor: TagProps["color"];
  badgeStatus: BadgeProps["status"];
}

const CONTRACT_STATUS_META: Record<string, ContractStatusMeta> = {
  DRAFT: {
    label: "Nháp",
    tagColor: "default",
    badgeStatus: "default",
  },
  PENDING_CUSTOMER_APPROVAL: {
    label: "Chờ khách hàng xác nhận",
    tagColor: "cyan",
    badgeStatus: "processing",
  },
  CUSTOMER_APPROVAL: {
    label: "Khách hàng đã chấp nhận",
    tagColor: "blue",
    badgeStatus: "processing",
  },
  PENDING_APPROVAL: {
    label: "Chờ duyệt",
    tagColor: "gold",
    badgeStatus: "processing",
  },
  PENDING: {
    label: "Chờ duyệt",
    tagColor: "gold",
    badgeStatus: "processing",
  },
  APPROVED: {
    label: "Đã duyệt",
    tagColor: "green",
    badgeStatus: "success",
  },
  REJECTED: {
    label: "Từ chối",
    tagColor: "red",
    badgeStatus: "error",
  },
  SUBMITTED: {
    label: "Đã gửi thực hiện",
    tagColor: "blue",
    badgeStatus: "processing",
  },
  PROCESSING: {
    label: "Đang xử lý",
    tagColor: "processing",
    badgeStatus: "processing",
  },
  RESERVED: {
    label: "Đã dự trữ",
    tagColor: "cyan",
    badgeStatus: "processing",
  },
  PICKED: {
    label: "Đã soạn hàng",
    tagColor: "purple",
    badgeStatus: "processing",
  },
  IN_TRANSIT: {
    label: "Đang xuất giao",
    tagColor: "geekblue",
    badgeStatus: "processing",
  },
  DELIVERED: {
    label: "Đã giao",
    tagColor: "lime",
    badgeStatus: "success",
  },
  CONFIRMED: {
    label: "Đã xác nhận",
    tagColor: "cyan",
    badgeStatus: "processing",
  },
  IN_PROGRESS: {
    label: "Đang xử lý",
    tagColor: "blue",
    badgeStatus: "processing",
  },
  COMPLETED: {
    label: "Hoàn tất",
    tagColor: "green",
    badgeStatus: "success",
  },
  ACTIVE: {
    label: "Đang hiệu lực",
    tagColor: "lime",
    badgeStatus: "success",
  },
  CANCELED: {
    label: "Đã hủy",
    tagColor: "volcano",
    badgeStatus: "error",
  },
  CANCELLED: {
    label: "Đã hủy",
    tagColor: "volcano",
    badgeStatus: "error",
  },
  MODIFICATION_REQUESTED: {
    label: "Yêu cầu chỉnh sửa",
    tagColor: "orange",
    badgeStatus: "warning",
  },
  NOT_REQUIRED: {
    label: "Không cần duyệt",
    tagColor: "default",
    badgeStatus: "default",
  },
};

const STATUS_FALLBACK_LABEL: Record<string, string> = {
  MANAGER: "Quản lý",
  OWNER: "Chủ doanh nghiệp",
  SUBMISSION: "Gửi thực hiện",
  CANCELLATION: "Hủy hợp đồng",
  PRICE_OVERRIDE: "Điều chỉnh giá",
};

const DATE_FORMATTER = new Intl.DateTimeFormat("vi-VN");
const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
});

const toStatusLabel = (value: string) => {
  if (STATUS_FALLBACK_LABEL[value]) {
    return STATUS_FALLBACK_LABEL[value];
  }

  return value
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const normalizeStatus = (status?: string) => String(status ?? "UNKNOWN").trim().toUpperCase();

export const formatContractCurrency = (value: number | undefined | null) => toCurrency(value);

export const formatContractDate = (value?: string, fallback = "Chưa cập nhật") => {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return DATE_FORMATTER.format(date);
};

export const formatContractDateTime = (value?: string, fallback = "Chưa cập nhật") => {
  if (!value) {
    return fallback;
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return fallback;
  }

  return DATE_TIME_FORMATTER.format(date);
};

export const getContractStatusMeta = (status?: string): ContractStatusMeta => {
  const normalized = normalizeStatus(status);
  return (
    CONTRACT_STATUS_META[normalized] ?? {
      label: toStatusLabel(normalized),
      tagColor: "default",
      badgeStatus: "default",
    }
  );
};

export const getContractDisplayNumber = (contract: Pick<ContractModel, "id" | "contractNumber">) => {
  return contract.contractNumber || contract.id;
};

export const isClosedContractStatus = (status?: string) => {
  const normalized = normalizeStatus(status);
  return normalized === "COMPLETED" || normalized === "REJECTED" || normalized === "CANCELED" || normalized === "CANCELLED";
};

export const isProcessingContractStatus = (status?: string) => {
  const normalized = normalizeStatus(status);
  return ["APPROVED", "CONFIRMED", "IN_PROGRESS", "ACTIVE", "SUBMITTED", "PROCESSING", "RESERVED", "PICKED", "IN_TRANSIT", "DELIVERED"].includes(normalized);
};

export const getContractSummary = (items: ContractModel[]) => {
  const totalContracts = items.length;
  const pendingContracts = items.filter((item) =>
    ["PENDING", "PENDING_APPROVAL", "PENDING_CUSTOMER_APPROVAL", "CUSTOMER_APPROVAL"].includes(normalizeStatus(item.status)),
  ).length;
  const processingContracts = items.filter((item) => isProcessingContractStatus(item.status)).length;
  const closedContracts = items.filter((item) => isClosedContractStatus(item.status)).length;

  return {
    totalContracts,
    pendingContracts,
    processingContracts,
    closedContracts,
  };
};

export const isRecentContract = (createdAt?: string, hoursThreshold = 24) => {
  if (!createdAt) {
    return false;
  }

  const createdTime = new Date(createdAt).getTime();
  if (Number.isNaN(createdTime)) {
    return false;
  }

  return Date.now() - createdTime <= hoursThreshold * 60 * 60 * 1000;
};

export const isTodayContract = (createdAt?: string) => {
  if (!createdAt) {
    return false;
  }

  const createdDate = new Date(createdAt);
  if (Number.isNaN(createdDate.getTime())) {
    return false;
  }

  const now = new Date();
  return createdDate.getFullYear() === now.getFullYear() && createdDate.getMonth() === now.getMonth() && createdDate.getDate() === now.getDate();
};

export const isHighValueContract = (totalAmount: number, threshold = 1_000_000_000) => {
  return totalAmount >= threshold;
};

export const isUrgentPendingContract = (contract: Pick<ContractModel, "createdAt" | "totalAmount">) => {
  if (isHighValueContract(contract.totalAmount)) {
    return true;
  }

  if (!contract.createdAt) {
    return false;
  }

  const createdTime = new Date(contract.createdAt).getTime();
  if (Number.isNaN(createdTime)) {
    return false;
  }

  return Date.now() - createdTime >= 3 * 24 * 60 * 60 * 1000;
};

export const getContractNextStepHint = (status?: string) => {
  const normalized = normalizeStatus(status);

  switch (normalized) {
    case "DRAFT":
      return "Rà soát điều khoản và gửi khách hàng xác nhận khi dữ liệu hợp đồng đã đầy đủ.";
    case "PENDING_CUSTOMER_APPROVAL":
      return "Hợp đồng đang chờ khách hàng xác nhận. Theo dõi phản hồi để chuyển sang bước thực hiện.";
    case "CUSTOMER_APPROVAL":
      return "Khách hàng đã chấp nhận. Kế toán có thể gửi thực hiện hoặc trả về nháp nếu cần chỉnh sửa.";
    case "PENDING":
    case "PENDING_APPROVAL":
      return "Hợp đồng đang chờ duyệt. Chuẩn bị đầy đủ tài liệu bổ sung để phản hồi nhanh.";
    case "APPROVED":
    case "SUBMITTED":
    case "PROCESSING":
      return "Theo dõi tiến độ thực hiện và phối hợp với kho để đảm bảo luồng giao hàng.";
    case "RESERVED":
      return "Đơn liên quan đã dự trữ hàng. Tiếp tục bước soạn hàng và xuất giao.";
    case "PICKED":
      return "Hàng đã được soạn. Cần xuất giao hoặc xác nhận đã giao theo thực tế.";
    case "IN_TRANSIT":
      return "Đơn đang xuất giao. Theo dõi vận chuyển và xác nhận giao thành công.";
    case "DELIVERED":
      return "Đơn đã giao, có thể chuyển hoàn tất khi đủ điều kiện quyết toán.";
    case "COMPLETED":
      return "Hợp đồng đã hoàn tất. Đối chiếu chứng từ và lưu trữ hồ sơ.";
    case "REJECTED":
      return "Hợp đồng bị từ chối. Rà soát lý do và điều chỉnh trước khi gửi lại.";
    case "CANCELED":
    case "CANCELLED":
      return "Hợp đồng đã hủy. Cần lưu rõ nguyên nhân và thông báo các bên liên quan.";
    default:
      return "Theo dõi trạng thái hợp đồng và thực hiện bước xử lý tiếp theo theo quy trình nội bộ.";
  }
};
