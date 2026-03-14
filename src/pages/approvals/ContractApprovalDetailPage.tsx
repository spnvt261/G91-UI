import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import PageHeader from "../../components/layout/PageHeader";
import { ROUTE_URL } from "../../const/route_url.const";
import type { ContractModel } from "../../models/contract/contract.model";
import { contractService } from "../../services/contract/contract.service";
import { getErrorMessage, toCurrency } from "../shared/page.utils";

const ContractApprovalDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [contract, setContract] = useState<ContractModel | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      try {
        const detail = await contractService.getDetail(id);
        setContract(detail);
      } catch (err) {
        setError(getErrorMessage(err, "Cannot load contract approval detail"));
      }
    };

    void load();
  }, [id]);

  const handleDecision = async (decision: "APPROVE" | "REJECT" | "REQUEST_MODIFICATION") => {
    if (!id) {
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      if (decision === "APPROVE" || decision === "REQUEST_MODIFICATION") {
        await contractService.approve(id, { decision, note: `Owner decision: ${decision}` });
      } else {
        await contractService.reject(id, { decision, note: "Rejected by owner" });
      }
      navigate(ROUTE_URL.CONTRACT_APPROVAL_LIST);
    } catch (err) {
      setError(getErrorMessage(err, "Cannot submit contract decision"));
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Phe Duyet Hop Dong" />
      <BaseCard>
        {error ? <p className="mb-3 text-sm text-red-500">{error}</p> : null}
        {contract ? (
          <div className="space-y-4">
            <p><span className="font-semibold">So Hop Dong:</span> {contract.id}</p>
            <p><span className="font-semibold">Khach Hang:</span> {contract.customerId}</p>
            <p><span className="font-semibold">Trang Thai:</span> {contract.status}</p>
            <p><span className="font-semibold">Tong Tien:</span> {toCurrency(contract.totalAmount)}</p>
            <div className="flex flex-wrap gap-3">
              <CustomButton label="Approve" onClick={() => handleDecision("APPROVE")} disabled={actionLoading} />
              <CustomButton label="Reject" className="bg-red-500 hover:bg-red-600" onClick={() => handleDecision("REJECT")} disabled={actionLoading} />
              <CustomButton
                label="Request Modification"
                className="bg-amber-500 hover:bg-amber-600"
                onClick={() => handleDecision("REQUEST_MODIFICATION")}
                disabled={actionLoading}
              />
            </div>
          </div>
        ) : (
          <p className="text-sm text-slate-500">Loading contract...</p>
        )}
      </BaseCard>
    </div>
  );
};

export default ContractApprovalDetailPage;
