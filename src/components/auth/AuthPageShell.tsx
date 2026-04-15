import type { ReactNode } from "react";
import { Col, Grid, Layout, Row, Space, Typography } from "antd";
import "./auth-ui.css";

interface AuthPageShellProps {
  children: ReactNode;
  sidePanel?: ReactNode;
}

const AuthPageShell = ({ children, sidePanel }: AuthPageShellProps) => {
  const screens = Grid.useBreakpoint();
  const hasSidePanel = Boolean(sidePanel);

  return (
    <Layout className="auth-shell">
      <Layout.Content className="auth-shell__content">
        <div className={`auth-shell__frame ${hasSidePanel ? "auth-shell__frame--split" : "auth-shell__frame--single"}`}>
          <Row gutter={[28, 28]} align={screens.lg ? "middle" : "top"} className="auth-shell__row">
            {hasSidePanel ? (
              <Col xs={{ span: 24, order: 2 }} lg={{ span: 10, order: 1 }} className="auth-shell__side-col">
                {sidePanel}
              </Col>
            ) : null}

            <Col xs={{ span: 24, order: 1 }} lg={{ span: hasSidePanel ? 14 : 24, order: 2 }} className="auth-shell__form-col">
              <Space direction="vertical" size={16} className="auth-shell__form-stack">
                <Space direction="vertical" size={2}>
                  <Typography.Text className="auth-shell__eyebrow">Nền tảng điều hành G90</Typography.Text>
                  <Typography.Title level={4} className="auth-shell__title">
                    Truy cập bảo mật, vận hành liền mạch
                  </Typography.Title>
                </Space>

                {children}
              </Space>
            </Col>
          </Row>
        </div>
      </Layout.Content>
    </Layout>
  );
};

export default AuthPageShell;
