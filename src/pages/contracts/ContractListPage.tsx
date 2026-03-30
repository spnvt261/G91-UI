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
import type { ContractModel } from "../../models/contract/contract.model";
import { contractService } from "../../services/contract/contract.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage, toCurrency } from "../shared/page.utils";

const PAGE_SIZE = 8;

const ContractListPage = () => {
  const navigate = useNavigate();
  const role = getStoredUserRole();
  const canEdit = canPerformAction(role, "contract.update");
  const [allItems, setAllItems] = useState<ContractModel[]>([]);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<string[]>([]);
  const [createdRange, setCreatedRange] = useState<{ from?: string; to?: string }>({});
  const [totalRange, setTotalRange] = useState<{ min?: string; max?: string }>({});
  const [loading, setLoading] = useState(false);
  const { notify } = useNotify();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const result = await contractService.getList({ keyword, status: status[0] as ContractModel["status"] | undefined });
        setAllItems(result);
      } catch (err) {
        notify(getErrorMessage(err, "Không thể load contracts"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [keyword, notify, status]);

  const filteredItems = useMemo(() => {
    const fromTime = createdRange.from ? new Date(createdRange.from).getTime() : undefined;
    const toTime = createdRange.to ? new Date(createdRange.to).getTime() + 24 * 60 * 60 * 1000 - 1 : undefined;
    const minTotal = totalRange.min ? Number(totalRange.min) : undefined;
    const maxTotal = totalRange.max ? Number(totalRange.max) : undefined;

    return allItems.filter((item) => {
      const createdTime = item.createdAt ? new Date(item.createdAt).getTime() : undefined;
      const validCreatedDate =
        (fromTime == null || (createdTime != null && createdTime >= fromTime)) &&
        (toTime == null || (createdTime != null && createdTime <= toTime));

      const validTotal =
        (minTotal == null || item.totalAmount >= minTotal) &&
        (maxTotal == null || item.totalAmount <= maxTotal);

      return validCreatedDate && validTotal;
    });
  }, [allItems, createdRange.from, createdRange.to, totalRange.max, totalRange.min]);

  const pagedItems = useMemo(() => filteredItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filteredItems, page]);
  const filters: FilterModalGroup[] = [
    {
      key: "status",
      label: "Trạng thái",
      options: [
        { label: "Draft", value: "DRAFT" },
        { label: "Pending", value: "PENDING" },
        { label: "Đã duyệt", value: "APPROVED" },
        { label: "Rejected", value: "REJECTED" },
        { label: "In Progress", value: "IN_PROGRESS" },
        { label: "Completed", value: "COMPLETED" },
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

  const columns = useMemo<DataTableColumn<ContractModel>[]>(
    () => [
      { key: "id", header: "Số hợp đồng", className: "font-semibold text-blue-900" },
      { key: "quotationId", header: "Báo giá" },
      { key: "customerId", header: "Khách hàng" },
      { key: "status", header: "Trạng thái" },
      { key: "totalAmount", header: "Tổng tiền", render: (row) => toCurrency(row.totalAmount) },
      { key: "createdAt", header: "Ngày tạo" },
    ],
    [],
  );

  return (
    <NoResizeScreenTemplate
      loading={loading}
      loadingText="Đang tải danh sách hợp đồng..."
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Quản lý hợp đồng"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          breadcrumb={<CustomBreadcrumb breadcrumbs={[{ label: "Trang chủ" }, { label: "Hợp đồng" }]} />}
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
            searchPlaceholder="Tìm hợp đồng"
            filters={filters}
            onApplyFilters={(values) => {
              setStatus(Array.isArray(values.status) ? (values.status as ContractModel["status"][]) : []);
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
          <DataTable
            columns={columns}
            data={pagedItems}
            actions={(row) => (
              <div className="flex gap-2">
                <CustomButton
                  label="Chi tiết"
                  className="px-2 py-1 text-sm"
                  onClick={() => navigate(ROUTE_URL.CONTRACT_DETAIL.replace(":id", row.id))}
                />
                {canEdit ? (
                  <CustomButton
                    label="Sửa"
                    className="px-2 py-1 text-sm"
                    onClick={() => navigate(ROUTE_URL.CONTRACT_EDIT.replace(":id", row.id))}
                  />
                ) : null}
              </div>
            )}
          />
          <Pagination page={page} pageSize={PAGE_SIZE} total={filteredItems.length} onChange={setPage} />
        </BaseCard>
      }
    />
  );
};

export default ContractListPage;


