import { useEffect, useState, type ReactNode } from "react";
import { Drawer, Grid, Layout } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../navigation/Sidebar";
import TopNavbar from "../navigation/TopNavbar";

interface AppLayoutProps {
  children: ReactNode;
}

const DESKTOP_SIDER_WIDTH = 292;
const DESKTOP_SIDER_COLLAPSED_WIDTH = 88;
const APP_HEADER_HEIGHT = 72;

const AppLayout = ({ children }: AppLayoutProps) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const screens = Grid.useBreakpoint();
  const isDesktop = Boolean(screens.lg);
  const desktopSidebarWidth = sidebarCollapsed
    ? DESKTOP_SIDER_COLLAPSED_WIDTH
    : DESKTOP_SIDER_WIDTH;

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
          width={DESKTOP_SIDER_WIDTH}
          collapsedWidth={DESKTOP_SIDER_COLLAPSED_WIDTH}
          trigger={null}
          theme="light"
          style={{ position: "fixed", top: 0, left: 0, bottom: 0, height: "100vh", overflow: "hidden" }}
        >
          <Sidebar
            collapsed={sidebarCollapsed}
            activePath={location.pathname}
            onNavigate={(path) => navigate(path)}
          />
        </Layout.Sider>
      ) : null}

      <Layout
        className="app-shell__main min-w-0 bg-slate-50"
        style={{
          marginLeft: isDesktop ? desktopSidebarWidth : 0,
          height: "100vh",
          overflow: "hidden",
        }}
      >
        <TopNavbar
          sidebarCollapsed={sidebarCollapsed}
          fixedLeft={isDesktop ? desktopSidebarWidth : 0}
          headerHeight={APP_HEADER_HEIGHT}
          onToggleSidebar={() => {
            if (isDesktop) {
              setSidebarCollapsed((previous) => !previous);
              return;
            }

            setMobileOpen((previous) => !previous);
          }}
        />

        <Layout.Content
          className="app-shell__content"
          style={{
            marginTop: APP_HEADER_HEIGHT,
            height: `calc(100vh - ${APP_HEADER_HEIGHT}px)`,
            overflow: "auto",
          }}
        >
          <div className="app-shell__content-inner h-full min-h-0">{children}</div>
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
