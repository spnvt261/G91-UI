import { Modal } from "antd";
import { useEffect, useMemo, useState } from "react";
import BaseCard from "../../components/cards/BaseCard";
import CustomButton from "../../components/customButton/CustomButton";
import CustomSelect from "../../components/customSelect/CustomSelect";
import CustomTextField from "../../components/customTextField/CustomTextField";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import DataTable, { type DataTableColumn } from "../../components/table/DataTable";
import FilterSearchModalBar, { type FilterModalGroup } from "../../components/table/FilterSearchModalBar";
import Pagination from "../../components/table/Pagination";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { useNotify } from "../../context/notifyContext";
import type { UserRole, UserStatus } from "../../models/auth/auth.model";
import type { AccountListItem } from "../../models/account/account.model";
import { accountService } from "../../services/account/account.service";
import { getErrorMessage } from "../shared/page.utils";

const PAGE_SIZE = 8;

interface AccountFormValues {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  roleId: UserRole;
  status: UserStatus;
}

const EMPTY_FORM: AccountFormValues = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  roleId: "CUSTOMER",
  status: "ACTIVE",
};

const ROLE_OPTIONS: Array<{ label: string; value: UserRole }> = [
  { label: "CUSTOMER", value: "CUSTOMER" },
  { label: "WAREHOUSE", value: "WAREHOUSE" },
  { label: "ACCOUNTANT", value: "ACCOUNTANT" },
  { label: "OWNER", value: "OWNER" },
];

const STATUS_OPTIONS: Array<{ label: string; value: UserStatus }> = [
  { label: "ACTIVE", value: "ACTIVE" },
  { label: "INACTIVE", value: "INACTIVE" },
  { label: "LOCKED", value: "LOCKED" },
  { label: "PENDING_VERIFICATION", value: "PENDING_VERIFICATION" },
];

