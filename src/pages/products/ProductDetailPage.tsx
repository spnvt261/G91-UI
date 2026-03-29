import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { canPerformAction } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { ProductModel } from "../../models/product/product.model";
import { productService } from "../../services/product/product.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage } from "../shared/page.utils";

const ProductDetailPage = () => {
  const navigate = useNavigate();
  const role = getStoredUserRole() ?? "GUEST";
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
      } catch (error) {
        notify(getErrorMessage(error, "Cannot load product detail"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id, notify]);

  const gallery = useMemo(() => (product?.images ?? product?.imageUrls ?? []).filter(Boolean).slice(0, 6), [product]);
  const canUpdate = canPerformAction(role, "product.update");
  const showRequestQuotation = canPerformAction(role, "quotation.create");

  return (
    <NoResizeScreenTemplate
      loading={loading}
      loadingText="Đang tải chi tiết sản phẩm..."
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title={product?.productName || "Chi tiết sản phẩm"}
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          actions={
            <div className="flex flex-wrap gap-2">
              {canUpdate && id ? <CustomButton label="Edit" onClick={() => navigate(ROUTE_URL.PRODUCT_EDIT.replace(":id", id))} /> : null}
              {showRequestQuotation ? (
                <CustomButton
                  label="Yêu cầu báo giá"
                  className="bg-amber-300 text-slate-800 hover:bg-amber-400"
                  onClick={() => navigate(ROUTE_URL.QUOTATION_CREATE)}
                />
              ) : null}
              <CustomButton
                label="Quay lại"
                className="border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                onClick={() => navigate(ROUTE_URL.PRODUCT_LIST)}
              />
            </div>
          }
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Sản phẩm", url: ROUTE_URL.PRODUCT_LIST },
                { label: product?.productName || "Chi tiết" },
              ]}
            />
          }
        />
      }
      body={
        <BaseCard className="border border-slate-200">
          {product ? (
            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                <div className="space-y-3 rounded-lg border border-slate-200 p-3">
                  {activeImage || product.mainImage ? (
                    <img src={activeImage || product.mainImage} alt={product.productName} className="h-72 w-full rounded-md object-cover md:h-[360px]" />
                  ) : (
                    <div className="flex h-72 items-center justify-center rounded-md bg-slate-100 text-sm text-slate-500 md:h-[360px]">No image</div>
                  )}
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
                          <img src={image} alt={`${product.productName} thumbnail`} className="h-full w-full object-cover" />
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-lg border border-slate-200 p-4">
                  <h2 className="mb-4 text-3xl font-semibold text-blue-950">Thông tin sản phẩm</h2>
                  <div className="space-y-3 text-base">
                    <div className="grid grid-cols-2 border-b border-slate-100 pb-2">
                      <p className="text-slate-500">Mã sản phẩm:</p>
                      <p className="font-semibold text-slate-700">{product.productCode || "-"}</p>
                    </div>
                    <div className="grid grid-cols-2 border-b border-slate-100 pb-2">
                      <p className="text-slate-500">Loại:</p>
                      <p className="font-semibold text-slate-700">{product.type || "-"}</p>
                    </div>
                    <div className="grid grid-cols-2 border-b border-slate-100 pb-2">
                      <p className="text-slate-500">Kích thước:</p>
                      <p className="font-semibold text-slate-700">{product.size || "-"}</p>
                    </div>
                    <div className="grid grid-cols-2 border-b border-slate-100 pb-2">
                      <p className="text-slate-500">Bề dày:</p>
                      <p className="font-semibold text-slate-700">{product.thickness || "-"}</p>
                    </div>
                    <div className="grid grid-cols-2 border-b border-slate-100 pb-2">
                      <p className="text-slate-500">Đơn vị:</p>
                      <p className="font-semibold text-slate-700">{product.unit || "-"}</p>
                    </div>
                    <div className="grid grid-cols-2 border-b border-slate-100 pb-2">
                      <p className="text-slate-500">Khối lượng tham khảo:</p>
                      <p className="font-semibold text-slate-700">
                        {product.referenceWeight != null ? `${product.referenceWeight} ${product.unit || ""}`.trim() : "-"}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 items-center border-b border-slate-100 pb-2">
                      <p className="text-slate-500">Trạng thái:</p>
                      <p>
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-semibold ${
                            product.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {product.status}
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
