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
  | "sale-order-management"
  | "customer-management"
  | "project-management"
  | "invoice-management"
  | "debt-management"
  | "payment-management"
  | "reports-sales"
  | "reports-project"
  | "reports-inventory"
  | "reports-export"
  | "profile";

export type PermissionKey =
  | "auth.register"
  | "auth.login-logout"
  | "profile.manage"
  | "account.create"
  | "account.view"
  | "account.update"
  | "account.deactivate"
  | "product.view.list"
  | "product.view.detail"
  | "product.filter"
  | "product.search"
  | "product.create"
  | "product.update"
  | "product.delete"
  | "price-list.create"
  | "price-list.view"
  | "price-list.update"
  | "price-list.delete"
  | "promotion.create"
  | "promotion.view"
  | "promotion.update"
  | "promotion.delete"
  | "inventory.receipt.create"
  | "inventory.issue.create"
  | "inventory.adjustment.create"
  | "inventory.status.view"
  | "inventory.history.view"
  | "quotation.create"
  | "quotation.list.view"
  | "contract.create"
  | "contract.view"
  | "contract.update"
  | "contract.cancel"
  | "contract.submit"
  | "contract.track"
  | "contract.print"
  | "contract.approve"
  | "sale-order.view"
  | "sale-order.status.update"
  | "sale-order.fulfillment"
  | "sale-order.complete"
  | "sale-order.cancel"
  | "sale-order.create-invoice"
  | "customer.create"
  | "customer.view"
  | "customer.update"
  | "customer.delete-disable"
  | "project.create"
  | "project.view"
  | "project.update"
  | "project.delete"
  | "project.assign-warehouse"
  | "project.progress.update"
  | "project.milestone.confirm"
  | "project.financial-summary.view"
  | "project.close"
  | "invoice.create"
  | "invoice.view"
  | "invoice.update"
  | "invoice.cancel"
  | "payment.record"
  | "debt.view"
  | "payment.reminder.send"
  | "debt.settlement.confirm"
  | "report.sales.view"
  | "report.inventory.view"
  | "report.project.view"
  | "report.export"
  | "dashboard.view";

export type AppAction =
  | "profile.update"
  | "profile.change-password"
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
  | "quotation.create"
  | "contract.create"
  | "contract.approve"
  | "contract.submit"
  | "contract.update"
  | "contract.cancel"
  | "contract.print"
  | "sale-order.status.update"
  | "sale-order.fulfillment"
  | "sale-order.complete"
  | "sale-order.cancel"
  | "sale-order.create-invoice"
  | "customer.create"
  | "customer.update"
  | "customer.delete-disable"
  | "project.create"
  | "project.update"
  | "project.delete"
  | "project.assign-warehouse"
  | "project.progress.update"
  | "project.close"
  | "project.milestone.confirm"
  | "project.financial-summary.view"
  | "invoice.create"
  | "invoice.update"
  | "invoice.cancel"
  | "payment.record"
  | "payment.reminder.send"
  | "debt.settlement.confirm"
  | "report.export";

const AUTHENTICATED_ROLES: UserRole[] = ["CUSTOMER", "WAREHOUSE", "ACCOUNTANT", "OWNER"];
const PRODUCT_VIEW_ROLES: UserRole[] = ["GUEST", "CUSTOMER", "WAREHOUSE", "OWNER"];
const OWNER_ONLY: UserRole[] = ["OWNER"];
const ACCOUNTANT_OWNER: UserRole[] = ["ACCOUNTANT", "OWNER"];
const CUSTOMER_ACCOUNTANT: UserRole[] = ["CUSTOMER", "ACCOUNTANT"];
const CUSTOMER_ACCOUNTANT_OWNER: UserRole[] = ["CUSTOMER", "ACCOUNTANT", "OWNER"];
const WAREHOUSE_ONLY: UserRole[] = ["WAREHOUSE"];
const WAREHOUSE_OWNER: UserRole[] = ["WAREHOUSE", "OWNER"];
const WAREHOUSE_ACCOUNTANT_OWNER: UserRole[] = ["WAREHOUSE", "ACCOUNTANT", "OWNER"];
const ACCOUNTANT_ONLY: UserRole[] = ["ACCOUNTANT"];

