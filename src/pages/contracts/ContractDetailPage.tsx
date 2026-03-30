import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import DataTable, { type DataTableColumn } from "../../components/table/DataTable";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { canPerformAction } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { ContractItemModel, ContractModel } from "../../models/contract/contract.model";
import { contractService } from "../../services/contract/contract.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage, toCurrency } from "../shared/page.utils";

const ContractDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [contract, setContract] = useState<ContractModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { notify } = useNotify();

  const role = getStoredUserRole();
  const canSubmit = canPerformAction(role, "contract.submit");
  const canApprove = canPerformAction(role, "contract.approve");
  const canEdit = canPerformAction(role, "contract.update");
  const canCancel = canPerformAction(role, "contract.cancel");
  const canPrint = canPerformAction(role, "contract.print");

  const loadContractDetail = async (contractId: string) => {
    const detail = await contractService.getDetail(contractId);
    setContract(detail);
  };

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      try {
        setLoading(true);
        await loadContractDetail(id);
      } catch (err) {
        notify(getErrorMessage(err, "Không thể tải chi tiết hợp đồng."), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id, notify]);

  const handleSubmitContract = async () => {
    if (!id) {
      return;
    }

    try {
      setActionLoading(true);
      await contractService.submit(id);
      await loadContractDetail(id);
      notify("Đã gửi hợp đồng để duyệt.", "success");
    } catch (err) {
      notify(getErrorMessage(err, "Không thể gửi duyệt hợp đồng."), "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveContract = async () => {
    if (!id) {
      return;
    }

    try {
      setActionLoading(true);
      await contractService.approve(id, {});
      await loadContractDetail(id);
      notify("Đã phê duyệt hợp đồng.", "success");
    } catch (err) {
      notify(getErrorMessage(err, "Không thể phê duyệt hợp đồng."), "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectContract = async () => {
    if (!id) {
      return;
    }

    try {
      setActionLoading(true);
      await contractService.reject(id, {});
      await loadContractDetail(id);
      notify("Đã từ chối hợp đồng.", "success");
    } catch (err) {
      notify(getErrorMessage(err, "Không thể từ chối hợp đồng."), "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelContract = async () => {
    if (!id) {
      return;
    }

    const cancellationReason = window.prompt(
      "Nhập lý do hủy hợp đồng",
      "Hủy theo yêu cầu từ bộ phận nghiệp vụ",
    )?.trim();

    if (!cancellationReason) {
      return;
    }

    try {
      setActionLoading(true);
      await contractService.cancel(id, {
        cancellationReason,
        cancellationNote: "Hủy từ màn hình chi tiết hợp đồng",
      });
      await loadContractDetail(id);
      notify("Đã hủy hợp đồng.", "success");
    } catch (err) {
      notify(getErrorMessage(err, "Không thể hủy hợp đồng."), "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrintContract = async () => {
    if (!id) {
      return;
    }

    try {
      setActionLoading(true);
      let documents = await contractService.generateDocuments(id);
      if (documents.length === 0) {
        documents = await contractService.getDocuments(id);
      }

      const selectedDocument = documents.find((item) => item.id);
      if (!selectedDocument) {
        throw new Error("Không có tài liệu hợp đồng để in.");
      }

      const fileBlob = await contractService.exportDocument(id, selectedDocument.id);
      const fileUrl = URL.createObjectURL(fileBlob);
      window.open(fileUrl, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(fileUrl), 60_000);

      notify("Đã mở tài liệu hợp đồng để in/xuất.", "success");
    } catch (err) {
      notify(getErrorMessage(err, "Không thể in tài liệu hợp đồng."), "error");
    } finally {
      setActionLoading(false);
    }
  };

  const columns = useMemo<DataTableColumn<ContractItemModel>[]>(
    () => [
      { key: "productCode", header: "Mã sản phẩm" },
      { key: "productName", header: "Tên sản phẩm" },
      { key: "quantity", header: "Số lượng" },
      { key: "unitPrice", header: "Đơn giá", render: (row) => toCurrency(row.unitPrice) },
      { key: "amount", header: "Thành tiền", render: (row) => toCurrency(row.amount) },
    ],
    [],
  );

  return (
    <NoResizeScreenTemplate
      loading={loading}
      loadingText="Đang tải hợp đồng..."
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Chi tiết hợp đồng"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          actions={
            <div className="flex flex-wrap gap-2">
              {canSubmit ? (
                <CustomButton
                  label={actionLoading ? "Đang gửi duyệt..." : "Gửi duyệt hợp đồng"}
                  onClick={handleSubmitContract}
                  disabled={!contract || actionLoading}
                />
              ) : null}
              {canApprove ? (
                <CustomButton
                  label={actionLoading ? "Đang phê duyệt..." : "Phê duyệt hợp đồng"}
                  onClick={handleApproveContract}
                  disabled={!contract || actionLoading}
                />
              ) : null}
              {canApprove ? (
                <CustomButton
                  label={actionLoading ? "Đang từ chối..." : "Từ chối hợp đồng"}
                  className="bg-red-500 hover:bg-red-600"
                  onClick={handleRejectContract}
                  disabled={!contract || actionLoading}
                />
              ) : null}
              {canCancel ? (
                <CustomButton
                  label={actionLoading ? "Đang hủy..." : "Hủy hợp đồng"}
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={handleCancelContract}
                  disabled={!contract || actionLoading}
                />
              ) : null}
              {canPrint ? (
                <CustomButton
                  label={actionLoading ? "Đang chuẩn bị..." : "In tài liệu"}
                  onClick={handlePrintContract}
                  disabled={!contract || actionLoading}
                />
              ) : null}
              <CustomButton
                label="Theo dõi"
                onClick={() => navigate(ROUTE_URL.CONTRACT_TRACKING.replace(":id", contract?.id ?? ""))}
                disabled={!contract || actionLoading}
              />
              {canEdit ? (
                <CustomButton
                  label="Chỉnh sửa"
                  onClick={() => navigate(ROUTE_URL.CONTRACT_EDIT.replace(":id", contract?.id ?? ""))}
                  disabled={!contract || actionLoading}
                />
              ) : null}
            </div>
          }
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Hợp đồng", url: ROUTE_URL.CONTRACT_LIST },
                { label: "Chi tiết" },
              ]}
            />
          }
        />
      }
      body={
        <BaseCard>
          {contract ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                <p>
                  <span className="font-semibold">Số hợp đồng:</span> {contract.contractNumber || contract.id}
                </p>
                <p>
                  <span className="font-semibold">Báo giá:</span> {contract.quotationId}
                </p>
                <p>
                  <span className="font-semibold">Khách hàng:</span> {contract.customerName || contract.customerId || "-"}
                </p>
                <p>
                  <span className="font-semibold">Trạng thái:</span> {contract.status}
                </p>
                <p>
                  <span className="font-semibold">Điều khoản thanh toán:</span> {contract.paymentTerms ?? "-"}
                </p>
                <p>
                  <span className="font-semibold">Tổng tiền:</span> {toCurrency(contract.totalAmount)}
                </p>
              </div>
              <DataTable columns={columns} data={contract.items} />
            </div>
          ) : null}
        </BaseCard>
      }
    />
  );
};

export default ContractDetailPage;
