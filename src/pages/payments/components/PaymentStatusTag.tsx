import { Badge, Tag } from "antd";
import type { InvoiceModel } from "../../../models/payment/payment.model";
import { getInvoiceDisplayStatus, getInvoiceStatusMeta, type InvoiceDisplayStatus } from "../payment.ui";

interface PaymentStatusTagProps {
  status?: InvoiceModel["status"];
  dueDate?: string;
  dueAmount?: number;
  compact?: boolean;
}

const PaymentStatusTag = ({ status, dueDate, dueAmount, compact = false }: PaymentStatusTagProps) => {
  const displayStatus: InvoiceDisplayStatus =
    status && dueAmount != null
      ? getInvoiceDisplayStatus({
          status,
          dueDate,
          dueAmount,
        })
      : "UNPAID";

  const meta = getInvoiceStatusMeta(displayStatus);

  if (compact) {
    return <Badge status={meta.badgeStatus} text={meta.label} />;
  }

  return (
    <Tag color={meta.tagColor} style={{ marginInlineEnd: 0 }}>
      {meta.label}
    </Tag>
  );
};

export default PaymentStatusTag;
