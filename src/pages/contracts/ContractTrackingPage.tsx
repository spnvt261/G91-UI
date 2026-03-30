import { Alert, Button, Card, Space, Typography } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { ContractTrackEvent } from "../../models/contract/contract.model";
import { contractService } from "../../services/contract/contract.service";
import { getErrorMessage } from "../shared/page.utils";
import ContractStatusTag from "./components/ContractStatusTag";
import ContractTrackingTimeline from "./components/ContractTrackingTimeline";
import { getContractNextStepHint } from "./contract.ui";

const ContractTrackingPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { notify } = useNotify();

  const [timeline, setTimeline] = useState<ContractTrackEvent[]>([]);
  const [currentStatus, setCurrentStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadTracking = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      setLoadError(null);
      const tracking = await contractService.track(id);
      setTimeline(tracking.timeline);
      setCurrentStatus(tracking.currentStatus);
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải dữ liệu theo dõi hợp đồng.");
      setLoadError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [id, notify]);

  useEffect(() => {
    void loadTracking();
  }, [loadTracking]);

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Theo dõi tiến độ hợp đồng"
          subtitle="Quan sát toàn bộ mốc xử lý và trạng thái hiện tại để chủ động phối hợp các bước tiếp theo."
          actions={
            <Space>
              <Button onClick={() => navigate(ROUTE_URL.CONTRACT_DETAIL.replace(":id", id ?? ""))}>
                Quay lại hợp đồng
              </Button>
              <Button onClick={() => navigate(ROUTE_URL.CONTRACT_LIST)}>Danh sách hợp đồng</Button>
            </Space>
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
        <Space orientation="vertical" size={16} style={{ width: "100%" }}>
          {loadError ? (
            <Alert
              type="error"
              showIcon
              message="Không thể tải timeline hợp đồng"
              description={loadError}
              action={
                <Button size="small" onClick={() => void loadTracking()}>
                  Thử lại
                </Button>
              }
            />
          ) : null}

          <Card variant="borderless" className="shadow-sm" loading={loading}>
            <Space orientation="vertical" size={8} style={{ width: "100%" }}>
              <Typography.Title level={5} className="!mb-0">
                Trạng thái hiện tại
              </Typography.Title>
              {currentStatus ? <ContractStatusTag status={currentStatus} /> : <Typography.Text type="secondary">Chưa có trạng thái cập nhật</Typography.Text>}
              <Typography.Text type="secondary">{getContractNextStepHint(currentStatus)}</Typography.Text>
            </Space>
          </Card>

          <Card variant="borderless" className="shadow-sm" loading={loading}>
            <Space orientation="vertical" size={12} style={{ width: "100%" }}>
              <Typography.Title level={5} className="!mb-0">
                Lịch sử theo dõi xử lý
              </Typography.Title>
              <ContractTrackingTimeline events={timeline} />
            </Space>
          </Card>
        </Space>
      }
    />
  );
};

export default ContractTrackingPage;
