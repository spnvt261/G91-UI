import type { ReactNode } from "react";
import { Card, Space, Steps, Typography } from "antd";

interface AuthHeroItem {
  icon: ReactNode;
  title: string;
  description: string;
}

interface AuthHeroStep {
  title: string;
  description: string;
}

interface AuthHeroPanelProps {
  eyebrow: string;
  title: string;
  description: string;
  highlights?: AuthHeroItem[];
  steps?: AuthHeroStep[];
  currentStep?: number;
  note?: string;
}

const AuthHeroPanel = ({ eyebrow, title, description, highlights = [], steps = [], currentStep = 0, note }: AuthHeroPanelProps) => {
  return (
    <Card bordered={false} className="auth-hero-panel">
      <Space direction="vertical" size={24} style={{ width: "100%" }}>
        <Space direction="vertical" size={8} style={{ width: "100%" }}>
          <Typography.Text className="auth-hero-panel__eyebrow">{eyebrow}</Typography.Text>
          <Typography.Title level={2} className="auth-hero-panel__title">
            {title}
          </Typography.Title>
          <Typography.Paragraph className="auth-hero-panel__description">{description}</Typography.Paragraph>
        </Space>

        {highlights.length > 0 ? (
          <Space direction="vertical" size={14} style={{ width: "100%" }}>
            {highlights.map((item) => (
              <div key={item.title} className="auth-hero-panel__item">
                <span className="auth-hero-panel__item-icon">{item.icon}</span>
                <div className="auth-hero-panel__item-content">
                  <Typography.Text className="auth-hero-panel__item-title">{item.title}</Typography.Text>
                  <Typography.Text className="auth-hero-panel__item-description">{item.description}</Typography.Text>
                </div>
              </div>
            ))}
          </Space>
        ) : null}

        {steps.length > 0 ? (
          <Steps
            direction="vertical"
            size="small"
            progressDot
            current={currentStep}
            items={steps.map((step) => ({
              title: step.title,
              description: step.description,
            }))}
            className="auth-hero-panel__steps"
          />
        ) : null}

        {note ? <Typography.Text className="auth-hero-panel__note">{note}</Typography.Text> : null}
      </Space>
    </Card>
  );
};

export default AuthHeroPanel;
