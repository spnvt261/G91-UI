import type { UserRole } from "../models/auth/auth.model";
import { ROUTE_URL } from "./route_url.const";

export type MenuId =
  | "dashboard"
  | "user-management"
  | "product-management"
  | "price-list-management"
  | "promotion-management"
  | "inventory-management"
  | "quotation-management"
  | "contract-management"
  | "contract-approvals"
  | "customer-management"
  | "project-management"
  | "payment-management"
  | "reports-sales"
  | "reports-project"
  | "reports-inventory"
  | "reports-export"
  | "profile";

export type AppAction =
  | "profile.update"
  | "promotion.create"
  | "promotion.update"
  | "promotion.delete"
  | "product.create"
  | "product.update"
  | "product.delete"
  | "price-list.create"
  | "price-list.update"
  | "price-list.delete"
  | "inventory.receipt.create"
  | "inventory.issue.create"
  | "inventory.adjustment.create"
  | "contract.approve"
  | "contract.submit"
  | "contract.update"
  | "contract.cancel"
  | "payment.record";

const normalizePath = (pathname: string): string => {
  if (!pathname) {
    return "/";
  }

  const pathWithoutQuery = pathname.split("?")[0]?.trim() ?? "/";

  if (pathWithoutQuery.length > 1 && pathWithoutQuery.endsWith("/")) {
    return pathWithoutQuery.slice(0, -1);
  }

  return pathWithoutQuery || "/";
};

const startsWithPath = (pathname: string, basePath: string): boolean => {
  const normalizedPath = normalizePath(pathname);
  const normalizedBase = normalizePath(basePath);
  return normalizedPath === normalizedBase || normalizedPath.startsWith(`${normalizedBase}/`);
};

const matchesPattern = (pathname: string, pattern: RegExp): boolean => pattern.test(normalizePath(pathname));

const ROLE_ALLOWED_PATH_PREFIXES: Record<UserRole, string[]> = {
  GUEST: [
    ROUTE_URL.LOGIN,
    ROUTE_URL.REGISTER,
    ROUTE_URL.VERIFY_REGISTRATION,
    ROUTE_URL.FORGOT_PASSWORD,
    ROUTE_URL.RESET_PASSWORD,
    ROUTE_URL.PRODUCT_LIST,
  ],
  CUSTOMER: [
    ROUTE_URL.PROFILE,
    ROUTE_URL.PRODUCT_LIST,
    ROUTE_URL.QUOTATION_LIST,
    ROUTE_URL.CONTRACT_LIST,
    ROUTE_URL.PROJECT_LIST,
    ROUTE_URL.PAYMENT_LIST,
    ROUTE_URL.PROMOTION_LIST,
  ],
  WAREHOUSE: [
    ROUTE_URL.PROFILE,
    ROUTE_URL.PRODUCT_LIST,
    ROUTE_URL.INVENTORY_STATUS,
    ROUTE_URL.REPORT_INVENTORY,
  ],
  ACCOUNTANT: [
    ROUTE_URL.PROFILE,
    ROUTE_URL.CUSTOMER_LIST,
    ROUTE_URL.QUOTATION_LIST,
    ROUTE_URL.CONTRACT_LIST,
    ROUTE_URL.PROJECT_LIST,
    ROUTE_URL.PAYMENT_LIST,
    ROUTE_URL.PROMOTION_LIST,
    ROUTE_URL.PRICE_LIST_LIST,
    ROUTE_URL.REPORT_SALES,
    ROUTE_URL.REPORT_PROJECT,
    ROUTE_URL.REPORT_FINANCIAL,
    ROUTE_URL.REPORT_EXPORT,
  ],
  OWNER: [
    ROUTE_URL.DASHBOARD,
    ROUTE_URL.PROFILE,
    ROUTE_URL.ACCOUNT_LIST,
    ROUTE_URL.PRICE_LIST_LIST,
    ROUTE_URL.PROMOTION_LIST,
    ROUTE_URL.CONTRACT_APPROVAL_LIST,
    ROUTE_URL.REPORT_SALES,
    ROUTE_URL.REPORT_PROJECT,
    ROUTE_URL.REPORT_FINANCIAL,
    ROUTE_URL.REPORT_EXPORT,
  ],
};

