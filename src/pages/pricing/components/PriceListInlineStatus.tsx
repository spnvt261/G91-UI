import { Badge, Space, Tag } from "antd";
import type { PriceListStatus } from "../../../models/pricing/price-list.model";
import {
  getPriceListStatusText,
  getPriceListValidityState,
  getPriceListValidityText,
  type PriceListValidityState,
} from "../priceList.ui";

interface PriceListInlineStatusProps {
  status: PriceListStatus;
  validFrom?: string;
  validTo?: string;
  showBadge?: boolean;
  showValidity?: boolean;
}

const mapStatusColor = (status: PriceListStatus): { tag: string; badge: "success" | "default" } => {
  return status === "ACTIVE" ? { tag: "success", badge: "success" } : { tag: "default", badge: "default" };
};

const mapValidityColor = (state: PriceListValidityState): string => {
  switch (state) {
    case "active":
      return "green";
    case "expiring":
      return "gold";
    case "expired":
      return "red";
    case "upcoming":
      return "blue";
    default:
      return "default";
  }
};

const PriceListInlineStatus = ({ status, validFrom, validTo, showBadge = false, showValidity = true }: PriceListInlineStatusProps) => {
  const statusText = getPriceListStatusText(status);
  const validityState = getPriceListValidityState(validFrom, validTo);
  const validityText = getPriceListValidityText(validityState);
  const statusColor = mapStatusColor(status);

  if (showBadge) {
    return (
      <Space orientation="vertical" size={2}>
        <Badge status={statusColor.badge} text={statusText} />
        {showValidity ? <Tag color={mapValidityColor(validityState)}>{validityText}</Tag> : null}
      </Space>
    );
  }

  return (
    <Space size={6} wrap>
      <Tag color={statusColor.tag}>{statusText}</Tag>
      {showValidity ? <Tag color={mapValidityColor(validityState)}>{validityText}</Tag> : null}
    </Space>
  );
};

export default PriceListInlineStatus;
