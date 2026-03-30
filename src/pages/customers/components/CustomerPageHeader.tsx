import { Breadcrumb } from "antd";
import type { BreadcrumbProps } from "antd";
import type { ReactNode } from "react";
import ListScreenHeaderTemplate from "../../../components/templates/ListScreenHeaderTemplate";

interface CustomerPageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  breadcrumbItems: BreadcrumbProps["items"];
  actions?: ReactNode;
}

const CustomerPageHeader = ({ title, subtitle, breadcrumbItems, actions }: CustomerPageHeaderProps) => {
  const breadcrumbNode = <Breadcrumb items={breadcrumbItems} />;

  return (
    <ListScreenHeaderTemplate
      title={title}
      // subtitle={subtitle}
      breadcrumb={breadcrumbNode}
      actions={actions}
    />
  );
};

export default CustomerPageHeader;
