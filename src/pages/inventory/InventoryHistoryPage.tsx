import { HistoryOutlined, ReloadOutlined, SwapOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Breadcrumb, Button, Card, Empty, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { InventoryHistoryItem, InventoryHistoryQuery, InventoryTransactionType } from "../../models/inventory/inventory.model";
import { inventoryService } from "../../services/inventory/inventory.service";
import { getErrorMessage } from "../shared/page.utils";
import InventoryHistoryFilterBar from "./components/InventoryHistoryFilterBar";
import InventorySummaryCards, { type InventorySummaryCardItem } from "./components/InventorySummaryCards";
import { formatInventoryDateTime, getInventoryTransactionMeta } from "./inventory.ui";

const DEFAULT_PAGE_SIZE = 10;

interface InventoryHistorySummary {
  total: number;
  receipt: number;
  issue: number;
  adjustment: number;
}

const InventoryHistoryPage = () => {
  const navigate = useNavigate();
  const { notify } = useNotify();

  const [query, setQuery] = useState<InventoryHistoryQuery>({
    page: 1,
    size: DEFAULT_PAGE_SIZE,
  });
  const [items, setItems] = useState<InventoryHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [filterError, setFilterError] = useState<string | null>(null);

  const [summary, setSummary] = useState<InventoryHistorySummary>({
    total: 0,
    receipt: 0,
    issue: 0,
    adjustment: 0,
  });
  const [summaryLoading, setSummaryLoading] = useState(false);

  const loadHistory = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const response = await inventoryService.getHistory(query);
      setItems(response.items);
      setTotal(response.totalElements);
    } catch (error) {
      const message = getErrorMessage(error, "Khong the tai lich su kho.");
      setErrorMessage(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [notify, query]);

  const loadSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const baseQuery: InventoryHistoryQuery = {
        search: query.search,
        fromDate: query.fromDate,
        toDate: query.toDate,
        productId: query.productId,
        page: 1,
        size: 1,
      };

      const [totalResult, receiptResult, issueResult, adjustmentResult] = await Promise.all([
        inventoryService.getHistory(baseQuery),
        inventoryService.getHistory({ ...baseQuery, transactionType: "RECEIPT" }),
        inventoryService.getHistory({ ...baseQuery, transactionType: "ISSUE" }),
        inventoryService.getHistory({ ...baseQuery, transactionType: "ADJUSTMENT" }),
      ]);

      setSummary({
        total: totalResult.totalElements,
        receipt: receiptResult.totalElements,
        issue: issueResult.totalElements,
        adjustment: adjustmentResult.totalElements,
      });
    } catch (error) {
      notify(getErrorMessage(error, "Khong the tai thong ke lich su kho."), "warning");
    } finally {
      setSummaryLoading(false);
    }
  }, [notify, query.fromDate, query.productId, query.search, query.toDate]);

  useEffect(() => {
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const summaryItems = useMemo<InventorySummaryCardItem[]>(
    () => [
      { key: "total", title: "Tong giao dich", value: summary.total, icon: <HistoryOutlined /> },
      { key: "receipt", title: "Nhap kho", value: summary.receipt, icon: <SwapOutlined />, valueColor: "#16a34a" },
      { key: "issue", title: "Xuat kho", value: summary.issue, icon: <SwapOutlined />, valueColor: "#dc2626" },
      { key: "adjustment", title: "Dieu chinh", value: summary.adjustment, icon: <SwapOutlined />, valueColor: "#1677ff" },
    ],
    [summary.adjustment, summary.issue, summary.receipt, summary.total],
  );

  const toSignedQuantity = (row: InventoryHistoryItem) => {
    if (row.transactionType === "RECEIPT") {
      return Math.abs(row.quantity);
    }
    if (row.transactionType === "ISSUE") {
      return -Math.abs(row.quantity);
    }
    return row.quantity;
  };

  const columns = useMemo<ColumnsType<InventoryHistoryItem>>(
    () => [
      {
        title: "Thoi gian",
        key: "transactionDate",
        render: (_, row) => formatInventoryDateTime(row.transactionDate ?? row.createdAt),
      },
      {
        title: "Loai giao dich",
        dataIndex: "transactionType",
        key: "transactionType",
        render: (value: InventoryTransactionType) => {
          const meta = getInventoryTransactionMeta(value);
          return <Tag color={meta.tagColor}>{meta.label}</Tag>;
        },
      },
      {
        title: "Ma giao dich",
        key: "transactionCode",
        render: (_, row) => row.transactionCode || row.transactionId || row.id,
      },
      {
        title: "San pham",
        key: "product",
        render: (_, row) => (
          <Space direction="vertical" size={0}>
            <Typography.Text strong>{row.productName || "Chua cap nhat ten san pham"}</Typography.Text>
            <Typography.Text type="secondary">{row.productCode || row.productId}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "So luong thay doi",
        key: "quantity",
        align: "right",
        render: (_, row) => {
          const quantity = toSignedQuantity(row);
          const color = quantity >= 0 ? "#16a34a" : "#dc2626";
          const display = `${quantity > 0 ? "+" : ""}${quantity}`;

          return (
            <Space direction="vertical" size={0} style={{ width: "100%" }}>
              <Typography.Text style={{ color, fontWeight: 600 }}>{display}</Typography.Text>
              <Typography.Text type="secondary">
                {`Truoc: ${row.quantityBefore ?? "-"} | Sau: ${row.quantityAfter ?? row.balanceAfter ?? "-"}`}
              </Typography.Text>
            </Space>
          );
        },
      },
      {
        title: "Nguoi thao tac",
        key: "operator",
        render: (_, row) => row.operatorEmail || row.operatorId || "-",
      },
      {
        title: "Lien ket",
        key: "references",
        render: (_, row) => (
          <Space direction="vertical" size={0}>
            <Typography.Text type="secondary">{row.relatedOrderId ? `Order: ${row.relatedOrderId}` : "Order: -"}</Typography.Text>
            <Typography.Text type="secondary">{row.relatedProjectId ? `Project: ${row.relatedProjectId}` : "Project: -"}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Ly do / ghi chu",
        key: "reasonNote",
        render: (_, row) => (
          <Space direction="vertical" size={0}>
            <Typography.Text>{row.reason || "Khong co ly do chi tiet"}</Typography.Text>
            <Typography.Text type="secondary">{row.note || row.supplierName || "Khong co ghi chu"}</Typography.Text>
          </Space>
        ),
      },
    ],
    [],
  );

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Lich su bien dong kho"
          subtitle="Tra cuu toan bo giao dich nhap, xuat, dieu chinh de doi soat ton kho minh bach va nhanh chong."
          breadcrumb={
            <Breadcrumb
              items={[
                { title: "Trang chu" },
                { title: <span onClick={() => navigate(ROUTE_URL.INVENTORY_STATUS)}>Kho van</span> },
                { title: "Lich su kho" },
              ]}
            />
          }
          actions={
            <Space wrap>
              <Button icon={<ReloadOutlined />} onClick={() => void loadHistory()} loading={loading}>
                Lam moi
              </Button>
              <Button onClick={() => navigate(ROUTE_URL.INVENTORY_STATUS)}>Quay lai ton kho</Button>
            </Space>
          }
        />
      }
      body={
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <InventorySummaryCards items={summaryItems} loading={summaryLoading} />

          <Card title="Bo loc lich su">
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <InventoryHistoryFilterBar
                searchValue={query.search ?? ""}
                transactionType={query.transactionType}
                fromDate={query.fromDate}
                toDate={query.toDate}
                onSearch={(value) =>
                  setQuery((previous) => ({
                    ...previous,
                    search: value.trim() || undefined,
                    page: 1,
                  }))
                }
                onTransactionTypeChange={(value) =>
                  setQuery((previous) => ({
                    ...previous,
                    transactionType: value,
                    page: 1,
                  }))
                }
                onDateRangeChange={(fromDate, toDate) => {
                  if (fromDate && toDate && dayjs(fromDate).isAfter(dayjs(toDate))) {
                    setFilterError("Khoang ngay khong hop le: Tu ngay can nho hon hoac bang Den ngay.");
                    return;
                  }

                  setFilterError(null);
                  setQuery((previous) => ({
                    ...previous,
                    fromDate,
                    toDate,
                    page: 1,
                  }));
                }}
                onReset={() => {
                  setFilterError(null);
                  setQuery({
                    page: 1,
                    size: DEFAULT_PAGE_SIZE,
                  });
                }}
              />

              {filterError ? <Alert type="warning" showIcon message={filterError} /> : null}
            </Space>
          </Card>

          <Card title="Danh sach giao dich kho">
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              {errorMessage ? <Alert type="error" showIcon message="Khong the tai lich su kho." description={errorMessage} /> : null}

              <Table<InventoryHistoryItem>
                rowKey={(row) => row.transactionId || row.id}
                columns={columns}
                dataSource={items}
                loading={{ spinning: loading, tip: "Dang tai lich su giao dich..." }}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Chua co giao dich kho phu hop voi bo loc hien tai."
                    />
                  ),
                }}
                pagination={{
                  current: query.page ?? 1,
                  pageSize: query.size ?? DEFAULT_PAGE_SIZE,
                  total,
                  showSizeChanger: true,
                  showTotal: (all, range) => `${range[0]}-${range[1]} tren ${all} giao dich`,
                }}
                onChange={(pagination) =>
                  setQuery((previous) => ({
                    ...previous,
                    page: pagination.current ?? previous.page,
                    size: pagination.pageSize ?? previous.size,
                  }))
                }
                scroll={{ x: 1280 }}
              />
            </Space>
          </Card>
        </Space>
      }
    />
  );
};

export default InventoryHistoryPage;
