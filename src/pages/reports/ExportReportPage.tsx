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
              title="Tính năng xuất báo cáo đang trong giai đoạn tích hợp backend"
              subTitle="Đội ngũ đang hoàn thiện API xuất file và cơ chế phân quyền tải xuống. Giao diện này mô phỏng đầy đủ các định dạng sẽ được hỗ trợ."
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
            message="Chưa thể xuất file ở thời điểm hiện tại"
            description="Các nút hành động đang được khóa tạm thời vì backend chưa cung cấp endpoint export chính thức. Khi hoàn tất, bạn có thể tải file trực tiếp từ trang này."
          />

          <Row gutter={[16, 16]}>
            <Col xs={24} lg={8}>
              <ExportOptionCard
                format="PDF"
                title="Báo cáo tổng hợp PDF"
                description="Phù hợp gửi cấp quản lý với bố cục trang in rõ ràng, có phần tổng quan KPI và nhận định."
                previewItems={["Trang bìa + thông tin kỳ báo cáo", "Tổng quan doanh thu, tồn kho, công nợ", "Bảng chi tiết có phân trang"]}
                disabledReason="Backend export PDF chưa hoàn thành nên chưa thể tạo tệp."
                icon={<FilePdfOutlined style={{ color: "#cf1322" }} />}
              />
            </Col>
            <Col xs={24} lg={8}>
              <ExportOptionCard
                format="Excel"
                title="Báo cáo phân tích Excel"
                description="Dành cho đội vận hành/tài chính cần lọc, đối soát và phân tích sâu theo từng cột dữ liệu."
                previewItems={["Sheet tổng quan KPI", "Sheet doanh số theo kỳ", "Sheet tồn kho và trạng thái cảnh báo"]}
                disabledReason="Backend export Excel chưa sẵn sàng để tạo dữ liệu động."
                icon={<FileExcelOutlined style={{ color: "#389e0d" }} />}
              />
            </Col>
            <Col xs={24} lg={8}>
              <ExportOptionCard
                format="CSV"
                title="Dữ liệu thô CSV"
                description="Phục vụ tích hợp nhanh với BI tool hoặc xử lý tự động qua quy trình nội bộ."
                previewItems={["Mỗi loại báo cáo một file riêng", "UTF-8, dấu phân cách chuẩn", "Tên cột tiếng Việt dễ hiểu"]}
                disabledReason="Backend export CSV chưa bật endpoint tải xuống."
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
              <Descriptions.Item label="Định danh file">
                <Typography.Text code>report-type_yyyyMMdd_HHmm</Typography.Text>
              </Descriptions.Item>
              <Descriptions.Item label="Chuẩn ngôn ngữ">Tiếng Việt đầy đủ dấu, đơn vị VND rõ ràng.</Descriptions.Item>
              <Descriptions.Item label="Phân quyền tải">
                Theo role báo cáo hiện tại, không thay đổi contract permission.
              </Descriptions.Item>
            </Descriptions>
          </Card>

          <Typography.Text type="secondary">
            Trang này đóng vai trò roadmap UI cho tính năng export: giao diện đã sẵn sàng để kích hoạt ngay khi backend hoàn thiện.
          </Typography.Text>
        </Space>
      }
    />
  );
};

export default ExportReportPage;
