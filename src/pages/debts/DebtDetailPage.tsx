import {
  Alert,
  Button,
  Card,
  Checkbox,
  Col,
  Descriptions,
  Empty,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { canPerformAction } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { DebtHistoryItemModel, DebtReminderModel, DebtSettlementModel, DebtStatusDetailModel } from "../../models/debt/debt.model";
import type { OpenInvoiceModel, PaymentModel } from "../../models/payment/payment.model";
import { debtService } from "../../services/debt/debt.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage, toCurrency } from "../shared/page.utils";
import DebtStatusTag from "./components/DebtStatusTag";
import { formatDebtDate, formatDebtDateTime, getReminderTypeLabel } from "./debt.ui";

type ReminderFormValues = {
  reminderType: "GENTLE" | "FIRM" | "FINAL";
  channel: "EMAIL";
  invoiceIds: string[];
  message?: string;
  note?: string;
};

type SettlementFormValues = {
  note?: string;
  generateCertificate?: boolean;
};

const DebtDetailPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { customerId } = useParams();
  const role = getStoredUserRole();
  const { notify } = useNotify();

  const canSendReminder = canPerformAction(role, "payment.reminder.send");
  const canConfirmSettlement = canPerformAction(role, "debt.settlement.confirm");

  const [detail, setDetail] = useState<DebtStatusDetailModel | null>(null);
  const [history, setHistory] = useState<DebtHistoryItemModel[]>([]);
  const [reminders, setReminders] = useState<DebtReminderModel[]>([]);
  const [settlements, setSettlements] = useState<DebtSettlementModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>((location.state as { tab?: string } | null)?.tab ?? "overview");

  const [reminderModalOpen, setReminderModalOpen] = useState(false);
  const [reminderSubmitting, setReminderSubmitting] = useState(false);
  const [settlementModalOpen, setSettlementModalOpen] = useState(false);
  const [settlementSubmitting, setSettlementSubmitting] = useState(false);
  const [reminderForm] = Form.useForm<ReminderFormValues>();
  const [settlementForm] = Form.useForm<SettlementFormValues>();

  const loadData = useCallback(async () => {
    if (!customerId) {
      return;
    }

    try {
      setLoading(true);
      setDetailError(null);

      const [detailResponse, historyResponse, remindersResponse, settlementsResponse] = await Promise.all([
        debtService.getDetail(customerId),
        debtService.getHistory(customerId).catch(() => []),
        debtService.getReminders({ customerId, page: 1, pageSize: 100 }).then((response) => response.items).catch(() => []),
        debtService.getSettlements(customerId).catch(() => []),
      ]);

      setDetail(detailResponse);
      setHistory(historyResponse);
      setReminders(remindersResponse);
      setSettlements(settlementsResponse);
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải chi tiết công nợ.");
      setDetailError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [customerId, notify]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const openInvoices = detail?.openInvoices ?? [];
  const paymentHistory = detail?.paymentHistory ?? [];
  const overdueInvoices = useMemo(() => openInvoices.filter((invoice) => (invoice.overdueDays ?? 0) > 0 && invoice.remainingAmount > 0), [openInvoices]);
  const remainingAmount = detail?.summary.outstandingAmount ?? 0;
  const canSettleByBusiness = remainingAmount <= 0;
  const showSettlementAction = canConfirmSettlement && Boolean(detail) && canSettleByBusiness;

  const openInvoiceColumns = useMemo<ColumnsType<OpenInvoiceModel>>(
    () => [
      {
        title: "Số hóa đơn",
        key: "invoiceNumber",
        render: (_, row) => row.invoiceNumber || row.invoiceId,
      },
      {
        title: "Tổng tiền",
        dataIndex: "totalAmount",
        key: "totalAmount",
        align: "right",
        render: (value: number) => toCurrency(value),
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
        dataIndex: "remainingAmount",
        key: "remainingAmount",
        align: "right",
        render: (value: number) => <Typography.Text style={{ color: value > 0 ? "#d4380d" : undefined }}>{toCurrency(value)}</Typography.Text>,
      },
      {
        title: "Số ngày quá hạn",
        dataIndex: "overdueDays",
        key: "overdueDays",
        align: "right",
        render: (value?: number) => (value && value > 0 ? `${value} ngày` : "Không quá hạn"),
      },
      {
        title: "Hạn thanh toán",
        dataIndex: "dueDate",
        key: "dueDate",
        render: (value?: string) => formatDebtDate(value),
      },
    ],
    [],
  );

  const paymentColumns = useMemo<ColumnsType<PaymentModel>>(
    () => [
      {
        title: "Số phiếu thu",
        key: "receiptNumber",
        render: (_, row) => row.receiptNumber || row.id,
      },
      {
        title: "Ngày thanh toán",
        dataIndex: "paymentDate",
        key: "paymentDate",
        render: (value?: string) => formatDebtDate(value),
      },
      {
        title: "Phương thức",
        dataIndex: "paymentMethod",
        key: "paymentMethod",
        render: (value?: string) => value || "Chưa cập nhật",
      },
      {
        title: "Số tiền",
        dataIndex: "amount",
        key: "amount",
        align: "right",
        render: (value: number) => toCurrency(value),
      },
      {
        title: "Phân bổ",
        key: "allocations",
        render: (_, row) => (
          <Space direction="vertical" size={2}>
            {row.allocations.length > 0 ? (
              row.allocations.map((allocation) => (
                <Typography.Text key={`${row.id}-${allocation.invoiceId}`} type="secondary">
                  {allocation.invoiceNumber || allocation.invoiceId}: {toCurrency(allocation.allocatedAmount)}
                </Typography.Text>
              ))
            ) : (
              <Typography.Text type="secondary">Chưa có phân bổ</Typography.Text>
            )}
          </Space>
        ),
      },
    ],
    [],
  );

  const historyColumns = useMemo<ColumnsType<DebtHistoryItemModel>>(
    () => [
      {
        title: "Thời điểm",
        dataIndex: "eventDate",
        key: "eventDate",
        width: 180,
        render: (value?: string) => formatDebtDateTime(value),
      },
      {
        title: "Loại sự kiện",
        dataIndex: "eventType",
        key: "eventType",
        width: 180,
        render: (value?: string) => value || "Chưa cập nhật",
      },
      {
        title: "Mã tham chiếu",
        dataIndex: "referenceNo",
        key: "referenceNo",
        width: 180,
        render: (value?: string) => value || "-",
      },
      {
        title: "Mô tả",
        dataIndex: "description",
        key: "description",
        render: (value?: string) => value || "Không có mô tả",
      },
      {
        title: "Giá trị",
        dataIndex: "amount",
        key: "amount",
        align: "right",
        render: (value?: number) => (value != null ? toCurrency(value) : "-"),
      },
    ],
    [],
  );

  const reminderColumns = useMemo<ColumnsType<DebtReminderModel>>(
    () => [
      {
        title: "Thời điểm gửi",
        dataIndex: "sentAt",
        key: "sentAt",
        width: 180,
        render: (value?: string) => formatDebtDateTime(value),
      },
      {
        title: "Loại nhắc nợ",
        dataIndex: "reminderType",
        key: "reminderType",
        width: 160,
        render: (value?: string) => getReminderTypeLabel(value),
      },
      {
        title: "Kênh",
        dataIndex: "channel",
        key: "channel",
        width: 120,
        render: () => "Email",
      },
      {
        title: "Hóa đơn",
        key: "invoice",
        width: 180,
        render: (_, row) => row.invoiceNumber || row.invoiceId || "-",
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 140,
        render: (value?: string) => value || "Chưa cập nhật",
      },
      {
        title: "Nội dung",
        key: "message",
        render: (_, row) => (
          <Space direction="vertical" size={0}>
            <Typography.Text>{row.message || "Không có nội dung tùy chỉnh"}</Typography.Text>
            {row.note ? <Typography.Text type="secondary">Ghi chú: {row.note}</Typography.Text> : null}
          </Space>
        ),
      },
    ],
    [],
  );

  const settlementColumns = useMemo<ColumnsType<DebtSettlementModel>>(
    () => [
      {
        title: "Thời điểm xác nhận",
        dataIndex: "settledAt",
        key: "settledAt",
        width: 180,
        render: (value?: string) => formatDebtDateTime(value),
      },
      {
        title: "Người xác nhận",
        dataIndex: "confirmedBy",
        key: "confirmedBy",
        width: 180,
        render: (value?: string) => value || "Chưa cập nhật",
      },
      {
        title: "Ghi chú",
        dataIndex: "note",
        key: "note",
        render: (value?: string) => value || "Không có ghi chú",
      },
      {
        title: "Chứng nhận",
        dataIndex: "certificateUrl",
        key: "certificateUrl",
        render: (value?: string) =>
          value ? (
            <Typography.Link href={value} target="_blank">
              Xem chứng nhận
            </Typography.Link>
          ) : (
            "Không có"
          ),
      },
    ],
    [],
  );

  const handleSendReminder = async (values: ReminderFormValues) => {
    if (!customerId) {
      return;
    }

    try {
      setReminderSubmitting(true);
      await debtService.sendReminder({
        customerId,
        reminderType: values.reminderType,
        channel: "EMAIL",
        invoiceIds: values.invoiceIds,
        message: values.message?.trim() || undefined,
        note: values.note?.trim() || undefined,
      });
      notify("Gửi nhắc nợ thành công.", "success");
      setReminderModalOpen(false);
      reminderForm.resetFields();
      await loadData();
    } catch (error) {
      notify(getErrorMessage(error, "Không thể gửi nhắc nợ."), "error");
    } finally {
      setReminderSubmitting(false);
    }
  };

  const handleConfirmSettlement = async (values: SettlementFormValues) => {
    if (!customerId) {
      return;
    }

    if (!canSettleByBusiness) {
      notify("Không thể xác nhận quyết toán khi vẫn còn dư nợ.", "warning");
      return;
    }

    try {
      setSettlementSubmitting(true);
      await debtService.confirmSettlement(customerId, {
        note: values.note?.trim() || undefined,
        generateCertificate: Boolean(values.generateCertificate),
      });
      notify("Xác nhận quyết toán thành công.", "success");
      setSettlementModalOpen(false);
      settlementForm.resetFields();
      await loadData();
    } catch (error) {
      notify(getErrorMessage(error, "Không thể xác nhận quyết toán."), "error");
    } finally {
      setSettlementSubmitting(false);
    }
  };

  const agingData = detail?.aging ?? [];

  return (
    <>
      <NoResizeScreenTemplate
        bodyClassName="px-0 pb-0 pt-4"
        header={
          <ListScreenHeaderTemplate
            title="Chi tiết công nợ khách hàng"
            subtitle="Theo dõi tổng quan công nợ, tuổi nợ, lịch sử nhắc nợ và quyết toán trên cùng một màn hình."
            breadcrumb={
              <CustomBreadcrumb
                breadcrumbs={[
                  { label: "Trang chủ" },
                  { label: "Công nợ", url: ROUTE_URL.DEBT_LIST },
                  { label: "Chi tiết" },
                ]}
              />
            }
            actions={
              <Space wrap>
                <Button onClick={() => navigate(ROUTE_URL.DEBT_LIST)}>Quay lại danh sách</Button>
                {canSendReminder ? (
                  <Button
                    onClick={() => {
                      reminderForm.setFieldsValue({
                        reminderType: "GENTLE",
                        channel: "EMAIL",
                        invoiceIds: overdueInvoices.map((invoice) => invoice.invoiceId),
                      });
                      setReminderModalOpen(true);
                    }}
                    disabled={overdueInvoices.length === 0}
                  >
                    Gửi nhắc nợ
                  </Button>
                ) : null}
                {showSettlementAction ? (
                  <Button
                    type="primary"
                    onClick={() => {
                      settlementForm.setFieldsValue({ generateCertificate: false });
                      setSettlementModalOpen(true);
                    }}
                  >
                    Xác nhận quyết toán
                  </Button>
                ) : null}
              </Space>
            }
          />
        }
        body={
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            {!customerId ? <Alert type="warning" showIcon message="Không tìm thấy mã khách hàng trên đường dẫn." /> : null}
            {detailError ? <Alert type="error" showIcon message="Không thể tải chi tiết công nợ." description={detailError} /> : null}

            {detail ? (
              <>
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={8}>
                    <Card>
                      <Statistic title="Tổng dư nợ" value={detail.summary.outstandingAmount} formatter={(value) => toCurrency(Number(value))} />
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card>
                      <Statistic title="Nợ quá hạn" value={detail.summary.overdueAmount} formatter={(value) => toCurrency(Number(value))} />
                    </Card>
                  </Col>
                  <Col xs={24} md={8}>
                    <Card>
                      <Space direction="vertical" size={6}>
                        <Typography.Text type="secondary">Trạng thái công nợ</Typography.Text>
                        <DebtStatusTag status={detail.summary.status} />
                        <Typography.Text type="secondary">Thanh toán gần nhất: {formatDebtDate(detail.summary.lastPaymentDate)}</Typography.Text>
                      </Space>
                    </Card>
                  </Col>
                </Row>

                <Card title="Tổng quan công nợ">
                  <Descriptions column={{ xs: 1, md: 2, lg: 3 }} size="small" colon={false}>
                    <Descriptions.Item label="Mã khách hàng">{detail.summary.customerCode || detail.summary.customerId || "-"}</Descriptions.Item>
                    <Descriptions.Item label="Tên khách hàng">{detail.summary.customerName || "Chưa cập nhật"}</Descriptions.Item>
                    <Descriptions.Item label="Trạng thái">
                      <DebtStatusTag status={detail.summary.status} />
                    </Descriptions.Item>
                    <Descriptions.Item label="Tổng đã xuất hóa đơn">{toCurrency(detail.summary.totalInvoicedAmount ?? 0)}</Descriptions.Item>
                    <Descriptions.Item label="Tổng đã thu">{toCurrency(detail.summary.totalPaidAmount ?? 0)}</Descriptions.Item>
                    <Descriptions.Item label="Dư nợ còn lại">{toCurrency(detail.summary.outstandingAmount)}</Descriptions.Item>
                  </Descriptions>
                </Card>

                <Tabs
                  activeKey={activeTab}
                  onChange={setActiveTab}
                  items={[
                    {
                      key: "overview",
                      label: "Hóa đơn mở",
                      children: (
                        <Card>
                          <Table
                            rowKey={(row) => row.invoiceId}
                            columns={openInvoiceColumns}
                            dataSource={openInvoices}
                            pagination={false}
                            locale={{
                              emptyText: (
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có hóa đơn mở." />
                              ),
                            }}
                          />
                        </Card>
                      ),
                    },
                    {
                      key: "aging",
                      label: "Phân tích tuổi nợ",
                      children: (
                        <Card>
                          <Row gutter={[16, 16]}>
                            {agingData.map((bucket) => (
                              <Col xs={24} md={12} lg={6} key={bucket.bucket}>
                                <Card size="small">
                                  <Space direction="vertical" size={6}>
                                    <Typography.Text type="secondary">{bucket.label || bucket.bucket}</Typography.Text>
                                    <Typography.Title level={4} style={{ margin: 0 }}>
                                      {toCurrency(bucket.amount)}
                                    </Typography.Title>
                                    <Typography.Text type="secondary">
                                      {bucket.invoiceCount != null ? `${bucket.invoiceCount} hóa đơn` : "Chưa có số lượng hóa đơn"}
                                    </Typography.Text>
                                  </Space>
                                </Card>
                              </Col>
                            ))}
                          </Row>
                        </Card>
                      ),
                    },
                    {
                      key: "payments",
                      label: "Lịch sử thanh toán",
                      children: (
                        <Card>
                          <Table
                            rowKey={(row) => row.id}
                            columns={paymentColumns}
                            dataSource={paymentHistory}
                            pagination={false}
                            locale={{
                              emptyText: (
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có lịch sử thanh toán." />
                              ),
                            }}
                          />
                        </Card>
                      ),
                    },
                    {
                      key: "history",
                      label: "Lịch sử công nợ",
                      children: (
                        <Card>
                          <Table
                            rowKey={(row, index) => `${row.id}-${index}`}
                            columns={historyColumns}
                            dataSource={history}
                            pagination={false}
                            locale={{
                              emptyText: (
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có lịch sử công nợ." />
                              ),
                            }}
                          />
                        </Card>
                      ),
                    },
                    {
                      key: "reminders",
                      label: "Lịch sử nhắc nợ",
                      children: (
                        <Card>
                          <Table
                            rowKey={(row, index) => `${row.id}-${index}`}
                            columns={reminderColumns}
                            dataSource={reminders}
                            pagination={false}
                            locale={{
                              emptyText: (
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có lịch sử nhắc nợ." />
                              ),
                            }}
                          />
                        </Card>
                      ),
                    },
                    {
                      key: "settlement",
                      label: "Lịch sử quyết toán",
                      children: (
                        <Card>
                          {!canSettleByBusiness ? (
                            <Alert
                              type="warning"
                              showIcon
                              style={{ marginBottom: 16 }}
                              message="Khách hàng chưa đủ điều kiện quyết toán."
                              description={`Hiện còn dư nợ ${toCurrency(remainingAmount)}. Vui lòng xử lý hết công nợ trước khi xác nhận quyết toán.`}
                            />
                          ) : (
                            <Alert
                              type="success"
                              showIcon
                              style={{ marginBottom: 16 }}
                              message="Khách hàng đủ điều kiện quyết toán."
                              description="Bạn có thể xác nhận quyết toán công nợ nếu không còn ràng buộc nghiệp vụ khác."
                            />
                          )}
                          <Table
                            rowKey={(row, index) => `${row.id}-${index}`}
                            columns={settlementColumns}
                            dataSource={settlements}
                            pagination={false}
                            locale={{
                              emptyText: (
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có lịch sử quyết toán." />
                              ),
                            }}
                          />
                        </Card>
                      ),
                    },
                  ]}
                />
              </>
            ) : !loading ? (
              <Card>
                <Empty description="Không có dữ liệu công nợ để hiển thị." />
              </Card>
            ) : null}
          </Space>
        }
      />

      <Modal
        title="Gửi nhắc nợ"
        open={reminderModalOpen}
        onCancel={() => (reminderSubmitting ? undefined : setReminderModalOpen(false))}
        onOk={() => reminderForm.submit()}
        okText="Gửi nhắc nợ"
        cancelText="Đóng"
        okButtonProps={{ loading: reminderSubmitting }}
      >
        <Form<ReminderFormValues> form={reminderForm} layout="vertical" onFinish={(values) => void handleSendReminder(values)}>
          <Alert
            type="info"
            showIcon
            style={{ marginBottom: 12 }}
            message="Kênh gửi nhắc nợ hiện tại: Email"
            description="Hệ thống backend hiện chỉ hỗ trợ kênh Email cho nghiệp vụ nhắc nợ."
          />
          <Form.Item
            label="Loại nhắc nợ"
            name="reminderType"
            rules={[{ required: true, message: "Vui lòng chọn loại nhắc nợ." }]}
          >
            <Select
              options={[
                { value: "GENTLE", label: "Nhắc nhẹ" },
                { value: "FIRM", label: "Nhắc mạnh" },
                { value: "FINAL", label: "Nhắc cuối" },
              ]}
            />
          </Form.Item>
          <Form.Item label="Kênh gửi" name="channel">
            <Select value="EMAIL" options={[{ value: "EMAIL", label: "Email" }]} disabled />
          </Form.Item>
          <Form.Item
            label="Chọn hóa đơn quá hạn cần nhắc"
            name="invoiceIds"
            rules={[{ required: true, message: "Vui lòng chọn ít nhất một hóa đơn quá hạn." }]}
          >
            <Checkbox.Group style={{ width: "100%" }}>
              <Space direction="vertical" style={{ width: "100%" }}>
                {overdueInvoices.length > 0 ? (
                  overdueInvoices.map((invoice) => (
                    <Checkbox key={invoice.invoiceId} value={invoice.invoiceId}>
                      <Space>
                        <Typography.Text strong>{invoice.invoiceNumber || invoice.invoiceId}</Typography.Text>
                        <Tag color="error">{toCurrency(invoice.remainingAmount)}</Tag>
                        <Typography.Text type="secondary">{invoice.overdueDays ?? 0} ngày quá hạn</Typography.Text>
                      </Space>
                    </Checkbox>
                  ))
                ) : (
                  <Typography.Text type="secondary">Không có hóa đơn quá hạn để gửi nhắc nợ.</Typography.Text>
                )}
              </Space>
            </Checkbox.Group>
          </Form.Item>
          <Form.Item label="Nội dung nhắc nợ" name="message" rules={[{ max: 1000, message: "Nội dung tối đa 1000 ký tự." }]}>
            <Input.TextArea rows={4} maxLength={1000} showCount placeholder="Nhập nội dung nhắc nợ gửi qua email." />
          </Form.Item>
          <Form.Item label="Ghi chú nội bộ" name="note" rules={[{ max: 1000, message: "Ghi chú tối đa 1000 ký tự." }]}>
            <Input.TextArea rows={3} maxLength={1000} showCount placeholder="Ghi chú thêm cho lần gửi nhắc nợ này." />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Xác nhận quyết toán công nợ"
        open={settlementModalOpen}
        onCancel={() => (settlementSubmitting ? undefined : setSettlementModalOpen(false))}
        onOk={() => settlementForm.submit()}
        okText="Xác nhận quyết toán"
        cancelText="Đóng"
        okButtonProps={{ loading: settlementSubmitting, disabled: !canSettleByBusiness }}
      >
        <Form<SettlementFormValues> form={settlementForm} layout="vertical" onFinish={(values) => void handleConfirmSettlement(values)}>
          {!canSettleByBusiness ? (
            <Alert
              type="error"
              showIcon
              style={{ marginBottom: 12 }}
              message="Không thể quyết toán do còn dư nợ."
              description={`Số dư hiện tại: ${toCurrency(remainingAmount)}. Vui lòng xử lý hết công nợ trước khi xác nhận.`}
            />
          ) : (
            <Alert
              type="success"
              showIcon
              style={{ marginBottom: 12 }}
              message="Khách hàng đủ điều kiện quyết toán."
              description="Vui lòng xác nhận ghi chú để hoàn tất nghiệp vụ quyết toán."
            />
          )}
          <Form.Item name="generateCertificate" valuePropName="checked">
            <Checkbox>Tạo chứng nhận quyết toán (nếu hệ thống hỗ trợ)</Checkbox>
          </Form.Item>
          <Form.Item label="Ghi chú quyết toán" name="note" rules={[{ max: 1000, message: "Ghi chú tối đa 1000 ký tự." }]}>
            <Input.TextArea rows={4} maxLength={1000} showCount placeholder="Nhập ghi chú xác nhận quyết toán." />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default DebtDetailPage;
