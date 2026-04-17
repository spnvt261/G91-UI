import { ArrowLeftOutlined, CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Col, Descriptions, Empty, Form, Input, InputNumber, Result, Row, Space, Timeline, Typography } from "antd";
import type { FormInstance } from "antd/es/form";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { canPerformAction, hasPermission } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { PaymentConfirmationRequestDetailModel } from "../../models/payment-confirmation/payment-confirmation.model";
import { paymentConfirmationService } from "../../services/payment-confirmation/payment-confirmation.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage, getFieldErrorMap } from "../shared/page.utils";
import InvoiceStatusTag from "../invoices/components/InvoiceStatusTag";
import PaymentConfirmationStatusTag from "./components/PaymentConfirmationStatusTag";
import { emitPaymentConfirmationChanged, PAYMENT_CONFIRMATION_CHANGED_EVENT } from "./paymentConfirmation.events";
import { formatPaymentConfirmationAmountWithCurrency, formatPaymentConfirmationDateTime } from "./paymentConfirmation.ui";

type ConfirmFormValues = {
  confirmedAmount: number;
  reviewNote?: string;
};

type RejectFormValues = {
  reason: string;
};

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

const PaymentConfirmationDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const role = getStoredUserRole();
  const { notify } = useNotify();
  const [confirmForm] = Form.useForm<ConfirmFormValues>();
  const [rejectForm] = Form.useForm<RejectFormValues>();

  const canReview = hasPermission(role, "payment-confirmation.review");
  const canOpenPaymentDetail = canPerformAction(role, "payment.record");

  const [request, setRequest] = useState<PaymentConfirmationRequestDetailModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<"confirm" | "reject" | null>(null);

  const loadDetail = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      setDetailError(null);
      const response = await paymentConfirmationService.getDetail(id);
      setRequest(response);
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải chi tiết yêu cầu xác nhận thanh toán.");
      setDetailError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [id, notify]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  useEffect(() => {
    const handleChanged = (event: Event) => {
      const detail = (event as CustomEvent<{ requestId?: string }>).detail;
      if (!id || !detail?.requestId || detail.requestId === id) {
        void loadDetail();
      }
    };

    window.addEventListener(PAYMENT_CONFIRMATION_CHANGED_EVENT, handleChanged);
    return () => window.removeEventListener(PAYMENT_CONFIRMATION_CHANGED_EVENT, handleChanged);
  }, [id, loadDetail]);

  useEffect(() => {
    if (request?.status === "PENDING_REVIEW") {
      confirmForm.setFieldsValue({
        confirmedAmount: request.invoiceOutstandingAmount,
        reviewNote: request.reviewNote ?? undefined,
      });
    }
  }, [confirmForm, request]);

  const backTarget = useMemo(() => {
    if (canReview) {
      return ROUTE_URL.PAYMENT_CONFIRMATION_LIST;
    }

    if (request?.invoiceId) {
      return ROUTE_URL.INVOICE_DETAIL.replace(":id", request.invoiceId);
    }

    return ROUTE_URL.INVOICE_LIST;
  }, [canReview, request?.invoiceId]);

  const reviewDisabled = request?.status !== "PENDING_REVIEW";

  const refreshBeforeReview = async () => {
    if (!id) {
      return null;
    }

    const latest = await paymentConfirmationService.getDetail(id);
    setRequest(latest);
    return latest;
  };

  const handleConfirm = async () => {
    if (!id) {
      return;
    }

    try {
      const values = await confirmForm.validateFields();
      setActionLoading("confirm");
      const latest = await refreshBeforeReview();

      if (!latest) {
        return;
      }

      if (latest.status !== "PENDING_REVIEW") {
        notify("Request không còn ở trạng thái chờ duyệt.", "warning");
        return;
      }

      if (values.confirmedAmount > latest.invoiceOutstandingAmount) {
        confirmForm.setFields([{ name: "confirmedAmount", errors: ["Số tiền xác nhận vượt outstanding amount hiện tại của hóa đơn."] }]);
        return;
      }

      await paymentConfirmationService.confirm(id, {
        confirmedAmount: Number(values.confirmedAmount),
        reviewNote: values.reviewNote?.trim() || undefined,
      });

      confirmForm.resetFields();
      notify("Xác nhận request thành công.", "success");
      emitPaymentConfirmationChanged({ invoiceId: latest.invoiceId, requestId: latest.id });
      await loadDetail();
    } catch (error) {
      if (typeof error === "object" && error !== null && "errorFields" in error) {
        return;
      }

      applyFieldErrors(confirmForm, error);
      notify(getErrorMessage(error, "Không thể xác nhận request."), "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!id) {
      return;
    }

    try {
      const values = await rejectForm.validateFields();
      setActionLoading("reject");
      const latest = await refreshBeforeReview();

      if (!latest) {
        return;
      }

      if (latest.status !== "PENDING_REVIEW") {
        notify("Request không còn ở trạng thái chờ duyệt.", "warning");
        return;
      }

      await paymentConfirmationService.reject(id, {
        reason: values.reason.trim(),
      });

      rejectForm.resetFields();
      notify("Từ chối request thành công.", "success");
      emitPaymentConfirmationChanged({ invoiceId: latest.invoiceId, requestId: latest.id });
      await loadDetail();
    } catch (error) {
      if (typeof error === "object" && error !== null && "errorFields" in error) {
        return;
      }

      applyFieldErrors(rejectForm, error);
      notify(getErrorMessage(error, "Không thể từ chối request."), "error");
    } finally {
      setActionLoading(null);
    }
  };

  const timelineItems = useMemo(() => {
    if (!request) {
      return [];
    }

    const items = [
      {
        color: "blue",
        children: (
          <Space direction="vertical" size={2}>
            <Typography.Text strong>Created</Typography.Text>
            <Typography.Text type="secondary">{formatPaymentConfirmationDateTime(request.createdAt)}</Typography.Text>
          </Space>
        ),
      },
      {
        color: request.status === "PENDING_REVIEW" ? "blue" : "gray",
        children: (
          <Space direction="vertical" size={2}>
            <Typography.Text strong>Pending review</Typography.Text>
            <Typography.Text type="secondary">{request.status === "PENDING_REVIEW" ? "Đang chờ reviewer xử lý" : "Đã rời trạng thái pending"}</Typography.Text>
          </Space>
        ),
      },
      request.status === "CONFIRMED"
        ? {
            color: "green",
            children: (
              <Space direction="vertical" size={2}>
                <Typography.Text strong>Confirmed</Typography.Text>
                <Typography.Text type="secondary">{formatPaymentConfirmationDateTime(request.reviewedAt)}</Typography.Text>
              </Space>
            ),
          }
        : null,
      request.status === "REJECTED"
        ? {
            color: "red",
            children: (
              <Space direction="vertical" size={2}>
                <Typography.Text strong>Rejected</Typography.Text>
                <Typography.Text type="secondary">{formatPaymentConfirmationDateTime(request.reviewedAt)}</Typography.Text>
              </Space>
            ),
          }
        : null,
    ];

    return items.filter((item): item is NonNullable<(typeof items)[number]> => item !== null);
  }, [request]);

  return (
    <NoResizeScreenTemplate
      loading={Boolean(id) && loading && !request && !detailError}
      loadingText="Đang tải chi tiết yêu cầu xác nhận thanh toán..."
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title={request?.invoiceNumber ? `Yêu cầu xác nhận ${request.invoiceNumber}` : "Chi tiết yêu cầu xác nhận thanh toán"}
          subtitle="Theo dõi thông tin request, trạng thái review và toàn bộ dữ liệu hóa đơn mới nhất mà backend trả về."
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                canReview ? { label: "Xác nhận chuyển khoản", url: ROUTE_URL.PAYMENT_CONFIRMATION_LIST } : { label: "Hóa đơn", url: ROUTE_URL.INVOICE_LIST },
                { label: "Chi tiết request" },
              ]}
            />
          }
          actions={
            <Space wrap>
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(backTarget)}>
                Quay lại
              </Button>
              <Button icon={<ReloadOutlined />} onClick={() => void loadDetail()} loading={loading}>
                Làm mới
              </Button>
              {request?.invoiceId ? (
                <Button onClick={() => navigate(ROUTE_URL.INVOICE_DETAIL.replace(":id", request.invoiceId))}>Mở hóa đơn</Button>
              ) : null}
              {canOpenPaymentDetail && request?.paymentId ? (
                <Button type="primary" onClick={() => navigate(ROUTE_URL.PAYMENT_DETAIL.replace(":id", request.paymentId ?? ""))}>
                  Mở payment
                </Button>
              ) : null}
            </Space>
          }
        />
      }
      body={
        !id ? (
          <Result
            status="warning"
            title="Không tìm thấy mã request"
            subTitle="Đường dẫn hiện tại không chứa request id hợp lệ."
            extra={
              <Button type="primary" onClick={() => navigate(backTarget)}>
                Quay lại
              </Button>
            }
          />
        ) : (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            {detailError ? <Alert type="error" showIcon message="Không thể tải chi tiết request." description={detailError} /> : null}

            {!loading && !request ? (
              <Card>
                <Empty description="Không có dữ liệu request để hiển thị." />
              </Card>
            ) : null}

            {request ? (
              <>
                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={12}>
                    <Card title="Request summary">
                      <Descriptions column={1} size="small" colon={false}>
                        <Descriptions.Item label="Request id">{request.id}</Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                          <PaymentConfirmationStatusTag status={request.status} />
                        </Descriptions.Item>
                        <Descriptions.Item label="Invoice number">{request.invoiceNumber || request.invoiceId}</Descriptions.Item>
                        <Descriptions.Item label="Customer">{request.customerName || "Chưa cập nhật"}</Descriptions.Item>
                        <Descriptions.Item label="Requested amount">{formatPaymentConfirmationAmountWithCurrency(request.requestedAmount)}</Descriptions.Item>
                        <Descriptions.Item label="Confirmed amount">{formatPaymentConfirmationAmountWithCurrency(request.confirmedAmount, "-")}</Descriptions.Item>
                        <Descriptions.Item label="Payment id">{request.paymentId || "-"}</Descriptions.Item>
                        <Descriptions.Item label="Created by">{request.createdBy || "-"}</Descriptions.Item>
                        <Descriptions.Item label="Reviewed by">{request.reviewedBy || "-"}</Descriptions.Item>
                        <Descriptions.Item label="Reviewed at">{formatPaymentConfirmationDateTime(request.reviewedAt, "-")}</Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Card title="Invoice summary hiện tại">
                      <Descriptions column={1} size="small" colon={false}>
                        <Descriptions.Item label="Invoice status">
                          {request.invoiceStatus ? <InvoiceStatusTag status={request.invoiceStatus} /> : "-"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Grand total">{formatPaymentConfirmationAmountWithCurrency(request.invoiceGrandTotal)}</Descriptions.Item>
                        <Descriptions.Item label="Paid amount">{formatPaymentConfirmationAmountWithCurrency(request.invoicePaidAmount)}</Descriptions.Item>
                        <Descriptions.Item label="Outstanding amount">
                          <Typography.Text strong>{formatPaymentConfirmationAmountWithCurrency(request.invoiceOutstandingAmount)}</Typography.Text>
                        </Descriptions.Item>
                        <Descriptions.Item label="Last sync">{formatPaymentConfirmationDateTime(request.updatedAt ?? request.createdAt)}</Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                </Row>

                <Card title="Transfer information">
                  <Descriptions column={{ xs: 1, md: 2 }} size="small" colon={false}>
                    <Descriptions.Item label="Transfer time">{formatPaymentConfirmationDateTime(request.transferTime)}</Descriptions.Item>
                    <Descriptions.Item label="Reference code">{request.referenceCode || "-"}</Descriptions.Item>
                    <Descriptions.Item label="Sender bank">{request.senderBankName || "-"}</Descriptions.Item>
                    <Descriptions.Item label="Sender account name">{request.senderAccountName || "-"}</Descriptions.Item>
                    <Descriptions.Item label="Sender account no">{request.senderAccountNo || "-"}</Descriptions.Item>
                    <Descriptions.Item label="Proof URL">
                      {request.proofDocumentUrl ? (
                        <Typography.Link href={request.proofDocumentUrl} target="_blank" rel="noreferrer">
                          {request.proofDocumentUrl}
                        </Typography.Link>
                      ) : (
                        "Chưa cung cấp"
                      )}
                    </Descriptions.Item>
                    <Descriptions.Item label="Customer note" span={2}>
                      {request.note || "Không có ghi chú"}
                    </Descriptions.Item>
                    <Descriptions.Item label="Review note" span={2}>
                      {request.reviewNote || "Chưa có ghi chú review"}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                <Card title="Timeline">
                  <Timeline items={timelineItems} />
                </Card>

                {canReview ? (
                  <Card title="Review action panel">
                    <Space direction="vertical" size={16} style={{ width: "100%" }}>
                      <Alert
                        type={reviewDisabled ? "warning" : "info"}
                        showIcon
                        message={
                          reviewDisabled
                            ? "Request không còn ở trạng thái PENDING_REVIEW. Các action đã bị khóa."
                            : `Outstanding amount hiện tại: ${formatPaymentConfirmationAmountWithCurrency(request.invoiceOutstandingAmount)}`
                        }
                        description={!reviewDisabled ? "Frontend sẽ reload request detail ngay trước khi submit để tránh chênh lệch outstanding amount." : undefined}
                      />

                      <Row gutter={[16, 16]}>
                        <Col xs={24} xl={12}>
                          <Card size="small" title="Confirm request">
                            <Form<ConfirmFormValues> form={confirmForm} layout="vertical" disabled={reviewDisabled || actionLoading !== null}>
                              <Form.Item
                                name="confirmedAmount"
                                label="Confirmed amount"
                                rules={[
                                  { required: true, message: "Vui lòng nhập số tiền xác nhận." },
                                  {
                                    validator: (_, value) => {
                                      const amount = Number(value ?? 0);
                                      if (amount <= 0) {
                                        return Promise.reject(new Error("Số tiền xác nhận phải lớn hơn 0."));
                                      }

                                      if (!hasMaxTwoDecimals(amount)) {
                                        return Promise.reject(new Error("Số tiền xác nhận chỉ được tối đa 2 chữ số thập phân."));
                                      }

                                      if (request && amount > request.invoiceOutstandingAmount) {
                                        return Promise.reject(new Error("Số tiền xác nhận vượt outstanding amount hiện tại."));
                                      }

                                      return Promise.resolve();
                                    },
                                  },
                                ]}
                              >
                                <InputNumber className="w-full" min={0.01} precision={2} step={0.01} addonAfter="VND" />
                              </Form.Item>
                              <Form.Item name="reviewNote" label="Review note" rules={[{ max: 1000, message: "Review note tối đa 1000 ký tự." }]}>
                                <Input.TextArea rows={4} maxLength={1000} showCount />
                              </Form.Item>
                              <Button
                                type="primary"
                                icon={<CheckCircleOutlined />}
                                loading={actionLoading === "confirm"}
                                onClick={() => void handleConfirm()}
                                disabled={reviewDisabled}
                              >
                                Confirm
                              </Button>
                            </Form>
                          </Card>
                        </Col>
                        <Col xs={24} xl={12}>
                          <Card size="small" title="Reject request">
                            <Form<RejectFormValues> form={rejectForm} layout="vertical" disabled={reviewDisabled || actionLoading !== null}>
                              <Form.Item
                                name="reason"
                                label="Reason"
                                rules={[
                                  { required: true, message: "Vui lòng nhập lý do từ chối." },
                                  { max: 1000, message: "Lý do từ chối tối đa 1000 ký tự." },
                                ]}
                              >
                                <Input.TextArea rows={6} maxLength={1000} showCount />
                              </Form.Item>
                              <Button
                                danger
                                icon={<CloseCircleOutlined />}
                                loading={actionLoading === "reject"}
                                onClick={() => void handleReject()}
                                disabled={reviewDisabled}
                              >
                                Reject
                              </Button>
                            </Form>
                          </Card>
                        </Col>
                      </Row>
                    </Space>
                  </Card>
                ) : null}
              </>
            ) : null}
          </Space>
        )
      }
    />
  );
};

export default PaymentConfirmationDetailPage;
