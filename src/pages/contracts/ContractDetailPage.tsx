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
        notify(getErrorMessage(err, "Cannot load contract detail"), "error");
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
      notify("Submit contract successfully.", "success");
    } catch (err) {
      notify(getErrorMessage(err, "Cannot submit contract"), "error");
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
      notify("Approve contract successfully.", "success");
    } catch (err) {
      notify(getErrorMessage(err, "Cannot approve contract"), "error");
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
      notify("Reject contract successfully.", "success");
    } catch (err) {
      notify(getErrorMessage(err, "Cannot reject contract"), "error");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelContract = async () => {
    if (!id) {
      return;
    }

    const cancellationReason = window.prompt("Nh?p lý do h?y h?p d?ng", "Cancelled by accountant from UI")?.trim();
    if (!cancellationReason) {
      return;
    }

    try {
      setActionLoading(true);
      await contractService.cancel(id, {
        cancellationReason,
        cancellationNote: "Cancelled from contract detail page",
      });
      await loadContractDetail(id);
      notify("Cancel contract successfully.", "success");
    } catch (err) {
      notify(getErrorMessage(err, "Cannot cancel contract"), "error");
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
        throw new Error("No contract document available to print.");
      }

      const fileBlob = await contractService.exportDocument(id, selectedDocument.id);
      const fileUrl = URL.createObjectURL(fileBlob);
      window.open(fileUrl, "_blank", "noopener,noreferrer");
      window.setTimeout(() => URL.revokeObjectURL(fileUrl), 60_000);

      notify("Ðã m? tài li?u h?p d?ng d? in/xu?t.", "success");
    } catch (err) {
      notify(getErrorMessage(err, "Cannot print contract documents"), "error");
    } finally {
      setActionLoading(false);
    }
  };

  const columns = useMemo<DataTableColumn<ContractItemModel>[]>(
    () => [
      { key: "productCode", header: "Mã SP" },
      { key: "productName", header: "Tên s?n ph?m" },
      { key: "quantity", header: "S? lu?ng" },
      { key: "unitPrice", header: "Ðon giá", render: (row) => toCurrency(row.unitPrice) },
      { key: "amount", header: "Thành ti?n", render: (row) => toCurrency(row.amount) },
    ],
    [],
  );

  return (
    <NoResizeScreenTemplate
      loading={loading}
      loadingText="Ðang t?i h?p d?ng..."
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Chi ti?t h?p d?ng"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          actions={
            <div className="flex flex-wrap gap-2">
              {canSubmit ? (
                <CustomButton
                  label={actionLoading ? "Submitting..." : "Submit h?p d?ng"}
                  onClick={handleSubmitContract}
                  disabled={!contract || actionLoading}
                />
              ) : null}
              {canApprove ? (
                <CustomButton
                  label={actionLoading ? "Approving..." : "Ch?p nh?n h?p d?ng"}
                  onClick={handleApproveContract}
                  disabled={!contract || actionLoading}
                />
              ) : null}
              {canApprove ? (
                <CustomButton
                  label={actionLoading ? "Rejecting..." : "T? ch?i h?p d?ng"}
                  className="bg-red-500 hover:bg-red-600"
                  onClick={handleRejectContract}
                  disabled={!contract || actionLoading}
                />
              ) : null}
              {canCancel ? (
                <CustomButton
                  label={actionLoading ? "Cancelling..." : "H?y h?p d?ng"}
                  className="bg-orange-500 hover:bg-orange-600"
                  onClick={handleCancelContract}
                  disabled={!contract || actionLoading}
                />
              ) : null}
              {canPrint ? (
                <CustomButton
                  label={actionLoading ? "Preparing..." : "In tài li?u"}
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
                  label="Ch?nh s?a"
                  onClick={() => navigate(ROUTE_URL.CONTRACT_EDIT.replace(":id", contract?.id ?? ""))}
                  disabled={!contract || actionLoading}
                />
              ) : null}
            </div>
          }
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang ch?" },
                { label: "H?p d?ng", url: ROUTE_URL.CONTRACT_LIST },
                { label: "Chi ti?t" },
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
                  <span className="font-semibold">S? h?p d?ng:</span> {contract.contractNumber || contract.id}
                </p>
                <p>
                  <span className="font-semibold">Báo giá:</span> {contract.quotationId}
                </p>
                <p>
                  <span className="font-semibold">Khách hàng:</span> {contract.customerName || contract.customerId || "-"}
                </p>
                <p>
                  <span className="font-semibold">Tr?ng thái:</span> {contract.status}
                </p>
                <p>
                  <span className="font-semibold">Payment Terms:</span> {contract.paymentTerms ?? "-"}
                </p>
                <p>
                  <span className="font-semibold">T?ng ti?n:</span> {toCurrency(contract.totalAmount)}
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

