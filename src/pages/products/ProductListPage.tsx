import { PlusOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { Alert, Breadcrumb, Button, Card, Col, Modal, Pagination, Row, Space, Typography } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { canPerformAction } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { ProductModel } from "../../models/product/product.model";
import { productService } from "../../services/product/product.service";
import { getStoredUserRole } from "../../utils/authSession";
import InlinePageStatus from "../shared/components/InlinePageStatus";
import PageSectionCard from "../shared/components/PageSectionCard";
import PageSummaryStats from "../shared/components/PageSummaryStats";
import { getErrorMessage } from "../shared/page.utils";
import ProductCatalogCard from "./components/ProductCatalogCard";
import ProductCatalogToolbar from "./components/ProductCatalogToolbar";

const PAGE_SIZE = 8;
const SNAPSHOT_PAGE_SIZE = 200;
const SNAPSHOT_MAX_PAGES = 50;

interface ProductListQueryState {
  page: number;
  pageSize: number;
  keyword: string;
  type?: string;
  status?: ProductModel["status"];
  unit?: string;
  thickness?: string;
}

interface ProductSummaryState {
  totalProducts: number;
  activeProducts: number;
  inactiveProducts: number;
}

interface ProductFilterSeedState {
  types: string[];
  units: string[];
  thicknesses: string[];
}

const toUniqueValues = (values: Array<string | undefined>) =>
  [...new Set(values.map((value) => value?.trim()).filter(Boolean) as string[])].sort((a, b) =>
    a.localeCompare(b, "vi", { sensitivity: "base" }),
  );

const toSelectOptions = (values: string[]) => values.map((value) => ({ label: value, value }));

const ProductListPage = () => {
  const navigate = useNavigate();
  const role = getStoredUserRole() ?? "GUEST";
  const allowCreate = canPerformAction(role, "product.create");
  const allowUpdate = canPerformAction(role, "product.update");
  const allowDelete = canPerformAction(role, "product.delete");
  const showCreateQuotation = canPerformAction(role, "quotation.create");
  const { notify } = useNotify();

  const [query, setQuery] = useState<ProductListQueryState>({
    page: 1,
    pageSize: PAGE_SIZE,
    keyword: "",
  });
  const [items, setItems] = useState<ProductModel[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [summary, setSummary] = useState<ProductSummaryState>({
    totalProducts: 0,
    activeProducts: 0,
    inactiveProducts: 0,
  });
  const [filterSeed, setFilterSeed] = useState<ProductFilterSeedState>({
    types: [],
    units: [],
    thicknesses: [],
  });
  const [loading, setLoading] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [listError, setListError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deletingItem, setDeletingItem] = useState<ProductModel | null>(null);

  const loadCatalogSnapshot = useCallback(async (): Promise<ProductModel[]> => {
    const collected: ProductModel[] = [];
    const idSet = new Set<string>();
    let page = 1;
    let expectedTotalPages: number | undefined;

    while (page <= SNAPSHOT_MAX_PAGES) {
      const response = await productService.getList({
        page,
        pageSize: SNAPSHOT_PAGE_SIZE,
      });

      if (expectedTotalPages == null && response.pagination.totalPages > 0) {
        expectedTotalPages = response.pagination.totalPages;
      }

      if (response.items.length === 0) {
        break;
      }

      response.items.forEach((item) => {
        if (!idSet.has(item.id)) {
          idSet.add(item.id);
          collected.push(item);
        }
      });

      if (expectedTotalPages != null) {
        if (page >= expectedTotalPages) {
          break;
        }
      } else if (response.items.length < SNAPSHOT_PAGE_SIZE) {
        break;
      }

      page += 1;
    }

    return collected;
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      setListError(null);
      const response = await productService.getList({
        page: query.page,
        pageSize: query.pageSize,
        keyword: query.keyword.trim() || undefined,
        type: query.type,
        status: query.status,
        unit: query.unit,
        thickness: query.thickness,
      });

      setItems(response.items);
      setTotalItems(response.pagination.totalItems);
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải danh mục sản phẩm.");
      setListError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [notify, query.keyword, query.page, query.pageSize, query.status, query.thickness, query.type, query.unit]);

  const loadSummaryAndFilterSeed = useCallback(async () => {
    try {
      setSummaryLoading(true);
      const allProducts = await loadCatalogSnapshot();
      const activeCount = allProducts.filter((item) => item.status === "ACTIVE").length;
      const inactiveCount = allProducts.filter((item) => item.status === "INACTIVE").length;

      setSummary({
        totalProducts: allProducts.length,
        activeProducts: activeCount,
        inactiveProducts: inactiveCount,
      });

      setFilterSeed({
        types: toUniqueValues(allProducts.map((item) => item.type)),
        units: toUniqueValues(allProducts.map((item) => item.unit)),
        thicknesses: toUniqueValues(allProducts.map((item) => item.thickness)),
      });
    } catch (error) {
      notify(getErrorMessage(error, "Không thể tải thống kê và dữ liệu bộ lọc sản phẩm."), "warning");
      setSummary({
        totalProducts: 0,
        activeProducts: 0,
        inactiveProducts: 0,
      });
      setFilterSeed({
        types: [],
        units: [],
        thicknesses: [],
      });
    } finally {
      setSummaryLoading(false);
    }
  }, [loadCatalogSnapshot, notify]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  useEffect(() => {
    void loadSummaryAndFilterSeed();
  }, [loadSummaryAndFilterSeed]);

  const typeOptions = useMemo(
    () => toSelectOptions(toUniqueValues([...filterSeed.types, ...items.map((item) => item.type), query.type])),
    [filterSeed.types, items, query.type],
  );

  const unitOptions = useMemo(
    () => toSelectOptions(toUniqueValues([...filterSeed.units, ...items.map((item) => item.unit), query.unit])),
    [filterSeed.units, items, query.unit],
  );

  const thicknessOptions = useMemo(
    () => toSelectOptions(toUniqueValues([...filterSeed.thicknesses, ...items.map((item) => item.thickness), query.thickness])),
    [filterSeed.thicknesses, items, query.thickness],
  );

  const handleDelete = async () => {
    if (!deletingItem) {
      return;
    }

    try {
      setDeleting(true);
      await productService.remove(deletingItem.id);
      notify("Đã xóa sản phẩm thành công.", "success");
      setDeletingItem(null);
      const nextPage = items.length === 1 && query.page > 1 ? query.page - 1 : query.page;
      if (nextPage !== query.page) {
        setQuery((previous) => ({
          ...previous,
          page: nextPage,
        }));
      } else {
        await loadProducts();
      }
      await loadSummaryAndFilterSeed();
    } catch (error) {
      notify(getErrorMessage(error, "Không thể xóa sản phẩm."), "error");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      loading={false}
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Danh mục sản phẩm"
          subtitle="Theo dõi, tìm kiếm và thao tác sản phẩm theo cách trực quan như một catalog thương mại."
          actions={
            <Space wrap>
              {showCreateQuotation ? (
                <Button icon={<ShoppingCartOutlined />} onClick={() => navigate(ROUTE_URL.QUOTATION_CREATE)}>
                  Tạo yêu cầu báo giá
                </Button>
              ) : null}
              {allowCreate ? (
                <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate(ROUTE_URL.PRODUCT_CREATE)}>
                  Tạo sản phẩm
                </Button>
              ) : null}
            </Space>
          }
          breadcrumb={
            <Breadcrumb
              items={[
                { title: "Trang chủ" },
                { title: "Sản phẩm" },
              ]}
            />
          }
        />
      }
      body={
        <Space orientation="vertical" size={16} style={{ width: "100%" }}>
          <PageSummaryStats
            loading={summaryLoading}
            items={[
              { key: "total", title: "Tổng sản phẩm", value: summary.totalProducts, valueColor: "#1d4ed8" },
              { key: "active", title: "Đang kinh doanh", value: summary.activeProducts, valueColor: "#16a34a" },
              { key: "inactive", title: "Ngừng kinh doanh", value: summary.inactiveProducts, valueColor: "#f97316" },
            ]}
          />

          <PageSectionCard title="Bộ lọc danh mục" subtitle="Tìm nhanh theo thông tin sản phẩm và dùng bộ lọc để thu gọn kết quả hiển thị.">
            <ProductCatalogToolbar
              keyword={query.keyword}
              typeValue={query.type}
              statusValue={query.status}
              unitValue={query.unit}
              thicknessValue={query.thickness}
              typeOptions={typeOptions}
              unitOptions={unitOptions}
              thicknessOptions={thicknessOptions}
              onKeywordChange={(value) =>
                setQuery((previous) => ({
                  ...previous,
                  keyword: value,
                  page: 1,
                }))
              }
              onTypeChange={(value) =>
                setQuery((previous) => ({
                  ...previous,
                  type: value,
                  page: 1,
                }))
              }
              onStatusChange={(value) =>
                setQuery((previous) => ({
                  ...previous,
                  status: value,
                  page: 1,
                }))
              }
              onUnitChange={(value) =>
                setQuery((previous) => ({
                  ...previous,
                  unit: value,
                  page: 1,
                }))
              }
              onThicknessChange={(value) =>
                setQuery((previous) => ({
                  ...previous,
                  thickness: value,
                  page: 1,
                }))
              }
              onReset={() =>
                setQuery({
                  page: 1,
                  pageSize: PAGE_SIZE,
                  keyword: "",
                  type: undefined,
                  status: undefined,
                  unit: undefined,
                  thickness: undefined,
                })
              }
            />
          </PageSectionCard>

          <PageSectionCard
            title="Danh sách sản phẩm"
            subtitle={`Hiển thị ${items.length} / ${totalItems} sản phẩm`}
            extra={<Typography.Text type="secondary">Trang {query.page}</Typography.Text>}
          >
            {listError ? (
              <Alert
                type="error"
                showIcon
                message="Không thể tải danh sách sản phẩm"
                description={listError}
                action={
                  <Button size="small" onClick={() => void loadProducts()}>
                    Thử lại
                  </Button>
                }
              />
            ) : null}

            {loading ? (
              <Row gutter={[16, 16]}>
                {Array.from({ length: PAGE_SIZE }).map((_, index) => (
                  <Col key={index} xs={24} md={12} xl={8}>
                    <Card loading />
                  </Col>
                ))}
              </Row>
            ) : null}

            {!loading && !listError && items.length === 0 ? (
              <InlinePageStatus
                mode="empty"
                title="Chưa có sản phẩm phù hợp với bộ lọc hiện tại"
                description="Bạn có thể thay đổi từ khóa hoặc đặt lại bộ lọc để xem thêm kết quả."
                actionLabel={allowCreate ? "Tạo sản phẩm mới" : undefined}
                onAction={allowCreate ? () => navigate(ROUTE_URL.PRODUCT_CREATE) : undefined}
              />
            ) : null}

            {!loading && !listError && items.length > 0 ? (
              <Row gutter={[16, 16]}>
                {items.map((item) => (
                  <Col key={item.id} xs={24} md={12} xl={8}>
                    <ProductCatalogCard
                      product={item}
                      allowUpdate={allowUpdate}
                      allowDelete={allowDelete}
                      showCreateQuotation={showCreateQuotation}
                      deleting={deleting && deletingItem?.id === item.id}
                      onView={() => navigate(ROUTE_URL.PRODUCT_DETAIL.replace(":id", item.id))}
                      onEdit={() => navigate(ROUTE_URL.PRODUCT_EDIT.replace(":id", item.id))}
                      onDelete={() => setDeletingItem(item)}
                      onRequestQuotation={() => navigate(ROUTE_URL.QUOTATION_CREATE)}
                    />
                  </Col>
                ))}
              </Row>
            ) : null}

            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
              <Pagination
                current={query.page}
                pageSize={query.pageSize}
                total={totalItems}
                showSizeChanger={false}
                showTotal={(value) => `Tổng ${value} sản phẩm`}
                onChange={(nextPage) =>
                  setQuery((previous) => ({
                    ...previous,
                    page: nextPage,
                  }))
                }
              />
            </div>
          </PageSectionCard>

          <Modal
            title="Xác nhận xóa sản phẩm"
            open={Boolean(deletingItem)}
            onCancel={() => (deleting ? undefined : setDeletingItem(null))}
            closable={!deleting}
            mask={{ closable: !deleting }}
            okText={deleting ? "Đang xóa..." : "Xóa sản phẩm"}
            okButtonProps={{ danger: true, loading: deleting }}
            cancelButtonProps={{ disabled: deleting }}
            cancelText="Hủy"
            onOk={() => void handleDelete()}
          >
            <Space orientation="vertical" size={12}>
              <Alert type="warning" showIcon message="Hành động này sẽ xóa mềm sản phẩm khỏi danh mục hiển thị." />
              <Typography.Text>
                Bạn có chắc chắn muốn xóa sản phẩm <Typography.Text strong>{deletingItem?.productName}</Typography.Text>?
              </Typography.Text>
            </Space>
          </Modal>
        </Space>
      }
    />
  );
};

export default ProductListPage;
