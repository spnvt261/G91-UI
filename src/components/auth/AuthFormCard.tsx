import type { ReactNode } from "react";
import { Avatar, Card, Divider, Space, Typography } from "antd";

interface AuthFormCardProps {
  title: string;
  description: string;
  icon?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  extraTop?: ReactNode;
  eyebrow?: string;
}

const AuthFormCard = ({ title, description, icon, children, footer, extraTop, eyebrow }: AuthFormCardProps) => {
  return (
    <Card variant="borderless" className="auth-form-card">
      <Space orientation="vertical" size={24} style={{ width: "100%" }}>
        <Space orientation="vertical" size={12} style={{ width: "100%" }}>
          <Space align="start" size={14} className="auth-form-card__headline">
            {icon ? (
              <Avatar size={46} className="auth-form-card__icon">
                {icon}
              </Avatar>
            ) : null}

            <Space orientation="vertical" size={2}>
              {eyebrow ? <Typography.Text className="auth-form-card__eyebrow">{eyebrow}</Typography.Text> : null}
              <Typography.Title level={2} className="auth-form-card__title">
                {title}
              </Typography.Title>
            </Space>
          </Space>

          <Typography.Paragraph className="auth-form-card__description">{description}</Typography.Paragraph>
        </Space>

        {extraTop ? <div className="auth-form-card__extra-top">{extraTop}</div> : null}

        <div className="auth-form-card__body">{children}</div>

        {footer ? (
          <>
            <Divider className="auth-form-card__divider" />
            <div className="auth-form-card__footer">{footer}</div>
          </>
        ) : null}
      </Space>
    </Card>
  );
};

export default AuthFormCard;
