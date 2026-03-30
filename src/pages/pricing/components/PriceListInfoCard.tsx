import { CalendarOutlined, ClockCircleOutlined, FieldTimeOutlined, InboxOutlined, TeamOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { Card, Col, Descriptions, Divider, Progress, Row, Space, Statistic, Typography } from "antd";
import type { PriceListModel } from "../../../models/pricing/price-list.model";
import PriceListInlineStatus from "./PriceListInlineStatus";
import { calculateValidityDays, formatDateTimeVi, formatDateVi } from "../priceList.ui";

interface PriceListInfoCardProps {
  detail: PriceListModel;
}

const computeValidityProgress = (validFrom?: string, validTo?: string) => {
  const from = dayjs(validFrom);
  const to = dayjs(validTo);

  if (!from.isValid() || !to.isValid() || from.isAfter(to, "day")) {
    return 0;
  }

  const totalDays = to.startOf("day").diff(from.startOf("day"), "day") + 1;
  if (totalDays <= 0) {
    return 0;
  }

  const today = dayjs().startOf("day");
  if (today.isBefore(from, "day")) {
    return 0;
  }
  if (today.isAfter(to, "day")) {
    return 100;
  }

  const elapsed = today.diff(from.startOf("day"), "day") + 1;
  return Math.min(100, Math.max(0, Math.round((elapsed / totalDays) * 100)));
};

const PriceListInfoCard = ({ detail }: PriceListInfoCardProps) => {
  const totalItems = detail.itemCount ?? detail.items.length;
  const validityDays = calculateValidityDays(detail.validFrom, detail.validTo);
  const validityProgress = computeValidityProgress(detail.validFrom, detail.validTo);

  return (
    <Card
      title={
        <Space direction="vertical" size={0}>
          <Typography.Text strong style={{ fontSize: 16 }}>
            Tổng quan bảng giá
          </Typography.Text>
          <Typography.Text type="secondary">Thông tin chính và vòng đời hiệu lực của bảng giá hiện tại.</Typography.Text>
        </Space>
      }
      extra={<PriceListInlineStatus status={detail.status} validFrom={detail.validFrom} validTo={detail.validTo} />}
    >
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <Statistic title="Sản phẩm trong bảng giá" value={totalItems} prefix={<InboxOutlined />} />
        </Col>
        <Col xs={24} md={8}>
          <Statistic title="Nhóm khách hàng áp dụng" value={detail.customerGroup?.trim() || "Tất cả nhóm"} prefix={<TeamOutlined />} />
        </Col>
        <Col xs={24} md={8}>
          <Statistic title="Tổng số ngày hiệu lực" value={validityDays > 0 ? validityDays : "Chưa xác định"} prefix={<CalendarOutlined />} />
        </Col>
      </Row>

      <Divider />

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Descriptions
            bordered
            size="middle"
            column={1}
            items={[
              {
                key: "name",
                label: "Tên bảng giá",
                children: <Typography.Text strong>{detail.name}</Typography.Text>,
              },
              {
                key: "customerGroup",
                label: "Nhóm khách hàng",
                children: detail.customerGroup?.trim() || "Áp dụng cho nhiều nhóm khách hàng",
              },
              {
                key: "validity",
                label: "Khoảng hiệu lực",
                children: `${formatDateVi(detail.validFrom)} - ${formatDateVi(detail.validTo)}`,
              },
            ]}
          />
        </Col>
        <Col xs={24} lg={10}>
          <Card size="small" title="Theo dõi chu kỳ hiệu lực">
            <Space direction="vertical" size={10} style={{ width: "100%" }}>
              <Typography.Text type="secondary">
                Tiến độ hiệu lực hiện tại: <Typography.Text strong>{validityProgress}%</Typography.Text>
              </Typography.Text>
              <Progress percent={validityProgress} showInfo={false} status={validityProgress >= 100 ? "normal" : "active"} />
              <Space direction="vertical" size={2}>
                <Typography.Text type="secondary">
                  <ClockCircleOutlined /> Tạo lúc: {formatDateTimeVi(detail.createdAt)}
                </Typography.Text>
                <Typography.Text type="secondary">
                  <FieldTimeOutlined /> Cập nhật gần nhất: {formatDateTimeVi(detail.updatedAt)}
                </Typography.Text>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>
    </Card>
  );
};

export default PriceListInfoCard;
