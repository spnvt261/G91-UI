import { Breadcrumb } from "antd";
import type { BreadcrumbProps } from "antd";
import type { ReactNode } from "react";
import ListScreenHeaderTemplate from "../../../components/templates/ListScreenHeaderTemplate";

interface PriceListPageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
  breadcrumbItems: BreadcrumbProps["items"];
}

const PriceListPageHeader = ({ title, subtitle, actions, meta, breadcrumbItems }: PriceListPageHeaderProps) => {
  return (
    <ListScreenHeaderTemplate
      title={title}
      subtitle={subtitle}
      actions={actions}
      meta={meta}
      breadcrumb={<Breadcrumb items={breadcrumbItems} />}
    />
  );
};

export default PriceListPageHeader;
