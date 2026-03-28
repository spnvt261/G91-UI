import FormSectionCard from "../../components/forms/FormSectionCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomSelect from "../../components/customSelect/CustomSelect";
import CustomTextField from "../../components/customTextField/CustomTextField";
import type { PriceListStatus } from "../../models/pricing/price-list.model";
import type { PriceListFormErrors, PriceListFormItemValues, PriceListFormValues } from "./priceListForm.utils";

interface PriceListFormSectionProps {
  title?: string;
  values: PriceListFormValues;
  errors: PriceListFormErrors;
  readOnly?: boolean;
  onChange: (updater: (previous: PriceListFormValues) => PriceListFormValues) => void;
  onAddItem: () => void;
  onRemoveItem: (rowId: string) => void;
}

const STATUS_OPTIONS: Array<{ label: string; value: PriceListStatus }> = [
  { label: "ACTIVE", value: "ACTIVE" },
  { label: "INACTIVE", value: "INACTIVE" },
];

const updateItem = (
  currentItems: PriceListFormItemValues[],
  targetRowId: string,
  field: keyof Omit<PriceListFormItemValues, "rowId">,
  value: string,
): PriceListFormItemValues[] => {
  return currentItems.map((item) => (item.rowId === targetRowId ? { ...item, [field]: value } : item));
};

const PriceListFormSection = ({
  title = "Price List Information",
  values,
  errors,
  readOnly = false,
  onChange,
  onAddItem,
  onRemoveItem,
}: PriceListFormSectionProps) => {
  return (
    <FormSectionCard title={title}>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <CustomTextField
          title="Name"
          value={values.name}
          helperText={errors.name}
          error={Boolean(errors.name)}
          disabled={readOnly}
          onChange={(event) => onChange((previous) => ({ ...previous, name: event.target.value }))}
        />
        <CustomTextField
          title="Customer Group"
          value={values.customerGroup}
          disabled={readOnly}
          onChange={(event) => onChange((previous) => ({ ...previous, customerGroup: event.target.value }))}
        />
        <CustomTextField
          title="Valid From"
          value={values.validFrom}
          type="text"
          placeholder="YYYY-MM-DD"
          helperText={errors.validFrom}
          error={Boolean(errors.validFrom)}
          disabled={readOnly}
          onChange={(event) => onChange((previous) => ({ ...previous, validFrom: event.target.value }))}
        />
        <CustomTextField
          title="Valid To"
          value={values.validTo}
          type="text"
          placeholder="YYYY-MM-DD"
          helperText={errors.validTo}
          error={Boolean(errors.validTo)}
          disabled={readOnly}
          onChange={(event) => onChange((previous) => ({ ...previous, validTo: event.target.value }))}
        />
        <CustomSelect
          title="Status"
          options={STATUS_OPTIONS}
          value={values.status ? [values.status] : []}
          disable={readOnly}
          onChange={(selected) => onChange((previous) => ({ ...previous, status: (selected[0] as PriceListStatus) ?? "ACTIVE" }))}
          classNameSelect="w-full text-left"
          classNameOptions="w-full left-0"
        />
      </div>

      <div className="mt-5 rounded-lg border border-slate-200 p-4">
        <div className="mb-3 flex items-center justify-between gap-2">
          <h4 className="text-sm font-semibold text-slate-800">Items</h4>
          {!readOnly ? <CustomButton label="Add Item" className="px-2 py-1 text-sm" onClick={onAddItem} /> : null}
        </div>
        <div className="space-y-3">
          {values.items.map((item) => (
            <div key={item.rowId} className="grid grid-cols-1 gap-3 rounded border border-slate-200 p-3 md:grid-cols-[1fr_200px_auto]">
              <CustomTextField
                title="Product ID"
                value={item.productId}
                helperText={errors.itemProductMap?.[item.rowId]}
                error={Boolean(errors.itemProductMap?.[item.rowId])}
                disabled={readOnly}
                onChange={(event) =>
                  onChange((previous) => ({
                    ...previous,
                    items: updateItem(previous.items, item.rowId, "productId", event.target.value),
                  }))
                }
              />
              <CustomTextField
                title="Unit Price"
                value={item.unitPrice}
                type="number"
                helperText={errors.itemUnitPriceMap?.[item.rowId]}
                error={Boolean(errors.itemUnitPriceMap?.[item.rowId])}
                disabled={readOnly}
                onChange={(event) =>
                  onChange((previous) => ({
                    ...previous,
                    items: updateItem(previous.items, item.rowId, "unitPrice", event.target.value),
                  }))
                }
              />
              {!readOnly ? (
                <div className="flex items-end">
                  <CustomButton
                    label="Remove"
                    className="bg-red-500 px-2 py-1 text-sm hover:bg-red-600"
                    onClick={() => onRemoveItem(item.rowId)}
                    disabled={values.items.length <= 1}
                  />
                </div>
              ) : null}
            </div>
          ))}
        </div>
        {errors.items ? <p className="mt-2 text-sm text-red-500">{errors.items}</p> : null}
      </div>
    </FormSectionCard>
  );
};

export default PriceListFormSection;
