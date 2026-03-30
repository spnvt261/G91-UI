import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircleOutlined, FormOutlined, MailOutlined, UserAddOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Divider, Form, Input, Space, Typography } from "antd";
import AuthFormCard from "../../components/auth/AuthFormCard";
import AuthInlineStatus, { type AuthInlineStatusValue } from "../../components/auth/AuthInlineStatus";
import AuthPageShell from "../../components/auth/AuthPageShell";
import { authService } from "../../services/auth/auth.service";
import { ROUTE_URL } from "../../const/route_url.const";
import { getErrorMessage } from "../shared/page.utils";
import { useNotify } from "../../context/notifyContext";
import { ApiClientError } from "../../apiConfig/axiosConfig";

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
        <Card bordered={false} className="auth-side-panel">
          <Space direction="vertical" size={24} style={{ width: "100%" }}>
            <Space direction="vertical" size={8}>
              <Typography.Text className="auth-side-panel__subtitle">BẮT ĐẦU SỬ DỤNG</Typography.Text>
              <Typography.Title level={2} className="!mb-0 !text-white">
                Tạo tài khoản trong vài bước
              </Typography.Title>
              <Typography.Paragraph className="auth-side-panel__subtitle !mb-0">
                Hoàn tất thông tin đăng ký, sau đó xác thực email để kích hoạt tài khoản và bắt đầu sử dụng hệ thống.
              </Typography.Paragraph>
            </Space>

            <Space direction="vertical" size={14}>
              <Space align="start" size={12}>
                <FormOutlined style={{ fontSize: 18 }} />
                <Space direction="vertical" size={0}>
                  <Typography.Text className="auth-side-panel__item-title">Bước 1: Điền thông tin</Typography.Text>
                  <Typography.Text className="auth-side-panel__item-description">Nhập đúng họ tên, email và mật khẩu.</Typography.Text>
                </Space>
              </Space>
              <Space align="start" size={12}>
                <MailOutlined style={{ fontSize: 18 }} />
                <Space direction="vertical" size={0}>
                  <Typography.Text className="auth-side-panel__item-title">Bước 2: Xác thực email</Typography.Text>
                  <Typography.Text className="auth-side-panel__item-description">Hệ thống gửi mã xác thực về email của bạn.</Typography.Text>
                </Space>
              </Space>
              <Space align="start" size={12}>
                <CheckCircleOutlined style={{ fontSize: 18 }} />
                <Space direction="vertical" size={0}>
                  <Typography.Text className="auth-side-panel__item-title">Bước 3: Hoàn tất kích hoạt</Typography.Text>
                  <Typography.Text className="auth-side-panel__item-description">Đăng nhập và bắt đầu làm việc ngay.</Typography.Text>
                </Space>
              </Space>
            </Space>
          </Space>
        </Card>
      }
    >
      <AuthFormCard
        title="Tạo tài khoản"
        description="Thiết lập tài khoản mới để quản lý báo giá, hợp đồng và đơn hàng."
        icon={<UserAddOutlined />}
        extraTop={
          <Alert
            showIcon
            type="info"
            message="Sau khi đăng ký, bạn cần xác thực email để kích hoạt tài khoản."
          />
        }
        footer={
          <Typography.Text type="secondary">
            Đã có tài khoản?{" "}
            <Link to={ROUTE_URL.LOGIN}>
              <Typography.Text strong>Quay lại đăng nhập</Typography.Text>
            </Link>
          </Typography.Text>
        }
      >
        <Space direction="vertical" size={18} style={{ width: "100%" }}>
          <AuthInlineStatus status={status} />

          <Form form={form} layout="vertical" onFinish={handleRegister} requiredMark={false} autoComplete="off" disabled={loading}>
            <Typography.Title level={5} className="!mb-3">
              Thông tin tài khoản
            </Typography.Title>

            <Form.Item
              label="Họ và tên"
              name="fullName"
              rules={[
                { required: true, message: "Vui lòng nhập họ và tên." },
                { min: 2, message: "Họ và tên cần ít nhất 2 ký tự." },
              ]}
            >
              <Input size="large" placeholder="Ví dụ: Nguyễn Văn A" />
            </Form.Item>

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

            <Divider />

            <Typography.Title level={5} className="!mb-3">
              Mật khẩu
            </Typography.Title>

            <Form.Item
              label="Mật khẩu"
              name="password"
              rules={[
                { required: true, message: "Vui lòng nhập mật khẩu." },
                { min: 6, message: "Mật khẩu cần có ít nhất 6 ký tự." },
              ]}
            >
              <Input.Password size="large" placeholder="Tối thiểu 6 ký tự" />
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
              <Input.Password size="large" placeholder="Nhập lại mật khẩu" />
            </Form.Item>

            <Button type="primary" size="large" htmlType="submit" loading={loading} block>
              Tạo tài khoản
            </Button>
          </Form>
        </Space>
      </AuthFormCard>
    </AuthPageShell>
  );
};

export default RegisterPage;
