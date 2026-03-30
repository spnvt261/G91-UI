import { Space } from "antd";
import type { ReactNode } from "react";

type ProjectActionBarProps = {
  primaryActions?: ReactNode;
  secondaryActions?: ReactNode;
  dangerActions?: ReactNode;
  utilityActions?: ReactNode;
};

const ProjectActionBar = ({ primaryActions, secondaryActions, dangerActions, utilityActions }: ProjectActionBarProps) => {
  return (
    <Space size={8} wrap>
      {primaryActions}
      {secondaryActions}
      {dangerActions}
      {utilityActions}
    </Space>
  );
};

export default ProjectActionBar;
