import { useMemo, useState } from "react";
import SidebarItem, { type SidebarNode } from "./SidebarItem";
import { ROUTE_URL } from "../../const/route_url.const";
import {
  BarChartOutlined,
  DollarOutlined,
  FileTextOutlined,
  HomeOutlined,
  ProjectOutlined,
  ShoppingOutlined,
  TagsOutlined,
  UserOutlined,
  UsergroupAddOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import { getStoredUserRole } from "../../utils/authSession";
import { canPerformAction, canSeeMenu } from "../../const/authz.const";
import type { UserRole } from "../../models/auth/auth.model";

interface SidebarProps {
  collapsed?: boolean;
  activePath?: string;
  onNavigate?: (path: string) => void;
  className?: string;
}

const buildMenuByRole = (role: UserRole): SidebarNode[] => {
  const nodes: SidebarNode[] = [];

  if (canSeeMenu(role, "dashboard")) {
    nodes.push({ id: "dashboard", label: "Dashboard", icon: <HomeOutlined />, path: ROUTE_URL.DASHBOARD });
  }

  if (canSeeMenu(role, "user-management")) {
    nodes.push({
      id: "users",
      label: "User Management",
      icon: <UsergroupAddOutlined />,
      children: [{ id: "users-list", label: "User Accounts", path: ROUTE_URL.ACCOUNT_LIST }],
    });
  }

  if (canSeeMenu(role, "product-management")) {
    nodes.push({
      id: "products",
      label: "Product Management",
      icon: <ShoppingOutlined />,
      children: [
        { id: "product-list", label: "Product List", path: ROUTE_URL.PRODUCT_LIST },
        ...(canPerformAction(role, "product.create") ? [{ id: "product-create", label: "Create Product", path: ROUTE_URL.PRODUCT_CREATE }] : []),
      ],
    });
  }

  if (canSeeMenu(role, "price-list-management")) {
    nodes.push({
      id: "price-lists",
      label: "Price Lists",
      icon: <WalletOutlined />,
      children: [
        { id: "price-list-list", label: "Price List", path: ROUTE_URL.PRICE_LIST_LIST },
        ...(canPerformAction(role, "price-list.create")
          ? [{ id: "price-list-create", label: "Create Price List", path: ROUTE_URL.PRICE_LIST_CREATE }]
          : []),
      ],
    });
  }

  if (canSeeMenu(role, "promotion-management")) {
    nodes.push({
      id: "promotions",
      label: "Promotion Management",
      icon: <TagsOutlined />,
      children: [
        { id: "promotion-list", label: "Promotion List", path: ROUTE_URL.PROMOTION_LIST },
        ...(canPerformAction(role, "promotion.create")
          ? [{ id: "promotion-create", label: "Create Promotion", path: ROUTE_URL.PROMOTION_CREATE }]
          : []),
      ],
    });
  }

  if (canSeeMenu(role, "inventory-management")) {
    nodes.push({
      id: "inventory",
      label: "Inventory Management",
      icon: <ProjectOutlined />,
      children: [
        { id: "inventory-status", label: "Inventory Status", path: ROUTE_URL.INVENTORY_STATUS },
        { id: "inventory-receipt", label: "Create Receipt", path: ROUTE_URL.INVENTORY_RECEIPT_CREATE },
        { id: "inventory-issue", label: "Create Issue", path: ROUTE_URL.INVENTORY_ISSUE_CREATE },
        { id: "inventory-adjustment", label: "Adjust Inventory", path: ROUTE_URL.INVENTORY_ADJUSTMENT_CREATE },
        { id: "inventory-history", label: "Inventory History", path: ROUTE_URL.INVENTORY_HISTORY },
      ],
    });
  }

  if (canSeeMenu(role, "quotation-management")) {
    nodes.push({
      id: "quotations",
      label: "Quotation Management",
      icon: <FileTextOutlined />,
      children: [
        { id: "quotation-list", label: "Quotation List", path: ROUTE_URL.QUOTATION_LIST },
        ...(role === "CUSTOMER" ? [{ id: "quotation-create", label: "Create Quotation", path: ROUTE_URL.QUOTATION_CREATE }] : []),
      ],
    });
  }

  if (canSeeMenu(role, "contract-management")) {
    nodes.push({
      id: "contracts",
      label: "Contract Management",
      icon: <FileTextOutlined />,
      children: [{ id: "contract-list", label: "Contract List", path: ROUTE_URL.CONTRACT_LIST }],
    });
  }

  if (canSeeMenu(role, "contract-approvals")) {
    nodes.push({
      id: "contract-approvals",
      label: "Contract Approvals",
      icon: <FileTextOutlined />,
      children: [{ id: "contract-approvals-list", label: "Pending Contracts", path: ROUTE_URL.CONTRACT_APPROVAL_LIST }],
    });
  }

  if (canSeeMenu(role, "customer-management")) {
    nodes.push({
      id: "customers",
      label: "Customer Management",
      icon: <UserOutlined />,
      children: [
        { id: "customer-list", label: "Customer List", path: ROUTE_URL.CUSTOMER_LIST },
        { id: "customer-create", label: "Create Customer", path: ROUTE_URL.CUSTOMER_CREATE },
      ],
    });
  }

  if (canSeeMenu(role, "project-management")) {
    nodes.push({
      id: "projects",
      label: "Project Management",
      icon: <ProjectOutlined />,
      children: [
        { id: "project-list", label: "Project List", path: ROUTE_URL.PROJECT_LIST },
        ...(role === "ACCOUNTANT" ? [{ id: "project-create", label: "Create Project", path: ROUTE_URL.PROJECT_CREATE }] : []),
      ],
    });
  }

  if (canSeeMenu(role, "payment-management")) {
    nodes.push({
      id: "payments",
      label: "Invoice & Debt",
      icon: <DollarOutlined />,
      children: [{ id: "payment-list", label: "Payments", path: ROUTE_URL.PAYMENT_LIST }],
    });
  }

  const reportChildren: SidebarNode[] = [];
  if (canSeeMenu(role, "reports-sales")) {
    reportChildren.push({ id: "reports-sales", label: "Sales Report", path: ROUTE_URL.REPORT_SALES });
  }
  if (canSeeMenu(role, "reports-project")) {
    reportChildren.push({ id: "reports-project", label: "Project Report", path: ROUTE_URL.REPORT_PROJECT });
  }
  if (canSeeMenu(role, "reports-inventory")) {
    reportChildren.push({ id: "reports-inventory", label: "Inventory Report", path: ROUTE_URL.REPORT_INVENTORY });
  }
  if (canSeeMenu(role, "reports-export")) {
    reportChildren.push({ id: "reports-export", label: "Export Report", path: ROUTE_URL.REPORT_EXPORT });
  }

  if (reportChildren.length > 0) {
    nodes.push({
      id: "reports",
      label: "Reports",
      icon: <BarChartOutlined />,
      children: reportChildren,
    });
  }

  if (canSeeMenu(role, "profile")) {
    nodes.push({ id: "profile", label: "Profile", icon: <UserOutlined />, path: ROUTE_URL.PROFILE });
  }

  return nodes;
};

const Sidebar = ({ collapsed = false, activePath, onNavigate, className = "" }: SidebarProps) => {
  const [selectedPath, setSelectedPath] = useState(activePath ?? "/");
  const roleFromState = useSelector((state: RootState) => state.auth.user?.role);
  const role = roleFromState ?? getStoredUserRole() ?? "CUSTOMER";

  const currentPath = useMemo(() => activePath ?? selectedPath, [activePath, selectedPath]);
  const visibleMenuItems = useMemo(() => buildMenuByRole(role), [role]);

  return (
    <aside
      className={`flex h-full flex-col bg-gradient-to-b from-blue-950 via-blue-900 to-slate-800 text-white transition-all ${
        collapsed ? "w-20" : "w-72"
      } ${className}`.trim()}
    >
      <div className="border-b border-white/10 px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-white/20 p-2">
            <svg viewBox="0 0 24 24" className="h-full w-full" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 2 3 6v6c0 5.3 3.8 9.7 9 10 5.2-.3 9-4.7 9-10V6l-9-4Z" />
              <path d="M8 10h8M8 14h6" />
            </svg>
          </div>
          {!collapsed ? (
            <div>
              <p className="text-xl font-semibold">ERP SYSTEM</p>
              <p className="text-xs text-blue-200">G90 Steel Business Management</p>
            </div>
          ) : null}
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto p-3">
        <ul className="space-y-1">
          {visibleMenuItems.map((item) => (
            <SidebarItem
              key={item.id}
              item={item}
              activePath={currentPath}
              collapsed={collapsed}
              onNavigate={(path) => {
                setSelectedPath(path);
                onNavigate?.(path);
              }}
            />
          ))}
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
