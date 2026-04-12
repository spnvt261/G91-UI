import {
  Alert,
  Button,
  Card,
  DatePicker,
  Descriptions,
  Empty,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Steps,
  Table,
  Timeline,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { canPerformAction, hasPermission } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { DebtStatusDetailModel } from "../../models/debt/debt.model";
import type {
  SaleOrderDetailModel,
  SaleOrderTimelineEventModel,
} from "../../models/sale-order/sale-order.model";
import { debtService } from "../../services/debt/debt.service";
import { saleOrderService } from "../../services/sale-order/sale-order.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage, toCurrency } from "../shared/page.utils";
import SaleOrderStatusTag from "./components/SaleOrderStatusTag";
import {
  formatSaleOrderDate,
  formatSaleOrderDateTime,
  getNextFulfillmentAction,
  getTimelineEventLabel,
  isSaleOrderTerminalStatus,
  isStatusReached,
  normalizeSaleOrderStatus,
  resolveSaleOrderNumber,
  SALE_ORDER_CANCELLATION_REASON_OPTIONS,
  SALE_ORDER_FLOW_STEPS,
  toSaleOrderTransitionErrorMessage,
} from "./saleOrder.ui";

type FulfillmentAction =
  | "reserve"
  | "pick"
  | "dispatch"
  | "deliver"
  | "complete";
type LoadingAction = FulfillmentAction | "cancel" | "invoice" | null;

type ActionFormValues = {
  note?: string;
  trackingNumber?: string;
  actualDeliveryDate?: dayjs.Dayjs;
};
type CancelFormValues = { cancellationReason: string; comment?: string };
type InvoiceFormValues = {
  issueDate?: dayjs.Dayjs;
  dueDate: dayjs.Dayjs;
  status?: "DRAFT" | "ISSUED";
  billingAddress?: string;
  paymentTerms?: string;
  note?: string;
};

const ACTION_META: Record<
  FulfillmentAction,
  { title: string; okText: string; success: string; fallback: string }
> = {
  reserve: {
    title: "Xác nhận Reserve (Dự trữ)",
    okText: "Reserve",
    success: "Đã Reserve đơn bán.",
    fallback: "Không thể Reserve đơn bán.",
  },
  pick: {
    title: "Xác nhận Pick (Soạn hàng)",
    okText: "Pick",
    success: "Đã Pick đơn bán.",
    fallback: "Không thể Pick đơn bán.",
  },
  dispatch: {
    title: "Xác nhận Dispatch (Xuất giao)",
    okText: "Dispatch",
    success: "Đã Dispatch đơn bán.",
    fallback: "Không thể Dispatch đơn bán.",
  },
  deliver: {
    title: "Xác nhận Delivered (Đã giao)",
    okText: "Delivered",
    success: "Đã xác nhận Delivered.",
    fallback: "Không thể xác nhận Delivered.",
  },
  complete: {
    title: "Xác nhận Complete (Hoàn tất)",
    okText: "Complete",
    success: "Đã hoàn tất đơn bán.",
    fallback: "Không thể hoàn tất đơn bán.",
  },
};

const dedupeTimeline = (
  events: SaleOrderTimelineEventModel[],
): SaleOrderTimelineEventModel[] => {
  const seen = new Set<string>();
  return events.filter((event) => {
    const key = `${event.id ?? ""}|${event.eventType ?? ""}|${event.status ?? ""}|${event.at ?? ""}|${event.title ?? ""}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

const hasKeyword = (
  events: SaleOrderTimelineEventModel[],
  keywords: string[],
) =>
  events.some((event) => {
    const content =
      `${event.eventType ?? ""} ${event.title ?? ""} ${event.note ?? ""}`.toUpperCase();
    return keywords.some((keyword) => content.includes(keyword));
  });

const SaleOrderDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const role = getStoredUserRole();
  const { notify } = useNotify();

  const isCustomer = role === "CUSTOMER";
  const canFulfillment = canPerformAction(role, "sale-order.fulfillment");
  const canComplete = canPerformAction(role, "sale-order.complete");
  const canCancel = canPerformAction(role, "sale-order.cancel");
  const canCreateInvoice = canPerformAction(role, "sale-order.create-invoice");
  const canViewRelatedInvoices = canPerformAction(
    role,
    "sale-order.related-invoices.view",
  );
  const canRecordPayment = canPerformAction(role, "payment.record");
  const canTrackDebt = hasPermission(role, "debt.view");

  const [detail, setDetail] = useState<SaleOrderDetailModel | null>(null);
  const [debtDetail, setDebtDetail] = useState<DebtStatusDetailModel | null>(
    null,
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingAction, setLoadingAction] = useState<LoadingAction>(null);
  const [pendingAction, setPendingAction] = useState<FulfillmentAction | null>(
    null,
  );
  const [cancelOpen, setCancelOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  const [actionForm] = Form.useForm<ActionFormValues>();
  const [cancelForm] = Form.useForm<CancelFormValues>();
  const [invoiceForm] = Form.useForm<InvoiceFormValues>();

  const loadData = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const [detailData, timelineData] = await Promise.all([
        saleOrderService.getDetail(id),
        saleOrderService.getTimeline(id).catch(() => null),
      ]);
      const mergedTimeline = dedupeTimeline([
        ...(detailData.timeline ?? []),
        ...(timelineData?.milestones ?? []),
        ...(timelineData?.events ?? []),
      ]);
      const nextDetail = {
        ...detailData,
        header: {
          ...detailData.header,
          status: timelineData?.currentStatus ?? detailData.header.status,
        },
        timeline: mergedTimeline,
      };
      setDetail(nextDetail);

      if (nextDetail.header.customerId && canTrackDebt) {
        const debt = await debtService
          .getDetail(nextDetail.header.customerId)
          .catch(() => null);
        setDebtDetail(debt);
      } else {
        setDebtDetail(null);
      }
    } catch (loadError) {
      const message = getErrorMessage(
        loadError,
        "Không thể tải chi tiết đơn bán.",
      );
      setError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [canTrackDebt, id, notify]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const currentStatus = normalizeSaleOrderStatus(detail?.header.status);
  const isTerminal = isSaleOrderTerminalStatus(currentStatus);
  const deliveredGate =
    currentStatus === "DELIVERED" || currentStatus === "COMPLETED";
  const nextFulfillment = getNextFulfillmentAction(currentStatus);

  const executeAction = useCallback(
    async (
      key: LoadingAction,
      task: () => Promise<void>,
      successMessage: string,
      fallbackMessage: string,
    ) => {
      try {
        setLoadingAction(key);
        await task();
        notify(successMessage, "success");
        await loadData();
      } catch (actionError) {
        const message = getErrorMessage(actionError, fallbackMessage);
        notify(toSaleOrderTransitionErrorMessage(message), "error");
      } finally {
        setLoadingAction(null);
      }
    },
    [loadData, notify],
  );

  const openActionModal = (action: FulfillmentAction) => {
    actionForm.resetFields();
    if (action === "deliver") {
      actionForm.setFieldsValue({ actualDeliveryDate: dayjs() });
    }
    setPendingAction(action);
  };

  const confirmAction = async () => {
    if (!id || !pendingAction) {
      return;
    }
    try {
      const values = await actionForm.validateFields();
      const payload = {
        note: values.note?.trim() || undefined,
        trackingNumber: values.trackingNumber?.trim() || undefined,
        actualDeliveryDate: values.actualDeliveryDate?.format("YYYY-MM-DD"),
      };
      const meta = ACTION_META[pendingAction];
      await executeAction(
        pendingAction,
        async () => {
          if (pendingAction === "reserve")
            await saleOrderService.reserve(id, payload);
          if (pendingAction === "pick")
            await saleOrderService.pick(id, payload);
          if (pendingAction === "dispatch")
            await saleOrderService.dispatch(id, payload);
          if (pendingAction === "deliver")
            await saleOrderService.deliver(id, {
              ...payload,
              actualDeliveryDate:
                payload.actualDeliveryDate || dayjs().format("YYYY-MM-DD"),
            });
          if (pendingAction === "complete")
            await saleOrderService.complete(id, payload);
          setPendingAction(null);
        },
        meta.success,
        meta.fallback,
      );
    } catch (formError) {
      if (
        typeof formError === "object" &&
        formError !== null &&
        "errorFields" in formError
      ) {
        return;
      }
    }
  };

  const confirmCancel = async () => {
    if (!id) {
      return;
    }
    try {
      const values = await cancelForm.validateFields();
      await executeAction(
        "cancel",
        async () => {
          await saleOrderService.cancel(id, values);
          setCancelOpen(false);
        },
        "Đã hủy đơn bán.",
        "Không thể hủy đơn bán.",
      );
    } catch (formError) {
      if (
        typeof formError === "object" &&
        formError !== null &&
        "errorFields" in formError
      ) {
        return;
      }
    }
  };

  const openInvoiceModal = () => {
    invoiceForm.setFieldsValue({
      issueDate: dayjs(),
      dueDate: dayjs().add(15, "day"),
      status: "ISSUED",
      billingAddress: detail?.customer?.address,
    });
    setInvoiceOpen(true);
  };

  const confirmCreateInvoice = async () => {
    if (!id) {
      return;
    }
    try {
      const values = await invoiceForm.validateFields();
      await executeAction(
        "invoice",
        async () => {
          const created = await saleOrderService.createInvoice(id, {
            issueDate: values.issueDate?.format("YYYY-MM-DD"),
            dueDate: values.dueDate.format("YYYY-MM-DD"),
            status: values.status,
            billingAddress: values.billingAddress?.trim() || undefined,
            paymentTerms: values.paymentTerms?.trim() || undefined,
            note: values.note?.trim() || undefined,
          });
          setInvoiceOpen(false);
          if (created.id)
            navigate(ROUTE_URL.INVOICE_DETAIL.replace(":id", created.id));
        },
        "Đã tạo hóa đơn từ đơn bán.",
        "Không thể tạo hóa đơn từ đơn bán.",
      );
    } catch (formError) {
      if (
        typeof formError === "object" &&
        formError !== null &&
        "errorFields" in formError
      ) {
        return;
      }
    }
  };

  const timelineItems = useMemo(
    () =>
      [...(detail?.timeline ?? [])].sort(
        (a, b) => dayjs(b.at).valueOf() - dayjs(a.at).valueOf(),
      ),
    [detail?.timeline],
  );
  const flowItems = useMemo(() => {
    const completion = {
      SUBMITTED: currentStatus.length > 0,
      RESERVED: isStatusReached(currentStatus, "RESERVED"),
      PICKED: isStatusReached(currentStatus, "PICKED"),
      DISPATCHED: isStatusReached(currentStatus, "IN_TRANSIT"),
      DELIVERED: isStatusReached(currentStatus, "DELIVERED"),
      INVOICE_CREATED:
        (detail?.invoices.length ?? 0) > 0 ||
        hasKeyword(timelineItems, ["INVOICE", "CREATE_INVOICE"]),
      PAYMENT_RECORDED:
        (debtDetail?.paymentHistory.length ?? 0) > 0 ||
        hasKeyword(timelineItems, ["PAYMENT"]),
      DEBT_SETTLED: hasKeyword(timelineItems, ["SETTLEMENT", "DEBT_SETTLED"]),
    } as Record<string, boolean>;
    let usedProcess = false;
    return SALE_ORDER_FLOW_STEPS.map((step) => {
      const done = completion[step.key];
      const status: "finish" | "process" | "wait" = done
        ? "finish"
        : usedProcess
          ? "wait"
          : "process";
      if (!done && !usedProcess) usedProcess = true;
      return {
        key: step.key,
        title: step.label,
        status,
        description: `${step.owner === "WAREHOUSE" ? "Kho" : "Kế toán"}: ${step.description}`,
      };
    });
  }, [
    currentStatus,
    debtDetail?.paymentHistory.length,
    detail?.invoices.length,
    timelineItems,
  ]);

  const contractId = detail?.header.contractId || detail?.header.id;
  const customerId = detail?.header.customerId;
  const outstandingInvoice = (detail?.invoices ?? []).find(
    (invoice) => (invoice.outstandingAmount ?? 0) > 0 && invoice.invoiceId,
  );
  const totalOutstanding = (detail?.invoices ?? []).reduce(
    (sum, invoice) => sum + (invoice.outstandingAmount ?? 0),
    0,
  );

  const itemColumns: ColumnsType<SaleOrderDetailModel["items"][number]> = [
    {
      title: "Mặt hàng",
      key: "name",
      render: (_, row) =>
        row.productName ||
        row.description ||
        row.productCode ||
        row.productId ||
        "Chưa cập nhật",
    },
    {
      title: "SL",
      dataIndex: "quantity",
      key: "quantity",
      align: "right",
      width: 80,
    },
    {
      title: "Dự trữ",
      dataIndex: "reservedQuantity",
      key: "reservedQuantity",
      align: "right",
      width: 90,
      render: (value?: number) => value ?? 0,
    },
    {
      title: "Soạn",
      dataIndex: "pickedQuantity",
      key: "pickedQuantity",
      align: "right",
      width: 80,
      render: (value?: number) => value ?? 0,
    },
    {
      title: "Xuất",
      dataIndex: "issuedQuantity",
      key: "issuedQuantity",
      align: "right",
      width: 80,
      render: (value?: number) => value ?? 0,
    },
    {
      title: "Giao",
      dataIndex: "deliveredQuantity",
      key: "deliveredQuantity",
      align: "right",
      width: 80,
      render: (value?: number) => value ?? 0,
    },
    {
      title: "Thành tiền",
      dataIndex: "lineTotal",
      key: "lineTotal",
      align: "right",
      width: 140,
      render: (value?: number) => (value != null ? toCurrency(value) : "-"),
    },
  ];

  const inventoryColumns: ColumnsType<
    SaleOrderDetailModel["inventoryIssues"][number]
  > = [
    {
      title: "Mã giao dịch",
      key: "code",
      render: (_, row) => row.transactionCode || row.transactionId || "-",
    },
    {
      title: "Thời điểm",
      dataIndex: "transactionDate",
      key: "transactionDate",
      render: (value?: string) => formatSaleOrderDateTime(value),
    },
    {
      title: "Sản phẩm",
      key: "product",
      render: (_, row) =>
        row.productName || row.productCode || row.productId || "-",
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      key: "quantity",
      align: "right",
      width: 100,
      render: (value?: number) => value ?? "-",
    },
    {
      title: "Người thao tác",
      key: "operator",
      render: (_, row) => row.operatorEmail || row.operatorId || "-",
    },
  ];

  const invoiceColumns: ColumnsType<SaleOrderDetailModel["invoices"][number]> =
    [
      {
        title: "Số hóa đơn",
        key: "invoiceNumber",
        render: (_, row) => row.invoiceNumber || row.invoiceId || "-",
      },
      {
        title: "Ngày xuất",
        dataIndex: "issueDate",
        key: "issueDate",
        render: (value?: string) => formatSaleOrderDate(value),
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        render: (value?: string) => value || "Chưa cập nhật",
      },
      {
        title: "Tổng tiền",
        dataIndex: "totalAmount",
        key: "totalAmount",
        align: "right",
        render: (value?: number) => (value != null ? toCurrency(value) : "-"),
      },
      {
        title: "Còn phải thu",
        dataIndex: "outstandingAmount",
        key: "outstandingAmount",
        align: "right",
        render: (value?: number) => (value != null ? toCurrency(value) : "-"),
      },
      {
        title: "Thao tác",
        key: "action",
        render: (_, row) =>
          row.invoiceId ? (
            <Button
              type="link"
              onClick={() =>
                navigate(
                  ROUTE_URL.INVOICE_DETAIL.replace(":id", row.invoiceId || ""),
                )
              }
            >
              Xem
            </Button>
          ) : (
            "-"
          ),
      },
    ];

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Chi tiết đơn bán"
          subtitle="Flow chuẩn: Submitted → Reserve → Pick → Dispatch → Delivered → Invoice → Payment/Debt."
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Đơn bán", url: ROUTE_URL.SALE_ORDER_LIST },
                {
                  label: detail
                    ? resolveSaleOrderNumber(
                        detail.header.id,
                        detail.header.saleOrderNumber,
                      )
                    : "Chi tiết",
                },
              ]}
            />
          }
          actions={
            <Space>
              <Button onClick={() => void loadData()} loading={loading}>
                Làm mới
              </Button>
              <Button
                onClick={() =>
                  navigate(
                    ROUTE_URL.SALE_ORDER_TIMELINE.replace(":id", id ?? ""),
                  )
                }
                disabled={!id}
              >
                Mở timeline
              </Button>
            </Space>
          }
        />
      }
      body={
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {!id ? (
            <Alert
              type="warning"
              showIcon
              message="Không tìm thấy mã đơn bán trên đường dẫn."
            />
          ) : null}
          {error ? (
            <Alert
              type="error"
              showIcon
              message="Không thể tải chi tiết đơn bán."
              description={error}
            />
          ) : null}
          {isCustomer ? (
            <Alert
              type="info"
              showIcon
              message="Bạn đang ở chế độ xem thông tin đơn bán."
            />
          ) : null}

          <Card loading={loading} title="Thông tin đơn bán">
            {!detail ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không có dữ liệu đơn bán."
              />
            ) : (
              <Descriptions
                column={{ xs: 1, sm: 2, md: 3 }}
                bordered
                size="small"
              >
                <Descriptions.Item label="Mã đơn bán">
                  {resolveSaleOrderNumber(
                    detail.header.id,
                    detail.header.saleOrderNumber,
                  )}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái">
                  <SaleOrderStatusTag status={detail.header.status} />
                </Descriptions.Item>
                <Descriptions.Item label="Tổng tiền">
                  {toCurrency(detail.header.totalAmount)}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày đơn">
                  {formatSaleOrderDate(detail.header.orderDate)}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày giao dự kiến">
                  {formatSaleOrderDate(detail.header.expectedDeliveryDate)}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày giao thực tế">
                  {formatSaleOrderDate(detail.header.actualDeliveryDate)}
                </Descriptions.Item>
                <Descriptions.Item label="Mã hợp đồng">
                  {detail.header.contractNumber || contractId || "-"}
                </Descriptions.Item>
                <Descriptions.Item label="saleOrderId = contractId">{`${detail.header.id} = ${contractId || "?"}`}</Descriptions.Item>
                <Descriptions.Item label="Hợp đồng nguồn">
                  {contractId ? (
                    <Button
                      type="link"
                      onClick={() =>
                        navigate(
                          ROUTE_URL.CONTRACT_DETAIL.replace(":id", contractId),
                        )
                      }
                    >
                      Mở hợp đồng
                    </Button>
                  ) : (
                    "-"
                  )}
                </Descriptions.Item>
              </Descriptions>
            )}
          </Card>

          <Card loading={loading} title="Khách hàng / Dự án">
            <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
              <Descriptions.Item label="Khách hàng">
                {detail?.customer?.name || detail?.header.customerName || "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Mã khách hàng">
                {detail?.customer?.code ||
                  detail?.header.customerCode ||
                  detail?.header.customerId ||
                  "-"}
              </Descriptions.Item>
              <Descriptions.Item label="Dự án">
                {detail?.project?.name ||
                  detail?.header.projectName ||
                  "Chưa liên kết"}
              </Descriptions.Item>
              <Descriptions.Item label="Mã dự án">
                {detail?.project?.code ||
                  detail?.header.projectCode ||
                  detail?.header.projectId ||
                  "-"}
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Card loading={loading} title="Mặt hàng đơn bán">
            <Table
              rowKey={(row, index) =>
                row.id || row.productId || `item-${index}`
              }
              columns={itemColumns}
              dataSource={detail?.items ?? []}
              pagination={false}
              scroll={{ x: 900 }}
            />
          </Card>

          <Card loading={loading} title="Inventory issue liên quan">
            <Table
              rowKey={(row, index) => row.transactionId || `issue-${index}`}
              columns={inventoryColumns}
              dataSource={detail?.inventoryIssues ?? []}
              pagination={false}
              locale={{
                emptyText: (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="Chưa có giao dịch xuất kho liên quan."
                  />
                ),
              }}
            />
          </Card>

          {canViewRelatedInvoices ? (
            <Card loading={loading} title="Hóa đơn liên quan">
              <Table
                rowKey={(row, index) => row.invoiceId || `invoice-${index}`}
                columns={invoiceColumns}
                dataSource={detail?.invoices ?? []}
                pagination={false}
                locale={{
                  emptyText: (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Chưa có hóa đơn liên quan."
                    />
                  ),
                }}
              />
            </Card>
          ) : null}

          {canTrackDebt && debtDetail ? (
            <Card loading={loading} title="Thanh toán / Công nợ liên quan">
              <Space direction="vertical" size={8}>
                <Typography.Text>
                  Trạng thái công nợ:{" "}
                  <Typography.Text strong>
                    {debtDetail.summary.status || "Chưa cập nhật"}
                  </Typography.Text>
                </Typography.Text>
                <Typography.Text>
                  Dư nợ còn lại:{" "}
                  <Typography.Text strong>
                    {toCurrency(debtDetail.summary.outstandingAmount)}
                  </Typography.Text>
                </Typography.Text>
                <Typography.Text>
                  Tổng công nợ từ hóa đơn đơn bán:{" "}
                  <Typography.Text strong>
                    {toCurrency(totalOutstanding)}
                  </Typography.Text>
                </Typography.Text>
                {customerId ? (
                  <Space>
                    <Button
                      onClick={() =>
                        navigate(
                          ROUTE_URL.DEBT_DETAIL.replace(
                            ":customerId",
                            customerId,
                          ),
                        )
                      }
                    >
                      Theo dõi công nợ
                    </Button>
                    <Button
                      onClick={() =>
                        navigate(
                          ROUTE_URL.DEBT_DETAIL.replace(
                            ":customerId",
                            customerId,
                          ),
                          { state: { tab: "settlement" } },
                        )
                      }
                    >
                      Xác nhận quyết toán
                    </Button>
                  </Space>
                ) : null}
              </Space>
            </Card>
          ) : null}

          <Card loading={loading} title="Timeline nghiệp vụ">
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Steps direction="vertical" current={-1} items={flowItems} />
              {timelineItems.length === 0 ? (
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="Chưa có timeline."
                />
              ) : (
                <Timeline
                  style={{ display: "none" }}
                  items={timelineItems.map((event, index) => ({
                    key: `${event.id || event.at || event.eventType || index}`,
                    children: (
                      <Space direction="vertical" size={2}>
                        <Typography.Text strong>
                          {getTimelineEventLabel(event.eventType, event.title)}
                        </Typography.Text>
                        <Typography.Text type="secondary">
                          {formatSaleOrderDateTime(event.at)}
                        </Typography.Text>
                        {event.status ? (
                          <SaleOrderStatusTag compact status={event.status} />
                        ) : null}
                      </Space>
                    ),
                  }))}
                />
              )}
            </Space>
          </Card>

          {!isCustomer && canFulfillment ? (
            <Card title="Thao tác fulfillment (Kho)">
              <Space direction="vertical" size={10}>
                <Alert
                  type="info"
                  showIcon
                  message="Kho chỉ thao tác đúng bước hợp lệ theo trạng thái hiện tại."
                />
                {nextFulfillment && !isTerminal ? (
                  <Button
                    type="primary"
                    loading={loadingAction === nextFulfillment.key}
                    onClick={() => openActionModal(nextFulfillment.key)}
                  >
                    Thực hiện {nextFulfillment.label}
                  </Button>
                ) : (
                  <Typography.Text type="secondary">
                    Không có thao tác fulfillment hợp lệ.
                  </Typography.Text>
                )}
              </Space>
            </Card>
          ) : null}

          {!isCustomer &&
          (canCreateInvoice ||
            canRecordPayment ||
            canTrackDebt ||
            canComplete ||
            canCancel) ? (
            <Card title="Chuyển sang kế toán sau Delivered">
              <Space direction="vertical" size={12}>
                <Alert
                  type={deliveredGate ? "success" : "warning"}
                  showIcon
                  message={
                    deliveredGate
                      ? "Đơn đã đủ điều kiện bước kế toán."
                      : "CTA kế toán sẽ bật sau khi đơn đạt Delivered."
                  }
                />
                <Space wrap>
                  {canCreateInvoice ? (
                    <Button
                      type="primary"
                      disabled={!deliveredGate || isTerminal}
                      loading={loadingAction === "invoice"}
                      onClick={openInvoiceModal}
                    >
                      Tạo hóa đơn
                    </Button>
                  ) : null}
                  {detail?.invoices[0]?.invoiceId ? (
                    <Button
                      onClick={() =>
                        navigate(
                          ROUTE_URL.INVOICE_DETAIL.replace(
                            ":id",
                            detail.invoices[0].invoiceId || "",
                          ),
                        )
                      }
                    >
                      Xem hóa đơn
                    </Button>
                  ) : (
                    <Button disabled>Chưa có hóa đơn</Button>
                  )}
                  {canRecordPayment ? (
                    <Button
                      disabled={
                        !deliveredGate || !outstandingInvoice?.invoiceId
                      }
                      onClick={() =>
                        navigate(
                          ROUTE_URL.PAYMENT_RECORD_BY_INVOICE.replace(
                            ":id",
                            outstandingInvoice?.invoiceId || "",
                          ),
                        )
                      }
                    >
                      Ghi nhận thanh toán
                    </Button>
                  ) : null}
                  {canComplete ? (
                    <Button
                      type="dashed"
                      disabled={currentStatus !== "DELIVERED"}
                      loading={loadingAction === "complete"}
                      onClick={() => openActionModal("complete")}
                    >
                      Complete
                    </Button>
                  ) : null}
                  {canCancel ? (
                    <Button
                      danger
                      disabled={isTerminal}
                      loading={loadingAction === "cancel"}
                      onClick={() => setCancelOpen(true)}
                    >
                      Hủy đơn bán
                    </Button>
                  ) : null}
                </Space>
              </Space>
            </Card>
          ) : null}

          <Modal
            open={Boolean(pendingAction)}
            title={
              pendingAction
                ? ACTION_META[pendingAction].title
                : "Xác nhận thao tác"
            }
            okText={
              pendingAction ? ACTION_META[pendingAction].okText : "Xác nhận"
            }
            cancelText="Đóng"
            onCancel={() => setPendingAction(null)}
            onOk={() => void confirmAction()}
            okButtonProps={{
              loading: pendingAction ? loadingAction === pendingAction : false,
            }}
          >
            <Form form={actionForm} layout="vertical">
              <Form.Item name="trackingNumber" label="Mã vận đơn">
                <Input placeholder="Nhập mã vận đơn (nếu có)" maxLength={100} />
              </Form.Item>
              {pendingAction === "deliver" ? (
                <Form.Item name="actualDeliveryDate" label="Ngày giao thực tế">
                  <DatePicker className="w-full" format="DD/MM/YYYY" />
                </Form.Item>
              ) : null}
              <Form.Item name="note" label="Ghi chú">
                <Input.TextArea rows={3} maxLength={500} />
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            open={cancelOpen}
            title="Xác nhận hủy đơn bán"
            okText="Xác nhận hủy"
            cancelText="Đóng"
            onCancel={() => setCancelOpen(false)}
            onOk={() => void confirmCancel()}
            okButtonProps={{
              danger: true,
              loading: loadingAction === "cancel",
            }}
          >
            <Form form={cancelForm} layout="vertical">
              <Form.Item
                name="cancellationReason"
                label="Lý do hủy"
                rules={[
                  { required: true, message: "Vui lòng chọn lý do hủy." },
                ]}
              >
                <Select
                  options={SALE_ORDER_CANCELLATION_REASON_OPTIONS}
                  placeholder="Chọn lý do hủy"
                />
              </Form.Item>
              <Form.Item name="comment" label="Ghi chú">
                <Input.TextArea rows={3} maxLength={1000} />
              </Form.Item>
            </Form>
          </Modal>

          <Modal
            open={invoiceOpen}
            title="Tạo hóa đơn từ đơn bán"
            okText="Tạo hóa đơn"
            cancelText="Đóng"
            onCancel={() => setInvoiceOpen(false)}
            onOk={() => void confirmCreateInvoice()}
            okButtonProps={{ loading: loadingAction === "invoice" }}
          >
            <Form form={invoiceForm} layout="vertical">
              <Form.Item name="issueDate" label="Ngày xuất hóa đơn">
                <DatePicker className="w-full" format="DD/MM/YYYY" />
              </Form.Item>
              <Form.Item
                name="dueDate"
                label="Hạn thanh toán"
                rules={[
                  { required: true, message: "Vui lòng chọn hạn thanh toán." },
                ]}
              >
                <DatePicker className="w-full" format="DD/MM/YYYY" />
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
                <Input.TextArea rows={2} maxLength={500} />
              </Form.Item>
              <Form.Item name="paymentTerms" label="Điều khoản thanh toán">
                <Input maxLength={255} />
              </Form.Item>
              <Form.Item name="note" label="Ghi chú">
                <Input.TextArea rows={2} maxLength={1000} />
              </Form.Item>
            </Form>
          </Modal>
        </Space>
      }
    />
  );
};

export default SaleOrderDetailPage;
