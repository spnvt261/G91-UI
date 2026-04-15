import { Button, Layout, Space, Typography, Tooltip } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { useLocation } from "react-router-dom";
import NotificationBell from "./NotificationBell";
import UserAvatarDropdown from "./UserAvatarDropdown";
import { getPageContextByPath } from "./AppBreadcrumb";

interface TopNavbarProps {
  onToggleSidebar?: () => void;
  sidebarCollapsed?: boolean;
  fixedLeft?: number;
  headerHeight?: number;
}

const TopNavbar = ({
  onToggleSidebar,
  sidebarCollapsed = false,
  fixedLeft = 0,
  headerHeight = 72,
}: TopNavbarProps) => {
  const { pathname } = useLocation();
  const pageContext = getPageContextByPath(pathname);

  return (
    <Layout.Header
      className="app-top-navbar border-b border-slate-200 bg-white px-4 py-0 md:px-6"
      style={{ left: fixedLeft, right: 0, height: headerHeight }}
    >
      <div className="flex h-full min-h-0 w-full items-center justify-between gap-4">
        <div className="app-top-navbar__left flex min-w-0 flex-1 items-center gap-3">
          <Tooltip title={sidebarCollapsed ? "Mở thanh điều hướng" : "Thu gọn thanh điều hướng"}>
            <Button
              type="text"
              shape="circle"
              icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={onToggleSidebar}
              aria-label="Chuyển trạng thái thanh điều hướng"
            />
          </Tooltip>

          <Space orientation="vertical" size={0} className="app-top-navbar__title-wrap min-w-0 flex-1 overflow-hidden">
            <Typography.Text className="app-top-navbar__context">Không gian làm việc</Typography.Text>
            <Typography.Title level={5} className="app-top-navbar__title" ellipsis={{ tooltip: pageContext.title }}>
              {pageContext.title}
            </Typography.Title>
          </Space>
        </div>

        <div className="app-top-navbar__right flex shrink-0 items-center gap-2">
          <NotificationBell />
          <UserAvatarDropdown />
        </div>
      </div>
    </Layout.Header>
  );
};

export default TopNavbar;
