import { useEffect, useState, type ReactNode } from "react";
import { Drawer, Grid, Layout } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../navigation/Sidebar";
import TopNavbar from "../navigation/TopNavbar";

interface AppLayoutProps {
  children: ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const screens = Grid.useBreakpoint();
  const isDesktop = Boolean(screens.lg);

  useEffect(() => {
    if (isDesktop && mobileOpen) {
      setMobileOpen(false);
    }
  }, [isDesktop, mobileOpen]);

  return (
    <Layout className="app-shell h-screen min-h-0 bg-slate-50">
      {isDesktop ? (
        <Layout.Sider
          className="app-shell__sider"
          collapsible
          collapsed={sidebarCollapsed}
          width={292}
          collapsedWidth={88}
          trigger={null}
          theme="light"
        >
          <Sidebar
            collapsed={sidebarCollapsed}
            activePath={location.pathname}
            onNavigate={(path) => navigate(path)}
          />
        </Layout.Sider>
      ) : null}

      <Layout className="app-shell__main min-w-0 bg-slate-50">
        <TopNavbar
          sidebarCollapsed={sidebarCollapsed}
          onToggleSidebar={() => {
            if (isDesktop) {
              setSidebarCollapsed((previous) => !previous);
              return;
            }

            setMobileOpen((previous) => !previous);
          }}
        />

        <Layout.Content className="app-shell__content">
          <div className="app-shell__content-inner">{children}</div>
        </Layout.Content>
      </Layout>

      <Drawer
        placement="left"
        width={300}
        open={!isDesktop && mobileOpen}
        onClose={() => setMobileOpen(false)}
        className="app-shell__mobile-drawer"
        styles={{ body: { padding: 0, height: "100%" } }}
      >
        <Sidebar
          activePath={location.pathname}
          onNavigate={(path) => {
            navigate(path);
            setMobileOpen(false);
          }}
        />
      </Drawer>
    </Layout>
  );
};

export default AppLayout;
