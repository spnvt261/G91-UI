import { Alert, Form, Input, Modal, Space, Typography } from "antd";
import type { FormInstance } from "antd";
import { toCurrency } from "../../shared/page.utils";

export interface CustomerDisableFormValues {
  reason: string;
}

interface CustomerDisableModalProps {
  open: boolean;
  customerName?: string;
  outstandingDebt?: number;
  activeProjectCount?: number;
  openContractCount?: number;
  disableBlockers?: string[];
  submitting?: boolean;
  form: FormInstance<CustomerDisableFormValues>;
  onCancel: () => void;
  onConfirm: () => void;
}

const CustomerDisableModal = ({
  open,
  customerName,
  outstandingDebt = 0,
  activeProjectCount = 0,
  openContractCount = 0,
  disableBlockers = [],
  submitting = false,
  form,
  onCancel,
  onConfirm,
}: CustomerDisableModalProps) => {
  const hasBusinessRisk = outstandingDebt > 0 || activeProjectCount > 0 || openContractCount > 0 || disableBlockers.length > 0;

  return (
    <Modal
      title="Xác nhận vô hiệu hóa khách hàng"
      open={open}
      onCancel={submitting ? undefined : onCancel}
      closable={!submitting}
      maskClosable={!submitting}
      onOk={onConfirm}
      okText="Xác nhận vô hiệu hóa"
      okButtonProps={{ danger: true, loading: submitting }}
      cancelText="Hủy"
      destroyOnClose
    >
      <Space direction="vertical" size={14} style={{ width: "100%" }}>
        <Alert
          type={hasBusinessRisk ? "error" : "warning"}
          showIcon
          message={hasBusinessRisk ? "Khách hàng này có ràng buộc nghiệp vụ cần lưu ý." : "Khách hàng sẽ chuyển sang trạng thái ngừng hoạt động."}
          description={
            hasBusinessRisk
              ? "Vui lòng kiểm tra công nợ, dự án đang hoạt động và hợp đồng mở trước khi xác nhận."
              : "Bạn vẫn có thể xem hồ sơ nhưng các thao tác nghiệp vụ liên quan có thể bị hạn chế."
          }
        />

        {hasBusinessRisk ? (
          <Alert
            type="warning"
            showIcon
            message="Tổng hợp điều kiện chặn hoặc cảnh báo"
            description={
              <Space direction="vertical" size={2}>
                <Typography.Text>Công nợ hiện tại: {toCurrency(outstandingDebt)}</Typography.Text>
                <Typography.Text>Số dự án đang hoạt động: {activeProjectCount}</Typography.Text>
                <Typography.Text>Số hợp đồng mở: {openContractCount}</Typography.Text>
                {disableBlockers.length > 0 ? (
                  <Typography.Text>Lý do chặn: {disableBlockers.join("; ")}</Typography.Text>
                ) : null}
              </Space>
            }
          />
        ) : null}

        <Typography.Paragraph style={{ marginBottom: 0 }}>
          Bạn sắp vô hiệu hóa khách hàng <Typography.Text strong>{customerName || "Chưa xác định"}</Typography.Text>. Vui lòng nhập lý do để
          lưu lại lịch sử thao tác.
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
