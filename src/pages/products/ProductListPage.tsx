import { Modal } from "antd";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import FilterSearchModalBar, { type FilterModalGroup } from "../../components/table/FilterSearchModalBar";
import Pagination from "../../components/table/Pagination";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { canPerformAction } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { ProductModel } from "../../models/product/product.model";
import { productService } from "../../services/product/product.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage } from "../shared/page.utils";

const PAGE_SIZE = 8;

const ProductListPage = () => {
  const navigate = useNavigate();
  const role = getStoredUserRole() ?? "GUEST";
  const allowCreate = canPerformAction(role, "product.create");
  const allowUpdate = canPerformAction(role, "product.update");
  const allowDelete = canPerformAction(role, "product.delete");
  const showCreateQuotation = canPerformAction(role, "quotation.create");
  const { notify } = useNotify();

  const [items, setItems] = useState<ProductModel[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<ProductModel["status"][]>([]);
  const [unitFilter, setUnitFilter] = useState<string[]>([]);
  const [thicknessFilter, setThicknessFilter] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingItem, setDeletingItem] = useState<ProductModel | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await productService.getList({
          page,
          pageSize: PAGE_SIZE,
          keyword: keyword || undefined,
          type: typeFilter[0],
          status: statusFilter[0],
          unit: unitFilter[0],
          thickness: thicknessFilter[0],
        });

        setItems(response.items);
        setTotal(response.pagination.totalItems);
      } catch (error) {
        notify(getErrorMessage(error, "Cannot load products"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [keyword, notify, page, statusFilter, thicknessFilter, typeFilter, unitFilter]);

  const typeOptions = useMemo(
    () =>
      [...new Set(items.map((item) => item.type).filter(Boolean))].map((value) => ({
        label: value,
        value,
      })),
    [items],
  );

  const unitOptions = useMemo(
    () =>
      [...new Set(items.map((item) => item.unit).filter(Boolean))].map((value) => ({
        label: value,
        value,
      })),
    [items],
  );

  const thicknessOptions = useMemo(
    () =>
      [...new Set(items.map((item) => item.thickness).filter(Boolean))].map((value) => ({
        label: value,
        value,
      })),
    [items],
  );

  const filters: FilterModalGroup[] = [
    {
      key: "type",
      label: "Type",
      options: typeOptions,
      value: typeFilter,
    },
    {
      key: "status",
      label: "Status",
      options: [
        { label: "ACTIVE", value: "ACTIVE" },
        { label: "INACTIVE", value: "INACTIVE" },
      ],
      value: statusFilter,
    },
    {
      key: "unit",
      label: "Unit",
      options: unitOptions,
      value: unitFilter,
    },
    {
      key: "thickness",
      label: "Thickness",
      options: thicknessOptions,
      value: thicknessFilter,
    },
  ];

  const statusClassName = (status: ProductModel["status"]) =>
    status === "ACTIVE" ? "border-emerald-100 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-600";

  const handleDelete = async () => {
    if (!deletingItem) {
      return;
    }

    try {
      setDeleting(true);
      await productService.remove(deletingItem.id);
      notify("Product deleted successfully.", "success");
      setDeletingItem(null);
      setPage(1);
    } catch (error) {
      notify(getErrorMessage(error, "Cannot delete product"), "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      loading={loading}
      loadingText="Đang tải danh sách sản phẩm..."
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Danh sách sản phẩm"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          actions={
            <div className="flex flex-wrap gap-2">
              {showCreateQuotation ? <CustomButton label="Tạo báo giá" onClick={() => navigate(ROUTE_URL.QUOTATION_CREATE)} /> : null}
              {allowCreate ? <CustomButton label="Create Product" onClick={() => navigate(ROUTE_URL.PRODUCT_CREATE)} /> : null}
            </div>
          }
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Sản phẩm" },
              ]}
            />
          }
        />
      }
      body={
        <BaseCard>
          <FilterSearchModalBar
            searchValue={keyword}
            onSearchChange={(value) => {
              setKeyword(value);
              setPage(1);
            }}
            onSearchReset={() => {
              setKeyword("");
              setPage(1);
            }}
            searchPlaceholder="Tìm sản phẩm"
            modalTitle="Bộ lọc sản phẩm"
            filters={filters}
            onApplyFilters={(values) => {
              setTypeFilter(Array.isArray(values.type) ? values.type : []);
              setStatusFilter(Array.isArray(values.status) ? (values.status as ProductModel["status"][]) : []);
              setUnitFilter(Array.isArray(values.unit) ? values.unit : []);
              setThicknessFilter(Array.isArray(values.thickness) ? values.thickness : []);
              setPage(1);
            }}
          />

          {!loading && items.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500">
              Không tìm thấy sản phẩm phù hợp.
            </div>
          ) : null}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {items.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                {item.mainImage ? (
                  <img src={item.mainImage} alt={item.productName} className="h-44 w-full object-cover" />
                ) : (
                  <div className="flex h-44 items-center justify-center bg-slate-100 text-sm text-slate-500">No image</div>
                )}

                <div className="space-y-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{item.productCode}</p>
                      <h3 className="line-clamp-2 text-base font-semibold text-slate-800">{item.productName}</h3>
                    </div>
                    <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClassName(item.status)}`}>{item.status}</span>
                  </div>

                  <dl className="space-y-1 text-sm text-slate-600">
                    <div className="flex items-center justify-between gap-2">
                      <dt>Type</dt>
                      <dd className="font-semibold text-slate-700">{item.type || "-"}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt>Size</dt>
                      <dd className="font-semibold text-slate-700">{item.size || "-"}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt>Thickness</dt>
                      <dd className="font-semibold text-slate-700">{item.thickness || "-"}</dd>
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <dt>Unit</dt>
                      <dd className="font-semibold text-slate-700">{item.unit || "-"}</dd>
                    </div>
                  </dl>

                  <div className="flex flex-wrap gap-2">
                    <CustomButton label="View" className="px-2 py-1 text-sm" onClick={() => navigate(ROUTE_URL.PRODUCT_DETAIL.replace(":id", item.id))} />
                    {allowUpdate ? (
                      <CustomButton
                        label="Edit"
                        className="px-2 py-1 text-sm"
                        onClick={() => navigate(ROUTE_URL.PRODUCT_EDIT.replace(":id", item.id))}
                      />
                    ) : null}
                    {allowDelete ? (
                      <CustomButton
                        label="Delete"
                        className="bg-red-500 px-2 py-1 text-sm hover:bg-red-600"
                        onClick={() => setDeletingItem(item)}
                      />
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>

          <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />

          <Modal
            title="Delete Product"
            open={Boolean(deletingItem)}
            onCancel={() => (deleting ? undefined : setDeletingItem(null))}
            closable={!deleting}
            maskClosable={!deleting}
            footer={
              <div className="flex justify-end gap-2">
                <CustomButton
                  label="Cancel"
                  className="border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  onClick={() => setDeletingItem(null)}
                  disabled={deleting}
                />
                <CustomButton
                  label={deleting ? "Deleting..." : "Delete"}
                  className="bg-red-500 hover:bg-red-600"
                  onClick={handleDelete}
                  disabled={deleting}
                />
              </div>
            }
          >
            <p className="text-sm text-slate-600">Are you sure you want to soft-delete this product?</p>
            {deletingItem ? <p className="mt-2 text-sm font-semibold text-slate-800">{deletingItem.productName}</p> : null}
          </Modal>
        </BaseCard>
      }
    />
  );
};

export default ProductListPage;
