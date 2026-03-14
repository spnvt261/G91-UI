import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FormSectionCard from "../../components/forms/FormSectionCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomSelect from "../../components/customSelect/CustomSelect";
import CustomTextField from "../../components/customTextField/CustomTextField";
import PageHeader from "../../components/layout/PageHeader";
import { ROUTE_URL } from "../../const/route_url.const";
import type { ProductModel } from "../../models/product/product.model";
import { productService } from "../../services/product/product.service";
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
  const [draftQuantity, setDraftQuantity] = useState("1");
  const [draftUnitPrice, setDraftUnitPrice] = useState("0");
  const [projectReference, setProjectReference] = useState("");
  const [deliveryRequirement, setDeliveryRequirement] = useState("");
  const [productOptions, setProductOptions] = useState<{ label: string; value: string }[]>([]);
  const [products, setProducts] = useState<ProductModel[]>([]);
  const [quotationItems, setQuotationItems] = useState<QuotationItemForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await productService.getList({ page: 1, pageSize: 100 });
        setProducts(response.items);
        setProductOptions(
          response.items.map((item) => ({
            label: `${item.productCode} - ${item.productName}`,
            value: item.id,
          })),
        );
      } catch {
        setProducts([]);
        setProductOptions([]);
      }
    };

    void loadProducts();
  }, []);

  const productsById = useMemo(() => {
    return new Map(products.map((item) => [item.id, item]));
  }, [products]);

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

  const handleAddProduct = () => {
    const productId = selectedProductId[0];
    const quantity = Math.max(1, Math.floor(parseInputNumber(draftQuantity, 1)));
    const unitPrice = Math.max(0, parseInputNumber(draftUnitPrice, 0));

    if (!productId) {
      setError("Vui lòng chọn sản phẩm.");
      return;
    }

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
        unitPrice: unitPrice > 0 ? unitPrice : existing.unitPrice,
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

  const handleCreate = async () => {
    try {
      if (quotationItems.length === 0) {
        setError("Vui lòng thêm ít nhất một sản phẩm.");
        return;
      }

      setLoading(true);
      setError("");
      const created = await quotationService.create({
        customerId: "current-customer",
        projectId: projectReference || undefined,
        items: quotationItems.map((item) => {
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
        }),
        note: deliveryRequirement,
      });
      navigate(ROUTE_URL.QUOTATION_DETAIL.replace(":id", created.id));
    } catch (err) {
      setError(getErrorMessage(err, "Cannot create quotation"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Tạo Yêu Cầu Báo Giá" />

      <FormSectionCard title="Danh Sách Sản Phẩm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <CustomSelect
            title="Sản Phẩm"
            options={productOptions}
            value={selectedProductId}
            onChange={setSelectedProductId}
            placeholder="Chọn sản phẩm"
            classNameSelect="w-full text-left"
            classNameOptions="w-full left-0"
            search
          />
          <CustomTextField
            title="Số Lượng"
            type="number"
            value={draftQuantity}
            onChange={(event) => setDraftQuantity(event.target.value)}
          />
          <CustomTextField
            title="Đơn Giá (VND)"
            type="number"
            value={draftUnitPrice}
            onChange={(event) => setDraftUnitPrice(event.target.value)}
          />
          <div className="flex items-end">
            <CustomButton
              label="+ Thêm sản phẩm"
              className="w-full"
              onClick={handleAddProduct}
              disabled={!selectedProductId[0]}
            />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto rounded-md border border-slate-200">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-left text-slate-700">
              <tr>
                <th className="px-3 py-2">Sản phẩm</th>
                <th className="px-3 py-2">Thông tin</th>
                <th className="px-3 py-2">Số lượng</th>
                <th className="px-3 py-2">Đơn giá</th>
                <th className="px-3 py-2">Thành tiền</th>
                <th className="px-3 py-2">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {quotationItems.length === 0 ? (
                <tr>
                  <td className="px-3 py-3 text-slate-500" colSpan={6}>
                    Chưa có sản phẩm nào trong báo giá.
                  </td>
                </tr>
              ) : (
                quotationItems.map((item) => {
                  const product = productsById.get(item.productId);
                  const amount = item.quantity * item.unitPrice;

                  return (
                    <tr key={item.productId} className="border-t border-slate-200 align-top">
                      <td className="px-3 py-3">
                        <div className="font-semibold text-slate-800">{product?.productName ?? "Sản phẩm"}</div>
                        <div className="text-xs text-slate-500">{product?.productCode ?? item.productId}</div>
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-600">
                        <p>Loại: {product?.type || "-"}</p>
                        <p>Kích thước: {product?.size || "-"}</p>
                        <p>Độ dày: {product?.thickness || "-"}</p>
                        <p>Đơn vị: {product?.unit || "-"}</p>
                        <p>Quy đổi KL: {product?.weightConversion ?? "-"}</p>
                        <p>KL tham chiếu: {product?.referenceWeight ?? "-"}</p>
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
                        <CustomButton
                          label="Xóa"
                          onClick={() => removeItem(item.productId)}
                          className="bg-red-500 hover:bg-red-600"
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-3 text-right text-sm font-semibold text-slate-700">Tổng tạm tính: {toCurrency(totalAmount)}</div>
      </FormSectionCard>

      <FormSectionCard title="Thông Tin Báo Giá">
        <div className="space-y-4">
          <CustomTextField
            title="Dự Án / Project Reference"
            value={projectReference}
            onChange={(event) => setProjectReference(event.target.value)}
            placeholder="Nhà xưởng Bắc Ninh"
          />
          <CustomTextField
            title="Yêu Cầu Giao Hàng"
            type="textarea"
            value={deliveryRequirement}
            onChange={(event) => setDeliveryRequirement(event.target.value)}
            placeholder="Nhập yêu cầu giao hàng"
          />
          {error ? <p className="text-sm text-red-500">{error}</p> : null}
          <div className="flex items-center gap-3">
            <CustomButton
              label={loading ? "Đang tạo..." : "Gửi Yêu Cầu"}
              onClick={handleCreate}
              disabled={loading || quotationItems.length === 0}
            />
            <CustomButton
              label="Quay Lại"
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
