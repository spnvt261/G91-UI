import { ApartmentOutlined, TeamOutlined, UserDeleteOutlined } from "@ant-design/icons";
import { Card, Col, Row, Statistic } from "antd";

interface CustomerSummaryCardsProps {
  totalCustomers: number;
  activeCustomers: number;
  inactiveCustomers: number;
  loading?: boolean;
}

const CustomerSummaryCards = ({ totalCustomers, activeCustomers, inactiveCustomers, loading = false }: CustomerSummaryCardsProps) => {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={8}>
        <Card loading={loading}>
          <Statistic title="Tổng khách hàng" value={totalCustomers} prefix={<TeamOutlined />} />
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card loading={loading}>
          <Statistic title="Đang hoạt động" value={activeCustomers} prefix={<ApartmentOutlined />} valueStyle={{ color: "#16a34a" }} />
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card loading={loading}>
          <Statistic title="Ngừng hoạt động" value={inactiveCustomers} prefix={<UserDeleteOutlined />} valueStyle={{ color: "#dc2626" }} />
        </Card>
      </Col>
    </Row>
  );
};

export default CustomerSummaryCards;
