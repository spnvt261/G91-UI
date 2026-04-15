import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FormOutlined, LockOutlined, MailOutlined, UserAddOutlined, UserOutlined } from "@ant-design/icons";
import { Alert, Button, Col, Divider, Form, Input, Row, Space, Typography } from "antd";
import AuthFormCard from "../../components/auth/AuthFormCard";
import AuthHeroPanel from "../../components/auth/AuthHeroPanel";
import AuthInlineStatus, { type AuthInlineStatusValue } from "../../components/auth/AuthInlineStatus";
import AuthPageShell from "../../components/auth/AuthPageShell";
import { ApiClientError } from "../../apiConfig/axiosConfig";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import { authService } from "../../services/auth/auth.service";
import { getErrorMessage } from "../shared/page.utils";

interface RegisterFormValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage = () => {
  const navigate = useNavigate();
  const { notify } = useNotify();
  const [form] = Form.useForm<RegisterFormValues>();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<AuthInlineStatusValue | null>(null);

  const handleRegister = async (values: RegisterFormValues) => {
    setStatus(null);
    try {
      setLoading(true);
      const response = await authService.register({
        fullName: values.fullName.trim(),
        email: values.email.trim(),
        password: values.password,
        confirmPassword: values.confirmPassword,
      });

      const nextRoute = response.redirectTo || ROUTE_URL.VERIFY_REGISTRATION;
      notify("Tạo tài khoản thành công. Vui lòng xác thực email để kích hoạt tài khoản.", "success");
      navigate(nextRoute, {
        state: {
          email: response.email || values.email.trim(),
          expireMinutes: response.expireMinutes,
        },
      });
    } catch (err) {
      if (err instanceof ApiClientError && err.errors?.length) {
        form.setFields(
          err.errors.map((item) => ({
            name: item.field as keyof RegisterFormValues,
            errors: [item.message],
          })),
        );
      }

      const message = getErrorMessage(err, "Không thể tạo tài khoản. Vui lòng kiểm tra lại thông tin.");
      setStatus({
        type: "error",
        message: "Đăng ký chưa thành công",
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
          eyebrow="Bắt đầu trong vài phút"
          title="Hành trình onboarding rõ ràng và an tâm"
          description="Bạn chỉ cần hoàn tất thông tin tài khoản, xác thực email và đăng nhập để bắt đầu sử dụng toàn bộ tiện ích của hệ thống G90."
          steps={[
            { title: "Điền thông tin", description: "Nhập họ tên, email và mật khẩu mới." },
            { title: "Xác thực email", description: "Nhập mã xác thực được gửi đến hộp thư." },
            { title: "Bắt đầu sử dụng", description: "Đăng nhập và truy cập không gian làm việc." },
          ]}
          currentStep={0}
          note="Email xác thực sẽ có thời hạn, bạn có thể gửi lại mã bất kỳ lúc nào."
        />
      }
    >
      <AuthFormCard
        eyebrow="Khởi tạo tài khoản mới"
        title="Đăng ký"
        description="Tạo tài khoản để quản lý báo giá, hợp đồng, đơn hàng và các nghiệp vụ vận hành trên một nền tảng thống nhất."
        icon={<UserAddOutlined />}
        extraTop={<Alert showIcon type="info" message="Sau khi đăng ký, bạn cần xác thực email để kích hoạt tài khoản." />}
        footer={
          <Typography.Text className="auth-footer-links__text">
            Đã có tài khoản?{" "}
            <Link to={ROUTE_URL.LOGIN} className="auth-footer-links__primary">
              Quay lại đăng nhập
            </Link>
          </Typography.Text>
        }
      >
        <Space direction="vertical" size={18} style={{ width: "100%" }}>
          <AuthInlineStatus status={status} />

          <Form form={form} layout="vertical" onFinish={handleRegister} requiredMark={false} autoComplete="off" disabled={loading}>
            <Typography.Text className="auth-form-section-title">Thông tin tài khoản</Typography.Text>

            <Row gutter={12}>
              <Col xs={24} md={12}>
                <Form.Item
                  label="Họ và tên"
                  name="fullName"
                  rules={[
                    { required: true, message: "Vui lòng nhập họ và tên." },
                    { min: 2, message: "Họ và tên cần ít nhất 2 ký tự." },
                  ]}
                >
                  <Input size="large" placeholder="Ví dụ: Nguyễn Văn A" prefix={<UserOutlined />} />
                </Form.Item>
              </Col>

              <Col xs={24} md={12}>
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
              </Col>
            </Row>

            <Divider style={{ margin: "8px 0 14px", borderColor: "#e8eef5" }} />

            <Typography.Text className="auth-form-section-title">Mật khẩu</Typography.Text>
            <Typography.Text className="auth-form-helper">Mật khẩu nên có chữ hoa, chữ thường, số và ký tự đặc biệt để tăng độ an toàn.</Typography.Text>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu." },
                { min: 6, message: "Mật khẩu cần có ít nhất 6 ký tự." },
              ]}
            >
              <Input.Password size="large" placeholder="Tối thiểu 6 ký tự" prefix={<LockOutlined />} />
            </Form.Item>

            <Form.Item
              label="Xác nhận mật khẩu"
              name="confirmPassword"
              dependencies={["password"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu." },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error("Mật khẩu xác nhận không khớp."));
                  },
                }),
              ]}
            >
              <Input.Password size="large" placeholder="Nhập lại mật khẩu" prefix={<FormOutlined />} />
            </Form.Item>

            <Button type="primary" size="large" htmlType="submit" loading={loading} block className="auth-primary-btn">
              Tạo tài khoản
            </Button>
          </Form>
        </Space>
      </AuthFormCard>
    </AuthPageShell>
  );
};

export default RegisterPage;
