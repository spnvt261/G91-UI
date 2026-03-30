import { Card, Col, Row, Statistic, Typography } from "antd";
import { toCurrency } from "../../shared/page.utils";

interface InvoiceAmountSummaryProps {
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  loading?: boolean;
  title?: string;
}

const InvoiceAmountSummary = ({
  totalAmount,
  paidAmount,
  dueAmount,
  loading = false,
  title = "Tình hình thanh toán",
}: InvoiceAmountSummaryProps) => {
  return (
    <Card loading={loading} title={title}>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Statistic title="Tổng giá trị hóa đơn" value={totalAmount} formatter={(value) => toCurrency(Number(value ?? 0))} />
        </Col>
        <Col xs={24} md={8}>
          <Statistic title="Đã thu" value={paidAmount} formatter={(value) => toCurrency(Number(value ?? 0))} valueStyle={{ color: "#16a34a" }} />
        </Col>
        <Col xs={24} md={8}>
          <Statistic title="Còn phải thu" value={dueAmount} formatter={(value) => toCurrency(Number(value ?? 0))} valueStyle={{ color: "#dc2626" }} />
        </Col>
      </Row>
      <Typography.Paragraph type="secondary" className="!mb-0 !mt-3">
        Số tiền còn phải thu được ưu tiên theo dõi để giảm rủi ro công nợ quá hạn.
      </Typography.Paragraph>
    </Card>
  );
};

export default InvoiceAmountSummary;
