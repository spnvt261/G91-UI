import { Badge, Tag } from "antd";
import type { UserStatus } from "../../../models/auth/auth.model";
import { ACCOUNT_STATUS_LABEL } from "../accountPresentation";

interface AccountStatusTagProps {
  status: UserStatus;
  compact?: boolean;
}

const STATUS_COLOR: Record<UserStatus, { tag: string; badge: "success" | "processing" | "default" | "error" }> = {
  ACTIVE: { tag: "success", badge: "success" },
  INACTIVE: { tag: "default", badge: "default" },
  LOCKED: { tag: "error", badge: "error" },
  PENDING_VERIFICATION: { tag: "processing", badge: "processing" },
};

const AccountStatusTag = ({ status, compact = false }: AccountStatusTagProps) => {
  if (compact) {
    return <Badge status={STATUS_COLOR[status].badge} text={ACCOUNT_STATUS_LABEL[status]} />;
  }

  return <Tag color={STATUS_COLOR[status].tag}>{ACCOUNT_STATUS_LABEL[status]}</Tag>;
};

export default AccountStatusTag;
