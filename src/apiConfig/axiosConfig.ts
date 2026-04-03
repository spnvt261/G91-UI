import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import type { ApiResponse, ApiValidationErrorItem } from "../models/common/api.model";
import { extractApiErrorMessage, extractFieldErrors, isApiResponse, isSuccessResponse, unwrapApiResponse } from "../services/service.utils";

const MIN_REQUEST_DURATION_MS = 1000;

type RequestMetaConfig = InternalAxiosRequestConfig & {
  metadata?: {
    requestStartedAt: number;
  };
};

export class ApiClientError extends Error {
  code?: string;
  errors?: ApiValidationErrorItem[];
  fieldErrors?: Record<string, string[]>;

  constructor(message: string, options?: { code?: string; errors?: ApiValidationErrorItem[]; fieldErrors?: Record<string, string[]> }) {
    super(message);
    this.name = "ApiClientError";
    this.code = options?.code;
    this.errors = options?.errors;
    this.fieldErrors = options?.fieldErrors;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

const getToken = () => localStorage.getItem("access_token");
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const ensureMinimumRequestDuration = async (config?: RequestMetaConfig) => {
  const startedAt = config?.metadata?.requestStartedAt;
  if (!startedAt) {
    return;
  }

  const elapsed = Date.now() - startedAt;
  const remaining = MIN_REQUEST_DURATION_MS - elapsed;

  if (remaining > 0) {
    await wait(remaining);
  }
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const requestConfig = config as RequestMetaConfig;
    requestConfig.metadata = {
      requestStartedAt: Date.now(),
    };

    if (!config.headers) {
      config.headers = new AxiosHeaders();
    }

    const token = getToken();
    if (token) {
      config.headers.set("Authorization", `Bearer ${token}`);
    }

    const requestUrl = config.url ?? "";
    const normalizedBaseUrl = config.baseURL?.replace(/\/+$/, "");
    if (normalizedBaseUrl?.endsWith("/api") && requestUrl.startsWith("/api/")) {
      config.url = requestUrl.replace(/^\/api/, "");
    }

    return config;
  },
  (error) => Promise.reject(error),
);

api.interceptors.response.use(
  async (response) => {
    await ensureMinimumRequestDuration(response.config as RequestMetaConfig);

    const payload = response.data as ApiResponse<unknown> | unknown;

    if (!isApiResponse(payload)) {
      return response;
    }

    if (isSuccessResponse(payload)) {
      response.data = unwrapApiResponse(payload);
      return response;
    }

    throw new ApiClientError(extractApiErrorMessage(payload, "Request failed"), {
      code: payload.code,
      errors: payload.errors,
      fieldErrors: extractFieldErrors(payload.errors),
    });
  },
  async (error: AxiosError) => {
    await ensureMinimumRequestDuration(error.config as RequestMetaConfig | undefined);

    const payload = error.response?.data as ApiResponse<unknown> | undefined;
    if (isApiResponse(payload)) {
      return Promise.reject(
        new ApiClientError(extractApiErrorMessage(payload, error.message || "Request failed"), {
          code: payload.code,
          errors: payload.errors,
          fieldErrors: extractFieldErrors(payload.errors),
        }),
      );
    }

    return Promise.reject(error);
  },
);

export default api;
