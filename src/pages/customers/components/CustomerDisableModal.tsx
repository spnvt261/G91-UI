import { Alert, Form, Input, Modal, Space, Typography } from "antd";
import type { FormInstance } from "antd";

export interface CustomerDisableFormValues {
  reason: string;
}

interface CustomerDisableModalProps {
  open: boolean;
  customerName?: string;
  submitting?: boolean;
  form: FormInstance<CustomerDisableFormValues>;
  onCancel: () => void;
  onConfirm: () => void;
}

const CustomerDisableModal = ({ open, customerName, submitting = false, form, onCancel, onConfirm }: CustomerDisableModalProps) => {
  return (
    <Modal
      title="Xác nhận vô hiệu hóa khách hàng"
      open={open}
      onCancel={submitting ? undefined : onCancel}
      closable={!submitting}
      mask={{ closable: !submitting }}
      onOk={onConfirm}
      okText="Xác nhận vô hiệu hóa"
      okButtonProps={{ danger: true, loading: submitting }}
      cancelText="Hủy"
      destroyOnClose
    >
      <Space orientation="vertical" size={14} style={{ width: "100%" }}>
        <Alert
          type="warning"
          showIcon
          message="Khách hàng sẽ chuyển sang trạng thái ngừng hoạt động."
          description="Bạn vẫn có thể xem hồ sơ, nhưng các thao tác nghiệp vụ liên quan có thể bị hạn chế tùy chính sách hệ thống."
        />

        <Typography.Paragraph style={{ marginBottom: 0 }}>
          Bạn sắp vô hiệu hóa khách hàng <Typography.Text strong>{customerName || "Chưa xác định"}</Typography.Text>.
          Vui lòng nhập lý do để lưu lại lịch sử thao tác.
        </Typography.Paragraph>

        <Form<CustomerDisableFormValues> form={form} layout="vertical">
          <Form.Item
            name="reason"
            label="Lý do vô hiệu hóa"
            rules={[
              { required: true, message: "Vui lòng nhập lý do vô hiệu hóa." },
              { max: 1000, message: "Lý do tối đa 1000 ký tự." },
            ]}
          >
            <Input.TextArea rows={4} placeholder="Ví dụ: Khách hàng tạm ngừng hợp tác đến quý sau." showCount maxLength={1000} />
          </Form.Item>
        </Form>
      </Space>
    </Modal>
  );
};

export default CustomerDisableModal;
