import { EditOutlined, EllipsisOutlined, EyeOutlined, FileTextOutlined, DeleteOutlined } from "@ant-design/icons";
import { Button, Card, Dropdown, Empty, Image, Space, Typography } from "antd";
import type { MenuProps } from "antd";
import type { ProductModel } from "../../../models/product/product.model";
import ProductStatusTag from "./ProductStatusTag";

interface ProductCatalogCardProps {
  product: ProductModel;
  allowUpdate: boolean;
  allowDelete: boolean;
  showCreateQuotation: boolean;
  deleting: boolean;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRequestQuotation: () => void;
}

const ProductCatalogCard = ({
  product,
  allowUpdate,
  allowDelete,
  showCreateQuotation,
  deleting,
  onView,
  onEdit,
  onDelete,
  onRequestQuotation,
}: ProductCatalogCardProps) => {
  const actionItems: MenuProps["items"] = [];

  if (allowUpdate) {
    actionItems.push({
      key: "edit",
      icon: <EditOutlined />,
      label: "Chỉnh sửa sản phẩm",
      onClick: onEdit,
    });
  }

  if (allowDelete) {
    if (actionItems.length > 0) {
      actionItems.push({ type: "divider" });
    }

    actionItems.push({
      key: "delete",
      icon: <DeleteOutlined />,
      label: "Xóa sản phẩm",
      danger: true,
      disabled: deleting,
      onClick: onDelete,
    });
  }

  return (
    <Card
      hoverable
      bordered
      cover={
        product.mainImage ? (
          <Image
            src={product.mainImage}
            alt={product.productName}
            preview
            style={{ height: 220, objectFit: "cover" }}
            fallback="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0nNjQwJyBoZWlnaHQ9JzM2MCcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJz48cmVjdCB3aWR0aD0nNjQwJyBoZWlnaHQ9JzM2MCcgZmlsbD0nI2YxZjVmOScvPjx0ZXh0IHg9JzUwJScgeT0nNTAlJyBmaWxsPScjOTRhM2I4JyBmb250LXNpemU9JzI2JyB0ZXh0LWFuY2hvcj0nbWlkZGxlJz5LaMO0bmcgY+OzIOG6o25oPC90ZXh0Pjwvc3ZnPg=="
          />
        ) : (
          <div style={{ height: 220, display: "grid", placeItems: "center", background: "#f8fafc" }}>
            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có ảnh" />
          </div>
        )
      }
      styles={{ body: { padding: 16 } }}
    >
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <Space direction="vertical" size={2} style={{ width: "100%" }}>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            Mã: {product.productCode || "Chưa cập nhật"}
          </Typography.Text>
          <Typography.Title level={5} style={{ margin: 0 }}>
            {product.productName || "Sản phẩm chưa có tên"}
          </Typography.Title>
          <ProductStatusTag status={product.status} />
        </Space>

        <Space direction="vertical" size={4} style={{ width: "100%" }}>
          <Typography.Text>Loại: <Typography.Text strong>{product.type || "Chưa cập nhật"}</Typography.Text></Typography.Text>
          <Typography.Text>Kích thước: <Typography.Text strong>{product.size || "Chưa cập nhật"}</Typography.Text></Typography.Text>
          <Typography.Text>Độ dày: <Typography.Text strong>{product.thickness || "Chưa cập nhật"}</Typography.Text></Typography.Text>
          <Typography.Text>Đơn vị: <Typography.Text strong>{product.unit || "Chưa cập nhật"}</Typography.Text></Typography.Text>
        </Space>

        <Space wrap>
          <Button type="primary" icon={<EyeOutlined />} onClick={onView}>
            Xem chi tiết
          </Button>

          {showCreateQuotation ? (
            <Button icon={<FileTextOutlined />} onClick={onRequestQuotation}>
              Yêu cầu báo giá
            </Button>
          ) : null}

          {actionItems.length > 0 ? (
            <Dropdown menu={{ items: actionItems }} trigger={["click"]}>
              <Button icon={<EllipsisOutlined />} loading={deleting} />
            </Dropdown>
          ) : null}
        </Space>
      </Space>
    </Card>
  );
};

export default ProductCatalogCard;
