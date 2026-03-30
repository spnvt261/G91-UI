import { MoreOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, Card, Empty, Modal, Space, Table, Tooltip, Typography, Alert, Badge, Dropdown, Tag } from "antd";
import type { MenuProps } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type {
  PromotionListItem,
  PromotionListQuery,
  PromotionListResponseData,
} from "../../models/promotion/promotion.model";
import { promotionService } from "../../services/promotion/promotion.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage } from "../shared/page.utils";
import PromotionFilterBar from "./components/PromotionFilterBar";
import PromotionPageHeader from "./components/PromotionPageHeader";
import PromotionStatusTag from "./components/PromotionStatusTag";
import PromotionSummaryCards from "./components/PromotionSummaryCards";
import {
  canCreatePromotion,
  canDeletePromotion,
  canEditPromotion,
  formatPromotionDate,
  formatPromotionDiscountValue,
  getPromotionTypeLabel,
  isPromotionExpiringSoon,
} from "./promotion.utils";

const PAGE_SIZE = 8;

interface PromotionSummaryState {
  totalPromotions: number;
  activePromotions: number;
  expiringSoonPromotions: number;
  draftOrInactivePromotions: number;
}

const INITIAL_RESULT: PromotionListResponseData = {
  items: [],
  pagination: {
    page: 1,
    pageSize: PAGE_SIZE,
    totalItems: 0,
    totalPages: 0,
  },
  filters: {},
};

