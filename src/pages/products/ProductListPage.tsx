import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import PageHeader from "../../components/layout/PageHeader";
import DataTable, { type DataTableColumn } from "../../components/table/DataTable";
import Pagination from "../../components/table/Pagination";
import TableFilterBar from "../../components/table/TableFilterBar";
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
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const response = await productService.getList({
          page,
          pageSize: PAGE_SIZE,
          keyword,
          type: typeFilter[0],
        });
        setItems(response.items);
        setTotal(response.pagination.totalItems);
      } catch (err) {
        setError(getErrorMessage(err, "Cannot load products"));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [keyword, page, typeFilter]);

  const columns = useMemo<DataTableColumn<ProductModel>[]>(
    () => [
      { key: "productCode", header: "Ma SP" },
      { key: "productName", header: "Ten San Pham", className: "font-semibold text-blue-900" },
      { key: "type", header: "Loai" },
      { key: "size", header: "Kich Thuoc" },
      { key: "thickness", header: "Be Day" },
      { key: "unit", header: "Don Vi" },
      { key: "status", header: "Trang Thai" },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <PageHeader title="Danh Sach San Pham" />
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
              options: [
                { label: "Ton", value: "Ton" },
                { label: "Thep Tam", value: "Thep Tam" },
              ],
              value: typeFilter,
              onChange: (values) => {
                setTypeFilter(values);
                setPage(1);
              },
            },
          ]}
        />
        {error ? <p className="mb-3 text-sm text-red-500">{error}</p> : null}
        {loading ? <p className="mb-3 text-sm text-slate-500">Loading products...</p> : null}
        <DataTable
          columns={columns}
          data={items}
          actions={(row) => (
            <CustomButton
              label="Xem Chi Tiet"
              className="px-2 py-1 text-sm"
              onClick={() => navigate(ROUTE_URL.PRODUCT_DETAIL.replace(":id", row.id))}
            />
          )}
        />
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
      </BaseCard>
    </div>
  );
};

export default ProductListPage;
