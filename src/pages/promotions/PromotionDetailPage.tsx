import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import FormSectionCard from "../../components/forms/FormSectionCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomSelect, { type Option } from "../../components/customSelect/CustomSelect";
import CustomTextField from "../../components/customTextField/CustomTextField";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { PromotionDetail } from "../../models/promotion/promotion.model";
import { productService } from "../../services/product/product.service";
import { promotionService } from "../../services/promotion/promotion.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage } from "../shared/page.utils";
import { createInitialPromotionFormValues, toPromotionWritePayload, validatePromotionForm, type PromotionFormErrors } from "./promotionForm.utils";
import {
  canEditPromotion,
  formatPromotionDate,
  formatPromotionDiscountValue,
  getPromotionStatusBadgeClassName,
  getPromotionStatusLabel,
  getPromotionTypeLabel,
  PROMOTION_STATUS_OPTIONS,
  PROMOTION_TYPE_OPTIONS,
} from "./promotion.utils";

const toOptionMap = (options: Option[]): Map<string, Option> => new Map(options.map((item) => [item.value, item]));

const PromotionDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { notify } = useNotify();
  const role = getStoredUserRole();
  const canModify = canEditPromotion(role);

  const [promotion, setPromotion] = useState<PromotionDetail | null>(null);
  const [formValues, setFormValues] = useState(createInitialPromotionFormValues());
  const [errors, setErrors] = useState<PromotionFormErrors>({});
  const [productOptions, setProductOptions] = useState<Option[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    const mode = searchParams.get("mode");
    setEditMode(canModify && mode === "edit");
  }, [canModify, searchParams]);

  useEffect(() => {
    const loadDetail = async () => {
      if (!id) {
        return;
      }

      try {
        setLoading(true);
        const response = await promotionService.getDetail(id);
        setPromotion(response.promotion);
        setFormValues(createInitialPromotionFormValues(response.promotion));
      } catch (error) {
        notify(getErrorMessage(error, "Không thể load promotion detail"), "error");
        navigate(ROUTE_URL.PROMOTION_LIST, { replace: true });
      } finally {
        setLoading(false);
      }
    };

    void loadDetail();
  }, [id, navigate, notify]);

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

  const mergedProductOptions = useMemo<Option[]>(() => {
    const optionMap = toOptionMap(productOptions);
    const fallbackProductIds = promotion?.productIds ?? [];

    fallbackProductIds.forEach((productId) => {
      if (!optionMap.has(productId)) {
        optionMap.set(productId, { label: productId, value: productId });
      }
    });

    return Array.from(optionMap.values());
  }, [productOptions, promotion?.productIds]);

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

  const handleStartEdit = () => {
    if (!canModify) {
      return;
    }

    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set("mode", "edit");
      return next;
    });
  };

  const handleCancelEdit = () => {
    setErrors({});
    if (promotion) {
      setFormValues(createInitialPromotionFormValues(promotion));
    }

    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.delete("mode");
      return next;
    });
  };

  const handleSave = async () => {
    if (!id) {
      return;
    }

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
      const response = await promotionService.update(id, toPromotionWritePayload(formValues));
      setPromotion(response.promotion);
      setFormValues(createInitialPromotionFormValues(response.promotion));
      notify("Promotion updated successfully.", "success");
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);
        next.delete("mode");
        return next;
      });
    } catch (error) {
      notify(getErrorMessage(error, "Không thể update promotion"), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      loading={loading}
      loadingText="Äang táº£i promotion..."
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Promotion Detail"
          actions={
            <div className="flex flex-wrap gap-2">
              {canModify && !editMode ? <CustomButton label="Edit" onClick={handleStartEdit} /> : null}
              {canModify && editMode ? (
                <CustomButton
                  label="Cancel Edit"
                  className="bg-slate-200 text-slate-700 hover:bg-slate-300"
                  onClick={handleCancelEdit}
                  disabled={saving}
                />
              ) : null}
              <CustomButton
                label="Back"
                className="bg-slate-200 text-slate-700 hover:bg-slate-300"
                onClick={() => navigate(ROUTE_URL.PROMOTION_LIST)}
              />
            </div>
          }
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chá»§" },
                { label: "Promotions", url: ROUTE_URL.PROMOTION_LIST },
                { label: "Detail" },
              ]}
            />
          }
        />
      }
      body={
        <div className="space-y-4">
          {!editMode ? (
            <BaseCard>
              {promotion ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                    <p>
                      <span className="font-semibold">Name:</span> {promotion.name}
                    </p>
                    <p>
                      <span className="font-semibold">Code:</span> {promotion.code ?? "-"}
                    </p>
                    <p>
                      <span className="font-semibold">Type:</span> {getPromotionTypeLabel(promotion.promotionType)}
                    </p>
                    <p>
                      <span className="font-semibold">Discount:</span> {formatPromotionDiscountValue(promotion)}
                    </p>
                    <p>
                      <span className="font-semibold">Start Date:</span> {formatPromotionDate(promotion.startDate)}
                    </p>
                    <p>
                      <span className="font-semibold">End Date:</span> {formatPromotionDate(promotion.endDate)}
                    </p>
                    <p>
                      <span className="font-semibold">Status:</span>{" "}
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getPromotionStatusBadgeClassName(
                          promotion.status,
                        )}`}
                      >
                        {getPromotionStatusLabel(promotion.status)}
                      </span>
                    </p>
                    <p>
                      <span className="font-semibold">Product Count:</span> {promotion.productCount ?? 0}
                    </p>
                    <p>
                      <span className="font-semibold">Created By:</span> {promotion.createdBy ?? "-"}
                    </p>
                    <p>
                      <span className="font-semibold">Created At:</span> {formatPromotionDate(promotion.createdAt)}
                    </p>
                    <p className="sm:col-span-2">
                      <span className="font-semibold">Updated At:</span> {formatPromotionDate(promotion.updatedAt)}
                    </p>
                  </div>

                  <div>
                    <h3 className="mb-2 text-sm font-semibold text-slate-700">Applicable Products</h3>
                    {(promotion.applicableProducts?.length ?? 0) > 0 ? (
                      <div className="space-y-2">
                        {promotion.applicableProducts?.map((item) => (
                          <div key={item.productId} className="rounded border border-slate-200 px-3 py-2 text-sm">
                            <p className="font-semibold text-slate-800">{item.productName ?? item.productId}</p>
                            <p className="text-slate-500">{item.productCode ?? item.productId}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500">No product scope configured.</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-slate-500">No promotion data.</p>
              )}
            </BaseCard>
          ) : (
            <FormSectionCard title="Update Promotion">
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
                  options={mergedProductOptions}
                  value={formValues.productIds}
                  onChange={(values) => setFormValues((previous) => ({ ...previous, productIds: values }))}
                  classNameSelect="w-full text-left"
                  classNameOptions="w-full left-0"
                  placeholder={loadingProducts ? "Đang tải danh sách sản phẩm..." : "Chọn sản phẩm"}
                  multiple
                  search
                  disable={loadingProducts}
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-3">
                <CustomButton label={saving ? "Saving..." : "Save Changes"} onClick={handleSave} disabled={saving} />
                <CustomButton
                  label="Cancel"
                  className="bg-slate-200 text-slate-700 hover:bg-slate-300"
                  onClick={handleCancelEdit}
                  disabled={saving}
                />
              </div>
            </FormSectionCard>
          )}
        </div>
      }
    />
  );
};

export default PromotionDetailPage;


