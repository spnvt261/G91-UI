import { Breadcrumb, type BreadcrumbProps, Flex, Space, Typography } from "antd";
import type { ReactNode } from "react";

type ProjectPageLayoutProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  breadcrumbItems: BreadcrumbProps["items"];
  actions?: ReactNode;
  children: ReactNode;
};

const ProjectPageLayout = ({ title, subtitle, breadcrumbItems, actions, children }: ProjectPageLayoutProps) => {
  return (
    <div className="p-4 md:p-6">
      <Space direction="vertical" size={16} style={{ width: "100%" }}>
        <Breadcrumb items={breadcrumbItems} />
        <Flex justify="space-between" align="flex-start" gap={12} wrap="wrap">
          <Space direction="vertical" size={2}>
            <Typography.Title level={3} style={{ margin: 0 }}>
              {title}
            </Typography.Title>
            {subtitle ? <Typography.Text type="secondary">{subtitle}</Typography.Text> : null}
          </Space>
          {actions ? (
            <div style={{ maxWidth: "100%" }}>
              <Flex gap={8} wrap="wrap" justify="flex-end">
                {actions}
              </Flex>
            </div>
          ) : null}
        </Flex>
        {children}
      </Space>
    </div>
  );
};

export default ProjectPageLayout;
