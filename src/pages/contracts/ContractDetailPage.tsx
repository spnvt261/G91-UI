import { PrinterOutlined, ReloadOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Col, Descriptions, Empty, Input, Modal, Row, Select, Space, Statistic, Typography } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { canPerformAction } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { ContractModel } from "../../models/contract/contract.model";
import type { ContractDocumentModel } from "../../services/contract/contract.service";
import { contractService } from "../../services/contract/contract.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage } from "../shared/page.utils";
import ContractActionBar from "./components/ContractActionBar";
import ContractInfoCard from "./components/ContractInfoCard";
import ContractItemsTable from "./components/ContractItemsTable";
import ContractStatusTag from "./components/ContractStatusTag";
import {
  formatContractCurrency,
  formatContractDate,
  formatContractDateTime,
  getContractDisplayNumber,
  getContractNextStepHint,
} from "./contract.ui";

type ContractActionKey = "submit" | "approve" | "reject" | "cancel" | "print";

const ContractDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { notify } = useNotify();

  const role = getStoredUserRole();
  const canSubmit = canPerformAction(role, "contract.submit");
  const canApprove = canPerformAction(role, "contract.approve");
  const canEdit = canPerformAction(role, "contract.update");
  const canCancel = canPerformAction(role, "contract.cancel");
  const canPrint = canPerformAction(role, "contract.print");

  const [contract, setContract] = useState<ContractModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<ContractActionKey | null>(null);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancellationNote, setCancellationNote] = useState("");

  const [documentSelectionOpen, setDocumentSelectionOpen] = useState(false);
  const [documentOptions, setDocumentOptions] = useState<ContractDocumentModel[]>([]);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | undefined>(undefined);

  const loadContractDetail = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      setLoadError(null);
      const detail = await contractService.getDetail(id);
      setContract(detail);
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải chi tiết hợp đồng.");
      setLoadError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [id, notify]);

  useEffect(() => {
    void loadContractDetail();
  }, [loadContractDetail]);

  const runContractAction = useCallback(
    async (
      actionKey: ContractActionKey,
      request: () => Promise<unknown>,
      successMessage: string,
      errorFallback: string,
      postSuccess?: () => void,
    ) => {
      if (!id) {
        return;
      }

      try {
        setActionLoading(actionKey);
        await request();
        await loadContractDetail();
        postSuccess?.();
        notify(successMessage, "success");
      } catch (error) {
        notify(getErrorMessage(error, errorFallback), "error");
      } finally {
        setActionLoading(null);
      }
    },
    [id, loadContractDetail, notify],
  );

  const exportDocument = useCallback(async (contractId: string, documentId: string) => {
    const fileBlob = await contractService.exportDocument(contractId, documentId);
    const fileUrl = URL.createObjectURL(fileBlob);
    window.open(fileUrl, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(fileUrl), 60_000);
  }, []);

  const handlePrintContract = async () => {
    if (!id) {
      return;
    }

    try {
      setActionLoading("print");

      let documents = await contractService.generateDocuments(id);
      if (documents.length === 0) {
        documents = await contractService.getDocuments(id);
      }

      const validDocuments = documents.filter((item) => item.id);
      if (validDocuments.length === 0) {
        throw new Error("Không có tài liệu hợp đồng để in.");
      }

      if (validDocuments.length === 1) {
        await exportDocument(id, validDocuments[0].id);
        notify("Đã mở tài liệu hợp đồng để in/xuất.", "success");
        return;
      }

      setDocumentOptions(validDocuments);
      setSelectedDocumentId(validDocuments[0].id);
      setDocumentSelectionOpen(true);
    } catch (error) {
      notify(getErrorMessage(error, "Không thể chuẩn bị tài liệu hợp đồng."), "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleConfirmDocumentSelection = async () => {
    if (!id || !selectedDocumentId) {
      notify("Vui lòng chọn một tài liệu để tiếp tục.", "error");
      return;
    }

    try {
      setActionLoading("print");
      await exportDocument(id, selectedDocumentId);
      setDocumentSelectionOpen(false);
      notify("Đã mở tài liệu hợp đồng để in/xuất.", "success");
    } catch (error) {
      notify(getErrorMessage(error, "Không thể xuất tài liệu đã chọn."), "error");
    } finally {
      setActionLoading(null);
    }
  };

  const contractNumber = contract ? getContractDisplayNumber(contract) : "Chi tiết hợp đồng";

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
          subtitle="Theo dõi tình trạng hợp đồng, kiểm tra dữ liệu nghiệp vụ và xử lý các bước tiếp theo ngay tại một màn hình."
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
              <Button icon={<ReloadOutlined />} onClick={() => void loadContractDetail()} loading={loading}>
                Tải lại
              </Button>
              {canSubmit ? (
                <Button
                  type="primary"
                  loading={actionLoading === "submit"}
                  disabled={!contract || actionLoading != null}
                  onClick={() =>
                    void runContractAction(
                      "submit",
                      () => contractService.submit(id ?? ""),
                      "Đã gửi hợp đồng để duyệt.",
                      "Không thể gửi duyệt hợp đồng.",
                    )
                  }
                >
                  Gửi duyệt
                </Button>
              ) : null}
              {canApprove ? (
                <Button
                  type={canSubmit ? "default" : "primary"}
                  loading={actionLoading === "approve"}
                  disabled={!contract || actionLoading != null}
                  onClick={() =>
                    void runContractAction(
                      "approve",
                      () => contractService.approve(id ?? "", {}),
                      "Đã phê duyệt hợp đồng.",
                      "Không thể phê duyệt hợp đồng.",
                    )
                  }
                >
                  Phê duyệt
                </Button>
              ) : null}
              {canPrint ? (
                <Button
                  icon={<PrinterOutlined />}
                  loading={actionLoading === "print"}
                  disabled={!contract || actionLoading != null}
                  onClick={() => void handlePrintContract()}
                >
                  In tài liệu
                </Button>
              ) : null}
              <Button
                disabled={!contract || actionLoading != null}
                onClick={() => navigate(ROUTE_URL.CONTRACT_TRACKING.replace(":id", contract?.id ?? id ?? ""))}
              >
                Theo dõi tiến độ
              </Button>
              {canEdit ? (
                <Button disabled={!contract || actionLoading != null} onClick={() => navigate(ROUTE_URL.CONTRACT_EDIT.replace(":id", contract?.id ?? id ?? ""))}>
                  Chỉnh sửa
                </Button>
              ) : null}
            </Space>
          }
        />
      }
      body={
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {canApprove || canCancel ? (
            <Card bordered={false} className="shadow-sm" styles={{ body: { padding: 12 } }}>
              <Space wrap>
                <Typography.Text strong>Thao tác nhạy cảm:</Typography.Text>
                {canApprove ? (
                  <Button
                    danger
                    loading={actionLoading === "reject"}
                    disabled={actionLoading != null}
                    onClick={() =>
                      void runContractAction(
                        "reject",
                        () => contractService.reject(id ?? "", {}),
                        "Đã từ chối hợp đồng.",
                        "Không thể từ chối hợp đồng.",
                      )
                    }
                  >
                    Từ chối hợp đồng
                  </Button>
                ) : null}
                {canCancel ? (
                  <Button
                    danger
                    loading={actionLoading === "cancel"}
                    disabled={actionLoading != null}
                    onClick={() => {
                      setCancellationReason("");
                      setCancellationNote("");
                      setCancelModalOpen(true);
                    }}
                  >
                    Hủy hợp đồng
                  </Button>
                ) : null}
              </Space>
            </Card>
          ) : null}

          {loadError ? (
            <Alert
              type="error"
              showIcon
              message="Không thể tải dữ liệu hợp đồng"
              description={loadError}
              action={
                <Button size="small" onClick={() => void loadContractDetail()}>
                  Thử lại
                </Button>
              }
            />
          ) : null}

          {!loading && !contract ? (
            <Card bordered={false} className="shadow-sm">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Không tìm thấy dữ liệu hợp đồng."
              >
                <Button onClick={() => navigate(ROUTE_URL.CONTRACT_LIST)}>Quay lại danh sách hợp đồng</Button>
              </Empty>
            </Card>
          ) : (
            <>
              <Card bordered={false} className="shadow-sm" loading={loading}>
                <Space direction="vertical" size={14} style={{ width: "100%" }}>
                  <Typography.Title level={5} className="!mb-0">
                    1. Tổng quan hợp đồng
                  </Typography.Title>

                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={8}>
                      <Statistic
                        title="Tổng giá trị hợp đồng"
                        value={contract?.totalAmount ?? 0}
                        formatter={(value) => formatContractCurrency(Number(value))}
                      />
                    </Col>
                    <Col xs={24} sm={8}>
                      <Statistic title="Số dòng sản phẩm" value={contract?.items.length ?? 0} />
                    </Col>
                    <Col xs={24} sm={8}>
                      <Statistic title="Ngày tạo" value={formatContractDate(contract?.createdAt)} />
                    </Col>
                  </Row>

                  <Descriptions
                    size="small"
                    column={{ xs: 1, sm: 1, md: 2 }}
                    items={[
                      {
                        key: "contractNumber",
                        label: "Số hợp đồng",
                        children: contract ? getContractDisplayNumber(contract) : "-",
                      },
                      {
                        key: "status",
                        label: "Trạng thái",
                        children: contract ? <ContractStatusTag status={contract.status} /> : "-",
                      },
                      {
                        key: "expectedDate",
                        label: "Ngày giao dự kiến",
                        children: formatContractDate(contract?.expectedDeliveryDate, "Chưa cập nhật"),
                      },
                      {
                        key: "confidential",
                        label: "Bảo mật",
                        children: contract?.confidential ? "Có" : "Không",
                      },
                    ]}
                  />
                </Space>
              </Card>

              <ContractInfoCard
                title="2. Thông tin khách hàng / báo giá liên quan"
                loading={loading}
                items={[
                  {
                    key: "customer",
                    label: "Khách hàng",
                    children: contract?.customerName || contract?.customerId || "-",
                  },
                  {
                    key: "customerId",
                    label: "Mã khách hàng",
                    children: contract?.customerId || "-",
                  },
                  {
                    key: "quotation",
                    label: "Báo giá liên kết",
                    children: contract?.quotationId || "-",
                  },
                  {
                    key: "createdAt",
                    label: "Khởi tạo lúc",
                    children: formatContractDateTime(contract?.createdAt),
                  },
                ]}
              />

              <ContractInfoCard
                title="3. Điều khoản thanh toán"
                loading={loading}
                items={[
                  {
                    key: "paymentTerms",
                    label: "Điều khoản",
                    span: 2,
                    children: contract?.paymentTerms || "Chưa cập nhật điều khoản thanh toán.",
                  },
                ]}
              />

              <ContractInfoCard
                title="4. Giao hàng / ghi chú"
                loading={loading}
                items={[
                  {
                    key: "deliveryAddress",
                    label: "Địa chỉ giao hàng",
                    span: 2,
                    children: contract?.deliveryAddress || "Chưa cập nhật địa chỉ giao hàng.",
                  },
                  {
                    key: "deliveryTerms",
                    label: "Điều khoản giao hàng",
                    span: 2,
                    children: contract?.deliveryTerms || "Chưa cập nhật điều khoản giao hàng.",
                  },
                  {
                    key: "note",
                    label: "Ghi chú",
                    span: 2,
                    children: contract?.note || "Không có ghi chú bổ sung.",
                  },
                ]}
              />

              <Card bordered={false} className="shadow-sm" loading={loading}>
                <Space direction="vertical" size={12} style={{ width: "100%" }}>
                  <Typography.Title level={5} className="!mb-0">
                    5. Danh sách sản phẩm
                  </Typography.Title>
                  <ContractItemsTable items={contract?.items ?? []} />
                </Space>
              </Card>

              <Card bordered={false} className="shadow-sm" loading={loading}>
                <Alert
                  type="info"
                  showIcon
                  message="Bước tiếp theo được đề xuất"
                  description={getContractNextStepHint(contract?.status)}
                />
              </Card>
            </>
          )}

          <ContractActionBar justify="space-between">
            <Button onClick={() => navigate(ROUTE_URL.CONTRACT_LIST)}>Quay lại danh sách</Button>
            <Space>
              <Button onClick={() => navigate(ROUTE_URL.CONTRACT_TRACKING.replace(":id", contract?.id ?? id ?? ""))} disabled={!contract}>
                Mở trang theo dõi
              </Button>
              {canEdit ? (
                <Button type="primary" ghost onClick={() => navigate(ROUTE_URL.CONTRACT_EDIT.replace(":id", contract?.id ?? id ?? ""))} disabled={!contract}>
                  Chỉnh sửa hợp đồng
                </Button>
              ) : null}
            </Space>
          </ContractActionBar>

          <Modal
            title="Xác nhận hủy hợp đồng"
            open={cancelModalOpen}
            okText="Hủy hợp đồng"
            cancelText="Đóng"
            okButtonProps={{ danger: true, loading: actionLoading === "cancel" }}
            cancelButtonProps={{ disabled: actionLoading === "cancel" }}
            closable={actionLoading !== "cancel"}
            maskClosable={actionLoading !== "cancel"}
            onCancel={() => {
              if (actionLoading !== "cancel") {
                setCancelModalOpen(false);
              }
            }}
            onOk={() => {
              const reason = cancellationReason.trim();
              if (!reason) {
                notify("Vui lòng nhập lý do hủy hợp đồng.", "error");
                return;
              }

              void runContractAction(
                "cancel",
                () =>
                  contractService.cancel(id ?? "", {
                    cancellationReason: reason,
                    cancellationNote: cancellationNote.trim() || undefined,
                  }),
                "Đã hủy hợp đồng.",
                "Không thể hủy hợp đồng.",
                () => {
                  setCancelModalOpen(false);
                  setCancellationReason("");
                  setCancellationNote("");
                },
              );
            }}
          >
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Alert
                type="warning"
                showIcon
                message="Thao tác này không thể hoàn tác"
                description="Hợp đồng sẽ chuyển sang trạng thái hủy sau khi xác nhận."
              />
              <Input.TextArea
                rows={3}
                maxLength={500}
                showCount
                value={cancellationReason}
                onChange={(event) => setCancellationReason(event.target.value)}
                placeholder="Nhập lý do hủy hợp đồng (bắt buộc)"
              />
              <Input.TextArea
                rows={2}
                maxLength={1000}
                showCount
                value={cancellationNote}
                onChange={(event) => setCancellationNote(event.target.value)}
                placeholder="Ghi chú bổ sung (không bắt buộc)"
              />
            </Space>
          </Modal>

          <Modal
            title="Chọn tài liệu để in/xuất"
            open={documentSelectionOpen}
            okText="Mở tài liệu"
            cancelText="Hủy"
            onCancel={() => {
              if (actionLoading !== "print") {
                setDocumentSelectionOpen(false);
              }
            }}
            onOk={() => void handleConfirmDocumentSelection()}
            okButtonProps={{ loading: actionLoading === "print" }}
            cancelButtonProps={{ disabled: actionLoading === "print" }}
            maskClosable={actionLoading !== "print"}
            closable={actionLoading !== "print"}
          >
            <Space direction="vertical" size={12} style={{ width: "100%" }}>
              <Typography.Text type="secondary">
                Có nhiều tài liệu hợp đồng được tạo. Vui lòng chọn tài liệu bạn muốn mở.
              </Typography.Text>

              <Select
                style={{ width: "100%" }}
                value={selectedDocumentId}
                onChange={setSelectedDocumentId}
                options={documentOptions.map((document) => ({
                  value: document.id,
                  label: `${document.name}${document.generatedAt ? ` - ${formatContractDateTime(document.generatedAt)}` : ""}`,
                }))}
              />
            </Space>
          </Modal>
        </Space>
      }
    />
  );
};

export default ContractDetailPage;
