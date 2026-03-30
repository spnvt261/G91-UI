import { Breadcrumb } from "antd";
import type { BreadcrumbProps } from "antd";
import type { ReactNode } from "react";
import ListScreenHeaderTemplate from "../../../components/templates/ListScreenHeaderTemplate";

interface PromotionPageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  breadcrumbItems: BreadcrumbProps["items"];
  actions?: ReactNode;
}

const PromotionPageHeader = ({ title, subtitle, breadcrumbItems, actions }: PromotionPageHeaderProps) => {
  return (
    <ListScreenHeaderTemplate
      title={title}
      subtitle={subtitle}
      actions={actions}
      breadcrumb={<Breadcrumb items={breadcrumbItems} />}
    />
  );
};

export default PromotionPageHeader;
