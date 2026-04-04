import { Card, Col, Row, Skeleton, Statistic, Typography } from "antd";

interface QuotationSummaryCardsProps {
  total: number;
  draft: number;
  processing: number;
  closed: number;
  closedLabel?: string;
  loading?: boolean;
}

const QuotationSummaryCards = ({
  total,
  draft,
  processing,
  closed,
  closedLabel = "Đã chốt",
  loading = false,
}: QuotationSummaryCardsProps) => {
  const metrics = [
    {
      key: "total",
      title: "Tổng báo giá",
      value: total,
      helperText: "Tổng số báo giá trong hệ thống",
    },
    {
      key: "draft",
      title: "Nháp",
      value: draft,
      helperText: "Đang trong giai đoạn soạn thảo",
    },
    {
      key: "processing",
      title: "Đang xử lý",
      value: processing,
      helperText: "Đang chờ duyệt hoặc phản hồi",
    },
    {
      key: "closed",
      title: closedLabel,
      value: closed,
      helperText: "Đã hoàn tất hoặc không tiếp tục",
    },
  ];

  return (
    <Row gutter={[16, 16]}>
      {metrics.map((metric) => (
        <Col xs={24} sm={12} xl={6} key={metric.key}>
          <Card variant="borderless" className="border border-slate-200">
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} title={false} />
            ) : (
              <>
                <Statistic title={metric.title} value={metric.value} />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {metric.helperText}
                </Typography.Text>
              </>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default QuotationSummaryCards;