const AccountListPage = () => {
  const { notify } = useNotify();
  const [items, setItems] = useState<AccountListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState({
    page: 1,
    size: PAGE_SIZE,
    role: undefined as UserRole | undefined,
    status: undefined as UserStatus | undefined,
    keyword: "",
  });
  const [loading, setLoading] = useState(false);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [selectedItem, setSelectedItem] = useState<AccountListItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [formValues, setFormValues] = useState<AccountFormValues>(EMPTY_FORM);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await accountService.getList({
          page: query.page,
          size: query.size,
          role: query.role,
          status: query.status,
        });

        const keywordLower = query.keyword.trim().toLowerCase();
        const allItems = response.content ?? [];
        const filtered = keywordLower
          ? allItems.filter(
              (item) =>
                item.fullName.toLowerCase().includes(keywordLower) ||
                item.email.toLowerCase().includes(keywordLower) ||
                item.id.toLowerCase().includes(keywordLower),
            )
          : allItems;

        setItems(filtered);
        setTotal(filtered.length || response.totalElements || 0);
      } catch (error) {
        notify(getErrorMessage(error, "Cannot load accounts"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [notify, query.keyword, query.page, query.role, query.size, query.status]);

  const filters: FilterModalGroup[] = [
    {
      key: "role",
      label: "Role",
      options: ROLE_OPTIONS,
      value: query.role ? [query.role] : [],
    },
    {
      key: "status",
      label: "Status",
      options: STATUS_OPTIONS,
      value: query.status ? [query.status] : [],
    },
  ];

  const columns = useMemo<DataTableColumn<AccountListItem>[]>(
    () => [
      { key: "fullName", header: "Full Name", className: "font-semibold text-blue-900" },
      { key: "email", header: "Email" },
      { key: "role", header: "Role" },
      { key: "status", header: "Status" },
      { key: "createdAt", header: "Created At" },
    ],
    [],
  );

  const openCreateModal = () => {
    setFormValues(EMPTY_FORM);
    setFormMode("create");
  };

  const openEditModal = async (item: AccountListItem) => {
    try {
      const detail = await accountService.getDetail(item.id);
      setSelectedItem(item);
      setFormValues({
        fullName: detail.fullName,
        email: detail.email,
        password: "",
        phone: detail.phone ?? "",
        address: detail.address ?? "",
        roleId: detail.role,
        status: detail.status,
      });
      setFormMode("edit");
    } catch (error) {
      notify(getErrorMessage(error, "Cannot load account detail"), "error");
    }
  };

  const openDetailModal = async (item: AccountListItem) => {
    try {
      const detail = await accountService.getDetail(item.id);
      setSelectedItem({
        ...item,
        fullName: detail.fullName,
        email: detail.email,
        role: detail.role,
        status: detail.status,
      });
      setDetailOpen(true);
    } catch (error) {
      notify(getErrorMessage(error, "Cannot load account detail"), "error");
    }
  };

  const handleSubmitForm = async () => {
    if (!formValues.fullName.trim()) {
      notify("Full name is required.", "error");
      return;
    }

    if (!formValues.email.trim()) {
      notify("Email is required.", "error");
      return;
    }

    if (formMode === "create" && !formValues.password.trim()) {
      notify("Password is required.", "error");
      return;
    }

    try {
      if (formMode === "create") {
        setCreating(true);
        await accountService.create({
          fullName: formValues.fullName.trim(),
          email: formValues.email.trim(),
          password: formValues.password,
          phone: formValues.phone.trim() || undefined,
          address: formValues.address.trim() || undefined,
          roleId: formValues.roleId,
        });
        notify("Account created successfully.", "success");
      } else if (formMode === "edit" && selectedItem) {
        setEditing(true);
        await accountService.update(selectedItem.id, {
          fullName: formValues.fullName.trim(),
          phone: formValues.phone.trim() || undefined,
          address: formValues.address.trim() || undefined,
          roleId: formValues.roleId,
          status: formValues.status,
        });
        notify("Account updated successfully.", "success");
      }

      setFormMode(null);
      setSelectedItem(null);
      setQuery((previous) => ({ ...previous }));
    } catch (error) {
      notify(getErrorMessage(error, "Cannot save account"), "error");
    } finally {
      setCreating(false);
      setEditing(false);
    }
  };

  const handleDeactivate = async () => {
    if (!selectedItem) {
      return;
    }

    try {
      setDeactivating(true);
      await accountService.deactivate(selectedItem.id, { reason: "Deactivated by owner" });
      notify("Account deactivated successfully.", "success");
      setSelectedItem(null);
      setQuery((previous) => ({ ...previous }));
    } catch (error) {
      notify(getErrorMessage(error, "Cannot deactivate account"), "error");
    } finally {
      setDeactivating(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      loading={loading}
      loadingText="Loading user accounts..."
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="User Management"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          actions={<CustomButton label="Create Account" onClick={openCreateModal} />}
          breadcrumb={<CustomBreadcrumb breadcrumbs={[{ label: "Trang chủ" }, { label: "User Management" }]} />}
        />
      }
      body={
        <BaseCard>
          <FilterSearchModalBar
            searchValue={query.keyword}
            onSearchChange={(value) =>
              setQuery((previous) => ({
                ...previous,
                keyword: value,
                page: 1,
              }))
            }
            onSearchReset={() =>
              setQuery((previous) => ({
                ...previous,
                keyword: "",
                page: 1,
              }))
            }
            searchPlaceholder="Search account"
            filters={filters}
            onApplyFilters={(values) => {
              setQuery((previous) => ({
                ...previous,
                role: Array.isArray(values.role) ? (values.role[0] as UserRole | undefined) : undefined,
                status: Array.isArray(values.status) ? (values.status[0] as UserStatus | undefined) : undefined,
                page: 1,
              }));
            }}
          />

          <DataTable
            columns={columns}
            data={items}
            emptyText="No accounts found."
            actions={(row) => (
              <div className="flex flex-wrap gap-2">
                <CustomButton label="View" className="px-2 py-1 text-sm" onClick={() => void openDetailModal(row)} />
                <CustomButton label="Edit" className="px-2 py-1 text-sm" onClick={() => void openEditModal(row)} />
                <CustomButton
                  label="Deactivate"
                  className="bg-red-500 px-2 py-1 text-sm hover:bg-red-600"
                  onClick={() => setSelectedItem(row)}
                />
              </div>
            )}
          />

          <Pagination
            page={query.page}
            pageSize={query.size}
            total={total}
            onChange={(nextPage) => setQuery((previous) => ({ ...previous, page: nextPage }))}
          />

          <Modal
            title={formMode === "create" ? "Create User Account" : "Update User Account"}
            open={Boolean(formMode)}
            onCancel={() => {
              if (creating || editing) {
                return;
              }
              setFormMode(null);
              setSelectedItem(null);
            }}
            closable={!creating && !editing}
            maskClosable={!creating && !editing}
            footer={
              <div className="flex justify-end gap-2">
                <CustomButton
                  label="Cancel"
                  className="border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  onClick={() => {
                    setFormMode(null);
                    setSelectedItem(null);
                  }}
                  disabled={creating || editing}
                />
                <CustomButton
                  label={creating || editing ? "Saving..." : "Save"}
                  onClick={handleSubmitForm}
                  disabled={creating || editing}
                />
              </div>
            }
          >
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <CustomTextField title="Full Name" value={formValues.fullName} onChange={(event) => setFormValues((previous) => ({ ...previous, fullName: event.target.value }))} />
              <CustomTextField
                title="Email"
                value={formValues.email}
                disabled={formMode === "edit"}
                onChange={(event) => setFormValues((previous) => ({ ...previous, email: event.target.value }))}
              />
              {formMode === "create" ? (
                <CustomTextField
                  title="Password"
                  type="password"
                  value={formValues.password}
                  onChange={(event) => setFormValues((previous) => ({ ...previous, password: event.target.value }))}
                />
              ) : null}
              <CustomTextField title="Phone" value={formValues.phone} onChange={(event) => setFormValues((previous) => ({ ...previous, phone: event.target.value }))} />
              <CustomTextField
                title="Address"
                value={formValues.address}
                onChange={(event) => setFormValues((previous) => ({ ...previous, address: event.target.value }))}
              />
              <CustomSelect
                title="Role"
                options={ROLE_OPTIONS}
                value={formValues.roleId ? [formValues.roleId] : []}
                onChange={(selected) => setFormValues((previous) => ({ ...previous, roleId: (selected[0] as UserRole) ?? "CUSTOMER" }))}
                classNameSelect="w-full text-left"
                classNameOptions="w-full left-0"
              />
              {formMode === "edit" ? (
                <CustomSelect
                  title="Status"
                  options={STATUS_OPTIONS}
                  value={formValues.status ? [formValues.status] : []}
                  onChange={(selected) => setFormValues((previous) => ({ ...previous, status: (selected[0] as UserStatus) ?? "ACTIVE" }))}
                  classNameSelect="w-full text-left"
                  classNameOptions="w-full left-0"
                />
              ) : null}
            </div>
          </Modal>

          <Modal
            title="User Account Detail"
            open={detailOpen}
            onCancel={() => {
              setDetailOpen(false);
              setSelectedItem(null);
            }}
            footer={
              <div className="flex justify-end">
                <CustomButton
                  label="Close"
                  className="border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  onClick={() => {
                    setDetailOpen(false);
                    setSelectedItem(null);
                  }}
                />
              </div>
            }
          >
            {selectedItem ? (
              <div className="space-y-2 text-sm text-slate-700">
                <p>
                  <span className="font-semibold">Full Name:</span> {selectedItem.fullName}
                </p>
                <p>
                  <span className="font-semibold">Email:</span> {selectedItem.email}
                </p>
                <p>
                  <span className="font-semibold">Role:</span> {selectedItem.role}
                </p>
                <p>
                  <span className="font-semibold">Status:</span> {selectedItem.status}
                </p>
                <p>
                  <span className="font-semibold">Created At:</span> {selectedItem.createdAt}
                </p>
              </div>
            ) : null}
          </Modal>

          <Modal
            title="Deactivate User Account"
            open={Boolean(selectedItem) && !detailOpen && !formMode}
            onCancel={() => (deactivating ? undefined : setSelectedItem(null))}
            closable={!deactivating}
            maskClosable={!deactivating}
            footer={
              <div className="flex justify-end gap-2">
                <CustomButton
                  label="Cancel"
                  className="border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  onClick={() => setSelectedItem(null)}
                  disabled={deactivating}
                />
                <CustomButton
                  label={deactivating ? "Deactivating..." : "Deactivate"}
                  className="bg-red-500 hover:bg-red-600"
                  onClick={handleDeactivate}
                  disabled={deactivating}
                />
              </div>
            }
          >
            <p className="text-sm text-slate-600">Are you sure you want to deactivate this user account?</p>
            {selectedItem ? <p className="mt-2 text-sm font-semibold text-slate-800">{selectedItem.fullName}</p> : null}
          </Modal>
        </BaseCard>
      }
    />
  );
};

export default AccountListPage;
