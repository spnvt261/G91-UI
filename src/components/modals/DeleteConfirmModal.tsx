import ConfirmModal, { type ConfirmModalProps } from "./ConfirmModal";

interface DeleteConfirmModalProps extends Omit<ConfirmModalProps, "title" | "label" | "confirmText" | "cancelText"> {
  itemName?: string;
}

const DeleteConfirmModal = ({ itemName = "mục này", ...props }: DeleteConfirmModalProps) => {
  return (
    <ConfirmModal
      {...props}
      title="Xóa sản phẩm"
      label={`Bạn có chắc chắn muốn xóa ${itemName}?`}
      confirmText="Xóa"
      cancelText="Hủy"
    />
  );
};

export default DeleteConfirmModal;
