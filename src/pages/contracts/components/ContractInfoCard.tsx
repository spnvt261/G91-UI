import { Card, Descriptions, Space, Typography } from "antd";
import type { DescriptionsProps } from "antd";
import type { ReactNode } from "react";

interface ContractInfoCardProps {
  title: string;
  subtitle?: string;
  items: DescriptionsProps["items"];
  extra?: ReactNode;
  loading?: boolean;
  columns?: 1 | 2 | 3;
}

const ContractInfoCard = ({ title, subtitle, items, extra, loading = false, columns = 2 }: ContractInfoCardProps) => {
  return (
    <Card bordered={false} className="shadow-sm" loading={loading}>
      <Space direction="vertical" size={14} style={{ width: "100%" }}>
        <Space direction="vertical" size={2} style={{ width: "100%" }}>
          <Space align="start" style={{ width: "100%", justifyContent: "space-between" }}>
            <Typography.Title level={5} className="!mb-0">
              {title}
            </Typography.Title>
            {extra}
          </Space>
          {subtitle ? (
            <Typography.Text type="secondary">
              {subtitle}
            </Typography.Text>
          ) : null}
        </Space>

        <Descriptions
          size="small"
          column={{ xs: 1, sm: 1, md: columns }}
          items={items}
          styles={{
            label: {
              color: "#64748b",
              width: 180,
            },
          }}
        />
      </Space>
    </Card>
  );
};

export default ContractInfoCard;
