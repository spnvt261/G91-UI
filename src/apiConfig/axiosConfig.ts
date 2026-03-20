import axios, { AxiosError, AxiosHeaders, type InternalAxiosRequestConfig } from "axios";
import type { ApiResponse, ApiValidationErrorItem } from "../models/common/api.model";

const MIN_REQUEST_DURATION_MS = 1000;

type PendingRequestListener = (count: number) => void;

type RequestMetaConfig = InternalAxiosRequestConfig & {
  metadata?: {
    requestStartedAt: number;
    tracked: boolean;
  };
};

export class ApiClientError extends Error {
  code?: string;
  errors?: ApiValidationErrorItem[];

  constructor(message: string, options?: { code?: string; errors?: ApiValidationErrorItem[] }) {
    super(message);
    this.name = "ApiClientError";
    this.code = options?.code;
    this.errors = options?.errors;
  }
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

let pendingRequestCount = 0;
const pendingRequestListeners = new Set<PendingRequestListener>();

const getToken = () => localStorage.getItem("access_token");
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const emitPendingRequestCount = () => {
  pendingRequestListeners.forEach((listener) => listener(pendingRequestCount));
};

const increasePendingRequestCount = () => {
  pendingRequestCount += 1;
  emitPendingRequestCount();
};

const decreasePendingRequestCount = () => {
  pendingRequestCount = Math.max(0, pendingRequestCount - 1);
  emitPendingRequestCount();
};

const completeTrackedRequest = (config?: RequestMetaConfig) => {
  if (!config?.metadata?.tracked) {
    return;
  }

  config.metadata.tracked = false;
  decreasePendingRequestCount();
};

export const subscribePendingApiRequests = (listener: PendingRequestListener) => {
  pendingRequestListeners.add(listener);
  listener(pendingRequestCount);

  return () => {
    pendingRequestListeners.delete(listener);
  };
};

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

const extractValidationMessage = (errors?: ApiValidationErrorItem[]) => {
  if (!errors?.length) {
    return "";
  }

  return errors
    .map((item) => {
      if (!item.field) {
        return item.message;
      }
      return `${item.field}: ${item.message}`;
    })
    .join("; ");
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const requestConfig = config as RequestMetaConfig;
    requestConfig.metadata = {
      requestStartedAt: Date.now(),
      tracked: true,
    };
    increasePendingRequestCount();

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
    completeTrackedRequest(response.config as RequestMetaConfig);

    const payload = response.data as ApiResponse<unknown> | unknown;

    if (!payload || typeof payload !== "object" || !("code" in payload)) {
      return response;
    }

    const apiResponse = payload as ApiResponse<unknown>;
    if (apiResponse.code === "SUCCESS") {
      response.data = apiResponse.data;
      return response;
    }

    const validationMessage = extractValidationMessage(apiResponse.errors);
    throw new ApiClientError(validationMessage || apiResponse.message || "Request failed", {
      code: apiResponse.code,
      errors: apiResponse.errors,
    });
  },
  async (error: AxiosError) => {
    await ensureMinimumRequestDuration(error.config as RequestMetaConfig | undefined);
    completeTrackedRequest(error.config as RequestMetaConfig | undefined);

    const payload = error.response?.data as ApiResponse<unknown> | undefined;
    if (payload?.code) {
      const validationMessage = extractValidationMessage(payload.errors);
      return Promise.reject(
        new ApiClientError(validationMessage || payload.message || error.message || "Request failed", {
          code: payload.code,
          errors: payload.errors,
        }),
      );
    }

    return Promise.reject(error);
  },
);

export default api;
