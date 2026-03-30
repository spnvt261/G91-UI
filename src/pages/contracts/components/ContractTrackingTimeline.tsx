import { Empty, Space, Timeline, Typography } from "antd";
import type { ContractTrackEvent } from "../../../models/contract/contract.model";
import { formatContractDateTime } from "../contract.ui";
import ContractStatusTag from "./ContractStatusTag";

interface ContractTrackingTimelineProps {
  events: ContractTrackEvent[];
  emptyDescription?: string;
}

const ContractTrackingTimeline = ({
  events,
  emptyDescription = "Chưa có bản ghi theo dõi nào cho hợp đồng này.",
}: ContractTrackingTimelineProps) => {
  if (events.length === 0) {
    return (
      <Empty
        image={Empty.PRESENTED_IMAGE_SIMPLE}
        description={emptyDescription}
      />
    );
  }

  return (
    <Timeline
      items={events.map((event, index) => ({
        key: `${event.status}-${event.at}-${index}`,
        children: (
          <Space direction="vertical" size={4}>
            <Space size={8}>
              <ContractStatusTag status={event.status} />
              <Typography.Text type="secondary">{formatContractDateTime(event.at)}</Typography.Text>
            </Space>
            {event.title ? <Typography.Text strong>{event.title}</Typography.Text> : null}
            {event.note ? <Typography.Text>{event.note}</Typography.Text> : null}
            {event.trackingNumber ? <Typography.Text type="secondary">Mã vận đơn: {event.trackingNumber}</Typography.Text> : null}
          </Space>
        ),
      }))}
    />
  );
};

export default ContractTrackingTimeline;
