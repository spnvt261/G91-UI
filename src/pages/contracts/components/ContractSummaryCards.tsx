import { Card, Col, Row, Skeleton, Space, Statistic, Typography } from "antd";

export interface ContractSummaryCardItem {
  key: string;
  label: string;
  value: number;
  description?: string;
  valueColor?: string;
}

interface ContractSummaryCardsProps {
  items: ContractSummaryCardItem[];
  loading?: boolean;
}

const ContractSummaryCards = ({ items, loading = false }: ContractSummaryCardsProps) => {
  return (
    <Row gutter={[16, 16]}>
      {items.map((item) => (
        <Col key={item.key} xs={24} sm={12} lg={6}>
          <Card bordered={false} className="shadow-sm" styles={{ body: { padding: 16 } }}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 2 }} title={false} />
            ) : (
              <Space direction="vertical" size={2} style={{ width: "100%" }}>
                <Typography.Text type="secondary">{item.label}</Typography.Text>
                <Statistic value={item.value} valueStyle={item.valueColor ? { color: item.valueColor } : undefined} />
                {item.description ? <Typography.Text type="secondary">{item.description}</Typography.Text> : null}
              </Space>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default ContractSummaryCards;
