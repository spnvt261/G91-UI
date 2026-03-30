import { Alert, Button, Empty, Spin, Space, Typography } from "antd";
import type { ReactNode } from "react";

interface InlinePageStatusProps {
  mode: "loading" | "error" | "empty";
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: ReactNode;
}

const InlinePageStatus = ({ mode, title, description, actionLabel, onAction, icon }: InlinePageStatusProps) => {
  if (mode === "loading") {
    return (
      <Space orientation="vertical" size={12} align="center" style={{ width: "100%", padding: "24px 0" }}>
        <Spin size="large" />
        <Typography.Text type="secondary">{title}</Typography.Text>
      </Space>
    );
  }

  if (mode === "error") {
    return (
      <Alert
        type="error"
        showIcon
        message={title}
        description={
          <Space orientation="vertical" size={8}>
            {description ? <Typography.Text type="secondary">{description}</Typography.Text> : null}
            {actionLabel && onAction ? (
              <Button size="small" onClick={onAction}>
                {actionLabel}
              </Button>
            ) : null}
          </Space>
        }
      />
    );
  }

  return (
    <Empty
      image={icon}
      description={
        <Space orientation="vertical" size={2} align="center">
          <Typography.Text>{title}</Typography.Text>
          {description ? <Typography.Text type="secondary">{description}</Typography.Text> : null}
        </Space>
      }
    >
      {actionLabel && onAction ? <Button onClick={onAction}>{actionLabel}</Button> : null}
    </Empty>
  );
};

export default InlinePageStatus;
