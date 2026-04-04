import { BellOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { Badge, Button, Card, Divider, Dropdown, Empty, Space, Typography } from "antd";

interface NotificationItem {
  id: number;
  title: string;
  time: string;
}

const placeholderNotifications: NotificationItem[] = [
  { id: 1, title: "Báo cáo doanh số tuần đã sẵn sàng.", time: "2 phút trước" },
  { id: 2, title: "Kho thép tấm G90 sắp chạm ngưỡng cảnh báo.", time: "10 phút trước" },
];

const NotificationBell = () => {
  const hasData = placeholderNotifications.length > 0;

  return (
    <Dropdown
      trigger={["click"]}
      placement="bottomRight"
      popupRender={() => (
        <Card
          variant="borderless"
          className="app-notification-dropdown"
          styles={{ body: { padding: 14 } }}
        >
          <Space orientation="vertical" size={10} style={{ width: "100%" }}>
            <Space align="center" size={8}>
              <InfoCircleOutlined style={{ color: "#1677ff" }} />
              <Typography.Text strong>Thông báo</Typography.Text>
            </Space>

            <Typography.Text type="secondary">
              Đây là khu vực thông báo tổng hợp. Dữ liệu sẽ đầy đủ hơn khi module realtime hoàn tất.
            </Typography.Text>

            <Divider style={{ margin: "2px 0" }} />

            {hasData ? (
              <Space orientation="vertical" size={10} style={{ width: "100%" }}>
                {placeholderNotifications.map((item) => (
                  <div key={item.id} className="app-notification-dropdown__item">
                    <Typography.Text>{item.title}</Typography.Text>
                    <Typography.Text type="secondary" className="app-notification-dropdown__time">
                      {item.time}
                    </Typography.Text>
                  </div>
                ))}
              </Space>
            ) : (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="Hiện chưa có thông báo mới."
              />
            )}
          </Space>
        </Card>
      )}
    >
      <Button
        type="text"
        shape="circle"
        aria-label="Mở danh sách thông báo"
        icon={
          <Badge count={placeholderNotifications.length} size="small" offset={[-1, 1]}>
            <BellOutlined />
          </Badge>
        }
      />
    </Dropdown>
  );
};

export default NotificationBell;
