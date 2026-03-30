import { Descriptions, Space, Typography } from "antd";
import type { ProductModel } from "../../../models/product/product.model";
import { formatProductDateTime } from "../productPresentation";
import ProductStatusTag from "./ProductStatusTag";

interface ProductInfoCardProps {
  product: ProductModel;
}

const ProductInfoCard = ({ product }: ProductInfoCardProps) => {
  return (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      <Typography.Title level={4} style={{ margin: 0 }}>
        Thông tin sản phẩm
      </Typography.Title>

      <Descriptions column={1} size="middle" bordered>
        <Descriptions.Item label="Mã sản phẩm">{product.productCode || "Chưa cập nhật"}</Descriptions.Item>
        <Descriptions.Item label="Tên sản phẩm">{product.productName || "Chưa cập nhật"}</Descriptions.Item>
        <Descriptions.Item label="Loại">{product.type || "Chưa cập nhật"}</Descriptions.Item>
        <Descriptions.Item label="Kích thước">{product.size || "Chưa cập nhật"}</Descriptions.Item>
        <Descriptions.Item label="Độ dày">{product.thickness || "Chưa cập nhật"}</Descriptions.Item>
        <Descriptions.Item label="Đơn vị">{product.unit || "Chưa cập nhật"}</Descriptions.Item>
        <Descriptions.Item label="Hệ số quy đổi khối lượng">
          {product.weightConversion != null ? product.weightConversion : "Chưa cập nhật"}
        </Descriptions.Item>
        <Descriptions.Item label="Khối lượng tham chiếu">
          {product.referenceWeight != null ? `${product.referenceWeight} ${product.unit || ""}`.trim() : "Chưa cập nhật"}
        </Descriptions.Item>
        <Descriptions.Item label="Trạng thái">
          <ProductStatusTag status={product.status} />
        </Descriptions.Item>
        <Descriptions.Item label="Ngày tạo">{formatProductDateTime(product.createdAt)}</Descriptions.Item>
      </Descriptions>
    </Space>
  );
};

export default ProductInfoCard;
