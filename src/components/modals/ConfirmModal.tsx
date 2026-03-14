import ReactDOM from "react-dom";
import CustomButton from "../customButton/CustomButton";

export interface ConfirmModalProps {
  open: boolean;
  title?: string;
  label?: string;
  cancelText?: string;
  confirmText?: string;
  onCancel?: () => void;
  onConfirm?: () => void;
  disabledConfirm?: boolean;
}

const ConfirmModal = ({
  open,
  title = "Confirm",
  label = "Are you sure?",
  cancelText = "Cancel",
  confirmText = "Confirm",
  onCancel,
  onConfirm,
  disabledConfirm = false,
}: ConfirmModalProps) => {
  if (!open) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-[4px] shadow-lg min-w-[600px] animate-fadeIn">
        {/* Title */}
        <div className="border-b border-[#F0F0F0] px-[1.5rem] py-[1rem]">
          <h5 className="text-lg font-semibold text-[#000000D9]">{title}</h5>
        </div>

        {/* Label */}
        <div className="border-b border-[#F0F0F0] px-[1.5rem] py-[1rem]">
          <p className="text-sm text-gray-600 mb-6">{label}</p>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 p-3">
          <CustomButton 
            label={cancelText}
            onClick={onCancel}
            className="bg-gray-100 hover:bg-gray-200 text-gray-800"
          />
          <CustomButton 
              label={confirmText}
              onClick={onConfirm}
              disabled={disabledConfirm}
          />
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ConfirmModal;
