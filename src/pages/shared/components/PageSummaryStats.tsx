import { Card, Col, Row, Skeleton, Statistic, Typography } from "antd";
import type { ReactNode } from "react";

export interface SummaryStatItem {
  key: string;
  title: string;
  value: number;
  icon?: ReactNode;
  valueColor?: string;
  helperText?: string;
}

interface PageSummaryStatsProps {
  items: SummaryStatItem[];
  loading?: boolean;
}

const PageSummaryStats = ({ items, loading = false }: PageSummaryStatsProps) => {
  return (
    <Row gutter={[16, 16]}>
      {items.map((item) => (
        <Col xs={24} md={12} xl={6} key={item.key}>
          <Card bordered>
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} title={false} />
            ) : (
              <>
                <Statistic title={item.title} value={item.value} prefix={item.icon} valueStyle={item.valueColor ? { color: item.valueColor } : undefined} />
                {item.helperText ? (
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    {item.helperText}
                  </Typography.Text>
                ) : null}
              </>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default PageSummaryStats;
