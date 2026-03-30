import type { ReactNode } from "react";
import CustomBreadcrumb from "../../../components/navigation/CustomBreadcrumb";
import type { CustomBreadcrumbItem } from "../../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../../components/templates/ListScreenHeaderTemplate";

interface ReportPageHeaderProps {
  title: ReactNode;
  subtitle: ReactNode;
  breadcrumbItems: CustomBreadcrumbItem[];
  actions?: ReactNode;
  meta?: ReactNode;
}

const ReportPageHeader = ({ title, subtitle, breadcrumbItems, actions, meta }: ReportPageHeaderProps) => {
  return (
    <ListScreenHeaderTemplate
      title={title}
      subtitle={subtitle}
      breadcrumb={<CustomBreadcrumb breadcrumbs={breadcrumbItems} />}
      actions={actions}
      meta={meta}
    />
  );
};

export default ReportPageHeader;
