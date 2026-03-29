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
import type { CustomerModel } from "../../models/customer/customer.model";
import { customerService } from "../../services/customer/customer.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage } from "../shared/page.utils";

const PAGE_SIZE = 8;

const CustomerListPage = () => {
  const navigate = useNavigate();
  const role = getStoredUserRole();
  const canCreateCustomer = canPerformAction(role, "customer.create");
  const canDisableCustomer = canPerformAction(role, "customer.delete-disable");

  const [allItems, setAllItems] = useState<CustomerModel[]>([]);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState("");
  const [status, setStatus] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [disablingId, setDisablingId] = useState<string | null>(null);
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
      label: "Tr?ng thái",
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
      { key: "phone", header: "S? di?n tho?i" },
      { key: "status", header: "Tr?ng thái" },
    ],
    [],
  );

  const handleDisableCustomer = async (customer: CustomerModel) => {
    if (customer.status === "INACTIVE") {
      return;
    }

    try {
      setDisablingId(customer.id);
      const updated = await customerService.disable(customer.id);
      setAllItems((previous) => previous.map((item) => (item.id === customer.id ? updated : item)));
      notify("Ðã vô hi?u hóa khách hàng.", "success");
    } catch (err) {
      notify(getErrorMessage(err, "Cannot disable customer"), "error");
    } finally {
      setDisablingId(null);
    }
  };

  return (
    <NoResizeScreenTemplate
      loading={loading}
      loadingText="Ðang t?i danh sách khách hàng..."
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Qu?n lý khách hàng"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          actions={canCreateCustomer ? <CustomButton label="T?o khách hàng" onClick={() => navigate(ROUTE_URL.CUSTOMER_CREATE)} /> : undefined}
          breadcrumb={<CustomBreadcrumb breadcrumbs={[{ label: "Trang ch?" }, { label: "Khách hàng" }]} />}
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
          <DataTable
            columns={columns}
            data={pagedItems}
            actions={(row) => (
              <div className="flex gap-2">
                <CustomButton
                  label="Xem"
                  className="px-2 py-1 text-sm"
                  onClick={() => navigate(ROUTE_URL.CUSTOMER_DETAIL.replace(":id", row.id))}
                />
                {canDisableCustomer ? (
                  <CustomButton
                    label={row.status === "INACTIVE" ? "Ðã vô hi?u" : disablingId === row.id ? "Ðang x? lý..." : "Vô hi?u"}
                    className="bg-red-500 px-2 py-1 text-sm hover:bg-red-600"
                    onClick={() => void handleDisableCustomer(row)}
                    disabled={row.status === "INACTIVE" || disablingId === row.id}
                  />
                ) : null}
              </div>
            )}
          />
          <Pagination page={page} pageSize={PAGE_SIZE} total={allItems.length} onChange={setPage} />
        </BaseCard>
      }
    />
  );
};

export default CustomerListPage;

