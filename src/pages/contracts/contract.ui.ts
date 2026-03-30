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
};

const DATE_FORMATTER = new Intl.DateTimeFormat("vi-VN");
const DATE_TIME_FORMATTER = new Intl.DateTimeFormat("vi-VN", {
  dateStyle: "medium",
  timeStyle: "short",
});

const toStatusLabel = (value: string) => {
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
  return normalized === "APPROVED" || normalized === "CONFIRMED" || normalized === "IN_PROGRESS" || normalized === "ACTIVE";
};

export const getContractSummary = (items: ContractModel[]) => {
  const totalContracts = items.length;
  const pendingContracts = items.filter((item) => normalizeStatus(item.status) === "PENDING").length;
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
  return (
    createdDate.getFullYear() === now.getFullYear() &&
    createdDate.getMonth() === now.getMonth() &&
    createdDate.getDate() === now.getDate()
  );
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
      return "Rà soát điều khoản và gửi hợp đồng để phê duyệt khi dữ liệu đã đầy đủ.";
    case "PENDING":
      return "Hợp đồng đang chờ owner phê duyệt. Nên chuẩn bị tài liệu bổ sung để phản hồi nhanh nếu được yêu cầu.";
    case "APPROVED":
    case "CONFIRMED":
      return "Sau khi được duyệt, chuyển hợp đồng sang bước thực thi và phối hợp giao hàng theo cam kết.";
    case "IN_PROGRESS":
    case "ACTIVE":
      return "Theo dõi timeline xử lý và cập nhật ghi chú khi có thay đổi về tiến độ hoặc điều khoản giao hàng.";
    case "COMPLETED":
      return "Hợp đồng đã hoàn tất. Bạn có thể đối chiếu chứng từ và lưu trữ hồ sơ để tra cứu sau này.";
    case "REJECTED":
      return "Hợp đồng đã bị từ chối. Cần rà soát lý do, điều chỉnh nội dung và gửi lại nếu cần.";
    case "CANCELED":
    case "CANCELLED":
      return "Hợp đồng đã hủy. Nên cập nhật nguyên nhân hủy và thống nhất phương án xử lý với các bên liên quan.";
    default:
      return "Theo dõi trạng thái hợp đồng và thực hiện bước xử lý tiếp theo theo quy trình phê duyệt nội bộ.";
  }
};
