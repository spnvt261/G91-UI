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
    <Card bordered={false} className="auth-form-card" styles={{ body: { padding: 24 } }}>
      <Space direction="vertical" size={20} style={{ width: "100%" }}>
        <Space align="start" size={14} className="auth-form-card__headline">
          {icon ? (
            <Avatar size={48} className="auth-form-card__icon">
              {icon}
            </Avatar>
          ) : null}
          <Space direction="vertical" size={3}>
            <Typography.Title level={2} className="auth-form-card__title">
              {title}
            </Typography.Title>
            <Typography.Paragraph type="secondary" className="auth-form-card__description">
              {description}
            </Typography.Paragraph>
          </Space>
        </Space>

        {extraTop}
        <div className="auth-form-card__body">{children}</div>

        {footer ? (
          <>
            <Divider className="!my-0 !border-slate-200" />
            <div className="auth-form-card__footer">{footer}</div>
          </>
        ) : null}
      </Space>
    </Card>
  );
};

export default AuthFormCard;
