import { DollarOutlined } from "@ant-design/icons";
import { Card, Progress, Space, Statistic, Typography } from "antd";
import { toCurrency } from "../../shared/page.utils";
import { formatPercent } from "./report.utils";

interface RevenueStatCardProps {
  title: string;
  value: number;
  trendRatio?: number;
  trendLabel?: string;
  loading?: boolean;
}

const RevenueStatCard = ({ title, value, trendRatio, trendLabel, loading = false }: RevenueStatCardProps) => {
  const normalizedTrend = Math.max(0, Math.min(1, trendRatio ?? 0));

  return (
    <Card bordered={false} styles={{ body: { padding: 18 } }} loading={loading}>
      <Space direction="vertical" size={10} style={{ width: "100%" }}>
        <Statistic title={title} value={toCurrency(value)} prefix={<DollarOutlined style={{ color: "#1677ff" }} />} />
        {trendLabel ? (
          <Space direction="vertical" size={4} style={{ width: "100%" }}>
            <Typography.Text type="secondary">{trendLabel}</Typography.Text>
            <Progress
              percent={Number((normalizedTrend * 100).toFixed(1))}
              size="small"
              strokeColor={normalizedTrend >= 0.5 ? "#52c41a" : "#faad14"}
              format={(percent) => formatPercent((percent ?? 0) / 100)}
            />
          </Space>
        ) : null}
      </Space>
    </Card>
  );
};

export default RevenueStatCard;
