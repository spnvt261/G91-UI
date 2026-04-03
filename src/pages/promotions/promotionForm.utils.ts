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
    errors.name = "Vui long nhap ten chuong trinh khuyen mai.";
  }

  if (!isPromotionType(values.promotionType)) {
    errors.promotionType = "Vui long chon loai khuyen mai.";
  }

  const discountValue = Number(values.discountValue);
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    errors.discountValue = "Gia tri giam phai lon hon 0.";
  }
  if (values.promotionType === "PERCENTAGE" && Number.isFinite(discountValue) && discountValue > 100) {
    errors.discountValue = "Giam theo phan tram khong duoc vuot qua 100%.";
  }

  if (!values.startDate) {
    errors.startDate = "Vui long chon ngay bat dau.";
  }

  if (!values.endDate) {
    errors.endDate = "Vui long chon ngay ket thuc.";
  }

  const startDateValue = values.startDate ? parseDateValue(values.startDate) : undefined;
  const endDateValue = values.endDate ? parseDateValue(values.endDate) : undefined;
  if (values.startDate && startDateValue == null) {
    errors.startDate = "Ngay bat dau khong hop le.";
  }

  if (values.endDate && endDateValue == null) {
    errors.endDate = "Ngay ket thuc khong hop le.";
  }

  if (startDateValue != null && endDateValue != null && endDateValue < startDateValue) {
    errors.endDate = "Ngay ket thuc khong duoc som hon ngay bat dau.";
  }

  if (!isPromotionStatus(values.status)) {
    errors.status = "Vui long chon trang thai.";
  }

  if (values.priority != null && values.priority < 0) {
    errors.priority = "Priority phai lon hon hoac bang 0.";
  }

  if (values.description.trim().length > 1000) {
    errors.description = "Mo ta toi da 1000 ky tu.";
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
