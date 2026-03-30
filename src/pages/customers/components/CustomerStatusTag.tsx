import { Badge, Tag } from "antd";
import type { CustomerModel } from "../../../models/customer/customer.model";
import { CUSTOMER_STATUS_TEXT } from "../customer.constants";

interface CustomerStatusTagProps {
  status?: CustomerModel["status"];
  showBadge?: boolean;
}

const CustomerStatusTag = ({ status, showBadge = false }: CustomerStatusTagProps) => {
  if (!status) {
    if (showBadge) {
      return <Badge status="default" text="Chưa cập nhật" />;
    }

    return <Tag>Chưa cập nhật</Tag>;
  }

  if (status === "INACTIVE") {
    if (showBadge) {
      return <Badge status="error" text={CUSTOMER_STATUS_TEXT.INACTIVE} />;
    }

    return <Tag color="error">{CUSTOMER_STATUS_TEXT.INACTIVE}</Tag>;
  }

  if (showBadge) {
    return <Badge status="success" text={CUSTOMER_STATUS_TEXT.ACTIVE} />;
  }

  return <Tag color="success">{CUSTOMER_STATUS_TEXT.ACTIVE}</Tag>;
};

export default CustomerStatusTag;
