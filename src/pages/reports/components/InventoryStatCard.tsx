import type { ReactNode } from "react";
import { Card, Skeleton, Space, Typography } from "antd";

interface InventoryStatCardProps {
  label: ReactNode;
  value: ReactNode;
  description?: ReactNode;
  extra?: ReactNode;
  loading?: boolean;
}

const InventoryStatCard = ({ label, value, description, extra, loading = false }: InventoryStatCardProps) => {
  return (
    <Card variant="borderless" styles={{ body: { padding: 18 } }}>
      {loading ? (
        <Skeleton active paragraph={{ rows: 2 }} title={{ width: "65%" }} />
      ) : (
        <Space orientation="vertical" size={8} style={{ width: "100%" }}>
          <Typography.Text type="secondary">{label}</Typography.Text>
          <Typography.Title level={4} className="!mb-0">
            {value}
          </Typography.Title>
          {description ? <Typography.Text type="secondary">{description}</Typography.Text> : null}
          {extra}
        </Space>
      )}
    </Card>
  );
};

export default InventoryStatCard;
