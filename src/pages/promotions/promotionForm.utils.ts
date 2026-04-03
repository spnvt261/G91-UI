import type {
  PromotionCreateRequest,
  PromotionDetail,
  PromotionStatus,
  PromotionType,
  PromotionUpdateRequest,
} from "../../models/promotion/promotion.model";

const PROMOTION_TYPES: PromotionType[] = ["PERCENTAGE", "FIXED_AMOUNT"];
const PROMOTION_STATUSES: PromotionStatus[] = ["DRAFT", "ACTIVE", "INACTIVE"];

export interface PromotionFormValues {
  code: string;
  name: string;
  promotionType: string;
  discountValue: string;
  startDate: string;
  endDate: string;
  status: string;
  productIds: string[];
  customerGroups: string[];
  priority: number | null;
  description: string;
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
  customerGroups: detail?.customerGroups ?? [],
  priority: detail?.priority ?? null,
  description: detail?.description ?? "",
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
    errors.name = "Vui lòng nhập tên chương trình khuyến mãi.";
  }

  if (!isPromotionType(values.promotionType)) {
    errors.promotionType = "Vui lòng chọn loại khuyến mãi.";
  }

  const discountValue = Number(values.discountValue);
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    errors.discountValue = "Giá trị giảm phải lớn hơn 0.";
  }
  if (values.promotionType === "PERCENTAGE" && Number.isFinite(discountValue) && discountValue > 100) {
    errors.discountValue = "Giảm theo phần trăm không được vượt quá 100%.";
  }

  if (!values.startDate) {
    errors.startDate = "Vui lòng chọn ngày bắt đầu.";
  }

  if (!values.endDate) {
    errors.endDate = "Vui lòng chọn ngày kết thúc.";
  }

  const startDateValue = values.startDate ? parseDateValue(values.startDate) : undefined;
  const endDateValue = values.endDate ? parseDateValue(values.endDate) : undefined;
  if (values.startDate && startDateValue == null) {
    errors.startDate = "Ngày bắt đầu không hợp lệ.";
  }

  if (values.endDate && endDateValue == null) {
    errors.endDate = "Ngày kết thúc không hợp lệ.";
  }

  if (startDateValue != null && endDateValue != null && endDateValue < startDateValue) {
    errors.endDate = "Ngày kết thúc không được sớm hơn ngày bắt đầu.";
  }

  if (!isPromotionStatus(values.status)) {
    errors.status = "Vui lòng chọn trạng thái.";
  }

  if (values.priority != null && values.priority < 0) {
    errors.priority = "Priority phải lớn hơn hoặc bằng 0.";
  }

  if (values.description.trim().length > 1000) {
    errors.description = "Mô tả tối đa 1000 ký tự.";
  }

  return errors;
};

export const toPromotionWritePayload = (values: PromotionFormValues): PromotionCreateRequest | PromotionUpdateRequest => {
  const promotionType = isPromotionType(values.promotionType) ? values.promotionType : "PERCENTAGE";
  const status = isPromotionStatus(values.status) ? values.status : "DRAFT";

  return {
    code: values.code.trim() || undefined,
    name: values.name.trim(),
    promotionType,
    discountValue: Number(values.discountValue),
    startDate: values.startDate,
    endDate: values.endDate,
    status,
    productIds: values.productIds,
    customerGroups: values.customerGroups,
    priority: values.priority ?? undefined,
    description: values.description.trim() || undefined,
  };
};
