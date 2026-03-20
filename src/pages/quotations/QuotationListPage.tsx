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
import type { QuotationModel } from "../../models/quotation/quotation.model";
import { quotationService } from "../../services/quotation/quotation.service";
import { getErrorMessage, toCurrency } from "../shared/page.utils";

const PAGE_SIZE = 8;

const QuotationListPage = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<QuotationModel[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<string[]>([]);
  const [createdRange, setCreatedRange] = useState<{ from?: string; to?: string }>({});
  const [totalRange, setTotalRange] = useState<{ min?: string; max?: string }>({});
  const { notify } = useNotify();
  const [loading, setLoading] = useState(false);

  const filters: FilterModalGroup[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Draft", value: "DRAFT" },
        { label: "Pending", value: "PENDING" },
        { label: "Converted", value: "CONVERTED" },
        { label: "Rejected", value: "REJECTED" },
      ],
      value: status,
    },
    {
      kind: "dateRange",
      key: "createdRange",
      label: "Ngày tạo",
      value: createdRange,
      fromPlaceholder: "Từ ngày tạo",
      toPlaceholder: "Đến ngày tạo",
    },
    {
      kind: "numberRange",
      key: "totalRange",
      label: "Tổng tiền",
      value: totalRange,
      minPlaceholder: "Tổng tiền tối thiểu",
      maxPlaceholder: "Tổng tiền tối đa",
    },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await quotationService.getCustomerList({
          page,
          pageSize: PAGE_SIZE,
          keyword: keyword || undefined,
          status: status[0] as QuotationModel["status"] | undefined,
          fromDate: createdRange.from || undefined,
          toDate: createdRange.to || undefined,
        });

        const mappedItems: QuotationModel[] = response.items.map((item) => ({
          id: item.id,
          quotationNumber: item.quotationNumber,
          customerId: "",
          items: [],
          totalAmount: item.totalAmount,
          status: item.status,
          validUntil: item.validUntil,
          createdAt: item.createdAt,
        }));

        const minTotal = totalRange.min ? Number(totalRange.min) : undefined;
        const maxTotal = totalRange.max ? Number(totalRange.max) : undefined;
        const filteredItems = mappedItems.filter((item) => {
          return (minTotal == null || item.totalAmount >= minTotal) && (maxTotal == null || item.totalAmount <= maxTotal);
        });

        setItems(filteredItems);
        setTotal(minTotal != null || maxTotal != null ? filteredItems.length : response.pagination.totalItems);
      } catch (err) {
        notify(getErrorMessage(err, "Cannot load quotations"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [createdRange.from, createdRange.to, keyword, notify, page, status, totalRange.max, totalRange.min]);

  const columns = useMemo<DataTableColumn<QuotationModel>[]>(
    () => [
      {
        key: "quotationNumber",
        header: "Quotation No",
        className: "font-semibold text-blue-900",
        render: (row) => row.quotationNumber || row.id,
      },
      { key: "status", header: "Status" },
      {
        key: "totalAmount",
        header: "Total",
        render: (row) => toCurrency(row.totalAmount),
      },
      { key: "validUntil", header: "Valid Until" },
      { key: "createdAt", header: "Created At" },
    ],
    [],
  );

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Quotation Management"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          actions={<CustomButton label="Create Quotation" onClick={() => navigate(ROUTE_URL.QUOTATION_CREATE)} />}
          breadcrumb={<CustomBreadcrumb breadcrumbs={[{ label: "Trang chủ" }, { label: "Báo giá" }]} />}
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
            searchPlaceholder="Search quotation"
            filters={filters}
            onApplyFilters={(values) => {
              setStatus(Array.isArray(values.status) ? (values.status as QuotationModel["status"][]) : []);

              const createdValue = values.createdRange;
              setCreatedRange(
                createdValue && !Array.isArray(createdValue) && ("from" in createdValue || "to" in createdValue)
                  ? { from: createdValue.from, to: createdValue.to }
                  : {},
              );

              const totalValue = values.totalRange;
              setTotalRange(
                totalValue && !Array.isArray(totalValue) && ("min" in totalValue || "max" in totalValue)
                  ? { min: totalValue.min, max: totalValue.max }
                  : {},
              );

              setPage(1);
            }}
          />
          {loading ? <p className="mb-3 text-sm text-slate-500">Đang tải danh sách báo giá...</p> : null}
          <DataTable
            columns={columns}
            data={items}
            actions={(row) => (
              <CustomButton
                label="View"
                className="px-2 py-1 text-sm"
                onClick={() => navigate(ROUTE_URL.QUOTATION_DETAIL.replace(":id", row.id))}
              />
            )}
          />
          <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
        </BaseCard>
      }
    />
  );
};

export default QuotationListPage;
