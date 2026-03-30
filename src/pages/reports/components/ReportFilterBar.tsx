import type { ReactNode } from "react";
import { Card, Flex, Space, Typography } from "antd";

interface ReportFilterBarProps {
  title?: ReactNode;
  description?: ReactNode;
  extra?: ReactNode;
  children: ReactNode;
}

const ReportFilterBar = ({ title, description, extra, children }: ReportFilterBarProps) => {
  return (
    <Card variant="borderless" styles={{ body: { padding: 16 } }}>
      <Space orientation="vertical" size={12} style={{ width: "100%" }}>
        {title || description || extra ? (
          <Flex justify="space-between" align="center" gap={12} wrap="wrap">
            <Space orientation="vertical" size={2}>
              {title ? (
                <Typography.Text strong style={{ fontSize: 15 }}>
                  {title}
                </Typography.Text>
              ) : null}
              {description ? <Typography.Text type="secondary">{description}</Typography.Text> : null}
            </Space>
            {extra}
          </Flex>
        ) : null}
        {children}
      </Space>
    </Card>
  );
};

export default ReportFilterBar;
