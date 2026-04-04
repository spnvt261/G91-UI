import { AppstoreOutlined, EyeOutlined, PictureOutlined } from "@ant-design/icons";
import { Badge, Button, Card, Empty, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ROUTE_URL } from "../../../const/route_url.const";
import type { PromotionProductItem } from "../../../models/promotion/promotion.model";
import ProductImage from "../../products/components/ProductImage";

interface PromotionProductsTableProps {
  products: PromotionProductItem[];
  loading?: boolean;
}

interface PromotionProductRow {
  key: string;
  productId: string;
  productCode: string;
  productName: string;
  productImage?: string;
  productMeta?: string;
  unit?: string;
}

const resolveProductImage = (product: PromotionProductItem): string | undefined =>
  product.mainImage || product.imageUrls?.[0] || product.images?.[0];

const PromotionProductsTable = ({ products, loading = false }: PromotionProductsTableProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  const rows = useMemo<PromotionProductRow[]>(
    () =>
      products.map((item) => ({
        key: item.productId,
        productId: item.productId,
        productCode: item.productCode || "-",
        productName: item.productName || "Chưa có tên sản phẩm",
        productImage: resolveProductImage(item),
        productMeta: [item.type, item.size, item.thickness].filter(Boolean).join(" • "),
        unit: item.unit || "-",
      })),
    [products],
  );

  const columns = useMemo<ColumnsType<PromotionProductRow>>(
    () => [
      {
        title: "Sản phẩm",
        key: "product",
        render: (_, row) => (
          <Space size={10} align="start">
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 8,
                border: "1px solid #d9d9d9",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#f5f5f5",
                flexShrink: 0,
              }}
            >
              {row.productImage ? (
                <ProductImage
                  src={row.productImage}
                  alt={row.productName || "Sản phẩm"}
                  preview={false}
                  width={42}
                  height={42}
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <PictureOutlined style={{ color: "#8c8c8c" }} />
              )}
            </div>

            <Space direction="vertical" size={2}>
              <Typography.Text strong>{row.productName || "Chưa có tên sản phẩm"}</Typography.Text>
              <Typography.Text type="secondary">{row.productCode || "-"}</Typography.Text>
              {row.productMeta ? <Typography.Text type="secondary">{row.productMeta}</Typography.Text> : null}
              <Button
                type="link"
                size="small"
                icon={<EyeOutlined />}
                style={{ paddingInline: 0 }}
                onClick={() => {
                  navigate(ROUTE_URL.PRODUCT_DETAIL.replace(":id", row.productId), {
                    state: {
                      returnTo: `${location.pathname}${location.search}`,
                      returnLabel: "Quay lại khuyến mãi",
                    },
                  });
                }}
              >
                Xem chi tiết
              </Button>
            </Space>
          </Space>
        ),
      },
      {
        title: "Đơn vị",
        dataIndex: "unit",
        key: "unit",
        width: 140,
      },
    ],
    [location.pathname, location.search, navigate],
  );

  return (
    <Card
      variant="borderless"
      className="shadow-sm"
      title={
        <Space size={8}>
          <AppstoreOutlined />
          <span>Phạm vi sản phẩm áp dụng</span>
          <Badge count={rows.length} showZero color="#0f5ca8" />
        </Space>
      }
    >
      <Table<PromotionProductRow>
        rowKey="key"
        size="middle"
        columns={columns}
        dataSource={rows}
        loading={{ spinning: loading, description: "Đang tải danh sách sản phẩm..." }}
        pagination={false}
        scroll={{ x: 780 }}
        locale={{
          emptyText: (
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="Chương trình này chưa cấu hình sản phẩm áp dụng."
            />
          ),
        }}
      />
    </Card>
  );
};

export default PromotionProductsTable;
