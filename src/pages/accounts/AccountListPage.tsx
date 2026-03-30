import { Modal } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
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
import type { UserStatus } from "../../models/auth/auth.model";
import type { AccountListItem, AccountRoleId, InternalAccountRoleId } from "../../models/account/account.model";
import { accountService } from "../../services/account/account.service";
import { getErrorMessage } from "../shared/page.utils";

const PAGE_SIZE = 8;

interface RoleOption {
  label: string;
  roleName: AccountRoleId;
}

interface AccountFormValues {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  address: string;
  roleOption: RoleOption | null;
  status: UserStatus;
}

const ACCOUNTANT_ROLE_OPTION: RoleOption = {
  label: "ACCOUNTANT",
  roleName: "ACCOUNTANT",
};

const WAREHOUSE_ROLE_OPTION: RoleOption = {
  label: "WAREHOUSE",
  roleName: "WAREHOUSE",
};

const CUSTOMER_ROLE_OPTION: RoleOption = {
  label: "CUSTOMER",
  roleName: "CUSTOMER",
};

const OWNER_ROLE_OPTION: RoleOption = {
  label: "OWNER",
  roleName: "OWNER",
};

const ROLE_OPTION_BY_NAME: Record<AccountRoleId, RoleOption> = {
  ACCOUNTANT: ACCOUNTANT_ROLE_OPTION,
  WAREHOUSE: WAREHOUSE_ROLE_OPTION,
  CUSTOMER: CUSTOMER_ROLE_OPTION,
  OWNER: OWNER_ROLE_OPTION,
};

const INTERNAL_ROLE_OPTIONS: RoleOption[] = [ACCOUNTANT_ROLE_OPTION, WAREHOUSE_ROLE_OPTION, CUSTOMER_ROLE_OPTION];
const FILTER_ROLE_OPTIONS: RoleOption[] = [OWNER_ROLE_OPTION, ...INTERNAL_ROLE_OPTIONS];

const toSelectOptions = (options: RoleOption[]) =>
  options.map((option) => ({
    label: option.label,
    value: option.roleName,
  }));

const STATUS_OPTIONS: Array<{ label: string; value: UserStatus }> = [
  { label: "ACTIVE", value: "ACTIVE" },
  { label: "INACTIVE", value: "INACTIVE" },
  { label: "LOCKED", value: "LOCKED" },
  { label: "PENDING_VERIFICATION", value: "PENDING_VERIFICATION" },
];

const toRoleOption = (role?: AccountRoleId): RoleOption | null => {
  if (!role) {
    return null;
  }
  return ROLE_OPTION_BY_NAME[role] ?? null;
};

const createEmptyFormValues = (): AccountFormValues => ({
  fullName: "",
  email: "",
  password: "",
  phone: "",
  address: "",
  roleOption: ACCOUNTANT_ROLE_OPTION,
  status: "ACTIVE",
});

const isInternalRole = (role: AccountRoleId): role is InternalAccountRoleId =>
  role === "ACCOUNTANT" || role === "WAREHOUSE" || role === "CUSTOMER";
const isAccountRoleId = (role: string): role is AccountRoleId =>
  role === "ACCOUNTANT" || role === "WAREHOUSE" || role === "CUSTOMER" || role === "OWNER";

