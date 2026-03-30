import { canPerformAction, hasPermission } from "../../const/authz.const";
import type { UserRole } from "../../models/auth/auth.model";
import type { PromotionListItem, PromotionStatus, PromotionType } from "../../models/promotion/promotion.model";
import { toCurrency } from "../shared/page.utils";
import type { BadgeProps, TagProps } from "antd";

export const PROMOTION_TYPE_OPTIONS: Array<{ label: string; value: PromotionType }> = [
  { label: "Giảm theo phần trăm", value: "PERCENTAGE" },
  { label: "Giảm số tiền cố định", value: "FIXED_AMOUNT" },
];

export const PROMOTION_STATUS_OPTIONS: Array<{ label: string; value: PromotionStatus }> = [
  { label: "Bản nháp", value: "DRAFT" },
  { label: "Đang hoạt động", value: "ACTIVE" },
  { label: "Tạm dừng", value: "INACTIVE" },
];

const PROMOTION_TYPE_LABELS: Record<PromotionType, string> = {
  PERCENTAGE: "Giảm theo phần trăm",
  FIXED_AMOUNT: "Giảm số tiền cố định",
};

const PROMOTION_STATUS_LABELS: Record<PromotionStatus, string> = {
  DRAFT: "Bản nháp",
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Tạm dừng",
};

interface PromotionStatusAppearance {
  label: string;
  tagColor: TagProps["color"];
  badgeStatus: BadgeProps["status"];
  dotColor: string;
}

const PROMOTION_STATUS_APPEARANCE: Record<string, PromotionStatusAppearance> = {
  DRAFT: {
    label: "Bản nháp",
    tagColor: "gold",
    badgeStatus: "warning",
    dotColor: "#ca8a04",
  },
  ACTIVE: {
    label: "Đang hoạt động",
    tagColor: "green",
    badgeStatus: "success",
    dotColor: "#16a34a",
  },
  INACTIVE: {
    label: "Tạm dừng",
    tagColor: "default",
    badgeStatus: "default",
    dotColor: "#64748b",
  },
};

export const getPromotionTypeLabel = (value: PromotionType): string => {
  return PROMOTION_TYPE_LABELS[value] ?? value;
};

export const getPromotionStatusLabel = (value: PromotionStatus): string => {
  return PROMOTION_STATUS_LABELS[value] ?? value;
};

export const getPromotionStatusAppearance = (status: PromotionStatus): PromotionStatusAppearance => {
  const appearance = PROMOTION_STATUS_APPEARANCE[status];
  if (appearance) {
    return appearance;
  }

  return {
    label: getPromotionStatusLabel(status),
    tagColor: "default",
    badgeStatus: "default",
    dotColor: "#64748b",
  };
};

export const getPromotionStatusBadgeClassName = (status: PromotionStatus): string => {
  switch (status) {
    case "DRAFT":
      return "border border-amber-100 bg-amber-50 text-amber-700";
    case "ACTIVE":
      return "border border-emerald-100 bg-emerald-50 text-emerald-700";
    case "INACTIVE":
      return "border border-slate-200 bg-slate-100 text-slate-600";
    default:
      return "border border-slate-200 bg-slate-100 text-slate-600";
  }
};

export const formatPromotionDate = (value?: string): string => {
  if (!value) {
    return "-";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(parsed);
};

export const formatPromotionDiscountValue = (promotion: Pick<PromotionListItem, "promotionType" | "discountValue">): string => {
  if (promotion.promotionType === "PERCENTAGE") {
    return `${promotion.discountValue}%`;
  }

  return toCurrency(promotion.discountValue);
};

export const isPromotionExpiringSoon = (endDate: string | undefined, days = 7): boolean => {
  if (!endDate) {
    return false;
  }

  const end = new Date(endDate);
  if (Number.isNaN(end.getTime())) {
    return false;
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endDay = new Date(end.getFullYear(), end.getMonth(), end.getDate());
  const diffDays = Math.ceil((endDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return diffDays >= 0 && diffDays <= days;
};

export const canAccessPromotionModule = (role: UserRole | null | undefined): boolean => hasPermission(role, "promotion.view");
export const canCreatePromotion = (role: UserRole | null | undefined): boolean => canPerformAction(role, "promotion.create");
export const canEditPromotion = (role: UserRole | null | undefined): boolean => canPerformAction(role, "promotion.update");
export const canDeletePromotion = (role: UserRole | null | undefined): boolean => canPerformAction(role, "promotion.delete");
