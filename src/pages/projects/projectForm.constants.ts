export const PROJECT_STATUS_OPTIONS = [
  { label: "NEW", value: "NEW" },
  { label: "IN_PROGRESS", value: "IN_PROGRESS" },
  { label: "ON_HOLD", value: "ON_HOLD" },
  { label: "DONE", value: "DONE" },
  { label: "ACTIVE", value: "ACTIVE" },
  { label: "COMPLETED", value: "COMPLETED" },
  { label: "CANCELLED", value: "CANCELLED" },
] as const;

export const PROGRESS_STATUS_OPTIONS = [
  { label: "IN_PROGRESS", value: "IN_PROGRESS" },
  { label: "ON_HOLD", value: "ON_HOLD" },
  { label: "DONE", value: "DONE" },
] as const;

export const clampProgress = (value?: number): number => {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }
  return Math.min(100, Math.max(0, value));
};
