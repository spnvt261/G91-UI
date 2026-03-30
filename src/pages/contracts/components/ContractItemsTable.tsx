import { Empty, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { formatContractCurrency } from "../contract.ui";

export interface ContractItemRowData {
  productId: string;
  productCode?: string;
  productName?: string;
  quantity: number;
  unitPrice: number;
  amount?: number;
  totalPrice?: number;
}

interface ContractItemsTableProps {
  items: ContractItemRowData[];
  loading?: boolean;
  showSummary?: boolean;
  emptyDescription?: string;
}

interface ContractItemTableRow extends ContractItemRowData {
  key: string;
  lineAmount: number;
}

const ContractItemsTable = ({
  items,
  loading = false,
  showSummary = true,
  emptyDescription = "Chưa có dòng sản phẩm nào trong hợp đồng.",
}: ContractItemsTableProps) => {
  const dataSource: ContractItemTableRow[] = items.map((item, index) => ({
    ...item,
    key: `${item.productId}-${index}`,
    lineAmount: item.amount ?? item.totalPrice ?? item.quantity * item.unitPrice,
  }));

  const columns: ColumnsType<ContractItemTableRow> = [
    {
      title: "Mã sản phẩm",
      dataIndex: "productCode",
      key: "productCode",
      width: 140,
      render: (_, row) => row.productCode || row.productId || "-",
    },
    {
      title: "Tên sản phẩm",
      dataIndex: "productName",
      key: "productName",
      render: (value?: string) => value || "Chưa cập nhật tên sản phẩm",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      width: 110,
      align: "right",
      render: (value: number) => value.toLocaleString("vi-VN"),
    },
    {
      title: "Đơn giá",
      dataIndex: "unitPrice",
      key: "unitPrice",
      width: 180,
      align: "right",
      render: (value: number) => formatContractCurrency(value),
    },
    {
      title: "Thành tiền",
      dataIndex: "lineAmount",
      key: "lineAmount",
      width: 200,
      align: "right",
      render: (value: number) => <Typography.Text strong>{formatContractCurrency(value)}</Typography.Text>,
    },
  ];

  const totalAmount = dataSource.reduce((sum, item) => sum + item.lineAmount, 0);

  return (
    <Table<ContractItemTableRow>
      rowKey="key"
      size="middle"
      columns={columns}
      dataSource={dataSource}
      loading={loading}
      pagination={false}
      scroll={{ x: 880 }}
      locale={{
        emptyText: (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={emptyDescription}
          />
        ),
      }}
      summary={
        showSummary && dataSource.length > 0
          ? () => (
            <Table.Summary.Row>
              <Table.Summary.Cell index={0} colSpan={4}>
                <Typography.Text strong>Tổng cộng</Typography.Text>
              </Table.Summary.Cell>
              <Table.Summary.Cell index={1} align="right">
                <Typography.Text strong>{formatContractCurrency(totalAmount)}</Typography.Text>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          )
          : undefined
      }
    />
  );
};

export default ContractItemsTable;
