import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import DataTable, { type DataTableColumn } from "../../components/table/DataTable";
import FilterSearchModalBar, { type FilterModalGroup } from "../../components/table/FilterSearchModalBar";
import Pagination from "../../components/table/Pagination";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { InventoryHistoryItem, InventoryHistoryQuery, InventoryTransactionType } from "../../models/inventory/inventory.model";
import { inventoryService } from "../../services/inventory/inventory.service";
import { getErrorMessage } from "../shared/page.utils";

const PAGE_SIZE = 10;

const InventoryHistoryPage = () => {
  const navigate = useNavigate();
  const { notify } = useNotify();
  const [query, setQuery] = useState<InventoryHistoryQuery>({
    page: 1,
    size: PAGE_SIZE,
  });
  const [items, setItems] = useState<InventoryHistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await inventoryService.getHistory(query);
        setItems(response.items);
        setTotal(response.totalElements);
      } catch (error) {
        notify(getErrorMessage(error, "Không thể load inventory history"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [notify, query]);

  const filters: FilterModalGroup[] = [
    {
      key: "transactionType",
      label: "Transaction Type",
      options: [
        { label: "RECEIPT", value: "RECEIPT" },
        { label: "ISSUE", value: "ISSUE" },
        { label: "ADJUSTMENT", value: "ADJUSTMENT" },
      ],
      value: query.transactionType ? [query.transactionType] : [],
    },
    {
      kind: "dateRange",
      key: "dateRange",
      label: "Transaction Date",
      value: {
        from: query.fromDate,
        to: query.toDate,
      },
      fromPlaceholder: "From date",
      toPlaceholder: "To date",
    },
  ];

  const columns = useMemo<DataTableColumn<InventoryHistoryItem>[]>(
    () => [
      { key: "transactionType", header: "Type", className: "font-semibold text-blue-900" },
      { key: "productCode", header: "Product Code", render: (row) => row.productCode ?? row.productId },
      { key: "productName", header: "Product Name", render: (row) => row.productName ?? "-" },
      { key: "quantity", header: "Quantity", render: (row) => String(row.quantity) },
      { key: "balanceAfter", header: "Balance After", render: (row) => (row.balanceAfter == null ? "-" : String(row.balanceAfter)) },
      { key: "reason", header: "Reason", render: (row) => row.reason ?? "-" },
      { key: "note", header: "Note", render: (row) => row.note ?? "-" },
      { key: "createdAt", header: "Created At", render: (row) => row.createdAt ?? "-" },
    ],
    [],
  );

  return (
    <NoResizeScreenTemplate
      loading={loading}
      loadingText="Äang táº£i lá»‹ch sá»­ kho..."
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Inventory History"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          actions={<CustomButton label="Back to Inventory" onClick={() => navigate(ROUTE_URL.INVENTORY_STATUS)} />}
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chá»§" },
                { label: "Inventory", url: ROUTE_URL.INVENTORY_STATUS },
                { label: "History" },
              ]}
            />
          }
        />
      }
      body={
        <BaseCard>
          <FilterSearchModalBar
            searchValue={query.search ?? ""}
            onSearchChange={(value) =>
              setQuery((previous) => ({
                ...previous,
                search: value || undefined,
                page: 1,
              }))
            }
            onSearchReset={() =>
              setQuery((previous) => ({
                ...previous,
                search: undefined,
                page: 1,
              }))
            }
            searchPlaceholder="Search transaction"
            modalTitle="Inventory history filters"
            filters={filters}
            onApplyFilters={(values) => {
              const transactionType = Array.isArray(values.transactionType)
                ? (values.transactionType[0] as InventoryTransactionType | undefined)
                : undefined;
              const dateRange = values.dateRange;
              const fromDate = dateRange && !Array.isArray(dateRange) && "from" in dateRange ? dateRange.from : undefined;
              const toDate = dateRange && !Array.isArray(dateRange) && "to" in dateRange ? dateRange.to : undefined;

              if (fromDate && toDate && fromDate > toDate) {
                notify("From date must be earlier than or equal to to date.", "error");
                return;
              }

              setQuery((previous) => ({
                ...previous,
                transactionType,
                fromDate,
                toDate,
                page: 1,
              }));
            }}
          />
          <DataTable columns={columns} data={items} emptyText="No inventory history found." />
          <Pagination
            page={query.page ?? 1}
            pageSize={query.size ?? PAGE_SIZE}
            total={total}
            onChange={(nextPage) => setQuery((previous) => ({ ...previous, page: nextPage }))}
          />
        </BaseCard>
      }
    />
  );
};

export default InventoryHistoryPage;

