import { ArrowLeftOutlined, CopyOutlined, EditOutlined, ExclamationCircleOutlined, ReloadOutlined, StopOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Col, DatePicker, Descriptions, Empty, Form, Image, Input, InputNumber, Modal, QRCode, Row, Space, Table, Typography } from "antd";
import type { FormInstance } from "antd/es/form";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { canPerformAction } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { InvoiceModel } from "../../models/invoice/invoice.model";
import type { CreatePaymentConfirmationRequest, PaymentConfirmationRequestModel, PaymentInstructionModel } from "../../models/payment-confirmation/payment-confirmation.model";
import { invoiceService } from "../../services/invoice/invoice.service";
import { paymentConfirmationService } from "../../services/payment-confirmation/payment-confirmation.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage, getFieldErrorMap, toCurrency } from "../shared/page.utils";
import PaymentConfirmationStatusTag from "../payment-confirmations/components/PaymentConfirmationStatusTag";
import { emitPaymentConfirmationChanged, PAYMENT_CONFIRMATION_CHANGED_EVENT } from "../payment-confirmations/paymentConfirmation.events";
import {
  formatPaymentConfirmationAmountWithCurrency,
  formatPaymentConfirmationDateTime,
  hasPendingPaymentConfirmationRequest,
  isInvoicePayableForConfirmation,
} from "../payment-confirmations/paymentConfirmation.ui";
import InvoiceStatusTag from "./components/InvoiceStatusTag";
import { formatInvoiceDate, formatInvoiceDateTime, resolveInvoiceNumber } from "./invoice.ui";

type CreateRequestFormValues = {
  requestedAmount: number;
  transferTime: dayjs.Dayjs;
  senderBankName: string;
  senderAccountName: string;
  senderAccountNo: string;
  referenceCode: string;
  proofDocumentUrl?: string;
  note?: string;
};

const DEFAULT_REQUEST_PAGE_SIZE = 20;
const hasMaxTwoDecimals = (value: number) => Math.round(value * 100) === value * 100;

const applyFieldErrors = <T extends object>(form: FormInstance<T>, error: unknown) => {
  const fieldErrors = Object.entries(getFieldErrorMap(error)).filter(([field, messages]) => field !== "_global" && messages.length > 0);
  if (fieldErrors.length === 0) {
    return;
  }

  form.setFields(
    fieldErrors.map(([field, messages]) => ({
      name: field as never,
      errors: messages,
    })),
  );
};

const InvoiceDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const role = getStoredUserRole();
  const { notify } = useNotify();
  const [createRequestForm] = Form.useForm<CreateRequestFormValues>();

  const canUpdateInvoice = canPerformAction(role, "invoice.update");
  const canCancelInvoice = canPerformAction(role, "invoice.cancel");
  const canRecordPayment = canPerformAction(role, "payment.record");
  const isCustomer = role === "CUSTOMER";

  const [invoice, setInvoice] = useState<InvoiceModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [paymentInstruction, setPaymentInstruction] = useState<PaymentInstructionModel | null>(null);
  const [paymentInstructionLoading, setPaymentInstructionLoading] = useState(false);
  const [paymentInstructionError, setPaymentInstructionError] = useState<string | null>(null);
  const [requestItems, setRequestItems] = useState<PaymentConfirmationRequestModel[]>([]);
  const [requestLoading, setRequestLoading] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const [createRequestModalOpen, setCreateRequestModalOpen] = useState(false);
  const [createRequestSubmitting, setCreateRequestSubmitting] = useState(false);

  const loadDetail = useCallback(async () => {
    if (!id) {
      return;
    }
    try {
      setLoading(true);
      setDetailError(null);
      const response = await invoiceService.getDetail(id);
      setInvoice(response);
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải chi tiết hóa đơn.");
      setDetailError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [id, notify]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const loadRequestList = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      setRequestLoading(true);
      setRequestError(null);
      const response = await paymentConfirmationService.getInvoiceRequests(id, {
        page: 1,
        pageSize: DEFAULT_REQUEST_PAGE_SIZE,
        sortBy: "createdAt",
        sortDir: "desc",
      });
      setRequestItems(response.items);
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải lịch sử xác nhận thanh toán.");
      setRequestError(message);
      notify(message, "error");
    } finally {
      setRequestLoading(false);
    }
  }, [id, notify]);

  const loadPaymentInstruction = useCallback(
    async (invoiceId: string) => {
      try {
        setPaymentInstructionLoading(true);
        setPaymentInstructionError(null);
        const response = await paymentConfirmationService.getInvoicePaymentInstruction(invoiceId);
        setPaymentInstruction(response);
      } catch (error) {
        const message = getErrorMessage(error, "Không thể tải hướng dẫn chuyển khoản.");
        setPaymentInstruction(null);
        setPaymentInstructionError(message);
        notify(message, "error");
      } finally {
        setPaymentInstructionLoading(false);
      }
    },
    [notify],
  );

  useEffect(() => {
    void loadRequestList();
  }, [loadRequestList]);

  useEffect(() => {
    if (invoice && isInvoicePayableForConfirmation(invoice)) {
      void loadPaymentInstruction(invoice.id);
      return;
    }

    setPaymentInstruction(null);
    setPaymentInstructionError(null);
  }, [invoice, loadPaymentInstruction]);

  useEffect(() => {
    const handleChanged = (event: Event) => {
      const detail = (event as CustomEvent<{ invoiceId?: string }>).detail;
      if (!id || !detail?.invoiceId || detail.invoiceId === id) {
        void loadDetail();
        void loadRequestList();
      }
    };

    window.addEventListener(PAYMENT_CONFIRMATION_CHANGED_EVENT, handleChanged);
    return () => window.removeEventListener(PAYMENT_CONFIRMATION_CHANGED_EVENT, handleChanged);
  }, [id, loadDetail, loadRequestList]);

  const itemColumns = useMemo<ColumnsType<InvoiceModel["items"][number]>>(
    () => [
      { title: "Mặt hàng", key: "description", render: (_, row) => row.description || row.productId || "Chưa cập nhật" },
      { title: "Đơn vị", dataIndex: "unit", key: "unit", width: 110, render: (value?: string) => value || "-" },
      { title: "Số lượng", dataIndex: "quantity", key: "quantity", width: 100, align: "right" },
      { title: "Đơn giá", dataIndex: "unitPrice", key: "unitPrice", width: 140, align: "right", render: (value: number) => toCurrency(value) },
      { title: "Thành tiền", dataIndex: "lineTotal", key: "lineTotal", width: 150, align: "right", render: (value?: number) => toCurrency(value ?? 0) },
    ],
    [],
  );

  const paymentColumns = useMemo<ColumnsType<InvoiceModel["paymentHistory"][number]>>(
    () => [
      { title: "Số phiếu thu", key: "receiptNumber", render: (_, row) => row.receiptNumber || row.paymentId || "-" },
      { title: "Ngày thanh toán", dataIndex: "paymentDate", key: "paymentDate", render: (value?: string) => formatInvoiceDateTime(value) },
      { title: "Phương thức", dataIndex: "paymentMethod", key: "paymentMethod", render: (value?: string) => value || "Chưa cập nhật" },
      { title: "Số tham chiếu", dataIndex: "referenceNo", key: "referenceNo", render: (value?: string) => value || "-" },
      { title: "Số tiền phân bổ", dataIndex: "allocatedAmount", key: "allocatedAmount", align: "right", render: (value: number) => toCurrency(value) },
    ],
    [],
  );

  const requestColumns = useMemo<ColumnsType<PaymentConfirmationRequestModel>>(
    () => [
      {
        title: "Số tiền yêu cầu",
        dataIndex: "requestedAmount",
        key: "requestedAmount",
        width: 170,
        align: "right",
        render: (value?: number) => <Typography.Text strong>{formatPaymentConfirmationAmountWithCurrency(value)}</Typography.Text>,
      },
      {
        title: "Thời gian chuyển khoản",
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
        width: 140,
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
        key: "action",
        width: 120,
        render: (_, row) => (
          <Button type="link" onClick={() => navigate(ROUTE_URL.PAYMENT_CONFIRMATION_DETAIL.replace(":id", row.id))}>
            Xem chi tiết
          </Button>
        ),
      },
    ],
    [navigate],
  );

  const canCancelByBusiness = (invoice?.paidAmount ?? 0) <= 0;
  const invoiceAllowsPaymentConfirmation = isInvoicePayableForConfirmation(invoice);
  const hasPendingReview = hasPendingPaymentConfirmationRequest(requestItems);
  const canOpenCreateRequest = isCustomer && invoiceAllowsPaymentConfirmation;

  const handleCancelInvoice = async () => {
    if (!invoice) {
      return;
    }
    const reason = cancelReason.trim();
    if (!reason) {
      notify("Vui lòng nhập lý do hủy hóa đơn.", "warning");
      return;
    }
    try {
      setCanceling(true);
      const updated = await invoiceService.cancel(invoice.id, { cancellationReason: reason });
      setInvoice(updated);
      setCancelModalOpen(false);
      setCancelReason("");
      notify("Hủy hóa đơn thành công.", "success");
    } catch (error) {
      notify(getErrorMessage(error, "Không thể hủy hóa đơn."), "error");
    } finally {
      setCanceling(false);
    }
  };

  const handleCopyTransferContent = async () => {
    if (!paymentInstruction?.transferContent) {
      return;
    }

    try {
      await navigator.clipboard.writeText(paymentInstruction.transferContent);
      notify("Đã sao chép nội dung chuyển khoản.", "success");
    } catch {
      notify("Không thể sao chép nội dung chuyển khoản.", "error");
    }
  };

  const openCreateRequestModal = () => {
    if (!invoice) {
      return;
    }

    createRequestForm.setFieldsValue({
      requestedAmount: invoice.outstandingAmount,
      transferTime: dayjs(),
      referenceCode: paymentInstruction?.transferContent ?? undefined,
      senderBankName: undefined,
      senderAccountName: undefined,
      senderAccountNo: undefined,
      proofDocumentUrl: undefined,
      note: undefined,
    });
    createRequestForm.resetFields(["senderBankName", "senderAccountName", "senderAccountNo", "proofDocumentUrl", "note"]);
    setCreateRequestModalOpen(true);
  };

  const handleCreateRequest = async () => {
    if (!invoice) {
      return;
    }

    if (!invoiceAllowsPaymentConfirmation) {
      notify("Hóa đơn hiện tại không hợp lệ để gửi yêu cầu xác nhận thanh toán.", "warning");
      return;
    }

    if (hasPendingReview) {
      notify("Hóa đơn đã có yêu cầu đang chờ duyệt.", "warning");
      return;
    }

    try {
      const values = await createRequestForm.validateFields();
      const payload: CreatePaymentConfirmationRequest = {
        requestedAmount: Number(values.requestedAmount),
        transferTime: values.transferTime.format("YYYY-MM-DDTHH:mm:ss"),
        senderBankName: values.senderBankName.trim(),
        senderAccountName: values.senderAccountName.trim(),
        senderAccountNo: values.senderAccountNo.trim(),
        referenceCode: values.referenceCode.trim(),
        proofDocumentUrl: values.proofDocumentUrl?.trim() || undefined,
        note: values.note?.trim() || undefined,
      };

      setCreateRequestSubmitting(true);
      await paymentConfirmationService.createInvoiceRequest(invoice.id, payload);
      setCreateRequestModalOpen(false);
      createRequestForm.resetFields();
      notify("Gửi yêu cầu xác nhận thanh toán thành công.", "success");
      emitPaymentConfirmationChanged({ invoiceId: invoice.id });
      await Promise.all([loadDetail(), loadRequestList()]);
    } catch (error) {
      if (typeof error === "object" && error !== null && "errorFields" in error) {
        return;
      }

      applyFieldErrors(createRequestForm, error);
      notify(getErrorMessage(error, "Không thể gửi yêu cầu xác nhận thanh toán."), "error");
    } finally {
      setCreateRequestSubmitting(false);
    }
  };

  const contractId = invoice?.contractId;

  return (
    <>
      <NoResizeScreenTemplate
        bodyClassName="px-0 pb-0 pt-4"
        header={
          <ListScreenHeaderTemplate
            title={invoice ? resolveInvoiceNumber(invoice.id, invoice.invoiceNumber) : "Chi tiết hóa đơn"}
            subtitle="Theo dõi thông tin hóa đơn, thanh toán, và liên kết ngược hợp đồng/đơn bán."
            breadcrumb={<CustomBreadcrumb breadcrumbs={[{ label: "Trang chủ" }, { label: "Hóa đơn", url: ROUTE_URL.INVOICE_LIST }, { label: "Chi tiết" }]} />}
            actions={
              <Space wrap>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTE_URL.INVOICE_LIST)}>
                  Quay lại
                </Button>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={() => {
                    void loadDetail();
                    void loadRequestList();
                  }}
                  loading={loading || requestLoading}
                >
                  Làm mới
                </Button>
                {canRecordPayment && (invoice?.outstandingAmount ?? 0) > 0 ? (
                  <Button type="primary" onClick={() => navigate(ROUTE_URL.PAYMENT_RECORD_BY_INVOICE.replace(":id", invoice?.id ?? ""))}>
                    Ghi nhận thanh toán
                  </Button>
                ) : null}
                {canUpdateInvoice ? (
                  <Button icon={<EditOutlined />} onClick={() => navigate(ROUTE_URL.INVOICE_EDIT.replace(":id", invoice?.id ?? ""))} disabled={!invoice}>
                    Cập nhật
                  </Button>
                ) : null}
                {canCancelInvoice ? (
                  <Button danger icon={<StopOutlined />} onClick={() => setCancelModalOpen(true)} disabled={!invoice || !canCancelByBusiness}>
                    Hủy hóa đơn
                  </Button>
                ) : null}
              </Space>
            }
          />
        }
        body={
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            {!id ? <Alert type="warning" showIcon message="Không tìm thấy mã hóa đơn trên đường dẫn." /> : null}
            {detailError ? <Alert type="error" showIcon message="Không thể tải chi tiết hóa đơn." description={detailError} /> : null}

            {!loading && !invoice ? (
              <Card>
                <Empty description="Không có dữ liệu hóa đơn để hiển thị." />
              </Card>
            ) : null}

            {invoice ? (
              <>
                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={12}>
                    <Card title="Thông tin chung">
                      <Descriptions column={1} size="small" colon={false}>
                        <Descriptions.Item label="Số hóa đơn">{resolveInvoiceNumber(invoice.id, invoice.invoiceNumber)}</Descriptions.Item>
                        <Descriptions.Item label="Trạng thái"><InvoiceStatusTag status={invoice.status} /></Descriptions.Item>
                        <Descriptions.Item label="Ngày xuất">{formatInvoiceDate(invoice.issueDate)}</Descriptions.Item>
                        <Descriptions.Item label="Hạn thanh toán">{formatInvoiceDate(invoice.dueDate)}</Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Card title="Khách hàng">
                      <Descriptions column={1} size="small" colon={false}>
                        <Descriptions.Item label="Tên khách hàng">{invoice.customerName || "Chưa cập nhật"}</Descriptions.Item>
                        <Descriptions.Item label="Mã khách hàng">{invoice.customerCode || invoice.customerId || "-"}</Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ xuất hóa đơn">{invoice.billingAddress || "Chưa cập nhật"}</Descriptions.Item>
                        <Descriptions.Item label="Điều khoản thanh toán">{invoice.paymentTerms || "Chưa cập nhật"}</Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                </Row>

                <Card title="Liên kết hợp đồng / đơn bán">
                  <Space direction="vertical" size={8} style={{ width: "100%" }}>
                    <Typography.Text>Mã hợp đồng: <Typography.Text strong>{invoice.contractNumber || contractId || "Chưa liên kết"}</Typography.Text></Typography.Text>
                    {contractId ? (
                      <Space wrap>
                        <Button onClick={() => navigate(ROUTE_URL.CONTRACT_DETAIL.replace(":id", contractId))}>Mở hợp đồng</Button>
                        <Button onClick={() => navigate(ROUTE_URL.SALE_ORDER_DETAIL.replace(":id", contractId))}>Mở đơn bán</Button>
                      </Space>
                    ) : null}
                  </Space>
                </Card>

                <Card title="Giá trị hóa đơn">
                  <Descriptions column={{ xs: 1, md: 3 }} size="small" colon={false}>
                    <Descriptions.Item label="Tạm tính">{toCurrency(invoice.subtotalAmount)}</Descriptions.Item>
                    <Descriptions.Item label="Điều chỉnh">{toCurrency(invoice.adjustmentAmount)}</Descriptions.Item>
                    <Descriptions.Item label="Thuế GTGT">{toCurrency(invoice.vatAmount)}</Descriptions.Item>
                    <Descriptions.Item label="Tổng tiền">{toCurrency(invoice.grandTotal)}</Descriptions.Item>
                    <Descriptions.Item label="Đã thu">{toCurrency(invoice.paidAmount)}</Descriptions.Item>
                    <Descriptions.Item label="Còn phải thu">{toCurrency(invoice.outstandingAmount)}</Descriptions.Item>
                  </Descriptions>
                </Card>

                <Card
                  title="Thanh toán chuyển khoản thủ công"
                  extra={
                    canOpenCreateRequest ? (
                      <Button type="primary" onClick={openCreateRequestModal} disabled={hasPendingReview}>
                        Gửi xác nhận thanh toán
                      </Button>
                    ) : null
                  }
                >
                  <Space direction="vertical" size={16} style={{ width: "100%" }}>
                    <Descriptions column={{ xs: 1, md: 2, lg: 3 }} size="small" colon={false}>
                      <Descriptions.Item label="Số hóa đơn">{resolveInvoiceNumber(invoice.id, invoice.invoiceNumber)}</Descriptions.Item>
                      <Descriptions.Item label="Tên khách hàng">{invoice.customerName || "Chưa cập nhật"}</Descriptions.Item>
                      <Descriptions.Item label="Trạng thái hóa đơn"><InvoiceStatusTag status={invoice.status} /></Descriptions.Item>
                      <Descriptions.Item label="Tổng tiền">{formatPaymentConfirmationAmountWithCurrency(invoice.grandTotal)}</Descriptions.Item>
                      <Descriptions.Item label="Đã thanh toán">{formatPaymentConfirmationAmountWithCurrency(invoice.paidAmount)}</Descriptions.Item>
                      <Descriptions.Item label="Còn phải thu">
                        <Typography.Text strong>{formatPaymentConfirmationAmountWithCurrency(invoice.outstandingAmount)}</Typography.Text>
                      </Descriptions.Item>
                    </Descriptions>

                    {isCustomer && hasPendingReview ? (
                      <Alert type="warning" showIcon message="Hóa đơn đang có yêu cầu chờ duyệt nên chưa thể gửi yêu cầu mới." />
                    ) : null}

                    {!invoiceAllowsPaymentConfirmation ? (
                      <Alert
                        type="info"
                        showIcon
                        message="Hóa đơn này hiện không đủ điều kiện để gửi xác nhận thanh toán."
                        description="Chỉ cho phép tạo yêu cầu khi hóa đơn đã phát hành hoặc đã thanh toán một phần và số tiền còn phải thu lớn hơn 0."
                      />
                    ) : (
                      <>
                        {paymentInstructionError ? (
                          <Alert type="error" showIcon message="Không thể tải hướng dẫn chuyển khoản." description={paymentInstructionError} />
                        ) : null}

                        <Row gutter={[16, 16]}>
                          <Col xs={24} lg={14}>
                            <Card size="small" title="Hướng dẫn chuyển khoản" loading={paymentInstructionLoading && !paymentInstruction}>
                              <Descriptions column={1} size="small" colon={false}>
                                <Descriptions.Item label="Tên ngân hàng">{paymentInstruction?.bankName || "Chưa cập nhật"}</Descriptions.Item>
                                <Descriptions.Item label="Tên tài khoản">{paymentInstruction?.bankAccountName || "Chưa cập nhật"}</Descriptions.Item>
                                <Descriptions.Item label="Số tài khoản">{paymentInstruction?.bankAccountNo || "Chưa cập nhật"}</Descriptions.Item>
                                <Descriptions.Item label="Nội dung chuyển khoản">
                                  <Space wrap>
                                    <Typography.Text code>{paymentInstruction?.transferContent || "Chưa cập nhật"}</Typography.Text>
                                    {paymentInstruction?.transferContent ? (
                                      <Button icon={<CopyOutlined />} onClick={() => void handleCopyTransferContent()}>
                                        Sao chép
                                      </Button>
                                    ) : null}
                                  </Space>
                                </Descriptions.Item>
                              </Descriptions>
                            </Card>
                          </Col>
                          <Col xs={24} lg={10}>
                            <Card size="small" title="Mã QR" loading={paymentInstructionLoading && !paymentInstruction}>
                              <Space direction="vertical" align="center" style={{ width: "100%" }}>
                                {paymentInstruction?.qrImageUrl ? (
                                  <Image src={paymentInstruction.qrImageUrl} alt="QR thanh toán" width={220} />
                                ) : paymentInstruction?.qrContent ? (
                                  <QRCode value={paymentInstruction.qrContent} size={220} />
                                ) : (
                                  <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có dữ liệu QR để hiển thị." />
                                )}
                              </Space>
                            </Card>
                          </Col>
                        </Row>
                      </>
                    )}

                    <Card size="small" title="Lịch sử yêu cầu xác nhận thanh toán">
                      <Space direction="vertical" size={12} style={{ width: "100%" }}>
                        {requestError ? <Alert type="error" showIcon message="Không thể tải lịch sử yêu cầu." description={requestError} /> : null}
                        <Table<PaymentConfirmationRequestModel>
                          rowKey="id"
                          columns={requestColumns}
                          dataSource={requestItems}
                          loading={{ spinning: requestLoading, tip: "Đang tải lịch sử yêu cầu..." }}
                          pagination={false}
                          scroll={{ x: 1100 }}
                          locale={{
                            emptyText: (
                              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có yêu cầu xác nhận thanh toán cho hóa đơn này." />
                            ),
                          }}
                        />
                      </Space>
                    </Card>
                  </Space>
                </Card>

                <Card title="Danh sách mặt hàng">
                  <Table rowKey={(row, index) => `${row.id ?? row.productId ?? index}`} columns={itemColumns} dataSource={invoice.items} pagination={false} />
                </Card>

                <Card title="Lịch sử thanh toán">
                  <Table
                    rowKey={(row, index) => `${row.paymentId ?? row.receiptNumber ?? index}`}
                    columns={paymentColumns}
                    dataSource={invoice.paymentHistory}
                    pagination={false}
                    locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có thanh toán cho hóa đơn này." /> }}
                  />
                </Card>
              </>
            ) : null}
          </Space>
        }
      />

      <Modal
        title="Xác nhận hủy hóa đơn"
        open={cancelModalOpen}
        onCancel={() => (canceling ? undefined : setCancelModalOpen(false))}
        onOk={() => void handleCancelInvoice()}
        okText="Xác nhận hủy"
        cancelText="Đóng"
        okButtonProps={{ danger: true, loading: canceling, icon: <ExclamationCircleOutlined />, disabled: !canCancelByBusiness }}
      >
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          {canCancelByBusiness ? <Alert type="warning" showIcon message="Thao tác hủy hóa đơn không thể hoàn tác." /> : <Alert type="error" showIcon message="Hóa đơn đã có thanh toán nên không thể hủy." />}
          <Input.TextArea rows={4} maxLength={1000} showCount value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} placeholder="Nhập lý do hủy hóa đơn." />
        </Space>
      </Modal>

      <Modal
        title="Gửi xác nhận thanh toán chuyển khoản"
        open={createRequestModalOpen}
        onCancel={() => (createRequestSubmitting ? undefined : setCreateRequestModalOpen(false))}
        onOk={() => void handleCreateRequest()}
        okText="Gửi xác nhận"
        cancelText="Đóng"
        okButtonProps={{ type: "primary", loading: createRequestSubmitting, disabled: hasPendingReview || !invoiceAllowsPaymentConfirmation }}
        width={720}
      >
        <Form<CreateRequestFormValues> form={createRequestForm} layout="vertical">
          <Row gutter={[16, 0]}>
            <Col xs={24} md={12}>
              <Form.Item
                name="requestedAmount"
                label="Số tiền yêu cầu"
                rules={[
                  { required: true, message: "Vui lòng nhập số tiền yêu cầu." },
                  {
                    validator: (_, value) => {
                      const amount = Number(value ?? 0);
                      if (amount <= 0) {
                        return Promise.reject(new Error("Số tiền yêu cầu phải lớn hơn 0."));
                      }

                      if (!hasMaxTwoDecimals(amount)) {
                        return Promise.reject(new Error("Số tiền yêu cầu chỉ được tối đa 2 chữ số thập phân."));
                      }

                      if (invoice && amount > invoice.outstandingAmount) {
                        return Promise.reject(new Error("Số tiền yêu cầu không được vượt số tiền còn phải thu."));
                      }

                      return Promise.resolve();
                    },
                  },
                ]}
              >
                <InputNumber className="w-full" min={0.01} precision={2} step={0.01} addonAfter="VND" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="transferTime"
                label="Thời gian chuyển khoản"
                rules={[{ required: true, message: "Vui lòng chọn thời điểm chuyển khoản." }]}
              >
                <DatePicker className="w-full" format="DD/MM/YYYY HH:mm" showTime={{ format: "HH:mm" }} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="senderBankName"
                label="Tên ngân hàng người gửi"
                rules={[
                  { required: true, message: "Vui lòng nhập tên ngân hàng gửi." },
                  { max: 255, message: "Tên ngân hàng gửi tối đa 255 ký tự." },
                ]}
              >
                <Input maxLength={255} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="senderAccountName"
                label="Tên tài khoản người gửi"
                rules={[
                  { required: true, message: "Vui lòng nhập tên tài khoản gửi." },
                  { max: 255, message: "Tên tài khoản gửi tối đa 255 ký tự." },
                ]}
              >
                <Input maxLength={255} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="senderAccountNo"
                label="Số tài khoản người gửi"
                rules={[
                  { required: true, message: "Vui lòng nhập số tài khoản gửi." },
                  { max: 100, message: "Số tài khoản gửi tối đa 100 ký tự." },
                ]}
              >
                <Input maxLength={100} />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                name="referenceCode"
                label="Mã tham chiếu"
                rules={[
                  { required: true, message: "Vui lòng nhập mã tham chiếu." },
                  { max: 100, message: "Mã tham chiếu tối đa 100 ký tự." },
                ]}
              >
                <Input maxLength={100} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item
                name="proofDocumentUrl"
                label="Đường dẫn chứng từ"
                rules={[
                  { type: "url", message: "Đường dẫn minh chứng không đúng định dạng." },
                  { max: 1000, message: "Đường dẫn chứng từ tối đa 1000 ký tự." },
                ]}
              >
                <Input maxLength={1000} />
              </Form.Item>
            </Col>
            <Col xs={24}>
              <Form.Item name="note" label="Ghi chú" rules={[{ max: 1000, message: "Ghi chú tối đa 1000 ký tự." }]}>
                <Input.TextArea rows={4} maxLength={1000} showCount />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

export default InvoiceDetailPage;
