import { MoreOutlined, ReloadOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Alert, Breadcrumb, Button, Card, Col, DatePicker, Dropdown, Empty, Input, InputNumber, Row, Select, Space, Table, Tooltip, Typography } from "antd";
import type { MenuProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { canPerformAction } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { DebtModel, InvoiceModel } from "../../models/payment/payment.model";
import { paymentService } from "../../services/payment/payment.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage, toCurrency } from "../shared/page.utils";
import PaymentStatusTag from "./components/PaymentStatusTag";
import PaymentSummaryCards from "./components/PaymentSummaryCards";
import { formatPaymentDate, getInvoiceDisplayStatus, PAYMENT_STATUS_OPTIONS, type InvoiceDisplayStatus } from "./payment.ui";

const PaymentListPage = () => {
  const navigate = useNavigate();
  const role = getStoredUserRole();
  const { notify } = useNotify();

  const canRecordPayment = canPerformAction(role, "payment.record");
  const canCreateInvoice = canPerformAction(role, "invoice.create");
  const canUpdateInvoice = canPerformAction(role, "invoice.update");
  const canCancelInvoice = canPerformAction(role, "invoice.cancel");
  const canSendReminder = canPerformAction(role, "payment.reminder.send");
  const canConfirmSettlement = canPerformAction(role, "debt.settlement.confirm");

  const [allInvoices, setAllInvoices] = useState<InvoiceModel[]>([]);
  const [debtItems, setDebtItems] = useState<DebtModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [searchText, setSearchText] = useState("");
  const [keyword, setKeyword] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<InvoiceDisplayStatus[]>([]);
  const [dueDateRange, setDueDateRange] = useState<[string | undefined, string | undefined]>([undefined, undefined]);
  const [amountRange, setAmountRange] = useState<{ min?: number; max?: number }>({});

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setListError(null);
      const [invoices, debts] = await Promise.all([paymentService.getInvoiceList({ keyword: keyword || undefined }), paymentService.getDebtStatus({ keyword: keyword || undefined })]);
      setAllInvoices(invoices);
      setDebtItems(debts);
    } catch (err) {
      const message = getErrorMessage(err, "Không thể tải danh sách hóa đơn.");
      setListError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [keyword, notify]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredInvoices = useMemo(() => {
    const [fromDate, toDate] = dueDateRange;
    const from = fromDate ? dayjs(fromDate).startOf("day") : null;
    const to = toDate ? dayjs(toDate).endOf("day") : null;

    return allInvoices.filter((invoice) => {
      const displayStatus = getInvoiceDisplayStatus(invoice);
      const isStatusMatched = selectedStatuses.length === 0 || selectedStatuses.includes(displayStatus);

      const due = invoice.dueDate ? dayjs(invoice.dueDate) : null;
      const isDueDateMatched =
        (!from || (due?.isValid() && (due.isAfter(from) || due.isSame(from)))) &&
        (!to || (due?.isValid() && (due.isBefore(to) || due.isSame(to))));

      const minAmount = amountRange.min;
      const maxAmount = amountRange.max;
      const isAmountMatched = (minAmount == null || invoice.totalAmount >= minAmount) && (maxAmount == null || invoice.totalAmount <= maxAmount);

      return isStatusMatched && isDueDateMatched && isAmountMatched;
    });
  }, [allInvoices, amountRange.max, amountRange.min, dueDateRange, selectedStatuses]);

  const summary = useMemo(() => {
    const totalInvoices = filteredInvoices.length;
    const overdueInvoices = filteredInvoices.filter((item) => getInvoiceDisplayStatus(item) === "OVERDUE").length;
    const dueSoonInvoices = filteredInvoices.filter((item) => getInvoiceDisplayStatus(item) === "DUE_SOON").length;
    const paidInvoices = filteredInvoices.filter((item) => getInvoiceDisplayStatus(item) === "PAID").length;
    const unpaidInvoices = filteredInvoices.filter((item) => getInvoiceDisplayStatus(item) !== "PAID").length;

    return {
      totalInvoices,
      overdueInvoices,
      dueSoonInvoices,
      paidInvoices,
      unpaidInvoices,
    };
  }, [filteredInvoices]);

  const debtSummary = useMemo(
    () => ({
      customers: debtItems.length,
      totalDebt: debtItems.reduce((sum, item) => sum + (item.totalDebt ?? 0), 0),
      overdueDebt: debtItems.reduce((sum, item) => sum + (item.overdueDebt ?? 0), 0),
    }),
    [debtItems],
  );

  const pagedInvoices = useMemo(() => filteredInvoices.slice((page - 1) * pageSize, page * pageSize), [filteredInvoices, page, pageSize]);

  const unavailableActions = useMemo(() => {
    const actions: string[] = [];
    if (canCreateInvoice) {
      actions.push("Tạo hóa đơn");
    }
    if (canUpdateInvoice) {
      actions.push("Cập nhật hóa đơn");
    }
    if (canCancelInvoice) {
      actions.push("Hủy hóa đơn");
    }
    if (canSendReminder) {
      actions.push("Gửi nhắc thanh toán");
    }
    if (canConfirmSettlement) {
      actions.push("Xác nhận tất toán");
    }
    return actions;
  }, [canCancelInvoice, canConfirmSettlement, canCreateInvoice, canSendReminder, canUpdateInvoice]);

  const extraActionItems = useMemo<NonNullable<MenuProps["items"]>>(
    () =>
      unavailableActions.map((action) => ({
        key: action,
        disabled: true,
        label: <Tooltip title="Tính năng đang chờ backend hỗ trợ">{action}</Tooltip>,
      })),
    [unavailableActions],
  );

  const handleResetFilters = () => {
    setSearchText("");
    setKeyword("");
    setSelectedStatuses([]);
    setDueDateRange([undefined, undefined]);
    setAmountRange({});
    setPage(1);
  };

  const invoiceColumns = useMemo<ColumnsType<InvoiceModel>>(
    () => [
      {
        title: "Mã hóa đơn",
        dataIndex: "id",
        key: "id",
        render: (value: string) => (
          <Space orientation="vertical" size={0}>
            <Typography.Text strong>{value}</Typography.Text>
            <Typography.Text type="secondary">Mã tham chiếu</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Hợp đồng",
        dataIndex: "contractId",
        key: "contractId",
        render: (value: string) => value || "Chưa liên kết",
      },
      {
        title: "Khách hàng",
        dataIndex: "customerId",
        key: "customerId",
        render: (value: string) => value || "Chưa cập nhật",
      },
      {
        title: "Tổng tiền",
        dataIndex: "totalAmount",
        key: "totalAmount",
        align: "right",
        render: (value: number) => <Typography.Text strong>{toCurrency(value)}</Typography.Text>,
      },
      {
        title: "Đã thanh toán",
        dataIndex: "paidAmount",
        key: "paidAmount",
        align: "right",
        render: (value: number) => <Typography.Text style={{ color: "#16a34a" }}>{toCurrency(value)}</Typography.Text>,
      },
      {
        title: "Còn lại",
        dataIndex: "dueAmount",
        key: "dueAmount",
        align: "right",
        render: (value: number) => <Typography.Text style={{ color: value > 0 ? "#dc2626" : "#16a34a" }}>{toCurrency(value)}</Typography.Text>,
      },
      {
        title: "Hạn thanh toán",
        dataIndex: "dueDate",
        key: "dueDate",
        render: (value?: string) => formatPaymentDate(value, "Chưa có hạn"),
      },
      {
        title: "Trạng thái",
        key: "status",
        render: (_, row) => <PaymentStatusTag status={row.status} dueDate={row.dueDate} dueAmount={row.dueAmount} />,
      },
      {
        title: "Thao tác",
        key: "actions",
        fixed: "right",
        width: 190,
        render: (_, row) => {
          const rowItems: MenuProps["items"] = [];
          if (canUpdateInvoice) {
            rowItems.push({
              key: `edit-${row.id}`,
              disabled: true,
              label: <Tooltip title="Tính năng đang chờ backend hỗ trợ">Cập nhật hóa đơn</Tooltip>,
            });
          }
          if (canCancelInvoice) {
            rowItems.push({
              key: `cancel-${row.id}`,
              danger: true,
              disabled: true,
              label: <Tooltip title="Tính năng đang chờ backend hỗ trợ">Hủy hóa đơn</Tooltip>,
            });
          }
          if (canSendReminder) {
            rowItems.push({
              key: `reminder-${row.id}`,
              disabled: true,
              label: <Tooltip title="Tính năng đang chờ backend hỗ trợ">Gửi nhắc thanh toán</Tooltip>,
            });
          }
          if (canConfirmSettlement) {
            rowItems.push({
              key: `settlement-${row.id}`,
              disabled: true,
              label: <Tooltip title="Tính năng đang chờ backend hỗ trợ">Xác nhận tất toán</Tooltip>,
            });
          }

          return (
            <Space>
              <Button type="link" onClick={() => navigate(ROUTE_URL.PAYMENT_DETAIL.replace(":id", row.id))}>
                Chi tiết
              </Button>
              {canRecordPayment && row.dueAmount > 0 ? (
                <Button type="primary" ghost size="small" onClick={() => navigate(ROUTE_URL.PAYMENT_RECORD.replace(":id", row.id))}>
                  Ghi nhận
                </Button>
              ) : null}
              {rowItems.length > 0 ? (
                <Dropdown menu={{ items: rowItems }} trigger={["click"]}>
                  <Button size="small" icon={<MoreOutlined />} />
                </Dropdown>
              ) : null}
            </Space>
          );
        },
      },
    ],
    [canCancelInvoice, canConfirmSettlement, canRecordPayment, canSendReminder, canUpdateInvoice, navigate],
  );

  const debtColumns = useMemo<ColumnsType<DebtModel>>(
    () => [
      {
        title: "Khách hàng",
        key: "customer",
        render: (_, row) => (
          <Space orientation="vertical" size={0}>
            <Typography.Text strong>{row.customerName || row.customerId || "Chưa cập nhật"}</Typography.Text>
            <Typography.Text type="secondary">{row.customerId || "-"}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Tổng công nợ",
        dataIndex: "totalDebt",
        key: "totalDebt",
        align: "right",
        render: (value: number) => <Typography.Text strong>{toCurrency(value)}</Typography.Text>,
      },
      {
        title: "Nợ quá hạn",
        dataIndex: "overdueDebt",
        key: "overdueDebt",
        align: "right",
        render: (value: number | undefined) => <Typography.Text style={{ color: "#dc2626" }}>{toCurrency(value ?? 0)}</Typography.Text>,
      },
    ],
    [],
  );

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Quản lý hóa đơn và công nợ"
          subtitle="Theo dõi công nợ khách hàng, tình trạng thanh toán và hạn đến hạn ngay trên một màn hình."
          breadcrumb={<Breadcrumb items={[{ title: "Trang chủ" }, { title: "Thanh toán" }]} />}
          actions={
            <Space wrap>
              <Button icon={<ReloadOutlined />} onClick={() => void loadData()} loading={loading}>
                Làm mới
              </Button>
              {extraActionItems.length > 0 ? (
                <Dropdown menu={{ items: extraActionItems }} trigger={["click"]}>
                  <Button icon={<MoreOutlined />}>Nghiệp vụ mở rộng</Button>
                </Dropdown>
              ) : null}
            </Space>
          }
        />
      }
      body={
        <Space orientation="vertical" size={16} style={{ width: "100%" }}>
          <PaymentSummaryCards
            totalInvoices={summary.totalInvoices}
            unpaidInvoices={summary.unpaidInvoices}
            overdueInvoices={summary.overdueInvoices}
            paidInvoices={summary.paidInvoices}
            dueSoonInvoices={summary.dueSoonInvoices}
            loading={loading}
          />

          <Card title="Danh sách hóa đơn">
            <Space orientation="vertical" size={16} style={{ width: "100%" }}>
              <Row gutter={[12, 12]} align="middle">
                <Col xs={24} lg={9}>
                  <Input.Search
                    allowClear
                    value={searchText}
                    placeholder="Tìm theo mã hóa đơn, mã hợp đồng hoặc mã khách hàng"
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
                    mode="multiple"
                    maxTagCount={2}
                    allowClear
                    placeholder="Lọc theo trạng thái"
                    value={selectedStatuses}
                    options={PAYMENT_STATUS_OPTIONS}
                    onChange={(value: InvoiceDisplayStatus[]) => {
                      setSelectedStatuses(value);
                      setPage(1);
                    }}
                    className="w-full"
                  />
                </Col>
                <Col xs={24} sm={12} lg={5}>
                  <DatePicker.RangePicker
                    className="w-full"
                    format="DD/MM/YYYY"
                    placeholder={["Từ hạn thanh toán", "Đến hạn thanh toán"]}
                    value={[
                      dueDateRange[0] ? dayjs(dueDateRange[0]) : null,
                      dueDateRange[1] ? dayjs(dueDateRange[1]) : null,
                    ]}
                    onChange={(value) => {
                      setDueDateRange([value?.[0]?.format("YYYY-MM-DD"), value?.[1]?.format("YYYY-MM-DD")]);
                      setPage(1);
                    }}
                  />
                </Col>
                <Col xs={24} lg={4}>
                  <Space.Compact className="w-full">
                    <InputNumber
                      className="w-full"
                      min={0}
                      value={amountRange.min}
                      placeholder="Từ tiền"
                      onChange={(value) => {
                        setAmountRange((previous) => ({ ...previous, min: value == null ? undefined : Number(value) }));
                        setPage(1);
                      }}
                    />
                    <InputNumber
                      className="w-full"
                      min={0}
                      value={amountRange.max}
                      placeholder="Đến tiền"
                      onChange={(value) => {
                        setAmountRange((previous) => ({ ...previous, max: value == null ? undefined : Number(value) }));
                        setPage(1);
                      }}
                    />
                  </Space.Compact>
                </Col>
                <Col xs={24} lg={24}>
                  <Button onClick={handleResetFilters}>Đặt lại bộ lọc</Button>
                </Col>
              </Row>

              {amountRange.min != null && amountRange.max != null && amountRange.min > amountRange.max ? (
                <Alert
                  type="warning"
                  showIcon
                  message="Khoảng tiền chưa hợp lệ."
                  description="Giá trị Từ tiền cần nhỏ hơn hoặc bằng Đến tiền."
                />
              ) : null}

              {listError ? <Alert type="error" showIcon message="Không thể tải dữ liệu thanh toán." description={listError} /> : null}

              <Table<InvoiceModel>
                rowKey="id"
                columns={invoiceColumns}
                dataSource={pagedInvoices}
                loading={{ spinning: loading, description: "Đang tải hóa đơn..." }}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Không có hóa đơn phù hợp với bộ lọc hiện tại."
                    />
                  ),
                }}
                pagination={{
                  current: page,
                  pageSize,
                  total: filteredInvoices.length,
                  showSizeChanger: true,
                  showTotal: (total, range) => `${range[0]}-${range[1]} trên ${total} hóa đơn`,
                }}
                onChange={(pagination) => {
                  setPage(pagination.current ?? 1);
                  setPageSize(pagination.pageSize ?? 8);
                }}
                scroll={{ x: 1200 }}
              />
            </Space>
          </Card>

          <Card
            title="Công nợ theo khách hàng"
            extra={
              <Typography.Text type="secondary">
                {debtSummary.customers} khách hàng • Tổng nợ {toCurrency(debtSummary.totalDebt)} • Nợ quá hạn {toCurrency(debtSummary.overdueDebt)}
              </Typography.Text>
            }
          >
            <Table<DebtModel>
              rowKey={(record) => `${record.customerId}-${record.customerName ?? ""}`}
              columns={debtColumns}
              dataSource={debtItems}
              loading={{ spinning: loading, description: "Đang tải công nợ..." }}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa ghi nhận công nợ khách hàng nào trong phạm vi lọc hiện tại."
                  />
                ),
              }}
              pagination={{
                pageSize: 5,
                showSizeChanger: false,
                showTotal: (total) => `Tổng ${total} khách hàng`,
              }}
            />
          </Card>
        </Space>
      }
    />
  );
};

export default PaymentListPage;
