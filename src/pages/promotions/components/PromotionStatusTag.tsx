import { Badge, Space, Tag } from "antd";
import type { PromotionStatus } from "../../../models/promotion/promotion.model";
import { getPromotionStatusAppearance } from "../promotion.utils";

interface PromotionStatusTagProps {
  status: PromotionStatus;
  withDot?: boolean;
}

const PromotionStatusTag = ({ status, withDot = false }: PromotionStatusTagProps) => {
  const appearance = getPromotionStatusAppearance(status);

  return (
    <Tag color={appearance.tagColor} style={{ marginInlineEnd: 0 }}>
      <Space size={6}>
        {withDot ? <Badge color={appearance.dotColor} /> : null}
        <span>{appearance.label}</span>
      </Space>
    </Tag>
  );
};

export default PromotionStatusTag;
