import { Alert, Button, Card, Empty, Space, Timeline, Typography } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { SaleOrderTimelineResponseModel } from "../../models/sale-order/sale-order.model";
import { saleOrderService } from "../../services/sale-order/sale-order.service";
import { getErrorMessage } from "../shared/page.utils";
import SaleOrderStatusTag from "./components/SaleOrderStatusTag";
import { formatSaleOrderDateTime, getTimelineEventLabel } from "./saleOrder.ui";

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
      const message = getErrorMessage(timelineError, "Không thể tải dòng thời gian đơn bán.");
      setError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [id, notify]);

  useEffect(() => {
    void loadTimeline();
  }, [loadTimeline]);

  const events = useMemo(() => {
    const merged = [...(timeline?.milestones ?? []), ...(timeline?.events ?? [])];
    merged.sort((a, b) => new Date(b.at || 0).getTime() - new Date(a.at || 0).getTime());
    return merged;
  }, [timeline?.events, timeline?.milestones]);

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Dòng thời gian đơn bán"
          subtitle="Theo dõi các mốc thực hiện đơn và cập nhật trạng thái theo thời gian."
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Đơn bán", url: ROUTE_URL.SALE_ORDER_LIST },
                { label: "Dòng thời gian" },
              ]}
            />
          }
          actions={
            <Space>
              <Button onClick={() => void loadTimeline()} loading={loading}>
                Làm mới
              </Button>
              <Button onClick={() => navigate(ROUTE_URL.SALE_ORDER_DETAIL.replace(":id", id ?? ""))} disabled={!id}>
                Về chi tiết đơn bán
              </Button>
            </Space>
          }
        />
      }
      body={
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {!id ? <Alert type="warning" showIcon message="Không tìm thấy mã đơn bán trên đường dẫn." /> : null}
          {error ? <Alert type="error" showIcon message="Không thể tải dòng thời gian đơn bán." description={error} /> : null}

          <Card loading={loading}>
            <Space direction="vertical" size={8} style={{ width: "100%" }}>
              <Typography.Text type="secondary">Trạng thái hiện tại</Typography.Text>
              {timeline?.currentStatus ? <SaleOrderStatusTag status={timeline.currentStatus} /> : <Typography.Text>Chưa cập nhật</Typography.Text>}
            </Space>
          </Card>

          <Card loading={loading} title="Diễn biến xử lý đơn bán">
            {events.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có bản ghi dòng thời gian cho đơn bán này." />
            ) : (
              <Timeline
                items={events.map((event, index) => ({
                  key: `${event.id || event.at || event.eventType || index}`,
                  children: (
                    <Space direction="vertical" size={2}>
                      <Typography.Text strong>{getTimelineEventLabel(event.eventType, event.title)}</Typography.Text>
                      <Typography.Text type="secondary">{formatSaleOrderDateTime(event.at)}</Typography.Text>
                      {event.status ? <SaleOrderStatusTag compact status={event.status} /> : null}
                      {event.note ? <Typography.Text>{event.note}</Typography.Text> : null}
                      {event.trackingNumber ? <Typography.Text type="secondary">Mã vận đơn: {event.trackingNumber}</Typography.Text> : null}
                    </Space>
                  ),
                }))}
              />
            )}
          </Card>
        </Space>
      }
    />
  );
};

export default SaleOrderTimelinePage;
