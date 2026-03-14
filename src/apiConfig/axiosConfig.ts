import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

type RetryableRequestConfig = AxiosRequestConfig & { _retry?: boolean };
type QueuePromise = {
  resolve: (token: string) => void;
  reject: (error: unknown) => void;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
});

const getToken = () => localStorage.getItem("access_token");
const setToken = (token: string) => localStorage.setItem("access_token", token);

let isRefreshing = false;
let failedQueue: QueuePromise[] = [];

const processQueue = (error: unknown, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
      return;
    }

    if (token) {
      resolve(token);
      return;
    }

    reject(new Error("Token refresh failed"));
  });
  failedQueue = [];
};

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
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
  (response) => response,
  async (error: AxiosError & { config?: RetryableRequestConfig }) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then((token) => {
          const headers = AxiosHeaders.from(originalRequest.headers);
          headers.set("Authorization", `Bearer ${token}`);
          originalRequest.headers = headers;

          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const res = await refreshClient.post<{ accessToken: string }>("/auth/refresh", { refreshToken });
        const newToken = res.data.accessToken;

        setToken(newToken);
        api.defaults.headers.common["Authorization"] = `Bearer ${newToken}`;
        processQueue(null, newToken);

        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;