const getRemainingDaysLabel = (endDate: string): string => {
  const parsed = new Date(endDate);
  if (Number.isNaN(parsed.getTime())) {
    return "Không xác định";
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endDay = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  const diffDays = Math.ceil((endDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return "Đã hết hạn";
  }

  if (diffDays === 0) {
    return "Kết thúc hôm nay";
  }

  return `Còn ${diffDays} ngày`;
};

const PromotionListPage = () => {
  const navigate = useNavigate();
  const { notify } = useNotify();
  const role = getStoredUserRole();
  const allowCreate = canCreatePromotion(role);
  const allowEdit = canEditPromotion(role);
  const allowDelete = canDeletePromotion(role);

  const [query, setQuery] = useState<PromotionListQuery>({
    page: 1,
    pageSize: PAGE_SIZE,
    sortBy: "updatedAt",
    sortDir: "desc",
  });
  const [searchValue, setSearchValue] = useState("");
  const [result, setResult] = useState<PromotionListResponseData>(INITIAL_RESULT);
  const [loading, setLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [summary, setSummary] = useState<PromotionSummaryState>({
    totalPromotions: 0,
    activePromotions: 0,
    expiringSoonPromotions: 0,
    draftOrInactivePromotions: 0,
  });
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingItem, setDeletingItem] = useState<PromotionListItem | null>(null);

  const loadList = useCallback(async () => {
    try {
      setLoading(true);
      setListError(null);
      const response = await promotionService.getList(query);
      setResult(response);
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải danh sách khuyến mãi.");
      setListError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [notify, query]);

  const loadSummary = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const [totalResponse, activeResponse, draftResponse, inactiveResponse] = await Promise.all([
        promotionService.getList({ page: 1, pageSize: 1 }),
        promotionService.getList({ page: 1, pageSize: 5000, status: "ACTIVE" }),
        promotionService.getList({ page: 1, pageSize: 1, status: "DRAFT" }),
        promotionService.getList({ page: 1, pageSize: 1, status: "INACTIVE" }),
      ]);

      const expiringSoonPromotions = activeResponse.items.filter((item) => isPromotionExpiringSoon(item.endDate)).length;

      setSummary({
        totalPromotions: totalResponse.pagination.totalItems,
        activePromotions: activeResponse.pagination.totalItems,
        expiringSoonPromotions,
        draftOrInactivePromotions: inactiveResponse.pagination.totalItems + draftResponse.pagination.totalItems,
      });
    } catch (error) {
      notify(getErrorMessage(error, "Không thể tải thống kê khuyến mãi."), "warning");
    } finally {
      setSummaryLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    void loadList();
  }, [loadList]);

  useEffect(() => {
    void loadSummary();
  }, [loadSummary]);

  const handleDelete = async () => {
    if (!deletingItem) {
      return;
    }

    try {
      setDeleting(true);
      await promotionService.delete(deletingItem.id);
      notify("Đã xóa chương trình khuyến mãi thành công.", "success");
      setDeletingItem(null);
      setQuery((previous) => ({ ...previous }));
      void loadSummary();
    } catch (error) {
      notify(getErrorMessage(error, "Không thể xóa chương trình khuyến mãi."), "error");
    } finally {
      setDeleting(false);
    }
  };

  const columns = useMemo<ColumnsType<PromotionListItem>>(
    () => [
      {
        title: "Chương trình",
        key: "name",
        width: 280,
        render: (_, row) => (
          <Space orientation="vertical" size={2}>
            <Typography.Text strong>{row.name}</Typography.Text>
            <Typography.Text type="secondary">{row.code ? `Mã: ${row.code}` : "Chưa có mã khuyến mãi"}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Loại khuyến mãi",
        dataIndex: "promotionType",
        key: "promotionType",
        width: 180,
        render: (_, row) => getPromotionTypeLabel(row.promotionType),
      },
      {
        title: "Giá trị giảm",
        dataIndex: "discountValue",
        key: "discountValue",
        width: 160,
        render: (_, row) => (
          <Typography.Text strong style={{ color: "#0f5ca8" }}>
            {formatPromotionDiscountValue(row)}
          </Typography.Text>
        ),
      },
      {
        title: "Thời gian áp dụng",
        key: "validity",
        width: 220,
        render: (_, row) => (
          <Space orientation="vertical" size={2}>
            <Typography.Text>
              {formatPromotionDate(row.startDate)} - {formatPromotionDate(row.endDate)}
            </Typography.Text>
            <Typography.Text type="secondary">{getRemainingDaysLabel(row.endDate)}</Typography.Text>
          </Space>
        ),
      },
      {
        title: "Trạng thái",
        dataIndex: "status",
        key: "status",
        width: 160,
        render: (_, row) => (
          <Space orientation="vertical" size={4}>
            <PromotionStatusTag status={row.status} withDot />
            {row.status === "ACTIVE" && isPromotionExpiringSoon(row.endDate) ? (
              <Tag color="volcano" style={{ marginInlineEnd: 0 }}>
                Sắp hết hạn
              </Tag>
            ) : null}
          </Space>
        ),
      },
      {
        title: "Phạm vi sản phẩm",
        key: "scope",
        width: 220,
        render: (_, row) => {
          const productCount = row.productCount ?? 0;

          if (row.scopeSummary) {
            return (
              <Tooltip title={row.scopeSummary}>
                <Typography.Text ellipsis style={{ maxWidth: 180 }}>
                  {row.scopeSummary}
                </Typography.Text>
              </Tooltip>
            );
          }

          return (
            <Space size={8}>
              <Badge count={productCount} showZero color="#0f5ca8" />
              <Typography.Text type="secondary">{productCount > 0 ? "sản phẩm áp dụng" : "Chưa cấu hình sản phẩm"}</Typography.Text>
            </Space>
          );
        },
      },
      {
        title: "Thao tác",
        key: "actions",
        fixed: "right",
        width: 170,
        render: (_, row) => {
          const actionItems: MenuProps["items"] = [];

          if (allowEdit) {
            actionItems.push({
              key: "edit",
              label: "Chỉnh sửa",
              onClick: () => navigate(`${ROUTE_URL.PROMOTION_DETAIL.replace(":id", row.id)}?mode=edit`),
            });
          }

          if (allowDelete) {
            if (actionItems.length > 0) {
              actionItems.push({ type: "divider" });
            }

            actionItems.push({
              key: "delete",
              label: "Xóa chương trình",
              danger: true,
              onClick: () => setDeletingItem(row),
            });
          }

          return (
            <Space>
              <Button type="link" onClick={() => navigate(ROUTE_URL.PROMOTION_DETAIL.replace(":id", row.id))}>
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
    [allowDelete, allowEdit, navigate],
  );

  const emptyNode = (
    <Empty
      image={Empty.PRESENTED_IMAGE_SIMPLE}
      description="Chưa có chương trình phù hợp với bộ lọc hiện tại."
    >
      {allowCreate ? (
        <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(ROUTE_URL.PROMOTION_CREATE)}>
          Tạo khuyến mãi mới
        </Button>
      ) : null}
    </Empty>
  );

  return (
    <NoResizeScreenTemplate
      loading={false}
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <PromotionPageHeader
          title="Quản lý chương trình khuyến mãi"
          subtitle="Theo dõi toàn bộ chiến dịch ưu đãi, nhanh chóng lọc chương trình cần xử lý và thao tác ngay tại một màn hình."
          breadcrumbItems={[
            {
              title: (
                <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.DASHBOARD)}>
                  Trang chủ
                </span>
              ),
            },
            { title: "Khuyến mãi" },
          ]}
          actions={
            allowCreate ? (
              <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(ROUTE_URL.PROMOTION_CREATE)}>
                Tạo khuyến mãi
              </Button>
            ) : undefined
          }
        />
      }
      body={
        <>
          <Space orientation="vertical" size={16} style={{ width: "100%" }}>
            <PromotionSummaryCards
              totalPromotions={summary.totalPromotions}
              activePromotions={summary.activePromotions}
              expiringSoonPromotions={summary.expiringSoonPromotions}
              draftOrInactivePromotions={summary.draftOrInactivePromotions}
              loading={summaryLoading}
            />

            <PromotionFilterBar
              searchValue={searchValue}
              status={query.status}
              promotionType={query.promotionType}
              startFrom={query.startFrom}
              endTo={query.endTo}
              onSearchValueChange={(value) => {
                setSearchValue(value);
                if (!value.trim()) {
                  setQuery((previous) => ({
                    ...previous,
                    keyword: undefined,
                    page: 1,
                  }));
                }
              }}
              onApplySearch={(value) =>
                setQuery((previous) => ({
                  ...previous,
                  keyword: value.trim() || undefined,
                  page: 1,
                }))
              }
              onStatusChange={(status) =>
                setQuery((previous) => ({
                  ...previous,
                  status,
                  page: 1,
                }))
              }
              onPromotionTypeChange={(promotionType) =>
                setQuery((previous) => ({
                  ...previous,
                  promotionType,
                  page: 1,
                }))
              }
              onValidityRangeChange={(from, to) =>
                setQuery((previous) => ({
                  ...previous,
                  startFrom: from,
                  startTo: undefined,
                  endFrom: undefined,
                  endTo: to,
                  page: 1,
                }))
              }
              onReset={() => {
                setSearchValue("");
                setQuery((previous) => ({
                  ...previous,
                  page: 1,
                  keyword: undefined,
                  status: undefined,
                  promotionType: undefined,
                  startFrom: undefined,
                  startTo: undefined,
                  endFrom: undefined,
                  endTo: undefined,
                }));
              }}
            />

            <Card variant="borderless" className="shadow-sm">
              <Space orientation="vertical" size={16} style={{ width: "100%" }}>
                {listError ? (
                  <Alert
                    type="error"
                    showIcon
                    message="Không thể tải danh sách khuyến mãi"
                    description={listError}
                  />
                ) : null}

                <Table<PromotionListItem>
                  rowKey="id"
                  size="middle"
                  columns={columns}
                  dataSource={result.items}
                  loading={{ spinning: loading, description: "Đang tải danh sách khuyến mãi..." }}
                  scroll={{ x: 1200 }}
                  locale={{ emptyText: emptyNode }}
                  pagination={{
                    placement: ["bottomEnd"],
                    current: result.pagination.page,
                    pageSize: result.pagination.pageSize,
                    total: result.pagination.totalItems,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} trên ${total} chương trình`,
                  }}
                  onChange={(pagination) =>
                    setQuery((previous) => ({
                      ...previous,
                      page: pagination.current ?? previous.page ?? 1,
                      pageSize: pagination.pageSize ?? previous.pageSize ?? PAGE_SIZE,
                    }))
                  }
                />
              </Space>
            </Card>
          </Space>

          <Modal
            title="Xóa chương trình khuyến mãi?"
            open={Boolean(deletingItem)}
            okText="Xóa chương trình"
            cancelText="Giữ lại"
            okButtonProps={{ danger: true, loading: deleting }}
            cancelButtonProps={{ disabled: deleting }}
            closable={!deleting}
            mask={{ closable: !deleting }}
            onOk={() => void handleDelete()}
            onCancel={() => {
              if (!deleting) {
                setDeletingItem(null);
              }
            }}
          >
            <Space orientation="vertical" size={8}>
              <Typography.Text>
                Sau khi xóa, chương trình sẽ không còn xuất hiện trong danh sách và không thể phục hồi.
              </Typography.Text>
              <Typography.Text strong>{deletingItem?.name}</Typography.Text>
            </Space>
          </Modal>
        </>
      }
    />
  );
};

export default PromotionListPage;
