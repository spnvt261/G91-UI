import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { KeyOutlined, LockOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input, Progress, Result, Space, Tag, Typography } from "antd";
import AuthFormCard from "../../components/auth/AuthFormCard";
import AuthInlineStatus, { type AuthInlineStatusValue } from "../../components/auth/AuthInlineStatus";
import AuthPageShell from "../../components/auth/AuthPageShell";
import { authService } from "../../services/auth/auth.service";
import { ROUTE_URL } from "../../const/route_url.const";
import { getErrorMessage } from "../shared/page.utils";
import { useNotify } from "../../context/notifyContext";
import { ApiClientError } from "../../apiConfig/axiosConfig";

interface ResetPasswordFormValues {
  token: string;
  newPassword: string;
  confirmNewPassword: string;
}

interface PasswordStrengthInfo {
  percent: number;
  color: string;
  label: string;
}

const evaluatePasswordStrength = (password: string): PasswordStrengthInfo => {
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  }
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) {
    score += 1;
  }
  if (/\d/.test(password)) {
    score += 1;
  }
  if (/[^A-Za-z\d]/.test(password)) {
    score += 1;
  }

  if (score <= 1) {
    return { percent: 25, color: "#ef4444", label: "Yếu" };
  }
  if (score === 2) {
    return { percent: 50, color: "#f59e0b", label: "Trung bình" };
  }
  if (score === 3) {
    return { percent: 75, color: "#3b82f6", label: "Khá" };
  }
  return { percent: 100, color: "#16a34a", label: "Mạnh" };
};

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { notify } = useNotify();
  const [form] = Form.useForm<ResetPasswordFormValues>();

  const tokenFromQuery = useMemo(() => new URLSearchParams(location.search).get("token") ?? "", [location.search]);
  const hasTokenFromQuery = tokenFromQuery.trim().length > 0;

  const [manualTokenMode, setManualTokenMode] = useState(hasTokenFromQuery);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<AuthInlineStatusValue | null>(null);
  const [completed, setCompleted] = useState(false);

  const newPassword = Form.useWatch("newPassword", form) ?? "";
  const passwordStrength = evaluatePasswordStrength(newPassword);

  const handleSubmit = async (values: ResetPasswordFormValues) => {
    setStatus(null);

    try {
      setLoading(true);
      await authService.resetPassword({
        token: (hasTokenFromQuery ? tokenFromQuery : values.token).trim(),
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmNewPassword,
      });

      setCompleted(true);
      notify("Đặt lại mật khẩu thành công.", "success");
    } catch (err) {
      if (err instanceof ApiClientError && err.errors?.length) {
        form.setFields(
          err.errors.map((item) => ({
            name: item.field as keyof ResetPasswordFormValues,
            errors: [item.message],
          })),
        );
      }

      const message = getErrorMessage(err, "Không thể đặt lại mật khẩu. Vui lòng thử lại.");
      const tokenRelatedError =
        err instanceof ApiClientError &&
        (err.code?.toUpperCase().includes("TOKEN") || message.toLowerCase().includes("token") || message.toLowerCase().includes("liên kết"));

      setStatus({
        type: tokenRelatedError ? "warning" : "error",
        message: tokenRelatedError ? "Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn" : "Đặt lại mật khẩu chưa thành công",
        description: message,
      });
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  };

  if (!manualTokenMode) {
    return (
      <AuthPageShell>
        <AuthFormCard
          title="Đặt lại mật khẩu"
          description="Liên kết hiện chưa chứa mã xác thực đặt lại mật khẩu."
          icon={<KeyOutlined />}
          footer={
            <Typography.Text type="secondary">
              Bạn có thể yêu cầu liên kết mới tại{" "}
              <Link to={ROUTE_URL.FORGOT_PASSWORD}>
                <Typography.Text strong>trang quên mật khẩu</Typography.Text>
              </Link>
              .
            </Typography.Text>
          }
        >
          <Result
            status="warning"
            title="Thiếu mã xác thực đặt lại"
            subTitle="Vui lòng mở lại liên kết từ email hoặc nhập mã token thủ công nếu bạn đã có."
            extra={
              <Space>
                <Button type="primary" onClick={() => setManualTokenMode(true)}>
                  Tôi đã có mã token
                </Button>
                <Link to={ROUTE_URL.FORGOT_PASSWORD}>
                  <Button>Gửi lại email đặt lại</Button>
                </Link>
              </Space>
            }
          />
        </AuthFormCard>
      </AuthPageShell>
    );
  }

  return (
    <AuthPageShell>
      <AuthFormCard
        title="Đặt lại mật khẩu"
        description="Tạo mật khẩu mới để hoàn tất khôi phục quyền truy cập tài khoản."
        icon={<LockOutlined />}
        extraTop={
          hasTokenFromQuery ? (
            <Alert
              showIcon
              type="info"
              message="Hệ thống đã nhận mã xác thực từ liên kết email."
              description="Bạn chỉ cần nhập mật khẩu mới và xác nhận để hoàn tất."
            />
          ) : null
        }
        footer={
          <Typography.Text type="secondary">
            Nhớ mật khẩu rồi?{" "}
            <Link to={ROUTE_URL.LOGIN}>
              <Typography.Text strong>Quay lại đăng nhập</Typography.Text>
            </Link>
          </Typography.Text>
        }
      >
        {completed ? (
          <Result
            status="success"
            title="Đổi mật khẩu thành công"
            subTitle="Mật khẩu mới đã được cập nhật. Bạn có thể đăng nhập lại ngay bây giờ."
            extra={
              <Button type="primary" onClick={() => navigate(ROUTE_URL.LOGIN)}>
                Đến trang đăng nhập
              </Button>
            }
          />
        ) : (
          <Space direction="vertical" size={18} style={{ width: "100%" }}>
            <AuthInlineStatus status={status} closable onClose={() => setStatus(null)} />

            <Form
              form={form}
              layout="vertical"
              onFinish={handleSubmit}
              requiredMark={false}
              autoComplete="off"
              disabled={loading}
              initialValues={{ token: tokenFromQuery, newPassword: "", confirmNewPassword: "" }}
            >
              {!hasTokenFromQuery ? (
                <Form.Item
                  label="Mã token đặt lại"
                  name="token"
                  rules={[{ required: true, message: "Vui lòng nhập mã token đặt lại mật khẩu." }]}
                >
                  <Input size="large" placeholder="Dán mã token bạn nhận được" />
                </Form.Item>
              ) : (
                <div className="mb-4">
                  <Tag color="blue">Mã token đã được điền tự động</Tag>
                </div>
              )}

              <Form.Item
                label="Mật khẩu mới"
                name="newPassword"
                rules={[
                  { required: true, message: "Vui lòng nhập mật khẩu mới." },
                  { min: 6, message: "Mật khẩu mới cần có ít nhất 6 ký tự." },
                ]}
              >
                <Input.Password size="large" placeholder="Nhập mật khẩu mới" />
              </Form.Item>

              <div className="-mt-2 mb-3">
                <Typography.Text type="secondary">Độ mạnh mật khẩu: {passwordStrength.label}</Typography.Text>
                <Progress percent={passwordStrength.percent} strokeColor={passwordStrength.color} showInfo={false} />
              </div>

              <Form.Item
                label="Xác nhận mật khẩu mới"
                name="confirmNewPassword"
                dependencies={["newPassword"]}
                rules={[
                  { required: true, message: "Vui lòng xác nhận mật khẩu mới." },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || value === getFieldValue("newPassword")) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error("Mật khẩu xác nhận không khớp."));
                    },
                  }),
                ]}
              >
                <Input.Password size="large" placeholder="Nhập lại mật khẩu mới" />
              </Form.Item>

              <Button type="primary" htmlType="submit" size="large" loading={loading} block>
                Cập nhật mật khẩu
              </Button>
            </Form>
          </Space>
        )}
      </AuthFormCard>
    </AuthPageShell>
  );
};

export default ResetPasswordPage;