const ROLE_DENIED_PATH_PREFIXES: Partial<Record<UserRole, string[]>> = {
  GUEST: [ROUTE_URL.PRODUCT_CREATE],
  CUSTOMER: [
    ROUTE_URL.PRODUCT_CREATE,
    ROUTE_URL.PRICE_LIST_LIST,
    ROUTE_URL.CUSTOMER_LIST,
    ROUTE_URL.INVENTORY_STATUS,
    ROUTE_URL.DASHBOARD,
    ROUTE_URL.REPORT_SALES,
    ROUTE_URL.REPORT_INVENTORY,
    ROUTE_URL.REPORT_PROJECT,
    ROUTE_URL.REPORT_FINANCIAL,
    ROUTE_URL.REPORT_EXPORT,
    ROUTE_URL.PROMOTION_CREATE,
    ROUTE_URL.CONTRACT_APPROVAL_LIST,
  ],
  WAREHOUSE: [
    ROUTE_URL.DASHBOARD,
    ROUTE_URL.QUOTATION_LIST,
    ROUTE_URL.CONTRACT_LIST,
    ROUTE_URL.CUSTOMER_LIST,
    ROUTE_URL.PROJECT_LIST,
    ROUTE_URL.PAYMENT_LIST,
    ROUTE_URL.PROMOTION_LIST,
    ROUTE_URL.PRICE_LIST_LIST,
    ROUTE_URL.REPORT_SALES,
    ROUTE_URL.REPORT_PROJECT,
    ROUTE_URL.REPORT_FINANCIAL,
    ROUTE_URL.REPORT_EXPORT,
  ],
  ACCOUNTANT: [
    ROUTE_URL.DASHBOARD,
    ROUTE_URL.PRODUCT_LIST,
    ROUTE_URL.PRODUCT_CREATE,
    ROUTE_URL.INVENTORY_STATUS,
    ROUTE_URL.CONTRACT_APPROVAL_LIST,
    ROUTE_URL.PROMOTION_CREATE,
  ],
  OWNER: [
    ROUTE_URL.PRODUCT_LIST,
    ROUTE_URL.PRODUCT_CREATE,
    ROUTE_URL.INVENTORY_STATUS,
    ROUTE_URL.CUSTOMER_LIST,
    ROUTE_URL.QUOTATION_LIST,
    ROUTE_URL.CONTRACT_LIST,
    ROUTE_URL.PROJECT_LIST,
    ROUTE_URL.PAYMENT_LIST,
    ROUTE_URL.REPORT_INVENTORY,
  ],
};

const ROLE_DENIED_PATH_PATTERNS: Partial<Record<UserRole, RegExp[]>> = {
  GUEST: [/^\/products\/[^/]+\/edit$/],
  CUSTOMER: [
    /^\/products\/[^/]+\/edit$/,
    /^\/contracts\/create\/[^/]+$/,
    /^\/contracts\/[^/]+\/edit$/,
    /^\/projects\/create$/,
    /^\/projects\/[^/]+\/edit$/,
    /^\/projects\/[^/]+\/assign-warehouse$/,
    /^\/payments\/[^/]+\/record$/,
  ],
  ACCOUNTANT: [/^\/products\/[^/]+\/edit$/, /^\/promotions\/create$/],
  OWNER: [
    /^\/products\/[^/]+$/,
    /^\/products\/[^/]+\/edit$/,
    /^\/contracts\/create\/[^/]+$/,
    /^\/contracts\/[^/]+\/edit$/,
    /^\/projects\/create$/,
    /^\/projects\/[^/]+\/edit$/,
    /^\/projects\/[^/]+\/assign-warehouse$/,
    /^\/payments\/[^/]+\/record$/,
  ],
};

