import type { ReactNode } from "react";
import { Card, Col, Row, Skeleton, Space, Typography } from "antd";

export interface ReportSummaryItem {
  key: string;
  title: ReactNode;
  value: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  extra?: ReactNode;
}

interface ReportSummaryCardsProps {
  items: ReportSummaryItem[];
  loading?: boolean;
}

const ReportSummaryCards = ({ items, loading = false }: ReportSummaryCardsProps) => {
  const xlSpan = items.length <= 2 ? 12 : items.length === 3 ? 8 : 6;

  return (
    <Row gutter={[16, 16]}>
      {items.map((item) => (
        <Col key={item.key} xs={24} sm={12} xl={xlSpan}>
          <Card variant="borderless" styles={{ body: { padding: 18 } }}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 2 }} title={{ width: "70%" }} />
            ) : (
              <Space orientation="vertical" size={8} style={{ width: "100%" }}>
                <Space size={8}>
                  {item.icon}
                  <Typography.Text type="secondary">{item.title}</Typography.Text>
                </Space>
                <Typography.Title level={4} className="!mb-0">
                  {item.value}
                </Typography.Title>
                {item.description ? <Typography.Text type="secondary">{item.description}</Typography.Text> : null}
                {item.extra}
              </Space>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default ReportSummaryCards;
