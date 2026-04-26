import { Col, Form, Input, InputNumber, Row, Select, Space, Typography, Upload, Button } from "antd";
import { UploadOutlined } from "@ant-design/icons";
import type { RcFile } from "antd/es/upload";
import { useMemo } from "react";
import type { ProductFormErrors, ProductFormValues } from "../productForm.utils";
import { parseImageUrls } from "../productForm.utils";
import PageSectionCard from "../../shared/components/PageSectionCard";
import ProductImage from "./ProductImage";

interface ProductFormSectionsProps {
  values: ProductFormValues;
  errors: ProductFormErrors;
  disabled?: boolean;
  uploadingImages?: boolean;
  onUploadImageFiles?: (files: File[]) => Promise<void> | void;
  onFieldChange: <TField extends keyof ProductFormValues>(field: TField, value: ProductFormValues[TField]) => void;
}

const ProductFormSections = ({
  values,
  errors,
  disabled = false,
  uploadingImages = false,
  onUploadImageFiles,
  onFieldChange,
}: ProductFormSectionsProps) => {
  const imageUrls = useMemo(() => parseImageUrls(values.imageUrlsText), [values.imageUrlsText]);

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <PageSectionCard title="Thông tin cơ bản" subtitle="Nhập các trường định danh chính để phân biệt sản phẩm trong danh mục.">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="Mã sản phẩm" validateStatus={errors.productCode ? "error" : undefined} help={errors.productCode}>
              <Input
                value={values.productCode}
                onChange={(event) => onFieldChange("productCode", event.target.value)}
                placeholder="Ví dụ: THP-001"
                disabled={disabled}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Tên sản phẩm" validateStatus={errors.productName ? "error" : undefined} help={errors.productName}>
              <Input
                value={values.productName}
                onChange={(event) => onFieldChange("productName", event.target.value)}
                placeholder="Ví dụ: Thép tấm cán nóng"
                disabled={disabled}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item label="Loại sản phẩm" validateStatus={errors.type ? "error" : undefined} help={errors.type}>
              <Input
                value={values.type}
                onChange={(event) => onFieldChange("type", event.target.value)}
                placeholder="Ví dụ: Thép tấm"
                disabled={disabled}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item label="Mô tả" validateStatus={errors.description ? "error" : undefined} help={errors.description}>
              <Input.TextArea
                rows={3}
                maxLength={1000}
                showCount
                value={values.description}
                onChange={(event) => onFieldChange("description", event.target.value)}
                placeholder="Mô tả nghiệp vụ sản phẩm"
                disabled={disabled}
              />
            </Form.Item>
          </Col>
        </Row>
      </PageSectionCard>

      <PageSectionCard title="Quy cách sản phẩm" subtitle="Thông số hình học giúp đội kinh doanh và kho vận tra cứu nhanh đúng mặt hàng.">
        <Row gutter={16}>
          <Col xs={24} md={8}>
            <Form.Item label="Kích thước" validateStatus={errors.size ? "error" : undefined} help={errors.size}>
              <Input
                value={values.size}
                onChange={(event) => onFieldChange("size", event.target.value)}
                placeholder="Ví dụ: 1.500 x 3.000 mm"
                disabled={disabled}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Độ dày" validateStatus={errors.thickness ? "error" : undefined} help={errors.thickness}>
              <Input
                value={values.thickness}
                onChange={(event) => onFieldChange("thickness", event.target.value)}
                placeholder="Ví dụ: 2.0 mm"
                disabled={disabled}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={8}>
            <Form.Item label="Đơn vị" validateStatus={errors.unit ? "error" : undefined} help={errors.unit}>
              <Input
                value={values.unit}
                onChange={(event) => onFieldChange("unit", event.target.value)}
                placeholder="Ví dụ: Tấm, Kg, Mét"
                disabled={disabled}
              />
            </Form.Item>
          </Col>
        </Row>
      </PageSectionCard>

      <PageSectionCard title="Khối lượng và quy đổi" subtitle="Các chỉ số tham chiếu phục vụ báo giá và ước tính vận chuyển.">
        <Row gutter={16}>
          <Col xs={24} md={12}>
            <Form.Item label="Hệ số quy đổi khối lượng" validateStatus={errors.weightConversion ? "error" : undefined} help={errors.weightConversion}>
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                value={values.weightConversion.trim() ? Number(values.weightConversion) : null}
                onChange={(value) => onFieldChange("weightConversion", value == null ? "" : String(value))}
                placeholder="Nhập số, ví dụ 7.85"
                disabled={disabled}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={12}>
            <Form.Item label="Khối lượng tham chiếu" validateStatus={errors.referenceWeight ? "error" : undefined} help={errors.referenceWeight}>
              <InputNumber
                style={{ width: "100%" }}
                min={0}
                value={values.referenceWeight.trim() ? Number(values.referenceWeight) : null}
                onChange={(value) => onFieldChange("referenceWeight", value == null ? "" : String(value))}
                placeholder="Nhập số, ví dụ 1250"
                disabled={disabled}
              />
            </Form.Item>
          </Col>
        </Row>
      </PageSectionCard>

      <PageSectionCard title="Hình ảnh và trạng thái" subtitle="Bổ sung hình ảnh để danh mục trực quan hơn khi khách hàng và nội bộ tra cứu.">
        <Row gutter={16}>
          <Col xs={24} md={10}>
            <Form.Item label="Trạng thái sản phẩm">
              <Select
                value={values.status}
                options={[
                  { label: "Đang kinh doanh", value: "ACTIVE" },
                  { label: "Ngừng kinh doanh", value: "INACTIVE" },
                ]}
                onChange={(value) => onFieldChange("status", value)}
                disabled={disabled}
              />
            </Form.Item>
          </Col>
          <Col xs={24} md={14}>
            <Form.Item label="Tải ảnh lên">
              <Upload
                multiple
                accept="image/*"
                showUploadList={false}
                disabled={disabled || !onUploadImageFiles}
                beforeUpload={() => false}
                onChange={(info) => {
                  if (uploadingImages) {
                    return;
                  }

                  const files = info.fileList
                    .map((fileItem) => fileItem.originFileObj)
                    .filter((file): file is RcFile => Boolean(file));

                  if (files.length > 0 && onUploadImageFiles) {
                    void onUploadImageFiles(files);
                  }
                }}
              >
                <Button icon={<UploadOutlined />} loading={uploadingImages} disabled={disabled || !onUploadImageFiles}>
                  {uploadingImages ? "Đang tải ảnh..." : "Chọn ảnh và tải lên"}
                </Button>
              </Upload>
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Form.Item
              label="Danh sách liên kết ảnh"
              help={errors.imageUrlsText ?? "Nhập mỗi liên kết trên một dòng hoặc phân tách bằng dấu phẩy. Chấp nhận đường dẫn nội bộ hoặc liên kết bắt đầu bằng http/https."}
              validateStatus={errors.imageUrlsText ? "error" : undefined}
            >
              <Input.TextArea
                rows={4}
                value={values.imageUrlsText}
                onChange={(event) => onFieldChange("imageUrlsText", event.target.value)}
                placeholder={"https://ten-mien.vn/anh-1.jpg\nhttps://ten-mien.vn/anh-2.jpg"}
                disabled={disabled}
              />
            </Form.Item>
          </Col>
          <Col xs={24}>
            <Typography.Text strong>Ảnh xem trước</Typography.Text>
            <div style={{ marginTop: 8 }}>
              {imageUrls.length > 0 ? (
                <Space wrap size={8}>
                  {imageUrls.slice(0, 8).map((imageUrl) => (
                    <ProductImage
                      key={imageUrl}
                      src={imageUrl}
                      alt="Ảnh sản phẩm"
                      width={108}
                      height={80}
                      style={{ objectFit: "cover", borderRadius: 8 }}
                    />
                  ))}
                </Space>
              ) : (
                <Typography.Text type="secondary">Chưa có ảnh hợp lệ để hiển thị xem trước.</Typography.Text>
              )}
            </div>
          </Col>
        </Row>
      </PageSectionCard>
    </Space>
  );
};

export default ProductFormSections;
