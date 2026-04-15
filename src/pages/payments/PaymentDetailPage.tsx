import { Alert, Button, Card, Descriptions, Empty, Result, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { PaymentModel } from "../../models/payment/payment.model";
import { paymentService } from "../../services/payment/payment.service";
import { getErrorMessage, toCurrency } from "../shared/page.utils";
import InvoiceStatusTag from "../invoices/components/InvoiceStatusTag";
import { formatPaymentDate, formatPaymentDateTime, getPaymentMethodLabel } from "./payment.ui";

const PaymentDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { notify } = useNotify();

  const [payment, setPayment] = useState<PaymentModel | null>(null);
  const [loading, setLoading] = useState(() => Boolean(id));
  const [detailError, setDetailError] = useState<string | null>(null);

  useEffect(() => {
    const loadDetail = async () => {
      if (!id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setPayment(null);
        setDetailError(null);
        const response = await paymentService.getDetail(id);
        setPayment(response);
      } catch (error) {
        const message = getErrorMessage(error, "Không thể tải chi tiết thanh toán.");
        setDetailError(message);
        notify(message, "error");
      } finally {
        setLoading(false);
      }
    };

    void loadDetail();
  }, [id, notify]);

  const allocationColumns = useMemo<ColumnsType<PaymentModel["allocations"][number]>>(
    () => [
      {
        title: "Số hóa đơn",
        key: "invoiceNumber",
        render: (_, row) => row.invoiceNumber || "Chưa cập nhật",
      },
      {
        title: "Trạng thái hóa đơn",
        dataIndex: "invoiceStatus",
        key: "invoiceStatus",
        render: (value?: string) => (value ? <InvoiceStatusTag status={value} compact /> : "Chưa cập nhật"),
      },
      {
        title: "Còn phải thu",
        dataIndex: "invoiceRemainingAmount",
        key: "invoiceRemainingAmount",
        align: "right",
        render: (value?: number) => (value != null ? toCurrency(value) : "-"),
      },
      {
        title: "Số tiền phân bổ",
        dataIndex: "allocatedAmount",
        key: "allocatedAmount",
        align: "right",
        render: (value: number) => <Typography.Text strong>{toCurrency(value)}</Typography.Text>,
      },
      {
        title: "Thao tác",
        key: "action",
        render: (_, row) =>
          row.invoiceId ? (
            <Button type="link" onClick={() => navigate(ROUTE_URL.INVOICE_DETAIL.replace(":id", row.invoiceId))}>
              Mở hóa đơn
            </Button>
          ) : (
            "-"
          ),
      },
    ],
    [navigate],
  );

  const totalAllocated = useMemo(
    () => payment?.allocations.reduce((sum, allocation) => sum + (allocation.allocatedAmount ?? 0), 0) ?? 0,
    [payment],
  );

  return (
    <NoResizeScreenTemplate
      loading={Boolean(id) && loading && !payment && !detailError}
      loadingText="Đang tải chi tiết thanh toán..."
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title={payment?.receiptNumber ? `Chi tiết thanh toán ${payment.receiptNumber}` : "Chi tiết thanh toán"}
          subtitle="Theo dõi phiếu thu và các hóa đơn được phân bổ thanh toán."
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Thanh toán", url: ROUTE_URL.PAYMENT_LIST },
                { label: "Chi tiết" },
              ]}
            />
          }
          actions={
            <Space wrap>
              <Button onClick={() => navigate(ROUTE_URL.PAYMENT_LIST)}>Quay lại</Button>
              <Button type="primary" onClick={() => navigate(ROUTE_URL.PAYMENT_RECORD)}>
                Ghi nhận thanh toán mới
              </Button>
            </Space>
          }
        />
      }
      body={
        !id ? (
          <Result
            status="warning"
            title="Không tìm thấy mã thanh toán"
            subTitle="Đường dẫn hiện tại không chứa mã thanh toán hợp lệ."
            extra={
              <Button type="primary" onClick={() => navigate(ROUTE_URL.PAYMENT_LIST)}>
                Về trang thanh toán
              </Button>
            }
          />
        ) : (
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            {detailError ? (
              <Alert type="error" showIcon message="Không thể tải chi tiết thanh toán." description={detailError} />
            ) : null}

            {!loading && !payment ? (
              <Card>
                <Empty description="Không có dữ liệu thanh toán để hiển thị." />
              </Card>
            ) : null}

            {payment ? (
              <>
                <Card title="Thông tin phiếu thu">
                  <Descriptions column={{ xs: 1, md: 2, lg: 3 }} size="small" colon={false}>
                    <Descriptions.Item label="Số phiếu thu">{payment.receiptNumber || "Chưa cập nhật"}</Descriptions.Item>
                    <Descriptions.Item label="Khách hàng">{payment.customerName || "Chưa cập nhật"}</Descriptions.Item>
                    <Descriptions.Item label="Mã khách hàng">{payment.customerCode || "Chưa cập nhật"}</Descriptions.Item>
                    <Descriptions.Item label="Phương thức">{getPaymentMethodLabel(payment.paymentMethod)}</Descriptions.Item>
                    <Descriptions.Item label="Số tiền">{toCurrency(payment.amount)}</Descriptions.Item>
                    <Descriptions.Item label="Ngày thanh toán">{formatPaymentDate(payment.paymentDate)}</Descriptions.Item>
                    <Descriptions.Item label="Thời gian tạo">{formatPaymentDateTime(payment.createdAt)}</Descriptions.Item>
                    <Descriptions.Item label="Số tham chiếu">{payment.referenceNo || "Không có"}</Descriptions.Item>
                    <Descriptions.Item label="Ghi chú" span={2}>
                      {payment.note || "Không có ghi chú"}
                    </Descriptions.Item>
                  </Descriptions>
                </Card>

                <Card
                  title="Phân bổ vào hóa đơn"
                  extra={
                    <Typography.Text type="secondary">
                      Tổng phân bổ: <Typography.Text strong>{toCurrency(totalAllocated)}</Typography.Text>
                    </Typography.Text>
                  }
                >
                  <Table
                    rowKey={(row) => `${row.invoiceId}-${row.invoiceNumber ?? ""}`}
                    columns={allocationColumns}
                    dataSource={payment.allocations}
                    pagination={false}
                    scroll={{ x: 900 }}
                    locale={{
                      emptyText: (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description="Khoản thanh toán này chưa có dữ liệu phân bổ."
                        />
                      ),
                    }}
                  />
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
