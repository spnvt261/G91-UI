import { KeyOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Dropdown, Space, Typography } from "antd";
import type { MenuProps } from "antd";
import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import { authService } from "../../services/auth/auth.service";
import { logout as logoutAction } from "../../store/authSlice";
import type { AppDispatch, RootState } from "../../store";
import { clearAuthSession } from "../../utils/authSession";

const UserAvatarDropdown = () => {
  const [loggingOut, setLoggingOut] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { notify } = useNotify();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const initials = useMemo(() => {
    if (!currentUser?.fullName) {
      return "ND";
    }

    const chunks = currentUser.fullName
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(-2);

    return chunks.map((chunk) => chunk.charAt(0).toUpperCase()).join("");
  }, [currentUser?.fullName]);

  const displayName = currentUser?.fullName || currentUser?.email || "Người dùng";

  const handleLogout = async () => {
    if (loggingOut) {
      return;
    }

    try {
      setLoggingOut(true);
      await authService.logout();
      notify("Đăng xuất thành công.", "success");
    } catch {
      notify("Không thể gọi API đăng xuất, hệ thống sẽ đăng xuất cục bộ.", "warning");
    } finally {
      clearAuthSession();
      dispatch(logoutAction());
      navigate(ROUTE_URL.LOGIN, { replace: true });
      setLoggingOut(false);
    }
  };

  const menuItems: MenuProps["items"] = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Hồ sơ cá nhân",
      onClick: () => navigate(ROUTE_URL.PROFILE),
    },
    {
      key: "change-password",
      icon: <KeyOutlined />,
      label: "Đổi mật khẩu",
      onClick: () => navigate(ROUTE_URL.CHANGE_PASSWORD),
    },
    { type: "divider" },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: loggingOut ? "Đang đăng xuất..." : "Đăng xuất",
      danger: true,
      disabled: loggingOut,
      onClick: () => void handleLogout(),
    },
  ];

  return (
    <Dropdown menu={{ items: menuItems }} trigger={["click"]} placement="bottomRight">
      <Button type="text" className="app-user-dropdown" aria-label="Mở menu tài khoản">
        <Space size={10}>
          <Avatar size={32} style={{ backgroundColor: "#dbeafe", color: "#1d4ed8" }}>
            {initials}
          </Avatar>
          <Space direction="vertical" size={0} className="app-user-dropdown__meta">
            <Typography.Text className="app-user-dropdown__name">{displayName}</Typography.Text>
            <Typography.Text type="secondary" className="app-user-dropdown__role">
              Tài khoản đang hoạt động
            </Typography.Text>
          </Space>
        </Space>
      </Button>
    </Dropdown>
  );
};

export default UserAvatarDropdown;
