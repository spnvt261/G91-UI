import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircleOutlined, KeyOutlined, LockOutlined, SafetyOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input, Progress, Result, Space, Tag, Typography } from "antd";
import AuthFormCard from "../../components/auth/AuthFormCard";
import AuthHeroPanel from "../../components/auth/AuthHeroPanel";
import AuthInlineStatus, { type AuthInlineStatusValue } from "../../components/auth/AuthInlineStatus";
import AuthPageShell from "../../components/auth/AuthPageShell";
import { ApiClientError } from "../../apiConfig/axiosConfig";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import { authService } from "../../services/auth/auth.service";
import { getErrorMessage } from "../shared/page.utils";

interface ResetPasswordFormValues {
  newPassword: string;
  confirmNewPassword: string;
}

interface PasswordStrengthInfo {
  percent: number;
  color: string;
  label: string;
}

type TokenValidationState = "checking" | "valid" | "invalid";

const INVALID_RESET_LINK_MESSAGE = "Liên kết đổi mật khẩu không hợp lệ hoặc đã hết hạn.";

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

const formatExpiry = (value: string | null) => {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
};

const ResetPasswordPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { notify } = useNotify();
  const [form] = Form.useForm<ResetPasswordFormValues>();

  const token = new URLSearchParams(location.search).get("token")?.trim() ?? "";
  const redirectTimeoutRef = useRef<number | null>(null);

  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [status, setStatus] = useState<AuthInlineStatusValue | null>(null);
  const [validationState, setValidationState] = useState<TokenValidationState>("checking");
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [expiredAt, setExpiredAt] = useState<string | null>(null);

  const newPassword = Form.useWatch("newPassword", form) ?? "";
  const passwordStrength = evaluatePasswordStrength(newPassword);
  const shouldShowPasswordStrength = newPassword.length > 4;
  const formattedExpiry = formatExpiry(expiredAt);

  useEffect(() => {
    let active = true;

    const scheduleRedirectToLogin = (message: string) => {
      if (!active) {
        return;
      }

      setValidationState("invalid");
      setValidationMessage(message);
      notify(message, "error");

      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
      }

      redirectTimeoutRef.current = window.setTimeout(() => {
        navigate(ROUTE_URL.LOGIN, { replace: true });
      }, 1500);
    };

    if (!token) {
      scheduleRedirectToLogin(INVALID_RESET_LINK_MESSAGE);
      return () => {
        active = false;
        if (redirectTimeoutRef.current) {
          window.clearTimeout(redirectTimeoutRef.current);
        }
      };
    }

    const validateToken = async () => {
      setValidationState("checking");
      setValidationMessage(null);
      setExpiredAt(null);
      setStatus(null);

      try {
        const response = await authService.validateResetPasswordToken(token);
        if (!active) {
          return;
        }

        if (!response.valid) {
          scheduleRedirectToLogin(INVALID_RESET_LINK_MESSAGE);
          return;
        }

        setValidationState("valid");
        setExpiredAt(response.expiredAt);
      } catch (error) {
        if (!active) {
          return;
        }

        const message = getErrorMessage(error, INVALID_RESET_LINK_MESSAGE);
        const normalizedMessage = message.toLowerCase();
        const shouldHideTechnicalMessage =
          normalizedMessage.includes("token") || normalizedMessage.includes("hết hạn") || normalizedMessage.includes("liên kết");

        scheduleRedirectToLogin(shouldHideTechnicalMessage ? INVALID_RESET_LINK_MESSAGE : message);
      }
    };

    void validateToken();

    return () => {
      active = false;
      if (redirectTimeoutRef.current) {
        window.clearTimeout(redirectTimeoutRef.current);
      }
    };
  }, [navigate, notify, token]);

  const sidePanel = (
    <AuthHeroPanel
      eyebrow="Đặt lại mật khẩu"
      title="Kiểm tra liên kết trước khi cập nhật mật khẩu mới"
      description="Trang này chỉ cho phép tiếp tục khi liên kết trong email còn hợp lệ. Sau khi xác thực xong, bạn có thể đặt mật khẩu mới và đăng nhập lại ngay."
      highlights={[
        {
          icon: <SafetyOutlined />,
          title: "Liên kết có thời hạn",
          description: "Hệ thống xác thực liên kết trước khi hiển thị form để tránh dùng liên kết hết hạn hoặc đã sử dụng.",
        },
        {
          icon: <CheckCircleOutlined />,
          title: "Cập nhật an toàn",
          description: "Sau khi đổi mật khẩu thành công, tài khoản có thể đăng nhập lại bằng mật khẩu mới ngay lập tức.",
        },
      ]}
    />
  );

  const handleSubmit = async (values: ResetPasswordFormValues) => {
    setStatus(null);

    try {
      setLoading(true);
      await authService.resetPassword({
        token,
        newPassword: values.newPassword,
        confirmNewPassword: values.confirmNewPassword,
      });

      setCompleted(true);
      form.resetFields();
      notify("Đặt lại mật khẩu thành công.", "success");
    } catch (error) {
      if (error instanceof ApiClientError && error.errors?.length) {
        form.setFields(
          error.errors
            .filter((item) => item.field === "newPassword" || item.field === "confirmNewPassword")
            .map((item) => ({
              name: item.field as keyof ResetPasswordFormValues,
              errors: [item.message],
            })),
        );
      }

      const message = getErrorMessage(error, "Không thể đặt lại mật khẩu. Vui lòng thử lại.");
      const isTokenError =
        error instanceof ApiClientError &&
        (error.code?.toUpperCase().includes("TOKEN") ||
          message.toLowerCase().includes("token") ||
          message.toLowerCase().includes("hết hạn") ||
          message.toLowerCase().includes("liên kết"));

      if (isTokenError) {
        setValidationState("invalid");
        setValidationMessage(INVALID_RESET_LINK_MESSAGE);
        notify(INVALID_RESET_LINK_MESSAGE, "error");

        if (redirectTimeoutRef.current) {
          window.clearTimeout(redirectTimeoutRef.current);
        }

        redirectTimeoutRef.current = window.setTimeout(() => {
          navigate(ROUTE_URL.LOGIN, { replace: true });
        }, 1500);
        return;
      }

      setStatus({
        type: "error",
        message: "Đặt lại mật khẩu chưa thành công",
        description: message,
      });
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell sidePanel={sidePanel}>
      <AuthFormCard
        eyebrow="Thiết lập mật khẩu mới"
        title="Đặt lại mật khẩu"
        description="Hệ thống sẽ xác thực liên kết từ email trước khi cho phép bạn đặt mật khẩu mới."
        icon={<LockOutlined />}
        extraTop={null}
        footer={
          <Typography.Text className="auth-footer-links__text">
            Nhớ lại mật khẩu rồi?{" "}
            <Link to={ROUTE_URL.LOGIN} className="auth-footer-links__primary">
              Quay lại đăng nhập
            </Link>
          </Typography.Text>
        }
      >
        {completed ? (
          <Result
            status="success"
            title="Đặt lại mật khẩu thành công"
            subTitle="Mật khẩu mới đã được cập nhật. Bạn có thể quay lại trang đăng nhập để tiếp tục."
            extra={
              <Button type="primary" className="auth-primary-btn" onClick={() => navigate(ROUTE_URL.LOGIN, { replace: true })}>
                Đến trang đăng nhập
              </Button>
            }
          />
        ) : validationState === "checking" ? (
          <Result
            status="info"
            title="Đang xác thực liên kết"
            subTitle="Hệ thống đang kiểm tra đường dẫn từ email trước khi hiển thị form đổi mật khẩu."
          />
        ) : validationState === "invalid" ? (
          <Result
            status="warning"
            title="Liên kết đổi mật khẩu không hợp lệ"
            subTitle={validationMessage ?? "Bạn sẽ được chuyển về trang đăng nhập sau ít giây."}
            extra={
              <Button type="primary" className="auth-primary-btn" onClick={() => navigate(ROUTE_URL.LOGIN, { replace: true })}>
                Về trang đăng nhập
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
              initialValues={{ newPassword: "", confirmNewPassword: "" }}
            >
              <Alert
                showIcon
                type="info"
                message={
                  formattedExpiry
                    ? `Liên kết có giá trị đến ${formattedExpiry}.`
                    : "Mật khẩu mới nên có chữ hoa, chữ thường, số và ký tự đặc biệt để an toàn hơn."
                }
              />

              <Form.Item
                label="Mật khẩu mới"
                name="newPassword"
                rules={[{ required: true, message: "Vui lòng nhập mật khẩu mới." }]}
                style={{ marginTop: 16 }}
              >
                <Input.Password size="large" placeholder="Nhập mật khẩu mới" prefix={<LockOutlined />} />
              </Form.Item>

              {shouldShowPasswordStrength ? (
                <div style={{ marginTop: -4, marginBottom: 14 }}>
                  <Space size={8} style={{ marginBottom: 6 }}>
                    <Typography.Text type="secondary">Độ mạnh mật khẩu:</Typography.Text>
                    <Tag color="blue">{passwordStrength.label}</Tag>
                  </Space>
                  <Progress percent={passwordStrength.percent} strokeColor={passwordStrength.color} showInfo={false} />
                </div>
              ) : null}

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
                <Input.Password size="large" placeholder="Nhập lại mật khẩu mới" prefix={<KeyOutlined />} />
              </Form.Item>

              <Button type="primary" htmlType="submit" size="large" loading={loading} block className="auth-primary-btn">
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
