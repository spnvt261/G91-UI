import type {
  PromotionCreateRequest,
  PromotionDetail,
  PromotionStatus,
  PromotionType,
  PromotionUpdateRequest,
} from "../../models/promotion/promotion.model";

const PROMOTION_TYPES: PromotionType[] = ["PERCENTAGE", "FIXED_AMOUNT"];
const PROMOTION_STATUSES: PromotionStatus[] = ["ACTIVE", "INACTIVE", "SCHEDULED", "EXPIRED"];

export interface PromotionFormValues {
  code: string;
  name: string;
  promotionType: string;
  discountValue: string;
  startDate: string;
  endDate: string;
  status: string;
  productIds: string[];
}

export type PromotionFormErrors = Partial<Record<keyof PromotionFormValues, string>>;

export const createInitialPromotionFormValues = (detail?: PromotionDetail): PromotionFormValues => ({
  code: detail?.code ?? "",
  name: detail?.name ?? "",
  promotionType: detail?.promotionType ?? "",
  discountValue: detail?.discountValue != null ? String(detail.discountValue) : "",
  startDate: detail?.startDate ?? "",
  endDate: detail?.endDate ?? "",
  status: detail?.status ?? "",
  productIds: detail?.productIds ?? [],
});

const isPromotionType = (value: string): value is PromotionType => {
  return PROMOTION_TYPES.includes(value as PromotionType);
};

const isPromotionStatus = (value: string): value is PromotionStatus => {
  return PROMOTION_STATUSES.includes(value as PromotionStatus);
};

const parseDateValue = (value: string): number | undefined => {
  const parsed = new Date(value).getTime();
  return Number.isNaN(parsed) ? undefined : parsed;
};

export const validatePromotionForm = (values: PromotionFormValues): PromotionFormErrors => {
  const errors: PromotionFormErrors = {};

  if (!values.name.trim()) {
    errors.name = "Please enter promotion name.";
  }

  if (!isPromotionType(values.promotionType)) {
    errors.promotionType = "Please select promotion type.";
  }

  const discountValue = Number(values.discountValue);
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    errors.discountValue = "Discount value must be greater than 0.";
  }
  if (values.promotionType === "PERCENTAGE" && Number.isFinite(discountValue) && discountValue > 100) {
    errors.discountValue = "Percentage discount cannot exceed 100.";
  }

  if (!values.startDate) {
    errors.startDate = "Please choose start date.";
  }

  if (!values.endDate) {
    errors.endDate = "Please choose end date.";
  }

  const startDateValue = values.startDate ? parseDateValue(values.startDate) : undefined;
  const endDateValue = values.endDate ? parseDateValue(values.endDate) : undefined;
  if (values.startDate && startDateValue == null) {
    errors.startDate = "Start date is invalid.";
  }

  if (values.endDate && endDateValue == null) {
    errors.endDate = "End date is invalid.";
  }

  if (startDateValue != null && endDateValue != null && endDateValue < startDateValue) {
    errors.endDate = "End date cannot be before start date.";
  }

  if (!isPromotionStatus(values.status)) {
    errors.status = "Please select status.";
  }

  return errors;
};

export const toPromotionWritePayload = (values: PromotionFormValues): PromotionCreateRequest | PromotionUpdateRequest => {
  const promotionType = isPromotionType(values.promotionType) ? values.promotionType : "PERCENTAGE";
  const status = isPromotionStatus(values.status) ? values.status : "ACTIVE";

  return {
    code: values.code.trim() || undefined,
    name: values.name.trim(),
    promotionType,
    discountValue: Number(values.discountValue),
    startDate: values.startDate,
    endDate: values.endDate,
    status,
    productIds: values.productIds,
  };
};
