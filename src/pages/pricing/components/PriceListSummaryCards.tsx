import { CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined } from "@ant-design/icons";
import { Card, Col, Row, Statistic, Typography } from "antd";

interface PriceListSummaryCardsProps {
  total: number;
  activeNow: number;
  expiringSoon: number;
  inactiveOrExpired: number;
  loading?: boolean;
}

const PriceListSummaryCards = ({ total, activeNow, expiringSoon, inactiveOrExpired, loading = false }: PriceListSummaryCardsProps) => {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} xl={6}>
        <Card loading={loading}>
          <Statistic title="Tổng bảng giá" value={total} prefix={<FileTextOutlined />} />
        </Card>
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <Card loading={loading}>
          <Statistic title="Đang hiệu lực" value={activeNow} prefix={<CheckCircleOutlined />} valueStyle={{ color: "#16a34a" }} />
          <Typography.Text type="secondary">Bao gồm các bảng giá còn hiệu lực hôm nay</Typography.Text>
        </Card>
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <Card loading={loading}>
          <Statistic title="Sắp hết hạn (7 ngày)" value={expiringSoon} prefix={<ClockCircleOutlined />} valueStyle={{ color: "#d97706" }} />
          <Typography.Text type="secondary">Nên rà soát để tránh gián đoạn báo giá</Typography.Text>
        </Card>
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <Card loading={loading}>
          <Statistic title="Tạm ngừng / hết hạn" value={inactiveOrExpired} prefix={<CalendarOutlined />} valueStyle={{ color: "#dc2626" }} />
          <Typography.Text type="secondary">Không còn áp dụng cho báo giá mới</Typography.Text>
        </Card>
      </Col>
    </Row>
  );
};

export default PriceListSummaryCards;
