import { Badge, Tag } from "antd";
import type { QuotationDisplayStatus } from "../../../models/quotation/quotation.model";
import { getQuotationStatusMeta } from "../quotation.ui";

interface QuotationStatusTagProps {
  status: QuotationDisplayStatus;
  compact?: boolean;
}

const QuotationStatusTag = ({ status, compact = false }: QuotationStatusTagProps) => {
  const meta = getQuotationStatusMeta(status);

  if (compact) {
    return <Badge status={meta.badgeStatus} text={meta.label} />;
  }

  return <Tag color={meta.tagColor}>{meta.label}</Tag>;
};

export default QuotationStatusTag;
