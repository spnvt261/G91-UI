import { AppstoreOutlined } from "@ant-design/icons";
import { Badge, Card, Empty, Space, Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";
import type { PromotionProductItem } from "../../../models/promotion/promotion.model";

interface PromotionProductsTableProps {
  products: PromotionProductItem[];
  loading?: boolean;
}

interface PromotionProductRow {
  key: string;
  productCode: string;
  productName: string;
}

const PromotionProductsTable = ({ products, loading = false }: PromotionProductsTableProps) => {
  const rows = useMemo<PromotionProductRow[]>(
    () =>
      products.map((item) => ({
        key: item.productId,
        productCode: item.productCode || "-",
        productName: item.productName || "Chưa có tên sản phẩm",
      })),
    [products],
  );

  const columns = useMemo<ColumnsType<PromotionProductRow>>(
    () => [
      {
        title: "Mã sản phẩm",
        dataIndex: "productCode",
        key: "productCode",
        width: 180,
      },
      {
        title: "Tên sản phẩm",
        dataIndex: "productName",
        key: "productName",
      },
    ],
    [],
  );

  return (
    <Card
      bordered={false}
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
        loading={{ spinning: loading, tip: "Đang tải danh sách sản phẩm..." }}
        pagination={false}
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
