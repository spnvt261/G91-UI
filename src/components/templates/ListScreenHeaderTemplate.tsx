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
      bordered={false}
      className={`app-page-header border border-slate-200 ${className ?? ""}`.trim()}
      styles={{ body: { padding: 20 } }}
    >
      <Space direction="vertical" size={14} style={{ width: "100%" }}>
        <div>{breadcrumb ?? <AppBreadcrumb />}</div>

        <Flex align="flex-start" justify="space-between" wrap="wrap" gap={14}>
          <Space direction="vertical" size={4} style={{ maxWidth: 820 }}>
            <Typography.Title level={3} className="!mb-0 !text-slate-900">
              {title}
            </Typography.Title>
            {subtitle ? (
              <Typography.Paragraph type="secondary" className="!mb-0">
                {subtitle}
              </Typography.Paragraph>
            ) : null}
          </Space>

          {actions ? (
            <div style={{ maxWidth: "100%" }}>
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
