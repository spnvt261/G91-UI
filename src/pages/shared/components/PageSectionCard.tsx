import { Card, Space, Typography } from "antd";
import type { ReactNode } from "react";

interface PageSectionCardProps {
  title: ReactNode;
  subtitle?: ReactNode;
  extra?: ReactNode;
  children: ReactNode;
  className?: string;
}

const PageSectionCard = ({ title, subtitle, extra, children, className }: PageSectionCardProps) => {
  return (
    <Card className={className} bordered>
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
          <Space direction="vertical" size={4}>
            <Typography.Title level={4} style={{ margin: 0 }}>
              {title}
            </Typography.Title>
            {subtitle ? (
              <Typography.Text type="secondary">
                {subtitle}
              </Typography.Text>
            ) : null}
          </Space>
          {extra ? <div>{extra}</div> : null}
        </div>
        {children}
      </Space>
    </Card>
  );
};

export default PageSectionCard;
