import { Tag } from "antd";
import { getProjectStatusColor, getProjectStatusLabel } from "../projectPresentation";

type ProjectStatusTagProps = {
  status?: string;
};

const ProjectStatusTag = ({ status }: ProjectStatusTagProps) => {
  return (
    <Tag color={getProjectStatusColor(status)} style={{ marginInlineEnd: 0 }}>
      {getProjectStatusLabel(status)}
    </Tag>
  );
};

export default ProjectStatusTag;
