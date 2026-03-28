import type { UserRole } from "../models/auth/auth.model";
import { ROUTE_URL } from "./route_url.const";

const normalizePath = (pathname: string): string => {
  if (!pathname) {
    return "/";
  }

  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }

  return pathname;
};

const startsWithPath = (pathname: string, basePath: string): boolean => {
  const normalizedPath = normalizePath(pathname);
  const normalizedBase = normalizePath(basePath);
  return normalizedPath === normalizedBase || normalizedPath.startsWith(`${normalizedBase}/`);
};

const ROLE_ALLOWED_PATHS: Record<UserRole, string[]> = {
  GUEST: [ROUTE_URL.LOGIN, ROUTE_URL.REGISTER, ROUTE_URL.VERIFY_REGISTRATION, ROUTE_URL.FORGOT_PASSWORD, ROUTE_URL.RESET_PASSWORD],
  CUSTOMER: [
    ROUTE_URL.DASHBOARD,
    ROUTE_URL.PROFILE,
    "/products",
    ROUTE_URL.PROMOTION_LIST,
    "/quotations",
    "/projects",
    "/payments",
  ],
  ACCOUNTANT: [
    ROUTE_URL.DASHBOARD,
    ROUTE_URL.PROFILE,
    "/customers",
    "/projects",
    "/contracts",
    "/quotations",
    ROUTE_URL.PROMOTION_LIST,
    "/payments",
    "/reports/dashboard",
    "/reports/sales",
    "/reports/financial",
  ],
  WAREHOUSE: [ROUTE_URL.DASHBOARD, ROUTE_URL.PROFILE, "/products", "/projects", "/reports/inventory"],
  OWNER: ["/"],
};

const ROLE_DENIED_PATHS: Partial<Record<UserRole, string[]>> = {
  CUSTOMER: [ROUTE_URL.PROMOTION_CREATE],
};

export const getDefaultRouteByRole = (role: UserRole): string => {
  switch (role) {
    case "CUSTOMER":
      return ROUTE_URL.QUOTATION_LIST;
    case "ACCOUNTANT":
      return ROUTE_URL.CUSTOMER_LIST;
    case "WAREHOUSE":
      return ROUTE_URL.PRODUCT_LIST;
    case "OWNER":
      return ROUTE_URL.DASHBOARD;
    default:
      return ROUTE_URL.LOGIN;
  }
};

export const canAccessPathByRole = (role: UserRole, pathname: string): boolean => {
  if (role === "OWNER") {
    return true;
  }

  const deniedPaths = ROLE_DENIED_PATHS[role] ?? [];
  const isDenied = deniedPaths.some((deniedPath) => startsWithPath(pathname, deniedPath));
  if (isDenied) {
    return false;
  }

  const allowedPaths = ROLE_ALLOWED_PATHS[role];
  return allowedPaths.some((allowedPath) => startsWithPath(pathname, allowedPath));
};
