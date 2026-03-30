import { useEffect, useMemo, useState } from "react";
import { Menu, Space, Tag, Typography, Empty } from "antd";
import {
  BarChartOutlined,
  DashboardOutlined,
  DollarOutlined,
  FileTextOutlined,
  ProjectOutlined,
  ShoppingOutlined,
  TagsOutlined,
  TeamOutlined,
  UserOutlined,
  WalletOutlined,
} from "@ant-design/icons";
import type { MenuProps } from "antd";
import { useSelector } from "react-redux";
import { ROUTE_URL } from "../../const/route_url.const";
import type { RootState } from "../../store";
import { getStoredUserRole, normalizeUserRole } from "../../utils/authSession";
import { canPerformAction, canSeeMenu } from "../../const/authz.const";
import type { UserRole } from "../../models/auth/auth.model";
import {
  buildSidebarMenuItems,
  resolveSidebarActiveState,
  type SidebarNode,
} from "./SidebarItem";

interface SidebarProps {
  collapsed?: boolean;
  activePath?: string;
  onNavigate?: (path: string) => void;
  className?: string;
}

const ROLE_LABELS: Record<UserRole, string> = {
  GUEST: "Khách",
  CUSTOMER: "Khách hàng",
  ACCOUNTANT: "Kế toán",
  WAREHOUSE: "Kho",
  OWNER: "Quản trị",
};

const buildMenuByRole = (role: UserRole): SidebarNode[] => {
  const nodes: SidebarNode[] = [];

  if (canSeeMenu(role, "dashboard")) {
    nodes.push({
      id: "dashboard",
      label: "Tổng quan",
      description: "Bảng điều khiển",
      icon: <DashboardOutlined />,
      path: ROUTE_URL.DASHBOARD,
    });
  }

  if (canSeeMenu(role, "user-management")) {
    nodes.push({
      id: "users",
      label: "Người dùng",
      icon: <TeamOutlined />,
      children: [
        {
          id: "users-list",
          label: "Danh sách tài khoản",
          path: ROUTE_URL.ACCOUNT_LIST,
        },
      ],
    });
  }

  if (canSeeMenu(role, "product-management")) {
    nodes.push({
      id: "products",
      label: "Sản phẩm",
      icon: <ShoppingOutlined />,
      children: [
        { id: "product-list", label: "Danh sách sản phẩm", path: ROUTE_URL.PRODUCT_LIST },
        ...(canPerformAction(role, "product.create")
          ? [{ id: "product-create", label: "Tạo sản phẩm", path: ROUTE_URL.PRODUCT_CREATE }]
          : []),
      ],
    });
  }

  if (canSeeMenu(role, "price-list-management")) {
    nodes.push({
      id: "price-lists",
      label: "Bảng giá",
      icon: <WalletOutlined />,
      children: [
        { id: "price-list-list", label: "Danh sách bảng giá", path: ROUTE_URL.PRICE_LIST_LIST },
        ...(canPerformAction(role, "price-list.create")
          ? [{ id: "price-list-create", label: "Tạo bảng giá", path: ROUTE_URL.PRICE_LIST_CREATE }]
          : []),
      ],
    });
  }

  if (canSeeMenu(role, "promotion-management")) {
    nodes.push({
      id: "promotions",
      label: "Khuyến mãi",
      icon: <TagsOutlined />,
      children: [
        { id: "promotion-list", label: "Danh sách khuyến mãi", path: ROUTE_URL.PROMOTION_LIST },
        ...(canPerformAction(role, "promotion.create")
          ? [{ id: "promotion-create", label: "Tạo khuyến mãi", path: ROUTE_URL.PROMOTION_CREATE }]
          : []),
      ],
    });
  }

  if (canSeeMenu(role, "inventory-management")) {
    nodes.push({
      id: "inventory",
      label: "Kho vận",
      icon: <ProjectOutlined />,
      children: [
        { id: "inventory-status", label: "Tồn kho hiện tại", path: ROUTE_URL.INVENTORY_STATUS },
        { id: "inventory-receipt", label: "Nhập kho", path: ROUTE_URL.INVENTORY_RECEIPT_CREATE },
        { id: "inventory-issue", label: "Xuất kho", path: ROUTE_URL.INVENTORY_ISSUE_CREATE },
        { id: "inventory-adjustment", label: "Điều chỉnh kho", path: ROUTE_URL.INVENTORY_ADJUSTMENT_CREATE },
        { id: "inventory-history", label: "Lịch sử kho", path: ROUTE_URL.INVENTORY_HISTORY },
      ],
    });
  }

  if (canSeeMenu(role, "quotation-management")) {
    nodes.push({
      id: "quotations",
      label: "Báo giá",
      icon: <FileTextOutlined />,
      children: [
        { id: "quotation-list", label: "Danh sách báo giá", path: ROUTE_URL.QUOTATION_LIST },
        ...(canPerformAction(role, "quotation.create")
          ? [{ id: "quotation-create", label: "Tạo báo giá", path: ROUTE_URL.QUOTATION_CREATE }]
          : []),
      ],
    });
  }

  if (canSeeMenu(role, "contract-management")) {
    nodes.push({
      id: "contracts",
      label: "Hợp đồng",
      icon: <FileTextOutlined />,
      children: [{ id: "contract-list", label: "Danh sách hợp đồng", path: ROUTE_URL.CONTRACT_LIST }],
    });
  }

  if (canSeeMenu(role, "contract-approvals")) {
    nodes.push({
      id: "contract-approvals",
      label: "Phê duyệt",
      icon: <FileTextOutlined />,
      children: [
        {
          id: "contract-approvals-list",
          label: "Hợp đồng chờ duyệt",
          path: ROUTE_URL.CONTRACT_APPROVAL_LIST,
          badgeText: "Mới",
        },
      ],
    });
  }

  if (canSeeMenu(role, "customer-management")) {
    nodes.push({
      id: "customers",
      label: "Khách hàng",
      icon: <UserOutlined />,
      children: [
        { id: "customer-list", label: "Danh sách khách hàng", path: ROUTE_URL.CUSTOMER_LIST },
        ...(canPerformAction(role, "customer.create")
          ? [{ id: "customer-create", label: "Tạo khách hàng", path: ROUTE_URL.CUSTOMER_CREATE }]
          : []),
      ],
    });
  }

  if (canSeeMenu(role, "project-management")) {
    nodes.push({
      id: "projects",
      label: "Dự án",
      icon: <ProjectOutlined />,
      children: [
        { id: "project-list", label: "Danh sách dự án", path: ROUTE_URL.PROJECT_LIST },
        ...(canPerformAction(role, "project.create")
          ? [{ id: "project-create", label: "Tạo dự án", path: ROUTE_URL.PROJECT_CREATE }]
          : []),
      ],
    });
  }

  if (canSeeMenu(role, "payment-management")) {
    nodes.push({
      id: "payments",
      label: "Công nợ",
      icon: <DollarOutlined />,
      children: [{ id: "payment-list", label: "Theo dõi thanh toán", path: ROUTE_URL.PAYMENT_LIST }],
    });
  }

  const reportChildren: SidebarNode[] = [];
  if (canSeeMenu(role, "reports-sales")) {
    reportChildren.push({ id: "reports-sales", label: "Báo cáo doanh số", path: ROUTE_URL.REPORT_SALES });
  }
  if (canSeeMenu(role, "reports-project")) {
    reportChildren.push({ id: "reports-project", label: "Báo cáo dự án", path: ROUTE_URL.REPORT_PROJECT });
  }
  if (canSeeMenu(role, "reports-inventory")) {
    reportChildren.push({ id: "reports-inventory", label: "Báo cáo tồn kho", path: ROUTE_URL.REPORT_INVENTORY });
  }
  if (canSeeMenu(role, "reports-export")) {
    reportChildren.push({ id: "reports-export", label: "Báo cáo xuất dữ liệu", path: ROUTE_URL.REPORT_EXPORT });
  }
  if (canPerformAction(role, "project.financial-summary.view")) {
    reportChildren.push({ id: "reports-financial", label: "Báo cáo tài chính", path: ROUTE_URL.REPORT_FINANCIAL });
  }

  if (reportChildren.length > 0) {
    nodes.push({
      id: "reports",
      label: "Báo cáo",
      icon: <BarChartOutlined />,
      children: reportChildren,
    });
  }

  return nodes;
};

