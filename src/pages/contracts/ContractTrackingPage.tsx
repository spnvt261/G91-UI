import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { ContractTrackEvent } from "../../models/contract/contract.model";
import { contractService } from "../../services/contract/contract.service";
import { getErrorMessage } from "../shared/page.utils";

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
  }, [id, notify]);

  return (
    <NoResizeScreenTemplate
      loading={loading}
      loadingText="Đang tải tiến trình hợp đồng..."
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Theo dõi hợp đồng"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          actions={
            <CustomButton
              label="Quay lại"
              className="bg-slate-200 text-slate-700 hover:bg-slate-300"
              onClick={() => navigate(ROUTE_URL.CONTRACT_LIST)}
            />
          }
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Hợp đồng", url: ROUTE_URL.CONTRACT_LIST },
                { label: "Theo dõi" },
              ]}
            />
          }
        />
      }
      body={
        <BaseCard>
          {currentStatus ? <p className="mb-4 font-semibold text-blue-900">Trạng thái hiện tại: {currentStatus}</p> : null}
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
      }
    />
  );
};

export default ContractTrackingPage;
