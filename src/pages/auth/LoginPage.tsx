import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { CheckCircleOutlined, LoginOutlined, SafetyOutlined } from "@ant-design/icons";
import { Button, Card, Form, Input, Space, Typography } from "antd";
import AuthFormCard from "../../components/auth/AuthFormCard";
import AuthInlineStatus, { type AuthInlineStatusValue } from "../../components/auth/AuthInlineStatus";
import AuthPageShell from "../../components/auth/AuthPageShell";
import { authService } from "../../services/auth/auth.service";
import { loginSuccess } from "../../store/authSlice";
import type { AppDispatch } from "../../store";
import { ROUTE_URL } from "../../const/route_url.const";
import { getErrorMessage } from "../shared/page.utils";
import { getDefaultRouteByRole } from "../../const/authz.const";
import { persistAuthSession } from "../../utils/authSession";
import { useNotify } from "../../context/notifyContext";
import { ApiClientError } from "../../apiConfig/axiosConfig";

interface LoginFormValues {
  email: string;
  password: string;
}

const LoginPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();
  const { notify } = useNotify();
  const [form] = Form.useForm<LoginFormValues>();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<AuthInlineStatusValue | null>(null);

  const handleSubmit = async (values: LoginFormValues) => {
    const normalizedEmail = values.email.trim();

    setStatus(null);
    try {
      setLoading(true);
      const response = await authService.login({
        email: normalizedEmail,
        password: values.password,
      });

      persistAuthSession(response.accessToken, response.user.role);
      dispatch(
        loginSuccess({
          accessToken: response.accessToken,
          user: response.user,
        }),
      );
      notify("Đăng nhập thành công.", "success");
      navigate(getDefaultRouteByRole(response.user.role));
    } catch (err) {
      if (err instanceof ApiClientError && err.code === "EMAIL_VERIFICATION_REQUIRED") {
        const query = normalizedEmail ? `?email=${encodeURIComponent(normalizedEmail)}` : "";
        notify("Tài khoản chưa được xác thực. Vui lòng nhập mã xác thực trước khi đăng nhập.", "warning");
        navigate(`${ROUTE_URL.VERIFY_REGISTRATION}${query}`, { state: { email: normalizedEmail } });
        return;
      }

      if (err instanceof ApiClientError && err.errors?.length) {
        form.setFields(
          err.errors.map((item) => ({
            name: item.field as keyof LoginFormValues,
            errors: [item.message],
          })),
        );
      }

      const message = getErrorMessage(err, "Không thể đăng nhập. Vui lòng thử lại.");
      setStatus({
        type: "error",
        message: "Đăng nhập chưa thành công",
        description: message,
      });
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell
      sidePanel={
        <Card bordered={false} className="auth-side-panel">
          <Space direction="vertical" size={24} style={{ width: "100%" }}>
            <Space direction="vertical" size={8}>
              <Typography.Text className="auth-side-panel__subtitle">NỀN TẢNG ERP G91</Typography.Text>
              <Typography.Title level={2} className="!mb-0 !text-white">
                Quản trị tập trung, vận hành an toàn
              </Typography.Title>
              <Typography.Paragraph className="auth-side-panel__subtitle !mb-0">
                Đăng nhập để truy cập dữ liệu nghiệp vụ, theo dõi tiến độ và kiểm soát quy trình theo đúng vai trò của bạn.
              </Typography.Paragraph>
            </Space>

            <Space direction="vertical" size={16}>
              <Space align="start" size={12}>
                <SafetyOutlined style={{ fontSize: 18 }} />
                <Space direction="vertical" size={0}>
                  <Typography.Text className="auth-side-panel__item-title">Bảo mật phiên đăng nhập</Typography.Text>
                  <Typography.Text className="auth-side-panel__item-description">Tự động kiểm soát truy cập theo quyền tài khoản.</Typography.Text>
                </Space>
              </Space>
              <Space align="start" size={12}>
                <CheckCircleOutlined style={{ fontSize: 18 }} />
                <Space direction="vertical" size={0}>
                  <Typography.Text className="auth-side-panel__item-title">Luồng xử lý rõ ràng</Typography.Text>
                  <Typography.Text className="auth-side-panel__item-description">Giao diện tối ưu để thao tác nhanh và ít sai sót.</Typography.Text>
                </Space>
              </Space>
            </Space>
          </Space>
        </Card>
      }
    >
      <AuthFormCard
        title="Đăng nhập"
        description="Chào mừng bạn quay lại. Vui lòng nhập thông tin để tiếp tục."
        icon={<LoginOutlined />}
        footer={
          <Space direction="vertical" size={6} style={{ width: "100%" }}>
            <Typography.Text type="secondary">
              Chưa có tài khoản?{" "}
              <Link to={ROUTE_URL.REGISTER}>
                <Typography.Text strong>Đăng ký ngay</Typography.Text>
              </Link>
            </Typography.Text>
            <Typography.Text type="secondary">
              Chưa xác thực email?{" "}
              <Link to={ROUTE_URL.VERIFY_REGISTRATION}>
                <Typography.Text strong>Nhập mã xác thực</Typography.Text>
              </Link>
            </Typography.Text>
          </Space>
        }
      >
        <Space direction="vertical" size={18} style={{ width: "100%" }}>
          <AuthInlineStatus status={status} />

          <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false} autoComplete="off" disabled={loading}>
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email." },
                { type: "email", message: "Email không đúng định dạng." },
              ]}
            >
              <Input size="large" placeholder="email@congty.com" />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu." },
                { min: 3, message: "Mật khẩu cần có ít nhất 3 ký tự." },
              ]}
            >
              <Input.Password size="large" placeholder="Nhập mật khẩu của bạn" />
            </Form.Item>

            <div className="mb-4 text-right">
              <Link to={ROUTE_URL.FORGOT_PASSWORD}>
                <Typography.Text>Tôi quên mật khẩu</Typography.Text>
              </Link>
            </div>

            <Button type="primary" size="large" htmlType="submit" loading={loading} block>
              Đăng nhập
            </Button>
          </Form>
        </Space>
      </AuthFormCard>
    </AuthPageShell>
  );
};

export default LoginPage;
