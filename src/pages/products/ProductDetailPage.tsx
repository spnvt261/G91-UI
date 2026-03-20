import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import PageHeader from "../../components/layout/PageHeader";
import { useNotify } from "../../context/notifyContext";
import { ROUTE_URL } from "../../const/route_url.const";
import type { ProductModel } from "../../models/product/product.model";
import { productService } from "../../services/product/product.service";
import { getErrorMessage } from "../shared/page.utils";

const ProductDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState<ProductModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeImage, setActiveImage] = useState("");
  const { notify } = useNotify();

  useEffect(() => {
    const load = async () => {
      if (!id) {
        return;
      }

      try {
        setLoading(true);
        const detail = await productService.getDetail(id);
        setProduct(detail);
        setActiveImage(detail.mainImage || detail.images?.[0] || "");
      } catch (err) {
        notify(getErrorMessage(err, "Cannot load product detail"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id, notify]);

  const gallery = useMemo(() => {
    if (!product) {
      return [];
    }
    return (product.images?.slice(0, 6) ?? []).filter(Boolean);
  }, [product]);

  const statusLabel = product?.status === "ACTIVE" ? "Đang kinh doanh" : "Ngừng kinh doanh";
  const statusClassName =
    product?.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600";

  return (
    <div className="space-y-4">
      <PageHeader title={product?.productName || "Chi tiết sản phẩm"} />
      <BaseCard className="border border-slate-200">
        {loading ? <p className="text-sm text-slate-500">Đang tải chi tiết...</p> : null}
        {product ? (
          <div className="space-y-5">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="space-y-3 rounded-lg border border-slate-200 p-3">
                <img
                  src={activeImage || product.mainImage}
                  alt={product.productName}
                  className="h-72 w-full rounded-md object-cover md:h-[360px]"
                />
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {gallery.map((image, index) => {
                    const isActive = image === activeImage;
                    return (
                      <button
                        key={`${image}-${index}`}
                        type="button"
                        onClick={() => setActiveImage(image)}
                        className={`h-16 w-24 shrink-0 overflow-hidden rounded-md border transition ${
                          isActive ? "border-blue-600 ring-2 ring-blue-100" : "border-slate-300 hover:border-slate-400"
                        }`}
                      >
                        <img src={image} alt={`${product.productName} ảnh nhỏ`} className="h-full w-full object-cover" />
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="rounded-lg border border-slate-200 p-4">
                <h2 className="mb-4 text-3xl font-semibold text-blue-950">Thông Tin Sản Phẩm</h2>
                <div className="space-y-3 text-base">
                  <div className="grid grid-cols-2 border-b border-slate-100 pb-2">
                    <p className="text-slate-500">Mã Sản Phẩm:</p>
                    <p className="font-semibold text-slate-700">{product.productCode || "-"}</p>
                  </div>
                  <div className="grid grid-cols-2 border-b border-slate-100 pb-2">
                    <p className="text-slate-500">Loại Sản Phẩm:</p>
                    <p className="font-semibold text-slate-700">{product.type || "-"}</p>
                  </div>
                  <div className="grid grid-cols-2 border-b border-slate-100 pb-2">
                    <p className="text-slate-500">Kích Thước:</p>
                    <p className="font-semibold text-slate-700">{product.size || "-"}</p>
                  </div>
                  <div className="grid grid-cols-2 border-b border-slate-100 pb-2">
                    <p className="text-slate-500">Bề Dày:</p>
                    <p className="font-semibold text-slate-700">{product.thickness || "-"}</p>
                  </div>
                  <div className="grid grid-cols-2 border-b border-slate-100 pb-2">
                    <p className="text-slate-500">Đơn Vị:</p>
                    <p className="font-semibold text-slate-700">{product.unit || "-"}</p>
                  </div>
                  <div className="grid grid-cols-2 border-b border-slate-100 pb-2">
                    <p className="text-slate-500">Khối Lượng Tham Khảo:</p>
                    <p className="font-semibold text-slate-700">{product.referenceWeight ? `${product.referenceWeight} kg/tấm` : "-"}</p>
                  </div>
                  <div className="grid grid-cols-2 items-center border-b border-slate-100 pb-2">
                    <p className="text-slate-500">Trạng Thái:</p>
                    <p>
                      <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${statusClassName}`}>
                        {statusLabel}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
                  <CustomButton
                    label="Quay Lại"
                    className="border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                    onClick={() => navigate(ROUTE_URL.PRODUCT_LIST)}
                  />
                  <CustomButton
                    label="Yêu Cầu Báo Giá"
                    className="bg-amber-300 text-slate-800 hover:bg-amber-400"
                    onClick={() => navigate(ROUTE_URL.QUOTATION_CREATE)}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </BaseCard>
    </div>
  );
};

export default ProductDetailPage;