const PERMISSION_ROLE_MAP: Record<PermissionKey, UserRole[]> = {
  "auth.register": ["GUEST"],
  "auth.login-logout": AUTHENTICATED_ROLES,
  "profile.manage": AUTHENTICATED_ROLES,
  "account.create": OWNER_ONLY,
  "account.view": OWNER_ONLY,
  "account.update": OWNER_ONLY,
  "account.deactivate": OWNER_ONLY,
  "product.view.list": PRODUCT_VIEW_ROLES,
  "product.view.detail": PRODUCT_VIEW_ROLES,
  "product.filter": PRODUCT_VIEW_ROLES,
  "product.search": PRODUCT_VIEW_ROLES,
  "product.create": WAREHOUSE_ONLY,
  "product.update": WAREHOUSE_ONLY,
  "product.delete": WAREHOUSE_ONLY,
  "price-list.create": OWNER_ONLY,
  "price-list.view": ACCOUNTANT_OWNER,
  "price-list.update": OWNER_ONLY,
  "price-list.delete": OWNER_ONLY,
  "promotion.create": OWNER_ONLY,
  "promotion.view": ["CUSTOMER", "ACCOUNTANT", "OWNER"],
  "promotion.update": OWNER_ONLY,
  "promotion.delete": OWNER_ONLY,
  "inventory.receipt.create": WAREHOUSE_ONLY,
  "inventory.issue.create": WAREHOUSE_ONLY,
  "inventory.adjustment.create": WAREHOUSE_ONLY,
  "inventory.status.view": WAREHOUSE_ONLY,
  "inventory.history.view": WAREHOUSE_ONLY,
  "quotation.create": ["CUSTOMER"],
  "quotation.list.view": CUSTOMER_ACCOUNTANT_OWNER,
  "contract.create": ACCOUNTANT_ONLY,
  "contract.view": CUSTOMER_ACCOUNTANT_OWNER,
  "contract.update": ACCOUNTANT_ONLY,
  "contract.cancel": ACCOUNTANT_ONLY,
  "contract.submit": ACCOUNTANT_ONLY,
  "contract.track": CUSTOMER_ACCOUNTANT_OWNER,
  "contract.print": ACCOUNTANT_ONLY,
  "contract.approve": OWNER_ONLY,
  "sale-order.view": AUTHENTICATED_ROLES,
  "sale-order.status.update": WAREHOUSE_ACCOUNTANT_OWNER,
  "sale-order.fulfillment": WAREHOUSE_OWNER,
  "sale-order.complete": ACCOUNTANT_OWNER,
  "sale-order.cancel": ACCOUNTANT_OWNER,
  "sale-order.create-invoice": ACCOUNTANT_OWNER,
  "customer.create": ACCOUNTANT_ONLY,
  "customer.view": ACCOUNTANT_ONLY,
  "customer.update": ACCOUNTANT_ONLY,
  "customer.delete-disable": ACCOUNTANT_ONLY,
  "project.create": ACCOUNTANT_ONLY,
  "project.view": CUSTOMER_ACCOUNTANT,
  "project.update": ACCOUNTANT_ONLY,
  "project.delete": ACCOUNTANT_ONLY,
  "project.assign-warehouse": ACCOUNTANT_ONLY,
  "project.progress.update": ACCOUNTANT_ONLY,
  "project.milestone.confirm": ["CUSTOMER"],
  "project.financial-summary.view": ACCOUNTANT_OWNER,
  "project.close": ACCOUNTANT_ONLY,
  "invoice.create": ACCOUNTANT_ONLY,
  "invoice.view": CUSTOMER_ACCOUNTANT_OWNER,
  "invoice.update": ACCOUNTANT_OWNER,
  "invoice.cancel": OWNER_ONLY,
  "payment.record": ACCOUNTANT_ONLY,
  "debt.view": CUSTOMER_ACCOUNTANT,
  "payment.reminder.send": ACCOUNTANT_ONLY,
  "debt.settlement.confirm": ACCOUNTANT_ONLY,
  "report.sales.view": ACCOUNTANT_OWNER,
  "report.inventory.view": ["WAREHOUSE", "OWNER"],
  "report.project.view": ACCOUNTANT_OWNER,
  "report.export": ACCOUNTANT_OWNER,
  "dashboard.view": OWNER_ONLY,
};

