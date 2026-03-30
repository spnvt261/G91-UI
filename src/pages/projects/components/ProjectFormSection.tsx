import { Card, Space, Typography } from "antd";
import type { ReactNode } from "react";

type ProjectFormSectionProps = {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
};

const ProjectFormSection = ({ title, description, children }: ProjectFormSectionProps) => {
  return (
    <Card size="small" styles={{ body: { padding: 18 } }}>
      <Space direction="vertical" size={14} style={{ width: "100%" }}>
        <div>
          <Typography.Title level={5} style={{ margin: 0 }}>
            {title}
          </Typography.Title>
          {description ? (
            <Typography.Text type="secondary" style={{ display: "block", marginTop: 4 }}>
              {description}
            </Typography.Text>
          ) : null}
        </div>
        {children}
      </Space>
    </Card>
  );
};

export default ProjectFormSection;
