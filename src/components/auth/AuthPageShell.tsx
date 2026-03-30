import type { ReactNode } from "react";
import { Col, Layout, Row, Space, Typography } from "antd";
import "./auth-ui.css";

interface AuthPageShellProps {
  children: ReactNode;
  sidePanel?: ReactNode;
}

const AuthPageShell = ({ children, sidePanel }: AuthPageShellProps) => {
  const hasSidePanel = Boolean(sidePanel);

  return (
    <Layout className="auth-shell">
      <Layout.Content className="auth-shell__content">
        <div
          className={`auth-shell__inner ${
            hasSidePanel ? "auth-shell__inner--split" : "auth-shell__inner--single"
          }`}
        >
          <Row gutter={[26, 26]} align="middle">
            {hasSidePanel ? (
              <Col xs={24} lg={11}>
                {sidePanel}
              </Col>
            ) : null}
            <Col xs={24} lg={hasSidePanel ? 13 : 24}>
              <Space direction="vertical" size={14} style={{ width: "100%" }}>
                <Space direction="vertical" size={0}>
                  <Typography.Text className="auth-shell__eyebrow">
                    G91 STEEL
                  </Typography.Text>
                  <Typography.Title level={5} className="auth-shell__title">
                    Nền tảng vận hành thống nhất
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
