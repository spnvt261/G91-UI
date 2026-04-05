import { Alert, Button, Card, DatePicker, Descriptions, Empty, Form, Input, Modal, Select, Space, Table, Timeline, Typography } from "antd";
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
import type { SaleOrderDetailModel } from "../../models/sale-order/sale-order.model";
import { saleOrderService } from "../../services/sale-order/sale-order.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage, toCurrency } from "../shared/page.utils";
import SaleOrderStatusTag from "./components/SaleOrderStatusTag";
import {
  formatSaleOrderDate,
  formatSaleOrderDateTime,
  getTimelineEventLabel,
  resolveSaleOrderNumber,
  SALE_ORDER_CANCELLATION_REASON_OPTIONS,
  toSaleOrderTransitionErrorMessage,
} from "./saleOrder.ui";

type ActionKey = "processing" | "reserve" | "pick" | "dispatch" | "deliver" | "complete" | "cancel" | "invoice" | null;

type CancelFormValues = {
  cancellationReason: string;
  comment?: string;
};

type InvoiceFormValues = {
  dueDate: dayjs.Dayjs;
  issueDate?: dayjs.Dayjs;
  status?: "DRAFT" | "ISSUED";
  billingAddress?: string;
  paymentTerms?: string;
  note?: string;
};

const TRANSITIONS: Record<string, string[]> = {
  SUBMITTED: ["PROCESSING", "RESERVED"],
  PROCESSING: ["RESERVED", "PICKED"],
  RESERVED: ["PICKED"],
  PICKED: ["IN_TRANSIT", "DELIVERED"],
  IN_TRANSIT: ["DELIVERED"],
  DELIVERED: ["COMPLETED"],
};

const normalizeStatus = (value?: string): string => String(value ?? "").trim().toUpperCase();

const SaleOrderDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const role = getStoredUserRole();
  const { notify } = useNotify();

  const isCustomer = role === "CUSTOMER";
  const canUpdateStatus = canPerformAction(role, "sale-order.status.update");
  const canFulfillment = canPerformAction(role, "sale-order.fulfillment");
  const canComplete = canPerformAction(role, "sale-order.complete");
  const canCancel = canPerformAction(role, "sale-order.cancel");
  const canCreateInvoice = canPerformAction(role, "sale-order.create-invoice");

  const [detail, setDetail] = useState<SaleOrderDetailModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<ActionKey>(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);
  const [cancelForm] = Form.useForm<CancelFormValues>();
  const [invoiceForm] = Form.useForm<InvoiceFormValues>();

  const loadData = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [detailData, timelineData] = await Promise.all([saleOrderService.getDetail(id), saleOrderService.getTimeline(id).catch(() => null)]);

      if (timelineData) {
        setDetail({
          ...detailData,
          header: {
            ...detailData.header,
            status: timelineData.currentStatus ?? detailData.header.status,
          },
          timeline: [...detailData.timeline, ...timelineData.milestones, ...timelineData.events],
        });
      } else {
        setDetail(detailData);
      }
    } catch (loadError) {
      const message = getErrorMessage(loadError, "Không thể tải chi tiết đơn bán.");
      setError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [id, notify]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const currentStatus = normalizeStatus(detail?.header.status);
  const isTerminal = currentStatus === "CANCELLED" || currentStatus === "COMPLETED";
  const canTo = useCallback((target: string) => (TRANSITIONS[currentStatus] ?? []).includes(target), [currentStatus]);

  const hasInternalAction = !isCustomer && (canUpdateStatus || canFulfillment || canComplete || canCancel || canCreateInvoice);

  const runAction = useCallback(
    async (key: ActionKey, task: () => Promise<void>, successMessage: string, fallback: string) => {
      try {
        setActionLoading(key);
        await task();
        notify(successMessage, "success");
        await loadData();
      } catch (actionError) {
        const message = getErrorMessage(actionError, fallback);
        notify(toSaleOrderTransitionErrorMessage(message), "error");
      } finally {
        setActionLoading(null);
      }
    },
    [loadData, notify],
  );

  const itemColumns = useMemo<ColumnsType<SaleOrderDetailModel["items"][number]>>(
    () => [
      {
        title: "Mặt hàng",
        key: "name",
        render: (_, item) => (
          <Space direction="vertical" size={0}>
            <Typography.Text strong>{item.productName || item.description || item.productCode || item.productId || "Chưa cập nhật"}</Typography.Text>
            <Typography.Text type="secondary">{item.productCode || item.productId || "-"}</Typography.Text>
          </Space>
        ),
      },
      { title: "Số lượng", dataIndex: "quantity", key: "quantity", width: 90, align: "right" },
      { title: "Dự trữ", dataIndex: "reservedQuantity", key: "reservedQuantity", width: 90, align: "right", render: (value?: number) => value ?? 0 },
      { title: "Soạn", dataIndex: "pickedQuantity", key: "pickedQuantity", width: 80, align: "right", render: (value?: number) => value ?? 0 },
      { title: "Xuất", dataIndex: "issuedQuantity", key: "issuedQuantity", width: 80, align: "right", render: (value?: number) => value ?? 0 },
      { title: "Giao", dataIndex: "deliveredQuantity", key: "deliveredQuantity", width: 80, align: "right", render: (value?: number) => value ?? 0 },
      {
        title: "Đơn giá",
        dataIndex: "unitPrice",
        key: "unitPrice",
        width: 140,
        align: "right",
        render: (value?: number) => (value != null ? toCurrency(value) : "-"),
      },
      {
        title: "Thành tiền",
        dataIndex: "lineTotal",
        key: "lineTotal",
        width: 150,
        align: "right",
        render: (value: number | undefined, row) => <Typography.Text strong>{toCurrency(value ?? (row.quantity || 0) * (row.unitPrice || 0))}</Typography.Text>,
      },
    ],
    [],
  );

  const relatedInvoiceColumns = useMemo<ColumnsType<SaleOrderDetailModel["invoices"][number]>>(
    () => [
      { title: "Số hóa đơn", key: "invoiceNumber", render: (_, row) => row.invoiceNumber || row.invoiceId || "-" },
      { title: "Ngày xuất", dataIndex: "issuedAt", key: "issuedAt", render: (value?: string) => formatSaleOrderDate(value) },
      { title: "Trạng thái", dataIndex: "status", key: "status", render: (value?: string) => value || "Chưa cập nhật" },
      { title: "Tổng tiền", dataIndex: "totalAmount", key: "totalAmount", align: "right", render: (value?: number) => (value != null ? toCurrency(value) : "-") },
      { title: "Còn phải thu", dataIndex: "outstandingAmount", key: "outstandingAmount", align: "right", render: (value?: number) => (value != null ? toCurrency(value) : "-") },
      {
        title: "Thao tác",
        key: "actions",
        render: (_, row) =>
          row.invoiceId ? (
            <Button type="link" onClick={() => navigate(ROUTE_URL.INVOICE_DETAIL.replace(":id", row.invoiceId || ""))}>
              Xem hóa đơn
            </Button>
          ) : (
            "-"
          ),
      },
    ],
    [navigate],
  );

  const timelineItems = useMemo(() => {
    const events = [...(detail?.timeline ?? [])];
    events.sort((a, b) => dayjs(b.at).valueOf() - dayjs(a.at).valueOf());
    return events;
  }, [detail?.timeline]);

  const fulfillInfo = detail?.fulfillment;
  const subtotal = useMemo(() => (detail?.items ?? []).reduce((sum, item) => sum + (item.lineTotal ?? (item.quantity || 0) * (item.unitPrice || 0)), 0), [detail?.items]);

  const openCancelModal = () => {
    cancelForm.resetFields();
    setCancelOpen(true);
  };

  const openInvoiceModal = () => {
    invoiceForm.setFieldsValue({
      dueDate: dayjs().add(7, "day"),
      issueDate: dayjs(),
      status: "DRAFT",
      billingAddress: detail?.customer?.address,
      paymentTerms: undefined,
      note: undefined,
    });
    setInvoiceOpen(true);
  };

  const handleCancelOrder = async () => {
    if (!id) {
      return;
    }

    try {
      const values = await cancelForm.validateFields();
      await runAction(
        "cancel",
        async () => {
          await saleOrderService.cancel(id, values);
          setCancelOpen(false);
        },
        "Đã hủy đơn bán thành công.",
        "Không thể hủy đơn bán.",
      );
    } catch {
      return;
    }
  };

  const handleCreateInvoice = async () => {
    if (!id || !detail) {
      return;
    }

    try {
      const values = await invoiceForm.validateFields();
      await runAction(
        "invoice",
        async () => {
          const invoice = await saleOrderService.createInvoice(id, {
            dueDate: values.dueDate.format("YYYY-MM-DD"),
            issueDate: values.issueDate?.format("YYYY-MM-DD"),
            status: values.status,
            billingAddress: values.billingAddress,
            paymentTerms: values.paymentTerms,
            note: values.note,
            items: detail.items
              .filter((item) => item.quantity > 0 && (item.unitPrice ?? 0) >= 0)
              .map((item) => ({
                productId: item.productId,
                description: item.productName || item.description,
                unit: item.unit,
                quantity: item.quantity,
                unitPrice: item.unitPrice ?? 0,
              })),
          });
          setInvoiceOpen(false);
          if (invoice.id) {
            navigate(ROUTE_URL.INVOICE_DETAIL.replace(":id", invoice.id));
          }
        },
        "Đã tạo hóa đơn từ đơn bán.",
        "Không thể tạo hóa đơn từ đơn bán.",
      );
    } catch {
      return;
    }
  };

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Chi tiết đơn bán"
          subtitle="Theo dõi thực hiện đơn, chứng từ liên quan và thao tác nhanh theo vai trò."
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Đơn bán", url: ROUTE_URL.SALE_ORDER_LIST },
                { label: detail ? resolveSaleOrderNumber(detail.header.id, detail.header.saleOrderNumber) : "Chi tiết đơn bán" },
              ]}
            />
          }
          actions={
            <Space wrap>
              <Button onClick={() => void loadData()} loading={loading}>
                Làm mới
              </Button>
              <Button onClick={() => navigate(ROUTE_URL.SALE_ORDER_TIMELINE.replace(":id", id ?? ""))} disabled={!id}>
                Xem dòng thời gian
              </Button>
            </Space>
          }
        />
      }
      body={
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {!id ? <Alert type="warning" showIcon message="Không tìm thấy mã đơn bán trên đường dẫn." /> : null}
          {error ? <Alert type="error" showIcon message="Không thể tải chi tiết đơn bán." description={error} /> : null}
          {isCustomer ? <Alert type="info" showIcon message="Bạn chỉ có quyền xem thông tin đơn bán, không thể thao tác nội bộ." /> : null}

          <Card loading={loading} title="Thông tin đơn bán">
            {!detail ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có dữ liệu đơn bán để hiển thị." />
            ) : (
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered size="small">
                  <Descriptions.Item label="Mã đơn bán">{resolveSaleOrderNumber(detail.header.id, detail.header.saleOrderNumber)}</Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <SaleOrderStatusTag status={detail.header.status} />
                  </Descriptions.Item>
                  <Descriptions.Item label="Tổng tiền">
                    <Typography.Text strong>{toCurrency(detail.header.totalAmount || subtotal)}</Typography.Text>
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày đơn">{formatSaleOrderDate(detail.header.orderDate)}</Descriptions.Item>
                  <Descriptions.Item label="Ngày giao dự kiến">{formatSaleOrderDate(detail.header.expectedDeliveryDate)}</Descriptions.Item>
                  <Descriptions.Item label="Ngày giao thực tế">{formatSaleOrderDate(detail.header.actualDeliveryDate)}</Descriptions.Item>
                  <Descriptions.Item label="Mã hợp đồng">{detail.header.contractNumber || detail.header.contractId || "Chưa liên kết"}</Descriptions.Item>
                  <Descriptions.Item label="Mã dự án">{detail.header.projectCode || detail.header.projectId || "Chưa liên kết"}</Descriptions.Item>
                  <Descriptions.Item label="Mã vận đơn">{detail.header.trackingNumber || "Chưa cập nhật"}</Descriptions.Item>
                </Descriptions>

                <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small" title="Khách hàng">
                  <Descriptions.Item label="Mã khách hàng">{detail.customer?.code || detail.header.customerCode || detail.header.customerId || "-"}</Descriptions.Item>
                  <Descriptions.Item label="Tên khách hàng">{detail.customer?.name || detail.header.customerName || "-"}</Descriptions.Item>
                  <Descriptions.Item label="Người liên hệ">{detail.customer?.contactPerson || "Chưa cập nhật"}</Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">{detail.customer?.phone || "Chưa cập nhật"}</Descriptions.Item>
                  <Descriptions.Item label="Email">{detail.customer?.email || "Chưa cập nhật"}</Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ">{detail.customer?.address || "Chưa cập nhật"}</Descriptions.Item>
                </Descriptions>

                <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small" title="Dự án">
                  <Descriptions.Item label="Mã dự án">{detail.project?.code || detail.header.projectCode || detail.header.projectId || "Chưa liên kết"}</Descriptions.Item>
                  <Descriptions.Item label="Tên dự án">{detail.project?.name || detail.header.projectName || "Chưa liên kết"}</Descriptions.Item>
                  <Descriptions.Item label="Trạng thái dự án">{detail.project?.status || "Chưa cập nhật"}</Descriptions.Item>
                  <Descriptions.Item label="Ghi chú đơn">{detail.header.note || "Không có ghi chú"}</Descriptions.Item>
                </Descriptions>
              </Space>
            )}
          </Card>

          <Card loading={loading} title="Danh sách mặt hàng">
            <Table
              rowKey={(item, index) => item.id || item.productId || `item-${index}`}
              columns={itemColumns}
              dataSource={detail?.items ?? []}
              pagination={false}
              scroll={{ x: 1050 }}
              locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có mặt hàng trong đơn bán này." /> }}
            />
          </Card>

          <Card loading={loading} title="Tình trạng thực hiện">
            <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered size="small">
              <Descriptions.Item label="Đã dự trữ lúc">{formatSaleOrderDateTime(fulfillInfo?.reservedAt)}</Descriptions.Item>
              <Descriptions.Item label="Đã soạn lúc">{formatSaleOrderDateTime(fulfillInfo?.pickedAt)}</Descriptions.Item>
              <Descriptions.Item label="Đã xuất giao lúc">{formatSaleOrderDateTime(fulfillInfo?.dispatchedAt)}</Descriptions.Item>
              <Descriptions.Item label="Đã giao lúc">{formatSaleOrderDateTime(fulfillInfo?.deliveredAt)}</Descriptions.Item>
              <Descriptions.Item label="Hoàn tất lúc">{formatSaleOrderDateTime(fulfillInfo?.completedAt)}</Descriptions.Item>
              <Descriptions.Item label="Lý do hủy">{fulfillInfo?.cancellationReason || "Không có"}</Descriptions.Item>
              <Descriptions.Item label="Ghi chú hủy" span={3}>
                {fulfillInfo?.cancellationNote || "Không có"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card loading={loading} title="Chứng từ và hóa đơn liên quan">
            <Table
              rowKey={(row, index) => row.invoiceId || `invoice-${index}`}
              columns={relatedInvoiceColumns}
              dataSource={detail?.invoices ?? []}
              pagination={false}
              locale={{ emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có hóa đơn liên kết với đơn bán này." /> }}
            />
          </Card>

          <Card loading={loading} title="Dòng thời gian xử lý">
            {timelineItems.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có bản ghi dòng thời gian cho đơn bán này." />
            ) : (
              <Timeline
                items={timelineItems.map((event, index) => ({
                  key: `${event.id || event.at || event.eventType || index}`,
                  children: (
                    <Space direction="vertical" size={2}>
                      <Typography.Text strong>{getTimelineEventLabel(event.eventType, event.title)}</Typography.Text>
                      <Typography.Text type="secondary">{formatSaleOrderDateTime(event.at)}</Typography.Text>
                      {event.status ? <SaleOrderStatusTag compact status={event.status} /> : null}
                      {event.actorName ? <Typography.Text type="secondary">Người thực hiện: {event.actorName}</Typography.Text> : null}
                      {event.note ? <Typography.Text>{event.note}</Typography.Text> : null}
                      {event.trackingNumber ? <Typography.Text type="secondary">Mã vận đơn: {event.trackingNumber}</Typography.Text> : null}
                    </Space>
                  ),
                }))}
              />
            )}
          </Card>

          {hasInternalAction ? (
            <Card title="Thao tác xử lý đơn bán">
              <Space wrap>
                {canUpdateStatus ? (
                  <Button
                    loading={actionLoading === "processing"}
                    disabled={isTerminal || !canTo("PROCESSING")}
                    onClick={() =>
                      void runAction(
                        "processing",
                        async () => {
                          if (!id) {
                            return;
                          }
                          await saleOrderService.updateStatus(id, { status: "PROCESSING" });
                        },
                        "Đã chuyển đơn bán sang trạng thái Đang xử lý.",
                        "Không thể chuyển đơn bán sang trạng thái Đang xử lý.",
                      )
                    }
                  >
                    Chuyển xử lý
                  </Button>
                ) : null}

                {canFulfillment ? (
                  <Button
                    loading={actionLoading === "reserve"}
                    disabled={isTerminal || !canTo("RESERVED")}
                    onClick={() =>
                      void runAction(
                        "reserve",
                        async () => {
                          if (!id) {
                            return;
                          }
                          await saleOrderService.reserve(id);
                        },
                        "Đã dự trữ hàng cho đơn bán.",
                        "Không thể dự trữ hàng cho đơn bán.",
                      )
                    }
                  >
                    Dự trữ hàng
                  </Button>
                ) : null}

                {canFulfillment ? (
                  <Button
                    loading={actionLoading === "pick"}
                    disabled={isTerminal || !canTo("PICKED")}
                    onClick={() =>
                      void runAction(
                        "pick",
                        async () => {
                          if (!id) {
                            return;
                          }
                          await saleOrderService.pick(id);
                        },
                        "Đã soạn hàng cho đơn bán.",
                        "Không thể soạn hàng cho đơn bán.",
                      )
                    }
                  >
                    Soạn hàng
                  </Button>
                ) : null}

                {canFulfillment ? (
                  <Button
                    loading={actionLoading === "dispatch"}
                    disabled={isTerminal || !canTo("IN_TRANSIT")}
                    onClick={() =>
                      void runAction(
                        "dispatch",
                        async () => {
                          if (!id) {
                            return;
                          }
                          await saleOrderService.dispatch(id);
                        },
                        "Đã chuyển trạng thái xuất giao cho đơn bán.",
                        "Không thể chuyển đơn bán sang trạng thái xuất giao.",
                      )
                    }
                  >
                    Xuất giao
                  </Button>
                ) : null}

                {canFulfillment ? (
                  <Button
                    loading={actionLoading === "deliver"}
                    disabled={isTerminal || !canTo("DELIVERED")}
                    onClick={() =>
                      void runAction(
                        "deliver",
                        async () => {
                          if (!id) {
                            return;
                          }
                          await saleOrderService.deliver(id, { actualDeliveryDate: dayjs().format("YYYY-MM-DD") });
                        },
                        "Đã xác nhận giao hàng thành công.",
                        "Không thể xác nhận đã giao cho đơn bán.",
                      )
                    }
                  >
                    Xác nhận đã giao
                  </Button>
                ) : null}

                {canComplete ? (
                  <Button
                    type="primary"
                    loading={actionLoading === "complete"}
                    disabled={isTerminal || !canTo("COMPLETED")}
                    onClick={() =>
                      void runAction(
                        "complete",
                        async () => {
                          if (!id) {
                            return;
                          }
                          await saleOrderService.complete(id);
                        },
                        "Đã hoàn tất đơn bán.",
                        "Không thể hoàn tất đơn bán.",
                      )
                    }
                  >
                    Hoàn tất đơn
                  </Button>
                ) : null}

                {canCreateInvoice ? (
                  <Button type="dashed" loading={actionLoading === "invoice"} disabled={isTerminal || !id} onClick={openInvoiceModal}>
                    Tạo hóa đơn
                  </Button>
                ) : null}

                {canCancel ? (
                  <Button danger loading={actionLoading === "cancel"} disabled={isTerminal || !id} onClick={openCancelModal}>
                    Hủy đơn
                  </Button>
                ) : null}
              </Space>
            </Card>
          ) : null}

          <Modal
            open={cancelOpen}
            title="Xác nhận hủy đơn bán"
            okText="Xác nhận hủy"
            cancelText="Đóng"
            okButtonProps={{ danger: true, loading: actionLoading === "cancel" }}
            onCancel={() => setCancelOpen(false)}
            onOk={() => void handleCancelOrder()}
          >
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Alert showIcon type="warning" message="Hành động này sẽ hủy đơn bán và không thể khôi phục trạng thái trước đó." />
              <Form form={cancelForm} layout="vertical">
                <Form.Item
                  name="cancellationReason"
                  label="Lý do hủy"
                  rules={[{ required: true, message: "Vui lòng chọn lý do hủy đơn bán." }]}
                >
                  <Select placeholder="Chọn lý do hủy" options={SALE_ORDER_CANCELLATION_REASON_OPTIONS} />
                </Form.Item>
                <Form.Item name="comment" label="Ghi chú">
                  <Input.TextArea rows={3} placeholder="Nhập thông tin bổ sung cho quyết định hủy đơn (nếu có)." />
                </Form.Item>
              </Form>
            </Space>
          </Modal>

          <Modal
            open={invoiceOpen}
            title="Tạo hóa đơn từ đơn bán"
            okText="Tạo hóa đơn"
            cancelText="Đóng"
            okButtonProps={{ loading: actionLoading === "invoice" }}
            onCancel={() => setInvoiceOpen(false)}
            onOk={() => void handleCreateInvoice()}
          >
            <Form form={invoiceForm} layout="vertical">
              <Form.Item name="dueDate" label="Hạn thanh toán" rules={[{ required: true, message: "Vui lòng chọn hạn thanh toán." }]}> 
                <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Chọn hạn thanh toán" />
              </Form.Item>
              <Form.Item name="issueDate" label="Ngày xuất hóa đơn">
                <DatePicker className="w-full" format="DD/MM/YYYY" placeholder="Chọn ngày xuất hóa đơn" />
              </Form.Item>
              <Form.Item name="status" label="Trạng thái ban đầu">
                <Select
                  options={[
                    { label: "Nháp", value: "DRAFT" },
                    { label: "Đã phát hành", value: "ISSUED" },
                  ]}
                />
              </Form.Item>
              <Form.Item name="billingAddress" label="Địa chỉ thanh toán">
                <Input.TextArea rows={2} placeholder="Nhập địa chỉ thanh toán trên hóa đơn" />
              </Form.Item>
              <Form.Item name="paymentTerms" label="Điều khoản thanh toán">
                <Input placeholder="Ví dụ: Thanh toán trong vòng 15 ngày" />
              </Form.Item>
              <Form.Item name="note" label="Ghi chú hóa đơn">
                <Input.TextArea rows={2} placeholder="Nhập ghi chú (nếu có)" />
              </Form.Item>
            </Form>
          </Modal>
        </Space>
      }
    />
  );
};

export default SaleOrderDetailPage;
