import { Alert, Button, Card, Col, Descriptions, Empty, Row, Space, Statistic, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { ContractModel } from "../../models/contract/contract.model";
import { contractService } from "../../services/contract/contract.service";
import { getErrorMessage } from "../shared/page.utils";
import ApprovalDecisionModal from "../contracts/components/ApprovalDecisionModal";
import ContractStatusTag from "../contracts/components/ContractStatusTag";
import { formatContractCurrency, formatContractDateTime, getContractDisplayNumber } from "../contracts/contract.ui";

type ApprovalDecision = "APPROVE" | "REJECT" | "REQUEST_MODIFICATION";

const ContractApprovalDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { notify } = useNotify();

  const [contract, setContract] = useState<ContractModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [decisionModalOpen, setDecisionModalOpen] = useState(false);
  const [currentDecision, setCurrentDecision] = useState<ApprovalDecision>("APPROVE");

  const loadContract = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      setLoadError(null);
      const detail = await contractService.getApprovalReview(id);
      setContract(detail);
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải màn hình rà soát duyệt hợp đồng.");
      setLoadError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [id, notify]);

  useEffect(() => {
    void loadContract();
  }, [loadContract]);

  const itemColumns = useMemo<ColumnsType<ContractModel["items"][number]>>(
    () => [
      {
        title: "Sản phẩm / dịch vụ",
        key: "productName",
        render: (_, row) => row.productName || row.productCode || row.productId,
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
        width: 180,
        render: (value: number | undefined, row) => formatContractCurrency(value ?? row.quantity * row.unitPrice),
      },
    ],
    [],
  );

  const handleDecisionSubmit = async (comment: string) => {
    if (!id) {
      return;
    }

    try {
      setActionLoading(true);

      if (currentDecision === "APPROVE") {
        await contractService.approve(id, { comment: comment || "Phê duyệt từ màn hình rà soát duyệt." });
        notify("Phê duyệt hợp đồng thành công.", "success");
      } else if (currentDecision === "REJECT") {
        await contractService.reject(id, { comment });
        notify("Đã từ chối hợp đồng.", "success");
      } else {
        await contractService.requestModification(id, { comment });
        notify("Đã gửi yêu cầu chỉnh sửa hợp đồng.", "success");
      }

      setDecisionModalOpen(false);
      navigate(ROUTE_URL.CONTRACT_APPROVAL_LIST);
    } catch (error) {
      notify(getErrorMessage(error, "Không thể gửi quyết định duyệt hợp đồng."), "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title={contract ? getContractDisplayNumber(contract) : "Rà soát duyệt hợp đồng"}
          subtitle="Màn hình đọc quyết định dành cho OWNER: đánh giá thông tin chính, cảnh báo và lý do cần duyệt trước khi ra quyết định."
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Duyệt hợp đồng", url: ROUTE_URL.CONTRACT_APPROVAL_LIST },
                { label: "Rà soát duyệt" },
              ]}
            />
          }
          actions={<Button onClick={() => navigate(ROUTE_URL.CONTRACT_APPROVAL_LIST)}>Quay lại danh sách chờ duyệt</Button>}
        />
      }
      body={
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {loadError ? <Alert type="error" showIcon message="Không thể tải dữ liệu rà soát duyệt." description={loadError} /> : null}

          {!loading && !contract ? (
            <Card>
              <Empty description="Không có dữ liệu hợp đồng để rà soát duyệt." />
            </Card>
          ) : null}

          {contract ? (
            <>
              <Card title="1. Thông tin chính">
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={8}>
                    <Statistic title="Tổng tiền hợp đồng" value={contract.totalAmount} formatter={(value) => formatContractCurrency(Number(value))} />
                  </Col>
                  <Col xs={24} md={8}>
                    <Statistic title="Hạn mức tín dụng" value={contract.creditLimitSnapshot ?? 0} formatter={(value) => formatContractCurrency(Number(value))} />
                  </Col>
                  <Col xs={24} md={8}>
                    <Statistic title="Dư nợ hiện tại" value={contract.currentDebtSnapshot ?? 0} formatter={(value) => formatContractCurrency(Number(value))} />
                  </Col>
                </Row>

                <Descriptions column={{ xs: 1, md: 2 }} size="small" style={{ marginTop: 16 }}>
                  <Descriptions.Item label="Số hợp đồng">{getContractDisplayNumber(contract)}</Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <ContractStatusTag status={contract.status} />
                  </Descriptions.Item>
                  <Descriptions.Item label="Khách hàng">{contract.customerName || contract.customerId}</Descriptions.Item>
                  <Descriptions.Item label="Báo giá liên kết">{contract.quotationNumber || contract.quotationId || "Không có"}</Descriptions.Item>
                  <Descriptions.Item label="Tỷ lệ đặt cọc">{contract.depositPercentage != null ? `${contract.depositPercentage}%` : "Chưa cập nhật"}</Descriptions.Item>
                  <Descriptions.Item label="Số tiền đặt cọc">
                    {contract.depositAmount != null ? formatContractCurrency(contract.depositAmount) : "Chưa cập nhật"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Có cần duyệt">{contract.requiresApproval ? "Có" : "Không"}</Descriptions.Item>
                  <Descriptions.Item label="Cấp duyệt">{contract.approvalTier || "Chưa cập nhật"}</Descriptions.Item>
                  <Descriptions.Item label="Khởi tạo lúc">{formatContractDateTime(contract.createdAt)}</Descriptions.Item>
                  <Descriptions.Item label="Gửi thực hiện lúc">{formatContractDateTime(contract.submittedAt)}</Descriptions.Item>
                </Descriptions>
              </Card>

              <Card title="2. Cảnh báo và lý do cần duyệt">
                {contract.confidential ? (
                  <Alert
                    type="warning"
                    showIcon
                    style={{ marginBottom: 12 }}
                    message="Hợp đồng thuộc diện bảo mật."
                    description={contract.confidentialityNote || "Chỉ xử lý trong phạm vi người có thẩm quyền."}
                  />
                ) : null}
                {contract.reviewInsights?.length ? (
                  <Alert
                    type="info"
                    showIcon
                    message="Các điểm cần lưu ý khi ra quyết định"
                    description={
                      <Space direction="vertical" size={4}>
                        {contract.reviewInsights.map((insight) => (
                          <Typography.Text key={insight}>• {insight}</Typography.Text>
                        ))}
                      </Space>
                    }
                  />
                ) : (
                  <Alert type="info" showIcon message="Không có cảnh báo bổ sung từ máy chủ." />
                )}

                {contract.approvalRequest ? (
                  <Descriptions column={1} size="small" style={{ marginTop: 12 }}>
                    <Descriptions.Item label="Người yêu cầu duyệt">{contract.approvalRequest.requestedBy || "Chưa cập nhật"}</Descriptions.Item>
                    <Descriptions.Item label="Thời điểm yêu cầu">{formatContractDateTime(contract.approvalRequest.requestedAt)}</Descriptions.Item>
                    <Descriptions.Item label="Lý do yêu cầu duyệt">{contract.approvalRequest.reason || "Chưa cập nhật"}</Descriptions.Item>
                    <Descriptions.Item label="Ghi chú">{contract.approvalRequest.comment || "Không có ghi chú"}</Descriptions.Item>
                  </Descriptions>
                ) : null}
              </Card>

              <Card title="3. Danh sách sản phẩm / giá trị">
                <Table
                  rowKey={(row, index) => `${row.productId}-${index}`}
                  columns={itemColumns}
                  dataSource={contract.items}
                  pagination={false}
                  locale={{
                    emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Hợp đồng chưa có danh sách mặt hàng." />,
                  }}
                />
              </Card>

              <Card title="4. Ra quyết định">
                <Space wrap>
                  <Button
                    danger
                    onClick={() => {
                      setCurrentDecision("REJECT");
                      setDecisionModalOpen(true);
                    }}
                    disabled={actionLoading}
                  >
                    Từ chối
                  </Button>
                  <Button
                    onClick={() => {
                      setCurrentDecision("REQUEST_MODIFICATION");
                      setDecisionModalOpen(true);
                    }}
                    disabled={actionLoading}
                  >
                    Yêu cầu chỉnh sửa
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      setCurrentDecision("APPROVE");
                      setDecisionModalOpen(true);
                    }}
                    disabled={actionLoading}
                  >
                    Phê duyệt
                  </Button>
                </Space>
              </Card>
            </>
          ) : null}

          <ApprovalDecisionModal
            open={decisionModalOpen}
            decision={currentDecision}
            loading={actionLoading}
            contractNumber={contract ? getContractDisplayNumber(contract) : undefined}
            onCancel={() => {
              if (!actionLoading) {
                setDecisionModalOpen(false);
              }
            }}
            onSubmit={(comment) => void handleDecisionSubmit(comment)}
          />
        </Space>
      }
    />
  );
};

export default ContractApprovalDetailPage;
