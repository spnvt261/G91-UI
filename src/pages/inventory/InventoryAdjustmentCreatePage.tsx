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
import { inventoryService } from "../../services/inventory/inventory.service";
import { productService } from "../../services/product/product.service";
import { getErrorMessage } from "../shared/page.utils";

const InventoryAdjustmentCreatePage = () => {
  const navigate = useNavigate();
  const { notify } = useNotify();
  const [productId, setProductId] = useState("");
  const [adjustmentQuantity, setAdjustmentQuantity] = useState("");
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productOptions, setProductOptions] = useState<Option[]>([]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        const response = await productService.getList({ page: 1, size: 1000 });
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

  const errors = useMemo(() => {
    const validationErrors: Record<string, string> = {};
    const parsedQuantity = Number(adjustmentQuantity);

    if (!productId) {
      validationErrors.productId = "Product is required.";
    }
    if (!Number.isFinite(parsedQuantity) || parsedQuantity === 0) {
      validationErrors.adjustmentQuantity = "Adjustment quantity must not be 0.";
    }

    return validationErrors;
  }, [adjustmentQuantity, productId]);

  const handleSave = async () => {
    if (Object.keys(errors).length > 0) {
      notify(Object.values(errors)[0] ?? "Please check input values.", "error");
      return;
    }

    try {
      setSaving(true);
      await inventoryService.createAdjustment({
        productId,
        adjustmentQuantity: Number(adjustmentQuantity),
        reason: reason.trim() || undefined,
        note: note.trim() || undefined,
      });
      notify("Inventory adjustment created successfully.", "success");
      navigate(ROUTE_URL.INVENTORY_STATUS);
    } catch (error) {
      notify(getErrorMessage(error, "Cannot create inventory adjustment"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Create Inventory Adjustment"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Inventory", url: ROUTE_URL.INVENTORY_STATUS },
                { label: "Adjustment" },
              ]}
            />
          }
        />
      }
      body={
        <FormSectionCard title="Adjustment Information">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <CustomSelect
              title="Product"
              options={productOptions}
              value={productId ? [productId] : []}
              onChange={(selected) => setProductId(selected[0] ?? "")}
              classNameSelect="w-full text-left"
              classNameOptions="w-full left-0"
              search
              disable={loadingProducts}
              helperText={errors.productId}
            />
            <CustomTextField
              title="Adjustment Quantity"
              type="number"
              value={adjustmentQuantity}
              helperText={errors.adjustmentQuantity}
              error={Boolean(errors.adjustmentQuantity)}
              onChange={(event) => setAdjustmentQuantity(event.target.value)}
            />
            <CustomTextField title="Reason" value={reason} onChange={(event) => setReason(event.target.value)} />
            <CustomTextField title="Note" value={note} onChange={(event) => setNote(event.target.value)} />
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <CustomButton label={saving ? "Saving..." : "Create Adjustment"} onClick={handleSave} disabled={saving} />
            <CustomButton
              label="Back"
              className="bg-slate-200 text-slate-700 hover:bg-slate-300"
              onClick={() => navigate(ROUTE_URL.INVENTORY_STATUS)}
              disabled={saving}
            />
          </div>
        </FormSectionCard>
      }
    />
  );
};

export default InventoryAdjustmentCreatePage;
