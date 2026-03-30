import { Card, Descriptions, Space, Typography } from "antd";
import type { DescriptionsProps } from "antd";
import type { ReactNode } from "react";

interface CustomerInfoItem {
  key: string;
  label: ReactNode;
  value: ReactNode;
}

interface CustomerInfoSectionProps {
  title: ReactNode;
  description?: ReactNode;
  items: CustomerInfoItem[];
  column?: DescriptionsProps["column"];
  extra?: ReactNode;
}

const CustomerInfoSection = ({ title, description, items, column = { xs: 1, md: 2 }, extra }: CustomerInfoSectionProps) => {
  return (
    <Card extra={extra}>
      <Space direction="vertical" size={14} style={{ width: "100%" }}>
        <div>
          <Typography.Title level={5} style={{ margin: 0 }}>
            {title}
          </Typography.Title>
          {description ? <Typography.Text type="secondary">{description}</Typography.Text> : null}
        </div>

        <Descriptions column={column} size="small">
          {items.map((item) => (
            <Descriptions.Item key={item.key} label={item.label}>
              {item.value}
            </Descriptions.Item>
          ))}
        </Descriptions>
      </Space>
    </Card>
  );
};

export default CustomerInfoSection;
