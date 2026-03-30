import { Badge, Tag } from "antd";
import type { ContractStatus } from "../../../models/contract/contract.model";
import { getContractStatusMeta } from "../contract.ui";

interface ContractStatusTagProps {
  status?: ContractStatus | string;
  compact?: boolean;
}

const ContractStatusTag = ({ status, compact = false }: ContractStatusTagProps) => {
  const meta = getContractStatusMeta(status);

  if (compact) {
    return <Badge status={meta.badgeStatus} text={meta.label} />;
  }

  return (
    <Tag color={meta.tagColor} style={{ marginInlineEnd: 0 }}>
      {meta.label}
    </Tag>
  );
};

export default ContractStatusTag;
