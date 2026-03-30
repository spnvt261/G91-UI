import { useState } from "react";
import { Alert, Breadcrumb, Button, Card, Form, Input, Space, Typography } from "antd";
import { canPerformAction } from "../../const/authz.const";
import { useNotify } from "../../context/notifyContext";
import type { ChangePasswordRequest } from "../../models/auth/auth.model";
import { authService } from "../../services/auth/auth.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage } from "../shared/page.utils";
import AuthInlineStatus, { type AuthInlineStatusValue } from "../../components/auth/AuthInlineStatus";
import { ApiClientError } from "../../apiConfig/axiosConfig";

interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

const ChangePasswordPage = () => {
  const { notify } = useNotify();
  const role = getStoredUserRole();
  const canChangePassword = canPerformAction(role, "profile.change-password");
  const [form] = Form.useForm<ChangePasswordFormValues>();
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<AuthInlineStatusValue | null>(null);

  const handleSubmit = async (values: ChangePasswordFormValues) => {
    setStatus(null);

    const payload: ChangePasswordRequest = {
      currentPassword: values.currentPassword,
      newPassword: values.newPassword,
      confirmNewPassword: values.confirmNewPassword,
    };

    try {
      setSubmitting(true);
      await authService.changePassword(payload);
      form.resetFields();
      setStatus({
        type: "success",
        message: "Đổi mật khẩu thành công",
        description: "Mật khẩu mới đã được áp dụng cho tài khoản của bạn.",
      });
      notify("Đổi mật khẩu thành công.", "success");
    } catch (error) {
      if (error instanceof ApiClientError && error.errors?.length) {
        form.setFields(
          error.errors.map((item) => ({
            name: item.field as keyof ChangePasswordFormValues,
            errors: [item.message],
          })),
        );
      }

      const message = getErrorMessage(error, "Không thể đổi mật khẩu. Vui lòng thử lại.");
      setStatus({
        type: "error",
        message: "Đổi mật khẩu chưa thành công",
        description: message,
      });
      notify(message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6 md:p-8">
      <Breadcrumb items={[{ title: "Trang chủ" }, { title: "Tài khoản" }, { title: "Đổi mật khẩu" }]} />

      <Card variant="borderless" className="shadow-sm">
        <Space orientation="vertical" size={16} style={{ width: "100%" }}>
          <div>
            <Typography.Title level={3} className="!mb-1">
              Đổi mật khẩu
            </Typography.Title>
            <Typography.Text type="secondary">
              Cập nhật mật khẩu mới để tăng cường bảo mật cho tài khoản của bạn.
            </Typography.Text>
          </div>

          {!canChangePassword ? (
            <Alert
              type="warning"
              showIcon
              message="Bạn không có quyền đổi mật khẩu"
              description="Vui lòng liên hệ quản trị viên nếu bạn cần hỗ trợ tài khoản."
            />
          ) : (
            <Space orientation="vertical" size={16} style={{ width: "100%" }}>
              <AuthInlineStatus status={status} />

              <Form
                form={form}
                layout="vertical"
                requiredMark={false}
                autoComplete="off"
                disabled={submitting}
                onFinish={handleSubmit}
              >
                <Form.Item
                  label="Mật khẩu hiện tại"
                  name="currentPassword"
                  rules={[{ required: true, message: "Vui lòng nhập mật khẩu hiện tại." }]}
                >
                  <Input.Password size="large" placeholder="Nhập mật khẩu hiện tại" />
                </Form.Item>

                <Form.Item
                  label="Mật khẩu mới"
                  name="newPassword"
                  rules={[
                    { required: true, message: "Vui lòng nhập mật khẩu mới." },
                    { min: 6, message: "Mật khẩu mới cần ít nhất 6 ký tự." },
                  ]}
                >
                  <Input.Password size="large" placeholder="Nhập mật khẩu mới" />
                </Form.Item>

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

                <Space>
                  <Button type="primary" htmlType="submit" loading={submitting}>
                    Cập nhật mật khẩu
                  </Button>
                  <Button onClick={() => form.resetFields()} disabled={submitting}>
                    Đặt lại
                  </Button>
                </Space>
              </Form>
            </Space>
          )}
        </Space>
      </Card>
    </div>
  );
};

export default ChangePasswordPage;
