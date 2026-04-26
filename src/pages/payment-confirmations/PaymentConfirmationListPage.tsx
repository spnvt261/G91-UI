import { ReloadOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Col, DatePicker, Empty, Input, Row, Select, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { canPerformAction } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { PaymentConfirmationRequestListQuery, PaymentConfirmationRequestModel } from "../../models/payment-confirmation/payment-confirmation.model";
import { paymentConfirmationService } from "../../services/payment-confirmation/payment-confirmation.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage } from "../shared/page.utils";
import PaymentConfirmationStatusTag from "./components/PaymentConfirmationStatusTag";
import { PAYMENT_CONFIRMATION_CHANGED_EVENT } from "./paymentConfirmation.events";
import {
  formatPaymentConfirmationAmountWithCurrency,
  formatPaymentConfirmationDateTime,
  PAYMENT_CONFIRMATION_STATUS_OPTIONS,
} from "./paymentConfirmation.ui";

const DEFAULT_PAGE_SIZE = 20;

const PaymentConfirmationListPage = () => {
  const navigate = useNavigate();
  const { notify } = useNotify();
  const role = getStoredUserRole();
  const canOpenPaymentDetail = canPerformAction(role, "payment.record");

  const [items, setItems] = useState<PaymentConfirmationRequestModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [invoiceIdInput, setInvoiceIdInput] = useState("");
  const [invoiceId, setInvoiceId] = useState("");
  const [customerIdInput, setCustomerIdInput] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [status, setStatus] = useState<string | undefined>("PENDING_REVIEW");
  const [createdRange, setCreatedRange] = useState<[string | undefined, string | undefined]>([undefined, undefined]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalItems, setTotalItems] = useState(0);

  const query = useMemo<PaymentConfirmationRequestListQuery>(
    () => ({
      keyword: keyword || undefined,
      invoiceId: invoiceId || undefined,
      customerId: customerId || undefined,
      status: status || undefined,
      createdFrom: createdRange[0],
      createdTo: createdRange[1],
      page,
      pageSize,
      sortBy: "createdAt",
      sortDir: "desc",
    }),
    [createdRange, customerId, invoiceId, keyword, page, pageSize, status],
  );

  const loadList = useCallback(async () => {
    try {
      setLoading(true);
      setListError(null);
      const response = await paymentConfirmationService.getList(query);
      setItems(response.items);
      setTotalItems(response.pagination.totalItems);
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải danh sách yêu cầu xác nhận thanh toán.");
      setListError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [notify, query]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    const handleChanged = () => {
      void loadList();
    };

    window.addEventListener(PAYMENT_CONFIRMATION_CHANGED_EVENT, handleChanged);
    return () => window.removeEventListener(PAYMENT_CONFIRMATION_CHANGED_EVENT, handleChanged);
  }, [loadList]);

  const summary = useMemo(
    () => ({
      total: items.length,
      pending: items.filter((item) => item.status === "PENDING_REVIEW").length,
      totalRequested: items.reduce((sum, item) => sum + Number(item.requestedAmount ?? 0), 0),
    }),
    [items],
  );

  const columns = useMemo<ColumnsType<PaymentConfirmationRequestModel>>(
    () => [
      {
        title: "Tạo lúc",
        dataIndex: "createdAt",
        key: "createdAt",
        width: 170,
        render: (value?: string) => formatPaymentConfirmationDateTime(value),
      },
      {
        title: "Số hóa đơn",
        key: "invoiceNumber",
        width: 180,
        render: (_, record) => (
          <Space direction="vertical" size={1}>
            <Typography.Text strong>{record.invoiceNumber || record.invoiceId}</Typography.Text>
            <Typography.Text type="secondary">{record.invoiceId}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Mã khách hàng",
        key: "customerCode",
        width: 150,
        render: (_, record) => record.customerCode || record.customerId || "-",
      },
      {
        title: "Khách hàng",
        key: "customerName",
        width: 220,
        render: (_, record) => record.customerName || "Chưa cập nhật",
      },
      {
        title: "Số tiền yêu cầu",
        dataIndex: "requestedAmount",
        key: "requestedAmount",
        width: 170,
        align: "right",
        render: (value?: number) => <Typography.Text strong>{formatPaymentConfirmationAmountWithCurrency(value)}</Typography.Text>,
      },
      {
        title: "Thời gian chuyển",
        dataIndex: "transferTime",
        key: "transferTime",
        width: 170,
        render: (value?: string) => formatPaymentConfirmationDateTime(value),
      },
      {
        title: "Mã tham chiếu",
        dataIndex: "referenceCode",
        key: "referenceCode",
        width: 160,
        render: (value?: string) => value || "-",
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 150,
        render: (value) => <PaymentConfirmationStatusTag status={value} />,
      },
      {
        title: "Duyệt lúc",
        dataIndex: "reviewedAt",
        key: "reviewedAt",
        width: 170,
        render: (value?: string) => formatPaymentConfirmationDateTime(value, "-"),
      },
      {
        title: "Mã thanh toán",
        dataIndex: "paymentId",
        key: "paymentId",
        width: 160,
        render: (value?: string | null) => value || "-",
      },
      {
        title: "Thao tác",
        key: "actions",
        width: 220,
        fixed: "right",
        render: (_, record) => (
          <Space wrap size={4}>
            <Button type="link" onClick={() => navigate(ROUTE_URL.PAYMENT_CONFIRMATION_DETAIL.replace(":id", record.id))}>
              Chi tiết
            </Button>
            {record.invoiceId ? (
              <Button size="small" onClick={() => navigate(ROUTE_URL.INVOICE_DETAIL.replace(":id", record.invoiceId))}>
                Hóa đơn
              </Button>
            ) : null}
            {canOpenPaymentDetail && record.paymentId ? (
              <Button size="small" onClick={() => navigate(ROUTE_URL.PAYMENT_DETAIL.replace(":id", record.paymentId ?? ""))}>
                Thanh toán
              </Button>
            ) : null}
          </Space>
        ),
      },
    ],
    [canOpenPaymentDetail, navigate],
  );

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Yêu cầu xác nhận chuyển khoản"
          subtitle="Danh sách dành cho kế toán và chủ doanh nghiệp để xác nhận hoặc từ chối yêu cầu khách hàng đã chuyển khoản."
          breadcrumb={<CustomBreadcrumb breadcrumbs={[{ label: "Trang chủ" }, { label: "Xác nhận chuyển khoản" }]} />}
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
                <Typography.Text type="secondary">Yêu cầu trong trang hiện tại</Typography.Text>
                <Typography.Title level={3} style={{ margin: 0 }}>
                  {summary.total}
                </Typography.Title>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <Typography.Text type="secondary">Đang chờ duyệt</Typography.Text>
                <Typography.Title level={3} style={{ margin: 0 }}>
                  {summary.pending}
                </Typography.Title>
              </Card>
            </Col>
            <Col xs={24} md={8}>
              <Card>
                <Typography.Text type="secondary">Tổng số tiền yêu cầu</Typography.Text>
                <Typography.Title level={3} style={{ margin: 0 }}>
                  {formatPaymentConfirmationAmountWithCurrency(summary.totalRequested)}
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
                    placeholder="Tìm theo số hóa đơn, khách hàng, mã tham chiếu"
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
                    value={status}
                    placeholder="Trạng thái"
                    options={PAYMENT_CONFIRMATION_STATUS_OPTIONS}
                    onChange={(value) => {
                      setStatus(value);
                      setPage(1);
                    }}
                    className="w-full"
                  />
                </Col>
                <Col xs={24} sm={12} lg={4}>
                  <Input
                    value={invoiceIdInput}
                    placeholder="Mã hóa đơn"
                    onChange={(event) => setInvoiceIdInput(event.target.value)}
                    onBlur={() => {
                      setInvoiceId(invoiceIdInput.trim());
                      setPage(1);
                    }}
                    onPressEnter={() => {
                      setInvoiceId(invoiceIdInput.trim());
                      setPage(1);
                    }}
                  />
                </Col>
                <Col xs={24} sm={12} lg={4}>
                  <Input
                    value={customerIdInput}
                    placeholder="Mã khách hàng"
                    onChange={(event) => setCustomerIdInput(event.target.value)}
                    onBlur={() => {
                      setCustomerId(customerIdInput.trim());
                      setPage(1);
                    }}
                    onPressEnter={() => {
                      setCustomerId(customerIdInput.trim());
                      setPage(1);
                    }}
                  />
                </Col>
                <Col xs={24} sm={12} lg={4}>
                  <DatePicker.RangePicker
                    className="w-full"
                    format="DD/MM/YYYY"
                    placeholder={["Từ ngày tạo", "Đến ngày tạo"]}
                    value={[createdRange[0] ? dayjs(createdRange[0]) : null, createdRange[1] ? dayjs(createdRange[1]) : null]}
                    onChange={(dates) => {
                      setCreatedRange([dates?.[0]?.format("YYYY-MM-DD"), dates?.[1]?.format("YYYY-MM-DD")]);
                      setPage(1);
                    }}
                  />
                </Col>
              </Row>

              <Button
                onClick={() => {
                  setKeywordInput("");
                  setKeyword("");
                  setInvoiceIdInput("");
                  setInvoiceId("");
                  setCustomerIdInput("");
                  setCustomerId("");
                  setStatus("PENDING_REVIEW");
                  setCreatedRange([undefined, undefined]);
                  setPage(1);
                  setPageSize(DEFAULT_PAGE_SIZE);
                }}
              >
                Đặt lại bộ lọc
              </Button>

              {listError ? <Alert type="error" showIcon message="Không thể tải danh sách yêu cầu." description={listError} /> : null}

              <Table<PaymentConfirmationRequestModel>
                rowKey="id"
                loading={{ spinning: loading, tip: "Đang tải danh sách yêu cầu..." }}
                columns={columns}
                dataSource={items}
                pagination={{
                  current: page,
                  pageSize,
                  total: totalItems,
                  showSizeChanger: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} trên ${total} yêu cầu`,
                }}
                onChange={(pagination) => {
                  setPage(pagination.current ?? 1);
                  setPageSize(pagination.pageSize ?? DEFAULT_PAGE_SIZE);
                }}
                scroll={{ x: 1750 }}
                locale={{
                  emptyText: (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có yêu cầu phù hợp với bộ lọc hiện tại." />
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

export default PaymentConfirmationListPage;
