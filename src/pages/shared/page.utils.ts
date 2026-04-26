import axios from "axios";
import { ApiClientError } from "../../apiConfig/axiosConfig";
import type { ApiResponse } from "../../models/common/api.model";
import { translateErrorMessage } from "../../services/error-message.utils";
import { extractApiErrorMessage, extractFieldErrors, isApiResponse } from "../../services/service.utils";

export const getErrorMessage = (error: unknown, fallback = "Đã xảy ra lỗi. Vui lòng thử lại.") => {
  if (error instanceof ApiClientError && error.message) {
    return error.message;
  }

  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as ApiResponse<unknown> | undefined;
    if (isApiResponse(payload)) {
      return extractApiErrorMessage(payload, fallback);
    }

    if (error.message) {
      return translateErrorMessage(error.message);
    }
  }

  if (error instanceof Error && error.message) {
    return translateErrorMessage(error.message);
  }

  return fallback;
};

export const getFieldErrorMap = (error: unknown): Record<string, string[]> => {
  if (error instanceof ApiClientError) {
    if (error.fieldErrors && Object.keys(error.fieldErrors).length > 0) {
      return error.fieldErrors;
    }

    return extractFieldErrors(error.errors);
  }

  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as ApiResponse<unknown> | undefined;
    if (isApiResponse(payload)) {
      return extractFieldErrors(payload.errors);
    }
  }

  return {};
};

export const toCurrency = (value: number | undefined | null) => {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
};
