import { Modal } from "antd";
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
import { canPerformAction } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { PriceListListQuery, PriceListModel, PriceListStatus } from "../../models/pricing/price-list.model";
import { priceListService } from "../../services/pricing/price-list.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage } from "../shared/page.utils";

const PAGE_SIZE = 8;

const PriceListListPage = () => {
  const navigate = useNavigate();
  const { notify } = useNotify();
  const role = getStoredUserRole();
  const canCreate = canPerformAction(role, "price-list.create");
  const canUpdate = canPerformAction(role, "price-list.update");
  const canDelete = canPerformAction(role, "price-list.delete");

  const [query, setQuery] = useState<PriceListListQuery>({
    page: 1,
    size: PAGE_SIZE,
  });
  const [items, setItems] = useState<PriceListModel[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingItem, setDeletingItem] = useState<PriceListModel | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await priceListService.getList(query);
        setItems(response.items);
        setTotal(response.totalElements);
      } catch (error) {
        notify(getErrorMessage(error, "Cannot load price lists"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [notify, query]);

  const customerGroupOptions = useMemo(() => {
    const unique = [...new Set(items.map((item) => item.customerGroup).filter(Boolean))] as string[];
    return unique.map((value) => ({ label: value, value }));
  }, [items]);

  const filters: FilterModalGroup[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "ACTIVE", value: "ACTIVE" },
        { label: "INACTIVE", value: "INACTIVE" },
      ],
      value: query.status ? [query.status] : [],
    },
    {
      key: "customerGroup",
      label: "Customer Group",
      options: customerGroupOptions,
      value: query.customerGroup ? [query.customerGroup] : [],
    },
    {
      kind: "dateRange",
      key: "validRange",
      label: "Validity",
      value: {
        from: query.validFrom,
        to: query.validTo,
      },
      fromPlaceholder: "Valid from",
      toPlaceholder: "Valid to",
    },
  ];

  const columns = useMemo<DataTableColumn<PriceListModel>[]>(
    () => [
      { key: "name", header: "Name", className: "font-semibold text-blue-900" },
      { key: "customerGroup", header: "Customer Group", render: (row) => row.customerGroup || "-" },
      {
        key: "status",
        header: "Status",
        render: (row) => (
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${row.status === "ACTIVE" ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
            {row.status}
          </span>
        ),
      },
      { key: "validFrom", header: "Valid From" },
      { key: "validTo", header: "Valid To" },
      { key: "itemCount", header: "Item Count", render: (row) => String(row.itemCount ?? 0) },
    ],
    [],
  );

  const handleDelete = async () => {
    if (!deletingItem) {
      return;
    }

    try {
      setDeleting(true);
      await priceListService.remove(deletingItem.id);
      notify("Price list deleted successfully.", "success");
      setDeletingItem(null);
      setQuery((previous) => ({ ...previous }));
    } catch (error) {
      notify(getErrorMessage(error, "Cannot delete price list"), "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      loading={loading}
      loadingText="Đang tải danh sách bảng giá..."
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Price List Management"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          actions={canCreate ? <CustomButton label="Create Price List" onClick={() => navigate(ROUTE_URL.PRICE_LIST_CREATE)} /> : undefined}
          breadcrumb={<CustomBreadcrumb breadcrumbs={[{ label: "Trang chủ" }, { label: "Price List" }]} />}
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
            searchPlaceholder="Search price list"
            modalTitle="Price list filters"
            filters={filters}
            onApplyFilters={(values) => {
              const status = Array.isArray(values.status) ? (values.status[0] as PriceListStatus | undefined) : undefined;
              const customerGroup = Array.isArray(values.customerGroup) ? values.customerGroup[0] : undefined;
              const validRange = values.validRange;

              setQuery((previous) => ({
                ...previous,
                status,
                customerGroup,
                validFrom: validRange && !Array.isArray(validRange) && "from" in validRange ? validRange.from : undefined,
                validTo: validRange && !Array.isArray(validRange) && "to" in validRange ? validRange.to : undefined,
                page: 1,
              }));
            }}
          />

          <DataTable
            columns={columns}
            data={items}
            emptyText="No price lists found."
            actions={(row) => (
              <div className="flex flex-wrap gap-2">
                <CustomButton label="View" className="px-2 py-1 text-sm" onClick={() => navigate(ROUTE_URL.PRICE_LIST_DETAIL.replace(":id", row.id))} />
                {canUpdate ? (
                  <CustomButton
                    label="Edit"
                    className="px-2 py-1 text-sm"
                    onClick={() => navigate(`${ROUTE_URL.PRICE_LIST_DETAIL.replace(":id", row.id)}?mode=edit`)}
                  />
                ) : null}
                {canDelete ? (
                  <CustomButton
                    label="Delete"
                    className="bg-red-500 px-2 py-1 text-sm hover:bg-red-600"
                    onClick={() => setDeletingItem(row)}
                  />
                ) : null}
              </div>
            )}
          />

          <Pagination
            page={query.page ?? 1}
            pageSize={query.size ?? PAGE_SIZE}
            total={total}
            onChange={(nextPage) => setQuery((previous) => ({ ...previous, page: nextPage }))}
          />

          <Modal
            title="Delete Price List"
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
                  label={deleting ? "Deleting..." : "Confirm Delete"}
                  className="bg-red-500 hover:bg-red-600"
                  onClick={handleDelete}
                  disabled={deleting}
                />
              </div>
            }
          >
            <p className="text-sm text-slate-600">This action will soft-delete the selected price list. Do you want to continue?</p>
            {deletingItem ? <p className="mt-2 text-sm font-semibold text-slate-800">{deletingItem.name}</p> : null}
          </Modal>
        </BaseCard>
      }
    />
  );
};

export default PriceListListPage;
