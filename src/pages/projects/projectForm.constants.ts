export const PROJECT_STATUS_OPTIONS = [
  { label: "Mới", value: "NEW" },
  { label: "Đang thực hiện", value: "IN_PROGRESS" },
  { label: "Tạm dừng", value: "ON_HOLD" },
  { label: "Hoàn thành", value: "DONE" },
  { label: "Đang hoạt động", value: "ACTIVE" },
  { label: "Hoàn thành", value: "COMPLETED" },
  { label: "Đã hủy", value: "CANCELLED" },
] as const;

export const PROGRESS_STATUS_OPTIONS = [
  { label: "Đang thực hiện", value: "IN_PROGRESS" },
  { label: "Tạm dừng", value: "ON_HOLD" },
  { label: "Hoàn thành", value: "DONE" },
] as const;

export const clampProgress = (value?: number): number => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, value));
};
