import { Card, Space, Typography } from "antd";
import type { ReactNode } from "react";

interface PromotionInfoCardProps {
  title: ReactNode;
  description?: ReactNode;
  extra?: ReactNode;
  children: ReactNode;
}

const PromotionInfoCard = ({ title, description, extra, children }: PromotionInfoCardProps) => {
  return (
    <Card variant="borderless" className="shadow-sm" extra={extra}>
      <Space orientation="vertical" size={16} style={{ width: "100%" }}>
        <Space orientation="vertical" size={2}>
          <Typography.Title level={5} className="!mb-0">
            {title}
          </Typography.Title>
          {description ? <Typography.Text type="secondary">{description}</Typography.Text> : null}
        </Space>

        {children}
      </Space>
    </Card>
  );
};

export default PromotionInfoCard;
