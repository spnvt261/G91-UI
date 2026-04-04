import { DeleteOutlined, PictureOutlined } from "@ant-design/icons";
import { Button, Empty, InputNumber, Space, Table, Tooltip, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";
import ProductImage from "../../products/components/ProductImage";
import { formatQuotationCurrency } from "../quotation.ui";

export interface QuotationItemTableRow {
  key: string;
  productImage?: string;
  productCode?: string;
  productName?: string;
  productMeta?: string;
  quantity: number;
  unit?: string;
  unitPrice?: number;
  amount?: number;
}

interface QuotationItemsTableProps {
  items: QuotationItemTableRow[];
  editable?: boolean;
  loading?: boolean;
  emptyDescription?: string;
  onQuantityChange?: (key: string, quantity: number) => void;
  onRemove?: (key: string) => void;
}

const QuotationItemsTable = ({
  items,
  editable = false,
  loading = false,
  emptyDescription = "Chưa có sản phẩm trong báo giá.",
  onQuantityChange,
  onRemove,
}: QuotationItemsTableProps) => {
  const columns = useMemo<ColumnsType<QuotationItemTableRow>>(() => {
    const baseColumns: ColumnsType<QuotationItemTableRow> = [
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

            <Space orientation="vertical" size={2}>
              <Typography.Text strong>{row.productName || "Chưa có tên sản phẩm"}</Typography.Text>
              <Typography.Text type="secondary">{row.productCode || "-"}</Typography.Text>
              {row.productMeta ? <Typography.Text type="secondary">{row.productMeta}</Typography.Text> : null}
            </Space>
          </Space>
        ),
      },
      {
        title: "Số lượng",
        dataIndex: "quantity",
        width: 170,
        render: (quantity: number, row) => {
          if (!editable) {
            return <Typography.Text>{`${quantity}${row.unit ? ` ${row.unit}` : ""}`}</Typography.Text>;
          }

          return (
            <InputNumber
              min={1}
              precision={0}
              step={1}
              value={quantity}
              onChange={(value) => {
                if (!onQuantityChange) {
                  return;
                }

                const normalized = typeof value === "number" && Number.isInteger(value) && value >= 1 ? value : 1;
                onQuantityChange(row.key, normalized);
              }}
            />
          );
        },
      },
      {
        title: "Đơn giá",
        dataIndex: "unitPrice",
        width: 170,
        align: "right",
        render: (value?: number) => formatQuotationCurrency(value ?? 0),
      },
      {
        title: "Thành tiền",
        key: "amount",
        width: 190,
        align: "right",
        render: (_, row) => {
          const amount = row.amount ?? (row.unitPrice ?? 0) * row.quantity;
          return <Typography.Text strong>{formatQuotationCurrency(amount)}</Typography.Text>;
        },
      },
    ];

    if (editable) {
      baseColumns.push({
        title: "Thao tác",
        key: "actions",
        width: 110,
        align: "center",
        render: (_, row) => (
          <Tooltip title="Xóa sản phẩm khỏi báo giá">
            <Button danger icon={<DeleteOutlined />} onClick={() => onRemove?.(row.key)} />
          </Tooltip>
        ),
      });
    }

    return baseColumns;
  }, [editable, onQuantityChange, onRemove]);

  return (
    <Table<QuotationItemTableRow>
      rowKey="key"
      columns={columns}
      dataSource={items}
      loading={{ spinning: loading, description: "Đang tải danh sách sản phẩm..." }}
      pagination={false}
      scroll={{ x: 940 }}
      locale={{
        emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={emptyDescription} />,
      }}
    />
  );
};

export default QuotationItemsTable;
