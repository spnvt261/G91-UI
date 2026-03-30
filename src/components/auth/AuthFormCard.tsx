import type { ReactNode } from "react";
import { Avatar, Card, Divider, Space, Typography } from "antd";

interface AuthFormCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  extraTop?: ReactNode;
}

const AuthFormCard = ({ title, description, icon, children, footer, extraTop }: AuthFormCardProps) => {
  return (
    <Card bordered={false} className="auth-form-card">
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        <Space align="start" size={12}>
          {icon ? (
            <Avatar size={48} className="auth-form-card__icon">
              {icon}
            </Avatar>
          ) : null}
          <Space direction="vertical" size={4}>
            <Typography.Title level={2} className="auth-form-card__title">
              {title}
            </Typography.Title>
            <Typography.Text type="secondary">{description}</Typography.Text>
          </Space>
        </Space>

        {extraTop}
        {children}

        {footer ? (
          <>
            <Divider className="!my-0" />
            <div>{footer}</div>
          </>
        ) : null}
      </Space>
    </Card>
  );
};

export default AuthFormCard;
