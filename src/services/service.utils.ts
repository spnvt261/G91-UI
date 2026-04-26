import type { ApiResponse, ApiValidationErrorItem, PaginationMeta } from "../models/common/api.model";
import { translateErrorMessage } from "./error-message.utils";

type MaybeRecord = Record<string, unknown>;

const isObject = (value: unknown): value is MaybeRecord => typeof value === "object" && value !== null;

export const isApiResponse = (value: unknown): value is ApiResponse<unknown> => {
  if (!isObject(value)) {
    return false;
  }

  return typeof value.code === "string" && typeof value.message === "string";
};

export const isSuccessResponse = (value: unknown): value is ApiResponse<unknown> & { code: "SUCCESS" } => {
  if (!isApiResponse(value)) {
    return false;
  }

  return value.code === "SUCCESS";
};

export const unwrapApiResponse = <T>(payload: unknown): T => {
  if (!isApiResponse(payload)) {
    return payload as T;
  }

  return payload.data as T;
};

export const extractFieldErrors = (errors?: ApiValidationErrorItem[]): Record<string, string[]> => {
  if (!errors?.length) {
    return {};
  }

  return errors.reduce<Record<string, string[]>>((result, item) => {
    const field = item.field?.trim();
    const key = field && field.length > 0 ? field : "_global";

    if (!result[key]) {
      result[key] = [];
    }

    result[key].push(translateErrorMessage(item.message, { field: item.field }));
    return result;
  }, {});
};

export const extractApiErrorMessage = (payload: unknown, fallback = "Request failed"): string => {
  if (isApiResponse(payload)) {
    const fieldErrors = extractFieldErrors(payload.errors);
    const globalMessages = fieldErrors._global ?? [];
    const firstGlobalMessage = globalMessages[0];
    if (firstGlobalMessage) {
      return firstGlobalMessage;
    }

    const firstFieldMessage = Object.entries(fieldErrors).find(([key, messages]) => key !== "_global" && messages.length > 0)?.[1]?.[0];
    if (firstFieldMessage) {
      return firstFieldMessage;
    }

    return translateErrorMessage(payload.message || fallback, { code: payload.code });
  }

  if (Array.isArray(payload)) {
    return payload.map((item) => translateErrorMessage(String(item))).join("; ") || fallback;
  }

  if (isObject(payload)) {
    if (typeof payload.message === "string" && payload.message.trim()) {
      return translateErrorMessage(payload.message);
    }

    if (typeof payload.error === "string" && payload.error.trim()) {
      return translateErrorMessage(payload.error);
    }
  }

  return translateErrorMessage(fallback);
};

export const extractList = <T>(payload: unknown): T[] => {
  if (Array.isArray(payload)) {
    return payload as T[];
  }

  if (!isObject(payload)) {
    return [];
  }

  const candidates = [payload.items, payload.content, payload.results];
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) {
      return candidate as T[];
    }
  }

  if ("data" in payload) {
    return extractList<T>(payload.data);
  }

  return [];
};

const toNumber = (value: unknown): number | undefined => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
};

export const extractPagination = (
  payload: unknown,
  fallback: Partial<PaginationMeta> = {},
): PaginationMeta => {
  const pageFallback = fallback.page ?? 1;
  const pageSizeFallback = fallback.pageSize ?? 10;
  const totalItemsFallback = fallback.totalItems ?? 0;
  const totalPagesFallback = fallback.totalPages ?? 0;

  if (!isObject(payload)) {
    return {
      page: pageFallback,
      pageSize: pageSizeFallback,
      totalItems: totalItemsFallback,
      totalPages: totalPagesFallback,
    };
  }

  const pagination = isObject(payload.pagination) ? payload.pagination : undefined;

  const page = toNumber(pagination?.page ?? payload.page) ?? pageFallback;
  const pageSize = toNumber(pagination?.pageSize ?? pagination?.size ?? payload.pageSize ?? payload.size) ?? pageSizeFallback;
  const totalItems = toNumber(
    pagination?.totalItems ?? pagination?.totalElements ?? payload.totalItems ?? payload.totalElements ?? payload.totalCount ?? payload.total,
  ) ?? totalItemsFallback;
  const totalPages =
    toNumber(pagination?.totalPages ?? payload.totalPages) ??
    (pageSize > 0 ? Math.ceil(totalItems / pageSize) : totalPagesFallback);

  return {
    page,
    pageSize,
    totalItems,
    totalPages,
  };
};
