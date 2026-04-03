import { CloseOutlined, SaveOutlined } from "@ant-design/icons";
import { Breadcrumb, Button, Card, Space } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import { productService } from "../../services/product/product.service";
import InlinePageStatus from "../shared/components/InlinePageStatus";
import { getErrorMessage } from "../shared/page.utils";
import ProductFormSections from "./components/ProductFormSections";
import { createInitialProductFormValues, parseImageUrls, type ProductFormValues, toProductWritePayload, validateProductForm } from "./productForm.utils";

const ProductEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useNotify();

  const [values, setValues] = useState(createInitialProductFormValues());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const handleFieldChange = <TField extends keyof ProductFormValues>(field: TField, value: ProductFormValues[TField]) => {
    setValues((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const loadDetail = useCallback(async () => {
    if (!id) {
      setLoadError("Không tìm thấy mã sản phẩm để chỉnh sửa.");
      return;
    }

    try {
      setLoading(true);
      setLoadError(null);
      const detail = await productService.getDetail(id);
      setValues(createInitialProductFormValues(detail));
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải thông tin sản phẩm.");
      setLoadError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [id, notify]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const handleSubmit = async () => {
    if (!id) {
      return;
    }

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
      await productService.update(id, toProductWritePayload(values));
      notify("Đã lưu thay đổi sản phẩm.", "success");
      navigate(ROUTE_URL.PRODUCT_DETAIL.replace(":id", id));
    } catch (error) {
      notify(getErrorMessage(error, "Không thể cập nhật sản phẩm."), "error");
    } finally {
      setSaving(false);
    }
  };

  const handleUploadImageFiles = async (files: File[]) => {
    try {
      setUploadingImages(true);
      const imageUrls = await productService.uploadImages(files);
      if (!imageUrls.length) {
        notify("Không nhận được URL ảnh từ hệ thống upload.", "warning");
        return;
      }

      const merged = [...new Set([...parseImageUrls(values.imageUrlsText), ...imageUrls])];
      setValues((previous) => ({
        ...previous,
        imageUrlsText: merged.join("\n"),
      }));
      notify(`Đã tải lên ${imageUrls.length} ảnh.`, "success");
    } catch (error) {
      notify(getErrorMessage(error, "Không thể tải ảnh lên."), "error");
    } finally {
      setUploadingImages(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      loading={false}
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Chỉnh sửa sản phẩm"
          subtitle="Cập nhật thông tin sản phẩm và giữ trải nghiệm catalog nhất quán."
          breadcrumb={
            <Breadcrumb
              items={[
                { title: "Trang chủ" },
                { title: "Sản phẩm" },
                { title: "Chỉnh sửa" },
              ]}
            />
          }
        />
      }
      body={
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          {loading ? <InlinePageStatus mode="loading" title="Đang tải dữ liệu sản phẩm..." /> : null}

          {!loading && loadError ? (
            <InlinePageStatus
              mode="error"
              title="Không thể tải dữ liệu để chỉnh sửa"
              description={loadError}
              actionLabel="Thử tải lại"
              onAction={() => void loadDetail()}
            />
          ) : null}

          {!loading && !loadError ? (
            <>
              <ProductFormSections
                values={values}
                errors={errors}
                onFieldChange={handleFieldChange}
                disabled={saving}
                uploadingImages={uploadingImages}
                onUploadImageFiles={handleUploadImageFiles}
              />

              <Card
                bordered
                styles={{ body: { padding: 16 } }}
                style={{ position: "sticky", bottom: 12, zIndex: 8, boxShadow: "0 8px 20px rgba(15, 23, 42, 0.08)" }}
              >
                <Space wrap>
                  <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => void handleSubmit()}>
                    Lưu thay đổi
                  </Button>
                  <Button
                    icon={<CloseOutlined />}
                    disabled={saving}
                    onClick={() => navigate(id ? ROUTE_URL.PRODUCT_DETAIL.replace(":id", id) : ROUTE_URL.PRODUCT_LIST)}
                  >
                    Hủy
                  </Button>
                </Space>
              </Card>
            </>
          ) : null}
        </Space>
      }
    />
  );
};

export default ProductEditPage;
