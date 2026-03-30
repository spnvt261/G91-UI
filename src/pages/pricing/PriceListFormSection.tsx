import { useMemo, useState } from "react";
import dayjs, { type Dayjs } from "dayjs";
import { ConfigProvider, DatePicker } from "antd";
import FormSectionCard from "../../components/forms/FormSectionCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomSelect, { type Option } from "../../components/customSelect/CustomSelect";
import CustomTextField from "../../components/customTextField/CustomTextField";
import DataTable, { type DataTableColumn } from "../../components/table/DataTable";
import type { PriceListStatus } from "../../models/pricing/price-list.model";
import { toCurrency } from "../shared/page.utils";
import { createEmptyPriceListItem, type PriceListFormErrors, type PriceListFormItemValues, type PriceListFormValues } from "./priceListForm.utils";

interface PriceListFormSectionProps {
  title?: string;
  values: PriceListFormValues;
  errors: PriceListFormErrors;
  readOnly?: boolean;
  productOptions?: Option[];
  loadingProducts?: boolean;
  productLoadError?: string | null;
  onRetryLoadProducts?: () => void;
  onChange: (updater: (previous: PriceListFormValues) => PriceListFormValues) => void;
  onRemoveItem: (rowId: string) => void;
}

type ItemDraftErrors = {
  productId?: string;
  unitPrice?: string;
};

const STATUS_OPTIONS: Array<{ label: string; value: PriceListStatus }> = [
  { label: "ACTIVE", value: "ACTIVE" },
  { label: "INACTIVE", value: "INACTIVE" },
];

const PROJECT_PRIMARY_COLOR = "rgb(var(--primary-color))";

const updateItem = (
  currentItems: PriceListFormItemValues[],
  targetRowId: string,
  field: keyof Omit<PriceListFormItemValues, "rowId">,
  value: string,
): PriceListFormItemValues[] => {
  return currentItems.map((item) => (item.rowId === targetRowId ? { ...item, [field]: value } : item));
};

const toDateValue = (value: string): Dayjs | null => {
  if (!value.trim()) {
    return null;
  }

  const parsed = dayjs(value);
  return parsed.isValid() ? parsed : null;
};

