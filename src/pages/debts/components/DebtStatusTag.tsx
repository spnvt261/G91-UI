import { Badge, Tag } from "antd";
import type { DebtStatus } from "../../../models/debt/debt.model";
import { getDebtStatusMeta } from "../debt.ui";

interface DebtStatusTagProps {
  status?: DebtStatus;
  compact?: boolean;
}

const DebtStatusTag = ({ status, compact = false }: DebtStatusTagProps) => {
  const meta = getDebtStatusMeta(status);

  if (compact) {
    return <Badge status={meta.badgeStatus} text={meta.label} />;
  }

  return (
    <Tag color={meta.tagColor} style={{ marginInlineEnd: 0 }}>
      {meta.label}
    </Tag>
  );
};

export default DebtStatusTag;
