import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { promotionService } from "../../services/promotion/promotion.service";
import { getErrorMessage } from "../shared/page.utils";
import { createInitialPromotionFormValues, toPromotionWritePayload, validatePromotionForm } from "./promotionForm.utils";
import { PROMOTION_STATUS_OPTIONS, PROMOTION_TYPE_OPTIONS } from "./promotion.utils";

const PromotionCreatePage = () => {
  const navigate = useNavigate();
  const { notify } = useNotify();

  const [formValues, setFormValues] = useState(createInitialPromotionFormValues());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [productOptions, setProductOptions] = useState<Option[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const response = await productService.getList({
          page: 1,
          pageSize: 1000,
        });
        setProductOptions(
          response.items.map((item) => ({
            label: `${item.productCode} - ${item.productName}`,
            value: item.id,
          })),
        );
      } catch {
        setProductOptions([]);
      } finally {
        setLoadingProducts(false);
      }
    };

    void loadProducts();
  }, []);

  const typeSelectOptions = useMemo<Option[]>(
    () =>
      PROMOTION_TYPE_OPTIONS.map((item) => ({
        label: item.label,
        value: item.value,
      })),
    [],
  );

  const statusSelectOptions = useMemo<Option[]>(
    () =>
      PROMOTION_STATUS_OPTIONS.map((item) => ({
        label: item.label,
        value: item.value,
      })),
    [],
  );

  const handleSubmit = async () => {
    const validationErrors = validatePromotionForm(formValues);
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
      const response = await promotionService.create(toPromotionWritePayload(formValues));
      notify("Promotion created successfully.", "success");
      navigate(ROUTE_URL.PROMOTION_DETAIL.replace(":id", response.promotion.id));
    } catch (error) {
      notify(getErrorMessage(error, "Cannot create promotion"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Create Promotion"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Promotions", url: ROUTE_URL.PROMOTION_LIST },
                { label: "Create" },
              ]}
            />
          }
        />
      }
      body={
        <FormSectionCard title="Promotion Information">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <CustomTextField
              title="Code (optional)"
              value={formValues.code}
              onChange={(event) => setFormValues((previous) => ({ ...previous, code: event.target.value }))}
            />
            <CustomTextField
              title="Name"
              value={formValues.name}
              helperText={errors.name}
              error={Boolean(errors.name)}
              onChange={(event) => setFormValues((previous) => ({ ...previous, name: event.target.value }))}
            />
            <CustomSelect
              title="Promotion Type"
              options={typeSelectOptions}
              value={formValues.promotionType ? [formValues.promotionType] : []}
              onChange={(value) => setFormValues((previous) => ({ ...previous, promotionType: value[0] ?? "" }))}
              classNameSelect="w-full text-left"
              classNameOptions="w-full left-0"
              placeholder="Select promotion type"
              helperText={errors.promotionType}
            />
            <CustomTextField
              title="Discount Value"
              value={formValues.discountValue}
              type="number"
              helperText={errors.discountValue}
              error={Boolean(errors.discountValue)}
              onChange={(event) => setFormValues((previous) => ({ ...previous, discountValue: event.target.value }))}
            />
            <CustomTextField
              title="Start Date (YYYY-MM-DD)"
              value={formValues.startDate}
              helperText={errors.startDate}
              error={Boolean(errors.startDate)}
              onChange={(event) => setFormValues((previous) => ({ ...previous, startDate: event.target.value }))}
            />
            <CustomTextField
              title="End Date (YYYY-MM-DD)"
              value={formValues.endDate}
              helperText={errors.endDate}
              error={Boolean(errors.endDate)}
              onChange={(event) => setFormValues((previous) => ({ ...previous, endDate: event.target.value }))}
            />
            <CustomSelect
              title="Status"
              options={statusSelectOptions}
              value={formValues.status ? [formValues.status] : []}
              onChange={(value) => setFormValues((previous) => ({ ...previous, status: value[0] ?? "" }))}
              classNameSelect="w-full text-left"
              classNameOptions="w-full left-0"
              placeholder="Select status"
              helperText={errors.status}
            />
            <CustomSelect
              title="Products (optional)"
              options={productOptions}
              value={formValues.productIds}
              onChange={(values) => setFormValues((previous) => ({ ...previous, productIds: values }))}
              classNameSelect="w-full text-left"
              classNameOptions="w-full left-0"
              placeholder={loadingProducts ? "Loading products..." : "Select products"}
              multiple
              search
              disable={loadingProducts}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <CustomButton label={saving ? "Saving..." : "Create Promotion"} onClick={handleSubmit} disabled={saving} />
            <CustomButton
              label="Back"
              className="bg-slate-200 text-slate-700 hover:bg-slate-300"
              onClick={() => navigate(ROUTE_URL.PROMOTION_LIST)}
            />
          </div>
        </FormSectionCard>
      }
    />
  );
};

export default PromotionCreatePage;
