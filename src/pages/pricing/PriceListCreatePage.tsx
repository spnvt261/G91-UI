import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomButton from "../../components/customButton/CustomButton";
import type { Option } from "../../components/customSelect/CustomSelect";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import { productService } from "../../services/product/product.service";
import { priceListService } from "../../services/pricing/price-list.service";
import { getErrorMessage } from "../shared/page.utils";
import PriceListFormSection from "./PriceListFormSection";
import {
  createInitialPriceListFormValues,
  toPriceListWritePayload,
  validatePriceListForm,
  type PriceListFormErrors,
} from "./priceListForm.utils";

const PriceListCreatePage = () => {
  const navigate = useNavigate();
  const { notify } = useNotify();
  const [values, setValues] = useState(createInitialPriceListFormValues());
  const [errors, setErrors] = useState<PriceListFormErrors>({});
  const [saving, setSaving] = useState(false);
  const [productOptions, setProductOptions] = useState<Option[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productLoadError, setProductLoadError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      setProductLoadError(null);
      const response = await productService.getList({
        page: 1,
        pageSize: 1000,
        status: "ACTIVE",
      });
      setProductOptions(
        response.items.map((item) => ({
          label: `${item.productCode} - ${item.productName}`,
          value: item.id,
          searchText: item.productName ?? "",
        })),
      );
    } catch (error) {
      setProductOptions([]);
      setProductLoadError(getErrorMessage(error, "Không thể load active products. Vui lòng thử lại."));
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const handleSave = async () => {
    const validationErrors = validatePriceListForm(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const message = validationErrors.name ?? validationErrors.validFrom ?? validationErrors.validTo ?? validationErrors.items;
      if (message) {
        notify(message, "error");
      }
      return;
    }

    try {
      setSaving(true);
      const created = await priceListService.create(toPriceListWritePayload(values));
      notify("Price list created successfully.", "success");
      navigate(ROUTE_URL.PRICE_LIST_DETAIL.replace(":id", created.id));
    } catch (error) {
      notify(getErrorMessage(error, "Không thể create price list"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Create Price List"
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Price List", url: ROUTE_URL.PRICE_LIST_LIST },
                { label: "Create" },
              ]}
            />
          }
        />
      }
      body={
        <div className="space-y-4">
          <PriceListFormSection
            values={values}
            errors={errors}
            productOptions={productOptions}
            loadingProducts={loadingProducts}
            productLoadError={productLoadError}
            onRetryLoadProducts={() => void loadProducts()}
            onChange={(updater) => setValues((previous) => updater(previous))}
            onRemoveItem={(rowId) =>
              setValues((previous) => ({
                ...previous,
                items: previous.items.filter((item) => item.rowId !== rowId),
              }))
            }
          />

          <div className="flex flex-wrap gap-3">
            <CustomButton label={saving ? "Saving..." : "Create Price List"} onClick={handleSave} disabled={saving} />
            <CustomButton
              label="Back"
              className="bg-slate-200 text-slate-700 hover:bg-slate-300"
              onClick={() => navigate(ROUTE_URL.PRICE_LIST_LIST)}
              disabled={saving}
            />
          </div>
        </div>
      }
    />
  );
};

export default PriceListCreatePage;

