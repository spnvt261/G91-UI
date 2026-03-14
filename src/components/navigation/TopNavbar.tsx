import NotificationBell from "./NotificationBell";
import UserAvatarDropdown from "./UserAvatarDropdown";

interface TopNavbarProps {
  onToggleSidebar?: () => void;
  title?: string;
}

const TopNavbar = ({ onToggleSidebar, title = "ERP SYSTEM" }: TopNavbarProps) => {
  return (
    <header className="flex h-16 items-center justify-between bg-gradient-to-r from-blue-800 to-blue-600 px-4 text-white shadow-sm">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className="rounded-md border border-white/30 px-2 py-1 hover:bg-white/10"
        >
          ?
        </button>
        <div>
          <p className="font-semibold">{title}</p>
          <p className="text-xs text-blue-100">G90 Steel Business Management</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <NotificationBell />
        <UserAvatarDropdown />
      </div>
    </header>
  );
};

export default TopNavbar;