const AccountListPage = () => {
  const { notify } = useNotify();
  const [items, setItems] = useState<AccountListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState({
    page: 1,
    size: PAGE_SIZE,
    role: undefined as AccountRoleId | undefined,
    status: undefined as UserStatus | undefined,
    keyword: "",
  });
  const [loading, setLoading] = useState(false);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [activatingId, setActivatingId] = useState<string | null>(null);
  const [detailItem, setDetailItem] = useState<AccountListItem | null>(null);
  const [editTarget, setEditTarget] = useState<AccountListItem | null>(null);
  const [actionTarget, setActionTarget] = useState<AccountListItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [formValues, setFormValues] = useState<AccountFormValues>(createEmptyFormValues);
  const [roleIdByName, setRoleIdByName] = useState<Partial<Record<AccountRoleId, string>>>({});

  const loadRoles = useCallback(async () => {
    try {
      const roleResponses = await accountService.getRoles();
      const nextRoleIdByName: Partial<Record<AccountRoleId, string>> = {};

      roleResponses.forEach((role) => {
        if (isAccountRoleId(role.name)) {
          nextRoleIdByName[role.name] = role.id;
        }
      });

      setRoleIdByName(nextRoleIdByName);
    } catch (error) {
      notify(getErrorMessage(error, "Không thể load roles"), "error");
    }
  }, [notify]);

  const loadAccounts = useCallback(async () => {
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
      const hasKeyword = keywordLower.length > 0;

      setItems(filtered);
      setTotal(hasKeyword ? filtered.length : Number(response.totalElements ?? filtered.length));
      setDetailItem((previous) => (previous ? allItems.find((item) => item.id === previous.id) ?? previous : previous));
      setEditTarget((previous) => (previous ? allItems.find((item) => item.id === previous.id) ?? previous : previous));
      setActionTarget((previous) => (previous ? allItems.find((item) => item.id === previous.id) ?? previous : previous));
    } catch (error) {
      notify(getErrorMessage(error, "Không thể load accounts"), "error");
    } finally {
      setLoading(false);
    }
  }, [notify, query.keyword, query.page, query.role, query.size, query.status]);

  useEffect(() => {
    void loadRoles();
  }, [loadRoles]);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  const resolveRoleId = useCallback(
    (roleName: AccountRoleId) => roleIdByName[roleName],
    [roleIdByName],
  );

  const formRoleOptions = useMemo(() => {
    if (formMode === "edit" && formValues.roleOption?.roleName === "OWNER") {
      return [OWNER_ROLE_OPTION, ...INTERNAL_ROLE_OPTIONS];
    }
    return INTERNAL_ROLE_OPTIONS;
  }, [formMode, formValues.roleOption?.roleName]);

  const filters: FilterModalGroup[] = [
    {
      key: "role",
      label: "Role",
      options: toSelectOptions(FILTER_ROLE_OPTIONS),
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
    setFormValues(createEmptyFormValues());
    setEditTarget(null);
    setFormMode("create");
  };

  const openEditModal = async (item: AccountListItem) => {
    try {
      const detail = await accountService.getDetail(item.id);
      setEditTarget(item);
      setFormValues({
        fullName: detail.fullName,
        email: detail.email,
        password: "",
        phone: detail.phone ?? "",
        address: detail.address ?? "",
        roleOption: toRoleOption(detail.role),
        status: detail.status,
      });
      setFormMode("edit");
    } catch (error) {
      notify(getErrorMessage(error, "Không thể load account detail"), "error");
    }
  };

  const openDetailModal = async (item: AccountListItem) => {
    try {
      const detail = await accountService.getDetail(item.id);
      setDetailItem({
        ...item,
        fullName: detail.fullName,
        email: detail.email,
        role: detail.role,
        status: detail.status,
      });
      setDetailOpen(true);
    } catch (error) {
      notify(getErrorMessage(error, "Không thể load account detail"), "error");
    }
  };

  const closeFormModal = () => {
    if (creating || editing) {
      return;
    }

    setFormMode(null);
    setEditTarget(null);
  };

  const closeDetailModal = () => {
    setDetailOpen(false);
    setDetailItem(null);
  };

  const deactivateFromDetail = () => {
    if (!detailItem) {
      return;
    }

    setDetailOpen(false);
    setActionTarget(detailItem);
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

    const roleName = formValues.roleOption?.roleName;
    if (!roleName) {
      notify("Role is required.", "error");
      return;
    }

    const roleId = resolveRoleId(roleName);
    if (!roleId) {
      notify(`Role ID for ${roleName} is not configured.`, "error");
      return;
    }

    try {
      if (formMode === "create") {
        if (!isInternalRole(roleName)) {
          notify("Role must be ACCOUNTANT, WAREHOUSE, or CUSTOMER.", "error");
          return;
        }

        setCreating(true);
        await accountService.create({
          fullName: formValues.fullName.trim(),
          email: formValues.email.trim(),
          password: formValues.password,
          phone: formValues.phone.trim() || undefined,
          address: formValues.address.trim() || undefined,
          roleId,
        });
        notify("Account created successfully.", "success");
      } else if (formMode === "edit" && editTarget) {
        setEditing(true);
        await accountService.update(editTarget.id, {
          fullName: formValues.fullName.trim(),
          phone: formValues.phone.trim() || undefined,
          address: formValues.address.trim() || undefined,
          roleId,
          status: formValues.status,
        });
        notify("Account updated successfully.", "success");
      }

      setFormMode(null);
      setEditTarget(null);
      await loadAccounts();
    } catch (error) {
      notify(getErrorMessage(error, "Không thể save account"), "error");
    } finally {
      setCreating(false);
      setEditing(false);
    }
  };

  const handleDeactivate = async () => {
    if (!actionTarget) {
      return;
    }

    if (actionTarget.role === "OWNER") {
      notify("Không thể deactivate OWNER account.", "error");
      return;
    }

    try {
      setDeactivating(true);
      await accountService.deactivate(actionTarget.id, { reason: "Deactivated by owner" });
      notify("Account deactivated successfully.", "success");
      setActionTarget(null);
      setDetailItem((previous) => (previous && previous.id === actionTarget.id ? { ...previous, status: "INACTIVE" } : previous));
      setFormValues((previous) =>
        formMode === "edit" && editTarget?.id === actionTarget.id ? { ...previous, status: "INACTIVE" } : previous,
      );
      await loadAccounts();
    } catch (error) {
      notify(getErrorMessage(error, "Không thể deactivate account"), "error");
    } finally {
      setDeactivating(false);
    }
  };

  const handleActivate = async (item: AccountListItem) => {
    if (item.role === "OWNER") {
      notify("Không thể activate OWNER account from this screen.", "error");
      return;
    }

    try {
      setActivatingId(item.id);
      const detail = await accountService.getDetail(item.id);
      const roleId = resolveRoleId(detail.role);
      if (!roleId) {
        notify(`Role ID for ${detail.role} is not configured.`, "error");
        return;
      }

      await accountService.update(item.id, {
        fullName: detail.fullName.trim(),
        phone: detail.phone ?? undefined,
        address: detail.address ?? undefined,
        roleId,
        status: "ACTIVE",
      });
      notify("Account activated successfully.", "success");
      setActionTarget((previous) => (previous?.id === item.id ? null : previous));
      setDetailItem((previous) => (previous && previous.id === item.id ? { ...previous, status: "ACTIVE" } : previous));
      setFormValues((previous) =>
        formMode === "edit" && editTarget?.id === item.id
          ? {
              ...previous,
              status: "ACTIVE",
              roleOption: toRoleOption(detail.role),
            }
          : previous,
      );
      await loadAccounts();
    } catch (error) {
      notify(getErrorMessage(error, "Không thể activate account"), "error");
    } finally {
      setActivatingId(null);
    }
  };

  return (
    <NoResizeScreenTemplate
      loading={loading}
      loadingText="Đang tải danh sách tài khoản người dùng..."
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="User Management"
          className="rounded-none border-x-0 border-t-0 bg-gray-100"
          actions={<CustomButton label="Create Account" onClick={openCreateModal} />}
          breadcrumb={<CustomBreadcrumb breadcrumbs={[{ label: "Trang chá»§" }, { label: "User Management" }]} />}
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
                role: Array.isArray(values.role) ? (values.role[0] as AccountRoleId | undefined) : undefined,
                status: Array.isArray(values.status) ? (values.status[0] as UserStatus | undefined) : undefined,
                page: 1,
              }));
            }}
          />

          <DataTable
            columns={columns}
            data={items}
            emptyText="No accounts found."
            actions={(row) => {
              const canDeactivate = row.status === "ACTIVE" && row.role !== "OWNER";
              const canActivate = row.status === "INACTIVE" && isInternalRole(row.role);

              return (
                <div className="flex flex-wrap gap-2">
                  <CustomButton label="View" className="px-2 py-1 text-sm" onClick={() => void openDetailModal(row)} />
                  <CustomButton label="Edit" className="px-2 py-1 text-sm" onClick={() => void openEditModal(row)} />
                  {canDeactivate ? (
                    <CustomButton
                      label="Deactivate"
                      className="bg-red-500 px-2 py-1 text-sm hover:bg-red-600"
                      onClick={() => setActionTarget(row)}
                    />
                  ) : null}
                  {canActivate ? (
                    <CustomButton
                      label={activatingId === row.id ? "Activating..." : "Activate"}
                      className="bg-emerald-600 px-2 py-1 text-sm hover:bg-emerald-700"
                      onClick={() => void handleActivate(row)}
                      disabled={Boolean(activatingId)}
                    />
                  ) : null}
                </div>
              );
            }}
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
            onCancel={closeFormModal}
            closable={!creating && !editing}
            maskClosable={!creating && !editing}
            footer={
              <div className="flex justify-end gap-2">
                <CustomButton
                  label="Cancel"
                  className="border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  onClick={closeFormModal}
                  disabled={creating || editing}
                />
                <CustomButton label={creating || editing ? "Saving..." : "Save"} onClick={handleSubmitForm} disabled={creating || editing} />
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
                options={toSelectOptions(formRoleOptions)}
                value={formValues.roleOption?.roleName ? [formValues.roleOption.roleName] : []}
                onChange={(selected) => {
                  const selectedRoleName = selected[0] as AccountRoleId | undefined;
                  const selectedRole =
                    formRoleOptions.find((option) => option.roleName === selectedRoleName) ??
                    (selectedRoleName ? toRoleOption(selectedRoleName) : null);
                  setFormValues((previous) => ({ ...previous, roleOption: selectedRole }));
                }}
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
            onCancel={closeDetailModal}
            footer={
              <div className="flex justify-end gap-2">
                {detailItem?.status === "ACTIVE" && detailItem.role !== "OWNER" ? (
                  <CustomButton label="Deactivate" className="bg-red-500 hover:bg-red-600" onClick={deactivateFromDetail} />
                ) : null}
                {detailItem?.status === "INACTIVE" && isInternalRole(detailItem.role) ? (
                  <CustomButton
                    label={activatingId === detailItem.id ? "Activating..." : "Activate"}
                    className="bg-emerald-600 hover:bg-emerald-700"
                    onClick={() => void handleActivate(detailItem)}
                    disabled={Boolean(activatingId)}
                  />
                ) : null}
                <CustomButton
                  label="Close"
                  className="border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  onClick={closeDetailModal}
                />
              </div>
            }
          >
            {detailItem ? (
              <div className="space-y-2 text-sm text-slate-700">
                <p>
                  <span className="font-semibold">Full Name:</span> {detailItem.fullName}
                </p>
                <p>
                  <span className="font-semibold">Email:</span> {detailItem.email}
                </p>
                <p>
                  <span className="font-semibold">Role:</span> {detailItem.role}
                </p>
                <p>
                  <span className="font-semibold">Status:</span> {detailItem.status}
                </p>
                <p>
                  <span className="font-semibold">Created At:</span> {detailItem.createdAt}
                </p>
              </div>
            ) : null}
          </Modal>

          <Modal
            title="Deactivate User Account"
            open={Boolean(actionTarget)}
            onCancel={() => (deactivating ? undefined : setActionTarget(null))}
            closable={!deactivating}
            maskClosable={!deactivating}
            footer={
              <div className="flex justify-end gap-2">
                <CustomButton
                  label="Cancel"
                  className="border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  onClick={() => setActionTarget(null)}
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
            {actionTarget ? <p className="mt-2 text-sm font-semibold text-slate-800">{actionTarget.fullName}</p> : null}
          </Modal>
        </BaseCard>
      }
    />
  );
};

export default AccountListPage;