const ACTION_PERMISSION_MAP: Record<AppAction, PermissionKey> = {
  "profile.update": "profile.manage",
  "profile.change-password": "profile.manage",
  "promotion.create": "promotion.create",
  "promotion.update": "promotion.update",
  "promotion.delete": "promotion.delete",
  "product.create": "product.create",
  "product.update": "product.update",
  "product.delete": "product.delete",
  "price-list.create": "price-list.create",
  "price-list.update": "price-list.update",
  "price-list.delete": "price-list.delete",
  "inventory.receipt.create": "inventory.receipt.create",
  "inventory.issue.create": "inventory.issue.create",
  "inventory.adjustment.create": "inventory.adjustment.create",
  "quotation.create": "quotation.create",
  "contract.create": "contract.create",
  "contract.approve": "contract.approve",
  "contract.submit": "contract.submit",
  "contract.update": "contract.update",
  "contract.cancel": "contract.cancel",
  "contract.print": "contract.print",
  "sale-order.status.update": "sale-order.status.update",
  "sale-order.fulfillment": "sale-order.fulfillment",
  "sale-order.complete": "sale-order.complete",
  "sale-order.cancel": "sale-order.cancel",
  "sale-order.create-invoice": "sale-order.create-invoice",
  "customer.create": "customer.create",
  "customer.update": "customer.update",
  "customer.delete-disable": "customer.delete-disable",
  "project.create": "project.create",
  "project.update": "project.update",
  "project.delete": "project.delete",
  "project.assign-warehouse": "project.assign-warehouse",
  "project.progress.update": "project.progress.update",
  "project.close": "project.close",
  "project.milestone.confirm": "project.milestone.confirm",
  "project.financial-summary.view": "project.financial-summary.view",
  "invoice.create": "invoice.create",
  "invoice.update": "invoice.update",
  "invoice.cancel": "invoice.cancel",
  "payment.record": "payment.record",
  "payment.reminder.send": "payment.reminder.send",
  "debt.settlement.confirm": "debt.settlement.confirm",
  "report.export": "report.export",
};

const MENU_PERMISSION_MAP: Record<MenuId, PermissionKey> = {
  dashboard: "dashboard.view",
  "user-management": "account.view",
  "product-management": "product.view.list",
  "price-list-management": "price-list.view",
  "promotion-management": "promotion.view",
  "inventory-management": "inventory.status.view",
  "quotation-management": "quotation.list.view",
  "contract-management": "contract.view",
  "contract-approvals": "contract.approve",
  "sale-order-management": "sale-order.view",
  "customer-management": "customer.view",
  "project-management": "project.view",
  "invoice-management": "invoice.view",
  "debt-management": "debt.view",
  "payment-management": "payment.record",
  "reports-sales": "report.sales.view",
  "reports-project": "report.project.view",
  "reports-inventory": "report.inventory.view",
  "reports-export": "report.export",
  profile: "profile.manage",
};

interface RoutePermissionRule {
  path: string;
  permission: PermissionKey;
}

