import {
  ArrowRightOutlined,
  HistoryOutlined,
  InboxOutlined,
  PlusCircleOutlined,
  ReloadOutlined,
  SwapOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Alert,
  Breadcrumb,
  Button,
  Card,
  Col,
  Empty,
  Input,
  Row,
  Select,
  Space,
  Table,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { canPerformAction, hasPermission } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { InventoryStatusItem } from "../../models/inventory/inventory.model";
import { inventoryService } from "../../services/inventory/inventory.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage } from "../shared/page.utils";
import InventoryStatusTag from "./components/InventoryStatusTag";
import InventorySummaryCards, { type InventorySummaryCardItem } from "./components/InventorySummaryCards";
import { formatInventoryDateTime, getInventoryStockLevel, type InventoryStockLevel } from "./inventory.ui";

const FETCH_SIZE = 1000;

const STOCK_FILTER_OPTIONS: Array<{ label: string; value: InventoryStockLevel }> = [
  { label: "Sắp hết hàng", value: "LOW_STOCK" },
  { label: "Hết hàng", value: "OUT_OF_STOCK" },
  { label: "Tồn kho an toàn", value: "SAFE_STOCK" },
  { label: "Tồn kho cao", value: "HIGH_STOCK" },
];

const InventoryStatusPage = () => {
  const navigate = useNavigate();
  const role = getStoredUserRole();
  const { notify } = useNotify();

  const canCreateReceipt = canPerformAction(role, "inventory.receipt.create");
  const canCreateIssue = canPerformAction(role, "inventory.issue.create");
  const canCreateAdjustment = canPerformAction(role, "inventory.adjustment.create");
  const canViewHistory = hasPermission(role, "inventory.history.view");

  const [items, setItems] = useState<InventoryStatusItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");
  const [keyword, setKeyword] = useState("");
  const [stockFilter, setStockFilter] = useState<InventoryStockLevel | undefined>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const loadInventory = useCallback(async () => {
    try {
      setLoading(true);
      setErrorMessage(null);
      const response = await inventoryService.getStatus({
        page: 1,
        size: FETCH_SIZE,
        search: keyword || undefined,
      });
      setItems(response.items);
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải dữ liệu tồn kho.");
      setErrorMessage(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [keyword, notify]);

  useEffect(() => {
    void loadInventory();
  }, [loadInventory]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (!stockFilter) {
        return true;
      }
      return getInventoryStockLevel(item.onHandQuantity) === stockFilter;
    });
  }, [items, stockFilter]);

  const pagedItems = useMemo(() => filteredItems.slice((page - 1) * pageSize, page * pageSize), [filteredItems, page, pageSize]);

  const summaryItems = useMemo<InventorySummaryCardItem[]>(
    () => [
      {
        key: "total",
        title: "Tổng SKU theo dõi",
        value: filteredItems.length,
        icon: <InboxOutlined />,
      },
      {
        key: "low",
        title: "Sắp hết hàng",
        value: filteredItems.filter((item) => getInventoryStockLevel(item.onHandQuantity) === "LOW_STOCK").length,
        icon: <WarningOutlined />,
        valueColor: "#d97706",
      },
      {
        key: "out",
        title: "Hết hàng",
        value: filteredItems.filter((item) => getInventoryStockLevel(item.onHandQuantity) === "OUT_OF_STOCK").length,
        icon: <WarningOutlined />,
        valueColor: "#dc2626",
      },
      {
        key: "safe",
        title: "An toàn / tồn cao",
        value: filteredItems.filter((item) => ["SAFE_STOCK", "HIGH_STOCK"].includes(getInventoryStockLevel(item.onHandQuantity))).length,
        icon: <SwapOutlined />,
        valueColor: "#16a34a",
      },
    ],
    [filteredItems],
  );

  const columns = useMemo<ColumnsType<InventoryStatusItem>>(
    () => [
      {
        title: "Mã sản phẩm",
        dataIndex: "productCode",
        key: "productCode",
        render: (value: string | undefined, row) => (
          <Space direction="vertical" size={0}>
            <Typography.Text strong>{value || row.productId || "Chưa cập nhật"}</Typography.Text>
            <Typography.Text type="secondary">{row.productId || "-"}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Tên sản phẩm",
        dataIndex: "productName",
        key: "productName",
        render: (value: string | undefined) => value || "Chưa cập nhật",
      },
      {
        title: "Tồn hiện tại",
        dataIndex: "onHandQuantity",
        key: "onHandQuantity",
        align: "right",
        render: (value: number) => <Typography.Text strong>{value}</Typography.Text>,
      },
      {
        title: "Đơn vị",
        dataIndex: "unit",
        key: "unit",
        render: (value: string | undefined) => value || "-",
      },
      {
        title: "Trạng thái tồn kho",
        key: "stockStatus",
        render: (_, row) => <InventoryStatusTag onHandQuantity={row.onHandQuantity} />,
      },
      {
        title: "Cập nhật gần nhất",
        dataIndex: "updatedAt",
        key: "updatedAt",
        render: (value?: string) => formatInventoryDateTime(value),
      },
    ],
    [],
  );

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Tổng quan tồn kho"
          subtitle="Theo dõi nhanh tình trạng tồn kho hiện tại để xử lý nhập, xuất và điều chỉnh kịp thời."
          breadcrumb={<Breadcrumb items={[{ title: "Trang chủ" }, { title: "Kho vận" }]} />}
          actions={
            <Space wrap>
              <Button icon={<ReloadOutlined />} onClick={() => void loadInventory()} loading={loading}>
                Làm mới
              </Button>
              {canViewHistory ? (
                <Button icon={<HistoryOutlined />} onClick={() => navigate(ROUTE_URL.INVENTORY_HISTORY)}>
                  Lịch sử kho
                </Button>
              ) : null}
            </Space>
          }
        />
      }
      body={
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <InventorySummaryCards items={summaryItems} loading={loading} />

          <Card title="Thao tác nhanh">
            <Row gutter={[12, 12]}>
              <Col xs={24} sm={12} lg={6}>
                <Button
                  type="primary"
                  ghost
                  block
                  icon={<PlusCircleOutlined />}
                  disabled={!canCreateReceipt}
                  onClick={() => navigate(ROUTE_URL.INVENTORY_RECEIPT_CREATE)}
                >
                  Nhập kho
                </Button>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Button
                  type="primary"
                  ghost
                  block
                  icon={<ArrowRightOutlined />}
                  disabled={!canCreateIssue}
                  onClick={() => navigate(ROUTE_URL.INVENTORY_ISSUE_CREATE)}
                >
                  Xuất kho
                </Button>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Button
                  block
                  icon={<SwapOutlined />}
                  disabled={!canCreateAdjustment}
                  onClick={() => navigate(ROUTE_URL.INVENTORY_ADJUSTMENT_CREATE)}
                >
                  Điều chỉnh
                </Button>
              </Col>
              <Col xs={24} sm={12} lg={6}>
                <Button block icon={<HistoryOutlined />} disabled={!canViewHistory} onClick={() => navigate(ROUTE_URL.INVENTORY_HISTORY)}>
                  Xem lịch sử
                </Button>
              </Col>
            </Row>
          </Card>

          <Card title="Danh sách tồn kho">
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <Row gutter={[12, 12]}>
                <Col xs={24} lg={12}>
                  <Input.Search
                    allowClear
                    value={searchText}
                    placeholder="Tìm theo mã hoặc tên sản phẩm"
                    enterButton="Tìm"
                    onChange={(event) => setSearchText(event.target.value)}
                    onSearch={(value) => {
                      setKeyword(value.trim());
                      setPage(1);
                    }}
                  />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Select
                    className="w-full"
                    allowClear
                    value={stockFilter}
                    placeholder="Lọc trạng thái tồn kho"
                    options={STOCK_FILTER_OPTIONS}
                    onChange={(value: InventoryStockLevel | undefined) => {
                      setStockFilter(value);
                      setPage(1);
                    }}
                  />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <Button
                    block
                    onClick={() => {
                      setSearchText("");
                      setKeyword("");
                      setStockFilter(undefined);
                      setPage(1);
                    }}
                  >
                    Đặt lại bộ lọc
                  </Button>
                </Col>
              </Row>

              {errorMessage ? <Alert type="error" showIcon message="Không thể tải dữ liệu tồn kho." description={errorMessage} /> : null}

              <Table<InventoryStatusItem>
                rowKey={(record) => `${record.productId}-${record.productCode ?? ""}`}
                columns={columns}
                dataSource={pagedItems}
                loading={{ spinning: loading, tip: "Đang tải tồn kho..." }}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Không tìm thấy dữ liệu tồn kho phù hợp với bộ lọc hiện tại."
                    />
                  ),
                }}
                pagination={{
                  current: page,
                  pageSize,
                  total: filteredItems.length,
                  showSizeChanger: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} trên ${total} SKU`,
                }}
                onChange={(pagination) => {
                  setPage(pagination.current ?? 1);
                  setPageSize(pagination.pageSize ?? 10);
                }}
                scroll={{ x: 980 }}
              />
            </Space>
          </Card>
        </Space>
      }
    />
  );
};

export default InventoryStatusPage;
