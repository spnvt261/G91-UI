import { Tag } from "antd";
import { getProjectStatusColor, getProjectStatusLabel } from "../projectPresentation";

type ProjectStatusTagProps = {
  status?: string;
};

const ProjectStatusTag = ({ status }: ProjectStatusTagProps) => {
  return <Tag color={getProjectStatusColor(status)}>{getProjectStatusLabel(status)}</Tag>;
};

export default ProjectStatusTag;
