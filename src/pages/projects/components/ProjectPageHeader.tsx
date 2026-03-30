import { Breadcrumb, type BreadcrumbProps } from "antd";
import type { ReactNode } from "react";
import ListScreenHeaderTemplate from "../../../components/templates/ListScreenHeaderTemplate";

type ProjectPageHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  breadcrumbItems: BreadcrumbProps["items"];
  actions?: ReactNode;
};

const ProjectPageHeader = ({ title, subtitle, breadcrumbItems, actions }: ProjectPageHeaderProps) => {
  const breadcrumbNode = <Breadcrumb items={breadcrumbItems} />;

  return (
    <ListScreenHeaderTemplate
      title={title}
      subtitle={subtitle}
      breadcrumb={breadcrumbNode}
      actions={actions}
    />
  );
};

export default ProjectPageHeader;
