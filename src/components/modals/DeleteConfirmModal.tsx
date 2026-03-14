import ConfirmModal, { type ConfirmModalProps } from "./ConfirmModal";

interface DeleteConfirmModalProps extends Omit<ConfirmModalProps, "title" | "label" | "confirmText" | "cancelText"> {
  itemName?: string;
}

const DeleteConfirmModal = ({ itemName = "this item", ...props }: DeleteConfirmModalProps) => {
  return (
    <ConfirmModal
      {...props}
      title="Delete product"
      label={`Are you sure you want to delete ${itemName}?`}
      confirmText="Delete"
      cancelText="Cancel"
    />
  );
};

export default DeleteConfirmModal;