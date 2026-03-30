import { Empty, Space, Timeline, Typography } from "antd";
import type { QuotationHistoryResponseData } from "../../../models/quotation/quotation.model";
import { formatQuotationDateTime } from "../quotation.ui";

interface QuotationHistoryTimelineProps {
  events: QuotationHistoryResponseData["events"];
}

const getEventColor = (action: string) => {
  const normalized = action.toUpperCase();

  if (normalized.includes("REJECT") || normalized.includes("CANCEL")) {
    return "red";
  }

  if (normalized.includes("APPROVE") || normalized.includes("CONVERT")) {
    return "green";
  }

  if (normalized.includes("SUBMIT") || normalized.includes("PENDING")) {
    return "blue";
  }

  return "gray";
};

const QuotationHistoryTimeline = ({ events }: QuotationHistoryTimelineProps) => {
  if (events.length === 0) {
    return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Báo giá này chưa có lịch sử xử lý." />;
  }

  return (
    <Timeline
      items={events.map((event) => ({
        key: event.id,
        color: getEventColor(event.action),
        children: (
          <Space orientation="vertical" size={0}>
            <Typography.Text strong>{event.action}</Typography.Text>
            <Typography.Text type="secondary">{formatQuotationDateTime(event.createdAt)}</Typography.Text>
            {event.actorName || event.actorRole ? (
              <Typography.Text type="secondary">
                Thực hiện bởi: {[event.actorName, event.actorRole].filter(Boolean).join(" • ")}
              </Typography.Text>
            ) : null}
            {event.note ? <Typography.Text>{event.note}</Typography.Text> : null}
          </Space>
        ),
      }))}
    />
  );
};

export default QuotationHistoryTimeline;
