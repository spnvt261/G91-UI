import { Alert } from "antd";

export type AuthInlineStatusType = "success" | "info" | "warning" | "error";

export interface AuthInlineStatusValue {
  type: AuthInlineStatusType;
  message: string;
  description?: string;
}

interface AuthInlineStatusProps {
  status: AuthInlineStatusValue | null;
  closable?: boolean;
  onClose?: () => void;
}

const AuthInlineStatus = ({ status, closable = false, onClose }: AuthInlineStatusProps) => {
  if (!status) {
    return null;
  }

  return (
    <Alert
      showIcon
      type={status.type}
      message={status.message}
      description={status.description}
      closable={closable}
      onClose={onClose}
    />
  );
};

export default AuthInlineStatus;
