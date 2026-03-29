import { Progress, Space, Typography } from "antd";
import { normalizeProgress } from "../projectPresentation";

type ProjectProgressBarProps = {
  value?: number | string;
  size?: "default" | "small";
  showMeta?: boolean;
};

const ProjectProgressBar = ({ value, size = "default", showMeta = false }: ProjectProgressBarProps) => {
  const percent = normalizeProgress(value);

  return (
    <Space direction="vertical" size={4} style={{ width: "100%" }}>
      <Progress percent={percent} size={size} />
      {showMeta ? (
        <Typography.Text type="secondary">
          {percent} / 100
        </Typography.Text>
      ) : null}
    </Space>
  );
};

export default ProjectProgressBar;
