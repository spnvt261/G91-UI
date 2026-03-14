import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import PageHeader from "../../components/layout/PageHeader";
import { ROUTE_URL } from "../../const/route_url.const";
import type { ProductModel } from "../../models/product/product.model";
import { productService } from "../../services/product/product.service";
import { getErrorMessage } from "../shared/page.utils";

const ProductDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState<ProductModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      try {
        setLoading(true);
        setError("");
        const detail = await productService.getDetail(id);
        setProduct(detail);
      } catch (err) {
        setError(getErrorMessage(err, "Cannot load product detail"));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  return (
    <div className="space-y-4">
      <PageHeader
        title="Chi Tiet San Pham"
        rightActions={<CustomButton label="Quay Lai" className="bg-slate-200 text-slate-700 hover:bg-slate-300" onClick={() => navigate(ROUTE_URL.PRODUCT_LIST)} />}
      />
      <BaseCard>
        {loading ? <p className="text-sm text-slate-500">Loading detail...</p> : null}
        {error ? <p className="text-sm text-red-500">{error}</p> : null}
        {product ? (
          <div className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
            <p><span className="font-semibold">Ma SP:</span> {product.productCode}</p>
            <p><span className="font-semibold">Ten San Pham:</span> {product.productName}</p>
            <p><span className="font-semibold">Loai:</span> {product.type}</p>
            <p><span className="font-semibold">Kich Thuoc:</span> {product.size}</p>
            <p><span className="font-semibold">Be Day:</span> {product.thickness}</p>
            <p><span className="font-semibold">Don Vi:</span> {product.unit}</p>
            <p><span className="font-semibold">Khoi Luong:</span> {product.referenceWeight ?? "-"}</p>
            <p><span className="font-semibold">Trang Thai:</span> {product.status}</p>
          </div>
        ) : null}
      </BaseCard>
    </div>
  );
};

export default ProductDetailPage;
