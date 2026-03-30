import { type BreadcrumbProps, Space } from "antd";
import type { ReactNode } from "react";
import NoResizeScreenTemplate from "../../../components/templates/NoResizeScreenTemplate";
import ProjectPageHeader from "./ProjectPageHeader";

type ProjectPageLayoutProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  breadcrumbItems: BreadcrumbProps["items"];
  actions?: ReactNode;
  children: ReactNode;
};

const ProjectPageLayout = ({ title, subtitle, breadcrumbItems, actions, children }: ProjectPageLayoutProps) => {
  return (
    <NoResizeScreenTemplate
      loading={false}
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <div className="">
          <ProjectPageHeader title={title} subtitle={subtitle} breadcrumbItems={breadcrumbItems} actions={actions} />
        </div>
      }
      body={
        <Space orientation="vertical" size={18} style={{ width: "100%" }}>
          {children}
        </Space>
      }
    />
  );
};

export default ProjectPageLayout;
