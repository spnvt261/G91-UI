import { Alert, Button, Card, Descriptions, Empty, Space, Statistic, Typography } from "antd";
import { useCallback, useEffect, useState } from "react";
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
import ContractActionBar from "../contracts/components/ContractActionBar";
import ContractInfoCard from "../contracts/components/ContractInfoCard";
import ContractItemsTable from "../contracts/components/ContractItemsTable";
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
      const detail = await contractService.getDetail(id);
      setContract(detail);
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải chi tiết hợp đồng cần phê duyệt.");
      setLoadError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [id, notify]);

  useEffect(() => {
    void loadContract();
  }, [loadContract]);

  const handleDecisionSubmit = async (comment: string) => {
    if (!id) {
      return;
    }

    try {
      setActionLoading(true);

      if (currentDecision === "APPROVE") {
        await contractService.approve(id, {
          comment: comment || "Phê duyệt từ màn hình owner.",
        });
        notify("Phê duyệt hợp đồng thành công.", "success");
      } else if (currentDecision === "REJECT") {
        await contractService.reject(id, {
          comment,
        });
        notify("Đã từ chối hợp đồng.", "success");
      } else {
        await contractService.requestModification(id, {
          comment,
        });
        notify("Đã gửi yêu cầu chỉnh sửa hợp đồng.", "success");
      }

      setDecisionModalOpen(false);
      navigate(ROUTE_URL.CONTRACT_APPROVAL_LIST);
    } catch (error) {
      notify(getErrorMessage(error, "Không thể gửi quyết định phê duyệt."), "error");
    } finally {
      setActionLoading(false);
    }
  };

  const contractNumber = contract ? getContractDisplayNumber(contract) : "Chi tiết phê duyệt hợp đồng";

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title={
            <Space size={10}>
              <span>{contractNumber}</span>
              {contract ? <ContractStatusTag status={contract.status} /> : null}
            </Space>
          }
          subtitle="Màn hình hỗ trợ owner ra quyết định phê duyệt dựa trên đầy đủ thông tin hợp đồng và dữ liệu hàng hóa."
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Phê duyệt hợp đồng", url: ROUTE_URL.CONTRACT_APPROVAL_LIST },
                { label: "Chi tiết" },
              ]}
            />
          }
          actions={
            <Button onClick={() => navigate(ROUTE_URL.CONTRACT_APPROVAL_LIST)}>
              Quay lại danh sách chờ duyệt
            </Button>
          }
        />
      }
      body={
        <Space orientation="vertical" size={16} style={{ width: "100%" }}>
          {loadError ? (
            <Alert
              type="error"
              showIcon
              message="Không thể tải dữ liệu hợp đồng"
              description={loadError}
              action={
                <Button size="small" onClick={() => void loadContract()}>
                  Thử lại
                </Button>
              }
            />
          ) : null}

          {!loading && !contract ? (
            <Card variant="borderless" className="shadow-sm">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không tìm thấy dữ liệu hợp đồng để phê duyệt."
              />
            </Card>
          ) : (
            <>
              <Card variant="borderless" className="shadow-sm" loading={loading}>
                <Space orientation="vertical" size={14} style={{ width: "100%" }}>
                  <Typography.Title level={5} className="!mb-0">
                    1. Tổng quan hợp đồng
                  </Typography.Title>
                  <Space size={24} wrap>
                    <Statistic
                      title="Tổng giá trị"
                      value={contract?.totalAmount ?? 0}
                      formatter={(value) => formatContractCurrency(Number(value))}
                    />
                    <Statistic title="Số dòng hàng" value={contract?.items.length ?? 0} />
                    <Statistic title="Khởi tạo lúc" value={formatContractDateTime(contract?.createdAt)} />
                  </Space>
                  <Descriptions
                    size="small"
                    column={{ xs: 1, sm: 1, md: 2 }}
                    items={[
                      {
                        key: "customer",
                        label: "Khách hàng",
                        children: contract?.customerName || contract?.customerId || "-",
                      },
                      {
                        key: "quotation",
                        label: "Báo giá liên kết",
                        children: contract?.quotationId || "-",
                      },
                    ]}
                  />
                </Space>
              </Card>

              <ContractInfoCard
                title="2. Điều khoản chính"
                loading={loading}
                items={[
                  {
                    key: "paymentTerms",
                    label: "Điều khoản thanh toán",
                    span: 2,
                    children: contract?.paymentTerms || "Chưa cập nhật.",
                  },
                  {
                    key: "deliveryAddress",
                    label: "Địa chỉ giao hàng",
                    span: 2,
                    children: contract?.deliveryAddress || "Chưa cập nhật.",
                  },
                  {
                    key: "deliveryTerms",
                    label: "Điều khoản giao hàng",
                    span: 2,
                    children: contract?.deliveryTerms || "Chưa cập nhật.",
                  },
                ]}
              />

              <Card variant="borderless" className="shadow-sm" loading={loading}>
                <Space orientation="vertical" size={12} style={{ width: "100%" }}>
                  <Typography.Title level={5} className="!mb-0">
                    3. Danh sách sản phẩm / giá trị
                  </Typography.Title>
                  <ContractItemsTable items={contract?.items ?? []} />
                </Space>
              </Card>

              <Card variant="borderless" className="shadow-sm" loading={loading}>
                <Space orientation="vertical" size={8} style={{ width: "100%" }}>
                  <Typography.Title level={5} className="!mb-0">
                    4. Ghi chú phê duyệt
                  </Typography.Title>
                  <Alert
                    type="info"
                    showIcon
                    message="Vui lòng để lại nhận xét rõ ràng khi từ chối hoặc yêu cầu chỉnh sửa."
                    description="Thông tin này sẽ giúp bộ phận lập hợp đồng xử lý nhanh và đúng yêu cầu."
                  />
                  <Typography.Text type="secondary">
                    Ghi chú hiện tại của hợp đồng: {contract?.note || "Chưa có ghi chú."}
                  </Typography.Text>
                </Space>
              </Card>

              <ContractActionBar justify="space-between">
                <Button onClick={() => navigate(ROUTE_URL.CONTRACT_APPROVAL_LIST)}>
                  Quay lại
                </Button>
                <Space wrap>
                  <Button
                    danger
                    onClick={() => {
                      setCurrentDecision("REJECT");
                      setDecisionModalOpen(true);
                    }}
                    disabled={!contract || actionLoading}
                  >
                    Từ chối
                  </Button>
                  <Button
                    onClick={() => {
                      setCurrentDecision("REQUEST_MODIFICATION");
                      setDecisionModalOpen(true);
                    }}
                    disabled={!contract || actionLoading}
                  >
                    Yêu cầu chỉnh sửa
                  </Button>
                  <Button
                    type="primary"
                    onClick={() => {
                      setCurrentDecision("APPROVE");
                      setDecisionModalOpen(true);
                    }}
                    disabled={!contract || actionLoading}
                  >
                    Phê duyệt
                  </Button>
                </Space>
              </ContractActionBar>
            </>
          )}

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
