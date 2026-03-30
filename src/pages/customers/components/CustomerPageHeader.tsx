import { Breadcrumb, Flex, Space, Typography } from "antd";
import type { BreadcrumbProps } from "antd";
import type { ReactNode } from "react";

interface CustomerPageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  breadcrumbItems: BreadcrumbProps["items"];
  actions?: ReactNode;
}

const CustomerPageHeader = ({ title, subtitle, breadcrumbItems, actions }: CustomerPageHeaderProps) => {
  return (
    <div className="border-b border-slate-200 bg-white px-8 py-5">
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <Breadcrumb items={breadcrumbItems} />
        <Flex align="flex-start" justify="space-between" wrap="wrap" gap={12}>
          <Space direction="vertical" size={2}>
            <Typography.Title level={3} style={{ margin: 0 }}>
              {title}
            </Typography.Title>
            {subtitle ? <Typography.Text type="secondary">{subtitle}</Typography.Text> : null}
          </Space>
          {actions ? (
            <div style={{ maxWidth: "100%" }}>
              <Flex gap={8} justify="flex-end" wrap="wrap">
                {actions}
              </Flex>
            </div>
          ) : null}
        </Flex>
      </Space>
    </div>
  );
};

export default CustomerPageHeader;
