import { FileExcelOutlined, FilePdfOutlined, FileTextOutlined, InfoCircleOutlined } from "@ant-design/icons";
import { Alert, Card, Col, Descriptions, Result, Row, Space, Tag, Typography } from "antd";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { ExportOptionCard, ReportPageHeader } from "./components";

const ExportReportPage = () => {
  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ReportPageHeader
          title="Xuất báo cáo"
          subtitle="Chuẩn bị bộ tính năng xuất dữ liệu chuyên nghiệp để chia sẻ báo cáo cho các cấp quản lý và đối tác."
          breadcrumbItems={[
            { label: "Trang chủ", url: ROUTE_URL.DASHBOARD },
            { label: "Báo cáo", url: ROUTE_URL.REPORT_EXPORT },
            { label: "Xuất dữ liệu" },
          ]}
        />
      }
      body={
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Card bordered={false}>
            <Result
              status="info"
              title="Tính năng xuất báo cáo đang trong giai đoạn tích hợp máy chủ"
              subTitle="Đội ngũ đang hoàn thiện dịch vụ xuất tệp và cơ chế phân quyền tải xuống. Giao diện này mô phỏng đầy đủ các định dạng sẽ được hỗ trợ."
              extra={
                <Tag icon={<InfoCircleOutlined />} color="processing">
                  Trạng thái: Sắp mở trong phiên bản tới
                </Tag>
              }
            />
          </Card>

          <Alert
            type="warning"
            showIcon
            message="Chưa thể xuất tệp ở thời điểm hiện tại"
            description="Các nút hành động đang được khóa tạm thời vì máy chủ chưa cung cấp điểm truy cập xuất báo cáo chính thức. Khi hoàn tất, bạn có thể tải tệp trực tiếp từ trang này."
          />

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={8}>
              <ExportOptionCard
                format="PDF"
                title="Báo cáo tổng hợp PDF"
                description="Phù hợp gửi cấp quản lý với bố cục trang in rõ ràng, có phần tổng quan KPI và nhận định."
                previewItems={["Trang bìa + thông tin kỳ báo cáo", "Tổng quan doanh thu, tồn kho, công nợ", "Bảng chi tiết có phân trang"]}
                disabledReason="Máy chủ chưa hoàn thành xuất PDF nên chưa thể tạo tệp."
                icon={<FilePdfOutlined style={{ color: "#cf1322" }} />}
              />
            </Col>
            <Col xs={24} lg={8}>
              <ExportOptionCard
                format="Excel"
                title="Báo cáo phân tích Excel"
                description="Dành cho đội vận hành/tài chính cần lọc, đối soát và phân tích sâu theo từng cột dữ liệu."
                previewItems={["Sheet tổng quan KPI", "Sheet doanh số theo kỳ", "Sheet tồn kho và trạng thái cảnh báo"]}
                disabledReason="Máy chủ chưa sẵn sàng xuất Excel với dữ liệu động."
                icon={<FileExcelOutlined style={{ color: "#389e0d" }} />}
              />
            </Col>
            <Col xs={24} lg={8}>
              <ExportOptionCard
                format="CSV"
                title="Dữ liệu thô CSV"
                description="Phục vụ tích hợp nhanh với công cụ phân tích hoặc xử lý tự động qua quy trình nội bộ."
                previewItems={["Mỗi loại báo cáo một tệp riêng", "UTF-8, dấu phân cách chuẩn", "Tên cột tiếng Việt dễ hiểu"]}
                disabledReason="Máy chủ chưa bật điểm tải xuống CSV."
                icon={<FileTextOutlined style={{ color: "#1677ff" }} />}
              />
            </Col>
          </Row>

          <Card bordered={false} title="Xem trước cấu trúc dữ liệu sẽ hỗ trợ">
            <Descriptions column={{ xs: 1, md: 2, xl: 3 }} bordered>
              <Descriptions.Item label="Doanh số">
                Kỳ báo cáo, doanh thu, tỷ trọng, ghi chú xu hướng.
              </Descriptions.Item>
              <Descriptions.Item label="Tồn kho">
                Mã sản phẩm, tồn khả dụng, giữ chỗ, trạng thái tồn kho.
              </Descriptions.Item>
              <Descriptions.Item label="Tài chính">
                Mã dự án, tiến độ, trạng thái, tổng công nợ liên quan.
              </Descriptions.Item>
              <Descriptions.Item label="Định danh tệp">
                <Typography.Text code>loai-bao-cao_yyyyMMdd_HHmm</Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="Chuẩn ngôn ngữ">Tiếng Việt đầy đủ dấu, đơn vị VND rõ ràng.</Descriptions.Item>
              <Descriptions.Item label="Phân quyền tải">
                Theo role báo cáo hiện tại, không thay đổi contract permission.
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Typography.Text type="secondary">
            Trang này đóng vai trò kế hoạch giao diện cho tính năng xuất báo cáo: giao diện đã sẵn sàng để kích hoạt ngay khi máy chủ hoàn thiện.
          </Typography.Text>
        </Space>
      }
    />
  );
};

export default ExportReportPage;
