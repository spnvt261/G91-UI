import { Breadcrumb, Card, Flex, Space, Typography, type BreadcrumbProps } from "antd";
import type { ReactNode } from "react";

type ProjectPageHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  breadcrumbItems: BreadcrumbProps["items"];
  actions?: ReactNode;
};

const ProjectPageHeader = ({ title, subtitle, breadcrumbItems, actions }: ProjectPageHeaderProps) => {
  return (
    <Card
      bordered={false}
      style={{
        background: "linear-gradient(135deg, #f8fbff 0%, #ffffff 65%)",
        border: "1px solid #e6edf5",
      }}
      styles={{ body: { padding: 20 } }}
    >
      <Space direction="vertical" size={14} style={{ width: "100%" }}>
        <Breadcrumb items={breadcrumbItems} />
        <Flex align="flex-start" justify="space-between" wrap="wrap" gap={12}>
          <Space direction="vertical" size={3}>
            <Typography.Title level={2} style={{ margin: 0, fontSize: 28, lineHeight: 1.25 }}>
              {title}
            </Typography.Title>
            {subtitle ? (
              <Typography.Paragraph type="secondary" style={{ margin: 0, maxWidth: 760 }}>
                {subtitle}
              </Typography.Paragraph>
            ) : null}
          </Space>
          {actions ? (
            <div style={{ maxWidth: "100%" }}>
              <Flex gap={8} justify="flex-end" wrap="wrap">
                {actions}
              </Flex>
            </div>
          ) : null}
        </Flex>
      </Space>
    </Card>
  );
};

export default ProjectPageHeader;
