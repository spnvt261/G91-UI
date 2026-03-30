import type { ReactNode } from "react";
import { Card, Col, Progress, Row, Skeleton, Space, Statistic, Typography } from "antd";

interface DashboardMetricItem {
  key: string;
  title: string;
  value: string | number;
  note: string;
  percent?: number;
  icon?: ReactNode;
}

interface DashboardMetricGridProps {
  items: DashboardMetricItem[];
  loading?: boolean;
}

const DashboardMetricGrid = ({ items, loading = false }: DashboardMetricGridProps) => {
  return (
    <Row gutter={[16, 16]}>
      {items.map((item) => (
        <Col key={item.key} xs={24} sm={12} xl={6}>
          <Card bordered={false} styles={{ body: { padding: 18 } }}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 2 }} title={{ width: "75%" }} />
            ) : (
              <Space direction="vertical" size={8} style={{ width: "100%" }}>
                <Statistic title={item.title} value={item.value} prefix={item.icon} />
                <Typography.Text type="secondary">{item.note}</Typography.Text>
                {typeof item.percent === "number" ? <Progress size="small" percent={Math.max(0, Math.min(100, item.percent))} /> : null}
              </Space>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default DashboardMetricGrid;
export type { DashboardMetricItem };
