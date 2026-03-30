import { useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircleOutlined, LockOutlined, MailOutlined, SafetyOutlined } from "@ant-design/icons";
import { Alert, Button, Form, Input, Result, Space, Typography } from "antd";
import AuthFormCard from "../../components/auth/AuthFormCard";
import AuthHeroPanel from "../../components/auth/AuthHeroPanel";
import AuthInlineStatus, { type AuthInlineStatusValue } from "../../components/auth/AuthInlineStatus";
import AuthPageShell from "../../components/auth/AuthPageShell";
import { ApiClientError } from "../../apiConfig/axiosConfig";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import { authService } from "../../services/auth/auth.service";
import { getErrorMessage } from "../shared/page.utils";

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
    <AuthPageShell
      sidePanel={
        <AuthHeroPanel
          eyebrow="Khôi phục quyền truy cập"
          title="Đổi mật khẩu nhanh, không gián đoạn công việc"
          description="Chỉ cần nhập email đã đăng ký, hệ thống sẽ gửi hướng dẫn đặt lại mật khẩu để bạn truy cập lại tài khoản an toàn."
          highlights={[
            {
              icon: <SafetyOutlined />,
              title: "Quy trình bảo mật",
              description: "Liên kết khôi phục chỉ gửi đến email đã đăng ký và có thời hạn sử dụng.",
            },
            {
              icon: <CheckCircleOutlined />,
              title: "Thao tác rõ ràng",
              description: "Mỗi bước đều có thông báo trạng thái để bạn dễ theo dõi và xử lý.",
            },
          ]}
        />
      }
    >
      <AuthFormCard
        eyebrow="Hỗ trợ tài khoản"
        title="Quên mật khẩu"
        description="Nhập email đã đăng ký để nhận liên kết đặt lại mật khẩu."
        icon={<LockOutlined />}
        extraTop={<Alert showIcon type="info" message="Nếu email hợp lệ, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu trong vài phút." />}
        footer={
          <Typography.Text className="auth-footer-links__text">
            Nhớ lại mật khẩu rồi?{" "}
            <Link to={ROUTE_URL.LOGIN} className="auth-footer-links__primary">
              Quay lại đăng nhập
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
              <div className="auth-result-actions">
                <Link to={ROUTE_URL.LOGIN}>
                  <Button type="primary" className="auth-primary-btn">
                    Về trang đăng nhập
                  </Button>
                </Link>
                <Button
                  onClick={() => {
                    setSubmittedEmail(null);
                    setStatus(null);
                  }}
                >
                  Gửi lại yêu cầu
                </Button>
              </div>
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

              <Button type="primary" htmlType="submit" size="large" loading={loading} block className="auth-primary-btn">
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