const ACTION_ROLE_MAP: Record<AppAction, UserRole[]> = {
  "profile.update": ["CUSTOMER", "WAREHOUSE", "ACCOUNTANT", "OWNER"],
  "promotion.create": ["OWNER"],
  "promotion.update": ["OWNER"],
  "promotion.delete": ["OWNER"],
  "product.create": ["WAREHOUSE"],
  "product.update": ["WAREHOUSE"],
  "product.delete": ["WAREHOUSE"],
  "price-list.create": ["OWNER"],
  "price-list.update": ["OWNER"],
  "price-list.delete": ["OWNER"],
  "inventory.receipt.create": ["WAREHOUSE"],
  "inventory.issue.create": ["WAREHOUSE"],
  "inventory.adjustment.create": ["WAREHOUSE"],
  "contract.approve": ["OWNER"],
  "contract.submit": ["ACCOUNTANT"],
  "contract.update": ["ACCOUNTANT"],
  "contract.cancel": ["ACCOUNTANT"],
  "payment.record": ["ACCOUNTANT"],
};

const MENU_ROLE_MAP: Record<MenuId, UserRole[]> = {
  dashboard: ["OWNER"],
  "user-management": ["OWNER"],
  "product-management": ["WAREHOUSE"],
  "price-list-management": ["ACCOUNTANT", "OWNER"],
  "promotion-management": ["CUSTOMER", "ACCOUNTANT", "OWNER"],
  "inventory-management": ["WAREHOUSE"],
  "quotation-management": ["CUSTOMER", "ACCOUNTANT"],
  "contract-management": ["CUSTOMER", "ACCOUNTANT"],
  "contract-approvals": ["OWNER"],
  "customer-management": ["ACCOUNTANT"],
  "project-management": ["CUSTOMER", "ACCOUNTANT"],
  "payment-management": ["CUSTOMER", "ACCOUNTANT"],
  "reports-sales": ["ACCOUNTANT", "OWNER"],
  "reports-project": ["ACCOUNTANT", "OWNER"],
  "reports-inventory": ["WAREHOUSE"],
  "reports-export": ["ACCOUNTANT", "OWNER"],
  profile: ["CUSTOMER", "WAREHOUSE", "ACCOUNTANT", "OWNER"],
};

export const getDefaultRouteByRole = (role: UserRole): string => {
  switch (role) {
    case "CUSTOMER":
      return ROUTE_URL.QUOTATION_LIST;
    case "ACCOUNTANT":
      return ROUTE_URL.CUSTOMER_LIST;
    case "WAREHOUSE":
      return ROUTE_URL.INVENTORY_STATUS;
    case "OWNER":
      return ROUTE_URL.DASHBOARD;
    default:
      return ROUTE_URL.LOGIN;
  }
};

export const canPerformAction = (role: UserRole | null | undefined, action: AppAction): boolean => {
  if (!role) {
    return false;
  }

  return ACTION_ROLE_MAP[action].includes(role);
};

export const canSeeMenu = (role: UserRole | null | undefined, menuId: MenuId): boolean => {
  if (!role) {
    return false;
  }

  return MENU_ROLE_MAP[menuId].includes(role);
};

export const canAccessPathByRole = (role: UserRole, pathname: string): boolean => {
  const deniedPrefixes = ROLE_DENIED_PATH_PREFIXES[role] ?? [];
  if (deniedPrefixes.some((deniedPath) => startsWithPath(pathname, deniedPath))) {
    return false;
  }

  const deniedPatterns = ROLE_DENIED_PATH_PATTERNS[role] ?? [];
  if (deniedPatterns.some((pattern) => matchesPattern(pathname, pattern))) {
    return false;
  }

  const allowedPrefixes = ROLE_ALLOWED_PATH_PREFIXES[role];
  return allowedPrefixes.some((allowedPath) => startsWithPath(pathname, allowedPath));
};
