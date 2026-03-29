import { canPerformAction, hasPermission } from "../../const/authz.const";
import type { UserRole } from "../../models/auth/auth.model";
import type { PromotionListItem, PromotionStatus, PromotionType } from "../../models/promotion/promotion.model";
import { toCurrency } from "../shared/page.utils";

export const PROMOTION_TYPE_OPTIONS: Array<{ label: string; value: PromotionType }> = [
  { label: "Percentage", value: "PERCENTAGE" },
  { label: "Fixed Amount", value: "FIXED_AMOUNT" },
];

export const PROMOTION_STATUS_OPTIONS: Array<{ label: string; value: PromotionStatus }> = [
  { label: "Active", value: "ACTIVE" },
  { label: "Scheduled", value: "SCHEDULED" },
  { label: "Inactive", value: "INACTIVE" },
  { label: "Expired", value: "EXPIRED" },
];

const PROMOTION_TYPE_LABELS: Record<PromotionType, string> = {
  PERCENTAGE: "Percentage",
  FIXED_AMOUNT: "Fixed Amount",
};

const PROMOTION_STATUS_LABELS: Record<PromotionStatus, string> = {
  ACTIVE: "Active",
  INACTIVE: "Inactive",
  SCHEDULED: "Scheduled",
  EXPIRED: "Expired",
};

export const getPromotionTypeLabel = (value: PromotionType): string => {
  return PROMOTION_TYPE_LABELS[value] ?? value;
};

export const getPromotionStatusLabel = (value: PromotionStatus): string => {
  return PROMOTION_STATUS_LABELS[value] ?? value;
};

export const getPromotionStatusBadgeClassName = (status: PromotionStatus): string => {
  switch (status) {
    case "ACTIVE":
      return "border border-emerald-100 bg-emerald-50 text-emerald-700";
    case "SCHEDULED":
      return "border border-blue-100 bg-blue-50 text-blue-700";
    case "EXPIRED":
      return "border border-slate-200 bg-slate-100 text-slate-600";
    case "INACTIVE":
      return "border border-amber-100 bg-amber-50 text-amber-700";
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

export const canAccessPromotionModule = (role: UserRole | null | undefined): boolean => hasPermission(role, "promotion.view");
export const canCreatePromotion = (role: UserRole | null | undefined): boolean => canPerformAction(role, "promotion.create");
export const canEditPromotion = (role: UserRole | null | undefined): boolean => canPerformAction(role, "promotion.update");
export const canDeletePromotion = (role: UserRole | null | undefined): boolean => canPerformAction(role, "promotion.delete");
