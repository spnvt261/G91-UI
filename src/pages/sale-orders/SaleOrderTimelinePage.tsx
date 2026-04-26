import { Alert, Button, Card, Space, Steps, Typography } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { SaleOrderTimelineEventModel, SaleOrderTimelineResponseModel } from "../../models/sale-order/sale-order.model";
import { saleOrderService } from "../../services/sale-order/sale-order.service";
import { getErrorMessage } from "../shared/page.utils";
import SaleOrderStatusTag from "./components/SaleOrderStatusTag";
import {
  isStatusReached,
  normalizeSaleOrderStatus,
  SALE_ORDER_FLOW_STEPS,
} from "./saleOrder.ui";

const hasEventByKeyword = (events: SaleOrderTimelineEventModel[], keywords: string[]): boolean =>
  events.some((event) => {
    const content = `${event.eventType ?? ""} ${event.title ?? ""} ${event.note ?? ""}`.toUpperCase();
    return keywords.some((keyword) => content.includes(keyword));
  });

const SaleOrderTimelinePage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { notify } = useNotify();

  const [timeline, setTimeline] = useState<SaleOrderTimelineResponseModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadTimeline = useCallback(async () => {
    if (!id) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await saleOrderService.getTimeline(id);
      setTimeline(response);
    } catch (timelineError) {
      const message = getErrorMessage(timelineError, "Không thể tải tiến trình đơn bán.");
      setError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [id, notify]);

  useEffect(() => {
    void loadTimeline();
  }, [loadTimeline]);

  const mergedEvents = useMemo(() => {
    const merged = [...(timeline?.milestones ?? []), ...(timeline?.events ?? [])];
    merged.sort((a, b) => new Date(b.at || 0).getTime() - new Date(a.at || 0).getTime());
    return merged;
  }, [timeline?.events, timeline?.milestones]);

  const flowStepItems = useMemo(() => {
    const currentStatus = normalizeSaleOrderStatus(timeline?.currentStatus);

    const submittedDone = currentStatus.length > 0;
    const reserveDone = isStatusReached(currentStatus, "RESERVED");
    const pickDone = isStatusReached(currentStatus, "PICKED");
    const dispatchDone = isStatusReached(currentStatus, "IN_TRANSIT");
    const deliveredDone = isStatusReached(currentStatus, "DELIVERED");
    const invoiceDone = hasEventByKeyword(mergedEvents, ["INVOICE", "CREATE_INVOICE", "INVOICE_CREATED"]);
    const paymentDone = hasEventByKeyword(mergedEvents, ["PAYMENT", "PAYMENT_RECORDED", "RECEIPT"]);
    const settlementDone = hasEventByKeyword(mergedEvents, ["SETTLEMENT", "DEBT_SETTLED", "SETTLED"]);

    const completionMap: Record<string, boolean> = {
      SUBMITTED: submittedDone,
      RESERVED: reserveDone,
      PICKED: pickDone,
      DISPATCHED: dispatchDone,
      DELIVERED: deliveredDone,
      INVOICE_CREATED: invoiceDone,
      PAYMENT_RECORDED: paymentDone,
      DEBT_SETTLED: settlementDone,
    };

    let firstPendingFound = false;

    return SALE_ORDER_FLOW_STEPS.map((step) => {
      const done = completionMap[step.key];
      let status: "finish" | "process" | "wait" = "wait";

      if (done) {
        status = "finish";
      } else if (!firstPendingFound) {
        status = "process";
        firstPendingFound = true;
      }

      return {
        key: step.key,
        title: step.label,
        status,
        description: (
          <Space direction="vertical" size={0}>
            <Typography.Text type="secondary">{step.description}</Typography.Text>
            <Typography.Text type="secondary">Phụ trách: {step.owner === "WAREHOUSE" ? "Kho" : "Kế toán"}</Typography.Text>
          </Space>
        ),
      };
    });
  }, [mergedEvents, timeline?.currentStatus]);

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Tiến trình"
          subtitle="Theo dõi các mốc xử lý kho, hóa đơn, thanh toán và công nợ kế toán."
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Đơn bán", url: ROUTE_URL.SALE_ORDER_LIST },
                { label: "Tiến trình" },
              ]}
            />
          }
          actions={
            <Space>
              <Button onClick={() => void loadTimeline()} loading={loading}>
                Làm mới
              </Button>
              <Button onClick={() => navigate(ROUTE_URL.SALE_ORDER_DETAIL.replace(":id", id ?? ""))} disabled={!id}>
                Về chi tiết
              </Button>
            </Space>
          }
        />
      }
      body={
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {!id ? <Alert type="warning" showIcon message="Không tìm thấy mã đơn bán trên đường dẫn." /> : null}
          {error ? <Alert type="error" showIcon message="Không thể tải tiến trình đơn bán." description={error} /> : null}

          <Card loading={loading}>
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              <Typography.Text type="secondary">Trạng thái hiện tại</Typography.Text>
              {timeline?.currentStatus ? <SaleOrderStatusTag status={timeline.currentStatus} /> : <Typography.Text>Chưa cập nhật</Typography.Text>}
            </Space>
          </Card>

          <Card loading={loading} title="Tiến trình">
            <Steps direction="vertical" current={-1} items={flowStepItems} />
          </Card>
        </Space>
      }
    />
  );
};

export default SaleOrderTimelinePage;
