import { ExclamationCircleOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Col, DatePicker, Empty, Form, Input, Modal, Row, Select, Space, Table, Typography } from "antd";
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
import type { InvoiceListQuery, InvoiceModel } from "../../models/invoice/invoice.model";
import { invoiceService } from "../../services/invoice/invoice.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage, toCurrency } from "../shared/page.utils";
import InvoiceStatusTag from "./components/InvoiceStatusTag";
import { formatInvoiceDate, INVOICE_STATUS_OPTIONS, resolveInvoiceNumber } from "./invoice.ui";

const DEFAULT_PAGE_SIZE = 10;

const InvoiceListPage = () => {
  const navigate = useNavigate();
  const { notify } = useNotify();
  const role = getStoredUserRole();

  const canCreateInvoice = canPerformAction(role, "invoice.create");
  const canUpdateInvoice = canPerformAction(role, "invoice.update");
  const canCancelInvoice = canPerformAction(role, "invoice.cancel");

  const [items, setItems] = useState<InvoiceModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [issueRange, setIssueRange] = useState<[string | undefined, string | undefined]>([undefined, undefined]);
  const [dueRange, setDueRange] = useState<[string | undefined, string | undefined]>([undefined, undefined]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [totalItems, setTotalItems] = useState(0);

  const [canceling, setCanceling] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<InvoiceModel | null>(null);
  const [cancelForm] = Form.useForm<{ reason: string }>();

  const query = useMemo<InvoiceListQuery>(
    () => ({
      keyword: keyword || undefined,
      status: status || undefined,
      issueFrom: issueRange[0],
      issueTo: issueRange[1],
      dueFrom: dueRange[0],
      dueTo: dueRange[1],
      page,
      pageSize,
      sortBy: "issueDate",
      sortDir: "desc",
    }),
    [dueRange, issueRange, keyword, page, pageSize, status],
  );

  const loadList = useCallback(async () => {
    try {
      setLoading(true);
      setListError(null);
      const response = await invoiceService.getList(query);
      setItems(response.items);
      setTotalItems(response.pagination.totalItems);
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải danh sách hóa đơn.");
      setListError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [notify, query]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  const openCancelModal = (invoice: InvoiceModel) => {
    setCancelTarget(invoice);
    cancelForm.resetFields();
  };

  const confirmCancel = async () => {
    if (!cancelTarget) {
      return;
    }

    if ((cancelTarget.paidAmount ?? 0) > 0) {
      notify("Không thể hủy hóa đơn đã có thanh toán.", "warning");
      return;
    }

    try {
      const values = await cancelForm.validateFields();
      setCanceling(true);
      await invoiceService.cancel(cancelTarget.id, {
        cancellationReason: values.reason.trim(),
      });
      notify("Hủy hóa đơn thành công.", "success");
      setCancelTarget(null);
      await loadList();
    } catch (error) {
      if (typeof error === "object" && error !== null && "errorFields" in error) {
        return;
      }
      notify(getErrorMessage(error, "Không thể hủy hóa đơn."), "error");
    } finally {
      setCanceling(false);
    }
  };

  const columns = useMemo<ColumnsType<InvoiceModel>>(
    () => [
      {
        title: "Số hóa đơn",
        key: "invoiceNumber",
        width: 210,
        render: (_, record) => (
          <Space direction="vertical" size={1}>
            <Typography.Text strong>{resolveInvoiceNumber(record.id, record.invoiceNumber)}</Typography.Text>
            <Typography.Text type="secondary">Mã: {record.id}</Typography.Text>
          </Space>
        ),
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
        title: "Hợp đồng / Đơn bán",
        key: "contract",
        width: 250,
        render: (_, record) =>
          record.contractId ? (
            <Space direction="vertical" size={0}>
              <Typography.Text>{record.contractNumber || record.contractId}</Typography.Text>
              <Space size={4} wrap>
                <Button type="link" size="small" onClick={() => navigate(ROUTE_URL.CONTRACT_DETAIL.replace(":id", record.contractId || ""))}>
                  Hợp đồng
                </Button>
                <Button type="link" size="small" onClick={() => navigate(ROUTE_URL.SALE_ORDER_DETAIL.replace(":id", record.contractId || ""))}>
                  Đơn bán
                </Button>
              </Space>
            </Space>
          ) : (
            "Chưa liên kết"
          ),
      },
      {
        title: "Ngày xuất",
        dataIndex: "issueDate",
        key: "issueDate",
        width: 130,
        render: (value?: string) => formatInvoiceDate(value),
      },
      {
        title: "Hạn thanh toán",
        dataIndex: "dueDate",
        key: "dueDate",
        width: 140,
        render: (value?: string) => formatInvoiceDate(value),
      },
      {
        title: "Tổng tiền",
        dataIndex: "grandTotal",
        key: "grandTotal",
        width: 150,
        align: "right",
        render: (value: number) => <Typography.Text strong>{toCurrency(value)}</Typography.Text>,
      },
      {
        title: "Còn phải thu",
        dataIndex: "outstandingAmount",
        key: "outstandingAmount",
        width: 160,
        align: "right",
        render: (value: number) => <Typography.Text style={{ color: value > 0 ? "#d4380d" : undefined }}>{toCurrency(value)}</Typography.Text>,
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 160,
        render: (value) => <InvoiceStatusTag status={value} />,
      },
      {
        title: "Thao tác",
        key: "actions",
        width: 230,
        fixed: "right",
        render: (_, record) => (
          <Space wrap size={4}>
            <Button type="link" onClick={() => navigate(ROUTE_URL.INVOICE_DETAIL.replace(":id", record.id))}>
              Chi tiết
            </Button>
            {canUpdateInvoice ? (
              <Button size="small" onClick={() => navigate(ROUTE_URL.INVOICE_EDIT.replace(":id", record.id))}>
                Cập nhật
              </Button>
            ) : null}
            {canCancelInvoice ? (
              <Button danger size="small" onClick={() => openCancelModal(record)}>
                Hủy
              </Button>
            ) : null}
          </Space>
        ),
      },
    ],
    [canCancelInvoice, canUpdateInvoice, navigate],
  );

  const summary = useMemo(() => {
    const total = items.length;
    const outstanding = items.reduce((sum, item) => sum + (item.outstandingAmount ?? 0), 0);
    const overdue = items.filter((item) => item.dueDate && dayjs(item.dueDate).isBefore(dayjs(), "day") && item.outstandingAmount > 0).length;
    return { total, outstanding, overdue };
  }, [items]);

  return (
    <>
      <NoResizeScreenTemplate
        bodyClassName="px-0 pb-0 pt-4"
        header={
          <ListScreenHeaderTemplate
            title="Danh sách hóa đơn"
            subtitle="Theo dõi phát hành hóa đơn, thu tiền và liên kết ngược hợp đồng/đơn bán."
            breadcrumb={<CustomBreadcrumb breadcrumbs={[{ label: "Trang chủ" }, { label: "Hóa đơn" }]} />}
            actions={
              <Space wrap>
                <Button icon={<ReloadOutlined />} onClick={() => void loadList()} loading={loading}>
                  Làm mới
                </Button>
                {canCreateInvoice ? (
                  <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(ROUTE_URL.INVOICE_CREATE)}>
                    Tạo hóa đơn
                  </Button>
                ) : null}
              </Space>
            }
          />
        }
        body={
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={8}><Card><Typography.Text type="secondary">Hóa đơn trong trang hiện tại</Typography.Text><Typography.Title level={3} style={{ margin: 0 }}>{summary.total}</Typography.Title></Card></Col>
              <Col xs={24} md={8}><Card><Typography.Text type="secondary">Tổng còn phải thu</Typography.Text><Typography.Title level={3} style={{ margin: 0, color: "#d4380d" }}>{toCurrency(summary.outstanding)}</Typography.Title></Card></Col>
              <Col xs={24} md={8}><Card><Typography.Text type="secondary">Số hóa đơn quá hạn</Typography.Text><Typography.Title level={3} style={{ margin: 0 }}>{summary.overdue}</Typography.Title></Card></Col>
            </Row>

            <Card>
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Row gutter={[12, 12]}>
                  <Col xs={24} lg={8}>
                    <Input.Search
                      allowClear
                      value={keywordInput}
                      placeholder="Tìm theo số hóa đơn, khách hàng, hợp đồng"
                      enterButton="Tìm"
                      onChange={(event) => setKeywordInput(event.target.value)}
                      onSearch={(value) => {
                        setKeyword(value.trim());
                        setPage(1);
                      }}
                    />
                  </Col>
                  <Col xs={24} sm={12} lg={4}><Select allowClear placeholder="Trạng thái" options={INVOICE_STATUS_OPTIONS} value={status} onChange={(value) => { setStatus(value); setPage(1); }} className="w-full" /></Col>
                  <Col xs={24} sm={12} lg={6}><DatePicker.RangePicker className="w-full" format="DD/MM/YYYY" placeholder={["Từ ngày xuất", "Đến ngày xuất"]} value={[issueRange[0] ? dayjs(issueRange[0]) : null, issueRange[1] ? dayjs(issueRange[1]) : null]} onChange={(dates) => { setIssueRange([dates?.[0]?.format("YYYY-MM-DD"), dates?.[1]?.format("YYYY-MM-DD")]); setPage(1); }} /></Col>
                  <Col xs={24} sm={12} lg={6}><DatePicker.RangePicker className="w-full" format="DD/MM/YYYY" placeholder={["Từ hạn thanh toán", "Đến hạn thanh toán"]} value={[dueRange[0] ? dayjs(dueRange[0]) : null, dueRange[1] ? dayjs(dueRange[1]) : null]} onChange={(dates) => { setDueRange([dates?.[0]?.format("YYYY-MM-DD"), dates?.[1]?.format("YYYY-MM-DD")]); setPage(1); }} /></Col>
                </Row>

                <Button onClick={() => { setKeywordInput(""); setKeyword(""); setStatus(undefined); setIssueRange([undefined, undefined]); setDueRange([undefined, undefined]); setPage(1); setPageSize(DEFAULT_PAGE_SIZE); }}>
                  Đặt lại bộ lọc
                </Button>

                {listError ? <Alert type="error" showIcon message="Không thể tải danh sách hóa đơn." description={listError} /> : null}

                <Table<InvoiceModel>
                  rowKey="id"
                  loading={{ spinning: loading, tip: "Đang tải danh sách hóa đơn..." }}
                  columns={columns}
                  dataSource={items}
                  pagination={{ current: page, pageSize, total: totalItems, showSizeChanger: true, showTotal: (total, range) => `${range[0]}-${range[1]} trên ${total} hóa đơn` }}
                  onChange={(pagination) => { setPage(pagination.current ?? 1); setPageSize(pagination.pageSize ?? DEFAULT_PAGE_SIZE); }}
                  scroll={{ x: 1600 }}
                  locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có hóa đơn phù hợp với bộ lọc hiện tại." /> }}
                />
              </Space>
            </Card>
          </Space>
        }
      />

      <Modal
        title="Xác nhận hủy hóa đơn"
        open={Boolean(cancelTarget)}
        onCancel={() => (canceling ? undefined : setCancelTarget(null))}
        onOk={() => void confirmCancel()}
        okText="Xác nhận hủy"
        cancelText="Đóng"
        okButtonProps={{ danger: true, loading: canceling, icon: <ExclamationCircleOutlined /> }}
      >
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Alert type="warning" showIcon message="Thao tác này không thể hoàn tác." />
          <Typography.Text>
            Hóa đơn: <Typography.Text strong>{resolveInvoiceNumber(cancelTarget?.id, cancelTarget?.invoiceNumber)}</Typography.Text>
          </Typography.Text>
          <Form form={cancelForm} layout="vertical">
            <Form.Item label="Lý do hủy" name="reason" rules={[{ required: true, message: "Vui lòng nhập lý do hủy hóa đơn." }, { max: 1000, message: "Lý do tối đa 1000 ký tự." }]}>
              <Input.TextArea rows={4} maxLength={1000} showCount />
            </Form.Item>
          </Form>
        </Space>
      </Modal>
    </>
  );
};

export default InvoiceListPage;
