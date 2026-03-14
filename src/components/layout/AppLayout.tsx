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

  return (
    <div className="relative flex min-h-screen bg-gray-100">
      <div className="hidden lg:block">
        <Sidebar
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

      <main className="flex min-h-screen flex-1 flex-col">
        <TopNavbar
          onToggleSidebar={() => {
            if (window.innerWidth < 1024) {
              setMobileOpen((prev) => !prev);
            } else {
              setSidebarCollapsed((prev) => !prev);
            }
          }}
        />
        <div className="flex-1 p-6">{children}</div>
        <AppFooter />
      </main>
    </div>
  );
};

export default AppLayout;
