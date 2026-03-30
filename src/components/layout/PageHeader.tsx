import { Flex, Space, Typography } from "antd";
import type { ReactNode } from "react";

interface PageHeaderProps {
  title: ReactNode;
  subtitle?: ReactNode;
  rightActions?: ReactNode;
}

const PageHeader = ({ title, subtitle, rightActions }: PageHeaderProps) => {
  return (
    <Flex align="flex-start" justify="space-between" wrap="wrap" gap={12}>
      <Space orientation="vertical" size={4}>
        <Typography.Title level={3} style={{ margin: 0 }}>
          {title}
        </Typography.Title>
        {subtitle ? (
          <Typography.Text type="secondary">{subtitle}</Typography.Text>
        ) : null}
      </Space>
      {rightActions ? <div className="shrink-0">{rightActions}</div> : null}
    </Flex>
  );
};

export default PageHeader;
