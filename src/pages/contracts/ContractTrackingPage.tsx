import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import PageHeader from "../../components/layout/PageHeader";
import { ROUTE_URL } from "../../const/route_url.const";
import type { ContractTrackEvent } from "../../models/contract/contract.model";
import { contractService } from "../../services/contract/contract.service";
import { getErrorMessage } from "../shared/page.utils";
import { useNotify } from "../../context/notifyContext";

const ContractTrackingPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [timeline, setTimeline] = useState<ContractTrackEvent[]>([]);
  const [currentStatus, setCurrentStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const { notify } = useNotify();

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      try {
        setLoading(true);
        const tracking = await contractService.track(id);
        setTimeline(tracking.timeline);
        setCurrentStatus(tracking.currentStatus);
      } catch (err) {
        notify(getErrorMessage(err, "Cannot load contract tracking"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Theo Dõi Hợp Đồng"
        rightActions={<CustomButton label="Quay Lại" className="bg-slate-200 text-slate-700 hover:bg-slate-300" onClick={() => navigate(ROUTE_URL.CONTRACT_LIST)} />}
      />
      <BaseCard>
        {loading ? <p className="mb-3 text-sm text-slate-500">Loading tracking timeline...</p> : null}
        {currentStatus ? <p className="mb-4 font-semibold text-blue-900">Current status: {currentStatus}</p> : null}
        <ol className="space-y-3">
          {timeline.map((event, index) => (
            <li key={`${event.status}-${event.at}-${index}`} className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="font-semibold text-slate-800">{event.status}</p>
              <p className="text-sm text-slate-500">{event.at}</p>
              {event.note ? <p className="mt-1 text-sm text-slate-600">{event.note}</p> : null}
            </li>
          ))}
        </ol>
      </BaseCard>
    </div>
  );
};

export default ContractTrackingPage;
