import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Alert, Breadcrumb, Button, Card, Descriptions, Result, Skeleton, Space, Typography } from "antd";
import { Form } from "antd";
import dayjs from "dayjs";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { InvoiceModel } from "../../models/payment/payment.model";
import { paymentService } from "../../services/payment/payment.service";
import { getErrorMessage } from "../shared/page.utils";
import InvoiceAmountSummary from "./components/InvoiceAmountSummary";
import RecordPaymentForm, { type RecordPaymentFormValues } from "./components/RecordPaymentForm";
import { formatPaymentDate } from "./payment.ui";

const RecordPaymentPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { notify } = useNotify();
  const [form] = Form.useForm<RecordPaymentFormValues>();

  const [invoice, setInvoice] = useState<InvoiceModel | null>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadInvoice = async () => {
      if (!id) {
        return;
      }

      try {
        setLoadingInvoice(true);
        setErrorMessage(null);
        const detail = await paymentService.getInvoiceDetail(id);
        setInvoice(detail);
        form.setFieldsValue({
          paidAt: dayjs(),
          method: "BANK_TRANSFER",
        });
      } catch (error) {
        const message = getErrorMessage(error, "Không thể tải thông tin hóa đơn.");
        setErrorMessage(message);
        notify(message, "error");
      } finally {
        setLoadingInvoice(false);
      }
    };

    void loadInvoice();
  }, [form, id, notify]);

  const handleSubmit = async (values: RecordPaymentFormValues) => {
    if (!id) {
      return;
    }

    try {
      setSaving(true);
      await paymentService.recordPayment(id, {
        amount: Number(values.amount),
        paidAt: values.paidAt.format("YYYY-MM-DD"),
        method: values.method,
        note: values.note?.trim() || undefined,
      });

      notify("Đã ghi nhận thanh toán thành công.", "success");
      navigate(ROUTE_URL.PAYMENT_DETAIL.replace(":id", id));
    } catch (error) {
      notify(getErrorMessage(error, "Không thể ghi nhận thanh toán."), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title={invoice ? `Ghi nhận thanh toán cho hóa đơn ${invoice.id}` : "Ghi nhận thanh toán"}
          subtitle="Xác nhận khoản thu thực tế để hệ thống cập nhật công nợ và trạng thái hóa đơn chính xác."
          breadcrumb={
            <Breadcrumb
              items={[
                { title: "Trang chủ" },
                { title: <span onClick={() => navigate(ROUTE_URL.PAYMENT_LIST)}>Thanh toán</span> },
                {
                  title: id ? (
                    <span onClick={() => navigate(ROUTE_URL.PAYMENT_DETAIL.replace(":id", id))}>Chi tiết hóa đơn</span>
                  ) : (
                    "Chi tiết hóa đơn"
                  ),
                },
                { title: "Ghi nhận thanh toán" },
              ]}
            />
          }
        />
      }
      body={
        !id ? (
          <Result
            status="warning"
            title="Không tìm thấy mã hóa đơn"
            subTitle="Đường dẫn hiện tại không có mã hóa đơn hợp lệ. Vui lòng quay lại danh sách hóa đơn."
            extra={
              <Button type="primary" onClick={() => navigate(ROUTE_URL.PAYMENT_LIST)}>
                Về danh sách thanh toán
              </Button>
            }
          />
        ) : (
          <Space orientation="vertical" size={16} style={{ width: "100%" }}>
            {errorMessage ? <Alert type="error" showIcon message="Không thể tải dữ liệu hóa đơn." description={errorMessage} /> : null}

            {loadingInvoice ? (
              <Card>
                <Skeleton active paragraph={{ rows: 8 }} />
              </Card>
            ) : null}

            {!loadingInvoice && invoice ? (
              <RecordPaymentForm
                form={form}
                submitting={saving}
                onSubmit={(values) => void handleSubmit(values)}
                onBack={() => navigate(ROUTE_URL.PAYMENT_DETAIL.replace(":id", id))}
                maxAmount={invoice.dueAmount}
                summaryCard={
                  <Space orientation="vertical" size={16} style={{ width: "100%" }}>
                    <Card title="Thông tin hóa đơn liên quan">
                      <Descriptions column={1} size="small" colon={false}>
                        <Descriptions.Item label="Mã hóa đơn">{invoice.id}</Descriptions.Item>
                        <Descriptions.Item label="Mã hợp đồng">{invoice.contractId || "Chưa liên kết"}</Descriptions.Item>
                        <Descriptions.Item label="Khách hàng">{invoice.customerId || "Chưa cập nhật"}</Descriptions.Item>
                        <Descriptions.Item label="Hạn thanh toán">{formatPaymentDate(invoice.dueDate, "Chưa xác định")}</Descriptions.Item>
                      </Descriptions>
                    </Card>
                    <InvoiceAmountSummary totalAmount={invoice.totalAmount} paidAmount={invoice.paidAmount} dueAmount={invoice.dueAmount} />
                  </Space>
                }
              />
            ) : null}

            {!loadingInvoice && !invoice && !errorMessage ? (
              <Card>
                <Typography.Text type="secondary">Không tìm thấy dữ liệu hóa đơn để ghi nhận thanh toán.</Typography.Text>
              </Card>
            ) : null}
          </Space>
        )
      }
    />
  );
};

export default RecordPaymentPage;
