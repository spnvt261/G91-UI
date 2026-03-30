import { Card, Col, Row, Statistic, Typography } from "antd";
import type { ReactNode } from "react";

export interface InventorySummaryCardItem {
  key: string;
  title: string;
  value: number;
  icon?: ReactNode;
  valueColor?: string;
  helperText?: string;
}

interface InventorySummaryCardsProps {
  items: InventorySummaryCardItem[];
  loading?: boolean;
}

const InventorySummaryCards = ({ items, loading = false }: InventorySummaryCardsProps) => {
  return (
    <Row gutter={[16, 16]}>
      {items.map((item) => (
        <Col key={item.key} xs={24} sm={12} xl={6}>
          <Card loading={loading}>
            <Statistic title={item.title} value={item.value} prefix={item.icon} valueStyle={item.valueColor ? { color: item.valueColor } : undefined} />
            {item.helperText ? (
              <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                {item.helperText}
              </Typography.Text>
            ) : null}
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default InventorySummaryCards;
