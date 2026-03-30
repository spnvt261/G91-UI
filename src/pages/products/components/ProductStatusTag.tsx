import { Badge, Tag } from "antd";
import type { ProductStatus } from "../../../models/product/product.model";
import { PRODUCT_STATUS_LABEL } from "../productPresentation";

interface ProductStatusTagProps {
  status: ProductStatus;
  compact?: boolean;
}

const ProductStatusTag = ({ status, compact = false }: ProductStatusTagProps) => {
  if (compact) {
    return <Badge status={status === "ACTIVE" ? "success" : "default"} text={PRODUCT_STATUS_LABEL[status]} />;
  }

  return <Tag color={status === "ACTIVE" ? "success" : "default"}>{PRODUCT_STATUS_LABEL[status]}</Tag>;
};

export default ProductStatusTag;
