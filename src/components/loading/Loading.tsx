import { useEffect, useState } from "react";
import { Alert, Button, Card, Result, Skeleton, Space, Spin, Typography } from "antd";
import { useNavigate } from "react-router-dom";

type LoadingMode = "overlay" | "page" | "section" | "inline";

interface LoadingProps {
  showGoHome?: boolean;
  text?: string;
  fullScreen?: boolean;
  mode?: LoadingMode;
}

const Loading = ({
  showGoHome = false,
  text = "Đang tải dữ liệu...",
  fullScreen = false,
  mode = "overlay",
}: LoadingProps) => {
  const navigate = useNavigate();
  const [allowGoHome, setAllowGoHome] = useState(false);

  useEffect(() => {
    if (!showGoHome) {
      setAllowGoHome(false);
      return;
    }

    const timer = setTimeout(() => {
      setAllowGoHome(true);
    }, 2800);

    return () => {
      clearTimeout(timer);
    };
  }, [showGoHome]);

  if (mode === "page") {
    return (
      <div className="flex min-h-[52vh] items-center justify-center py-10">
        <Result
          icon={<Spin size="large" />}
          title="Hệ thống đang chuẩn bị dữ liệu"
          subTitle={text}
          extra={allowGoHome ? <Button onClick={() => navigate("/")}>Về trang tổng quan</Button> : null}
        />
      </div>
    );
  }

  if (mode === "section") {
    return (
      <Card className="border border-slate-200 shadow-sm" styles={{ body: { padding: 18 } }}>
        <Space direction="vertical" size={14} style={{ width: "100%" }}>
          <Space align="center" size={10}>
            <Spin size="small" />
            <Typography.Text strong>{text}</Typography.Text>
          </Space>
          <Skeleton active title={{ width: "45%" }} paragraph={{ rows: 4 }} />
        </Space>
      </Card>
    );
  }

  if (mode === "inline") {
    return (
      <Space size={10} align="center">
        <Spin size="small" />
        <Typography.Text type="secondary">{text}</Typography.Text>
      </Space>
    );
  }

  return (
    <div
      className={`${fullScreen ? "fixed z-[1000]" : "absolute z-30"} inset-0 flex items-center justify-center bg-slate-100/55 backdrop-blur-[1.5px]`}
    >
      <Card className="w-[min(92vw,420px)] border border-slate-200 shadow-lg" styles={{ body: { padding: 18 } }}>
        <Space direction="vertical" size={14} style={{ width: "100%" }}>
          <Space align="center" size={10}>
            <Spin />
            <Typography.Text strong>{text}</Typography.Text>
          </Space>

          <Alert
            type="info"
            showIcon
            message="Hệ thống đang xử lý yêu cầu"
            description="Bạn vẫn có thể tiếp tục thao tác ở khu vực khác nếu giao diện cho phép."
          />

          {allowGoHome ? (
            <Button block onClick={() => navigate("/")}>
              Về trang tổng quan
            </Button>
          ) : null}
        </Space>
      </Card>
    </div>
  );
};

export default Loading;