const toNumber = (value: string): number | undefined => {
  if (!value.trim()) {
    return undefined;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
};

const getOptionLabel = (option: Option | undefined, fallback: string) => {
  if (!option) {
    return fallback;
  }
  if (option.searchText) {
    return option.searchText;
  }
  if (typeof option.label === "string") {
    return option.label;
  }
  return fallback;
};

const PriceListFormSection = ({
  title = "Price List Information",
  values,
  errors,
  readOnly = false,
  productOptions,
  loadingProducts = false,
  productLoadError,
  onRetryLoadProducts,
  onChange,
  onRemoveItem,
}: PriceListFormSectionProps) => {
  const [draftProductId, setDraftProductId] = useState("");
  const [draftUnitPrice, setDraftUnitPrice] = useState("");
  const [draftErrors, setDraftErrors] = useState<ItemDraftErrors>({});

  const hasProductSelector = Array.isArray(productOptions);
  const validFromDate = toDateValue(values.validFrom);
  const validToDate = toDateValue(values.validTo);

  const optionById = useMemo(() => {
    return new Map((productOptions ?? []).map((option) => [option.value, option]));
  }, [productOptions]);

  const selectedProductIds = new Set(values.items.map((item) => item.productId.trim()).filter(Boolean));
  const noAvailableProducts = hasProductSelector && !loadingProducts && !productLoadError && (productOptions?.length ?? 0) === 0;
  const noRemainingProducts = hasProductSelector && (productOptions?.length ?? 0) > 0 && selectedProductIds.size >= (productOptions?.length ?? 0);
  const addFromDraftDisabled = readOnly || loadingProducts || noAvailableProducts || noRemainingProducts;

  const availableProductOptions = hasProductSelector
    ? (productOptions ?? []).filter((option) => option.value === draftProductId || !selectedProductIds.has(option.value))
    : [];

  const clearDraftError = (field: keyof ItemDraftErrors) => {
    setDraftErrors((previous) => {
      if (!previous[field]) {
        return previous;
      }

      const next = { ...previous };
      delete next[field];
      return next;
    });
  };

  const resolveProductName = (productId: string) => getOptionLabel(optionById.get(productId), productId || "-");

  const itemColumns = useMemo<DataTableColumn<PriceListFormItemValues>[]>(
    () => [
      {
        key: "productName",
        header: "Product Name",
        render: (row) => <span className="font-medium text-slate-800">{resolveProductName(row.productId)}</span>,
      },
      {
        key: "unitPrice",
        header: "Unit Price",
        render: (row) => {
          const amount = toNumber(row.unitPrice);
          return amount == null ? "-" : toCurrency(amount);
        },
      },
    ],
    [optionById],
  );

  const itemValidationRows = values.items
    .map((item, index) => ({
      index: index + 1,
      productError: errors.itemProductMap?.[item.rowId],
      unitPriceError: errors.itemUnitPriceMap?.[item.rowId],
    }))
    .filter((row) => row.productError || row.unitPriceError);

  const handleAddItem = () => {
    if (addFromDraftDisabled) {
      return;
    }

    const nextErrors: ItemDraftErrors = {};
    const parsedUnitPrice = toNumber(draftUnitPrice);
    const productId = draftProductId.trim();

    if (!productId) {
      nextErrors.productId = "Product is required.";
    } else if (values.items.some((item) => item.productId === productId)) {
      nextErrors.productId = "Product has already been added.";
    }

    if (parsedUnitPrice == null || parsedUnitPrice <= 0) {
      nextErrors.unitPrice = "Unit price must be greater than 0.";
    }

    if (Object.keys(nextErrors).length > 0) {
      setDraftErrors(nextErrors);
      return;
    }

    const newItem = createEmptyPriceListItem();
    onChange((previous) => ({
      ...previous,
      items: [
        ...previous.items,
        {
          ...newItem,
          productId,
          unitPrice: String(parsedUnitPrice),
        },
      ],
    }));
    setDraftProductId("");
    setDraftUnitPrice("");
    setDraftErrors({});
  };

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
        <div className="flex flex-col">
          <span className="font-normal text-[#000000D9] text-[1rem]">Valid From</span>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: PROJECT_PRIMARY_COLOR,
                controlOutline: "rgba(var(--primary-color),0.25)",
                borderRadius: 16,
              },
            }}
          >
            <DatePicker
              value={validFromDate}
              format="YYYY-MM-DD"
              placeholder="Select valid from date"
              disabled={readOnly}
              className={`w-full !rounded-[var(--primary-rounded)] !px-3 !py-[7px] ${
                errors.validFrom ? "!border-red-500 hover:!border-red-500" : "hover:!border-[rgba(var(--primary-color),1)]"
              }`}
              disabledDate={(current) => (validToDate ? current.endOf("day").isAfter(validToDate.endOf("day")) : false)}
              onChange={(dateValue) =>
                onChange((previous) => ({
                  ...previous,
                  validFrom: dateValue ? dateValue.format("YYYY-MM-DD") : "",
                }))
              }
            />
          </ConfigProvider>
          {errors.validFrom ? <span className="text-sm text-red-500">{errors.validFrom}</span> : null}
        </div>
        <div className="flex flex-col">
          <span className="font-normal text-[#000000D9] text-[1rem]">Valid To</span>
          <ConfigProvider
            theme={{
              token: {
                colorPrimary: PROJECT_PRIMARY_COLOR,
                controlOutline: "rgba(var(--primary-color),0.25)",
                borderRadius: 16,
              },
            }}
          >
            <DatePicker
              value={validToDate}
              format="YYYY-MM-DD"
              placeholder="Select valid to date"
              disabled={readOnly}
              className={`w-full !rounded-[var(--primary-rounded)] !px-3 !py-[7px] ${
                errors.validTo ? "!border-red-500 hover:!border-red-500" : "hover:!border-[rgba(var(--primary-color),1)]"
              }`}
              disabledDate={(current) => (validFromDate ? current.startOf("day").isBefore(validFromDate.startOf("day")) : false)}
              onChange={(dateValue) =>
                onChange((previous) => ({
                  ...previous,
                  validTo: dateValue ? dateValue.format("YYYY-MM-DD") : "",
                }))
              }
            />
          </ConfigProvider>
          {errors.validTo ? <span className="text-sm text-red-500">{errors.validTo}</span> : null}
        </div>
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
          <div className="space-y-1">
            <h4 className="text-sm font-semibold text-slate-800">Items</h4>
            {hasProductSelector ? (
              <p className="text-xs text-slate-500">
                Added: {selectedProductIds.size}/{productOptions?.length ?? 0}
              </p>
            ) : null}
          </div>
          {!readOnly && !hasProductSelector ? (
            <CustomButton
              label="+ Add Item"
              className="px-3 py-1 text-sm"
              onClick={() =>
                onChange((previous) => ({
                  ...previous,
                  items: [...previous.items, createEmptyPriceListItem()],
                }))
              }
            />
          ) : null}
        </div>

        {productLoadError ? (
          <div className="mb-3 rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            <p>{productLoadError}</p>
            {onRetryLoadProducts ? (
              <div className="mt-2">
                <CustomButton
                  label={loadingProducts ? "Retrying..." : "Retry"}
                  className="bg-red-500 px-2 py-1 text-sm hover:bg-red-600"
                  onClick={onRetryLoadProducts}
                  disabled={loadingProducts}
                />
              </div>
            ) : null}
          </div>
        ) : null}

        {hasProductSelector ? (
          <div className="space-y-3">
            <div className="grid grid-cols-1 items-end gap-3 rounded border border-slate-200 p-3 md:grid-cols-[1fr_220px_auto]">
              <CustomSelect
                title="Product"
                options={availableProductOptions}
                value={draftProductId ? [draftProductId] : []}
                helperText={draftErrors.productId}
                placeholder={loadingProducts ? "Đang tải danh sách sản phẩm..." : noRemainingProducts ? "Tất cả sản phẩm đã được thêm" : "Chọn sản phẩm"}
                disable={addFromDraftDisabled}
                search
                onChange={(selected) => {
                  setDraftProductId(selected[0] ?? "");
                  clearDraftError("productId");
                }}
                classNameSelect="w-full text-left"
                classNameOptions="w-full left-0"
              />
              <CustomTextField
                title="Unit Price"
                value={draftUnitPrice}
                type="number"
                placeholder="Ex: 125000"
                helperText={draftErrors.unitPrice}
                error={Boolean(draftErrors.unitPrice)}
                disabled={addFromDraftDisabled}
                onChange={(event) => {
                  setDraftUnitPrice(event.target.value);
                  clearDraftError("unitPrice");
                }}
              />
              <div className="flex">
                <CustomButton
                  label="Add"
                  className="h-[42px] px-4"
                  onClick={handleAddItem}
                  disabled={addFromDraftDisabled}
                />
              </div>
            </div>

            {noAvailableProducts ? <p className="text-sm text-slate-500">No active products available.</p> : null}

            <DataTable
              columns={itemColumns}
              data={values.items}
              actions={
                readOnly
                  ? undefined
                  : (row) => (
                      <CustomButton
                        label="Remove"
                        className="bg-red-500 px-2 py-1 text-sm hover:bg-red-600"
                        onClick={() => onRemoveItem(row.rowId)}
                      />
                    )
              }
              emptyText="No product added yet."
            />
          </div>
        ) : (
          <div className="space-y-3">
            {values.items.map((item, index) => (
              <div key={item.rowId} className="grid grid-cols-1 gap-3 rounded border border-slate-200 p-3 md:grid-cols-[1fr_200px_auto]">
                <p className="md:col-span-3 text-xs font-medium uppercase tracking-wide text-slate-500">Item #{index + 1}</p>
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
            {values.items.length === 0 ? <p className="text-sm text-slate-500">No item available.</p> : null}
          </div>
        )}

        {itemValidationRows.length > 0 ? (
          <div className="mt-2 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
            {itemValidationRows.map((row) => (
              <p key={`item-error-${row.index}`}>
                Item #{row.index}: {[row.productError, row.unitPriceError].filter(Boolean).join(" ")}
              </p>
            ))}
          </div>
        ) : null}
        {errors.items ? <p className="mt-2 text-sm text-red-500">{errors.items}</p> : null}
      </div>
    </FormSectionCard>
  );
};

export default PriceListFormSection;

