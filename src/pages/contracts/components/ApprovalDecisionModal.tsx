import { Alert, Form, Input, Modal, Space, Typography } from "antd";
import { useEffect } from "react";

type ApprovalDecision = "APPROVE" | "REJECT" | "REQUEST_MODIFICATION";

interface ApprovalDecisionModalProps {
  open: boolean;
  decision: ApprovalDecision;
  loading?: boolean;
  contractNumber?: string;
  onCancel: () => void;
  onSubmit: (comment: string) => void;
}

interface ApprovalDecisionFormValues {
  comment?: string;
}

const DECISION_CONTENT: Record<
  ApprovalDecision,
  {
    title: string;
    description: string;
    okText: string;
    messageType: "success" | "warning" | "error";
  }
> = {
  APPROVE: {
    title: "Xác nhận phê duyệt hợp đồng",
    description: "Hợp đồng sẽ chuyển sang trạng thái đã phê duyệt để tiếp tục triển khai.",
    okText: "Phê duyệt",
    messageType: "success",
  },
  REJECT: {
    title: "Xác nhận từ chối hợp đồng",
    description: "Vui lòng nêu rõ lý do để bộ phận liên quan xử lý và phản hồi kịp thời.",
    okText: "Từ chối",
    messageType: "error",
  },
  REQUEST_MODIFICATION: {
    title: "Yêu cầu chỉnh sửa hợp đồng",
    description: "Nhập nội dung cần chỉnh sửa để người lập hợp đồng cập nhật chính xác.",
    okText: "Gửi yêu cầu chỉnh sửa",
    messageType: "warning",
  },
};

const ApprovalDecisionModal = ({ open, decision, loading = false, contractNumber, onCancel, onSubmit }: ApprovalDecisionModalProps) => {
  const [form] = Form.useForm<ApprovalDecisionFormValues>();

  useEffect(() => {
    if (!open) {
      form.resetFields();
    }
  }, [form, open, decision]);

  const content = DECISION_CONTENT[decision];
  const requireComment = decision !== "APPROVE";

  const handleFinish = (values: ApprovalDecisionFormValues) => {
    onSubmit(values.comment?.trim() ?? "");
  };

  return (
    <Modal
      title={content.title}
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={loading}
      okText={content.okText}
      cancelText="Hủy"
      okButtonProps={decision === "REJECT" ? { danger: true } : undefined}
      maskClosable={!loading}
      closable={!loading}
    >
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <Alert type={content.messageType} showIcon message={content.description} />
        {contractNumber ? <Typography.Text strong>Hợp đồng: {contractNumber}</Typography.Text> : null}

        <Form form={form} layout="vertical" onFinish={handleFinish}>
          <Form.Item
            label={requireComment ? "Lý do / ghi chú bắt buộc" : "Ghi chú phê duyệt (không bắt buộc)"}
            name="comment"
            rules={requireComment ? [{ required: true, message: "Vui lòng nhập lý do trước khi gửi quyết định." }] : undefined}
          >
            <Input.TextArea rows={4} maxLength={1000} showCount placeholder={requireComment ? "Nhập lý do chi tiết..." : "Có thể để trống."} />
          </Form.Item>
        </Form>
      </Space>
    </Modal>
  );
};

export default ApprovalDecisionModal;
