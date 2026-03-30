import { Progress, Space, Typography } from "antd";
import { normalizeProgress } from "../projectPresentation";

type ProjectProgressBarProps = {
  value?: number | string;
  size?: "default" | "small";
  showMeta?: boolean;
  showInfo?: boolean;
};

const resolveProgressStatus = (percent: number): "normal" | "active" | "success" | "exception" => {
  if (percent >= 100) {
    return "success";
  }
  if (percent === 0) {
    return "normal";
  }
  return "active";
};

const resolveStrokeColor = (percent: number): string => {
  if (percent >= 100) {
    return "#16a34a";
  }
  if (percent >= 70) {
    return "#1677ff";
  }
  if (percent >= 40) {
    return "#faad14";
  }
  return "#f97316";
};

const ProjectProgressBar = ({ value, size = "default", showMeta = false, showInfo = true }: ProjectProgressBarProps) => {
  const percent = normalizeProgress(value);

  return (
    <Space orientation="vertical" size={4} style={{ width: "100%" }}>
      <Progress
        percent={percent}
        size={size}
        showInfo={showInfo}
        status={resolveProgressStatus(percent)}
        strokeColor={resolveStrokeColor(percent)}
      />
      {showMeta ? (
        <Typography.Text type="secondary">
          {percent === 100 ? "Đã hoàn tất toàn bộ hạng mục." : `Đã hoàn thành ${percent}% khối lượng công việc.`}
        </Typography.Text>
      ) : null}
    </Space>
  );
};

export default ProjectProgressBar;
