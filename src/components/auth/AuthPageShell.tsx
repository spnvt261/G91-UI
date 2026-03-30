import type { ReactNode } from "react";
import { Col, Layout, Row } from "antd";
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
        <div className={`auth-shell__inner ${hasSidePanel ? "auth-shell__inner--split" : "auth-shell__inner--single"}`}>
          <Row gutter={[24, 24]} align="middle">
            {hasSidePanel ? (
              <Col xs={24} lg={11}>
                {sidePanel}
              </Col>
            ) : null}
            <Col xs={24} lg={hasSidePanel ? 13 : 24}>
              {children}
            </Col>
          </Row>
        </div>
      </Layout.Content>
    </Layout>
  );
};

export default AuthPageShell;
