import { useState } from "react";
import { Link } from "react-router-dom";
import { LockOutlined, MailOutlined } from "@ant-design/icons";
import { Button, Form, Input, Result, Space, Typography } from "antd";
import AuthFormCard from "../../components/auth/AuthFormCard";
import AuthInlineStatus, { type AuthInlineStatusValue } from "../../components/auth/AuthInlineStatus";
import AuthPageShell from "../../components/auth/AuthPageShell";
import { authService } from "../../services/auth/auth.service";
import { ROUTE_URL } from "../../const/route_url.const";
import { getErrorMessage } from "../shared/page.utils";
import { useNotify } from "../../context/notifyContext";
import { ApiClientError } from "../../apiConfig/axiosConfig";

interface ForgotPasswordFormValues {
  email: string;
}

const ForgotPasswordPage = () => {
  const { notify } = useNotify();
  const [form] = Form.useForm<ForgotPasswordFormValues>();
  const [loading, setLoading] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthInlineStatusValue | null>(null);

  const handleSubmit = async (values: ForgotPasswordFormValues) => {
    setStatus(null);
    try {
      setLoading(true);
      await authService.forgotPassword({ email: values.email.trim() });
      setSubmittedEmail(values.email.trim());
      notify("Yêu cầu đặt lại mật khẩu đã được gửi.", "success");
    } catch (err) {
      if (err instanceof ApiClientError && err.errors?.length) {
        form.setFields(
          err.errors.map((item) => ({
            name: item.field as keyof ForgotPasswordFormValues,
            errors: [item.message],
          })),
        );
      }

      const message = getErrorMessage(err, "Không thể gửi yêu cầu đặt lại mật khẩu.");
      setStatus({
        type: "error",
        message: "Không thể xử lý yêu cầu",
        description: message,
      });
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthPageShell>
      <AuthFormCard
        title="Quên mật khẩu"
        description="Nhập email đã đăng ký để nhận hướng dẫn đặt lại mật khẩu."
        icon={<LockOutlined />}
        footer={
          <Typography.Text type="secondary">
            Nhớ lại mật khẩu rồi?{" "}
            <Link to={ROUTE_URL.LOGIN}>
              <Typography.Text strong>Quay lại đăng nhập</Typography.Text>
            </Link>
          </Typography.Text>
        }
      >
        {submittedEmail ? (
          <Result
            status="success"
            title="Yêu cầu đã được gửi"
            subTitle={`Nếu email ${submittedEmail} tồn tại trong hệ thống, chúng tôi đã gửi hướng dẫn đặt lại mật khẩu.`}
            extra={
              <Space>
                <Link to={ROUTE_URL.LOGIN}>
                  <Button type="primary">Về trang đăng nhập</Button>
                </Link>
                <Button
                  onClick={() => {
                    setSubmittedEmail(null);
                    setStatus(null);
                  }}
                >
                  Gửi lại yêu cầu
                </Button>
              </Space>
            }
          />
        ) : (
          <Space direction="vertical" size={18} style={{ width: "100%" }}>
            <AuthInlineStatus status={status} />

            <Form form={form} layout="vertical" onFinish={handleSubmit} requiredMark={false} autoComplete="off" disabled={loading}>
              <Form.Item
                label="Email đăng ký"
                name="email"
                rules={[
                  { required: true, message: "Vui lòng nhập email." },
                  { type: "email", message: "Email không đúng định dạng." },
                ]}
              >
                <Input size="large" prefix={<MailOutlined />} placeholder="email@congty.com" />
              </Form.Item>

              <Button type="primary" htmlType="submit" size="large" loading={loading} block>
                Gửi hướng dẫn đặt lại mật khẩu
              </Button>
            </Form>
          </Space>
        )}
      </AuthFormCard>
    </AuthPageShell>
  );
};

export default ForgotPasswordPage;
