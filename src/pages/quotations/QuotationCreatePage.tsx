import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FormSectionCard from "../../components/forms/FormSectionCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomSelect from "../../components/customSelect/CustomSelect";
import CustomTextField from "../../components/customTextField/CustomTextField";
import PageHeader from "../../components/layout/PageHeader";
import { ROUTE_URL } from "../../const/route_url.const";
import type {
  QuotationFormInitProduct,
  QuotationFormInitProject,
  QuotationItemModel,
} from "../../models/quotation/quotation.model";
import { quotationService } from "../../services/quotation/quotation.service";
import { getErrorMessage, toCurrency } from "../shared/page.utils";

interface QuotationItemForm {
  productId: string;
  quantity: number;
  unitPrice: number;
}

const QuotationCreatePage = () => {
  const navigate = useNavigate();
  const [selectedProductId, setSelectedProductId] = useState<string[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string[]>([]);
  const [draftQuantity, setDraftQuantity] = useState("1");
  const [draftUnitPrice, setDraftUnitPrice] = useState("0");
  const [deliveryRequirement, setDeliveryRequirement] = useState("");
  const [promotionCode, setPromotionCode] = useState("");
  const [note, setNote] = useState("");
  const [productOptions, setProductOptions] = useState<{ label: string; value: string }[]>([]);
  const [projectOptions, setProjectOptions] = useState<{ label: string; value: string }[]>([]);
  const [products, setProducts] = useState<QuotationFormInitProduct[]>([]);
  const [projects, setProjects] = useState<QuotationFormInitProject[]>([]);
  const [quotationItems, setQuotationItems] = useState<QuotationItemForm[]>([]);
  const [previewTotal, setPreviewTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadInit = async () => {
      try {
        const response = await quotationService.getFormInit({ page: 1, pageSize: 100 });
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
      } catch {
        setProducts([]);
        setProjects([]);
        setProductOptions([]);
        setProjectOptions([]);
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
    return quotationItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  }, [quotationItems]);

  const parseInputNumber = (value: string, fallback = 0) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed) || parsed < 0) {
      return fallback;
    }
    return parsed;
  };

  const buildItemsPayload = (): QuotationItemModel[] =>
    quotationItems.map((item) => {
      const product = productsById.get(item.productId);
      const amount = item.quantity * item.unitPrice;
      return {
        productId: item.productId,
        productCode: product?.productCode,
        productName: product?.productName,
        quantity: item.quantity,
        unitPrice: item.unitPrice || undefined,
        amount: amount > 0 ? amount : undefined,
      };
    });

  const handleAddProduct = () => {
    const productId = selectedProductId[0];
    const quantity = Math.max(1, Math.floor(parseInputNumber(draftQuantity, 1)));

    if (!productId) {
      setError("Please select a product.");
      return;
    }

    const fallbackPrice = Number(productsById.get(productId)?.referenceUnitPrice ?? 0);
    const unitPriceInput = parseInputNumber(draftUnitPrice, fallbackPrice);
    const unitPrice = Math.max(0, unitPriceInput);

    setError("");
    setQuotationItems((previous) => {
      const existingIndex = previous.findIndex((item) => item.productId === productId);
      if (existingIndex === -1) {
        return [...previous, { productId, quantity, unitPrice }];
      }

      const next = [...previous];
      const existing = next[existingIndex];
      next[existingIndex] = {
        ...existing,
        quantity: existing.quantity + quantity,
        unitPrice,
      };
      return next;
    });

    setSelectedProductId([]);
    setDraftQuantity("1");
    setDraftUnitPrice("0");
  };

  const updateItem = (productId: string, field: "quantity" | "unitPrice", rawValue: string) => {
    setQuotationItems((previous) =>
      previous.map((item) => {
        if (item.productId !== productId) {
          return item;
        }

        if (field === "quantity") {
          return {
            ...item,
            quantity: Math.max(1, Math.floor(parseInputNumber(rawValue, 1))),
          };
        }

        return {
          ...item,
          unitPrice: Math.max(0, parseInputNumber(rawValue, 0)),
        };
      }),
    );
  };

  const removeItem = (productId: string) => {
    setQuotationItems((previous) => previous.filter((item) => item.productId !== productId));
  };

  const handlePreview = async () => {
    try {
      if (quotationItems.length === 0) {
        setError("Please add at least one item.");
        return;
      }

      setLoading(true);
      setError("");
      const preview = await quotationService.preview({
        projectId: selectedProjectId[0] || undefined,
        deliveryRequirements: deliveryRequirement || undefined,
        promotionCode: promotionCode || undefined,
        note: note || undefined,
        items: buildItemsPayload(),
      });
      setPreviewTotal(preview.summary.totalAmount);
    } catch (err) {
      setError(getErrorMessage(err, "Cannot preview quotation"));
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (quotationItems.length === 0) {
        setError("Please add at least one item.");
        return;
      }

      setLoading(true);
      setError("");
      const created = await quotationService.create({
        projectId: selectedProjectId[0] || undefined,
        deliveryRequirements: deliveryRequirement || undefined,
        promotionCode: promotionCode || undefined,
        note: note || undefined,
        items: buildItemsPayload(),
      });
      navigate(ROUTE_URL.QUOTATION_DETAIL.replace(":id", created.id));
    } catch (err) {
      setError(getErrorMessage(err, "Cannot submit quotation"));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    try {
      if (quotationItems.length === 0) {
        setError("Please add at least one item.");
        return;
      }

      setLoading(true);
      setError("");
      const draft = await quotationService.saveDraft({
        projectId: selectedProjectId[0] || undefined,
        deliveryRequirements: deliveryRequirement || undefined,
        promotionCode: promotionCode || undefined,
        note: note || undefined,
        items: buildItemsPayload(),
      });
      navigate(ROUTE_URL.QUOTATION_DETAIL.replace(":id", draft.id));
    } catch (err) {
      setError(getErrorMessage(err, "Cannot save draft"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Create Quotation" />

      <FormSectionCard title="Products">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
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
          <CustomTextField title="Unit Price" type="number" value={draftUnitPrice} onChange={(event) => setDraftUnitPrice(event.target.value)} />
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
                <th className="px-3 py-2">Unit Price</th>
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
                  const amount = item.quantity * item.unitPrice;

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
                          onChange={(event) => updateItem(item.productId, "quantity", event.target.value)}
                          className="w-24 rounded border border-slate-300 px-2 py-1"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <input
                          type="number"
                          min={0}
                          value={String(item.unitPrice)}
                          onChange={(event) => updateItem(item.productId, "unitPrice", event.target.value)}
                          className="w-36 rounded border border-slate-300 px-2 py-1"
                        />
                      </td>
                      <td className="px-3 py-3 font-medium">{toCurrency(amount)}</td>
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

        <div className="mt-3 text-right text-sm font-semibold text-slate-700">Estimated total: {toCurrency(totalAmount)}</div>
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
          <CustomTextField title="Promotion Code" value={promotionCode} onChange={(event) => setPromotionCode(event.target.value)} />
          <CustomTextField
            title="Delivery Requirements"
            type="textarea"
            value={deliveryRequirement}
            onChange={(event) => setDeliveryRequirement(event.target.value)}
            placeholder="Enter delivery requirements"
          />
          <CustomTextField title="Note" type="textarea" value={note} onChange={(event) => setNote(event.target.value)} />
          {previewTotal !== null ? <p className="text-sm text-blue-700">Preview total: {toCurrency(previewTotal)}</p> : null}
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
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
  );
};

export default QuotationCreatePage;
