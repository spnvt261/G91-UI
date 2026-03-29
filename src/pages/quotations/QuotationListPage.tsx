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
import type { QuotationModel, QuotationStatus } from "../../models/quotation/quotation.model";
import { quotationService } from "../../services/quotation/quotation.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage, toCurrency } from "../shared/page.utils";

const PAGE_SIZE = 8;

const QuotationListPage = () => {
  const navigate = useNavigate();
  const role = getStoredUserRole();
  const canCreateQuotation = canPerformAction(role, "quotation.create");
  const canCreateContract = canPerformAction(role, "contract.create");
  const isCustomerRole = canCreateQuotation;
  const [items, setItems] = useState<QuotationModel[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<QuotationStatus[]>([]);
  const [createdRange, setCreatedRange] = useState<{ from?: string; to?: string }>({});
  const { notify } = useNotify();
  const [loading, setLoading] = useState(false);

  const filters: FilterModalGroup[] = [
    {
      key: "status",
      label: "Status",
      options: [
        { label: "Draft", value: "DRAFT" },
        { label: "Pending", value: "PENDING" },
        { label: "Approved", value: "APPROVED" },
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
  ];

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);

        if (isCustomerRole) {
          const response = await quotationService.getCustomerList({
            page,
            pageSize: PAGE_SIZE,
            keyword: keyword || undefined,
            status: status[0] as QuotationStatus | undefined,
            fromDate: createdRange.from || undefined,
            toDate: createdRange.to || undefined,
          });

          setItems(
            response.items.map((item) => ({
              id: item.id,
              quotationNumber: item.quotationNumber,
              items: [],
              totalAmount: item.totalAmount,
              status: item.status,
              validUntil: item.validUntil,
              createdAt: item.createdAt,
              actions: {
                customerCanEdit: Boolean(item.actions?.canEdit),
                accountantCanCreateContract: false,
              },
            })),
          );
          setTotal(response.pagination.totalItems);
          return;
        }

        const response = await quotationService.getManagementList({
          page,
          pageSize: PAGE_SIZE,
          keyword: keyword || undefined,
          status: status[0] as QuotationStatus | undefined,
          fromDate: createdRange.from || undefined,
          toDate: createdRange.to || undefined,
        });

        setItems(
          response.items.map((item) => ({
            id: item.id,
            quotationNumber: item.quotationNumber,
            customerId: item.customerId,
            customerName: item.customerName,
            items: [],
            totalAmount: item.totalAmount,
            status: item.status,
            validUntil: item.validUntil,
            createdAt: item.createdAt,
            actions: {
              customerCanEdit: item.canEdit,
              accountantCanCreateContract: item.canCreateContract,
            },
          })),
        );
        setTotal(response.pagination.totalItems);
      } catch (err) {
        notify(getErrorMessage(err, "Cannot load quotations"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [createdRange.from, createdRange.to, isCustomerRole, keyword, notify, page, status]);

  const columns = useMemo<DataTableColumn<QuotationModel>[]>(
    () => {
      const baseColumns: DataTableColumn<QuotationModel>[] = [
        {
          key: "quotationNumber",
          header: "Quotation No",
          className: "font-semibold text-blue-900",
          render: (row) => row.quotationNumber || row.id,
        },
      ];

      if (!isCustomerRole) {
        baseColumns.push({
          key: "customerName",
          header: "Customer",
          render: (row) => row.customerName || row.customerId || "-",
        });
      }

      baseColumns.push(
        { key: "status", header: "Status" },
        {
          key: "totalAmount",
          header: "Total",
          render: (row) => toCurrency(row.totalAmount),
        },
        { key: "validUntil", header: "Valid Until" },
        { key: "createdAt", header: "Created At" },
      );

      return baseColumns;
    },
    [isCustomerRole],
  );

  return (
    <NoResizeScreenTemplate
      loading={loading}
      loadingText="Đang tải danh sách báo giá..."
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Quotation Management"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          actions={canCreateQuotation ? <CustomButton label="Create Quotation" onClick={() => navigate(ROUTE_URL.QUOTATION_CREATE)} /> : undefined}
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
              setStatus(Array.isArray(values.status) ? (values.status as QuotationStatus[]) : []);

              const createdValue = values.createdRange;
              setCreatedRange(
                createdValue && !Array.isArray(createdValue) && ("from" in createdValue || "to" in createdValue)
                  ? { from: createdValue.from, to: createdValue.to }
                  : {},
              );

              setPage(1);
            }}
          />
          <DataTable
            columns={columns}
            data={items}
            actions={(row) => (
              <div className="flex flex-wrap gap-2">
                <CustomButton
                  label="View"
                  className="px-2 py-1 text-sm"
                  onClick={() => navigate(ROUTE_URL.QUOTATION_DETAIL.replace(":id", row.id))}
                />
                {canCreateContract && row.actions?.accountantCanCreateContract ? (
                  <CustomButton
                    label="Create Contract"
                    className="px-2 py-1 text-sm"
                    onClick={() => navigate(ROUTE_URL.CONTRACT_CREATE.replace(":quotationId", row.id))}
                  />
                ) : null}
              </div>
            )}
          />
          <Pagination page={page} pageSize={PAGE_SIZE} total={total} onChange={setPage} />
        </BaseCard>
      }
    />
  );
};

export default QuotationListPage;
