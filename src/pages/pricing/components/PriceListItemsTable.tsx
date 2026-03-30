import { DeleteOutlined } from "@ant-design/icons";
import { Button, Empty, InputNumber, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useMemo } from "react";
import { toCurrency } from "../../shared/page.utils";

export interface PriceListItemRowView {
  key: string;
  productId: string;
  productCode?: string;
  productName?: string;
  unitPriceVnd?: number;
}

interface PriceListItemsTableProps {
  items: PriceListItemRowView[];
  loading?: boolean;
  emptyDescription?: string;
  showIndex?: boolean;
  editableUnitPrice?: boolean;
  unitPriceErrors?: Record<string, string>;
  onUnitPriceChange?: (rowKey: string, value?: number) => void;
  onRemoveItem?: (rowKey: string) => void;
  removeButtonDisabled?: (row: PriceListItemRowView) => boolean;
}

const PriceListItemsTable = ({
  items,
  loading = false,
  emptyDescription = "Chưa có sản phẩm trong bảng giá.",
  showIndex = true,
  editableUnitPrice = false,
  unitPriceErrors,
  onUnitPriceChange,
  onRemoveItem,
  removeButtonDisabled,
}: PriceListItemsTableProps) => {
  const columns = useMemo<ColumnsType<PriceListItemRowView>>(
    () => [
      ...(showIndex
        ? [
            {
              title: "STT",
              key: "index",
              width: 72,
              align: "center" as const,
              render: (_: unknown, __: PriceListItemRowView, index: number) => index + 1,
            },
          ]
        : []),
      {
        title: "Sản phẩm",
        key: "product",
        render: (_, row) => {
          const fallbackName = row.productId || "Chưa xác định";
          const title = row.productName?.trim() || fallbackName;
          const code = row.productCode?.trim();

          return (
            <Space direction="vertical" size={2}>
              <Typography.Text strong>{title}</Typography.Text>
              <Typography.Text type="secondary">{code ? `Mã sản phẩm: ${code}` : `ID: ${row.productId || "Chưa xác định"}`}</Typography.Text>
            </Space>
          );
        },
      },
      {
        title: "Đơn giá",
        dataIndex: "unitPriceVnd",
        key: "unitPriceVnd",
        width: 220,
        render: (value: number | undefined, row) => {
          if (editableUnitPrice && onUnitPriceChange) {
            return (
              <Space direction="vertical" size={4} style={{ width: "100%" }}>
                <InputNumber<number>
                  className="w-full"
                  min={1}
                  precision={0}
                  addonAfter="VND"
                  placeholder="Nhập đơn giá"
                  value={value && Number.isFinite(value) && value > 0 ? value : undefined}
                  onChange={(nextValue) => onUnitPriceChange(row.key, typeof nextValue === "number" ? nextValue : undefined)}
                />
                {unitPriceErrors?.[row.key] ? (
                  <Typography.Text type="danger" style={{ fontSize: 12 }}>
                    {unitPriceErrors[row.key]}
                  </Typography.Text>
                ) : null}
              </Space>
            );
          }

          if (value == null || !Number.isFinite(value) || value <= 0) {
            return <Typography.Text type="secondary">Chưa thiết lập</Typography.Text>;
          }
          return <Typography.Text strong>{toCurrency(value)}</Typography.Text>;
        },
      },
      ...(onRemoveItem
        ? [
            {
              title: "Thao tác",
              key: "actions",
              width: 140,
              render: (_: unknown, row: PriceListItemRowView) => (
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => onRemoveItem(row.key)}
                  disabled={removeButtonDisabled?.(row)}
                >
                  Xoá
                </Button>
              ),
            },
          ]
        : []),
    ],
    [editableUnitPrice, onRemoveItem, onUnitPriceChange, removeButtonDisabled, showIndex, unitPriceErrors],
  );

  return (
    <Table<PriceListItemRowView>
      rowKey="key"
      columns={columns}
      dataSource={items}
      loading={loading}
      size="middle"
      pagination={false}
      locale={{
        emptyText: <Empty description={emptyDescription} image={Empty.PRESENTED_IMAGE_SIMPLE} />,
      }}
      scroll={{ x: 900 }}
    />
  );
};

export default PriceListItemsTable;
