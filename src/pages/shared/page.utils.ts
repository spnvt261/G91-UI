import axios from "axios";
import { ApiClientError } from "../../apiConfig/axiosConfig";
import type { ApiResponse } from "../../models/common/api.model";

export const getErrorMessage = (error: unknown, fallback = "Something went wrong") => {
  if (error instanceof ApiClientError && error.message) {
    return error.message;
  }

  if (axios.isAxiosError(error)) {
    const payload = error.response?.data as ApiResponse<unknown> | undefined;
    if (payload?.message) {
      return payload.message;
    }

    if (error.message) {
      return error.message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export const toCurrency = (value: number | undefined | null) => {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(amount);
};
