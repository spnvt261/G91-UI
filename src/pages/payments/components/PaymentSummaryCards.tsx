import { CheckCircleOutlined, ClockCircleOutlined, FileTextOutlined, WarningOutlined } from "@ant-design/icons";
import { Card, Col, Row, Statistic, Typography } from "antd";

interface PaymentSummaryCardsProps {
  totalInvoices: number;
  unpaidInvoices: number;
  overdueInvoices: number;
  paidInvoices: number;
  dueSoonInvoices: number;
  loading?: boolean;
}

const PaymentSummaryCards = ({
  totalInvoices,
  unpaidInvoices,
  overdueInvoices,
  paidInvoices,
  dueSoonInvoices,
  loading = false,
}: PaymentSummaryCardsProps) => {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} sm={12} xl={6}>
        <Card loading={loading}>
          <Statistic title="Tổng hóa đơn" value={totalInvoices} prefix={<FileTextOutlined />} />
        </Card>
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <Card loading={loading}>
          <Statistic title="Chờ thanh toán" value={unpaidInvoices} prefix={<ClockCircleOutlined />} valueStyle={{ color: "#d97706" }} />
        </Card>
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <Card loading={loading}>
          <Statistic title="Quá hạn" value={overdueInvoices} prefix={<WarningOutlined />} valueStyle={{ color: "#dc2626" }} />
        </Card>
      </Col>
      <Col xs={24} sm={12} xl={6}>
        <Card loading={loading}>
          <Statistic title="Đã thanh toán" value={paidInvoices} prefix={<CheckCircleOutlined />} valueStyle={{ color: "#16a34a" }} />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Sắp đến hạn: {dueSoonInvoices}
          </Typography.Text>
        </Card>
      </Col>
    </Row>
  );
};

export default PaymentSummaryCards;
