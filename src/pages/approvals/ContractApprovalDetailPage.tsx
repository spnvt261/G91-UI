import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { ContractModel } from "../../models/contract/contract.model";
import { contractService } from "../../services/contract/contract.service";
import { getErrorMessage, toCurrency } from "../shared/page.utils";

const ContractApprovalDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const [contract, setContract] = useState<ContractModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const { notify } = useNotify();

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      try {
        setLoading(true);
        const detail = await contractService.getDetail(id);
        setContract(detail);
      } catch (err) {
        notify(getErrorMessage(err, "Không thể load contract approval detail"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id, notify]);

  const handleDecision = async (decision: "APPROVE" | "REJECT" | "REQUEST_MODIFICATION") => {
    if (!id) {
      return;
    }

    try {
      setActionLoading(true);
      if (decision === "APPROVE" || decision === "REQUEST_MODIFICATION") {
        if (decision === "APPROVE") {
          await contractService.approve(id, { comment: `Owner decision: ${decision}` });
        } else {
          await contractService.requestModification(id, { comment: "Requested modification by owner" });
        }
      } else {
        await contractService.reject(id, { comment: "Rejected by owner" });
      }
      navigate(ROUTE_URL.CONTRACT_APPROVAL_LIST);
    } catch (err) {
      notify(getErrorMessage(err, "Không thể submit contract decision"), "error");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      loading={loading}
      loadingText="Đang tải hợp đồng..."
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Phê duyệt hợp đồng"
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Phê duyệt hợp đồng", url: ROUTE_URL.CONTRACT_APPROVAL_LIST },
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
              <p>
                <span className="font-semibold">Số hợp đồng:</span> {contract.id}
              </p>
              <p>
                <span className="font-semibold">Khách hàng:</span> {contract.customerId}
              </p>
              <p>
                <span className="font-semibold">Trạng thái:</span> {contract.status}
              </p>
              <p>
                <span className="font-semibold">Tổng tiền:</span> {toCurrency(contract.totalAmount)}
              </p>
              <div className="flex flex-wrap gap-3">
                <CustomButton label="Phê duyệt" onClick={() => handleDecision("APPROVE")} disabled={actionLoading} />
                <CustomButton
                  label="Reject"
                  className="bg-red-500 hover:bg-red-600"
                  onClick={() => handleDecision("REJECT")}
                  disabled={actionLoading}
                />
                <CustomButton
                  label="Request Modification"
                  className="bg-amber-500 hover:bg-amber-600"
                  onClick={() => handleDecision("REQUEST_MODIFICATION")}
                  disabled={actionLoading}
                />
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-500">Không có dữ liệu hợp đồng.</p>
          )}
        </BaseCard>
      }
    />
  );
};

export default ContractApprovalDetailPage;


