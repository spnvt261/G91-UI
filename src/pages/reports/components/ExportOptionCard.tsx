import type { ReactNode } from "react";
import { ClockCircleOutlined, DownloadOutlined } from "@ant-design/icons";
import { Badge, Button, Card, List, Space, Tag, Tooltip, Typography } from "antd";

interface ExportOptionCardProps {
  format: string;
  title: string;
  description: string;
  previewItems: string[];
  disabledReason: string;
  statusText?: string;
  icon?: ReactNode;
}

const ExportOptionCard = ({ format, title, description, previewItems, disabledReason, statusText, icon }: ExportOptionCardProps) => {
  return (
    <Badge.Ribbon text={statusText ?? "Sắp hỗ trợ"} color="gold">
      <Card variant="borderless" styles={{ body: { padding: 18 } }}>
        <Space orientation="vertical" size={12} style={{ width: "100%" }}>
          <Space align="center" size={10}>
            {icon ?? <ClockCircleOutlined style={{ color: "#faad14" }} />}
            <Typography.Title level={4} className="!mb-0">
              {title}
            </Typography.Title>
            <Tag color="blue">{format}</Tag>
          </Space>
          <Typography.Text type="secondary">{description}</Typography.Text>

          <List
            size="small"
            dataSource={previewItems}
            renderItem={(item) => <List.Item>{item}</List.Item>}
            locale={{ emptyText: "Sẽ cập nhật cấu trúc tệp trong phiên bản tiếp theo." }}
          />

          <Tooltip title={disabledReason}>
            <Button type="primary" icon={<DownloadOutlined />} disabled block>
              Xuất báo cáo
            </Button>
          </Tooltip>
        </Space>
      </Card>
    </Badge.Ribbon>
  );
};

export default ExportOptionCard;
