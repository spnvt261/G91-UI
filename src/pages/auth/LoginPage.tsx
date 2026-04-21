import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircleOutlined, HomeOutlined, LockOutlined, LoginOutlined, MailOutlined, SafetyOutlined } from "@ant-design/icons";
import { Button, Form, Input, Space, Typography } from "antd";
import AuthFormCard from "../../components/auth/AuthFormCard";
import AuthHeroPanel from "../../components/auth/AuthHeroPanel";
import AuthInlineStatus, { type AuthInlineStatusValue } from "../../components/auth/AuthInlineStatus";
import AuthPageShell from "../../components/auth/AuthPageShell";
import { ApiClientError } from "../../apiConfig/axiosConfig";
import { getDefaultRouteByRole } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import { authService } from "../../services/auth/auth.service";
import { loginSuccess } from "../../store/authSlice";
import type { AppDispatch } from "../../store";
import { persistAuthSession } from "../../utils/authSession";
import { getErrorMessage } from "../shared/page.utils";

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
        <AuthHeroPanel
          eyebrow="Không gian làm việc số"
          title="Quản lý dữ liệu tập trung, bảo mật theo vai trò"
          description="Đăng nhập để theo dõi tiến độ, phối hợp phòng ban và kiểm soát toàn bộ quy trình vận hành trong một giao diện thống nhất."
          highlights={[
            {
              icon: <SafetyOutlined />,
              title: "Bảo mật phiên đăng nhập",
              description: "Phiên truy cập được kiểm soát tự động theo quyền của từng người dùng.",
            },
            {
              icon: <CheckCircleOutlined />,
              title: "Luồng thao tác rõ ràng",
              description: "Form gọn, trạng thái phản hồi rõ, giúp đăng nhập nhanh và ít sai sót.",
            },
          ]}
          note="Mẹo: nếu chưa kích hoạt email, bạn có thể xác thực tài khoản ngay từ trang này."
        />
      }
    >
      <AuthFormCard
        eyebrow="Chào mừng bạn quay lại"
        title="Đăng nhập"
        description="Nhập email và mật khẩu để truy cập hệ thống điều hành doanh nghiệp G90."
        icon={<LoginOutlined />}
        footer={
          <Space direction="vertical" size={8} className="auth-footer-links">
            <Typography.Text className="auth-footer-links__text">
              Chưa có tài khoản?{" "}
              <Link to={ROUTE_URL.REGISTER} className="auth-footer-links__primary">
                Đăng ký ngay
              </Link>
            </Typography.Text>
            <Typography.Text className="auth-footer-links__text">
              Chưa xác thực email?{" "}
              <Link to={ROUTE_URL.VERIFY_REGISTRATION} className="auth-footer-links__secondary">
                Nhập mã xác thực
              </Link>
            </Typography.Text>
            <Typography.Text className="auth-footer-links__text">
              <Link to={ROUTE_URL.HOME} className="auth-footer-links__secondary">
                <HomeOutlined style={{ marginRight: 6 }} />
                Về trang chủ
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
              <Input size="large" placeholder="email@congty.com" prefix={<MailOutlined />} />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu." },
                { min: 3, message: "Mật khẩu cần có ít nhất 3 ký tự." },
              ]}
            >
              <Input.Password size="large" placeholder="Nhập mật khẩu của bạn" prefix={<LockOutlined />} />
            </Form.Item>

            <div className="auth-form-link-row">
              <Link to={ROUTE_URL.FORGOT_PASSWORD} className="auth-form-link">
                Tôi quên mật khẩu
              </Link>
            </div>

            <Button type="primary" size="large" htmlType="submit" loading={loading} block className="auth-primary-btn">
              Đăng nhập
            </Button>
          </Form>
        </Space>
      </AuthFormCard>
    </AuthPageShell>
  );
};

export default LoginPage;
