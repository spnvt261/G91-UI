import { Badge, Tag } from "antd";
import type { SaleOrderStatus } from "../../../models/sale-order/sale-order.model";
import { getSaleOrderStatusMeta } from "../saleOrder.ui";

interface SaleOrderStatusTagProps {
  status?: SaleOrderStatus;
  compact?: boolean;
}

const SaleOrderStatusTag = ({ status, compact = false }: SaleOrderStatusTagProps) => {
  const meta = getSaleOrderStatusMeta(status);

  if (compact) {
    return <Badge status={meta.badgeStatus} text={meta.label} />;
  }

  return (
    <Tag color={meta.tagColor} style={{ marginInlineEnd: 0 }}>
      {meta.label}
    </Tag>
  );
};

export default SaleOrderStatusTag;
