import { ArrowLeftOutlined, PlusOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Col, DatePicker, Divider, Form, Input, InputNumber, Result, Row, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { InvoiceCreateRequest, InvoiceItemRequest, InvoiceModel, InvoiceUpdateRequest } from "../../models/invoice/invoice.model";
import { invoiceService } from "../../services/invoice/invoice.service";
import { getErrorMessage, toCurrency } from "../shared/page.utils";
import InvoiceStatusTag from "./components/InvoiceStatusTag";
import { formatInvoiceDate, resolveInvoiceNumber } from "./invoice.ui";

type InvoiceFormValues = {
  contractId: string;
  issueDate?: dayjs.Dayjs;
  dueDate: dayjs.Dayjs;
  adjustmentAmount?: number;
  billingAddress?: string;
  paymentTerms?: string;
  note?: string;
  status?: "DRAFT" | "ISSUED";
  items: Array<{
    productId?: string;
    description?: string;
    unit?: string;
    quantity?: number;
    unitPrice?: number;
  }>;
};

const isSameDay = (left?: dayjs.Dayjs | null, right?: dayjs.Dayjs | null) => Boolean(left && right && left.isSame(right, "day"));

const disablePastDatePreservingSelected = (selectedDate?: dayjs.Dayjs | null) => (current: dayjs.Dayjs) =>
  current.isBefore(dayjs().startOf("day"), "day") && !isSameDay(current, selectedDate);

interface InvoiceFormPageProps {
  mode: "create" | "edit";
}

const toFormValues = (invoice: InvoiceModel): InvoiceFormValues => ({
  contractId: invoice.contractId ?? "",
  issueDate: invoice.issueDate ? dayjs(invoice.issueDate) : undefined,
  dueDate: invoice.dueDate ? dayjs(invoice.dueDate) : dayjs(),
  adjustmentAmount: invoice.adjustmentAmount,
  billingAddress: invoice.billingAddress,
  paymentTerms: invoice.paymentTerms,
  note: invoice.note,
  status: invoice.status === "DRAFT" ? "DRAFT" : "ISSUED",
  items:
    invoice.items.length > 0
      ? invoice.items.map((item) => ({
          productId: item.productId,
          description: item.description,
          unit: item.unit,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        }))
      : [{ quantity: 1, unitPrice: 0 }],
});

const toRequestItems = (items: InvoiceFormValues["items"]): InvoiceItemRequest[] =>
  items
    .filter((item) => Number(item.quantity ?? 0) > 0 && Number(item.unitPrice ?? 0) >= 0)
    .map((item) => ({
      productId: item.productId?.trim() || undefined,
      description: item.description?.trim() || undefined,
      unit: item.unit?.trim() || undefined,
      quantity: Number(item.quantity ?? 0),
      unitPrice: Number(item.unitPrice ?? 0),
    }));

const InvoiceFormPage = ({ mode }: InvoiceFormPageProps) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { notify } = useNotify();
  const [form] = Form.useForm<InvoiceFormValues>();

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"DRAFT" | "ISSUED">("ISSUED");
  const [loadError, setLoadError] = useState<string | null>(null);
  const [currentInvoice, setCurrentInvoice] = useState<InvoiceModel | null>(null);

  useEffect(() => {
    if (mode === "create") {
      form.setFieldsValue({
        dueDate: dayjs(),
        issueDate: dayjs(),
        status: "ISSUED",
        items: [{ quantity: 1, unitPrice: 0 }],
      });
      return;
    }

    if (!id) {
      return;
    }

    const loadDetail = async () => {
      try {
        setLoading(true);
        setLoadError(null);
        const detail = await invoiceService.getDetail(id);
        setCurrentInvoice(detail);
        form.setFieldsValue(toFormValues(detail));
      } catch (error) {
        const message = getErrorMessage(error, "Không thể tải chi tiết hóa đơn để cập nhật.");
        setLoadError(message);
        notify(message, "error");
      } finally {
        setLoading(false);
      }
    };

    void loadDetail();
  }, [form, id, mode, notify]);

  const watchedItems = Form.useWatch("items", form) ?? [];
  const watchedAdjustment = Form.useWatch("adjustmentAmount", form) ?? 0;
  const watchedDueDate = Form.useWatch("dueDate", form);

  const validateDueDateNotInPast = (_: unknown, value: dayjs.Dayjs | undefined) => {
    if (!value || !value.isBefore(dayjs().startOf("day"), "day")) {
      return Promise.resolve();
    }

    const originalDueDate = currentInvoice?.dueDate ? dayjs(currentInvoice.dueDate) : null;
    if (originalDueDate?.isValid() && value.isSame(originalDueDate, "day")) {
      return Promise.resolve();
    }

    return Promise.reject(new Error("Hạn thanh toán không được là ngày trong quá khứ."));
  };

  const totals = useMemo(() => {
    const subtotal = watchedItems.reduce((sum, item) => sum + Number(item?.quantity ?? 0) * Number(item?.unitPrice ?? 0), 0);
    const adjustment = Number(watchedAdjustment ?? 0);
    const vat = Math.max(0, subtotal + adjustment) * 0.1;
    const grandTotal = Math.max(0, subtotal + adjustment + vat);
    return { subtotal, adjustment, vat, grandTotal };
  }, [watchedAdjustment, watchedItems]);

  const itemColumns = useMemo<ColumnsType<InvoiceFormValues["items"][number]>>(
    () => [
      {
        title: "Mô tả mặt hàng",
        key: "description",
        render: (_, __, index) => (
          <Form.Item
            name={["items", index, "description"]}
            rules={[{ required: true, message: "Vui lòng nhập mô tả mặt hàng." }]}
            className="!mb-0"
          >
            <Input placeholder="Ví dụ: Dịch vụ triển khai hạng mục A" />
          </Form.Item>
        ),
      },
      {
        title: "Đơn vị",
        key: "unit",
        width: 120,
        render: (_, __, index) => (
          <Form.Item name={["items", index, "unit"]} className="!mb-0">
            <Input placeholder="Bộ / Hạng mục" />
          </Form.Item>
        ),
      },
      {
        title: "Số lượng",
        key: "quantity",
        width: 140,
        render: (_, __, index) => (
          <Form.Item
            name={["items", index, "quantity"]}
            className="!mb-0"
            rules={[{ required: true, message: "Nhập số lượng." }]}
          >
            <InputNumber min={1} className="w-full" placeholder="0" />
          </Form.Item>
        ),
      },
      {
        title: "Đơn giá",
        key: "unitPrice",
        width: 190,
        render: (_, __, index) => (
          <Form.Item
            name={["items", index, "unitPrice"]}
            className="!mb-0"
            rules={[{ required: true, message: "Nhập đơn giá." }]}
          >
            <InputNumber min={0} step={1000} className="w-full" addonAfter="VNĐ" placeholder="0" />
          </Form.Item>
        ),
      },
      {
        title: "Thành tiền",
        key: "lineTotal",
        width: 180,
        align: "right",
        render: (_, __, index) => {
          const quantity = Number(form.getFieldValue(["items", index, "quantity"]) ?? 0);
          const unitPrice = Number(form.getFieldValue(["items", index, "unitPrice"]) ?? 0);
          return <Typography.Text strong>{toCurrency(quantity * unitPrice)}</Typography.Text>;
        },
      },
      {
        title: "",
        key: "remove",
        width: 100,
        render: (_, __, index) => (
          <Button
            danger
            type="link"
            onClick={() => {
              const currentItems = form.getFieldValue("items") ?? [];
              if (currentItems.length <= 1) {
                notify("Hóa đơn cần tối thiểu một mặt hàng.", "warning");
                return;
              }

              const nextItems = [...currentItems];
              nextItems.splice(index, 1);
              form.setFieldValue("items", nextItems);
            }}
          >
            Xóa dòng
          </Button>
        ),
      },
    ],
    [form, notify],
  );

  const handleSubmit = async (values: InvoiceFormValues) => {
    try {
      setSubmitting(true);
      const items = toRequestItems(values.items);

      if (items.length === 0) {
        notify("Vui lòng bổ sung ít nhất một mặt hàng hợp lệ.", "warning");
        return;
      }

      if (mode === "create") {
        const payload: InvoiceCreateRequest = {
          contractId: values.contractId.trim(),
          issueDate: values.issueDate?.format("YYYY-MM-DD"),
          dueDate: values.dueDate.format("YYYY-MM-DD"),
          adjustmentAmount: Number(values.adjustmentAmount ?? 0),
          billingAddress: values.billingAddress?.trim() || undefined,
          paymentTerms: values.paymentTerms?.trim() || undefined,
          note: values.note?.trim() || undefined,
          status: submitStatus,
          items,
        };

        const created = await invoiceService.create(payload);
        notify("Tạo hóa đơn thành công.", "success");
        navigate(ROUTE_URL.INVOICE_DETAIL.replace(":id", created.id));
        return;
      }

      if (!id) {
        notify("Không tìm thấy mã hóa đơn để cập nhật.", "error");
        return;
      }

      const payload: InvoiceUpdateRequest = {
        issueDate: values.issueDate?.format("YYYY-MM-DD"),
        dueDate: values.dueDate?.format("YYYY-MM-DD"),
        adjustmentAmount: Number(values.adjustmentAmount ?? 0),
        billingAddress: values.billingAddress?.trim() || undefined,
        paymentTerms: values.paymentTerms?.trim() || undefined,
        note: values.note?.trim() || undefined,
        status: submitStatus,
        items,
      };

      const updated = await invoiceService.update(id, payload);
      notify("Cập nhật hóa đơn thành công.", "success");
      navigate(ROUTE_URL.INVOICE_DETAIL.replace(":id", updated.id));
    } catch (error) {

      notify(getErrorMessage(error, "Không thể lưu hóa đơn."), "error");
    } finally {
      setSubmitting(false);
    }
  };

  const title = mode === "create" ? "Tạo mới hóa đơn" : "Cập nhật hóa đơn";
  const subtitle =
    mode === "create"
      ? "Thiết lập thông tin hóa đơn, mặt hàng và hạn thanh toán theo đúng nghiệp vụ."
      : "Chỉnh sửa thông tin hóa đơn trước khi bị khóa bởi thanh toán.";

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title={title}
          subtitle={subtitle}
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Hóa đơn", url: ROUTE_URL.INVOICE_LIST },
                { label: mode === "create" ? "Tạo mới" : "Cập nhật" },
              ]}
            />
          }
          actions={
            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTE_URL.INVOICE_LIST)}>
              Quay lại danh sách
            </Button>
          }
        />
      }
      body={
        !id && mode === "edit" ? (
          <Result
            status="warning"
            title="Không tìm thấy mã hóa đơn"
            subTitle="Đường dẫn chưa chứa mã hóa đơn hợp lệ để cập nhật."
            extra={
              <Button type="primary" onClick={() => navigate(ROUTE_URL.INVOICE_LIST)}>
                Về danh sách hóa đơn
              </Button>
            }
          />
        ) : (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            {loadError ? <Alert type="error" showIcon message="Không thể tải dữ liệu hóa đơn." description={loadError} /> : null}

            {currentInvoice ? (
              <Card>
                <Space size={12} wrap>
                  <Typography.Text strong>{resolveInvoiceNumber(currentInvoice.id, currentInvoice.invoiceNumber)}</Typography.Text>
                  <InvoiceStatusTag status={currentInvoice.status} />
                  <Typography.Text type="secondary">Ngày xuất: {formatInvoiceDate(currentInvoice.issueDate)}</Typography.Text>
                  <Typography.Text type="secondary">Hạn thanh toán: {formatInvoiceDate(currentInvoice.dueDate)}</Typography.Text>
                </Space>
              </Card>
            ) : null}

            <Form<InvoiceFormValues> form={form} layout="vertical" onFinish={(values) => void handleSubmit(values)} disabled={loading || submitting}>
              <Row gutter={[16, 16]}>
                <Col xs={24} xl={16}>
                  <Space direction="vertical" size={16} style={{ width: "100%" }}>
                    <Card title="Thông tin chung">
                      <Row gutter={[16, 8]}>
                        <Col xs={24} md={12}>
                          <Form.Item
                            label="Mã hợp đồng"
                            name="contractId"
                            rules={[{ required: true, message: "Vui lòng nhập mã hợp đồng." }]}
                          >
                            <Input placeholder="Nhập mã hợp đồng liên kết" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                          <Form.Item label="Ngày xuất hóa đơn" name="issueDate">
                            <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Chọn ngày xuất" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={6}>
                          <Form.Item
                            label="Hạn thanh toán"
                            name="dueDate"
                            rules={[
                              { required: true, message: "Vui lòng chọn hạn thanh toán." },
                              { validator: validateDueDateNotInPast },
                            ]}
                          >
                            <DatePicker
                              className="w-full"
                              format="DD/MM/YYYY"
                              placeholder="Chọn hạn thanh toán"
                              disabledDate={disablePastDatePreservingSelected(watchedDueDate)}
                            />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item label="Điều khoản thanh toán" name="paymentTerms">
                            <Input placeholder="Ví dụ: Thanh toán trong 30 ngày" />
                          </Form.Item>
                        </Col>
                        <Col xs={24} md={12}>
                          <Form.Item label="Địa chỉ xuất hóa đơn" name="billingAddress">
                            <Input placeholder="Nhập địa chỉ xuất hóa đơn" />
                          </Form.Item>
                        </Col>
                        <Col xs={24}>
                          <Form.Item label="Ghi chú" name="note" rules={[{ max: 1000, message: "Ghi chú tối đa 1000 ký tự." }]}>
                            <Input.TextArea rows={3} placeholder="Bổ sung ghi chú nghiệp vụ nếu cần." showCount maxLength={1000} />
                          </Form.Item>
                        </Col>
                      </Row>
                    </Card>

                    <Card
                      title="Danh sách mặt hàng"
                      extra={
                        <Button
                          icon={<PlusOutlined />}
                          onClick={() => {
                            const currentItems = form.getFieldValue("items") ?? [];
                            form.setFieldValue("items", [...currentItems, { quantity: 1, unitPrice: 0 }]);
                          }}
                        >
                          Thêm dòng hàng
                        </Button>
                      }
                    >
                      <Form.Item shouldUpdate noStyle>
                        {() => (
                          <Table
                            rowKey={(_, index) => `${index}`}
                            columns={itemColumns}
                            dataSource={form.getFieldValue("items") ?? []}
                            pagination={false}
                            scroll={{ x: 980 }}
                          />
                        )}
                      </Form.Item>
                    </Card>
                  </Space>
                </Col>

                <Col xs={24} xl={8}>
                  <Space direction="vertical" size={16} style={{ width: "100%" }}>
                    <Card title="Tổng hợp thanh toán">
                      <Form.Item label="Điều chỉnh" name="adjustmentAmount">
                        <InputNumber className="w-full" min={-1_000_000_000} step={1000} addonAfter="VNĐ" placeholder="0" />
                      </Form.Item>
                      <Divider className="!my-3" />
                      <Space direction="vertical" size={6} style={{ width: "100%" }}>
                        <Space style={{ width: "100%", justifyContent: "space-between" }}>
                          <Typography.Text>Tạm tính</Typography.Text>
                          <Typography.Text strong>{toCurrency(totals.subtotal)}</Typography.Text>
                        </Space>
                        <Space style={{ width: "100%", justifyContent: "space-between" }}>
                          <Typography.Text>Điều chỉnh</Typography.Text>
                          <Typography.Text>{toCurrency(totals.adjustment)}</Typography.Text>
                        </Space>
                        <Space style={{ width: "100%", justifyContent: "space-between" }}>
                          <Typography.Text>VAT tham chiếu (10%)</Typography.Text>
                          <Typography.Text>{toCurrency(totals.vat)}</Typography.Text>
                        </Space>
                        <Divider className="!my-2" />
                        <Space style={{ width: "100%", justifyContent: "space-between" }}>
                          <Typography.Text strong>Tổng cộng dự kiến</Typography.Text>
                          <Typography.Text strong>{toCurrency(totals.grandTotal)}</Typography.Text>
                        </Space>
                      </Space>
                    </Card>

                    <Card title="Trạng thái lưu">
                      <Typography.Paragraph type="secondary">
                        Chọn cách lưu hóa đơn phù hợp với quy trình kiểm soát nội bộ.
                      </Typography.Paragraph>
                      <Space direction="vertical" size={10} style={{ width: "100%" }}>
                        <Button
                          block
                          onClick={() => {
                            setSubmitStatus("DRAFT");
                            form.submit();
                          }}
                          loading={submitting && submitStatus === "DRAFT"}
                        >
                          Lưu nháp
                        </Button>
                        <Button
                          type="primary"
                          block
                          onClick={() => {
                            setSubmitStatus("ISSUED");
                            form.submit();
                          }}
                          loading={submitting && submitStatus === "ISSUED"}
                        >
                          {mode === "create" ? "Tạo và phát hành" : "Cập nhật và phát hành"}
                        </Button>
                      </Space>
                    </Card>
                  </Space>
                </Col>
              </Row>
            </Form>
          </Space>
        )
      }
    />
  );
};

export default InvoiceFormPage;
