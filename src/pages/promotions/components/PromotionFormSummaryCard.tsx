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

const PromotionFormSummaryCard = ({ formValues, title = "Tom tat chuong trinh", className }: PromotionFormSummaryCardProps) => {
  const normalizedStatus: PromotionStatus =
    formValues.status === "ACTIVE" || formValues.status === "INACTIVE" || formValues.status === "DRAFT"
      ? formValues.status
      : "DRAFT";
  const promotionTypeLabel =
    formValues.promotionType === "PERCENTAGE" || formValues.promotionType === "FIXED_AMOUNT"
      ? getPromotionTypeLabel(formValues.promotionType)
      : "Chua chon";
  const hasDiscountValue = Number.isFinite(Number(formValues.discountValue)) && Number(formValues.discountValue) > 0;

  return (
    <Card bordered={false} className={`shadow-sm ${className ?? ""}`.trim()}>
      <Space direction="vertical" size={12} style={{ width: "100%" }}>
        <Space direction="vertical" size={2} style={{ width: "100%" }}>
          <Typography.Title level={5} className="!mb-0">
            {title}
          </Typography.Title>
          <Typography.Text type="secondary">Kiem tra nhanh cau hinh truoc khi luu chuong trinh.</Typography.Text>
        </Space>

        <Descriptions column={1} size="small" colon={false} labelStyle={{ width: 150 }}>
          <Descriptions.Item label="Ten chuong trinh">
            {formValues.name.trim() || <Typography.Text type="secondary">Chua nhap</Typography.Text>}
          </Descriptions.Item>
          <Descriptions.Item label="Loai giam gia">{promotionTypeLabel}</Descriptions.Item>
          <Descriptions.Item label="Gia tri giam">
            {hasDiscountValue ? (
              formatPromotionDiscountValue({
                promotionType: formValues.promotionType === "FIXED_AMOUNT" ? "FIXED_AMOUNT" : "PERCENTAGE",
                discountValue: Number(formValues.discountValue),
              })
            ) : (
              <Typography.Text type="secondary">Chua nhap</Typography.Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Hieu luc">
            {formValues.startDate || formValues.endDate ? (
              <span>
                {formatPromotionDate(formValues.startDate)} - {formatPromotionDate(formValues.endDate)}
              </span>
            ) : (
              <Typography.Text type="secondary">Chua chon thoi gian</Typography.Text>
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Priority">{formValues.priority ?? "Chua dat"}</Descriptions.Item>
          <Descriptions.Item label="San pham ap dung">{formValues.productIds.length} san pham</Descriptions.Item>
          <Descriptions.Item label="Nhom khach hang">{formValues.customerGroups.length > 0 ? formValues.customerGroups.join(", ") : "Tat ca"}</Descriptions.Item>
          <Descriptions.Item label="Trang thai">
            <PromotionStatusTag status={normalizedStatus} withDot />
          </Descriptions.Item>
        </Descriptions>
      </Space>
    </Card>
  );
};

export default PromotionFormSummaryCard;
