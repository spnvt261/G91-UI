import { Card, Space, Typography } from "antd";
import type { ReactNode } from "react";

interface CustomerFormSectionProps {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
}

const CustomerFormSection = ({ title, description, children }: CustomerFormSectionProps) => {
  return (
    <Card>
      <Space orientation="vertical" size={16} style={{ width: "100%" }}>
        <div>
          <Typography.Title level={5} style={{ margin: 0 }}>
            {title}
          </Typography.Title>
          {description ? <Typography.Text type="secondary">{description}</Typography.Text> : null}
        </div>
        {children}
      </Space>
    </Card>
  );
};

export default CustomerFormSection;
