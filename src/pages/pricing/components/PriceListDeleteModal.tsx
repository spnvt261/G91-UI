import { Alert, Modal, Space, Typography } from "antd";

interface PriceListDeleteModalProps {
  open: boolean;
  submitting?: boolean;
  priceListName?: string;
  onCancel: () => void;
  onConfirm: () => void;
}

const PriceListDeleteModal = ({ open, submitting = false, priceListName, onCancel, onConfirm }: PriceListDeleteModalProps) => {
  return (
    <Modal
      title="Xác nhận xoá bảng giá"
      open={open}
      onCancel={submitting ? undefined : onCancel}
      closable={!submitting}
      mask={{ closable: !submitting }}
      onOk={onConfirm}
      okText="Xoá bảng giá"
      cancelText="Huỷ"
      okButtonProps={{ danger: true, loading: submitting }}
      destroyOnClose
    >
      <Space orientation="vertical" size={14} style={{ width: "100%" }}>
        <Alert
          type="warning"
          showIcon
          message="Bảng giá sẽ chuyển sang trạng thái đã xoá mềm."
          description="Dữ liệu lịch sử liên quan vẫn có thể được tham chiếu tùy chính sách hệ thống."
        />

        <Typography.Paragraph style={{ marginBottom: 0 }}>
          Bạn sắp xoá bảng giá <Typography.Text strong>{priceListName || "Chưa xác định"}</Typography.Text>. Vui lòng xác nhận để tiếp tục.
        </Typography.Paragraph>
      </Space>
    </Modal>
  );
};

export default PriceListDeleteModal;