const PROTECTED_ROUTE_RULES: RoutePermissionRule[] = [
  { path: ROUTE_URL.DASHBOARD, permission: "dashboard.view" },
  { path: ROUTE_URL.PROFILE, permission: "profile.manage" },
  { path: ROUTE_URL.CHANGE_PASSWORD, permission: "profile.manage" },
  { path: ROUTE_URL.ACCOUNT_LIST, permission: "account.view" },

  { path: ROUTE_URL.PRODUCT_CREATE, permission: "product.create" },
  { path: ROUTE_URL.PRODUCT_EDIT, permission: "product.update" },
  { path: ROUTE_URL.PRODUCT_DETAIL, permission: "product.view.detail" },
  { path: ROUTE_URL.PRODUCT_LIST, permission: "product.view.list" },

  { path: ROUTE_URL.PRICE_LIST_CREATE, permission: "price-list.create" },
  { path: ROUTE_URL.PRICE_LIST_DETAIL, permission: "price-list.view" },
  { path: ROUTE_URL.PRICE_LIST_LIST, permission: "price-list.view" },

  { path: ROUTE_URL.QUOTATION_CREATE, permission: "quotation.create" },
  { path: ROUTE_URL.QUOTATION_DETAIL, permission: "quotation.list.view" },
  { path: ROUTE_URL.QUOTATION_LIST, permission: "quotation.list.view" },

  { path: ROUTE_URL.PROMOTION_CREATE, permission: "promotion.create" },
  { path: ROUTE_URL.PROMOTION_DETAIL, permission: "promotion.view" },
  { path: ROUTE_URL.PROMOTION_LIST, permission: "promotion.view" },

  { path: ROUTE_URL.CONTRACT_CREATE, permission: "contract.create" },
  { path: ROUTE_URL.CONTRACT_EDIT, permission: "contract.update" },
  { path: ROUTE_URL.CONTRACT_TRACKING, permission: "contract.track" },
  { path: ROUTE_URL.CONTRACT_DETAIL, permission: "contract.view" },
  { path: ROUTE_URL.CONTRACT_LIST, permission: "contract.view" },
  { path: ROUTE_URL.CONTRACT_APPROVAL_DETAIL, permission: "contract.approve" },
  { path: ROUTE_URL.CONTRACT_APPROVAL_LIST, permission: "contract.approve" },

  { path: ROUTE_URL.SALE_ORDER_LIST, permission: "sale-order.view" },
  { path: ROUTE_URL.SALE_ORDER_DETAIL, permission: "sale-order.view" },
  { path: ROUTE_URL.SALE_ORDER_TIMELINE, permission: "sale-order.view" },

  { path: ROUTE_URL.CUSTOMER_CREATE, permission: "customer.create" },
  { path: ROUTE_URL.CUSTOMER_EDIT, permission: "customer.update" },
  { path: ROUTE_URL.CUSTOMER_DETAIL, permission: "customer.view" },
  { path: ROUTE_URL.CUSTOMER_LIST, permission: "customer.view" },

  { path: ROUTE_URL.PROJECT_CREATE, permission: "project.create" },
  { path: ROUTE_URL.PROJECT_EDIT, permission: "project.update" },
  { path: ROUTE_URL.PROJECT_ASSIGN_WAREHOUSE, permission: "project.assign-warehouse" },
  { path: ROUTE_URL.PROJECT_PROGRESS_UPDATE, permission: "project.progress.update" },
  { path: ROUTE_URL.PROJECT_FINANCIAL_SUMMARY, permission: "project.financial-summary.view" },
  { path: ROUTE_URL.PROJECT_DETAIL, permission: "project.view" },
  { path: ROUTE_URL.PROJECT_LIST, permission: "project.view" },

  { path: ROUTE_URL.INVOICE_CREATE, permission: "invoice.create" },
  { path: ROUTE_URL.INVOICE_EDIT, permission: "invoice.update" },
  { path: ROUTE_URL.INVOICE_DETAIL, permission: "invoice.view" },
  { path: ROUTE_URL.INVOICE_LIST, permission: "invoice.view" },

  { path: ROUTE_URL.PAYMENT_RECORD, permission: "payment.record" },
  { path: ROUTE_URL.PAYMENT_RECORD_BY_INVOICE, permission: "payment.record" },
  { path: ROUTE_URL.PAYMENT_DETAIL, permission: "payment.record" },
  { path: ROUTE_URL.PAYMENT_LIST, permission: "payment.record" },

  { path: ROUTE_URL.DEBT_DETAIL, permission: "debt.view" },
  { path: ROUTE_URL.DEBT_LIST, permission: "debt.view" },

  { path: ROUTE_URL.INVENTORY_RECEIPT_CREATE, permission: "inventory.receipt.create" },
  { path: ROUTE_URL.INVENTORY_ISSUE_CREATE, permission: "inventory.issue.create" },
  { path: ROUTE_URL.INVENTORY_ADJUSTMENT_CREATE, permission: "inventory.adjustment.create" },
  { path: ROUTE_URL.INVENTORY_HISTORY, permission: "inventory.history.view" },
  { path: ROUTE_URL.INVENTORY_STATUS, permission: "inventory.status.view" },

  { path: ROUTE_URL.REPORT_SALES, permission: "report.sales.view" },
  { path: ROUTE_URL.REPORT_INVENTORY, permission: "report.inventory.view" },
  { path: ROUTE_URL.REPORT_PROJECT, permission: "report.project.view" },
  { path: ROUTE_URL.REPORT_FINANCIAL, permission: "project.financial-summary.view" },
  { path: ROUTE_URL.REPORT_EXPORT, permission: "report.export" },
];

