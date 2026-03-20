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
import type { CustomerModel } from "../../models/customer/customer.model";
import { customerService } from "../../services/customer/customer.service";
import { getErrorMessage } from "../shared/page.utils";

const PAGE_SIZE = 8;

const CustomerListPage = () => {
  const navigate = useNavigate();
  const [allItems, setAllItems] = useState<CustomerModel[]>([]);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const { notify } = useNotify();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const result = await customerService.getList({ keyword, status: status[0] as "ACTIVE" | "INACTIVE" | undefined });
        setAllItems(result);
      } catch (err) {
        notify(getErrorMessage(err, "Cannot load customers"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [keyword, notify, status]);

  const pagedItems = useMemo(() => allItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [allItems, page]);
  const filters: FilterModalGroup[] = [
    {
      key: "status",
      label: "Trạng thái",
      options: [
        { label: "Active", value: "ACTIVE" },
        { label: "Inactive", value: "INACTIVE" },
      ],
      value: status,
    },
  ];

  const columns = useMemo<DataTableColumn<CustomerModel>[]>(
    () => [
      { key: "id", header: "ID", className: "font-semibold text-blue-900" },
      { key: "fullName", header: "Tên khách hàng" },
      { key: "email", header: "Email" },
      { key: "phone", header: "Số điện thoại" },
      { key: "status", header: "Trạng thái" },
    ],
    [],
  );

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Quản lý khách hàng"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          actions={<CustomButton label="Tạo khách hàng" onClick={() => navigate(ROUTE_URL.CUSTOMER_CREATE)} />}
          breadcrumb={<CustomBreadcrumb breadcrumbs={[{ label: "Trang chủ" }, { label: "Khách hàng" }]} />}
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
            searchPlaceholder="Tìm khách hàng"
            filters={filters}
            onApplyFilters={(values) => {
              setStatus(Array.isArray(values.status) ? (values.status as Array<NonNullable<CustomerModel["status"]>>) : []);
              setPage(1);
            }}
          />
          {loading ? <p className="mb-3 text-sm text-slate-500">Đang tải danh sách khách hàng...</p> : null}
          <DataTable
            columns={columns}
            data={pagedItems}
            actions={(row) => (
              <CustomButton
                label="Xem"
                className="px-2 py-1 text-sm"
                onClick={() => navigate(ROUTE_URL.CUSTOMER_DETAIL.replace(":id", row.id))}
              />
            )}
          />
          <Pagination page={page} pageSize={PAGE_SIZE} total={allItems.length} onChange={setPage} />
        </BaseCard>
      }
    />
  );
};

export default CustomerListPage;
