import {
  ArrowLeftOutlined,
  CalendarOutlined,
  EditOutlined,
  InfoCircleOutlined,
  SaveOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Col, Empty, Row, Skeleton, Space, Statistic, Tag, Typography } from "antd";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { canPerformAction } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { PriceListModel } from "../../models/pricing/price-list.model";
import { productService } from "../../services/product/product.service";
import { priceListService } from "../../services/pricing/price-list.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage, toCurrency } from "../shared/page.utils";
import PriceListFormSection from "./PriceListFormSection";
import PriceListInfoCard from "./components/PriceListInfoCard";
import PriceListInlineStatus from "./components/PriceListInlineStatus";
import PriceListItemsTable, { type PriceListItemRowView } from "./components/PriceListItemsTable";
import PriceListPageHeader from "./components/PriceListPageHeader";
import {
  createInitialPriceListFormValues,
  toPriceListWritePayload,
  validatePriceListForm,
  type PriceListFormErrors,
} from "./priceListForm.utils";
import type { PriceListProductOption } from "./priceList.ui";
import { formatDateTimeVi, formatDateVi } from "./priceList.ui";

const createOptionFromDetail = (detail: PriceListModel | null): PriceListProductOption[] => {
  if (!detail) {
    return [];
  }

  return detail.items
    .map((item) => {
      const productName = item.productName?.trim();
      const productCode = item.productCode?.trim();
      const label = productCode && productName ? `${productCode} - ${productName}` : productName || productCode || item.productId;

      return {
        value: item.productId,
        label,
        productCode,
        productName: productName || label,
      };
    })
    .filter((item, index, source) => source.findIndex((target) => target.value === item.value) === index);
};

const PriceListDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const role = getStoredUserRole();
  const canUpdate = canPerformAction(role, "price-list.update");
  const { notify } = useNotify();
  const [searchParams, setSearchParams] = useSearchParams();
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [detail, setDetail] = useState<PriceListModel | null>(null);
  const [errors, setErrors] = useState<PriceListFormErrors>({});
  const [values, setValues] = useState(createInitialPriceListFormValues());
  const [productOptions, setProductOptions] = useState<PriceListProductOption[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productLoadError, setProductLoadError] = useState<string | null>(null);

  const editMode = canUpdate && searchParams.get("mode") === "edit";

  const loadProducts = useCallback(async (sourceDetail: PriceListModel | null) => {
    const detailOptions = createOptionFromDetail(sourceDetail);

    try {
      setLoadingProducts(true);
      setProductLoadError(null);

      const response = await productService.getList({
        page: 1,
        pageSize: 1000,
        status: "ACTIVE",
      });

      const optionMap = new Map<string, PriceListProductOption>(
        response.items.map((item) => [
          item.id,
          {
            value: item.id,
            label: `${item.productCode} - ${item.productName}`,
            productCode: item.productCode,
            productName: item.productName,
          },
        ]),
      );

      for (const option of detailOptions) {
        if (!optionMap.has(option.value)) {
          optionMap.set(option.value, option);
        }
      }

      setProductOptions(Array.from(optionMap.values()));
    } catch (error) {
      setProductOptions(detailOptions);
      setProductLoadError(getErrorMessage(error, "Không thể tải danh sách sản phẩm. Bạn vẫn có thể chỉnh sửa đơn giá hiện có."));
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  const loadDetail = useCallback(async () => {
    if (!id) {
      setDetailError("Không xác định được mã bảng giá.");
      setDetail(null);
      return;
    }

    try {
      setLoadingDetail(true);
      setDetailError(null);
      const response = await priceListService.getDetail(id);
      setDetail(response);
      setValues(createInitialPriceListFormValues(response));
      if (canUpdate) {
        void loadProducts(response);
      }
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải chi tiết bảng giá.");
      setDetailError(message);
      setDetail(null);
      notify(message, "error");
    } finally {
      setLoadingDetail(false);
    }
  }, [canUpdate, id, loadProducts, notify]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const detailItemRows = useMemo<PriceListItemRowView[]>(() => {
    if (!detail) {
      return [];
    }

    return detail.items.map((item, index) => ({
      key: item.id || `${item.productId}-${index}`,
      productId: item.productId,
      productCode: item.productCode,
      productName: item.productName,
      unitPriceVnd: item.unitPriceVnd,
    }));
  }, [detail]);

  const productPriceInsights = useMemo(() => {
    const prices = detailItemRows.map((item) => item.unitPriceVnd).filter((value): value is number => Number.isFinite(value) && Number(value) > 0);
    const pricedCount = prices.length;
    const totalValue = prices.reduce((sum, value) => sum + value, 0);
    const averageValue = pricedCount > 0 ? totalValue / pricedCount : 0;
    const minValue = pricedCount > 0 ? Math.min(...prices) : 0;
    const maxValue = pricedCount > 0 ? Math.max(...prices) : 0;

    return {
      pricedCount,
      totalValue,
      averageValue,
      minValue,
      maxValue,
    };
  }, [detailItemRows]);

  const validityRangeText = detail ? `${formatDateVi(detail.validFrom)} - ${formatDateVi(detail.validTo)}` : "Chưa thiết lập";

  const handleStartEdit = () => {
    if (!canUpdate || !detail) {
      return;
    }

    setValues(createInitialPriceListFormValues(detail));
    setErrors({});
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set("mode", "edit");
      return next;
    });
  };

  const handleCancelEdit = () => {
    setErrors({});
    if (detail) {
      setValues(createInitialPriceListFormValues(detail));
    }

    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.delete("mode");
      return next;
    });
  };

  const handleSave = async () => {
    if (!id) {
      notify("Không xác định được bảng giá cần cập nhật.", "error");
      return;
    }

    const validationErrors = validatePriceListForm(values);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      const message = validationErrors.name ?? validationErrors.validFrom ?? validationErrors.validTo ?? validationErrors.items;
      if (message) {
        notify(message, "error");
      }
      return;
    }

    try {
      setSaving(true);
      await priceListService.update(id, toPriceListWritePayload(values));
      const reloaded = await priceListService.getDetail(id);
      setDetail(reloaded);
      setValues(createInitialPriceListFormValues(reloaded));
      if (canUpdate) {
        void loadProducts(reloaded);
      }
      notify("Đã cập nhật bảng giá thành công.", "success");
      handleCancelEdit();
    } catch (error) {
      notify(getErrorMessage(error, "Không thể cập nhật bảng giá."), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <PriceListPageHeader
          title={
            <Space wrap align="center">
              <span>{detail?.name || "Chi tiết bảng giá"}</span>
              {detail ? <PriceListInlineStatus status={detail.status} validFrom={detail.validFrom} validTo={detail.validTo} /> : null}
            </Space>
          }
          subtitle={
            editMode
              ? "Bạn đang ở chế độ chỉnh sửa. Hãy rà soát kỹ đơn giá, phạm vi áp dụng và thời gian hiệu lực trước khi lưu."
              : "Theo dõi thông tin nghiệp vụ và danh sách sản phẩm thuộc bảng giá."
          }
          meta={
            detail && !loadingDetail ? (
              <Space wrap size={[8, 8]}>
                <Tag color="default">{`Mã bảng giá: ${detail.id}`}</Tag>
                <Tag color="blue" icon={<CalendarOutlined />}>
                  {`Hiệu lực: ${validityRangeText}`}
                </Tag>
                <Tag color="purple">{`Cập nhật: ${formatDateTimeVi(detail.updatedAt)}`}</Tag>
              </Space>
            ) : undefined
          }
          actions={
            <Space wrap>
              {canUpdate && !editMode ? (
                <Button type="primary" icon={<EditOutlined />} onClick={handleStartEdit} disabled={!detail || Boolean(detailError)}>
                  Chỉnh sửa
                </Button>
              ) : null}
              {canUpdate && editMode ? (
                <Button icon={<StopOutlined />} onClick={handleCancelEdit} disabled={saving}>
                  Hủy chỉnh sửa
                </Button>
              ) : null}
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTE_URL.PRICE_LIST_LIST)} disabled={saving}>
                Quay lại
              </Button>
            </Space>
          }
          breadcrumbItems={[
            { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.DASHBOARD)}>Trang chủ</span> },
            { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.PRICE_LIST_LIST)}>Bảng giá</span> },
            { title: editMode ? "Chỉnh sửa" : "Chi tiết" },
          ]}
        />
      }
      body={
        <Space orientation="vertical" size={16} style={{ width: "100%" }}>
          {loadingDetail ? (
            <Card>
              <Skeleton active paragraph={{ rows: 10 }} />
            </Card>
          ) : null}

          {!loadingDetail && detailError ? (
            <Card>
              <Space orientation="vertical" size={12} style={{ width: "100%" }}>
                <Alert type="error" showIcon message="Không thể tải chi tiết bảng giá" description={detailError} />
                <Space>
                  <Button onClick={() => void loadDetail()}>Thử tải lại</Button>
                  <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTE_URL.PRICE_LIST_LIST)}>
                    Quay về danh sách
                  </Button>
                </Space>
              </Space>
            </Card>
          ) : null}

          {!loadingDetail && !detailError && !detail ? (
            <Card>
              <Empty description="Không có dữ liệu bảng giá để hiển thị." image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </Card>
          ) : null}

          {!loadingDetail && !detailError && detail ? (
            <>
              {!editMode ? (
                <Space orientation="vertical" size={16} style={{ width: "100%" }}>
                  <Row gutter={[16, 16]}>
                    <Col xs={24} xl={16}>
                      <PriceListInfoCard detail={detail} />
                    </Col>
                    <Col xs={24} xl={8}>
                      <Space orientation="vertical" size={16} style={{ width: "100%" }}>
                        <Card
                          title="Phân tích đơn giá"
                          extra={<Tag color="blue">{`${productPriceInsights.pricedCount}/${detailItemRows.length} sản phẩm đã có đơn giá`}</Tag>}
                        >
                          <Row gutter={[12, 12]}>
                            <Col xs={24} sm={12}>
                              <Statistic title="Đơn giá thấp nhất" value={productPriceInsights.minValue} formatter={(value) => toCurrency(Number(value) || 0)} />
                            </Col>
                            <Col xs={24} sm={12}>
                              <Statistic title="Đơn giá cao nhất" value={productPriceInsights.maxValue} formatter={(value) => toCurrency(Number(value) || 0)} />
                            </Col>
                            <Col xs={24} sm={12}>
                              <Statistic title="Đơn giá trung bình" value={productPriceInsights.averageValue} formatter={(value) => toCurrency(Number(value) || 0)} />
                            </Col>
                            <Col xs={24} sm={12}>
                              <Statistic title="Tổng đơn giá tham chiếu" value={productPriceInsights.totalValue} formatter={(value) => toCurrency(Number(value) || 0)} />
                            </Col>
                          </Row>
                        </Card>

                        <Alert
                          type="info"
                          showIcon
                          icon={<InfoCircleOutlined />}
                          message="Gợi ý kiểm tra nhanh"
                          description="Nếu bảng giá sắp hết hạn hoặc chênh lệch đơn giá lớn, nên vào chế độ chỉnh sửa để rà soát trước khi áp dụng báo giá mới."
                        />
                      </Space>
                    </Col>
                  </Row>

                  <Card
                    title="Danh sách sản phẩm và đơn giá"
                    extra={<Tag color="green">{`${detailItemRows.length} sản phẩm`}</Tag>}
                  >
                    <PriceListItemsTable items={detailItemRows} emptyDescription="Bảng giá chưa có sản phẩm nào." />
                  </Card>
                </Space>
              ) : (
                <Space orientation="vertical" size={16} style={{ width: "100%" }}>
                  <Alert
                    type="info"
                    showIcon
                    message="Chế độ chỉnh sửa bảng giá"
                    description="Bạn có thể cập nhật thông tin chung, hiệu lực, trạng thái và đơn giá sản phẩm ngay trên biểu mẫu bên dưới."
                  />

                  <PriceListFormSection
                    title="Chỉnh sửa bảng giá"
                    subtitle="Cập nhật dữ liệu cần thiết rồi lưu thay đổi để đồng bộ cho toàn bộ luồng báo giá."
                    values={values}
                    errors={errors}
                    productOptions={productOptions}
                    loadingProducts={loadingProducts}
                    productLoadError={productLoadError}
                    onRetryLoadProducts={() => void loadProducts(detail)}
                    onChange={(updater) => setValues((previous) => updater(previous))}
                    onRemoveItem={(rowId) =>
                      setValues((previous) => ({
                        ...previous,
                        items: previous.items.filter((item) => item.rowId !== rowId),
                      }))
                    }
                  />

                  <Card>
                    <Space orientation="vertical" size={10} style={{ width: "100%" }}>
                      <Typography.Text type="secondary">
                        Lưu ý: thay đổi sẽ áp dụng cho các nghiệp vụ sử dụng bảng giá này ngay sau khi lưu thành công.
                      </Typography.Text>
                      <Space wrap>
                        <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => void handleSave()} disabled={saving}>
                          Lưu thay đổi
                        </Button>
                        <Button onClick={handleCancelEdit} disabled={saving}>
                          Hủy
                        </Button>
                      </Space>
                    </Space>
                  </Card>
                </Space>
              )}
            </>
          ) : null}
        </Space>
      }
    />
  );
};

export default PriceListDetailPage;
