import { Breadcrumb } from "antd";
import type { ReactNode } from "react";
import { memo } from "react";
import { useNavigate } from "react-router-dom";

export interface CustomBreadcrumbItem {
  label: ReactNode;
  url?: string;
  onClick?: () => void;
}

interface CustomBreadcrumbProps {
  breadcrumbs: CustomBreadcrumbItem[];
  className?: string;
}

const CustomBreadcrumb = ({ breadcrumbs, className }: CustomBreadcrumbProps) => {
  const navigate = useNavigate();

  const handleClick = (item: CustomBreadcrumbItem) => {
    if (item.onClick) {
      item.onClick();
      return;
    }

    if (item.url) {
      navigate(item.url);
    }
  };

  return (
    <Breadcrumb className={className}>
      {breadcrumbs.map((item, index) => {
        const isEdgeItem = index === 0 || index === breadcrumbs.length - 1;
        const isClickable = !isEdgeItem && (Boolean(item.url) || Boolean(item.onClick));

        return (
          <Breadcrumb.Item
            key={`${index}-${String(item.label)}`}
            className={isClickable ? "cursor-pointer" : "pointer-events-none"}
            onClick={() => handleClick(item)}
          >
            {item.label}
          </Breadcrumb.Item>
        );
      })}
    </Breadcrumb>
  );
};

export default memo(CustomBreadcrumb);
