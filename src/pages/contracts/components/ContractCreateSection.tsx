import { Card, Space, Typography } from "antd";
import type { ReactNode } from "react";

interface ContractCreateSectionProps {
  title: string;
  subtitle?: string;
  content: ReactNode;
  loading?: boolean;
}

const ContractCreateSection = ({ title, subtitle, content, loading = false }: ContractCreateSectionProps) => {
  return (
    <Card bordered={false} className="shadow-sm" loading={loading}>
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <Space direction="vertical" size={2} style={{ width: "100%" }}>
          <Typography.Title level={5} className="!mb-0">
            {title}
          </Typography.Title>
          {subtitle ? <Typography.Text type="secondary">{subtitle}</Typography.Text> : null}
        </Space>
        {content}
      </Space>
    </Card>
  );
};

export default ContractCreateSection;
