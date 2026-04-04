import { ArrowLeftOutlined, EditOutlined, ExclamationCircleOutlined, FileTextOutlined, StopOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Col, Descriptions, Empty, Input, Modal, Row, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { canPerformAction } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { InvoiceModel } from "../../models/invoice/invoice.model";
import { invoiceService } from "../../services/invoice/invoice.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage, toCurrency } from "../shared/page.utils";
import InvoiceStatusTag from "./components/InvoiceStatusTag";
import { formatInvoiceDate, formatInvoiceDateTime, resolveInvoiceNumber } from "./invoice.ui";

const InvoiceDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const role = getStoredUserRole();
  const { notify } = useNotify();

  const canUpdateInvoice = canPerformAction(role, "invoice.update");
  const canCancelInvoice = canPerformAction(role, "invoice.cancel");
  const canRecordPayment = canPerformAction(role, "payment.record");

  const [invoice, setInvoice] = useState<InvoiceModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [canceling, setCanceling] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");

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

  const itemColumns = useMemo<ColumnsType<InvoiceModel["items"][number]>>(
    () => [
      {
        title: "Mặt hàng",
        key: "description",
        render: (_, item) => (
          <Space direction="vertical" size={1}>
            <Typography.Text strong>{item.description || "Chưa có mô tả"}</Typography.Text>
            <Typography.Text type="secondary">{item.productId || "-"}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Đơn vị",
        dataIndex: "unit",
        key: "unit",
        width: 120,
        render: (value?: string) => value || "-",
      },
      {
        title: "Số lượng",
        dataIndex: "quantity",
        key: "quantity",
        width: 100,
        align: "right",
      },
      {
        title: "Đơn giá",
        dataIndex: "unitPrice",
        key: "unitPrice",
        width: 160,
        align: "right",
        render: (value: number) => toCurrency(value),
      },
      {
        title: "Thành tiền",
        dataIndex: "lineTotal",
        key: "lineTotal",
        width: 170,
        align: "right",
        render: (value: number | undefined, row) => <Typography.Text strong>{toCurrency(value ?? row.quantity * row.unitPrice)}</Typography.Text>,
      },
    ],
    [],
  );

  const paymentColumns = useMemo<ColumnsType<InvoiceModel["paymentHistory"][number]>>(
    () => [
      {
        title: "Số phiếu thu",
        key: "receiptNumber",
        render: (_, item) => item.receiptNumber || item.paymentId || "-",
      },
      {
        title: "Ngày thanh toán",
        dataIndex: "paymentDate",
        key: "paymentDate",
        render: (value?: string) => formatInvoiceDateTime(value),
      },
      {
        title: "Phương thức",
        dataIndex: "paymentMethod",
        key: "paymentMethod",
        render: (value?: string) => value || "Chưa cập nhật",
      },
      {
        title: "Số tham chiếu",
        dataIndex: "referenceNo",
        key: "referenceNo",
        render: (value?: string) => value || "-",
      },
      {
        title: "Số tiền phân bổ",
        dataIndex: "allocatedAmount",
        key: "allocatedAmount",
        align: "right",
        render: (value: number) => <Typography.Text strong>{toCurrency(value)}</Typography.Text>,
      },
    ],
    [],
  );

  const canCancelByBusiness = (invoice?.paidAmount ?? 0) <= 0;

  const handleCancelInvoice = async () => {
    if (!invoice) {
      return;
    }

    const reason = cancelReason.trim();
    if (!reason) {
      notify("Vui lòng nhập lý do hủy hóa đơn.", "warning");
      return;
    }

    if (!canCancelByBusiness) {
      notify("Không thể hủy hóa đơn đã có thanh toán hoặc phân bổ thanh toán.", "warning");
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

  return (
    <>
      <NoResizeScreenTemplate
        bodyClassName="px-0 pb-0 pt-4"
        header={
          <ListScreenHeaderTemplate
            title={invoice ? resolveInvoiceNumber(invoice.id, invoice.invoiceNumber) : "Chi tiết hóa đơn"}
            subtitle="Theo dõi thông tin hóa đơn, lịch sử thanh toán và trạng thái công nợ liên quan."
            breadcrumb={
              <CustomBreadcrumb
                breadcrumbs={[
                  { label: "Trang chủ" },
                  { label: "Hóa đơn", url: ROUTE_URL.INVOICE_LIST },
                  { label: "Chi tiết" },
                ]}
              />
            }
            actions={
              <Space wrap>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTE_URL.INVOICE_LIST)}>
                  Quay lại
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
                  <Button
                    danger
                    icon={<StopOutlined />}
                    onClick={() => {
                      setCancelReason("");
                      setCancelModalOpen(true);
                    }}
                    disabled={!invoice || ["CANCELLED", "VOID"].includes(String(invoice.status).toUpperCase())}
                  >
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
                        <Descriptions.Item label="Trạng thái">
                          <InvoiceStatusTag status={invoice.status} />
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày xuất">{formatInvoiceDate(invoice.issueDate)}</Descriptions.Item>
                        <Descriptions.Item label="Hạn thanh toán">{formatInvoiceDate(invoice.dueDate)}</Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Card title="Thông tin khách hàng">
                      <Descriptions column={1} size="small" colon={false}>
                        <Descriptions.Item label="Tên khách hàng">{invoice.customerName || "Chưa cập nhật"}</Descriptions.Item>
                        <Descriptions.Item label="Mã khách hàng">{invoice.customerCode || invoice.customerId || "-"}</Descriptions.Item>
                        <Descriptions.Item label="Địa chỉ xuất hóa đơn">{invoice.billingAddress || "Chưa cập nhật"}</Descriptions.Item>
                        <Descriptions.Item label="Điều khoản thanh toán">{invoice.paymentTerms || "Chưa cập nhật"}</Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                </Row>

                <Card title="Thông tin hợp đồng">
                  <Descriptions column={{ xs: 1, md: 3 }} size="small" colon={false}>
                    <Descriptions.Item label="Mã hợp đồng">{invoice.contractNumber || invoice.contractId || "Chưa liên kết"}</Descriptions.Item>
                    <Descriptions.Item label="Tạm tính">{toCurrency(invoice.subtotalAmount)}</Descriptions.Item>
                    <Descriptions.Item label="Điều chỉnh">{toCurrency(invoice.adjustmentAmount)}</Descriptions.Item>
                    <Descriptions.Item label="VAT">{toCurrency(invoice.vatAmount)}</Descriptions.Item>
                    <Descriptions.Item label="Tổng tiền">{toCurrency(invoice.grandTotal)}</Descriptions.Item>
                    <Descriptions.Item label="Còn phải thu">{toCurrency(invoice.outstandingAmount)}</Descriptions.Item>
                  </Descriptions>
                </Card>

                <Card title="Danh sách mặt hàng">
                  <Table rowKey={(item, index) => `${item.id ?? item.productId ?? index}`} columns={itemColumns} dataSource={invoice.items} pagination={false} />
                </Card>

                <Card title="Lịch sử thanh toán và phân bổ">
                  <Table
                    rowKey={(item, index) => `${item.paymentId ?? item.receiptNumber ?? index}`}
                    columns={paymentColumns}
                    dataSource={invoice.paymentHistory}
                    pagination={false}
                    locale={{
                      emptyText: (
                        <Empty
                          image={Empty.PRESENTED_IMAGE_SIMPLE}
                          description="Chưa có thanh toán hoặc phân bổ thanh toán cho hóa đơn này."
                        />
                      ),
                    }}
                  />
                </Card>

                <Card title="Ghi chú">
                  <Typography.Paragraph style={{ marginBottom: 0 }}>
                    {invoice.note || "Không có ghi chú bổ sung cho hóa đơn này."}
                  </Typography.Paragraph>
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
          {canCancelByBusiness ? (
            <Alert
              type="warning"
              showIcon
              message="Thao tác hủy hóa đơn không thể hoàn tác."
              description="Vui lòng kiểm tra kỹ thông tin trước khi xác nhận."
            />
          ) : (
            <Alert
              type="error"
              showIcon
              message="Hóa đơn đã có thanh toán nên không được hủy."
              description="Theo quy tắc nghiệp vụ, hóa đơn có phát sinh thanh toán hoặc phân bổ thanh toán không thể hủy."
            />
          )}
          <Typography.Text strong>Lý do hủy hóa đơn</Typography.Text>
          <Typography.Text type="secondary">
            Hóa đơn: <FileTextOutlined /> {resolveInvoiceNumber(invoice?.id, invoice?.invoiceNumber)}
          </Typography.Text>
          <Input.TextArea
            rows={4}
            maxLength={1000}
            showCount
            placeholder="Nhập lý do hủy bằng tiếng Việt rõ ràng."
            value={cancelReason}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setCancelReason(event.target.value)}
            disabled={!canCancelByBusiness || canceling}
          />
        </Space>
      </Modal>
    </>
  );
};

export default InvoiceDetailPage;