const GUEST_PUBLIC_ROUTES = [
  ROUTE_URL.LOGIN,
  ROUTE_URL.REGISTER,
  ROUTE_URL.VERIFY_REGISTRATION,
  ROUTE_URL.FORGOT_PASSWORD,
  ROUTE_URL.RESET_PASSWORD,
];

const escapeRegex = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizePath = (pathname: string): string => {
  if (!pathname) {
    return "/";
  }

  const withoutQuery = pathname.split("?")[0]?.trim() ?? "/";
  if (withoutQuery.length > 1 && withoutQuery.endsWith("/")) {
    return withoutQuery.slice(0, -1);
  }

  return withoutQuery || "/";
};

const routeTemplateToRegex = (template: string): RegExp => {
  const normalized = normalizePath(template);
  if (normalized === "/") {
    return /^\/$/;
  }

  const pattern = normalized
    .split("/")
    .map((segment) => {
      if (!segment) {
        return "";
      }

      if (segment.startsWith(":")) {
        return "[^/]+";
      }

      return escapeRegex(segment);
    })
    .join("/");

  return new RegExp(`^${pattern}$`);
};

const isRouteMatch = (pathname: string, template: string): boolean => routeTemplateToRegex(template).test(normalizePath(pathname));

const resolveRoutePermission = (pathname: string): PermissionKey | null => {
  const matched = PROTECTED_ROUTE_RULES.find((rule) => isRouteMatch(pathname, rule.path));
  return matched?.permission ?? null;
};

export const hasPermission = (role: UserRole | null | undefined, permission: PermissionKey): boolean => {
  if (!role) {
    return false;
  }

  return PERMISSION_ROLE_MAP[permission].includes(role);
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
  const permission = ACTION_PERMISSION_MAP[action];
  return hasPermission(role, permission);
};

export const canSeeMenu = (role: UserRole | null | undefined, menuId: MenuId): boolean => {
  const permission = MENU_PERMISSION_MAP[menuId];
  return hasPermission(role, permission);
};

export const canViewMenu = canSeeMenu;

export const canAccessPathByRole = (role: UserRole, pathname: string): boolean => {
  if (GUEST_PUBLIC_ROUTES.some((route) => isRouteMatch(pathname, route))) {
    return role === "GUEST";
  }

  // Guests are only allowed on explicit public auth routes.
  if (role === "GUEST") {
    return false;
  }

  const permission = resolveRoutePermission(pathname);
  if (!permission) {
    return false;
  }

  return hasPermission(role, permission);
};

export const canAccessRoute = canAccessPathByRole;
