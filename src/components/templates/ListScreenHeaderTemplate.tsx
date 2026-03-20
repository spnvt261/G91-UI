import { Typography } from "antd";
import type { ReactNode } from "react";
import AppBreadcrumb from "../navigation/AppBreadcrumb";

interface ListScreenHeaderTemplateProps {
  title: ReactNode;
  breadcrumb?: ReactNode;
  subTitle?: ReactNode;
  actions?: ReactNode;
  className?: string;
}

const ListScreenHeaderTemplate = ({
  title,
  breadcrumb,
  subTitle,
  actions,
  className,
}: ListScreenHeaderTemplateProps) => {
  return (
    <div className={`rounded-lg border border-slate-200 bg-white px-6 pb-4 pt-2 ${className ?? ""}`.trim()}>
      <div className="hidden lg:block">{breadcrumb ?? <AppBreadcrumb />}</div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <Typography.Title level={4} className="!mb-0 !text-slate-900">
          {title}
        </Typography.Title>
        <div className="flex flex-wrap justify-end gap-2">{actions}</div>
      </div>

      {/* {subTitle ? (
        <div className="">
          <Typography.Text className="text-sm text-slate-500">{subTitle}</Typography.Text>
        </div>
      ) : null} */}
    </div>
  );
};

export default ListScreenHeaderTemplate;
