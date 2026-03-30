import { Modal } from "antd";
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
import type {
  PromotionListItem,
  PromotionListQuery,
  PromotionListResponseData,
  PromotionStatus,
  PromotionType,
} from "../../models/promotion/promotion.model";
import { promotionService } from "../../services/promotion/promotion.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage } from "../shared/page.utils";
import {
  canCreatePromotion,
  canDeletePromotion,
  canEditPromotion,
  formatPromotionDate,
  formatPromotionDiscountValue,
  getPromotionStatusBadgeClassName,
  getPromotionStatusLabel,
  getPromotionTypeLabel,
  PROMOTION_STATUS_OPTIONS,
  PROMOTION_TYPE_OPTIONS,
} from "./promotion.utils";

const PAGE_SIZE = 8;

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
  const [result, setResult] = useState<PromotionListResponseData>({
    items: [],
    pagination: {
      page: 1,
      pageSize: PAGE_SIZE,
      totalItems: 0,
      totalPages: 0,
    },
    filters: {},
  });
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deletingItem, setDeletingItem] = useState<PromotionListItem | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const response = await promotionService.getList(query);
        setResult(response);
      } catch (error) {
        notify(getErrorMessage(error, "Không thể load promotions"), "error");
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [notify, query]);

  const filters: FilterModalGroup[] = [
    {
      key: "status",
      label: "Status",
      options: PROMOTION_STATUS_OPTIONS,
      value: query.status ? [query.status] : [],
    },
    {
      key: "promotionType",
      label: "Promotion Type",
      options: PROMOTION_TYPE_OPTIONS,
      value: query.promotionType ? [query.promotionType] : [],
    },
    {
      kind: "dateRange",
      key: "startRange",
      label: "Start Date",
      value: {
        from: query.startFrom,
        to: query.startTo,
      },
      fromPlaceholder: "Start from",
      toPlaceholder: "Start to",
    },
    {
      kind: "dateRange",
      key: "endRange",
      label: "End Date",
      value: {
        from: query.endFrom,
        to: query.endTo,
      },
      fromPlaceholder: "End from",
      toPlaceholder: "End to",
    },
  ];

  const columns = useMemo<DataTableColumn<PromotionListItem>[]>(
    () => [
      {
        key: "name",
        header: "Name",
        className: "font-semibold text-blue-900",
      },
      {
        key: "promotionType",
        header: "Type",
        render: (row) => getPromotionTypeLabel(row.promotionType),
      },
      {
        key: "discountValue",
        header: "Discount Value",
        render: (row) => formatPromotionDiscountValue(row),
      },
      {
        key: "startDate",
        header: "Start Date",
        render: (row) => formatPromotionDate(row.startDate),
      },
      {
        key: "endDate",
        header: "End Date",
        render: (row) => formatPromotionDate(row.endDate),
      },
      {
        key: "status",
        header: "Status",
        render: (row) => (
          <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${getPromotionStatusBadgeClassName(row.status)}`}>
            {getPromotionStatusLabel(row.status)}
          </span>
        ),
      },
      {
        key: "productCount",
        header: "Product Scope",
        render: (row) => `${row.productCount ?? 0} products`,
      },
    ],
    [],
  );

  const handleDelete = async () => {
    if (!deletingItem) {
      return;
    }

    try {
      setDeleting(true);
      await promotionService.delete(deletingItem.id);
      notify("Promotion deleted successfully.", "success");
      setDeletingItem(null);
      setQuery((previous) => ({
        ...previous,
      }));
    } catch (error) {
      notify(getErrorMessage(error, "Không thể delete promotion"), "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      loading={loading}
      loadingText="Đang tải danh sách khuyến mãi..."
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Promotion Management"
          actions={
            allowCreate ? <CustomButton label="Create Promotion" onClick={() => navigate(ROUTE_URL.PROMOTION_CREATE)} /> : undefined
          }
          breadcrumb={<CustomBreadcrumb breadcrumbs={[{ label: "Trang chá»§" }, { label: "Promotions" }]} />}
        />
      }
      body={
        <BaseCard>
          <FilterSearchModalBar
            searchValue={query.keyword ?? ""}
            onSearchChange={(value) =>
              setQuery((previous) => ({
                ...previous,
                keyword: value || undefined,
                page: 1,
              }))
            }
            onSearchReset={() =>
              setQuery((previous) => ({
                ...previous,
                keyword: undefined,
                page: 1,
              }))
            }
            searchPlaceholder="Search promotion"
            modalTitle="Promotion filters"
            filters={filters}
            onApplyFilters={(values) => {
              const status = Array.isArray(values.status) ? (values.status[0] as PromotionStatus | undefined) : undefined;
              const promotionType = Array.isArray(values.promotionType)
                ? (values.promotionType[0] as PromotionType | undefined)
                : undefined;
              const startRange = values.startRange;
              const endRange = values.endRange;

              setQuery((previous) => ({
                ...previous,
                status,
                promotionType,
                startFrom: startRange && !Array.isArray(startRange) && "from" in startRange ? startRange.from : undefined,
                startTo: startRange && !Array.isArray(startRange) && "to" in startRange ? startRange.to : undefined,
                endFrom: endRange && !Array.isArray(endRange) && "from" in endRange ? endRange.from : undefined,
                endTo: endRange && !Array.isArray(endRange) && "to" in endRange ? endRange.to : undefined,
                page: 1,
              }));
            }}
          />

          <DataTable
            columns={columns}
            data={result.items}
            emptyText="No promotions found."
            actions={(row) => (
              <div className="flex flex-wrap gap-2">
                <CustomButton label="View" className="px-2 py-1 text-sm" onClick={() => navigate(ROUTE_URL.PROMOTION_DETAIL.replace(":id", row.id))} />
                {allowEdit ? (
                  <CustomButton
                    label="Edit"
                    className="px-2 py-1 text-sm"
                    onClick={() => navigate(`${ROUTE_URL.PROMOTION_DETAIL.replace(":id", row.id)}?mode=edit`)}
                  />
                ) : null}
                {allowDelete ? (
                  <CustomButton
                    label="Delete"
                    className="bg-red-500 px-2 py-1 text-sm hover:bg-red-600"
                    onClick={() => setDeletingItem(row)}
                  />
                ) : null}
              </div>
            )}
          />

          <Pagination
            page={result.pagination.page}
            pageSize={result.pagination.pageSize}
            total={result.pagination.totalItems}
            onChange={(page) =>
              setQuery((previous) => ({
                ...previous,
                page,
              }))
            }
          />

          <Modal
            title="Delete Promotion"
            open={Boolean(deletingItem)}
            onCancel={() => (deleting ? undefined : setDeletingItem(null))}
            closable={!deleting}
            maskClosable={!deleting}
            footer={
              <div className="flex justify-end gap-2">
                <CustomButton
                  label="Cancel"
                  className="border border-slate-300 bg-white text-slate-700 hover:bg-slate-100"
                  onClick={() => setDeletingItem(null)}
                  disabled={deleting}
                />
                <CustomButton
                  label={deleting ? "Deleting..." : "Delete"}
                  className="bg-red-500 hover:bg-red-600"
                  onClick={handleDelete}
                  disabled={deleting}
                />
              </div>
            }
          >
            <p className="text-sm text-slate-600">Are you sure you want to delete this promotion?</p>
            {deletingItem ? <p className="mt-2 text-sm font-semibold text-slate-800">{deletingItem.name}</p> : null}
          </Modal>
        </BaseCard>
      }
    />
  );
};

export default PromotionListPage;


