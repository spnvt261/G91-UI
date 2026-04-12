import { MailOutlined, PrinterOutlined, ReloadOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Col, Descriptions, Empty, Form, Input, Modal, Row, Select, Space, Statistic, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { canPerformAction, hasPermission } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { ContractModel } from "../../models/contract/contract.model";
import type { ContractDocumentModel } from "../../services/contract/contract.service";
import { contractService } from "../../services/contract/contract.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage } from "../shared/page.utils";
import ContractStatusTag from "./components/ContractStatusTag";
import { formatContractCurrency, formatContractDate, formatContractDateTime, getContractDisplayNumber } from "./contract.ui";

type ContractActionKey = "submit" | "approve" | "reject" | "request-modification" | "cancel" | "generate-doc" | "export-doc" | "email-doc";

interface EmailDocumentFormValues {
  documentId: string;
  recipients: string;
  subject?: string;
  message?: string;
}

const CONTRACT_CANCELLATION_REASON_OPTIONS = [
  { label: "Khách hàng yêu cầu", value: "CUSTOMER_REQUEST" },
  { label: "Tranh chấp giá", value: "PRICE_DISPUTE" },
  { label: "Thiếu tồn kho", value: "INVENTORY_SHORTAGE" },
  { label: "Rủi ro tín dụng", value: "CREDIT_RISK" },
  { label: "Sai dữ liệu", value: "DATA_ERROR" },
  { label: "Lý do khác", value: "OTHER" },
];

const ContractDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { notify } = useNotify();
  const role = getStoredUserRole();

  const canSubmit = canPerformAction(role, "contract.submit");
  const canApprove = canPerformAction(role, "contract.approve");
  const canEdit = canPerformAction(role, "contract.update");
<<<<<<< HEAD
  const canCancel = canPerformAction(role, "sale-order.cancel");
  const canViewTracking = hasPermission(role, "sale-order.tracking.view");
=======
  const canCancel = canPerformAction(role, "contract.cancel");
  const canViewSaleOrder = hasPermission(role, "sale-order.view");
>>>>>>> new3

  const [contract, setContract] = useState<ContractModel | null>(null);
  const [documents, setDocuments] = useState<ContractDocumentModel[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<ContractActionKey | null>(null);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState<string | undefined>(undefined);
  const [cancelNote, setCancelNote] = useState("");
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailForm] = Form.useForm<EmailDocumentFormValues>();

  const loadData = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      setLoadError(null);
      const [detail, docs] = await Promise.all([contractService.getDetail(id), contractService.getDocuments(id).catch(() => [])]);
      setContract(detail);
      setDocuments(docs);
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải chi tiết hợp đồng.");
      setLoadError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [id, notify]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const runAction = useCallback(
    async (actionKey: ContractActionKey, task: () => Promise<void>, successMessage: string, fallback: string) => {
      try {
        setActionLoading(actionKey);
        await task();
        notify(successMessage, "success");
        await loadData();
      } catch (error) {
        notify(getErrorMessage(error, fallback), "error");
      } finally {
        setActionLoading(null);
      }
    },
    [loadData, notify],
  );

  const handleExportDocument = async (documentId: string) => {
    if (!id) {
      return;
    }

    await runAction(
      "export-doc",
      async () => {
        const blob = await contractService.exportDocument(id, documentId, {});
        const objectUrl = URL.createObjectURL(blob);
        window.open(objectUrl, "_blank", "noopener,noreferrer");
        window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);
      },
      "Đã mở tài liệu hợp đồng.",
      "Không thể xuất tài liệu hợp đồng.",
    );
  };

  const itemColumns = useMemo<ColumnsType<ContractModel["items"][number]>>(
    () => [
      {
        title: "Sản phẩm / dịch vụ",
        key: "productName",
        render: (_, item) => (
          <Space direction="vertical" size={0}>
            <Typography.Text strong>{item.productName || item.productCode || item.productId}</Typography.Text>
            <Typography.Text type="secondary">{item.productId}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Số lượng",
        dataIndex: "quantity",
        key: "quantity",
        align: "right",
        width: 120,
      },
      {
        title: "Đơn giá",
        dataIndex: "unitPrice",
        key: "unitPrice",
        align: "right",
        width: 180,
        render: (value: number) => formatContractCurrency(value),
      },
      {
        title: "Thành tiền",
        dataIndex: "amount",
        key: "amount",
        align: "right",
        width: 200,
        render: (value: number | undefined, row) => <Typography.Text strong>{formatContractCurrency(value ?? row.quantity * row.unitPrice)}</Typography.Text>,
      },
    ],
    [],
  );

  const documentColumns = useMemo<ColumnsType<ContractDocumentModel>>(
    () => [
      {
        title: "Tên tài liệu",
        dataIndex: "name",
        key: "name",
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 160,
        render: (value?: string) => value || "Chưa cập nhật",
      },
      {
        title: "Thời điểm tạo",
        dataIndex: "generatedAt",
        key: "generatedAt",
        width: 180,
        render: (value?: string) => formatContractDateTime(value),
      },
      {
        title: "Thao tác",
        key: "actions",
        width: 210,
        render: (_, row) => (
          <Space wrap size={4}>
            <Button size="small" icon={<PrinterOutlined />} onClick={() => void handleExportDocument(row.id)}>
              Xuất tài liệu
            </Button>
            <Button
              size="small"
              icon={<MailOutlined />}
              onClick={() => {
                emailForm.setFieldsValue({
                  documentId: row.id,
                  recipients: "",
                });
                setEmailModalOpen(true);
              }}
            >
              Gửi email tài liệu
            </Button>
          </Space>
        ),
      },
    ],
    [emailForm],
  );

  return (
    <>
      <NoResizeScreenTemplate
        bodyClassName="px-0 pb-0 pt-4"
        header={
          <ListScreenHeaderTemplate
            title={contract ? getContractDisplayNumber(contract) : "Chi tiết hợp đồng"}
            subtitle="Theo dõi thông tin tài chính, trạng thái phê duyệt và tài liệu thực thi của hợp đồng."
            breadcrumb={
              <CustomBreadcrumb
                breadcrumbs={[
                  { label: "Trang chủ" },
                  { label: "Hợp đồng", url: ROUTE_URL.CONTRACT_LIST },
                  { label: "Chi tiết" },
                ]}
              />
            }
            actions={
              <Space wrap>
                <Button icon={<ReloadOutlined />} onClick={() => void loadData()} loading={loading}>
                  Làm mới
                </Button>
                {canViewTracking ? (
                  <Button onClick={() => navigate(ROUTE_URL.CONTRACT_TRACKING.replace(":id", contract?.id ?? id ?? ""))}>
                    Theo dõi tiến độ
                  </Button>
                ) : null}
                {canSubmit ? (
                  <Button
                    type="primary"
                    loading={actionLoading === "submit"}
                    onClick={() =>
                      void runAction(
                        "submit",
                        async () => {
                          if (!id) {
                            return;
                          }
                          await contractService.submit(id, {});
                        },
                        "Đã gửi thực hiện hợp đồng.",
                        "Không thể gửi thực hiện hợp đồng.",
                      )
                    }
                  >
                    Gửi thực hiện
                  </Button>
                ) : null}
                {canApprove ? (
                  <Button
                    danger
                    loading={actionLoading === "reject"}
                    onClick={() =>
                      void runAction(
                        "reject",
                        async () => {
                          if (!id) {
                            return;
                          }
                          await contractService.reject(id, { comment: "Từ chối từ trang chi tiết hợp đồng." });
                        },
                        "Đã từ chối hợp đồng.",
                        "Không thể từ chối hợp đồng.",
                      )
                    }
                  >
                    Từ chối
                  </Button>
                ) : null}
                {canApprove ? (
                  <Button
                    loading={actionLoading === "request-modification"}
                    onClick={() =>
                      void runAction(
                        "request-modification",
                        async () => {
                          if (!id) {
                            return;
                          }
                          await contractService.requestModification(id, { comment: "Yêu cầu chỉnh sửa từ trang chi tiết hợp đồng." });
                        },
                        "Đã gửi yêu cầu chỉnh sửa.",
                        "Không thể gửi yêu cầu chỉnh sửa.",
                      )
                    }
                  >
                    Yêu cầu chỉnh sửa
                  </Button>
                ) : null}
                {canApprove ? (
                  <Button
                    loading={actionLoading === "approve"}
                    onClick={() =>
                      void runAction(
                        "approve",
                        async () => {
                          if (!id) {
                            return;
                          }
                          await contractService.approve(id, {});
                        },
                        "Đã phê duyệt hợp đồng.",
                        "Không thể phê duyệt hợp đồng.",
                      )
                    }
                  >
                    Phê duyệt
                  </Button>
                ) : null}
                {canEdit ? (
                  <Button onClick={() => navigate(ROUTE_URL.CONTRACT_EDIT.replace(":id", contract?.id ?? ""))} disabled={!contract}>
                    Cập nhật
                  </Button>
                ) : null}
                {canCancel ? (
                  <Button
                    danger
                    onClick={() => {
                      setCancelReason(undefined);
                      setCancelNote("");
                      setCancelModalOpen(true);
                    }}
                  >
                    Hủy hợp đồng
                  </Button>
                ) : null}
                <Button onClick={() => navigate(ROUTE_URL.CONTRACT_LIST)}>Quay lại</Button>
              </Space>
            }
          />
        }
        body={
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            {loadError ? <Alert type="error" showIcon message="Không thể tải chi tiết hợp đồng." description={loadError} /> : null}
            {!loading && !contract ? (
              <Card>
                <Empty description="Không có dữ liệu hợp đồng để hiển thị." />
              </Card>
            ) : null}

            {contract ? (
              <>
                {contract.confidential ? (
                  <Alert
                    type="warning"
                    showIcon
                    message="Hợp đồng thuộc diện bảo mật."
                    description={contract.confidentialityNote || "Chỉ người có thẩm quyền mới được truy cập và chia sẻ tài liệu liên quan."}
                  />
                ) : null}

                <Row gutter={[16, 16]}>
                  <Col xs={24} lg={12}>
                    <Card title="Thông tin chính">
                      <Descriptions column={1} size="small" colon={false}>
                        <Descriptions.Item label="Số hợp đồng">{getContractDisplayNumber(contract)}</Descriptions.Item>
                        <Descriptions.Item label="Mã đơn bán">{contract.saleOrderNumber || "Chưa phát sinh"}</Descriptions.Item>
                        <Descriptions.Item label="Trạng thái">
                          <ContractStatusTag status={contract.status} />
                        </Descriptions.Item>
                        <Descriptions.Item label="Khách hàng">{contract.customerName || contract.customerId}</Descriptions.Item>
                        <Descriptions.Item label="Báo giá liên kết">{contract.quotationNumber || contract.quotationId || "Không có"}</Descriptions.Item>
                        <Descriptions.Item label="Ngày giao dự kiến">{formatContractDate(contract.expectedDeliveryDate)}</Descriptions.Item>
                        <Descriptions.Item label="Liên kết đơn bán">
                          {contract.saleOrderNumber && canViewSaleOrder ? (
                            <Button type="link" onClick={() => navigate(ROUTE_URL.SALE_ORDER_DETAIL.replace(":id", contract.id))}>
                              Mở chi tiết đơn bán
                            </Button>
                          ) : (
                            "Chưa có"
                          )}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                  <Col xs={24} lg={12}>
                    <Card title="Thông tin tài chính và phê duyệt">
                      <Row gutter={[12, 12]}>
                        <Col xs={12}>
                          <Statistic title="Tổng tiền" value={contract.totalAmount} formatter={(value) => formatContractCurrency(Number(value))} />
                        </Col>
                        <Col xs={12}>
                          <Statistic
                            title="Hạn mức tín dụng"
                            value={contract.creditLimitSnapshot ?? 0}
                            formatter={(value) => (contract.creditLimitSnapshot != null ? formatContractCurrency(Number(value)) : "Chưa cập nhật")}
                          />
                        </Col>
                        <Col xs={12}>
                          <Statistic
                            title="Dư nợ hiện tại"
                            value={contract.currentDebtSnapshot ?? 0}
                            formatter={(value) => (contract.currentDebtSnapshot != null ? formatContractCurrency(Number(value)) : "Chưa cập nhật")}
                          />
                        </Col>
                        <Col xs={12}>
                          <Statistic title="Tỷ lệ đặt cọc" value={contract.depositPercentage ?? 0} suffix="%" />
                        </Col>
                        <Col xs={12}>
                          <Statistic
                            title="Số tiền đặt cọc"
                            value={contract.depositAmount ?? 0}
                            formatter={(value) => (contract.depositAmount != null ? formatContractCurrency(Number(value)) : "Chưa cập nhật")}
                          />
                        </Col>
                        <Col xs={12}>
                          <Space direction="vertical" size={2}>
                            <Typography.Text type="secondary">Có cần duyệt</Typography.Text>
                            <Typography.Text strong>{contract.requiresApproval ? "Có" : "Không"}</Typography.Text>
                            <Typography.Text type="secondary">Cấp duyệt: {contract.approvalTier || "Chưa cập nhật"}</Typography.Text>
                          </Space>
                        </Col>
                      </Row>
                    </Card>
                  </Col>
                </Row>

                <Card title="Điều khoản hợp đồng">
                  <Descriptions column={{ xs: 1, md: 2 }} size="small" colon={false}>
                    <Descriptions.Item label="Điều khoản thanh toán">{contract.paymentTerms || "Chưa cập nhật"}</Descriptions.Item>
                    <Descriptions.Item label="Điều khoản giao hàng">{contract.deliveryTerms || "Chưa cập nhật"}</Descriptions.Item>
                    <Descriptions.Item label="Địa chỉ giao hàng">{contract.deliveryAddress || "Chưa cập nhật"}</Descriptions.Item>
                    <Descriptions.Item label="Ghi chú">{contract.note || "Không có ghi chú"}</Descriptions.Item>
                    <Descriptions.Item label="Khởi tạo lúc">{formatContractDateTime(contract.createdAt)}</Descriptions.Item>
                    <Descriptions.Item label="Gửi thực hiện lúc">{formatContractDateTime(contract.submittedAt)}</Descriptions.Item>
                  </Descriptions>
                </Card>

                <Card title="Danh sách sản phẩm / dịch vụ">
                  <Table
                    rowKey={(item, index) => `${item.productId}-${index}`}
                    columns={itemColumns}
                    dataSource={contract.items}
                    pagination={false}
                    locale={{
                      emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Hợp đồng chưa có dòng hàng." />,
                    }}
                  />
                </Card>

                <Card
                  title="Tài liệu hợp đồng"
                  extra={
                    <Space>
                      <Button
                        loading={actionLoading === "generate-doc"}
                        onClick={() =>
                          void runAction(
                            "generate-doc",
                            async () => {
                              if (!id) {
                                return;
                              }
                              await contractService.generateDocuments(id, {});
                            },
                            "Đã tạo tài liệu hợp đồng.",
                            "Không thể tạo tài liệu hợp đồng.",
                          )
                        }
                      >
                        Tạo tài liệu
                      </Button>
                    </Space>
                  }
                >
                  <Table
                    rowKey={(document) => document.id}
                    columns={documentColumns}
                    dataSource={documents}
                    pagination={false}
                    locale={{
                      emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có tài liệu hợp đồng." />,
                    }}
                  />
                </Card>
              </>
            ) : null}
          </Space>
        }
      />

      <Modal
        title="Xác nhận hủy hợp đồng"
        open={cancelModalOpen}
        onCancel={() => (actionLoading === "cancel" ? undefined : setCancelModalOpen(false))}
        onOk={() =>
          void runAction(
            "cancel",
            async () => {
              if (!id) {
                return;
              }

              if (!cancelReason) {
                throw new Error("Vui lòng chọn lý do hủy hợp đồng.");
              }

              await contractService.cancel(id, {
                cancellationReason: cancelReason,
                cancellationNote: cancelNote.trim() || undefined,
              });
              setCancelModalOpen(false);
            },
            "Đã hủy hợp đồng.",
            "Không thể hủy hợp đồng.",
          )
        }
        okText="Xác nhận hủy"
        cancelText="Đóng"
        okButtonProps={{ danger: true, loading: actionLoading === "cancel" }}
      >
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Alert type="warning" showIcon message="Thao tác hủy hợp đồng không thể hoàn tác." />
          <Select
            value={cancelReason}
            onChange={(value) => setCancelReason(value)}
            placeholder="Chọn lý do hủy hợp đồng (bắt buộc)"
            options={CONTRACT_CANCELLATION_REASON_OPTIONS}
          />
          <Input.TextArea
            rows={3}
            maxLength={1000}
            showCount
            value={cancelNote}
            onChange={(event) => setCancelNote(event.target.value)}
            placeholder="Ghi chú bổ sung (không bắt buộc)"
          />
        </Space>
      </Modal>

      <Modal
        title="Gửi email tài liệu hợp đồng"
        open={emailModalOpen}
        onCancel={() => (actionLoading === "email-doc" ? undefined : setEmailModalOpen(false))}
        onOk={() => emailForm.submit()}
        okText="Gửi email tài liệu"
        cancelText="Đóng"
        okButtonProps={{ loading: actionLoading === "email-doc", icon: <MailOutlined /> }}
      >
        <Form<EmailDocumentFormValues>
          form={emailForm}
          layout="vertical"
          onFinish={(values) =>
            void runAction(
              "email-doc",
              async () => {
                if (!id) {
                  return;
                }

                const recipients = values.recipients
                  .split(",")
                  .map((email) => email.trim())
                  .filter(Boolean);

                if (recipients.length === 0) {
                  throw new Error("Vui lòng nhập ít nhất một email người nhận.");
                }

                await contractService.emailDocument(id, values.documentId, {
                  recipients,
                  subject: values.subject?.trim() || undefined,
                  message: values.message?.trim() || undefined,
                });
                setEmailModalOpen(false);
              },
              "Đã gửi email tài liệu hợp đồng.",
              "Không thể gửi email tài liệu hợp đồng.",
            )
          }
        >
          <Form.Item label="Tài liệu" name="documentId" rules={[{ required: true, message: "Vui lòng chọn tài liệu." }]}>
            <Select
              options={documents.map((document) => ({
                value: document.id,
                label: document.name,
              }))}
            />
          </Form.Item>
          <Form.Item label="Email người nhận" name="recipients" rules={[{ required: true, message: "Vui lòng nhập email người nhận." }]}>
            <Input placeholder="Nhập nhiều email cách nhau bằng dấu phẩy" />
          </Form.Item>
          <Form.Item label="Tiêu đề email" name="subject">
            <Input placeholder="Tiêu đề email tài liệu hợp đồng" />
          </Form.Item>
          <Form.Item label="Nội dung email" name="message">
            <Input.TextArea rows={4} placeholder="Nhập nội dung email gửi tài liệu." />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ContractDetailPage;
