import type { UserStatus } from "../../models/auth/auth.model";
import type { AccountRoleId } from "../../models/account/account.model";

export const ACCOUNT_ROLE_LABEL: Record<AccountRoleId, string> = {
  OWNER: "Chủ hệ thống",
  ACCOUNTANT: "Kế toán",
  WAREHOUSE: "Kho vận",
  CUSTOMER: "Khách hàng",
};

export const ACCOUNT_STATUS_LABEL: Record<UserStatus, string> = {
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Tạm ngưng",
  LOCKED: "Đang khóa",
  PENDING_VERIFICATION: "Chờ xác thực",
};

export const formatAccountDateTime = (value?: string): string => {
  if (!value) {
    return "Chưa cập nhật";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(parsed);
};
