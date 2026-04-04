import { Badge, Tag } from "antd";
import type { InvoiceStatus } from "../../../models/invoice/invoice.model";
import { getInvoiceStatusMeta } from "../invoice.ui";

interface InvoiceStatusTagProps {
  status?: InvoiceStatus;
  compact?: boolean;
}

const InvoiceStatusTag = ({ status, compact = false }: InvoiceStatusTagProps) => {
  const meta = getInvoiceStatusMeta(status);

  if (compact) {
    return <Badge status={meta.badgeStatus} text={meta.label} />;
  }

  return (
    <Tag color={meta.tagColor} style={{ marginInlineEnd: 0 }}>
      {meta.label}
    </Tag>
  );
};

export default InvoiceStatusTag;
