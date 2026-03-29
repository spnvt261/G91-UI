import type { ProjectModel } from "../../models/project/project.model";

const STATUS_COLOR_MAP: Record<string, string> = {
  ACTIVE: "processing",
  IN_PROGRESS: "processing",
  COMPLETED: "success",
  DONE: "success",
  CLOSED: "success",
  ON_HOLD: "warning",
  NEW: "default",
  CANCELLED: "default",
  ARCHIVED: "default",
};

const STATUS_LABEL_MAP: Record<string, string> = {
  NEW: "Mới",
  IN_PROGRESS: "Đang thực hiện",
  ON_HOLD: "Tạm dừng",
  DONE: "Hoàn thành",
  ACTIVE: "Đang hoạt động",
  COMPLETED: "Hoàn thành",
  CLOSED: "Đã đóng",
  CANCELLED: "Đã hủy",
  ARCHIVED: "Lưu trữ",
};

export const getProjectStatusColor = (status?: string): string => {
  const normalized = (status ?? "").trim().toUpperCase();
  return STATUS_COLOR_MAP[normalized] ?? "blue";
};

export const getProjectStatusLabel = (status?: string): string => {
  if (!status) {
    return "Không xác định";
  }
  const normalized = status.trim().toUpperCase();
  if (!normalized) {
    return "Không xác định";
  }
  if (STATUS_LABEL_MAP[normalized]) {
    return STATUS_LABEL_MAP[normalized];
  }

  return normalized
    .split("_")
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(" ");
};

export const normalizeProgress = (value?: number | string): number => {
  const parsed = Number(value ?? 0);
  if (Number.isNaN(parsed)) {
    return 0;
  }
  return Math.max(0, Math.min(100, parsed));
};

export const resolveProjectProgress = (project?: ProjectModel | null): number => {
  return normalizeProgress(project?.progressPercent ?? project?.progress ?? 0);
};

export const displayText = (value?: string | number | null): string => {
  if (value === null || value === undefined) {
    return "-";
  }
  const text = String(value).trim();
  return text ? text : "-";
};

export const formatProjectDate = (value?: string): string => {
  const text = displayText(value);
  if (text === "-") {
    return text;
  }

  const parsed = new Date(text);
  if (Number.isNaN(parsed.getTime())) {
    return text;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(parsed);
};
