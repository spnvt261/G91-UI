import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
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

  const statusLabel = product?.status === "ACTIVE" ? "Dang kinh doanh" : "Ngung kinh doanh";
  const statusClassName =
    product?.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600";

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title={product?.productName || "Chi tiet san pham"}
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          actions={
            <div className="flex flex-wrap gap-2">
              <CustomButton
                label="Quay lai"
                className="border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                onClick={() => navigate(ROUTE_URL.PRODUCT_LIST)}
              />
              <CustomButton
                label="Yeu cau bao gia"
                className="bg-amber-300 text-slate-800 hover:bg-amber-400"
                onClick={() => navigate(ROUTE_URL.QUOTATION_CREATE)}
              />
            </div>
          }
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chu" },
                { label: "San pham", url: ROUTE_URL.PRODUCT_LIST },
                { label: product?.productName || "Chi tiet" },
              ]}
            />
          }
        />
      }
      body={
        <BaseCard className="border border-slate-200">
          {loading ? <p className="text-sm text-slate-500">Dang tai chi tiet...</p> : null}
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
                          <img src={image} alt={`${product.productName} anh nho`} className="h-full w-full object-cover" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 p-4">
                  <h2 className="mb-4 text-3xl font-semibold text-blue-950">Thong Tin San Pham</h2>
                  <div className="space-y-3 text-base">
                    <div className="grid grid-cols-2 border-b border-slate-100 pb-2">
                      <p className="text-slate-500">Ma San Pham:</p>
                      <p className="font-semibold text-slate-700">{product.productCode || "-"}</p>
                    </div>
                    <div className="grid grid-cols-2 border-b border-slate-100 pb-2">
                      <p className="text-slate-500">Loai San Pham:</p>
                      <p className="font-semibold text-slate-700">{product.type || "-"}</p>
                    </div>
                    <div className="grid grid-cols-2 border-b border-slate-100 pb-2">
                      <p className="text-slate-500">Kich Thuoc:</p>
                      <p className="font-semibold text-slate-700">{product.size || "-"}</p>
                    </div>
                    <div className="grid grid-cols-2 border-b border-slate-100 pb-2">
                      <p className="text-slate-500">Be Day:</p>
                      <p className="font-semibold text-slate-700">{product.thickness || "-"}</p>
                    </div>
                    <div className="grid grid-cols-2 border-b border-slate-100 pb-2">
                      <p className="text-slate-500">Don Vi:</p>
                      <p className="font-semibold text-slate-700">{product.unit || "-"}</p>
                    </div>
                    <div className="grid grid-cols-2 border-b border-slate-100 pb-2">
                      <p className="text-slate-500">Khoi Luong Tham Khao:</p>
                      <p className="font-semibold text-slate-700">{product.referenceWeight ? `${product.referenceWeight} kg/tam` : "-"}</p>
                    </div>
                    <div className="grid grid-cols-2 items-center border-b border-slate-100 pb-2">
                      <p className="text-slate-500">Trang Thai:</p>
                      <p>
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${statusClassName}`}>
                          {statusLabel}
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </BaseCard>
      }
    />
  );
};

export default ProductDetailPage;
