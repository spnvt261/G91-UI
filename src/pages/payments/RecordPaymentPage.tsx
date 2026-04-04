import { Alert, Button, Card, Col, DatePicker, Empty, Form, Input, InputNumber, Row, Select, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { OpenInvoiceModel, PaymentCreateRequest } from "../../models/payment/payment.model";
import { customerService } from "../../services/customer/customer.service";
import { invoiceService } from "../../services/invoice/invoice.service";
import { paymentService } from "../../services/payment/payment.service";
import { getErrorMessage, toCurrency } from "../shared/page.utils";
import { PAYMENT_METHOD_OPTIONS } from "./payment.ui";

type RecordPaymentFormValues = {
  customerId: string;
  paymentDate: dayjs.Dayjs;
  amount: number;
  paymentMethod: "CASH" | "BANK_TRANSFER" | "OTHER";
  referenceNo?: string;
  note?: string;
  allocations: Record<string, number>;
};

const CASH_LIMIT = 50_000_000;

const RecordPaymentPage = () => {
  const navigate = useNavigate();
  const { id: preselectedInvoiceId } = useParams();
  const { notify } = useNotify();
  const [form] = Form.useForm<RecordPaymentFormValues>();

  const [loadingCustomers, setLoadingCustomers] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customerOptions, setCustomerOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [openInvoices, setOpenInvoices] = useState<OpenInvoiceModel[]>([]);
  const [prefilledInvoiceId, setPrefilledInvoiceId] = useState<string | null>(null);

  const selectedCustomerId = Form.useWatch("customerId", form);
  const selectedMethod = Form.useWatch("paymentMethod", form);
  const paymentAmount = Number(Form.useWatch("amount", form) ?? 0);
  const allocations = Form.useWatch("allocations", form) ?? {};

  const totalAllocated = useMemo(() => Object.values(allocations).reduce((sum, value) => sum + Number(value || 0), 0), [allocations]);
  const unallocatedBalance = paymentAmount - totalAllocated;

  const loadCustomers = useCallback(async () => {
    try {
      setLoadingCustomers(true);
      const response = await customerService.getList({ page: 1, pageSize: 200, status: "ACTIVE", sortBy: "companyName", sortDir: "asc" });
      setCustomerOptions(
        response.items.map((customer) => ({
          value: customer.id,
          label: `${customer.companyName} (${customer.customerCode || customer.id})`,
        })),
      );
    } catch (error) {
      notify(getErrorMessage(error, "Không thể tải danh sách khách hàng."), "error");
    } finally {
      setLoadingCustomers(false);
    }
  }, [notify]);

  const loadOpenInvoices = useCallback(
    async (customerId: string) => {
      try {
        setLoadingInvoices(true);
        const invoices = await paymentService.getOpenInvoices(customerId);
        setOpenInvoices(invoices);

        const nextAllocations: Record<string, number> = {};
        invoices.forEach((invoice) => {
          nextAllocations[invoice.invoiceId] = 0;
        });

        if (prefilledInvoiceId) {
          const matched = invoices.find((invoice) => invoice.invoiceId === prefilledInvoiceId);
          if (matched) {
            nextAllocations[matched.invoiceId] = matched.remainingAmount;
            form.setFieldValue("amount", matched.remainingAmount);
          }
        }

        form.setFieldValue("allocations", nextAllocations);
      } catch (error) {
        setOpenInvoices([]);
        notify(getErrorMessage(error, "Không thể tải danh sách hóa đơn chưa thanh toán."), "error");
      } finally {
        setLoadingInvoices(false);
      }
    },
    [form, notify, prefilledInvoiceId],
  );

  useEffect(() => {
    form.setFieldsValue({
      paymentDate: dayjs(),
      paymentMethod: "BANK_TRANSFER",
      allocations: {},
    });
    void loadCustomers();
  }, [form, loadCustomers]);

  useEffect(() => {
    const preloadByInvoice = async () => {
      if (!preselectedInvoiceId) {
        return;
      }

      try {
        const invoice = await invoiceService.getDetail(preselectedInvoiceId);
        const customerId = invoice.customerId;
        if (!customerId) {
          return;
        }

        setPrefilledInvoiceId(invoice.id);
        form.setFieldValue("customerId", customerId);
        form.setFieldValue("amount", invoice.outstandingAmount);
      } catch (error) {
        notify(getErrorMessage(error, "Không thể nạp dữ liệu hóa đơn để ghi nhận thanh toán."), "warning");
      }
    };

    void preloadByInvoice();
  }, [form, notify, preselectedInvoiceId]);

  useEffect(() => {
    if (!selectedCustomerId) {
      setOpenInvoices([]);
      form.setFieldValue("allocations", {});
      return;
    }

    void loadOpenInvoices(selectedCustomerId);
  }, [form, loadOpenInvoices, selectedCustomerId]);

  const invoiceColumns = useMemo<ColumnsType<OpenInvoiceModel>>(
    () => [
      {
        title: "Số hóa đơn",
        key: "invoice",
        render: (_, row) => (
          <Space direction="vertical" size={1}>
            <Typography.Text strong>{row.invoiceNumber || row.invoiceId}</Typography.Text>
            <Typography.Text type="secondary">Mã: {row.invoiceId}</Typography.Text>
          </Space>
        ),
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
        title: "Số tiền phân bổ",
        key: "allocate",
        width: 200,
        render: (_, row) => (
          <Form.Item
            className="!mb-0"
            name={["allocations", row.invoiceId]}
            rules={[
              {
                validator: (_, value) => {
                  const amount = Number(value ?? 0);
                  if (amount < 0) {
                    return Promise.reject(new Error("Số tiền phân bổ không được âm."));
                  }

                  if (amount > row.remainingAmount) {
                    return Promise.reject(new Error("Số tiền phân bổ vượt quá số còn lại của hóa đơn."));
                  }

                  return Promise.resolve();
                },
              },
            ]}
          >
            <InputNumber min={0} max={row.remainingAmount} className="w-full" step={1000} addonAfter="VNĐ" placeholder="0" />
          </Form.Item>
        ),
      },
    ],
    [],
  );

  const handleSubmit = async (values: RecordPaymentFormValues) => {
    const allocationEntries = Object.entries(values.allocations ?? {})
      .map(([invoiceId, allocatedAmount]) => ({
        invoiceId,
        allocatedAmount: Number(allocatedAmount ?? 0),
      }))
      .filter((item) => item.allocatedAmount > 0);

    if (allocationEntries.length === 0) {
      notify("Vui lòng phân bổ tiền cho ít nhất một hóa đơn.", "warning");
      return;
    }

    if (Math.abs(values.amount - totalAllocated) > 1) {
      notify("Tổng số tiền đã phân bổ phải bằng số tiền thanh toán.", "warning");
      return;
    }

    if (values.paymentMethod === "CASH" && values.amount > CASH_LIMIT) {
      notify("Thanh toán tiền mặt vượt 50.000.000 VNĐ, vui lòng chọn phương thức khác.", "error");
      return;
    }

    if (values.paymentMethod === "BANK_TRANSFER" && !values.referenceNo?.trim()) {
      notify("Vui lòng nhập số tham chiếu cho thanh toán chuyển khoản.", "warning");
      return;
    }

    const payload: PaymentCreateRequest = {
      customerId: values.customerId,
      paymentDate: values.paymentDate.format("YYYY-MM-DD"),
      amount: Number(values.amount),
      paymentMethod: values.paymentMethod,
      referenceNo: values.referenceNo?.trim() || undefined,
      note: values.note?.trim() || undefined,
      allocations: allocationEntries,
    };

    try {
      setSubmitting(true);
      const created = await paymentService.create(payload);
      notify("Ghi nhận thanh toán thành công.", "success");
      navigate(ROUTE_URL.PAYMENT_DETAIL.replace(":id", created.id));
    } catch (error) {
      notify(getErrorMessage(error, "Không thể ghi nhận thanh toán."), "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Ghi nhận thanh toán"
          subtitle="Chọn khách hàng, phân bổ vào hóa đơn chưa thanh toán và lưu phiếu thu theo đúng quy tắc nghiệp vụ."
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Thanh toán", url: ROUTE_URL.PAYMENT_LIST },
                { label: "Ghi nhận thanh toán" },
              ]}
            />
          }
          actions={<Button onClick={() => navigate(ROUTE_URL.PAYMENT_LIST)}>Quay lại</Button>}
        />
      }
      body={
        <Form<RecordPaymentFormValues>
          form={form}
          layout="vertical"
          onFinish={(values) => void handleSubmit(values)}
          initialValues={{ paymentMethod: "BANK_TRANSFER", paymentDate: dayjs() }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} xl={16}>
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Card title="Thông tin thanh toán">
                  <Row gutter={[16, 8]}>
                    <Col xs={24} md={12}>
                      <Form.Item
                        label="Khách hàng"
                        name="customerId"
                        rules={[{ required: true, message: "Vui lòng chọn khách hàng." }]}
                      >
                        <Select
                          showSearch
                          placeholder="Chọn khách hàng để tải hóa đơn mở"
                          options={customerOptions}
                          loading={loadingCustomers}
                          optionFilterProp="label"
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={6}>
                      <Form.Item
                        label="Ngày thanh toán"
                        name="paymentDate"
                        rules={[{ required: true, message: "Vui lòng chọn ngày thanh toán." }]}
                      >
                        <DatePicker className="w-full" format="DD/MM/YYYY" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={6}>
                      <Form.Item
                        label="Số tiền thanh toán"
                        name="amount"
                        rules={[
                          { required: true, message: "Vui lòng nhập số tiền thanh toán." },
                          {
                            validator: (_, value) => (Number(value ?? 0) > 0 ? Promise.resolve() : Promise.reject(new Error("Số tiền phải lớn hơn 0."))),
                          },
                        ]}
                      >
                        <InputNumber min={1} className="w-full" step={1000} addonAfter="VNĐ" placeholder="0" />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={8}>
                      <Form.Item
                        label="Phương thức thanh toán"
                        name="paymentMethod"
                        rules={[{ required: true, message: "Vui lòng chọn phương thức thanh toán." }]}
                      >
                        <Select options={PAYMENT_METHOD_OPTIONS} />
                      </Form.Item>
                    </Col>
                    <Col xs={24} md={16}>
                      <Form.Item
                        label={selectedMethod === "BANK_TRANSFER" ? "Số tham chiếu chuyển khoản" : "Số tham chiếu"}
                        name="referenceNo"
                        rules={
                          selectedMethod === "BANK_TRANSFER"
                            ? [{ required: true, message: "Vui lòng nhập số tham chiếu cho chuyển khoản." }]
                            : undefined
                        }
                      >
                        <Input
                          placeholder={
                            selectedMethod === "BANK_TRANSFER"
                              ? "Nhập mã giao dịch ngân hàng, bắt buộc"
                              : "Nhập số tham chiếu nếu có"
                          }
                        />
                      </Form.Item>
                    </Col>
                    <Col xs={24}>
                      <Form.Item label="Ghi chú" name="note" rules={[{ max: 1000, message: "Ghi chú tối đa 1000 ký tự." }]}>
                        <Input.TextArea rows={3} maxLength={1000} showCount placeholder="Nhập ghi chú nội bộ cho khoản thanh toán." />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>

                {selectedMethod === "CASH" && paymentAmount > CASH_LIMIT ? (
                  <Alert
                    type="error"
                    showIcon
                    message="Khoản thanh toán tiền mặt vượt mức 50.000.000 VNĐ."
                    description="Theo quy tắc nghiệp vụ mới, vui lòng chuyển sang phương thức chuyển khoản ngân hàng hoặc điều chỉnh số tiền."
                  />
                ) : null}

                <Card title="Phân bổ thanh toán vào hóa đơn mở">
                  <Table<OpenInvoiceModel>
                    rowKey="invoiceId"
                    columns={invoiceColumns}
                    dataSource={openInvoices}
                    loading={{ spinning: loadingInvoices, tip: "Đang tải hóa đơn chưa thanh toán..." }}
                    pagination={false}
                    scroll={{ x: 1200 }}
                    locale={{
                      emptyText: (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description={selectedCustomerId ? "Khách hàng này không có hóa đơn mở." : "Vui lòng chọn khách hàng để tải hóa đơn mở."}
                        />
                      ),
                    }}
                  />
                </Card>
              </Space>
            </Col>

            <Col xs={24} xl={8}>
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Card title="Tổng hợp phân bổ">
                  <Space direction="vertical" size={10} style={{ width: "100%" }}>
                    <Space style={{ width: "100%", justifyContent: "space-between" }}>
                      <Typography.Text>Tổng tiền thanh toán</Typography.Text>
                      <Typography.Text strong>{toCurrency(paymentAmount)}</Typography.Text>
                    </Space>
                    <Space style={{ width: "100%", justifyContent: "space-between" }}>
                      <Typography.Text>Tổng tiền đã phân bổ</Typography.Text>
                      <Typography.Text strong>{toCurrency(totalAllocated)}</Typography.Text>
                    </Space>
                    <Space style={{ width: "100%", justifyContent: "space-between" }}>
                      <Typography.Text>Số dư chưa phân bổ</Typography.Text>
                      <Typography.Text strong style={{ color: unallocatedBalance === 0 ? "#16a34a" : "#d4380d" }}>
                        {toCurrency(unallocatedBalance)}
                      </Typography.Text>
                    </Space>
                  </Space>
                  {unallocatedBalance !== 0 ? (
                    <Alert
                      style={{ marginTop: 12 }}
                      type="warning"
                      showIcon
                      message="Số dư chưa phân bổ chưa bằng 0."
                      description="Vui lòng điều chỉnh số tiền phân bổ để tổng phân bổ khớp với số tiền thanh toán."
                    />
                  ) : null}
                </Card>

                <Card title="Xác nhận ghi nhận">
                  <Space direction="vertical" size={12} style={{ width: "100%" }}>
                    <Typography.Text type="secondary">
                      Sau khi xác nhận, hệ thống sẽ tạo phiếu thu và cập nhật công nợ theo phân bổ đã nhập.
                    </Typography.Text>
                    <Button type="primary" block htmlType="submit" loading={submitting}>
                      Xác nhận ghi nhận thanh toán
                    </Button>
                    <Button block onClick={() => navigate(ROUTE_URL.PAYMENT_LIST)} disabled={submitting}>
                      Hủy
                    </Button>
                  </Space>
                </Card>

                {openInvoices.length > 0 ? (
                  <Card title="Gợi ý nghiệp vụ">
                    <Typography.Text type="secondary">
                      Ưu tiên phân bổ vào hóa đơn quá hạn trước để giảm rủi ro nợ xấu và bám đúng luồng FIFO.
                    </Typography.Text>
                    <Typography.Paragraph className="!mb-0 !mt-2">
                      Hóa đơn quá hạn:{" "}
                      <Typography.Text strong>
                        {openInvoices.filter((invoice) => (invoice.overdueDays ?? 0) > 0).length}
                      </Typography.Text>
                    </Typography.Paragraph>
                  </Card>
                ) : null}
              </Space>
            </Col>
          </Row>
        </Form>
      }
    />
  );
};

export default RecordPaymentPage;
