import { Tag } from "antd";
import type { AccountRoleId } from "../../../models/account/account.model";
import { ACCOUNT_ROLE_LABEL } from "../accountPresentation";

interface AccountRoleTagProps {
  role: AccountRoleId;
}

const ROLE_TAG_COLOR: Record<AccountRoleId, string> = {
  OWNER: "gold",
  ACCOUNTANT: "blue",
  WAREHOUSE: "geekblue",
  CUSTOMER: "green",
};

const AccountRoleTag = ({ role }: AccountRoleTagProps) => {
  return <Tag color={ROLE_TAG_COLOR[role]}>{ACCOUNT_ROLE_LABEL[role]}</Tag>;
};

export default AccountRoleTag;
