export const PROJECT_STATUS_OPTIONS = [
  { label: "Mới", value: "NEW" },
  { label: "Đang thực hiện", value: "IN_PROGRESS" },
  { label: "Tạm dừng", value: "ON_HOLD" },
  { label: "Hoàn thành", value: "DONE" },
  { label: "Đang hoạt động", value: "ACTIVE" },
  { label: "Hoàn thành (đóng sổ)", value: "COMPLETED" },
  { label: "Đã đóng", value: "CLOSED" },
  { label: "Đã hủy", value: "CANCELLED" },
] as const;

export const PROGRESS_STATUS_OPTIONS = [
  { label: "Đúng tiến độ", value: "ON_TRACK" },
  { label: "Có rủi ro", value: "AT_RISK" },
  { label: "Trễ tiến độ", value: "DELAYED" },
  { label: "Hoàn thành", value: "COMPLETED" },
] as const;

export type ProjectProgressStatusValue = (typeof PROGRESS_STATUS_OPTIONS)[number]["value"];

const VALID_PROGRESS_STATUSES: ProjectProgressStatusValue[] = ["ON_TRACK", "AT_RISK", "DELAYED", "COMPLETED"];

const LEGACY_PROGRESS_STATUS_MAP: Record<string, ProjectProgressStatusValue> = {
  IN_PROGRESS: "ON_TRACK",
  ON_HOLD: "AT_RISK",
  DONE: "COMPLETED",
};

export const normalizeProgressStatus = (value?: string): ProjectProgressStatusValue | undefined => {
  if (!value) {
    return undefined;
  }

  const normalized = value.trim().toUpperCase();

  if (VALID_PROGRESS_STATUSES.includes(normalized as ProjectProgressStatusValue)) {
    return normalized as ProjectProgressStatusValue;
  }

  return LEGACY_PROGRESS_STATUS_MAP[normalized];
};

export const clampProgress = (value?: number): number => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, value));
};
