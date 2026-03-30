import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { Alert, Breadcrumb, Button, Card, Space } from "antd";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import { productService } from "../../services/product/product.service";
import { getErrorMessage } from "../shared/page.utils";
import ProductFormSections from "./components/ProductFormSections";
import { createInitialProductFormValues, type ProductFormValues, toProductWritePayload, validateProductForm } from "./productForm.utils";

const ProductCreatePage = () => {
  const navigate = useNavigate();
  const { notify } = useNotify();

  const [values, setValues] = useState(createInitialProductFormValues());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const handleFieldChange = <TField extends keyof ProductFormValues>(field: TField, value: ProductFormValues[TField]) => {
    setValues((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    const validationErrors = validateProductForm(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const firstError = Object.values(validationErrors)[0];
      if (firstError) {
        notify(firstError, "error");
      }
      return;
    }

    try {
      setSaving(true);
      const created = await productService.create(toProductWritePayload(values));
      notify("Đã tạo sản phẩm thành công.", "success");
      navigate(ROUTE_URL.PRODUCT_DETAIL.replace(":id", created.id));
    } catch (error) {
      notify(getErrorMessage(error, "Không thể tạo sản phẩm."), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      loading={false}
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Tạo sản phẩm mới"
          subtitle="Điền thông tin theo từng nhóm nghiệp vụ để sản phẩm hiển thị đẹp và đầy đủ trong catalog."
          breadcrumb={
            <Breadcrumb
              items={[
                { title: "Trang chủ" },
                { title: "Sản phẩm" },
                { title: "Tạo mới" },
              ]}
            />
          }
        />
      }
      body={
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <Alert
            type="info"
            showIcon
            message="Gợi ý nhập liệu"
            description="Bạn có thể nhập nhiều URL ảnh trong một ô để tạo gallery sản phẩm ngay sau khi lưu."
          />

          <ProductFormSections values={values} errors={errors} onFieldChange={handleFieldChange} disabled={saving} />

          <Card
            bordered
            styles={{ body: { padding: 16 } }}
            style={{ position: "sticky", bottom: 12, zIndex: 8, boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)" }}
          >
            <Space wrap>
              <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => void handleSubmit()}>
                Lưu sản phẩm
              </Button>
              <Button icon={<ArrowLeftOutlined />} disabled={saving} onClick={() => navigate(ROUTE_URL.PRODUCT_LIST)}>
                Quay lại
              </Button>
            </Space>
          </Card>
        </Space>
      }
    />
  );
};

export default ProductCreatePage;
