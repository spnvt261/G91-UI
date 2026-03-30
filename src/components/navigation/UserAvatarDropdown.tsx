import { useEffect, useRef, useState } from "react";
import { DownOutlined, KeyOutlined, LogoutOutlined, UserOutlined } from "@ant-design/icons";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { RootState, AppDispatch } from "../../store";
import { authService } from "../../services/auth/auth.service";
import { logout as logoutAction } from "../../store/authSlice";
import { clearAuthSession } from "../../utils/authSession";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";

const UserAvatarDropdown = () => {
  const [open, setOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { notify } = useNotify();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  const initials = currentUser?.fullName?.trim()?.charAt(0)?.toUpperCase() ?? "U";
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
      notify("Không thể gọi API đăng xuất, đã đăng xuất ở phía trình duyệt.", "warning");
    } finally {
      clearAuthSession();
      dispatch(logoutAction());
      navigate(ROUTE_URL.LOGIN, { replace: true });
      setLoggingOut(false);
      setOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-1 rounded-full px-1 py-1 text-white hover:bg-white/10 sm:gap-2 sm:px-2"
      >
        <div className="h-8 w-8 rounded-full bg-amber-300 text-center text-sm font-semibold leading-8 text-blue-950">{initials}</div>
        <span className="max-w-20 truncate text-xs font-medium sm:max-w-36 sm:text-sm">{displayName}</span>
        <DownOutlined style={{ fontSize: "0.75rem" }} />
      </button>

      {open ? (
        <ul className="absolute right-0 z-40 mt-2 w-52 overflow-hidden rounded-lg bg-white text-sm text-slate-700 shadow-lg">
          <li>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate(ROUTE_URL.PROFILE);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-blue-50"
            >
              <UserOutlined />
              <span>Hồ sơ người dùng</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                navigate(ROUTE_URL.CHANGE_PASSWORD);
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-blue-50"
            >
              <KeyOutlined />
              <span>Đổi mật khẩu</span>
            </button>
          </li>
          <li>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-red-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loggingOut}
            >
              <LogoutOutlined />
              <span>{loggingOut ? "Đang đăng xuất..." : "Đăng xuất"}</span>
            </button>
          </li>
        </ul>
      ) : null}
    </div>
  );
};

export default UserAvatarDropdown;
