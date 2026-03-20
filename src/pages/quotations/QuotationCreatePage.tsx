import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FormSectionCard from "../../components/forms/FormSectionCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomSelect from "../../components/customSelect/CustomSelect";
import CustomTextField from "../../components/customTextField/CustomTextField";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type {
  QuotationFormInitProduct,
  QuotationFormInitProject,
  QuotationItemModel,
  QuotationPreviewResponseData,
} from "../../models/quotation/quotation.model";
import { quotationService } from "../../services/quotation/quotation.service";
import { getErrorMessage, toCurrency } from "../shared/page.utils";

interface QuotationItemForm {
  productId: string;
  quantity: number;
}

const MAX_ITEMS = 20;
const MIN_SUBMIT_AMOUNT = 10_000_000;
const NOTE_MAX_LENGTH = 1000;
const DELIVERY_MAX_LENGTH = 1000;
const PROMOTION_MAX_LENGTH = 50;

const QuotationCreatePage = () => {
  const navigate = useNavigate();
  const [selectedProductId, setSelectedProductId] = useState<string[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string[]>([]);
  const [draftQuantity, setDraftQuantity] = useState("1");
  const [deliveryRequirement, setDeliveryRequirement] = useState("");
  const [selectedPromotionCode, setSelectedPromotionCode] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [productOptions, setProductOptions] = useState<{ label: string; value: string }[]>([]);
  const [projectOptions, setProjectOptions] = useState<{ label: string; value: string }[]>([]);
  const [promotionOptions, setPromotionOptions] = useState<{ label: string; value: string }[]>([]);
  const [products, setProducts] = useState<QuotationFormInitProduct[]>([]);
  const [projects, setProjects] = useState<QuotationFormInitProject[]>([]);
  const [customerInfo, setCustomerInfo] = useState<{
    companyName?: string;
    customerType?: string;
    status?: string;
  } | null>(null);
  const [quotationItems, setQuotationItems] = useState<QuotationItemForm[]>([]);
  const [previewResult, setPreviewResult] = useState<QuotationPreviewResponseData | null>(null);
  const [isPreviewStale, setIsPreviewStale] = useState(true);
  const [loading, setLoading] = useState(false);
  const { notify } = useNotify();

  useEffect(() => {
    const loadInit = async () => {
      try {
        const response = await quotationService.getFormInit({ page: 1, pageSize: 100 });
        setCustomerInfo(response.customer ?? null);
        setProducts(response.products ?? []);
        setProjects(response.projects ?? []);
        setProductOptions(
          (response.products ?? []).map((item) => ({
            label: `${item.productCode} - ${item.productName}`,
            value: item.id,
          })),
        );
        setProjectOptions(
          (response.projects ?? []).map((item) => ({
            label: `${item.projectCode ?? item.id} - ${item.name}`,
            value: item.id,
          })),
        );
        setPromotionOptions(
          (response.availablePromotions ?? []).map((item) => ({
            label: `${item.code} - ${item.name}`,
            value: item.code,
          })),
        );
      } catch {
        setCustomerInfo(null);
        setProducts([]);
        setProjects([]);
        setProductOptions([]);
        setProjectOptions([]);
        setPromotionOptions([]);
      }
    };

    void loadInit();
  }, []);

  const productsById = useMemo(() => {
    return new Map(products.map((item) => [item.id, item]));
  }, [products]);

  const projectsById = useMemo(() => {
    return new Map(projects.map((item) => [item.id, item]));
  }, [projects]);

  const totalAmount = useMemo(() => {
    return quotationItems.reduce((sum, item) => {
      const referenceUnitPrice = Number(productsById.get(item.productId)?.referenceUnitPrice ?? 0);
      return sum + item.quantity * referenceUnitPrice;
    }, 0);
  }, [productsById, quotationItems]);

  useEffect(() => {
    setIsPreviewStale(true);
  }, [deliveryRequirement, note, quotationItems, selectedProjectId, selectedPromotionCode]);

  const parseInputNumber = (value: string, fallback = 0) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed < 0) {
      return fallback;
    }
    return parsed;
  };

  const buildItemsPayload = (): QuotationItemModel[] =>
    quotationItems.map((item) => {
      return {
        productId: item.productId,
        quantity: item.quantity,
      };
    });

  const getValidationError = (mode: "draft" | "preview" | "submit"): string | null => {
    if (quotationItems.length === 0) {
      return "Please add at least one item.";
    }
    if (quotationItems.length > MAX_ITEMS) {
      return `Quotation can contain at most ${MAX_ITEMS} items.`;
    }
    if (deliveryRequirement.length > DELIVERY_MAX_LENGTH) {
      return `Delivery requirements must be at most ${DELIVERY_MAX_LENGTH} characters.`;
    }
    if (note.length > NOTE_MAX_LENGTH) {
      return `Note must be at most ${NOTE_MAX_LENGTH} characters.`;
    }
    const promotionCode = selectedPromotionCode[0] ?? "";
    if (promotionCode.length > PROMOTION_MAX_LENGTH) {
      return `Promotion code must be at most ${PROMOTION_MAX_LENGTH} characters.`;
    }

    const invalidItem = quotationItems.find((item) => item.quantity <= 0);
    if (invalidItem) {
      return "Quantity must be greater than 0 for all items.";
    }

    if (mode === "submit") {
      if (!previewResult || isPreviewStale) {
        return "Please preview quotation before submitting.";
      }
      if (!previewResult.validation?.valid) {
        return "Please resolve preview validation issues before submitting.";
      }
      if ((previewResult.summary?.totalAmount ?? 0) < MIN_SUBMIT_AMOUNT) {
        return `Total amount must be at least ${toCurrency(MIN_SUBMIT_AMOUNT)}.`;
      }
    }

    return null;
  };

  const handleAddProduct = () => {
    const productId = selectedProductId[0];
    const quantity = Math.max(0.01, parseInputNumber(draftQuantity, 1));

    if (!productId) {
      notify("Please select a product.", "error");
      return;
    }
    if (quotationItems.length >= MAX_ITEMS && !quotationItems.some((item) => item.productId === productId)) {
      notify(`Only ${MAX_ITEMS} items are allowed in one quotation.`, "error");
      return;
    }

    setQuotationItems((previous) => {
      const existingIndex = previous.findIndex((item) => item.productId === productId);
      if (existingIndex === -1) {
        return [...previous, { productId, quantity }];
      }

      const next = [...previous];
      const existing = next[existingIndex];
      next[existingIndex] = {
        ...existing,
        quantity: existing.quantity + quantity,
      };
      return next;
    });

    setSelectedProductId([]);
    setDraftQuantity("1");
  };

  const updateItemQuantity = (productId: string, rawValue: string) => {
    setQuotationItems((previous) =>
      previous.map((item) => {
        if (item.productId !== productId) {
          return item;
        }
        return {
          ...item,
          quantity: Math.max(0.01, parseInputNumber(rawValue, 1)),
        };
      }),
    );
  };

  const removeItem = (productId: string) => {
    setQuotationItems((previous) => previous.filter((item) => item.productId !== productId));
  };

  const handlePreview = async () => {
    try {
      const error = getValidationError("preview");
      if (error) {
        notify(error, "error");
        return;
      }

      setLoading(true);
      const preview = await quotationService.preview({
        projectId: selectedProjectId[0] || undefined,
        deliveryRequirements: deliveryRequirement || undefined,
        promotionCode: selectedPromotionCode[0] || undefined,
        note: note || undefined,
        items: buildItemsPayload(),
      });
      setPreviewResult(preview);
      setIsPreviewStale(false);
      if ((preview.summary?.totalAmount ?? 0) < MIN_SUBMIT_AMOUNT) {
        notify(`Quotation total is below minimum ${toCurrency(MIN_SUBMIT_AMOUNT)}.`, "error");
      }
      if (preview.validation?.messages?.length) {
        notify(preview.validation.messages.join("; "), "error");
      }
    } catch (err) {
      notify(getErrorMessage(err, "Cannot preview quotation"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const error = getValidationError("submit");
      if (error) {
        notify(error, "error");
        return;
      }

      setLoading(true);
      const created = await quotationService.create({
        projectId: selectedProjectId[0] || undefined,
        deliveryRequirements: deliveryRequirement || undefined,
        promotionCode: selectedPromotionCode[0] || undefined,
        note: note || undefined,
        items: buildItemsPayload(),
      });
      navigate(ROUTE_URL.QUOTATION_DETAIL.replace(":id", created.id));
    } catch (err) {
      notify(getErrorMessage(err, "Cannot submit quotation"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      const error = getValidationError("draft");
      if (error) {
        notify(error, "error");
        return;
      }

      setLoading(true);
      const draft = await quotationService.saveDraft({
        projectId: selectedProjectId[0] || undefined,
        deliveryRequirements: deliveryRequirement || undefined,
        promotionCode: selectedPromotionCode[0] || undefined,
        note: note || undefined,
        items: buildItemsPayload(),
      });
      navigate(ROUTE_URL.QUOTATION_DETAIL.replace(":id", draft.id));
    } catch (err) {
      notify(getErrorMessage(err, "Cannot save draft"), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Create Quotation"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Báo giá", url: ROUTE_URL.QUOTATION_LIST },
                { label: "Tạo mới" },
              ]}
            />
          }
        />
      }
      body={
        <div className="space-y-4">
          <FormSectionCard title="Customer Context">
        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-3">
          <p>
            <span className="font-semibold">Company:</span> {customerInfo?.companyName || "-"}
          </p>
          <p>
            <span className="font-semibold">Customer Type:</span> {customerInfo?.customerType || "-"}
          </p>
          <p>
            <span className="font-semibold">Status:</span> {customerInfo?.status || "-"}
          </p>
        </div>
      </FormSectionCard>

      <FormSectionCard title="Products">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          <CustomSelect
            title="Product"
            options={productOptions}
            value={selectedProductId}
            onChange={setSelectedProductId}
            placeholder="Select product"
            classNameSelect="w-full text-left"
            classNameOptions="w-full left-0"
            search
          />
          <CustomTextField title="Quantity" type="number" value={draftQuantity} onChange={(event) => setDraftQuantity(event.target.value)} />
          <div className="flex items-end">
            <CustomButton label="+ Add Item" className="w-full" onClick={handleAddProduct} disabled={!selectedProductId[0]} />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-left text-slate-700">
              <tr>
                <th className="px-3 py-2">Product</th>
                <th className="px-3 py-2">Info</th>
                <th className="px-3 py-2">Qty</th>
                <th className="px-3 py-2">Reference Price</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {quotationItems.length === 0 ? (
                <tr>
                  <td className="px-3 py-3 text-slate-500" colSpan={6}>
                    No items in quotation.
                  </td>
                </tr>
              ) : (
                quotationItems.map((item) => {
                  const product = productsById.get(item.productId);
                  const referenceUnitPrice = Number(product?.referenceUnitPrice ?? 0);
                  const amount = item.quantity * referenceUnitPrice;

                  return (
                    <tr key={item.productId} className="border-t border-slate-200 align-top">
                      <td className="px-3 py-3">
                        <div className="font-semibold text-slate-800">{product?.productName ?? "Product"}</div>
                        <div className="text-xs text-slate-500">{product?.productCode ?? item.productId}</div>
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-600">
                        <p>Type: {product?.type || "-"}</p>
                        <p>Size: {product?.size || "-"}</p>
                        <p>Thickness: {product?.thickness || "-"}</p>
                        <p>Unit: {product?.unit || "-"}</p>
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          min={1}
                          value={String(item.quantity)}
                          onChange={(event) => updateItemQuantity(item.productId, event.target.value)}
                          className="w-24 rounded border border-slate-300 px-2 py-1"
                        />
                      </td>
                      <td className="px-3 py-3">{referenceUnitPrice > 0 ? toCurrency(referenceUnitPrice) : "-"}</td>
                      <td className="px-3 py-3 font-medium">{referenceUnitPrice > 0 ? toCurrency(amount) : "-"}</td>
                      <td className="px-3 py-3">
                        <CustomButton label="Remove" onClick={() => removeItem(item.productId)} className="bg-red-500 hover:bg-red-600" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-slate-700">
          <span>
            Items: {quotationItems.length}/{MAX_ITEMS}
          </span>
          <span>Estimated total (reference): {toCurrency(totalAmount)}</span>
        </div>
      </FormSectionCard>

      <FormSectionCard title="Quotation Info">
        <div className="space-y-4">
          <CustomSelect
            title="Project"
            options={projectOptions}
            value={selectedProjectId}
            onChange={setSelectedProjectId}
            placeholder="Select project"
            classNameSelect="w-full text-left"
            classNameOptions="w-full left-0"
            search
          />
          {selectedProjectId[0] ? (
            <p className="text-xs text-slate-500">Selected: {projectsById.get(selectedProjectId[0])?.name ?? selectedProjectId[0]}</p>
          ) : null}
          <CustomSelect
            title="Promotion"
            options={promotionOptions}
            value={selectedPromotionCode}
            onChange={setSelectedPromotionCode}
            placeholder="Select promotion (optional)"
            classNameSelect="w-full text-left"
            classNameOptions="w-full left-0"
            search
          />
          <CustomTextField
            title="Delivery Requirements"
            type="textarea"
            value={deliveryRequirement}
            onChange={(event) => setDeliveryRequirement(event.target.value)}
            placeholder="Enter delivery requirements"
          />
          <p className="text-xs text-slate-500">Max {DELIVERY_MAX_LENGTH} characters.</p>
          <CustomTextField title="Note" type="textarea" value={note} onChange={(event) => setNote(event.target.value)} />
          <p className="text-xs text-slate-500">Max {NOTE_MAX_LENGTH} characters.</p>
          {previewResult ? (
            <div className="rounded border border-blue-200 bg-blue-50 p-3 text-sm text-blue-900">
              <p>
                <span className="font-semibold">Preview total:</span> {toCurrency(previewResult.summary.totalAmount)}
              </p>
              <p>
                <span className="font-semibold">Sub-total:</span> {toCurrency(previewResult.summary.subTotal)}
              </p>
              <p>
                <span className="font-semibold">Discount:</span> {toCurrency(previewResult.summary.discountAmount)}
              </p>
              <p>
                <span className="font-semibold">Valid until:</span> {previewResult.validUntil || "-"}
              </p>
              {isPreviewStale ? <p className="font-semibold text-amber-700">Data changed after preview. Please preview again before submit.</p> : null}
              {previewResult.validation?.messages?.length ? (
                <p className="font-semibold text-red-700">{previewResult.validation.messages.join("; ")}</p>
              ) : null}
            </div>
          ) : null}
          <div className="flex flex-wrap items-center gap-3">
            <CustomButton label={loading ? "Previewing..." : "Preview"} onClick={handlePreview} disabled={loading || quotationItems.length === 0} />
            <CustomButton label={loading ? "Saving..." : "Save Draft"} onClick={handleSaveDraft} disabled={loading || quotationItems.length === 0} />
            <CustomButton label={loading ? "Submitting..." : "Submit Quotation"} onClick={handleSubmit} disabled={loading || quotationItems.length === 0} />
            <CustomButton
              label="Back"
              className="bg-slate-200 text-slate-700 hover:bg-slate-300"
              onClick={() => navigate(ROUTE_URL.QUOTATION_LIST)}
            />
          </div>
        </div>
          </FormSectionCard>
        </div>
      }
    />
  );
};

export default QuotationCreatePage;
