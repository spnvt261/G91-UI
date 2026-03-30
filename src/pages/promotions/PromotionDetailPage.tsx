import { ArrowLeftOutlined, EditOutlined, SaveOutlined } from "@ant-design/icons";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Empty,
  Form,
  Result,
  Row,
  Space,
  Spin,
  Statistic,
  Typography,
} from "antd";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type { PromotionDetail } from "../../models/promotion/promotion.model";
import { productService } from "../../services/product/product.service";
import { promotionService } from "../../services/promotion/promotion.service";
import { getStoredUserRole } from "../../utils/authSession";
import { getErrorMessage, toCurrency } from "../shared/page.utils";
import PromotionFormSections, { type PromotionProductOption } from "./components/PromotionFormSections";
import PromotionFormSummaryCard from "./components/PromotionFormSummaryCard";
import PromotionInfoCard from "./components/PromotionInfoCard";
import PromotionPageHeader from "./components/PromotionPageHeader";
import PromotionProductsTable from "./components/PromotionProductsTable";
import PromotionStatusTag from "./components/PromotionStatusTag";
import {
  canEditPromotion,
  formatPromotionDate,
  formatPromotionDiscountValue,
  getPromotionTypeLabel,
} from "./promotion.utils";
import {
  createInitialPromotionFormValues,
  toPromotionWritePayload,
  validatePromotionForm,
  type PromotionFormErrors,
  type PromotionFormValues,
} from "./promotionForm.utils";

const toOptionMap = (options: PromotionProductOption[]): Map<string, PromotionProductOption> =>
  new Map(options.map((item) => [item.value, item]));

const getDurationLabel = (startDate?: string, endDate?: string): string => {
  if (!startDate || !endDate) {
    return "Chưa xác định";
  }

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return "Chưa xác định";
  }

  const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  if (!Number.isFinite(duration) || duration <= 0) {
    return "Chưa xác định";
  }

  return `${duration} ngày`;
};

const PromotionDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const { notify } = useNotify();
  const role = getStoredUserRole();
  const canModify = canEditPromotion(role);
  const redirectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [promotion, setPromotion] = useState<PromotionDetail | null>(null);
  const [formValues, setFormValues] = useState<PromotionFormValues>(createInitialPromotionFormValues());
  const [errors, setErrors] = useState<PromotionFormErrors>({});
  const [productOptions, setProductOptions] = useState<PromotionProductOption[]>([]);
  const [productLoadError, setProductLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    const mode = searchParams.get("mode");
    setEditMode(canModify && mode === "edit");
  }, [canModify, searchParams]);

  useEffect(() => {
    return () => {
      if (redirectTimerRef.current) {
        clearTimeout(redirectTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const loadDetail = async () => {
      if (!id) {
        setDetailError("Không tìm thấy mã chương trình khuyến mãi.");
        return;
      }

      try {
        setLoading(true);
        setDetailError(null);
        const response = await promotionService.getDetail(id);
        setPromotion(response.promotion);
        setFormValues(createInitialPromotionFormValues(response.promotion));
      } catch (error) {
        const message = getErrorMessage(error, "Không thể tải chi tiết khuyến mãi.");
        setDetailError(message);
        notify(message, "error");
        redirectTimerRef.current = setTimeout(() => {
          navigate(ROUTE_URL.PROMOTION_LIST, { replace: true });
        }, 3000);
      } finally {
        setLoading(false);
      }
    };

    void loadDetail();
  }, [id, navigate, notify]);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoadingProducts(true);
        setProductLoadError(null);
        const response = await productService.getList({
          page: 1,
          pageSize: 1000,
        });
        setProductOptions(
          response.items.map((item) => ({
            label: `${item.productCode} - ${item.productName}`,
            value: item.id,
          })),
        );
      } catch (error) {
        const message = getErrorMessage(error, "Không thể tải danh sách sản phẩm áp dụng.");
        setProductOptions([]);
        setProductLoadError(message);
      } finally {
        setLoadingProducts(false);
      }
    };

    void loadProducts();
  }, []);

  const mergedProductOptions = useMemo<PromotionProductOption[]>(() => {
    const optionMap = toOptionMap(productOptions);
    const fallbackProductIds = promotion?.productIds ?? [];

    fallbackProductIds.forEach((productId, index) => {
      if (!optionMap.has(productId)) {
        optionMap.set(productId, { label: `Sản phẩm đã ngừng hiển thị #${index + 1}`, value: productId });
      }
    });

    return Array.from(optionMap.values());
  }, [productOptions, promotion?.productIds]);

  const handleStartEdit = () => {
    if (!canModify) {
      return;
    }

    setSaveError(null);
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.set("mode", "edit");
      return next;
    });
  };

  const handleCancelEdit = useCallback(() => {
    setErrors({});
    setSaveError(null);
    if (promotion) {
      setFormValues(createInitialPromotionFormValues(promotion));
    }

    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      next.delete("mode");
      return next;
    });
  }, [promotion, setSearchParams]);

  const handleValuesChange = useCallback((patch: Partial<PromotionFormValues>) => {
    setFormValues((previous) => ({ ...previous, ...patch }));
    setSaveError(null);

    setErrors((previous) => {
      const next = { ...previous };
      (Object.keys(patch) as Array<keyof PromotionFormValues>).forEach((key) => {
        delete next[key];
      });
      return next;
    });
  }, []);

  const handleSave = async () => {
    if (!id) {
      return;
    }

    const validationErrors = validatePromotionForm(formValues);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setSaveError("Vui lòng kiểm tra lại thông tin trước khi lưu.");
      return;
    }

    try {
      setSaving(true);
      setSaveError(null);
      const response = await promotionService.update(id, toPromotionWritePayload(formValues));
      setPromotion(response.promotion);
      setFormValues(createInitialPromotionFormValues(response.promotion));
      notify("Đã cập nhật chương trình khuyến mãi thành công.", "success");
      setSearchParams((previous) => {
        const next = new URLSearchParams(previous);
        next.delete("mode");
        return next;
      });
    } catch (error) {
      const message = getErrorMessage(error, "Không thể cập nhật chương trình khuyến mãi.");
      setSaveError(message);
      notify(message, "error");
    } finally {
      setSaving(false);
    }
  };

  const headerTitle = promotion?.name ?? "Chi tiết chương trình khuyến mãi";
  const headerSubtitle = promotion
    ? `Hiệu lực từ ${formatPromotionDate(promotion.startDate)} đến ${formatPromotionDate(promotion.endDate)}`
    : "Theo dõi hiệu lực và cập nhật cấu hình khuyến mãi.";

  return (
    <>
      <NoResizeScreenTemplate
        loading={false}
        bodyClassName="px-0 pb-0 pt-4"
        header={
          <PromotionPageHeader
            title={
              <Space wrap size={8}>
                <span>{headerTitle}</span>
                {promotion ? <PromotionStatusTag status={promotion.status} withDot /> : null}
              </Space>
            }
            subtitle={headerSubtitle}
            breadcrumbItems={[
              {
                title: (
                  <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.DASHBOARD)}>
                    Trang chủ
                  </span>
                ),
              },
              {
                title: (
                  <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.PROMOTION_LIST)}>
                    Khuyến mãi
                  </span>
                ),
              },
              { title: "Chi tiết" },
            ]}
            actions={
              <Space>
                {canModify ? (
                  <Button type="primary" icon={<EditOutlined />} onClick={handleStartEdit}>
                    Chỉnh sửa
                  </Button>
                ) : null}
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTE_URL.PROMOTION_LIST)}>
                  Quay lại
                </Button>
              </Space>
            }
          />
        }
        body={
          detailError ? (
            <Result
              status="error"
              title="Không thể tải chi tiết chương trình"
              subTitle={`${detailError} Hệ thống sẽ quay về danh sách khuyến mãi sau vài giây.`}
              extra={[
                <Button key="back-now" type="primary" onClick={() => navigate(ROUTE_URL.PROMOTION_LIST, { replace: true })}>
                  Quay về danh sách ngay
                </Button>,
              ]}
            />
          ) : loading && !promotion ? (
            <Card bordered={false} className="shadow-sm">
              <Spin spinning tip="Đang tải dữ liệu khuyến mãi..." />
            </Card>
          ) : promotion ? (
            <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <Row gutter={[12, 12]}>
              <Col xs={24} sm={12} xl={6}>
                <Card bordered={false} className="h-full shadow-sm">
                  <Space direction="vertical" size={4}>
                    <Typography.Text type="secondary">Loại khuyến mãi</Typography.Text>
                    <Typography.Title level={4} className="!mb-0">
                      {getPromotionTypeLabel(promotion.promotionType)}
                    </Typography.Title>
                  </Space>
                </Card>
              </Col>

              <Col xs={24} sm={12} xl={6}>
                <Card bordered={false} className="h-full shadow-sm">
                  <Statistic
                    title="Giá trị giảm"
                    value={promotion.discountValue}
                    formatter={() => formatPromotionDiscountValue(promotion)}
                  />
                </Card>
              </Col>

              <Col xs={24} sm={12} xl={6}>
                <Card bordered={false} className="h-full shadow-sm">
                  <Space direction="vertical" size={4}>
                    <Typography.Text type="secondary">Trạng thái</Typography.Text>
                    <PromotionStatusTag status={promotion.status} withDot />
                  </Space>
                </Card>
              </Col>

              <Col xs={24} sm={12} xl={6}>
                <Card bordered={false} className="h-full shadow-sm">
                  <Statistic title="Sản phẩm áp dụng" value={promotion.productCount ?? 0} />
                </Card>
              </Col>
            </Row>

            <PromotionInfoCard
              title="Tổng quan chương trình"
              description="Thông tin nhận diện và lịch sử cập nhật của chương trình."
            >
              <Descriptions column={{ xs: 1, md: 2 }} size="small">
                <Descriptions.Item label="Tên chương trình">{promotion.name}</Descriptions.Item>
                <Descriptions.Item label="Mã khuyến mãi">{promotion.code || "Chưa cấu hình"}</Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">{formatPromotionDate(promotion.createdAt)}</Descriptions.Item>
                <Descriptions.Item label="Cập nhật gần nhất">{formatPromotionDate(promotion.updatedAt)}</Descriptions.Item>
              </Descriptions>
            </PromotionInfoCard>

            <PromotionInfoCard
              title="Cấu hình ưu đãi"
              description="Các thông số giảm giá đang áp dụng cho chương trình."
            >
              <Descriptions column={{ xs: 1, md: 2 }} size="small">
                <Descriptions.Item label="Loại khuyến mãi">{getPromotionTypeLabel(promotion.promotionType)}</Descriptions.Item>
                <Descriptions.Item label="Giá trị giảm">
                  <Typography.Text strong>{formatPromotionDiscountValue(promotion)}</Typography.Text>
                </Descriptions.Item>
                <Descriptions.Item label="Mức giảm quy đổi">
                  {promotion.promotionType === "FIXED_AMOUNT"
                    ? toCurrency(promotion.discountValue)
                    : `${promotion.discountValue}%`}
                </Descriptions.Item>
                <Descriptions.Item label="Trạng thái hiển thị">
                  <Badge
                    status="processing"
                    text={<PromotionStatusTag status={promotion.status} withDot />}
                  />
                </Descriptions.Item>
              </Descriptions>
            </PromotionInfoCard>

            <PromotionInfoCard
              title="Thời gian áp dụng"
              description="Theo dõi mốc hiệu lực để kiểm soát tiến độ chiến dịch."
            >
              <Descriptions column={{ xs: 1, md: 2 }} size="small">
                <Descriptions.Item label="Ngày bắt đầu">{formatPromotionDate(promotion.startDate)}</Descriptions.Item>
                <Descriptions.Item label="Ngày kết thúc">{formatPromotionDate(promotion.endDate)}</Descriptions.Item>
                <Descriptions.Item label="Tổng thời lượng">
                  {getDurationLabel(promotion.startDate, promotion.endDate)}
                </Descriptions.Item>
                <Descriptions.Item label="Mốc kiểm soát">
                  {promotion.status === "ACTIVE" ? "Đang triển khai" : "Theo dõi và chuẩn bị"}
                </Descriptions.Item>
              </Descriptions>
            </PromotionInfoCard>

              <PromotionProductsTable products={promotion.applicableProducts ?? []} loading={loading} />
            </Space>
          ) : (
            <Empty description="Không có dữ liệu chương trình khuyến mãi." />
          )
        }
      />

      <Drawer
        title="Chỉnh sửa chương trình khuyến mãi"
        width={980}
        placement="right"
        open={editMode}
        destroyOnClose={false}
        onClose={handleCancelEdit}
        extra={
          <Space>
            <Button onClick={handleCancelEdit} disabled={saving}>
              Hủy
            </Button>
            <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => void handleSave()}>
              Lưu thay đổi
            </Button>
          </Space>
        }
      >
        <Form layout="vertical">
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            {saveError ? (
              <Alert
                type="error"
                showIcon
                message="Không thể cập nhật chương trình"
                description={saveError}
              />
            ) : null}

            <Row gutter={[16, 16]} align="top">
              <Col xs={24} xl={16}>
                <PromotionFormSections
                  formValues={formValues}
                  errors={errors}
                  productOptions={mergedProductOptions}
                  loadingProducts={loadingProducts}
                  productLoadError={productLoadError}
                  disabled={saving}
                  onValuesChange={handleValuesChange}
                />
              </Col>

              <Col xs={24} xl={8}>
                <PromotionFormSummaryCard formValues={formValues} />
              </Col>
            </Row>
          </Space>
        </Form>
      </Drawer>
    </>
  );
};

export default PromotionDetailPage;
