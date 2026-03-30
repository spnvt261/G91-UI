import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import DataTable, { type DataTableColumn } from "../../components/table/DataTable";
import FilterSearchModalBar from "../../components/table/FilterSearchModalBar";
import Pagination from "../../components/table/Pagination";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { InventoryStatusItem } from "../../models/inventory/inventory.model";
import { inventoryService } from "../../services/inventory/inventory.service";
import { getErrorMessage } from "../shared/page.utils";

const PAGE_SIZE = 10;

const InventoryStatusPage = () => {
  const navigate = useNavigate();
  const { notify } = useNotify();
  const [items, setItems] = useState<InventoryStatusItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await inventoryService.getStatus({
          page,
          size: PAGE_SIZE,
          search: search || undefined,
        });
        setItems(response.items);
        setTotal(response.totalElements);
      } catch (error) {
        notify(getErrorMessage(error, "Không thể load inventory status"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [notify, page, search]);

  const columns = useMemo<DataTableColumn<InventoryStatusItem>[]>(
    () => [
      { key: "productCode", header: "Product Code", className: "font-semibold text-blue-900" },
      { key: "productName", header: "Product Name", render: (row) => row.productName ?? "-" },
      { key: "unit", header: "Unit", render: (row) => row.unit ?? "-" },
      { key: "onHandQuantity", header: "On Hand", render: (row) => String(row.onHandQuantity) },
      { key: "availableQuantity", header: "Available", render: (row) => String(row.availableQuantity ?? row.onHandQuantity) },
      { key: "reservedQuantity", header: "Reserved", render: (row) => String(row.reservedQuantity ?? 0) },
      { key: "updatedAt", header: "Updated At", render: (row) => row.updatedAt ?? "-" },
    ],
    [],
  );

  return (
    <NoResizeScreenTemplate
      loading={loading}
      loadingText="Äang táº£i tá»“n kho..."
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Inventory Status"
          actions={
            <div className="flex flex-wrap gap-2">
              <CustomButton label="Create Receipt" onClick={() => navigate(ROUTE_URL.INVENTORY_RECEIPT_CREATE)} />
              <CustomButton label="Create Issue" onClick={() => navigate(ROUTE_URL.INVENTORY_ISSUE_CREATE)} />
              <CustomButton label="Adjust Inventory" onClick={() => navigate(ROUTE_URL.INVENTORY_ADJUSTMENT_CREATE)} />
              <CustomButton
                label="Inventory History"
                className="border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                onClick={() => navigate(ROUTE_URL.INVENTORY_HISTORY)}
              />
            </div>
          }
          breadcrumb={<CustomBreadcrumb breadcrumbs={[{ label: "Trang chá»§" }, { label: "Inventory" }]} />}
        />
      }
      body={
        <BaseCard>
          <FilterSearchModalBar
            searchValue={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            onSearchReset={() => {
              setSearch("");
              setPage(1);
            }}
            searchPlaceholder="Search inventory"
            filters={[]}
            onApplyFilters={() => undefined}
          />
          <DataTable columns={columns} data={items} emptyText="No inventory status found." />
          <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
        </BaseCard>
      }
    />
  );
};

export default InventoryStatusPage;

