import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import PageHeader from "../../components/layout/PageHeader";
import DataTable, { type DataTableColumn } from "../../components/table/DataTable";
import { ROUTE_URL } from "../../const/route_url.const";
import type { ContractItemModel, ContractModel } from "../../models/contract/contract.model";
import { contractService } from "../../services/contract/contract.service";
import { useNotify } from "../../context/notifyContext";
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
  const rawRole = localStorage.getItem("user_role")?.trim().toUpperCase();
  const isAccountant = role === "ACCOUNTANT";
  const isAdmin = rawRole === "ADMIN" || role === "OWNER";

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
  }, [id]);

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

  const columns = useMemo<DataTableColumn<ContractItemModel>[]>(
    () => [
      { key: "productCode", header: "Mã SP" },
      { key: "productName", header: "Tên Sản Phẩm" },
      { key: "quantity", header: "Số Lượng" },
      { key: "unitPrice", header: "Đơn Giá", render: (row) => toCurrency(row.unitPrice) },
      { key: "amount", header: "Thành Tiền", render: (row) => toCurrency(row.amount) },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <PageHeader
        title="Chi tiết hợp đồng"
        rightActions={
          <div className="flex flex-wrap gap-2">
            {isAccountant ? (
              <CustomButton
                label={actionLoading ? "Submitting..." : "Submit hợp đồng"}
                onClick={handleSubmitContract}
                disabled={!contract || actionLoading}
              />
            ) : null}
            {isAdmin ? (
              <CustomButton
                label={actionLoading ? "Approving..." : "Chấp nhận hợp đồng"}
                onClick={handleApproveContract}
                disabled={!contract || actionLoading}
              />
            ) : null}
            {isAdmin ? (
              <CustomButton
                label={actionLoading ? "Rejecting..." : "Từ chối hợp đồng"}
                className="bg-red-500 hover:bg-red-600"
                onClick={handleRejectContract}
                disabled={!contract || actionLoading}
              />
            ) : null}
            <CustomButton
              label="Theo dõi"
              onClick={() => navigate(ROUTE_URL.CONTRACT_TRACKING.replace(":id", contract?.id ?? ""))}
              disabled={!contract || actionLoading}
            />
            <CustomButton
              label="Chỉnh sửa"
              onClick={() => navigate(ROUTE_URL.CONTRACT_EDIT.replace(":id", contract?.id ?? ""))}
              disabled={!contract || actionLoading}
            />
          </div>
        }
      />
      <BaseCard>
        {loading ? <p className="mb-3 text-sm text-slate-500">Loading contract...</p> : null}
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
                <span className="font-semibold">Payment Terms:</span> {contract.paymentTerms ?? "-"}
              </p>
              <p>
                <span className="font-semibold">Tổng tiền:</span> {toCurrency(contract.totalAmount)}
              </p>
            </div>
            <DataTable columns={columns} data={contract.items} />
          </div>
        ) : null}
      </BaseCard>
    </div>
  );
};

export default ContractDetailPage;
