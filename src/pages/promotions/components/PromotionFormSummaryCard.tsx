import { Card, Descriptions, Space, Typography } from "antd";
import type { PromotionStatus } from "../../../models/promotion/promotion.model";
import type { PromotionFormValues } from "../promotionForm.utils";
import { formatPromotionDate, formatPromotionDiscountValue, getPromotionTypeLabel } from "../promotion.utils";
import PromotionStatusTag from "./PromotionStatusTag";

interface PromotionFormSummaryCardProps {
  formValues: PromotionFormValues;
  title?: string;
  className?: string;
}

const PromotionFormSummaryCard = ({ formValues, title = "Tóm tắt chương trình", className }: PromotionFormSummaryCardProps) => {
  const normalizedStatus: PromotionStatus =
    formValues.status === "ACTIVE" || formValues.status === "INACTIVE" || formValues.status === "DRAFT"
      ? formValues.status
      : "DRAFT";
  const promotionTypeLabel =
    formValues.promotionType === "PERCENTAGE" || formValues.promotionType === "FIXED_AMOUNT"
      ? getPromotionTypeLabel(formValues.promotionType)
      : "Chưa chọn";
  const hasDiscountValue = Number.isFinite(Number(formValues.discountValue)) && Number(formValues.discountValue) > 0;

  return (
    <Card bordered={false} className={`shadow-sm ${className ?? ""}`.trim()}>
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <Space direction="vertical" size={2} style={{ width: "100%" }}>
          <Typography.Title level={5} className="!mb-0">
            {title}
          </Typography.Title>
          <Typography.Text type="secondary">Kiểm tra nhanh cấu hình trước khi lưu chương trình.</Typography.Text>
        </Space>

        <Descriptions column={1} size="small" colon={false} labelStyle={{ width: 150 }}>
          <Descriptions.Item label="Tên chương trình">
            {formValues.name.trim() || <Typography.Text type="secondary">Chưa nhập</Typography.Text>}
          </Descriptions.Item>
          <Descriptions.Item label="Loại giảm giá">{promotionTypeLabel}</Descriptions.Item>
          <Descriptions.Item label="Giá trị giảm">
            {hasDiscountValue ? (
              formatPromotionDiscountValue({
                promotionType: formValues.promotionType === "FIXED_AMOUNT" ? "FIXED_AMOUNT" : "PERCENTAGE",
                discountValue: Number(formValues.discountValue),
              })
            ) : (
              <Typography.Text type="secondary">Chưa nhập</Typography.Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Hiệu lực">
            {formValues.startDate || formValues.endDate ? (
              <span>
                {formatPromotionDate(formValues.startDate)} - {formatPromotionDate(formValues.endDate)}
              </span>
            ) : (
              <Typography.Text type="secondary">Chưa chọn thời gian</Typography.Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Sản phẩm áp dụng">{formValues.productIds.length} sản phẩm</Descriptions.Item>
          <Descriptions.Item label="Trạng thái">
            <PromotionStatusTag status={normalizedStatus} withDot />
          </Descriptions.Item>
        </Descriptions>
      </Space>
    </Card>
  );
};

export default PromotionFormSummaryCard;
