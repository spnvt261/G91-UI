import { Alert, Card, Col, Descriptions, Row, Space, Typography } from "antd";
import type { ProjectModel } from "../../../models/project/project.model";
import { displayText, formatProjectDate, resolveProjectProgress } from "../projectPresentation";
import ProjectProgressBar from "./ProjectProgressBar";
import ProjectStatusTag from "./ProjectStatusTag";

type ProjectContextCardProps = {
  project: ProjectModel;
  title?: string;
  highlightWarehouseChange?: boolean;
  nextWarehouseId?: string;
  nextWarehouseLabel?: string;
};

const ProjectContextCard = ({
  project,
  title = "Ngữ cảnh dự án",
  highlightWarehouseChange = false,
  nextWarehouseId,
  nextWarehouseLabel,
}: ProjectContextCardProps) => {
  const currentWarehouseId = project.primaryWarehouseId ?? project.warehouseId;
  const currentWarehouse = displayText(currentWarehouseId);
  const currentProgress = resolveProjectProgress(project);
  const shouldShowWarehouseWarning = highlightWarehouseChange && nextWarehouseId && nextWarehouseId !== currentWarehouseId;

  return (
    <Card title={title}>
      <Space direction="vertical" size={14} style={{ width: "100%" }}>
        {shouldShowWarehouseWarning ? (
          <Alert
            type="warning"
            showIcon
            message="Bạn đang thay đổi kho phụ trách"
            description={`Kho hiện tại: ${currentWarehouse} • Kho mới: ${nextWarehouseLabel ?? displayText(nextWarehouseId)}`}
          />
        ) : null}

        <Row gutter={[16, 12]}>
          <Col xs={24} xl={14}>
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Space size={10} wrap>
                <Typography.Title level={4} style={{ margin: 0 }}>
                  {displayText(project.name)}
                </Typography.Title>
                <ProjectStatusTag status={project.status} />
              </Space>
              <Descriptions size="small" column={{ xs: 1, sm: 2 }}>
                <Descriptions.Item label="Mã dự án">{displayText(project.projectCode ?? project.code)}</Descriptions.Item>
                <Descriptions.Item label="Khách hàng">{displayText(project.customerName ?? project.customerId)}</Descriptions.Item>
                <Descriptions.Item label="Kho hiện tại">{currentWarehouse}</Descriptions.Item>
                <Descriptions.Item label="Cập nhật gần nhất">{formatProjectDate(project.updatedAt)}</Descriptions.Item>
              </Descriptions>
            </Space>
          </Col>
          <Col xs={24} xl={10}>
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              <Typography.Text strong>Tiến độ hiện tại</Typography.Text>
              <ProjectProgressBar value={currentProgress} showMeta />
            </Space>
          </Col>
        </Row>
      </Space>
    </Card>
  );
};

export default ProjectContextCard;
