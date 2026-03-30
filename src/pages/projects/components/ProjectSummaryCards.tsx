import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  PauseCircleOutlined,
  ProjectOutlined,
} from "@ant-design/icons";
import { Card, Col, Row, Statistic } from "antd";

type ProjectSummaryCardsProps = {
  totalProjects: number;
  inProgressProjects: number;
  completedProjects: number;
  pausedOrCancelledProjects: number;
  loading?: boolean;
};

const ProjectSummaryCards = ({
  totalProjects,
  inProgressProjects,
  completedProjects,
  pausedOrCancelledProjects,
  loading = false,
}: ProjectSummaryCardsProps) => {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={24} md={12} xl={6}>
        <Card loading={loading}>
          <Statistic title="Tổng dự án" value={totalProjects} prefix={<ProjectOutlined />} />
        </Card>
      </Col>
      <Col xs={24} md={12} xl={6}>
        <Card loading={loading}>
          <Statistic
            title="Đang triển khai"
            value={inProgressProjects}
            prefix={<ClockCircleOutlined />}
            valueStyle={{ color: "#1677ff" }}
          />
        </Card>
      </Col>
      <Col xs={24} md={12} xl={6}>
        <Card loading={loading}>
          <Statistic
            title="Đã hoàn thành"
            value={completedProjects}
            prefix={<CheckCircleOutlined />}
            valueStyle={{ color: "#16a34a" }}
          />
        </Card>
      </Col>
      <Col xs={24} md={12} xl={6}>
        <Card loading={loading}>
          <Statistic
            title="Tạm dừng/Đã hủy"
            value={pausedOrCancelledProjects}
            prefix={<PauseCircleOutlined />}
            valueStyle={{ color: "#d97706" }}
          />
        </Card>
      </Col>
    </Row>
  );
};

export default ProjectSummaryCards;
