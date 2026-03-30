import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FormSectionCard from "../../components/forms/FormSectionCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomSelect, { type Option } from "../../components/customSelect/CustomSelect";
import CustomTextField from "../../components/customTextField/CustomTextField";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import { productService } from "../../services/product/product.service";
import { getErrorMessage } from "../shared/page.utils";
import { createInitialProductFormValues, toProductWritePayload, validateProductForm } from "./productForm.utils";

const STATUS_OPTIONS: Option[] = [
  { label: "ACTIVE", value: "ACTIVE" },
  { label: "INACTIVE", value: "INACTIVE" },
];

const ProductEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { notify } = useNotify();
  const [values, setValues] = useState(createInitialProductFormValues());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      try {
        setLoading(true);
        const detail = await productService.getDetail(id);
        setValues(createInitialProductFormValues(detail));
      } catch (error) {
        notify(getErrorMessage(error, "Không thể load product"), "error");
        navigate(ROUTE_URL.PRODUCT_LIST, { replace: true });
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id, navigate, notify]);

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
      notify("Product updated successfully.", "success");
      navigate(ROUTE_URL.PRODUCT_DETAIL.replace(":id", id));
    } catch (error) {
      notify(getErrorMessage(error, "Không thể update product"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      loading={loading}
      loadingText="Đang tải thông tin sản phẩm..."
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Update Product"
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Products", url: ROUTE_URL.PRODUCT_LIST },
                { label: "Update" },
              ]}
            />
          }
        />
      }
      body={
        <FormSectionCard title="Product Information">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <CustomTextField
              title="Product Code"
              value={values.productCode}
              helperText={errors.productCode}
              error={Boolean(errors.productCode)}
              onChange={(event) => setValues((previous) => ({ ...previous, productCode: event.target.value }))}
            />
            <CustomTextField
              title="Product Name"
              value={values.productName}
              helperText={errors.productName}
              error={Boolean(errors.productName)}
              onChange={(event) => setValues((previous) => ({ ...previous, productName: event.target.value }))}
            />
            <CustomTextField
              title="Type"
              value={values.type}
              helperText={errors.type}
              error={Boolean(errors.type)}
              onChange={(event) => setValues((previous) => ({ ...previous, type: event.target.value }))}
            />
            <CustomTextField
              title="Size"
              value={values.size}
              helperText={errors.size}
              error={Boolean(errors.size)}
              onChange={(event) => setValues((previous) => ({ ...previous, size: event.target.value }))}
            />
            <CustomTextField
              title="Thickness"
              value={values.thickness}
              helperText={errors.thickness}
              error={Boolean(errors.thickness)}
              onChange={(event) => setValues((previous) => ({ ...previous, thickness: event.target.value }))}
            />
            <CustomTextField
              title="Unit"
              value={values.unit}
              helperText={errors.unit}
              error={Boolean(errors.unit)}
              onChange={(event) => setValues((previous) => ({ ...previous, unit: event.target.value }))}
            />
            <CustomTextField
              title="Weight Conversion"
              type="number"
              value={values.weightConversion}
              helperText={errors.weightConversion}
              error={Boolean(errors.weightConversion)}
              onChange={(event) => setValues((previous) => ({ ...previous, weightConversion: event.target.value }))}
            />
            <CustomTextField
              title="Reference Weight"
              type="number"
              value={values.referenceWeight}
              helperText={errors.referenceWeight}
              error={Boolean(errors.referenceWeight)}
              onChange={(event) => setValues((previous) => ({ ...previous, referenceWeight: event.target.value }))}
            />
            <CustomSelect
              title="Status"
              options={STATUS_OPTIONS}
              value={values.status ? [values.status] : []}
              onChange={(selected) => setValues((previous) => ({ ...previous, status: (selected[0] as "ACTIVE" | "INACTIVE") ?? "ACTIVE" }))}
              classNameSelect="w-full text-left"
              classNameOptions="w-full left-0"
            />
            <div className="md:col-span-2">
              <CustomTextField
                title="Image URLs (one per line or comma separated)"
                value={values.imageUrlsText}
                helperText={errors.imageUrlsText}
                error={Boolean(errors.imageUrlsText)}
                onChange={(event) => setValues((previous) => ({ ...previous, imageUrlsText: event.target.value }))}
              />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <CustomButton label={saving ? "Saving..." : "Save Changes"} onClick={handleSubmit} disabled={saving} />
            <CustomButton
              label="Cancel"
              className="bg-slate-200 text-slate-700 hover:bg-slate-300"
              onClick={() => navigate(ROUTE_URL.PRODUCT_DETAIL.replace(":id", id ?? ""))}
              disabled={saving}
            />
          </div>
        </FormSectionCard>
      }
    />
  );
};

export default ProductEditPage;


