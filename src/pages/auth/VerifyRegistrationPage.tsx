import { useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { CheckCircleOutlined, MailOutlined, SafetyCertificateOutlined, SendOutlined } from "@ant-design/icons";
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

type VerifyRegistrationLocationState = {
  email?: string;
  expireMinutes?: number;
};

interface VerifyRegistrationFormValues {
  email: string;
  verificationCode: string;
}

const isVerifyRegistrationLocationState = (value: unknown): value is VerifyRegistrationLocationState =>
  typeof value === "object" && value !== null;

const VerifyRegistrationPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { notify } = useNotify();
  const [form] = Form.useForm<VerifyRegistrationFormValues>();

  const locationState = useMemo(() => {
    if (!isVerifyRegistrationLocationState(location.state)) {
      return undefined;
    }

    return location.state;
  }, [location.state]);

  const emailFromQuery = useMemo(() => new URLSearchParams(location.search).get("email") ?? "", [location.search]);
  const [status, setStatus] = useState<AuthInlineStatusValue | null>(null);
  const [verifiedRoute, setVerifiedRoute] = useState<string | null>(null);
  const [expireMinutes, setExpireMinutes] = useState<number | null>(locationState?.expireMinutes ?? null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const handleVerifyRegistration = async (values: VerifyRegistrationFormValues) => {
    setStatus(null);
    try {
      setVerifyLoading(true);
      const response = await authService.verifyRegistration({
        email: values.email.trim(),
        verificationCode: values.verificationCode.trim().toUpperCase(),
      });
      setVerifiedRoute(response.redirectTo || ROUTE_URL.LOGIN);
      setStatus({
        type: "success",
        message: "Xác thực tài khoản thành công",
        description: "Bạn có thể tiếp tục đăng nhập để bắt đầu sử dụng hệ thống.",
      });
      notify("Xác thực tài khoản thành công.", "success");
    } catch (err) {
      if (err instanceof ApiClientError && err.errors?.length) {
        form.setFields(
          err.errors.map((item) => ({
            name: item.field as keyof VerifyRegistrationFormValues,
            errors: [item.message],
          })),
        );
      }
      const message = getErrorMessage(err, "Không thể xác thực tài khoản. Vui lòng kiểm tra lại thông tin.");
      setStatus({
        type: "error",
        message: "Xác thực chưa thành công",
        description: message,
      });
      notify(message, "error");
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleResendVerificationCode = async () => {
    try {
      const values = await form.validateFields(["email"]);
      const normalizedEmail = values.email.trim();

      setResendLoading(true);
      const response = await authService.resendVerificationCode({
        email: normalizedEmail,
      });
      setExpireMinutes(response.expireMinutes);
      setStatus({
        type: "info",
        message: "Đã gửi lại mã xác thực",
        description: `Mã mới có hiệu lực trong ${response.expireMinutes} phút.`,
      });
      notify(`Đã gửi lại mã xác thực. Mã có hiệu lực trong ${response.expireMinutes} phút.`, "success");
    } catch (err) {
      if (typeof err === "object" && err !== null && "errorFields" in err) {
        return;
      }

      const message = getErrorMessage(err, "Không thể gửi lại mã xác thực. Vui lòng thử lại.");
      setStatus({
        type: "error",
        message: "Không gửi lại được mã xác thực",
        description: message,
      });
      notify(message, "error");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <AuthPageShell
      sidePanel={
        <AuthHeroPanel
          eyebrow="Xác minh tài khoản"
          title="Hoàn tất kích hoạt trong một bước ngắn"
          description="Nhập email và mã xác thực để hoàn thành đăng ký. Sau khi xác minh thành công, bạn có thể đăng nhập và sử dụng hệ thống ngay."
          steps={[
            { title: "Đăng ký", description: "Tạo thông tin tài khoản mới." },
            { title: "Xác thực email", description: "Nhập mã gồm 5 ký tự được gửi qua email." },
            { title: "Hoàn tất", description: "Đăng nhập và bắt đầu làm việc." },
          ]}
          currentStep={1}
          highlights={[
            {
              icon: <CheckCircleOutlined />,
              title: "Mã xác thực có thời hạn",
              description: "Bạn có thể gửi lại mã mới nếu chưa nhận được email hoặc mã đã hết hạn.",
            },
          ]}
        />
      }
    >
      <AuthFormCard
        eyebrow="Bước 2 trong quy trình đăng ký"
        title="Xác thực tài khoản"
        description="Điền đúng email đã đăng ký và mã xác thực để kích hoạt tài khoản của bạn."
        icon={<SafetyCertificateOutlined />}
        extraTop={
          expireMinutes !== null ? <Alert showIcon type="info" message={`Mã xác thực hiện có hiệu lực trong ${expireMinutes} phút.`} /> : null
        }
        footer={
          <Typography.Text className="auth-footer-links__text">
            Đã xác thực xong?{" "}
            <Link to={ROUTE_URL.LOGIN} className="auth-footer-links__primary">
              Quay lại đăng nhập
            </Link>
          </Typography.Text>
        }
      >
        {verifiedRoute ? (
          <Result
            status="success"
            title="Xác thực thành công"
            subTitle="Tài khoản của bạn đã được kích hoạt và sẵn sàng đăng nhập."
            extra={
              <Button type="primary" className="auth-primary-btn" onClick={() => navigate(verifiedRoute, { replace: true })}>
                Đi đến đăng nhập
              </Button>
            }
          />
        ) : (
          <Space direction="vertical" size={18} style={{ width: "100%" }}>
            <AuthInlineStatus status={status} />

            <Form
              form={form}
              layout="vertical"
              onFinish={handleVerifyRegistration}
              initialValues={{ email: emailFromQuery || locationState?.email || "", verificationCode: "" }}
              requiredMark={false}
              autoComplete="off"
              disabled={verifyLoading || resendLoading}
            >
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
                label="Mã xác thực"
                name="verificationCode"
                getValueFromEvent={(event) => event.target.value.toUpperCase().replace(/\s/g, "").slice(0, 5)}
                rules={[
                  { required: true, message: "Vui lòng nhập mã xác thực." },
                  { len: 5, message: "Mã xác thực gồm 5 ký tự." },
                ]}
              >
                <Input size="large" placeholder="Ví dụ: ABCDE" prefix={<SafetyCertificateOutlined />} maxLength={5} />
              </Form.Item>

              <Typography.Text className="auth-form-helper">Nếu chưa nhận được email, hãy kiểm tra mục thư rác trước khi gửi lại mã.</Typography.Text>

              <Space direction="vertical" size={10} style={{ width: "100%", marginTop: 8 }}>
                <Button type="primary" htmlType="submit" size="large" loading={verifyLoading} className="auth-primary-btn" block>
                  Xác thực tài khoản
                </Button>
                <Button size="large" loading={resendLoading} onClick={handleResendVerificationCode} icon={<SendOutlined />} className="auth-secondary-btn" block>
                  Gửi lại mã xác thực
                </Button>
              </Space>
            </Form>
          </Space>
        )}
      </AuthFormCard>
    </AuthPageShell>
  );
};

export default VerifyRegistrationPage;
