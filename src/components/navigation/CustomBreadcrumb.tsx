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
    <Breadcrumb
      className={className}
      items={breadcrumbs.map((item, index) => {
        const isLast = index === breadcrumbs.length - 1;
        const isClickable = !isLast && (Boolean(item.url) || Boolean(item.onClick));

        return {
          key: `${index}-${String(item.label)}`,
          title: (
            <span
              className={isClickable ? "cursor-pointer" : "pointer-events-none"}
              onClick={() => {
                if (isClickable) {
                  handleClick(item);
                }
              }}
              onKeyDown={(event) => {
                if (!isClickable) {
                  return;
                }

                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleClick(item);
                }
              }}
              role={isClickable ? "button" : undefined}
              tabIndex={isClickable ? 0 : undefined}
            >
              {item.label}
            </span>
          ),
        };
      })}
    />
  );
};

export default memo(CustomBreadcrumb);
