import { CalendarOutlined, CheckCircleOutlined, GiftOutlined, PauseCircleOutlined } from "@ant-design/icons";
import { Card, Col, Row, Skeleton, Space, Statistic, Typography } from "antd";
import type { ReactNode } from "react";

interface PromotionSummaryCardsProps {
  totalPromotions: number;
  activePromotions: number;
  expiringSoonPromotions: number;
  draftOrInactivePromotions: number;
  loading?: boolean;
}

interface PromotionSummaryCardItem {
  key: string;
  title: string;
  hint: string;
  value: number;
  icon: ReactNode;
}

const PromotionSummaryCards = ({
  totalPromotions,
  activePromotions,
  expiringSoonPromotions,
  draftOrInactivePromotions,
  loading = false,
}: PromotionSummaryCardsProps) => {
  const items: PromotionSummaryCardItem[] = [
    {
      key: "total",
      title: "Tổng khuyến mãi",
      hint: "Toàn bộ chương trình đang quản lý",
      value: totalPromotions,
      icon: <GiftOutlined style={{ color: "#0f5ca8" }} />,
    },
    {
      key: "active",
      title: "Đang hoạt động",
      hint: "Đang áp dụng cho khách hàng",
      value: activePromotions,
      icon: <CheckCircleOutlined style={{ color: "#16a34a" }} />,
    },
    {
      key: "expiring",
      title: "Sắp hết hạn",
      hint: "Sẽ kết thúc trong 7 ngày",
      value: expiringSoonPromotions,
      icon: <CalendarOutlined style={{ color: "#d97706" }} />,
    },
    {
      key: "draft-inactive",
      title: "Bản nháp / Tạm dừng",
      hint: "Chưa kích hoạt hoặc đã ngưng áp dụng",
      value: draftOrInactivePromotions,
      icon: <PauseCircleOutlined style={{ color: "#64748b" }} />,
    },
  ];

  return (
    <Row gutter={[12, 12]}>
      {items.map((item) => (
        <Col key={item.key} xs={24} sm={12} xl={6}>
          <Card bordered={false} className="h-full shadow-sm">
            {loading ? (
              <Skeleton active paragraph={{ rows: 1 }} title={false} />
            ) : (
              <Space direction="vertical" size={4} style={{ width: "100%" }}>
                <Space align="center" size={8}>
                  {item.icon}
                  <Typography.Text type="secondary">{item.title}</Typography.Text>
                </Space>
                <Statistic value={item.value} />
                <Typography.Text type="secondary" className="text-xs">
                  {item.hint}
                </Typography.Text>
              </Space>
            )}
          </Card>
        </Col>
      ))}
    </Row>
  );
};

export default PromotionSummaryCards;
