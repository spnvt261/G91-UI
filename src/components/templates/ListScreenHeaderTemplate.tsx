import { Card, Flex, Space, Typography } from "antd";
import type { ReactNode } from "react";
import AppBreadcrumb from "../navigation/AppBreadcrumb";

interface ListScreenHeaderTemplateProps {
  title: ReactNode;
  subtitle?: ReactNode;
  breadcrumb?: ReactNode;
  actions?: ReactNode;
  meta?: ReactNode;
  className?: string;
}

const ListScreenHeaderTemplate = ({
  title,
  subtitle,
  breadcrumb,
  actions,
  meta,
  className,
}: ListScreenHeaderTemplateProps) => {
  return (
    <Card
      variant="borderless"
      className={`app-page-header border border-slate-200 ${className ?? ""}`.trim()}
      styles={{ body: { padding: 20 } }}
    >
      <Space orientation="vertical" size={14} style={{ width: "100%" }}>
        <div>{breadcrumb ?? <AppBreadcrumb />}</div>

        <Flex align="flex-start" justify="space-between" wrap="wrap" gap={14}>
          <Space orientation="vertical" size={4} className="min-w-0 flex-1" style={{ maxWidth: 820 }}>
            <Typography.Title level={3} className="!mb-0 !break-words !text-slate-900">
              {title}
            </Typography.Title>
            {subtitle ? (
              <Typography.Paragraph type="secondary" className="!mb-0 !break-words">
                {subtitle}
              </Typography.Paragraph>
            ) : null}
          </Space>

          {actions ? (
            <div className="min-w-0 max-w-full">
              <Flex gap={8} justify="flex-end" wrap="wrap">
                {actions}
              </Flex>
            </div>
          ) : null}
        </Flex>

        {meta ? <div className="app-page-header__meta">{meta}</div> : null}
      </Space>
    </Card>
  );
};

export default ListScreenHeaderTemplate;
