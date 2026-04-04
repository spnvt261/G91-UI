import {
  BarChartOutlined,
  DashboardOutlined,
  DollarOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  InboxOutlined,
  ShoppingOutlined,
  TagsOutlined,
  TeamOutlined,
  UserOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import type { ReactNode } from "react";
import { canPerformAction, canSeeMenu, type AppAction, type MenuId } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import type { UserRole } from "../../models/auth/auth.model";
import type { SidebarNode } from "./SidebarItem";

type SidebarLeafId =
  | "dashboard"
  | "users"
  | "products"
  | "price-lists"
  | "promotions"
  | "quotations"
  | "contracts"
  | "contract-approvals"
  | "customers"
  | "projects"
  | "invoices"
  | "debts"
  | "payments"
  | "inventory-status"
  | "inventory-history"
  | "report-sales"
  | "report-inventory"
  | "report-export"
  | "report-financial-accountant"
  | "report-financial-owner";

type SidebarGroupId = "warehouse" | "reports-accountant" | "reports-owner";

type SidebarLayoutEntry =
  | {
      type: "leaf";
      id: SidebarLeafId;
    }
  | {
      type: "group";
      id: SidebarGroupId;
    };

interface SidebarLeafDefinition {
  id: SidebarLeafId;
  label: string;
  path: string;
  icon?: ReactNode;
  menuId?: MenuId;
  action?: AppAction;
  activeRoutePatterns?: string[];
  visible?: (role: UserRole) => boolean;
}

interface SidebarGroupDefinition {
  id: SidebarGroupId;
  label: string;
  icon?: ReactNode;
  menuId?: MenuId;
  action?: AppAction;
  children: SidebarLeafId[];
  flattenWhenSingleDestination?: boolean;
  visible?: (role: UserRole) => boolean;
}

interface SidebarVisibilityRule {
  menuId?: MenuId;
  action?: AppAction;
  visible?: (role: UserRole) => boolean;
}

const SIDEBAR_LEAF_DEFINITIONS: Record<SidebarLeafId, SidebarLeafDefinition> = {
  dashboard: {
    id: "dashboard",
    label: "Tổng quan",
    path: ROUTE_URL.DASHBOARD,
    icon: <DashboardOutlined />,
    menuId: "dashboard",
  },
  users: {
    id: "users",
    label: "Người dùng",
    path: ROUTE_URL.ACCOUNT_LIST,
    icon: <TeamOutlined />,
    menuId: "user-management",
  },
  products: {
    id: "products",
    label: "Sản phẩm",
    path: ROUTE_URL.PRODUCT_LIST,
    icon: <ShoppingOutlined />,
    menuId: "product-management",
  },
  "price-lists": {
    id: "price-lists",
    label: "Bảng giá",
    path: ROUTE_URL.PRICE_LIST_LIST,
    icon: <WalletOutlined />,
    menuId: "price-list-management",
  },
  promotions: {
    id: "promotions",
    label: "Khuyến mãi",
    path: ROUTE_URL.PROMOTION_LIST,
    icon: <TagsOutlined />,
    menuId: "promotion-management",
  },
  quotations: {
    id: "quotations",
    label: "Báo giá",
    path: ROUTE_URL.QUOTATION_LIST,
    icon: <FileTextOutlined />,
    menuId: "quotation-management",
  },
  contracts: {
    id: "contracts",
    label: "Hợp đồng",
    path: ROUTE_URL.CONTRACT_LIST,
    icon: <FileDoneOutlined />,
    menuId: "contract-management",
  },
  "contract-approvals": {
    id: "contract-approvals",
    label: "Duyệt hợp đồng",
    path: ROUTE_URL.CONTRACT_APPROVAL_LIST,
    icon: <FileDoneOutlined />,
    menuId: "contract-approvals",
  },
  customers: {
    id: "customers",
    label: "Khách hàng",
    path: ROUTE_URL.CUSTOMER_LIST,
    icon: <UserOutlined />,
    menuId: "customer-management",
  },
  projects: {
    id: "projects",
    label: "Dự án",
    path: ROUTE_URL.PROJECT_LIST,
    icon: <InboxOutlined />,
    menuId: "project-management",
  },
  invoices: {
    id: "invoices",
    label: "H\u00f3a \u0111\u01a1n",
    path: ROUTE_URL.INVOICE_LIST,
    icon: <FileTextOutlined />,
    menuId: "invoice-management",
  },
  debts: {
    id: "debts",
    label: "C\u00f4ng n\u1ee3",
    path: ROUTE_URL.DEBT_LIST,
    icon: <DollarOutlined />,
    menuId: "debt-management",
  },
  payments: {
    id: "payments",
    label: "Thanh to\u00e1n",
    path: ROUTE_URL.PAYMENT_LIST,
    icon: <DollarOutlined />,
    menuId: "payment-management",
    visible: (role) => role === "ACCOUNTANT",
  },
  "inventory-status": {
    id: "inventory-status",
    label: "Tồn kho",
    path: ROUTE_URL.INVENTORY_STATUS,
    menuId: "inventory-management",
  },
  "inventory-history": {
    id: "inventory-history",
    label: "Lịch sử kho",
    path: ROUTE_URL.INVENTORY_HISTORY,
    menuId: "inventory-management",
  },
  "report-sales": {
    id: "report-sales",
    label: "Báo cáo bán hàng",
    path: ROUTE_URL.REPORT_SALES,
    menuId: "reports-sales",
  },
  "report-inventory": {
    id: "report-inventory",
    label: "Báo cáo tồn kho",
    path: ROUTE_URL.REPORT_INVENTORY,
    icon: <BarChartOutlined />,
    menuId: "reports-inventory",
  },
  "report-export": {
    id: "report-export",
    label: "Xuất báo cáo",
    path: ROUTE_URL.REPORT_EXPORT,
    menuId: "reports-export",
  },
  "report-financial-accountant": {
    id: "report-financial-accountant",
    label: "Báo cáo tài chính / dự án",
    path: ROUTE_URL.REPORT_FINANCIAL,
    activeRoutePatterns: [ROUTE_URL.REPORT_PROJECT],
    visible: (role) =>
      role === "ACCOUNTANT" &&
      (canPerformAction(role, "project.financial-summary.view") || canSeeMenu(role, "reports-project")),
  },
  "report-financial-owner": {
    id: "report-financial-owner",
    label: "Báo cáo tài chính",
    path: ROUTE_URL.REPORT_FINANCIAL,
    activeRoutePatterns: [ROUTE_URL.REPORT_PROJECT],
    visible: (role) => role === "OWNER" && canPerformAction(role, "project.financial-summary.view"),
  },
};

const SIDEBAR_GROUP_DEFINITIONS: Record<SidebarGroupId, SidebarGroupDefinition> = {
  warehouse: {
    id: "warehouse",
    label: "Kho",
    icon: <InboxOutlined />,
    menuId: "inventory-management",
    children: ["inventory-status", "inventory-history"],
    flattenWhenSingleDestination: true,
  },
  "reports-accountant": {
    id: "reports-accountant",
    label: "Báo cáo",
    icon: <BarChartOutlined />,
    children: ["report-sales", "report-financial-accountant", "report-export"],
    flattenWhenSingleDestination: true,
  },
  "reports-owner": {
    id: "reports-owner",
    label: "Báo cáo",
    icon: <BarChartOutlined />,
    children: ["report-sales", "report-financial-owner", "report-export"],
    flattenWhenSingleDestination: true,
  },
};

const ROLE_SIDEBAR_LAYOUTS: Record<UserRole, SidebarLayoutEntry[]> = {
  GUEST: [],
  CUSTOMER: [
    { type: "leaf", id: "products" },
    { type: "leaf", id: "promotions" },
    { type: "leaf", id: "quotations" },
    { type: "leaf", id: "contracts" },
    { type: "leaf", id: "projects" },
    { type: "leaf", id: "invoices" },
    { type: "leaf", id: "debts" },
  ],
  ACCOUNTANT: [
    { type: "leaf", id: "price-lists" },
    { type: "leaf", id: "promotions" },
    { type: "leaf", id: "quotations" },
    { type: "leaf", id: "contracts" },
    { type: "leaf", id: "customers" },
    { type: "leaf", id: "projects" },
    { type: "leaf", id: "invoices" },
    { type: "leaf", id: "payments" },
    { type: "leaf", id: "debts" },
    { type: "group", id: "reports-accountant" },
  ],
  WAREHOUSE: [
    { type: "leaf", id: "products" },
    { type: "group", id: "warehouse" },
    { type: "leaf", id: "report-inventory" },
  ],
  OWNER: [
    { type: "leaf", id: "dashboard" },
    { type: "leaf", id: "users" },
    { type: "leaf", id: "price-lists" },
    { type: "leaf", id: "promotions" },
    { type: "leaf", id: "invoices" },
    { type: "leaf", id: "contract-approvals" },
    { type: "group", id: "reports-owner" },
  ],
};

export const CONTEXTUAL_ACTION_ROUTE_TEMPLATES = Object.freeze([
  ROUTE_URL.ACCOUNT_CREATE,
  ROUTE_URL.ACCOUNT_DETAIL,
  ROUTE_URL.ACCOUNT_EDIT,
  ROUTE_URL.PRODUCT_CREATE,
  ROUTE_URL.PRODUCT_DETAIL,
  ROUTE_URL.PRODUCT_EDIT,
  ROUTE_URL.PRICE_LIST_CREATE,
  ROUTE_URL.PRICE_LIST_DETAIL,
  ROUTE_URL.QUOTATION_CREATE,
  ROUTE_URL.QUOTATION_DETAIL,
  ROUTE_URL.PROMOTION_CREATE,
  ROUTE_URL.PROMOTION_DETAIL,
  ROUTE_URL.CONTRACT_CREATE,
  ROUTE_URL.CONTRACT_DETAIL,
  ROUTE_URL.CONTRACT_EDIT,
  ROUTE_URL.CONTRACT_TRACKING,
  ROUTE_URL.CONTRACT_APPROVAL_DETAIL,
  ROUTE_URL.CUSTOMER_CREATE,
  ROUTE_URL.CUSTOMER_DETAIL,
  ROUTE_URL.CUSTOMER_EDIT,
  ROUTE_URL.PROJECT_CREATE,
  ROUTE_URL.PROJECT_DETAIL,
  ROUTE_URL.PROJECT_EDIT,
  ROUTE_URL.PROJECT_ASSIGN_WAREHOUSE,
  ROUTE_URL.PROJECT_PROGRESS_UPDATE,
  ROUTE_URL.PROJECT_FINANCIAL_SUMMARY,
  ROUTE_URL.INVOICE_CREATE,
  ROUTE_URL.INVOICE_DETAIL,
  ROUTE_URL.INVOICE_EDIT,
  ROUTE_URL.DEBT_DETAIL,
  ROUTE_URL.PAYMENT_DETAIL,
  ROUTE_URL.PAYMENT_RECORD,
  ROUTE_URL.PAYMENT_RECORD_BY_INVOICE,
  ROUTE_URL.INVENTORY_RECEIPT_CREATE,
  ROUTE_URL.INVENTORY_ISSUE_CREATE,
  ROUTE_URL.INVENTORY_ADJUSTMENT_CREATE,
]);

const normalizePathTemplate = (path: string) => path.replace(/\/+$/, "") || "/";

const PERSISTENT_NAVIGATION_ROUTE_TEMPLATES = Object.freeze(
  [...new Set(Object.values(SIDEBAR_LEAF_DEFINITIONS).map((leaf) => normalizePathTemplate(leaf.path)))],
);

const PERSISTENT_NAVIGATION_ROUTE_SET = new Set(PERSISTENT_NAVIGATION_ROUTE_TEMPLATES);
const CONTEXTUAL_ACTION_ROUTE_SET = new Set(CONTEXTUAL_ACTION_ROUTE_TEMPLATES.map(normalizePathTemplate));
const CONTEXTUAL_ROUTE_HINTS = [/\/create(?:\/|$)/, /\/edit(?:\/|$)/, /\/:[^/]+(?:\/|$)/, /assign-warehouse(?:\/|$)/, /progress(?:\/|$)/, /record(?:\/|$)/];

const canShowByPermission = (role: UserRole, permissionRule: SidebarVisibilityRule) => {
  if (permissionRule.menuId && !canSeeMenu(role, permissionRule.menuId)) {
    return false;
  }

  if (permissionRule.action && !canPerformAction(role, permissionRule.action)) {
    return false;
  }

  if (permissionRule.visible && !permissionRule.visible(role)) {
    return false;
  }

  return true;
};

const buildLeafNode = (role: UserRole, leafId: SidebarLeafId): SidebarNode | null => {
  const leaf = SIDEBAR_LEAF_DEFINITIONS[leafId];
  if (!leaf) {
    return null;
  }

  if (!canShowByPermission(role, leaf)) {
    return null;
  }

  if (!isSidebarNavigableRoute(leaf.path)) {
    return null;
  }

  return {
    id: leaf.id,
    label: leaf.label,
    icon: leaf.icon,
    path: leaf.path,
    activeRoutePatterns: leaf.activeRoutePatterns,
  };
};

const buildGroupNode = (role: UserRole, groupId: SidebarGroupId): SidebarNode | null => {
  const group = SIDEBAR_GROUP_DEFINITIONS[groupId];
  if (!group) {
    return null;
  }

  if (!canShowByPermission(role, group)) {
    return null;
  }

  const visibleChildren = group.children
    .map((childId) => buildLeafNode(role, childId))
    .filter((node): node is SidebarNode => Boolean(node));

  if (visibleChildren.length === 0) {
    return null;
  }

  if (group.flattenWhenSingleDestination && visibleChildren.length === 1) {
    const [singleDestination] = visibleChildren;
    return {
      ...singleDestination,
      icon: group.icon ?? singleDestination.icon,
    };
  }

  return {
    id: group.id,
    label: group.label,
    icon: group.icon,
    children: visibleChildren,
  };
};

export const isSidebarNavigableRoute = (routeTemplate: string): boolean => {
  const normalized = normalizePathTemplate(routeTemplate);

  if (PERSISTENT_NAVIGATION_ROUTE_SET.has(normalized)) {
    return true;
  }

  if (CONTEXTUAL_ACTION_ROUTE_SET.has(normalized)) {
    return false;
  }

  if (CONTEXTUAL_ROUTE_HINTS.some((hint) => hint.test(normalized))) {
    return false;
  }

  return false;
};

export const getSidebarItemsForRole = (role: UserRole): SidebarLayoutEntry[] => ROLE_SIDEBAR_LAYOUTS[role] ?? [];

export const buildSidebarMenuByRole = (role: UserRole): SidebarNode[] =>
  getSidebarItemsForRole(role)
    .map((entry) => (entry.type === "leaf" ? buildLeafNode(role, entry.id) : buildGroupNode(role, entry.id)))
    .filter((node): node is SidebarNode => Boolean(node));

