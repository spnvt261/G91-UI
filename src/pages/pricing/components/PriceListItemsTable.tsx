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
  pricingRuleType?: string;
  note?: string;
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
  emptyDescription = "Chua co san pham trong bang gia.",
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
        title: "San pham",
        key: "product",
        render: (_, row) => {
          const fallbackName = row.productId || "Chua xac dinh";
          const title = row.productName?.trim() || fallbackName;
          const code = row.productCode?.trim();

          return (
            <Space direction="vertical" size={2}>
              <Typography.Text strong>{title}</Typography.Text>
              <Typography.Text type="secondary">{code ? `Ma san pham: ${code}` : `ID: ${row.productId || "Chua xac dinh"}`}</Typography.Text>
            </Space>
          );
        },
      },
      {
        title: "Don gia",
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
                  placeholder="Nhap don gia"
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
            return <Typography.Text type="secondary">Chua thiet lap</Typography.Text>;
          }
          return <Typography.Text strong>{toCurrency(value)}</Typography.Text>;
        },
      },
      {
        title: "Rule",
        dataIndex: "pricingRuleType",
        key: "pricingRuleType",
        width: 140,
        render: (value?: string) => value || "-",
      },
      {
        title: "Ghi chu",
        dataIndex: "note",
        key: "note",
        render: (value?: string) => value || "-",
      },
      ...(onRemoveItem
        ? [
            {
              title: "Thao tac",
              key: "actions",
              width: 140,
              render: (_: unknown, row: PriceListItemRowView) => (
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => onRemoveItem(row.key)}
                  disabled={removeButtonDisabled?.(row)}
                >
                  Xoa
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
      scroll={{ x: 1000 }}
    />
  );
};

export default PriceListItemsTable;
