import { MoreOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Alert,
  Breadcrumb,
  Button,
  Card,
  Col,
  Descriptions,
  Dropdown,
  Empty,
  Result,
  Row,
  Skeleton,
  Space,
  Statistic,
  Typography,
} from "antd";
import type { MenuProps } from "antd";
import dayjs from "dayjs";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { canPerformAction } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { InvoiceModel } from "../../models/payment/payment.model";
import { paymentService } from "../../services/payment/payment.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage } from "../shared/page.utils";
import InvoiceAmountSummary from "./components/InvoiceAmountSummary";
import PaymentStatusTag from "./components/PaymentStatusTag";
import { formatPaymentDate, getInvoiceDisplayStatus } from "./payment.ui";

const PaymentDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const role = getStoredUserRole();
  const { notify } = useNotify();

  const canRecordPayment = canPerformAction(role, "payment.record");
  const canUpdateInvoice = canPerformAction(role, "invoice.update");
  const canCancelInvoice = canPerformAction(role, "invoice.cancel");
  const canSendReminder = canPerformAction(role, "payment.reminder.send");
  const canConfirmSettlement = canPerformAction(role, "debt.settlement.confirm");

  const [invoice, setInvoice] = useState<InvoiceModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      try {
        setLoading(true);
        setErrorMessage(null);
        const detail = await paymentService.getInvoiceDetail(id);
        setInvoice(detail);
      } catch (err) {
        const message = getErrorMessage(err, "Không thể tải chi tiết hóa đơn.");
        setErrorMessage(message);
        notify(message, "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id, notify]);

  const extraActions = useMemo<NonNullable<MenuProps["items"]>>(() => {
    const actions: NonNullable<MenuProps["items"]> = [];

    if (canUpdateInvoice) {
      actions.push({
        key: "update",
        disabled: true,
        label: "Cập nhật hóa đơn (Chưa hỗ trợ)",
      });
    }
    if (canCancelInvoice) {
      actions.push({
        key: "cancel",
        disabled: true,
        danger: true,
        label: "Hủy hóa đơn (Chưa hỗ trợ)",
      });
    }
    if (canSendReminder) {
      actions.push({
        key: "reminder",
        disabled: true,
        label: "Gửi nhắc thanh toán (Chưa hỗ trợ)",
      });
    }
    if (canConfirmSettlement) {
      actions.push({
        key: "settlement",
        disabled: true,
        label: "Xác nhận tất toán (Chưa hỗ trợ)",
      });
    }

    return actions;
  }, [canCancelInvoice, canConfirmSettlement, canSendReminder, canUpdateInvoice]);

  const displayStatus = invoice ? getInvoiceDisplayStatus(invoice) : undefined;
  const displayStatusLabel =
    displayStatus === "OVERDUE"
      ? "Quá hạn"
      : displayStatus === "DUE_SOON"
        ? "Sắp đến hạn"
        : displayStatus === "PARTIAL"
          ? "Thanh toán một phần"
          : displayStatus === "PAID"
            ? "Đã thanh toán"
            : "Chờ thanh toán";
  const daysUntilDue = useMemo(() => {
    if (!invoice?.dueDate) {
      return null;
    }

    const due = dayjs(invoice.dueDate).startOf("day");
    if (!due.isValid()) {
      return null;
    }

    return due.diff(dayjs().startOf("day"), "day");
  }, [invoice?.dueDate]);

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title={invoice ? `Theo dõi hóa đơn ${invoice.id}` : "Chi tiết hóa đơn"}
          subtitle="Xem nhanh trạng thái thu tiền, hạn thanh toán và thông tin liên quan để đưa ra quyết định xử lý công nợ."
          breadcrumb={
            <Breadcrumb
              items={[
                { title: "Trang chủ" },
                { title: <span onClick={() => navigate(ROUTE_URL.PAYMENT_LIST)}>Thanh toán</span> },
                { title: "Chi tiết hóa đơn" },
              ]}
            />
          }
          meta={
            invoice ? (
              <Space size={16} wrap>
                <Typography.Text type="secondary">Mã hóa đơn: {invoice.id}</Typography.Text>
                <PaymentStatusTag status={invoice.status} dueDate={invoice.dueDate} dueAmount={invoice.dueAmount} />
              </Space>
            ) : null
          }
          actions={
            <Space wrap>
              <Button onClick={() => navigate(ROUTE_URL.PAYMENT_LIST)}>Quay lại danh sách</Button>
              {canRecordPayment && invoice?.dueAmount ? (
                <Button type="primary" onClick={() => navigate(ROUTE_URL.PAYMENT_RECORD.replace(":id", invoice.id))}>
                  Ghi nhận thanh toán
                </Button>
              ) : null}
              {extraActions.length > 0 ? (
                <Dropdown menu={{ items: extraActions }} trigger={["click"]}>
                  <Button icon={<MoreOutlined />}>Thao tác khác</Button>
                </Dropdown>
              ) : null}
            </Space>
          }
        />
      }
      body={
        !id ? (
          <Result
            status="warning"
            title="Không tìm thấy mã hóa đơn"
            subTitle="Đường dẫn hiện tại chưa có mã hóa đơn hợp lệ. Vui lòng quay lại danh sách và chọn hóa đơn cần theo dõi."
            extra={
              <Button type="primary" onClick={() => navigate(ROUTE_URL.PAYMENT_LIST)}>
                Về danh sách thanh toán
              </Button>
            }
          />
        ) : (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            {errorMessage ? <Alert type="error" showIcon message="Không thể tải chi tiết hóa đơn." description={errorMessage} /> : null}

            {loading ? (
              <Card>
                <Skeleton active paragraph={{ rows: 10 }} />
              </Card>
            ) : null}

            {!loading && !invoice ? (
              <Card>
                <Empty description="Không có dữ liệu hóa đơn để hiển thị." />
              </Card>
            ) : null}

            {!loading && invoice ? (
              <>
                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={12}>
                    <Card title="Tổng quan hóa đơn">
                      <Descriptions column={1} size="small" colon={false}>
                        <Descriptions.Item label="Mã hóa đơn">{invoice.id}</Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                          <PaymentStatusTag status={invoice.status} dueDate={invoice.dueDate} dueAmount={invoice.dueAmount} />
                        </Descriptions.Item>
                        <Descriptions.Item label="Hạn thanh toán">{formatPaymentDate(invoice.dueDate, "Chưa xác định")}</Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Card title="Thông tin hợp đồng và khách hàng">
                      <Descriptions column={1} size="small" colon={false}>
                        <Descriptions.Item label="Mã hợp đồng">{invoice.contractId || "Chưa liên kết"}</Descriptions.Item>
                        <Descriptions.Item label="Khách hàng">{invoice.customerId || "Chưa cập nhật"}</Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                </Row>

                <InvoiceAmountSummary totalAmount={invoice.totalAmount} paidAmount={invoice.paidAmount} dueAmount={invoice.dueAmount} />

                <Card title="Hạn thanh toán và trạng thái">
                  <Row gutter={[16, 16]}>
                    <Col xs={24} md={8}>
                      <Statistic title="Hạn thanh toán" value={formatPaymentDate(invoice.dueDate, "Chưa xác định")} />
                    </Col>
                    <Col xs={24} md={8}>
                      <Statistic title="Trạng thái hiện tại" value={displayStatusLabel} />
                    </Col>
                    <Col xs={24} md={8}>
                      <Statistic
                        title="Số ngày đến hạn"
                        value={
                          daysUntilDue == null
                            ? "Chưa xác định"
                            : daysUntilDue < 0
                              ? `${Math.abs(daysUntilDue)} ngày quá hạn`
                              : `${daysUntilDue} ngày`
                        }
                        valueStyle={{
                          color: daysUntilDue == null ? undefined : daysUntilDue < 0 ? "#dc2626" : daysUntilDue <= 3 ? "#d97706" : "#16a34a",
                        }}
                      />
                    </Col>
                  </Row>

                  {displayStatus === "OVERDUE" ? (
                    <Alert
                      showIcon
                      type="error"
                      style={{ marginTop: 16 }}
                      message="Hóa đơn đã quá hạn thanh toán."
                      description="Nên ưu tiên thực hiện đối soát và ghi nhận thanh toán hoặc gửi nhắc thanh toán để giảm rủi ro công nợ."
                    />
                  ) : null}
                </Card>
              </>
            ) : null}
          </Space>
        )
      }
    />
  );
};

export default PaymentDetailPage;
