import { Badge, Tag } from "antd";
import type { PaymentConfirmationStatus } from "../../../models/payment-confirmation/payment-confirmation.model";
import { getPaymentConfirmationStatusMeta } from "../paymentConfirmation.ui";

interface PaymentConfirmationStatusTagProps {
  status?: PaymentConfirmationStatus;
  compact?: boolean;
}

const PaymentConfirmationStatusTag = ({ status, compact = false }: PaymentConfirmationStatusTagProps) => {
  const meta = getPaymentConfirmationStatusMeta(status);

  if (compact) {
    return <Badge status={meta.badgeStatus} text={meta.label} />;
  }

  return (
    <Tag color={meta.tagColor} style={{ marginInlineEnd: 0 }}>
      {meta.label}
    </Tag>
  );
};

export default PaymentConfirmationStatusTag;
