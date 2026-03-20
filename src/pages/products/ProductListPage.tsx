import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import PageHeader from "../../components/layout/PageHeader";
import Pagination from "../../components/table/Pagination";
import TableFilterBar from "../../components/table/TableFilterBar";
import { useNotify } from "../../context/notifyContext";
import { ROUTE_URL } from "../../const/route_url.const";
import type { ProductModel } from "../../models/product/product.model";
import { productService } from "../../services/product/product.service";
import { getErrorMessage } from "../shared/page.utils";

const PAGE_SIZE = 8;

const ProductListPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<ProductModel[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { notify } = useNotify();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await productService.getList({
          page,
          pageSize: PAGE_SIZE,
          keyword,
          type: typeFilter[0],
        });
        setItems(response.items);
        setTotal(response.pagination.totalItems);
      } catch (err) {
        notify(getErrorMessage(err, "Cannot load products"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [keyword, notify, page, typeFilter]);

  const typeOptions = useMemo(
    () => [
      { label: "Ton", value: "Ton" },
      { label: "Thep Tam", value: "Thep Tam" },
    ],
    [],
  );

  const statusClassName = (status: ProductModel["status"]) =>
    status === "ACTIVE"
      ? "border-emerald-100 bg-emerald-50 text-emerald-700"
      : "border-slate-200 bg-slate-100 text-slate-600";

  const statusLabel = (status: ProductModel["status"]) => (status === "ACTIVE" ? "Dang kinh doanh" : "Ngung kinh doanh");

  return (
    <div className="space-y-4">
      <PageHeader title="Danh sach san pham" />
      <BaseCard>
        <TableFilterBar
          searchValue={keyword}
          onSearchChange={(value) => {
            setKeyword(value);
            setPage(1);
          }}
          filters={[
            {
              key: "type",
              placeholder: "Loai",
              options: typeOptions,
              value: typeFilter,
              onChange: (values) => {
                setTypeFilter(values);
                setPage(1);
              },
            },
          ]}
        />
        {loading ? <p className="mb-3 text-sm text-slate-500">Loading products...</p> : null}
        {!loading && items.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
            Khong tim thay san pham phu hop.
          </div>
        ) : null}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <img src={item.mainImage} alt={item.productName} className="h-44 w-full object-cover" />
              <div className="space-y-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.productCode}</p>
                    <h3 className="line-clamp-2 text-base font-semibold text-slate-800">{item.productName}</h3>
                  </div>
                  <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClassName(item.status)}`}>
                    {statusLabel(item.status)}
                  </span>
                </div>

                <dl className="space-y-1 text-sm text-slate-600">
                  <div className="flex items-center justify-between gap-2">
                    <dt>Loai</dt>
                    <dd className="font-semibold text-slate-700">{item.type || "-"}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt>Kich thuoc</dt>
                    <dd className="font-semibold text-slate-700">{item.size || "-"}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <dt>Be day</dt>
                    <dd className="font-semibold text-slate-700">{item.thickness || "-"}</dd>
                  </div>
                </dl>

                <CustomButton
                  label="Xem chi tiet"
                  className="w-full"
                  onClick={() => navigate(ROUTE_URL.PRODUCT_DETAIL.replace(":id", item.id))}
                />
              </div>
            </article>
          ))}
        </div>
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
      </BaseCard>
    </div>
  );
};

export default ProductListPage;
