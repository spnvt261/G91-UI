import type {
  PromotionCreateRequest,
  PromotionDetail,
  PromotionListItem,
  PromotionProductItem,
  PromotionStatus,
  PromotionType,
  PromotionUpdateRequest,
} from "../../models/promotion/promotion.model";

export interface PromotionStorageRecord {
  id: string;
  code?: string;
  name: string;
  promotion_type: PromotionType;
  discount_value: number;
  start_date: string;
  end_date: string;
  status: PromotionStatus;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface PromotionProductStorageRecord {
  id: string;
  promotion_id: string;
  product_id: string;
}

export interface PromotionStorageState {
  version: 1;
  promotions: PromotionStorageRecord[];
  promotionProducts: PromotionProductStorageRecord[];
}

const sanitizeProductIds = (productIds?: string[]): string[] =>
  [...new Set((productIds ?? []).map((item) => item.trim()).filter(Boolean))];

export const toPromotionListItem = (
  promotion: PromotionStorageRecord,
  productIds: string[],
): PromotionListItem => ({
  id: promotion.id,
  code: promotion.code,
  name: promotion.name,
  promotionType: promotion.promotion_type,
  discountValue: promotion.discount_value,
  startDate: promotion.start_date,
  endDate: promotion.end_date,
  status: promotion.status,
  createdBy: promotion.created_by,
  createdAt: promotion.created_at,
  updatedAt: promotion.updated_at,
  productIds,
  productCount: productIds.length,
});

export const toPromotionDetail = (
  promotion: PromotionStorageRecord,
  productIds: string[],
  applicableProducts?: PromotionProductItem[],
): PromotionDetail => ({
  ...toPromotionListItem(promotion, productIds),
  applicableProducts,
});

export const toPromotionStorageFromCreateRequest = (
  id: string,
  payload: PromotionCreateRequest,
  nowIso: string,
): PromotionStorageRecord => ({
  id,
  code: payload.code?.trim() || undefined,
  name: payload.name.trim(),
  promotion_type: payload.promotionType,
  discount_value: payload.discountValue,
  start_date: payload.startDate,
  end_date: payload.endDate,
  status: payload.status,
  created_by: "local.owner",
  created_at: nowIso,
  updated_at: nowIso,
});

export const toPromotionStorageFromUpdateRequest = (
  current: PromotionStorageRecord,
  payload: PromotionUpdateRequest,
  nowIso: string,
): PromotionStorageRecord => ({
  ...current,
  code: payload.code?.trim() || undefined,
  name: payload.name.trim(),
  promotion_type: payload.promotionType,
  discount_value: payload.discountValue,
  start_date: payload.startDate,
  end_date: payload.endDate,
  status: payload.status,
  updated_at: nowIso,
});

export const toPromotionProductStorageRecords = (promotionId: string, productIds?: string[]): PromotionProductStorageRecord[] =>
  sanitizeProductIds(productIds).map((productId) => ({
    id: `${promotionId}-${productId}`,
    promotion_id: promotionId,
    product_id: productId,
  }));

export const normalizePromotionStorageState = (state: PromotionStorageState): PromotionStorageState => ({
  version: 1,
  promotions: state.promotions.map((promotion) => ({
    ...promotion,
    code: promotion.code?.trim() || undefined,
    name: promotion.name.trim(),
    created_at: promotion.created_at ?? promotion.updated_at ?? new Date().toISOString(),
    updated_at: promotion.updated_at ?? promotion.created_at ?? new Date().toISOString(),
  })),
  promotionProducts: state.promotionProducts
    .map((item) => ({
      ...item,
      product_id: item.product_id.trim(),
    }))
    .filter((item) => item.product_id.length > 0),
});
