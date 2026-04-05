import { ReloadOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Col, DatePicker, Empty, Input, Row, Select, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { SaleOrderListQuery, SaleOrderModel } from "../../models/sale-order/sale-order.model";
import { saleOrderService } from "../../services/sale-order/sale-order.service";
import { getErrorMessage, toCurrency } from "../shared/page.utils";
import SaleOrderStatusTag from "./components/SaleOrderStatusTag";
import { formatSaleOrderDate, resolveSaleOrderNumber, SALE_ORDER_STATUS_OPTIONS } from "./saleOrder.ui";

const DEFAULT_PAGE_SIZE = 10;

const SaleOrderListPage = () => {
  const navigate = useNavigate();
  const { notify } = useNotify();

  const [items, setItems] = useState<SaleOrderModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [orderRange, setOrderRange] = useState<[string | undefined, string | undefined]>([undefined, undefined]);
  const [deliveryRange, setDeliveryRange] = useState<[string | undefined, string | undefined]>([undefined, undefined]);

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalItems, setTotalItems] = useState(0);

  const query = useMemo<SaleOrderListQuery>(
    () => ({
      keyword: keyword || undefined,
      status: status || undefined,
      orderFrom: orderRange[0],
      orderTo: orderRange[1],
      deliveryFrom: deliveryRange[0],
      deliveryTo: deliveryRange[1],
      page,
      pageSize,
      sortBy: "orderDate",
      sortDir: "desc",
    }),
    [deliveryRange, keyword, orderRange, page, pageSize, status],
  );

  const loadList = useCallback(async () => {
    try {
      setLoading(true);
      setListError(null);
      const response = await saleOrderService.getList(query);
      setItems(response.items);
      setTotalItems(response.pagination.totalItems);
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải danh sách đơn bán.");
      setListError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [notify, query]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const columns = useMemo<ColumnsType<SaleOrderModel>>(
    () => [
      {
        title: "Mã đơn bán",
        key: "saleOrderNumber",
        width: 200,
        render: (_, record) => (
          <Space direction="vertical" size={1}>
            <Typography.Text strong>{resolveSaleOrderNumber(record.id, record.saleOrderNumber)}</Typography.Text>
            <Typography.Text type="secondary">Mã hệ thống: {record.id}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Mã hợp đồng",
        key: "contractNumber",
        width: 170,
        render: (_, record) => record.contractNumber || record.contractId || "Chưa cập nhật",
      },
      {
        title: "Khách hàng",
        key: "customer",
        width: 220,
        render: (_, record) => (
          <Space direction="vertical" size={1}>
            <Typography.Text>{record.customerName || "Chưa cập nhật"}</Typography.Text>
            <Typography.Text type="secondary">{record.customerCode || record.customerId || "-"}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Dự án",
        key: "project",
        width: 220,
        render: (_, record) => (
          <Space direction="vertical" size={1}>
            <Typography.Text>{record.projectName || "Chưa liên kết"}</Typography.Text>
            <Typography.Text type="secondary">{record.projectCode || record.projectId || "-"}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Ngày đơn",
        dataIndex: "orderDate",
        key: "orderDate",
        width: 130,
        render: (value?: string) => formatSaleOrderDate(value),
      },
      {
        title: "Ngày giao dự kiến",
        dataIndex: "expectedDeliveryDate",
        key: "expectedDeliveryDate",
        width: 150,
        render: (value?: string) => formatSaleOrderDate(value),
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 170,
        render: (value) => <SaleOrderStatusTag status={value} />,
      },
      {
        title: "Tổng tiền",
        dataIndex: "totalAmount",
        key: "totalAmount",
        width: 170,
        align: "right",
        render: (value: number) => <Typography.Text strong>{toCurrency(value)}</Typography.Text>,
      },
      {
        title: "Thao tác",
        key: "actions",
        width: 220,
        fixed: "right",
        render: (_, record) => (
          <Space size={4} wrap>
            <Button type="link" onClick={() => navigate(ROUTE_URL.SALE_ORDER_DETAIL.replace(":id", record.id))}>
              Chi tiết
            </Button>
            <Button size="small" onClick={() => navigate(ROUTE_URL.SALE_ORDER_TIMELINE.replace(":id", record.id))}>
              Dòng thời gian
            </Button>
          </Space>
        ),
      },
    ],
    [navigate],
  );

  const totalAmount = useMemo(() => items.reduce((sum, item) => sum + item.totalAmount, 0), [items]);

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Danh sách đơn bán"
          subtitle="Theo dõi đơn bán theo hợp đồng, trạng thái thực hiện và giá trị đơn hàng."
          breadcrumb={<CustomBreadcrumb breadcrumbs={[{ label: "Trang chủ" }, { label: "Đơn bán" }]} />}
          actions={
            <Button icon={<ReloadOutlined />} onClick={() => void loadList()} loading={loading}>
              Làm mới
            </Button>
          }
        />
      }
      body={
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Row gutter={[16, 16]}>
            <Col xs={24} md={8}>
              <Card>
                <Typography.Text type="secondary">Đơn bán trong trang hiện tại</Typography.Text>
                <Typography.Title level={3} style={{ margin: 0 }}>
                  {items.length}
                </Typography.Title>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <Typography.Text type="secondary">Tổng giá trị trang hiện tại</Typography.Text>
                <Typography.Title level={3} style={{ margin: 0 }}>
                  {toCurrency(totalAmount)}
                </Typography.Title>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <Typography.Text type="secondary">Đơn đang xử lý</Typography.Text>
                <Typography.Title level={3} style={{ margin: 0 }}>
                  {items.filter((item) => ["PROCESSING", "RESERVED", "PICKED", "IN_TRANSIT"].includes(String(item.status).toUpperCase())).length}
                </Typography.Title>
              </Card>
            </Col>
          </Row>

          <Card>
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
              <Row gutter={[12, 12]}>
                <Col xs={24} lg={8}>
                  <Input.Search
                    allowClear
                    value={keywordInput}
                    placeholder="Tìm theo mã đơn bán, hợp đồng, khách hàng, dự án"
                    enterButton="Tìm"
                    onChange={(event) => setKeywordInput(event.target.value)}
                    onSearch={(value) => {
                      setKeyword(value.trim());
                      setPage(1);
                    }}
                  />
                </Col>
                <Col xs={24} sm={12} lg={4}>
                  <Select
                    allowClear
                    placeholder="Trạng thái"
                    options={SALE_ORDER_STATUS_OPTIONS}
                    value={status}
                    onChange={(value) => {
                      setStatus(value);
                      setPage(1);
                    }}
                    className="w-full"
                  />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <DatePicker.RangePicker
                    className="w-full"
                    format="DD/MM/YYYY"
                    placeholder={["Từ ngày đơn", "Đến ngày đơn"]}
                    value={[orderRange[0] ? dayjs(orderRange[0]) : null, orderRange[1] ? dayjs(orderRange[1]) : null]}
                    onChange={(dates) => {
                      setOrderRange([dates?.[0]?.format("YYYY-MM-DD"), dates?.[1]?.format("YYYY-MM-DD")]);
                      setPage(1);
                    }}
                  />
                </Col>
                <Col xs={24} sm={12} lg={6}>
                  <DatePicker.RangePicker
                    className="w-full"
                    format="DD/MM/YYYY"
                    placeholder={["Từ ngày giao", "Đến ngày giao"]}
                    value={[deliveryRange[0] ? dayjs(deliveryRange[0]) : null, deliveryRange[1] ? dayjs(deliveryRange[1]) : null]}
                    onChange={(dates) => {
                      setDeliveryRange([dates?.[0]?.format("YYYY-MM-DD"), dates?.[1]?.format("YYYY-MM-DD")]);
                      setPage(1);
                    }}
                  />
                </Col>
              </Row>

              <Button
                onClick={() => {
                  setKeywordInput("");
                  setKeyword("");
                  setStatus(undefined);
                  setOrderRange([undefined, undefined]);
                  setDeliveryRange([undefined, undefined]);
                  setPage(1);
                  setPageSize(DEFAULT_PAGE_SIZE);
                }}
              >
                Đặt lại bộ lọc
              </Button>

              {listError ? <Alert type="error" showIcon message="Không thể tải danh sách đơn bán." description={listError} /> : null}

              <Table<SaleOrderModel>
                rowKey="id"
                loading={{ spinning: loading, tip: "Đang tải danh sách đơn bán..." }}
                columns={columns}
                dataSource={items}
                pagination={{
                  current: page,
                  pageSize,
                  total: totalItems,
                  showSizeChanger: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} trên ${total} đơn bán`,
                }}
                onChange={(pagination) => {
                  setPage(pagination.current ?? 1);
                  setPageSize(pagination.pageSize ?? DEFAULT_PAGE_SIZE);
                }}
                scroll={{ x: 1550 }}
                locale={{
                  emptyText: (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có đơn bán phù hợp với bộ lọc hiện tại." />
                  ),
                }}
              />
            </Space>
          </Card>
        </Space>
      }
    />
  );
};

export default SaleOrderListPage;

