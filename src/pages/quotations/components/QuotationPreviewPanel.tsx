import { Alert, Badge, Card, Descriptions, Divider, Space, Typography } from "antd";
import type { QuotationPreviewResponseData } from "../../../models/quotation/quotation.model";
import { formatQuotationCurrency, formatQuotationDate } from "../quotation.ui";

interface QuotationPreviewPanelProps {
  lineItems: number;
  estimatedSubTotal: number;
  preview: QuotationPreviewResponseData | null;
  previewStale: boolean;
  minSubmitAmount: number;
}

const QuotationPreviewPanel = ({
  lineItems,
  estimatedSubTotal,
  preview,
  previewStale,
  minSubmitAmount,
}: QuotationPreviewPanelProps) => {
  const summary = preview?.summary;
  const isPreviewValid = preview?.validation ? preview.validation.valid : true;
  const previewMessages = preview?.validation?.messages ?? [];
  const statusText = !preview ? "Chưa xem trước" : previewStale ? "Bản xem trước đã cũ" : "Bản xem trước mới nhất";
  const statusType = !preview ? "default" : previewStale ? "warning" : isPreviewValid ? "success" : "error";
  const totalAmount = summary?.totalAmount ?? estimatedSubTotal;
  const discountAmount = summary?.discountAmount ?? 0;
  const subTotal = summary?.subTotal ?? estimatedSubTotal;

  return (
    <Card bordered={false} className="border border-slate-200">
      <Space direction="vertical" size={14} style={{ width: "100%" }}>
        <Space direction="vertical" size={0}>
          <Typography.Title level={5} className="!mb-0">
            Xem trước báo giá
          </Typography.Title>
          <Typography.Text type="secondary">Kiểm tra nhanh tổng giá trị và trạng thái hợp lệ trước khi gửi báo giá.</Typography.Text>
        </Space>

        <Badge status={statusType} text={statusText} />

        {!preview ? (
          <Alert type="info" showIcon message="Bạn chưa xem trước báo giá. Hãy bấm “Xem trước” để kiểm tra trước khi gửi." />
        ) : null}

        {previewStale ? (
          <Alert
            type="warning"
            showIcon
            message="Dữ liệu đã thay đổi sau lần xem trước gần nhất."
            description="Vui lòng xem trước lại để đảm bảo tổng tiền và hạn hiệu lực luôn chính xác."
          />
        ) : null}

        {previewMessages.length > 0 ? (
          <Alert type="warning" showIcon message="Cần xử lý trước khi gửi báo giá." description={previewMessages.join(" ")} />
        ) : null}

        <Descriptions column={1} size="small" colon={false}>
          <Descriptions.Item label="Số dòng hàng">{lineItems}</Descriptions.Item>
          <Descriptions.Item label="Tạm tính">{formatQuotationCurrency(subTotal)}</Descriptions.Item>
          <Descriptions.Item label="Giảm giá">{formatQuotationCurrency(discountAmount)}</Descriptions.Item>
          <Descriptions.Item label="Tổng cuối">
            <Typography.Text strong>{formatQuotationCurrency(totalAmount)}</Typography.Text>
          </Descriptions.Item>
          <Descriptions.Item label="Hiệu lực đến">{formatQuotationDate(preview?.validUntil, "Sẽ có sau khi xem trước")}</Descriptions.Item>
        </Descriptions>

        <Divider style={{ margin: 0 }} />

        <Typography.Text type={totalAmount < minSubmitAmount ? "warning" : "secondary"}>
          {totalAmount < minSubmitAmount
            ? `Tổng giá trị cần từ ${formatQuotationCurrency(minSubmitAmount)} để có thể gửi báo giá.`
            : "Tổng giá trị đáp ứng điều kiện gửi báo giá."}
        </Typography.Text>
      </Space>
    </Card>
  );
};

export default QuotationPreviewPanel;