const collectParentKeys = (nodes: SidebarNode[]): Set<string> => {
  const keys = new Set<string>();

  const visit = (node: SidebarNode) => {
    if (node.children?.length) {
      keys.add(node.path ?? node.id);
      node.children.forEach(visit);
    }
  };

  nodes.forEach(visit);
  return keys;
};

const Sidebar = ({ collapsed = false, activePath, onNavigate, className = "" }: SidebarProps) => {
  const roleFromState = useSelector((state: RootState) => normalizeUserRole(state.auth.user?.role));
  const role = roleFromState ?? getStoredUserRole() ?? "CUSTOMER";

  const menuNodes = useMemo(() => buildMenuByRole(role), [role]);
  const menuItems = useMemo(() => buildSidebarMenuItems(menuNodes, collapsed), [collapsed, menuNodes]);
  const { selectedKeys, openKeys: defaultOpenKeys } = useMemo(
    () => resolveSidebarActiveState(menuNodes, activePath),
    [activePath, menuNodes],
  );
  const parentKeySet = useMemo(() => collectParentKeys(menuNodes), [menuNodes]);
  const [openKeys, setOpenKeys] = useState<string[]>(defaultOpenKeys);

  useEffect(() => {
    if (!collapsed) {
      setOpenKeys(defaultOpenKeys);
    }
  }, [collapsed, defaultOpenKeys]);

  const handleOpenChange: MenuProps["onOpenChange"] = (keys) => {
    setOpenKeys(keys.map(String).filter((key) => parentKeySet.has(key)));
  };

  const handleMenuClick: MenuProps["onClick"] = ({ key }) => {
    if (typeof key !== "string") {
      return;
    }

    if (key.startsWith("/")) {
      onNavigate?.(key);
    }
  };

  return (
    <aside
      className={`app-sidebar flex h-full min-h-0 flex-col border-r border-slate-200 bg-white ${className}`.trim()}
    >
      <div className="app-sidebar__brand border-b border-slate-200 px-4 py-4">
        <Space align="start" size={12}>
          <div className="app-sidebar__logo">
            <span>G91</span>
          </div>
          {!collapsed ? (
            <Space direction="vertical" size={2}>
              <Typography.Title level={5} style={{ margin: 0 }}>
                G91 Điều Hành
              </Typography.Title>
              <Tag color="blue">{ROLE_LABELS[role]}</Tag>
            </Space>
          ) : null}
        </Space>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {menuItems.length > 0 ? (
          <Menu
            mode="inline"
            className="app-sidebar__menu border-0"
            inlineCollapsed={collapsed}
            items={menuItems}
            selectedKeys={selectedKeys}
            openKeys={collapsed ? [] : openKeys}
            onOpenChange={handleOpenChange}
            onClick={handleMenuClick}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              <Typography.Text type="secondary">
                Tài khoản hiện tại chưa được cấp menu thao tác.
              </Typography.Text>
            }
          />
        )}
      </div>
    </aside>
  );
};

export default Sidebar;
