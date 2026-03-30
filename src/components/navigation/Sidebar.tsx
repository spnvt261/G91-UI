import { InfoCircleOutlined } from "@ant-design/icons";
import { Dropdown, Empty, Menu, Space, Tag, Tooltip, Typography } from "antd";
import type { MenuProps } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import type { UserRole } from "../../models/auth/auth.model";
import type { RootState } from "../../store";
import { getStoredUserRole, normalizeUserRole } from "../../utils/authSession";
import {
  buildSidebarMenuItems,
  resolveSidebarActiveState,
  type SidebarNode,
} from "./SidebarItem";
import { buildSidebarMenuByRole } from "./sidebar.config";

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

  const menuNodes = useMemo(() => buildSidebarMenuByRole(role), [role]);
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

  const roleHintMenu: MenuProps["items"] = [
    {
      key: "role",
      label: `Vai trò hiện tại: ${ROLE_LABELS[role]}`,
      disabled: true,
    },
    {
      key: "hint",
      label: "Menu được cá nhân hóa theo quyền truy cập.",
      disabled: true,
    },
  ];

  return (
    <aside className={`app-sidebar flex h-full min-h-0 flex-col bg-white ${className}`.trim()}>
      <div className="app-sidebar__brand px-4 py-4">
        <Space align="start" size={12}>
          <Tooltip title="G91 Điều hành">
            <div className="app-sidebar__logo">
              <span>G91</span>
            </div>
          </Tooltip>
          {!collapsed ? (
            <Space orientation="vertical" size={2}>
              <Typography.Title level={5} style={{ margin: 0 }}>
                G91 Điều Hành
              </Typography.Title>
              <Dropdown menu={{ items: roleHintMenu }} trigger={["click"]}>
                <Tag className="app-sidebar__role-tag" color="blue" icon={<InfoCircleOutlined />}>
                  {ROLE_LABELS[role]}
                </Tag>
              </Dropdown>
            </Space>
          ) : (
            <Tooltip title={`Vai trò: ${ROLE_LABELS[role]}`}>
              <Tag className="app-sidebar__role-tag app-sidebar__role-tag--collapsed" color="blue" icon={<InfoCircleOutlined />} />
            </Tooltip>
          )}
        </Space>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-3">
        {menuItems.length > 0 ? (
          <Menu
            mode="inline"
            className="app-sidebar__menu border-0"
            inlineCollapsed={collapsed}
            triggerSubMenuAction="click"
            inlineIndent={18}
            items={menuItems}
            selectedKeys={selectedKeys}
            openKeys={collapsed ? [] : openKeys}
            onOpenChange={handleOpenChange}
            onClick={handleMenuClick}
          />
        ) : (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={<Typography.Text type="secondary">Tài khoản hiện tại chưa có menu điều hướng.</Typography.Text>}
          />
        )}
      </div>
    </aside>
  );
};

export default Sidebar;

