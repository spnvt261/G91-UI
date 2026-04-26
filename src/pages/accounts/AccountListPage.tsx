import {
  CheckCircleOutlined,
  EditOutlined,
  EyeOutlined,
  MoreOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Avatar,
  Breadcrumb,
  Button,
  Col,
  Descriptions,
  Drawer,
  Dropdown,
  Empty,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Table,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { MenuProps } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { useNotify } from "../../context/notifyContext";
import type { UserStatus } from "../../models/auth/auth.model";
import type { AccountDetailResponse, AccountListItem, AccountRoleId, InternalAccountRoleId } from "../../models/account/account.model";
import { accountService } from "../../services/account/account.service";
import PageSectionCard from "../shared/components/PageSectionCard";
import PageSummaryStats from "../shared/components/PageSummaryStats";
import { getErrorMessage } from "../shared/page.utils";
import AccountRoleTag from "./components/AccountRoleTag";
import AccountStatusTag from "./components/AccountStatusTag";
import { ACCOUNT_ROLE_LABEL, ACCOUNT_STATUS_LABEL, formatAccountDateTime } from "./accountPresentation";

const PAGE_SIZE = 8;
const SEARCH_BATCH_SIZE = 100;

interface AccountSummaryState {
  totalAccounts: number;
  activeAccounts: number;
  inactiveAccounts: number;
  pendingAccounts: number;
}

interface AccountQueryState {
  page: number;
  size: number;
  role?: AccountRoleId;
  status?: UserStatus;
  keyword: string;
}

interface AccountFormValues {
  fullName: string;
  email: string;
  password?: string;
  phone?: string;
  address?: string;
  role: AccountRoleId;
  status: UserStatus;
}

interface AccountDetailView extends AccountListItem {
  phone?: string;
  address?: string;
}

interface RoleOption {
  label: string;
  roleName: AccountRoleId;
}

const ACCOUNTANT_ROLE_OPTION: RoleOption = {
  label: "Kế toán",
  roleName: "ACCOUNTANT",
};

const WAREHOUSE_ROLE_OPTION: RoleOption = {
  label: "Kho vận",
  roleName: "WAREHOUSE",
};

const CUSTOMER_ROLE_OPTION: RoleOption = {
  label: "Khách hàng",
  roleName: "CUSTOMER",
};

const OWNER_ROLE_OPTION: RoleOption = {
  label: "Chủ hệ thống",
  roleName: "OWNER",
};

const INTERNAL_ROLE_OPTIONS: RoleOption[] = [ACCOUNTANT_ROLE_OPTION, WAREHOUSE_ROLE_OPTION];
const FILTER_ROLE_OPTIONS: RoleOption[] = [OWNER_ROLE_OPTION, ACCOUNTANT_ROLE_OPTION, WAREHOUSE_ROLE_OPTION, CUSTOMER_ROLE_OPTION];

const STATUS_OPTIONS: Array<{ label: string; value: UserStatus }> = [
  { label: "Đang hoạt động", value: "ACTIVE" },
  { label: "Tạm ngưng", value: "INACTIVE" },
  { label: "Đang khóa", value: "LOCKED" },
  { label: "Chờ xác thực", value: "PENDING_VERIFICATION" },
];

const isInternalRole = (role: AccountRoleId): role is InternalAccountRoleId =>
  role === "ACCOUNTANT" || role === "WAREHOUSE";

const isAccountRoleId = (role: string): role is AccountRoleId =>
  role === "ACCOUNTANT" || role === "WAREHOUSE" || role === "CUSTOMER" || role === "OWNER";

const toDetailView = (item: AccountListItem, detail?: AccountDetailResponse): AccountDetailView => ({
  id: item.id,
  fullName: detail?.fullName ?? item.fullName,
  email: detail?.email ?? item.email,
  role: detail?.role ?? item.role,
  status: detail?.status ?? item.status,
  createdAt: detail?.createdAt ?? item.createdAt,
  phone: detail?.phone,
  address: detail?.address,
});

const AccountListPage = () => {
  const { notify } = useNotify();

  const [query, setQuery] = useState<AccountQueryState>({
    page: 1,
    size: PAGE_SIZE,
    keyword: "",
  });
  const [searchDraft, setSearchDraft] = useState("");

  const [items, setItems] = useState<AccountListItem[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);

  const [summary, setSummary] = useState<AccountSummaryState>({
    totalAccounts: 0,
    activeAccounts: 0,
    inactiveAccounts: 0,
    pendingAccounts: 0,
  });
  const [summaryLoading, setSummaryLoading] = useState(false);

  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState(false);
  const [deactivating, setDeactivating] = useState(false);
  const [activatingId, setActivatingId] = useState<string | null>(null);

  const [formMode, setFormMode] = useState<"create" | "edit" | null>(null);
  const [editTarget, setEditTarget] = useState<AccountListItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailItem, setDetailItem] = useState<AccountDetailView | null>(null);
  const [actionTarget, setActionTarget] = useState<AccountListItem | null>(null);

  const [roleIdByName, setRoleIdByName] = useState<Partial<Record<AccountRoleId, string>>>({});
  const [form] = Form.useForm<AccountFormValues>();
  const selectedRole = Form.useWatch("role", form);

  const formRoleOptions = useMemo(() => {
    if (formMode === "edit" && (selectedRole === "OWNER" || selectedRole === "CUSTOMER")) {
      return FILTER_ROLE_OPTIONS;
    }

    return INTERNAL_ROLE_OPTIONS;
  }, [formMode, selectedRole]);

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
      notify(getErrorMessage(error, "Không thể tải danh sách vai trò."), "error");
    }
  }, [notify]);

  const loadSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const [totalResponse, activeResponse, inactiveResponse, lockedResponse, pendingResponse] = await Promise.all([
        accountService.getList({ page: 1, size: 1 }),
        accountService.getList({ page: 1, size: 1, status: "ACTIVE" }),
        accountService.getList({ page: 1, size: 1, status: "INACTIVE" }),
        accountService.getList({ page: 1, size: 1, status: "LOCKED" }),
        accountService.getList({ page: 1, size: 1, status: "PENDING_VERIFICATION" }),
      ]);

      setSummary({
        totalAccounts: Number(totalResponse.totalElements ?? 0),
        activeAccounts: Number(activeResponse.totalElements ?? 0),
        inactiveAccounts: Number(inactiveResponse.totalElements ?? 0) + Number(lockedResponse.totalElements ?? 0),
        pendingAccounts: Number(pendingResponse.totalElements ?? 0),
      });
    } catch (error) {
      notify(getErrorMessage(error, "Không thể tải thống kê tài khoản."), "warning");
    } finally {
      setSummaryLoading(false);
    }
  }, [notify]);

  const syncLiveTargets = useCallback((source: AccountListItem[]) => {
    setEditTarget((previous) => (previous ? source.find((item) => item.id === previous.id) ?? previous : previous));
    setActionTarget((previous) => (previous ? source.find((item) => item.id === previous.id) ?? previous : previous));
    setDetailItem((previous) => {
      if (!previous) {
        return previous;
      }

      const matched = source.find((item) => item.id === previous.id);
      if (!matched) {
        return previous;
      }

      return {
        ...previous,
        ...matched,
      };
    });
  }, []);

  const loadAccounts = useCallback(async () => {
    try {
      setLoading(true);
      setListError(null);

      if (!query.keyword.trim()) {
        const response = await accountService.getList({
          page: query.page,
          size: query.size,
          role: query.role,
          status: query.status,
        });

        const pageItems = response.content ?? [];
        setItems(pageItems);
        setTotalItems(Number(response.totalElements ?? pageItems.length));
        syncLiveTargets(pageItems);
        return;
      }

      const firstPage = await accountService.getList({
        page: 1,
        size: SEARCH_BATCH_SIZE,
        role: query.role,
        status: query.status,
      });

      const expectedTotal = Number(firstPage.totalElements ?? firstPage.content?.length ?? 0);
      const totalPages = Math.max(1, Math.ceil(expectedTotal / SEARCH_BATCH_SIZE));

      const pageRequests: Promise<{ content: AccountListItem[] }>[] = [];
      for (let pageIndex = 2; pageIndex <= totalPages; pageIndex += 1) {
        pageRequests.push(
          accountService.getList({
            page: pageIndex,
            size: SEARCH_BATCH_SIZE,
            role: query.role,
            status: query.status,
          }).then((response) => ({ content: response.content ?? [] })),
        );
      }

      const restPages = await Promise.all(pageRequests);
      const allItems = [firstPage.content ?? [], ...restPages.map((page) => page.content)].flat();

      const keywordLower = query.keyword.trim().toLowerCase();
      const filteredItems = allItems.filter((item) => {
        return (
          item.fullName.toLowerCase().includes(keywordLower) ||
          item.email.toLowerCase().includes(keywordLower) ||
          item.id.toLowerCase().includes(keywordLower)
        );
      });

      const startIndex = (query.page - 1) * query.size;
      const nextItems = filteredItems.slice(startIndex, startIndex + query.size);

      setItems(nextItems);
      setTotalItems(filteredItems.length);
      syncLiveTargets(filteredItems);
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải danh sách tài khoản.");
      setListError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [notify, query.keyword, query.page, query.role, query.size, query.status, syncLiveTargets]);

  useEffect(() => {
    void loadRoles();
    void loadSummary();
  }, [loadRoles, loadSummary]);

  useEffect(() => {
    void loadAccounts();
  }, [loadAccounts]);

  const resolveRoleId = useCallback(
    (roleName: AccountRoleId) => roleIdByName[roleName],
    [roleIdByName],
  );

  const openCreateModal = () => {
    setFormMode("create");
    setEditTarget(null);
    form.setFieldsValue({
      fullName: "",
      email: "",
      password: "",
      phone: "",
      address: "",
      role: "ACCOUNTANT",
      status: "ACTIVE",
    });
  };

  const openEditModal = async (item: AccountListItem) => {
    try {
      const detail = await accountService.getDetail(item.id);
      setEditTarget(item);
      setFormMode("edit");
      form.setFieldsValue({
        fullName: detail.fullName,
        email: detail.email,
        password: "",
        phone: detail.phone ?? "",
        address: detail.address ?? "",
        role: detail.role,
        status: detail.status,
      });
    } catch (error) {
      notify(getErrorMessage(error, "Không thể tải chi tiết tài khoản."), "error");
    }
  };

  const openDetailDrawer = async (item: AccountListItem) => {
    try {
      const detail = await accountService.getDetail(item.id);
      setDetailItem(toDetailView(item, detail));
      setDetailOpen(true);
    } catch (error) {
      notify(getErrorMessage(error, "Không thể tải chi tiết tài khoản."), "error");
    }
  };

  const closeFormModal = () => {
    if (creating || editing) {
      return;
    }

    setFormMode(null);
    setEditTarget(null);
    form.resetFields();
  };

  const closeDetailDrawer = () => {
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
    try {
      const values = await form.validateFields();
      const roleId = resolveRoleId(values.role);

      if (!roleId) {
        notify(`Không tìm thấy định danh vai trò cho ${ACCOUNT_ROLE_LABEL[values.role]}.`, "error");
        return;
      }

      if (formMode === "create") {
        if (!isInternalRole(values.role)) {
          notify("Tài khoản mới chỉ được phép chọn vai trò Kế toán, Kho vận hoặc Khách hàng.", "error");
          return;
        }

        setCreating(true);
        await accountService.create({
          fullName: values.fullName.trim(),
          email: values.email.trim(),
          password: values.password ?? "",
          phone: values.phone?.trim() || undefined,
          address: values.address?.trim() || undefined,
          roleId,
        });

        notify("Đã tạo tài khoản thành công.", "success");
      }

      if (formMode === "edit" && editTarget) {
        setEditing(true);
        await accountService.update(editTarget.id, {
          fullName: values.fullName.trim(),
          phone: values.phone?.trim() || undefined,
          address: values.address?.trim() || undefined,
          roleId,
          status: values.status,
        });

        notify("Đã cập nhật tài khoản thành công.", "success");
      }

      setFormMode(null);
      setEditTarget(null);
      form.resetFields();
      await Promise.all([loadAccounts(), loadSummary()]);
    } catch (error) {
      if (typeof error === "object" && error !== null && "errorFields" in error) {
        return;
      }

      notify(getErrorMessage(error, "Không thể lưu thông tin tài khoản."), "error");
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
      notify("Không thể tạm ngưng tài khoản Chủ hệ thống.", "error");
      return;
    }

    try {
      setDeactivating(true);
      await accountService.deactivate(actionTarget.id, { reason: "Tạm ngưng bởi quản trị viên" });
      notify("Đã tạm ngưng tài khoản thành công.", "success");
      setActionTarget(null);

      if (detailItem?.id === actionTarget.id) {
        setDetailItem((previous) => (previous ? { ...previous, status: "INACTIVE" } : previous));
      }
      if (formMode === "edit" && editTarget?.id === actionTarget.id) {
        form.setFieldValue("status", "INACTIVE");
      }

      await Promise.all([loadAccounts(), loadSummary()]);
    } catch (error) {
      notify(getErrorMessage(error, "Không thể tạm ngưng tài khoản."), "error");
    } finally {
      setDeactivating(false);
    }
  };

  const handleActivate = async (item: AccountListItem) => {
    if (item.role === "OWNER") {
      notify("Không thể kích hoạt tài khoản Chủ hệ thống từ màn hình này.", "error");
      return;
    }

    try {
      setActivatingId(item.id);
      const detail = await accountService.getDetail(item.id);
      const roleId = resolveRoleId(detail.role);
      if (!roleId) {
        notify(`Không tìm thấy định danh vai trò cho ${ACCOUNT_ROLE_LABEL[detail.role]}.`, "error");
        return;
      }

      await accountService.update(item.id, {
        fullName: detail.fullName.trim(),
        phone: detail.phone ?? undefined,
        address: detail.address ?? undefined,
        roleId,
        status: "ACTIVE",
      });

      notify("Đã kích hoạt lại tài khoản.", "success");
      setActionTarget((previous) => (previous?.id === item.id ? null : previous));
      if (detailItem?.id === item.id) {
        setDetailItem((previous) => (previous ? { ...previous, status: "ACTIVE" } : previous));
      }
      if (formMode === "edit" && editTarget?.id === item.id) {
        form.setFieldValue("status", "ACTIVE");
        form.setFieldValue("role", detail.role);
      }

      await Promise.all([loadAccounts(), loadSummary()]);
    } catch (error) {
      notify(getErrorMessage(error, "Không thể kích hoạt tài khoản."), "error");
    } finally {
      setActivatingId(null);
    }
  };

  const columns: ColumnsType<AccountListItem> = [
    {
      title: "Tài khoản",
      key: "identity",
      render: (_, row) => (
        <Space size={12} align="start">
          <Avatar icon={<UserOutlined />} style={{ backgroundColor: "#e6f4ff", color: "#1677ff" }} />
          <Space direction="vertical" size={2}>
            <Typography.Text strong>{row.fullName}</Typography.Text>
            <Typography.Text type="secondary">{row.email}</Typography.Text>
            <Typography.Text type="secondary" style={{ fontSize: 12 }}>
              Mã người dùng: {row.id}
            </Typography.Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      width: 170,
      render: (value: AccountRoleId) => <AccountRoleTag role={value} />,
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 170,
      render: (value: UserStatus) => <AccountStatusTag status={value} compact />,
    },
    {
      title: "Ngày tạo",
      dataIndex: "createdAt",
      key: "createdAt",
      width: 190,
      render: (value: string) => formatAccountDateTime(value),
    },
    {
      title: "Hành động",
      key: "actions",
      width: 170,
      render: (_, row) => {
        const canDeactivate = row.status === "ACTIVE" && row.role !== "OWNER";
        const canActivate = row.status === "INACTIVE" && isInternalRole(row.role);

        const actionItems: MenuProps["items"] = [
          {
            key: `edit-${row.id}`,
            label: "Chỉnh sửa",
            icon: <EditOutlined />,
            onClick: () => void openEditModal(row),
          },
        ];

        if (canDeactivate) {
          actionItems.push({
            key: `deactivate-${row.id}`,
            label: "Tạm ngưng",
            icon: <StopOutlined />,
            danger: true,
            onClick: () => setActionTarget(row),
          });
        }

        if (canActivate) {
          actionItems.push({
            key: `activate-${row.id}`,
            label: activatingId === row.id ? "Đang kích hoạt..." : "Kích hoạt lại",
            icon: <CheckCircleOutlined />,
            disabled: Boolean(activatingId),
            onClick: () => void handleActivate(row),
          });
        }

        return (
          <Space>
            <Button type="link" icon={<EyeOutlined />} onClick={() => void openDetailDrawer(row)}>
              Chi tiết
            </Button>
            <Dropdown menu={{ items: actionItems }} trigger={["click"]}>
              <Button icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  return (
    <NoResizeScreenTemplate
      loading={false}
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Quản trị tài khoản người dùng"
          subtitle="Tập trung theo dõi trạng thái và quyền truy cập để vận hành hệ thống an toàn, rõ ràng."
          actions={
            <Button type="primary" icon={<PlusOutlined />} onClick={openCreateModal}>
              Tạo tài khoản
            </Button>
          }
          breadcrumb={
            <Breadcrumb
              items={[
                { title: "Trang chủ" },
                { title: "Quản trị tài khoản" },
              ]}
            />
          }
        />
      }
      body={
        <Space direction="vertical" size={16} style={{ width: "100%" }}>
          <PageSummaryStats
            loading={summaryLoading}
            items={[
              { key: "total", title: "Tổng tài khoản", value: summary.totalAccounts, icon: <TeamOutlined />, valueColor: "#1d4ed8" },
              { key: "active", title: "Đang hoạt động", value: summary.activeAccounts, valueColor: "#16a34a" },
              { key: "inactive", title: "Tạm ngưng", value: summary.inactiveAccounts, valueColor: "#f97316" },
              { key: "pending", title: "Chờ xác thực", value: summary.pendingAccounts, valueColor: "#a855f7" },
            ]}
          />

          <PageSectionCard title="Tìm kiếm và lọc" subtitle="Lọc nhanh theo vai trò, trạng thái hoặc tìm theo tên, thư điện tử, mã tài khoản.">
            <Row gutter={[12, 12]}>
              <Col xs={24} lg={12}>
                <Input.Search
                  value={searchDraft}
                  placeholder="Nhập tên, thư điện tử hoặc mã tài khoản"
                  allowClear
                  enterButton="Tìm"
                  prefix={<SearchOutlined />}
                  onChange={(event) => setSearchDraft(event.target.value)}
                  onSearch={(value) =>
                    setQuery((previous) => ({
                      ...previous,
                      keyword: value.trim(),
                      page: 1,
                    }))
                  }
                />
              </Col>
              <Col xs={24} sm={12} lg={4}>
                <Select
                  allowClear
                  style={{ width: "100%" }}
                  placeholder="Vai trò"
                  options={FILTER_ROLE_OPTIONS.map((option) => ({ label: option.label, value: option.roleName }))}
                  value={query.role}
                  onChange={(value) =>
                    setQuery((previous) => ({
                      ...previous,
                      role: value,
                      page: 1,
                    }))
                  }
                />
              </Col>
              <Col xs={24} sm={12} lg={4}>
                <Select
                  allowClear
                  style={{ width: "100%" }}
                  placeholder="Trạng thái"
                  options={STATUS_OPTIONS}
                  value={query.status}
                  onChange={(value) =>
                    setQuery((previous) => ({
                      ...previous,
                      status: value,
                      page: 1,
                    }))
                  }
                />
              </Col>
              <Col xs={24} lg={4}>
                <Button
                  icon={<ReloadOutlined />}
                  style={{ width: "100%" }}
                  onClick={() => {
                    setSearchDraft("");
                    setQuery({ page: 1, size: PAGE_SIZE, keyword: "", role: undefined, status: undefined });
                  }}
                >
                  Đặt lại bộ lọc
                </Button>
              </Col>
            </Row>

            {query.keyword.trim() ? (
              <Alert
                style={{ marginTop: 12 }}
                type="info"
                showIcon
                message="Tìm kiếm theo từ khóa đang được áp dụng trên toàn bộ tập dữ liệu tài khoản."
                description="Quá trình này có thể mất thêm một chút thời gian nếu số lượng tài khoản lớn."
              />
            ) : null}
          </PageSectionCard>

          <PageSectionCard title="Danh sách tài khoản" subtitle={`Hiển thị ${items.length} / ${totalItems} tài khoản`}>
            {listError ? (
              <Alert
                type="error"
                showIcon
                message="Không thể tải dữ liệu tài khoản"
                description={listError}
                action={
                  <Button size="small" onClick={() => void loadAccounts()}>
                    Thử lại
                  </Button>
                }
                style={{ marginBottom: 12 }}
              />
            ) : null}

            <Table<AccountListItem>
              rowKey="id"
              columns={columns}
              dataSource={items}
              loading={loading}
              pagination={{
                current: query.page,
                pageSize: query.size,
                total: totalItems,
                showSizeChanger: false,
                showTotal: (value) => `Tổng ${value} tài khoản`,
                onChange: (nextPage) =>
                  setQuery((previous) => ({
                    ...previous,
                    page: nextPage,
                  })),
              }}
              locale={{
                emptyText: (
                  <Empty
                    description={
                      query.keyword.trim()
                        ? "Không tìm thấy tài khoản phù hợp với từ khóa hiện tại."
                        : "Hiện chưa có tài khoản nào trong danh sách."
                    }
                  />
                ),
              }}
            />
          </PageSectionCard>

          <Modal
            title={formMode === "create" ? "Tạo tài khoản mới" : "Chỉnh sửa tài khoản"}
            open={Boolean(formMode)}
            onCancel={closeFormModal}
            closable={!creating && !editing}
            maskClosable={!creating && !editing}
            okText={creating || editing ? "Đang lưu..." : formMode === "create" ? "Tạo tài khoản" : "Lưu thay đổi"}
            okButtonProps={{ loading: creating || editing }}
            cancelText="Hủy"
            cancelButtonProps={{ disabled: creating || editing }}
            onOk={() => void handleSubmitForm()}
            width={760}
          >
            <Form form={form} layout="vertical" requiredMark={false}>
              <Row gutter={12}>
                <Col xs={24} md={12}>
                  <Form.Item label="Họ và tên" name="fullName" rules={[{ required: true, message: "Vui lòng nhập họ và tên." }]}> 
                    <Input placeholder="Nguyễn Văn A" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item
                    label="Thư điện tử"
                    name="email"
                    rules={[
                      { required: true, message: "Vui lòng nhập địa chỉ thư điện tử." },
                      { type: "email", message: "Địa chỉ thư điện tử không hợp lệ." },
                    ]}
                  >
                    <Input placeholder="ten@congty.vn" disabled={formMode === "edit"} />
                  </Form.Item>
                </Col>

                {formMode === "create" ? (
                  <Col xs={24} md={12}>
                    <Form.Item label="Mật khẩu" name="password" rules={[{ required: true, message: "Vui lòng nhập mật khẩu." }]}> 
                      <Input.Password placeholder="Nhập mật khẩu" />
                    </Form.Item>
                  </Col>
                ) : null}

                <Col xs={24} md={12}>
                  <Form.Item label="Số điện thoại" name="phone">
                    <Input placeholder="0912 345 678" />
                  </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                  <Form.Item label="Vai trò" name="role" rules={[{ required: true, message: "Vui lòng chọn vai trò." }]}> 
                    <Select
                      options={formRoleOptions.map((option) => ({
                        label: option.label,
                        value: option.roleName,
                      }))}
                    />
                  </Form.Item>
                </Col>
                {formMode === "edit" ? (
                  <Col xs={24} md={12}>
                    <Form.Item label="Trạng thái" name="status" rules={[{ required: true, message: "Vui lòng chọn trạng thái." }]}> 
                      <Select options={STATUS_OPTIONS} />
                    </Form.Item>
                  </Col>
                ) : null}
                <Col xs={24}>
                  <Form.Item label="Địa chỉ" name="address">
                    <Input.TextArea rows={3} placeholder="Địa chỉ liên hệ" />
                  </Form.Item>
                </Col>
              </Row>
            </Form>
          </Modal>

          <Drawer
            title="Chi tiết tài khoản"
            open={detailOpen}
            onClose={closeDetailDrawer}
            width={520}
            extra={
              <Space>
                {detailItem?.status === "ACTIVE" && detailItem.role !== "OWNER" ? (
                  <Button danger icon={<StopOutlined />} onClick={deactivateFromDetail}>
                    Tạm ngưng
                  </Button>
                ) : null}
                {detailItem?.status === "INACTIVE" && isInternalRole(detailItem.role) ? (
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    loading={activatingId === detailItem.id}
                    onClick={() => void handleActivate(detailItem)}
                  >
                    Kích hoạt lại
                  </Button>
                ) : null}
              </Space>
            }
          >
            {detailItem ? (
              <Space direction="vertical" size={16} style={{ width: "100%" }}>
                <Descriptions column={1} bordered size="small" title={detailItem.fullName}>
                  <Descriptions.Item label="Thư điện tử">{detailItem.email}</Descriptions.Item>
                  <Descriptions.Item label="Vai trò">
                    <AccountRoleTag role={detailItem.role} />
                  </Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">
                    <AccountStatusTag status={detailItem.status} />
                  </Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">{detailItem.phone || "Chưa cập nhật"}</Descriptions.Item>
                  <Descriptions.Item label="Địa chỉ">{detailItem.address || "Chưa cập nhật"}</Descriptions.Item>
                  <Descriptions.Item label="Ngày tạo">{formatAccountDateTime(detailItem.createdAt)}</Descriptions.Item>
                </Descriptions>
              </Space>
            ) : null}
          </Drawer>

          <Modal
            title="Xác nhận tạm ngưng tài khoản"
            open={Boolean(actionTarget)}
            onCancel={() => (deactivating ? undefined : setActionTarget(null))}
            closable={!deactivating}
            maskClosable={!deactivating}
            okText={deactivating ? "Đang tạm ngưng..." : "Tạm ngưng tài khoản"}
            okButtonProps={{ danger: true, loading: deactivating }}
            cancelButtonProps={{ disabled: deactivating }}
            cancelText="Hủy"
            onOk={() => void handleDeactivate()}
          >
            <Space direction="vertical" size={12}>
              <Alert
                type="warning"
                showIcon
                message="Tài khoản sẽ mất quyền truy cập cho đến khi được kích hoạt lại."
                description="Bạn chỉ nên tạm ngưng khi thật sự cần thiết để đảm bảo an toàn dữ liệu."
              />
              <Typography.Text>
                Bạn có chắc chắn muốn tạm ngưng tài khoản <Typography.Text strong>{actionTarget?.fullName}</Typography.Text>?
              </Typography.Text>
              <Typography.Text type="secondary">Vai trò hiện tại: {actionTarget ? ACCOUNT_ROLE_LABEL[actionTarget.role] : "-"}</Typography.Text>
              <Typography.Text type="secondary">Trạng thái hiện tại: {actionTarget ? ACCOUNT_STATUS_LABEL[actionTarget.status] : "-"}</Typography.Text>
            </Space>
          </Modal>
        </Space>
      }
    />
  );
};

export default AccountListPage;
