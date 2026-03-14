import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import FormSectionCard from "../../components/forms/FormSectionCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomSelect from "../../components/customSelect/CustomSelect";
import CustomTextField from "../../components/customTextField/CustomTextField";
import PageHeader from "../../components/layout/PageHeader";
import { ROUTE_URL } from "../../const/route_url.const";
import { productService } from "../../services/product/product.service";
import { quotationService } from "../../services/quotation/quotation.service";
import { getErrorMessage } from "../shared/page.utils";

const QuotationCreatePage = () => {
  const navigate = useNavigate();
  const [productId, setProductId] = useState<string[]>([]);
  const [quantity, setQuantity] = useState("1");
  const [projectReference, setProjectReference] = useState("");
  const [deliveryRequirement, setDeliveryRequirement] = useState("");
  const [productOptions, setProductOptions] = useState<{ label: string; value: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const response = await productService.getList({ page: 1, pageSize: 100 });
        setProductOptions(
          response.items.map((item) => ({
            label: `${item.productCode} - ${item.productName}`,
            value: item.id,
          })),
        );
      } catch {
        setProductOptions([]);
      }
    };

    void loadProducts();
  }, []);

  const selectedProductName = useMemo(() => {
    return productOptions.find((option) => option.value === productId[0])?.label ?? "Chưa chọn sản phẩm";
  }, [productId, productOptions]);

  const handleCreate = async () => {
    try {
      setLoading(true);
      setError("");
      const created = await quotationService.create({
        customerId: "current-customer",
        projectId: projectReference || undefined,
        items: [
          {
            productId: productId[0],
            quantity: Number(quantity),
          },
        ],
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
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <CustomSelect
            title="Sản Phẩm"
            options={productOptions}
            value={productId}
            onChange={setProductId}
            placeholder="Chọn sản phẩm"
            classNameSelect="w-full text-left"
            classNameOptions="w-full left-0"
          />
          <CustomTextField title="Số Lượng" type="number" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
        </div>
        <p className="mt-4 text-sm text-slate-600">Sản phẩm đang chọn: {selectedProductName}</p>
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
              disabled={loading || !productId[0]}
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
