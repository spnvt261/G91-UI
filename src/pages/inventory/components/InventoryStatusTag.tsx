import { Badge, Tag } from "antd";
import { getInventoryStockLevel, getInventoryStockMeta } from "../inventory.ui";

interface InventoryStatusTagProps {
  onHandQuantity: number;
  compact?: boolean;
}

const InventoryStatusTag = ({ onHandQuantity, compact = false }: InventoryStatusTagProps) => {
  const level = getInventoryStockLevel(onHandQuantity);
  const meta = getInventoryStockMeta(level);

  if (compact) {
    return <Badge status={meta.badgeStatus} text={meta.label} />;
  }

  return (
    <Tag color={meta.tagColor} style={{ marginInlineEnd: 0 }}>
      {meta.label}
    </Tag>
  );
};

export default InventoryStatusTag;
