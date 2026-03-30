import { Card, Skeleton, Space, Spin } from "antd";
import type { ReactNode } from "react";
import type { BreadcrumbProps } from "antd";
import ProjectPageLayout from "./ProjectPageLayout";

type ProjectFormLayoutProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  breadcrumbItems: BreadcrumbProps["items"];
  loading?: boolean;
  children: ReactNode;
};

const ProjectFormLayout = ({ title, subtitle, breadcrumbItems, loading = false, children }: ProjectFormLayoutProps) => {
  return (
    <ProjectPageLayout title={title} subtitle={subtitle} breadcrumbItems={breadcrumbItems}>
      <Spin spinning={loading} tip="Đang tải dữ liệu...">
        <Card bordered={false} style={{ border: "1px solid #e6edf5" }}>
          {loading ? (
            <Skeleton active paragraph={{ rows: 6 }} />
          ) : (
            <Space direction="vertical" size={20} style={{ width: "100%" }}>
              {children}
            </Space>
          )}
        </Card>
      </Spin>
    </ProjectPageLayout>
  );
};

export default ProjectFormLayout;
