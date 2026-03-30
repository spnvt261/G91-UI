import { MoreOutlined, PlusOutlined, ReloadOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Dropdown, Empty, Space, Table, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { MenuProps } from "antd";
import { useNavigate } from "react-router-dom";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { canPerformAction } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { PriceListListQuery, PriceListModel } from "../../models/pricing/price-list.model";
import { priceListService } from "../../services/pricing/price-list.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage } from "../shared/page.utils";
import PriceListDeleteModal from "./components/PriceListDeleteModal";
import PriceListInlineStatus from "./components/PriceListInlineStatus";
import PriceListPageHeader from "./components/PriceListPageHeader";
import PriceListSummaryCards from "./components/PriceListSummaryCards";
import PriceListToolbar from "./components/PriceListToolbar";
import { calculatePriceListSummary, formatDateVi, type PriceListSummaryMetrics } from "./priceList.ui";

const PAGE_SIZE = 10;
const SNAPSHOT_PAGE_SIZE = 200;
const MAX_SNAPSHOT_PAGES = 10;

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
  const [keyword, setKeyword] = useState("");
  const [items, setItems] = useState<PriceListModel[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [summary, setSummary] = useState<PriceListSummaryMetrics | null>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [customerGroupOptions, setCustomerGroupOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [customerGroupHint, setCustomerGroupHint] = useState("Đang chuẩn bị danh sách nhóm khách hàng...");
  const [loadingCustomerGroups, setLoadingCustomerGroups] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingItem, setDeletingItem] = useState<PriceListModel | null>(null);

  const loadList = useCallback(async () => {
    try {
      setLoading(true);
      setListError(null);
      const response = await priceListService.getList(query);
      setItems(response.items);
      setTotal(response.totalElements);
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải danh sách bảng giá.");
      setListError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [notify, query]);

  const loadSummaryAndCustomerGroups = useCallback(async () => {
    try {
      setSummaryLoading(true);
      setLoadingCustomerGroups(true);

      const firstPage = await priceListService.getList({ page: 1, size: SNAPSHOT_PAGE_SIZE });
      const totalElements = firstPage.totalElements;
      const totalPages = Math.max(1, Math.ceil(totalElements / SNAPSHOT_PAGE_SIZE));
      const pagesToLoad = Math.min(totalPages, MAX_SNAPSHOT_PAGES);
      const requests: Array<Promise<Awaited<ReturnType<typeof priceListService.getList>>>> = [];

      for (let page = 2; page <= pagesToLoad; page += 1) {
        requests.push(priceListService.getList({ page, size: SNAPSHOT_PAGE_SIZE }));
      }

      const restPages = requests.length > 0 ? await Promise.all(requests) : [];
      const snapshotMap = new Map<string, PriceListModel>();
      for (const item of firstPage.items) {
        snapshotMap.set(item.id, item);
      }
      for (const pagePayload of restPages) {
        for (const item of pagePayload.items) {
          snapshotMap.set(item.id, item);
        }
      }

      const snapshotItems = Array.from(snapshotMap.values());
      const summaryMetrics = calculatePriceListSummary(snapshotItems);
      setSummary({ ...summaryMetrics, total: totalElements });

      const groups = [...new Set(snapshotItems.map((item) => item.customerGroup?.trim()).filter(Boolean))] as string[];
      setCustomerGroupOptions(
        groups
          .sort((first, second) => first.localeCompare(second, "vi"))
          .map((value) => ({
            label: value,
            value,
          })),
      );

      if (pagesToLoad < totalPages) {
        setCustomerGroupHint("Bộ lọc nhóm khách hàng được tổng hợp từ phần lớn dữ liệu. Nếu thiếu, hãy dùng thêm ô tìm kiếm.");
      } else {
        setCustomerGroupHint("Bộ lọc nhóm khách hàng được tổng hợp từ toàn bộ danh sách bảng giá hiện có.");
      }
    } catch (error) {
      setSummary(null);
      setCustomerGroupOptions([]);
      setCustomerGroupHint("Không thể tải danh sách nhóm khách hàng đầy đủ. Bộ lọc vẫn dùng được theo dữ liệu đang hiển thị.");
      notify(getErrorMessage(error, "Không thể tải dữ liệu thống kê bảng giá."), "warning");
    } finally {
      setSummaryLoading(false);
      setLoadingCustomerGroups(false);
    }
  }, [notify]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    void loadSummaryAndCustomerGroups();
  }, [loadSummaryAndCustomerGroups]);

  const summaryData = useMemo(() => {
    if (summary) {
      return summary;
    }

    const fallback = calculatePriceListSummary(items);
    return { ...fallback, total };
  }, [items, summary, total]);

  const customerGroupSelectOptions = useMemo(() => {
    const optionMap = new Map(customerGroupOptions.map((option) => [option.value, option]));

    for (const item of items) {
      const group = item.customerGroup?.trim();
      if (group && !optionMap.has(group)) {
        optionMap.set(group, { label: group, value: group });
      }
    }

    if (query.customerGroup && !optionMap.has(query.customerGroup)) {
      optionMap.set(query.customerGroup, { label: query.customerGroup, value: query.customerGroup });
    }

    return Array.from(optionMap.values()).sort((first, second) => first.value.localeCompare(second.value, "vi"));
  }, [customerGroupOptions, items, query.customerGroup]);

  const columns = useMemo<ColumnsType<PriceListModel>>(
    () => [
      {
        title: "Bảng giá",
        key: "name",
        render: (_, row) => (
          <Space direction="vertical" size={2}>
            <Typography.Text strong>{row.name}</Typography.Text>
            <Typography.Text type="secondary">{row.customerGroup?.trim() ? `Nhóm: ${row.customerGroup}` : "Nhóm: Chưa chỉ định"}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Hiệu lực",
        key: "validity",
        render: (_, row) => (
          <Space direction="vertical" size={2}>
            <Typography.Text>{`${formatDateVi(row.validFrom)} - ${formatDateVi(row.validTo)}`}</Typography.Text>
            <Typography.Text type="secondary">Cập nhật theo khung thời gian áp dụng</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Trạng thái",
        key: "status",
        width: 220,
        render: (_, row) => <PriceListInlineStatus status={row.status} validFrom={row.validFrom} validTo={row.validTo} />,
      },
      {
        title: "Số sản phẩm",
        key: "itemCount",
        width: 140,
        render: (_, row) => <Typography.Text strong>{row.itemCount ?? row.items.length}</Typography.Text>,
      },
      {
        title: "Thao tác",
        key: "actions",
        width: 170,
        render: (_, row) => {
          const actionItems: MenuProps["items"] = [];

          if (canUpdate) {
            actionItems.push({
              key: "edit",
              label: "Chỉnh sửa",
              onClick: () => navigate(`${ROUTE_URL.PRICE_LIST_DETAIL.replace(":id", row.id)}?mode=edit`),
            });
          }

          if (canDelete) {
            if (actionItems.length > 0) {
              actionItems.push({ type: "divider" });
            }

            actionItems.push({
              key: "delete",
              label: "Xoá bảng giá",
              danger: true,
              disabled: deleting && deletingItem?.id === row.id,
              onClick: () => setDeletingItem(row),
            });
          }

          return (
            <Space>
              <Button type="link" onClick={() => navigate(ROUTE_URL.PRICE_LIST_DETAIL.replace(":id", row.id))}>
                Xem chi tiết
              </Button>
              {actionItems.length > 0 ? (
                <Dropdown menu={{ items: actionItems }} trigger={["click"]}>
                  <Button icon={<MoreOutlined />} />
                </Dropdown>
              ) : null}
            </Space>
          );
        },
      },
    ],
    [canDelete, canUpdate, deleting, deletingItem?.id, navigate],
  );

  const handleDelete = async () => {
    if (!deletingItem) {
      return;
    }

    try {
      setDeleting(true);
      await priceListService.remove(deletingItem.id);
      notify("Đã xoá bảng giá thành công.", "success");
      setDeletingItem(null);
      setQuery((previous) => ({ ...previous }));
      void loadSummaryAndCustomerGroups();
    } catch (error) {
      notify(getErrorMessage(error, "Không thể xoá bảng giá."), "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <NoResizeScreenTemplate
        bodyClassName="px-0 pb-0 pt-4"
        header={
          <PriceListPageHeader
            title="Quản lý bảng giá"
            subtitle="Theo dõi phạm vi áp dụng và hiệu lực của các bảng giá để đảm bảo quy trình báo giá luôn chính xác."
            actions={
              canCreate ? (
                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(ROUTE_URL.PRICE_LIST_CREATE)}>
                  Tạo bảng giá
                </Button>
              ) : undefined
            }
            breadcrumbItems={[
              { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.DASHBOARD)}>Trang chủ</span> },
              { title: "Bảng giá" },
            ]}
          />
        }
        body={
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <PriceListSummaryCards
              total={summaryData.total}
              activeNow={summaryData.activeNow}
              expiringSoon={summaryData.expiringSoon}
              inactiveOrExpired={summaryData.inactiveOrExpired}
              loading={summaryLoading}
            />

            <PriceListToolbar
              keyword={keyword}
              status={query.status}
              customerGroup={query.customerGroup}
              validFrom={query.validFrom}
              validTo={query.validTo}
              customerGroupOptions={customerGroupSelectOptions}
              loadingCustomerGroups={loadingCustomerGroups}
              customerGroupHint={customerGroupHint}
              onKeywordChange={setKeyword}
              onKeywordSearch={(value) =>
                setQuery((previous) => ({
                  ...previous,
                  page: 1,
                  search: value.trim() || undefined,
                }))
              }
              onStatusChange={(status) =>
                setQuery((previous) => ({
                  ...previous,
                  page: 1,
                  status,
                }))
              }
              onCustomerGroupChange={(customerGroup) =>
                setQuery((previous) => ({
                  ...previous,
                  page: 1,
                  customerGroup,
                }))
              }
              onValidRangeChange={(range) =>
                setQuery((previous) => ({
                  ...previous,
                  page: 1,
                  validFrom: range?.from,
                  validTo: range?.to,
                }))
              }
              onReset={() => {
                setKeyword("");
                setQuery({
                  page: 1,
                  size: PAGE_SIZE,
                });
              }}
            />

            <Card>
              <Space direction="vertical" size={14} style={{ width: "100%" }}>
                {listError ? (
                  <Alert
                    type="error"
                    showIcon
                    message="Không thể tải danh sách bảng giá"
                    description={listError}
                    action={
                      <Button size="small" icon={<ReloadOutlined />} onClick={() => void loadList()}>
                        Thử lại
                      </Button>
                    }
                  />
                ) : null}

                <Table<PriceListModel>
                  rowKey="id"
                  columns={columns}
                  dataSource={items}
                  loading={{ spinning: loading, tip: "Đang tải danh sách bảng giá..." }}
                  locale={{
                    emptyText: (
                      <Empty
                        description="Chưa có bảng giá phù hợp với bộ lọc hiện tại."
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                      />
                    ),
                  }}
                  pagination={{
                    current: query.page,
                    pageSize: query.size,
                    total,
                    showSizeChanger: true,
                    pageSizeOptions: [10, 20, 50],
                    showTotal: (value, range) => `${range[0]}-${range[1]} trên ${value} bảng giá`,
                  }}
                  onChange={(pagination) =>
                    setQuery((previous) => ({
                      ...previous,
                      page: pagination.current ?? previous.page,
                      size: pagination.pageSize ?? previous.size,
                    }))
                  }
                  scroll={{ x: 1100 }}
                />
              </Space>
            </Card>
          </Space>
        }
      />

      <PriceListDeleteModal
        open={Boolean(deletingItem)}
        submitting={deleting}
        priceListName={deletingItem?.name}
        onCancel={() => setDeletingItem(null)}
        onConfirm={() => void handleDelete()}
      />
    </>
  );
};

export default PriceListListPage;
