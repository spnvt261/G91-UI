import { useState, type ReactNode } from "react";
import AppFooter from "./AppFooter";
import Sidebar from "../navigation/Sidebar";
import TopNavbar from "../navigation/TopNavbar";
import { useLocation, useNavigate } from "react-router-dom";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const desktopSidebarPaddingClass = sidebarCollapsed ? "lg:pl-20" : "lg:pl-72";

  return (
    <div className="relative h-screen overflow-hidden bg-gray-100">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">
        <Sidebar
          className="h-full"
          collapsed={sidebarCollapsed}
          activePath={location.pathname}
          onNavigate={(path) => navigate(path)}
        />
      </div>

      {mobileOpen ? (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/50 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-hidden
          />
          <div className="fixed inset-y-0 left-0 z-50 lg:hidden">
            <Sidebar
              className="h-full"
              activePath={location.pathname}
              onNavigate={(path) => {
                navigate(path);
                setMobileOpen(false);
              }}
            />
          </div>
        </>
      ) : null}

      <main className={`flex h-full min-h-0 flex-1 flex-col transition-[padding-left] duration-200 ${desktopSidebarPaddingClass}`}>
        <TopNavbar
          onToggleSidebar={() => {
            if (window.innerWidth < 1024) {
              setMobileOpen((prev) => !prev);
            } else {
              setSidebarCollapsed((prev) => !prev);
            }
          }}
        />
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="flex h-full min-h-full flex-col">
            <div className="flex flex-col min-h-0 flex-1">{children}</div>
            {/* <AppFooter /> */}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AppLayout;
