import { ArrowLeftOutlined, EyeOutlined, PictureOutlined, PlusOutlined, SaveOutlined, SendOutlined } from "@ant-design/icons";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Flex,
  Form,
  Grid,
  Input,
  InputNumber,
  Layout,
  Row,
  Select,
  Skeleton,
  Space,
  Steps,
  Tag,
  Typography,
} from "antd";
import type { AlertProps } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
import CustomBreadcrumb from "../../components/navigation/CustomBreadcrumb";
import ListScreenHeaderTemplate from "../../components/templates/ListScreenHeaderTemplate";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import type {
  QuotationFormInitProduct,
  QuotationFormInitProject,
  QuotationItemModel,
  QuotationPreviewResponseData,
} from "../../models/quotation/quotation.model";
import { quotationService } from "../../services/quotation/quotation.service";
import { getErrorMessage } from "../shared/page.utils";
import ProductImage from "../products/components/ProductImage";
import QuotationItemsTable, { type QuotationItemTableRow } from "./components/QuotationItemsTable";
import QuotationPreviewPanel from "./components/QuotationPreviewPanel";
import { formatQuotationCurrency } from "./quotation.ui";

interface QuotationItemForm {
  productId: string;
  quantity: number;
}

interface QuotationCreateFormValues {
  projectId?: string;
  productId?: string;
  quantityToAdd?: number;
  deliveryRequirements?: string;
  promotionCode?: string;
  note?: string;
}

const MAX_ITEMS = 20;
const MIN_SUBMIT_AMOUNT = 10_000_000;
const NOTE_MAX_LENGTH = 1000;
const DELIVERY_MAX_LENGTH = 1000;
const PROMOTION_MAX_LENGTH = 50;

const QuotationCreatePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { notify } = useNotify();
  const screens = Grid.useBreakpoint();
  const restoredDraftRef = useRef(false);

  const [form] = Form.useForm<QuotationCreateFormValues>();
  const watchedProjectId = Form.useWatch("projectId", form);
  const watchedPromotionCode = Form.useWatch("promotionCode", form);
  const watchedDeliveryRequirement = Form.useWatch("deliveryRequirements", form);
  const watchedNote = Form.useWatch("note", form);

  const [projectOptions, setProjectOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [promotionOptions, setPromotionOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [products, setProducts] = useState<QuotationFormInitProduct[]>([]);
  const [projects, setProjects] = useState<QuotationFormInitProject[]>([]);
  const [customerInfo, setCustomerInfo] = useState<{
    companyName?: string;
    customerType?: string;
    status?: string;
  } | null>(null);
  const [quotationItems, setQuotationItems] = useState<QuotationItemForm[]>([]);
  const [previewResult, setPreviewResult] = useState<QuotationPreviewResponseData | null>(null);
  const [isPreviewStale, setIsPreviewStale] = useState(true);
  const [pageLoading, setPageLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<"preview" | "draft" | "submit" | null>(null);
  const [inlineAlert, setInlineAlert] = useState<{
    type: AlertProps["type"];
    message: string;
    description?: string;
  } | null>(null);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    if (restoredDraftRef.current) {
      return;
    }

    restoredDraftRef.current = true;

    const navigationState = (location.state ?? null) as
      | {
          restoreDraft?: {
            formValues?: Partial<QuotationCreateFormValues>;
            quotationItems?: QuotationItemForm[];
          };
        }
      | null;
    const draft = navigationState?.restoreDraft;

    if (!draft) {
      return;
    }

    const restoredItems =
      Array.isArray(draft.quotationItems) && draft.quotationItems.length > 0
        ? draft.quotationItems
            .filter((item) => typeof item?.productId === "string" && item.productId.trim())
            .map((item) => ({
              productId: item.productId,
              quantity: Number(item.quantity ?? 0) > 0 ? Number(item.quantity) : 1,
            }))
        : [];

    if (restoredItems.length > 0) {
      setQuotationItems(restoredItems);
    }

    form.setFieldsValue({
      ...draft.formValues,
      quantityToAdd: draft.formValues?.quantityToAdd ?? 1,
    });
  }, [form, location.state]);

  useEffect(() => {
    const loadInit = async () => {
      try {
        setPageLoading(true);
        setInitError(null);
        const response = await quotationService.getFormInit({ page: 1, pageSize: 100 });

        setCustomerInfo(response.customer ?? null);
        setProducts(response.products ?? []);
        setProjects(response.projects ?? []);
        setProjectOptions(
          (response.projects ?? []).map((item) => ({
            label: `${item.projectCode ?? item.id} - ${item.name}`,
            value: item.id,
          })),
        );
        setPromotionOptions(
          (response.availablePromotions ?? []).map((item) => ({
            label: `${item.code} - ${item.name}`,
            value: item.code,
          })),
        );
      } catch (error) {
        const message = getErrorMessage(error, "Không thể tải dữ liệu khởi tạo báo giá.");
        setInitError(message);
        setCustomerInfo(null);
        setProducts([]);
        setProjects([]);
        setProjectOptions([]);
        setPromotionOptions([]);
        notify(message, "warning");
      } finally {
        setPageLoading(false);
      }
    };

    void loadInit();
  }, [notify]);

  useEffect(() => {
    setIsPreviewStale(true);
  }, [watchedDeliveryRequirement, watchedNote, watchedProjectId, watchedPromotionCode, quotationItems]);

  const productsById = useMemo(() => new Map(products.map((item) => [item.id, item])), [products]);
  const projectsById = useMemo(() => new Map(projects.map((item) => [item.id, item])), [projects]);
  const getProductDisplayLabel = (product: QuotationFormInitProduct) => `${product.productCode} - ${product.productName}`;
  const getProductFirstImage = (product: QuotationFormInitProduct) => product.mainImage || product.imageUrls?.[0] || product.images?.[0];

  const estimatedSubTotal = useMemo(() => {
    return quotationItems.reduce((sum, item) => {
      const referenceUnitPrice = Number(productsById.get(item.productId)?.referenceUnitPrice ?? 0);
      return sum + item.quantity * referenceUnitPrice;
    }, 0);
  }, [productsById, quotationItems]);

  const quotationItemRows = useMemo<QuotationItemTableRow[]>(() => {
    return quotationItems.map((item) => {
      const product = productsById.get(item.productId);
      const unitPrice = Number(product?.referenceUnitPrice ?? 0);

      return {
        key: item.productId,
        productImage: product ? getProductFirstImage(product) : undefined,
        productCode: product?.productCode ?? item.productId,
        productName: product?.productName ?? "Sản phẩm",
        productMeta: [product?.type, product?.size, product?.thickness].filter(Boolean).join(" • "),
        quantity: item.quantity,
        unit: product?.unit,
        unitPrice,
        amount: item.quantity * unitPrice,
      };
    });
  }, [productsById, quotationItems]);

  const selectedProject = watchedProjectId ? projectsById.get(watchedProjectId) : undefined;
  const selectedProductIdSet = useMemo(() => new Set(quotationItems.map((item) => item.productId)), [quotationItems]);
  const previewValidationMessages = previewResult?.validation?.messages ?? [];
  const isPreviewValid = previewResult?.validation ? previewResult.validation.valid : true;
  const canSubmitQuotation =
    Boolean(previewResult) &&
    !isPreviewStale &&
    isPreviewValid &&
    (previewResult?.summary?.totalAmount ?? 0) >= MIN_SUBMIT_AMOUNT;

  const processStep =
    quotationItems.length === 0 ? 0 : !previewResult ? 1 : isPreviewStale || !isPreviewValid ? 2 : canSubmitQuotation ? 3 : 2;

  const clearInlineFieldErrors = () => {
    form.setFields([
      { name: "productId", errors: [] },
      { name: "quantityToAdd", errors: [] },
      { name: "deliveryRequirements", errors: [] },
      { name: "note", errors: [] },
      { name: "promotionCode", errors: [] },
    ]);
  };

  const buildItemsPayload = (): QuotationItemModel[] =>
    quotationItems.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

  const getValidationError = (mode: "draft" | "preview" | "submit"): string | null => {
    const deliveryRequirement = form.getFieldValue("deliveryRequirements") ?? "";
    const note = form.getFieldValue("note") ?? "";
    const promotionCode = form.getFieldValue("promotionCode") ?? "";

    if (quotationItems.length === 0) {
      return "Bạn cần thêm ít nhất một sản phẩm vào báo giá.";
    }
    if (quotationItems.length > MAX_ITEMS) {
      return `Mỗi báo giá chỉ được tối đa ${MAX_ITEMS} dòng sản phẩm.`;
    }
    if (deliveryRequirement.length > DELIVERY_MAX_LENGTH) {
      return `Yêu cầu giao hàng tối đa ${DELIVERY_MAX_LENGTH} ký tự.`;
    }
    if (note.length > NOTE_MAX_LENGTH) {
      return `Ghi chú tối đa ${NOTE_MAX_LENGTH} ký tự.`;
    }
    if (promotionCode.length > PROMOTION_MAX_LENGTH) {
      return `Mã ưu đãi tối đa ${PROMOTION_MAX_LENGTH} ký tự.`;
    }

    const invalidItem = quotationItems.find((item) => !Number.isInteger(item.quantity) || item.quantity < 1);
    if (invalidItem) {
      return "Số lượng của từng dòng sản phẩm phải là số nguyên lớn hơn hoặc bằng 1.";
    }

    if (mode === "submit") {
      if (!previewResult || isPreviewStale) {
        return "Vui lòng xem trước lại báo giá trước khi gửi.";
      }
      if (previewResult.validation && !previewResult.validation.valid) {
        return "Bản xem trước đang có cảnh báo, vui lòng xử lý trước khi gửi.";
      }
      if ((previewResult.summary?.totalAmount ?? 0) < MIN_SUBMIT_AMOUNT) {
        return `Tổng giá trị cần tối thiểu ${formatQuotationCurrency(MIN_SUBMIT_AMOUNT)} để gửi báo giá.`;
      }
    }

    return null;
  };

  const buildRequestPayload = () => {
    const values = form.getFieldsValue();
    return {
      projectId: values.projectId || undefined,
      deliveryRequirements: values.deliveryRequirements?.trim() || undefined,
      promotionCode: values.promotionCode || undefined,
      note: values.note?.trim() || undefined,
      items: buildItemsPayload(),
    };
  };

  const handleAddProduct = () => {
    const productId = form.getFieldValue("productId");
    const draftQuantity = form.getFieldValue("quantityToAdd");
    const quantity = Number.isFinite(Number(draftQuantity)) ? Math.max(1, Math.trunc(Number(draftQuantity))) : 1;

    if (!productId) {
      form.setFields([{ name: "productId", errors: ["Vui lòng chọn sản phẩm trước khi thêm."] }]);
      return;
    }

    if (quotationItems.length >= MAX_ITEMS && !quotationItems.some((item) => item.productId === productId)) {
      setInlineAlert({
        type: "error",
        message: `Bạn chỉ có thể thêm tối đa ${MAX_ITEMS} dòng sản phẩm cho một báo giá.`,
      });
      return;
    }

    clearInlineFieldErrors();
    setInlineAlert(null);

    setQuotationItems((previous) => {
      const existingIndex = previous.findIndex((item) => item.productId === productId);
      if (existingIndex === -1) {
        return [...previous, { productId, quantity }];
      }

      const next = [...previous];
      const existing = next[existingIndex];
      next[existingIndex] = {
        ...existing,
        quantity: existing.quantity + quantity,
      };
      return next;
    });

    form.setFieldsValue({
      productId: undefined,
      quantityToAdd: 1,
    });
  };

  const updateItemQuantity = (productId: string, quantity: number) => {
    const normalizedQuantity = Number.isFinite(quantity) ? Math.max(1, Math.trunc(quantity)) : 1;
    setQuotationItems((previous) =>
      previous.map((item) => {
        if (item.productId !== productId) {
          return item;
        }
        return {
          ...item,
          quantity: normalizedQuantity,
        };
      }),
    );
  };

  const removeItem = (productId: string) => {
    setQuotationItems((previous) => previous.filter((item) => item.productId !== productId));
  };

  const handlePreview = async () => {
    try {
      clearInlineFieldErrors();
      await form.validateFields(["deliveryRequirements", "note", "promotionCode"]);

      const error = getValidationError("preview");
      if (error) {
        setInlineAlert({ type: "error", message: "Chưa thể xem trước báo giá.", description: error });
        return;
      }

      setActionLoading("preview");
      setInlineAlert(null);
      const preview = await quotationService.preview(buildRequestPayload());
      setPreviewResult(preview);
      setIsPreviewStale(false);

      if (preview.validation && !preview.validation.valid && preview.validation.messages?.length) {
        setInlineAlert({
          type: "warning",
          message: "Bản xem trước có cảnh báo cần xử lý.",
          description: preview.validation.messages.join(" "),
        });
      } else if ((preview.summary?.totalAmount ?? 0) < MIN_SUBMIT_AMOUNT) {
        setInlineAlert({
          type: "warning",
          message: "Bản xem trước thành công nhưng chưa đủ điều kiện gửi.",
          description: `Tổng giá trị cần tối thiểu ${formatQuotationCurrency(MIN_SUBMIT_AMOUNT)}.`,
        });
      } else {
        setInlineAlert({
          type: "success",
          message: "Đã cập nhật bản xem trước mới nhất.",
        });
      }
    } catch (error) {
      if (typeof error === "object" && error !== null && "errorFields" in error) {
        setInlineAlert({
          type: "error",
          message: "Vui lòng kiểm tra lại các trường thông tin được đánh dấu đỏ.",
        });
        return;
      }

      const message = getErrorMessage(error, "Không thể xem trước báo giá.");
      setPreviewResult(null);
      setIsPreviewStale(true);
      setInlineAlert({ type: "error", message });
      notify(message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSubmit = async () => {
    try {
      clearInlineFieldErrors();
      await form.validateFields(["deliveryRequirements", "note", "promotionCode"]);

      const error = getValidationError("submit");
      if (error) {
        setInlineAlert({ type: "error", message: "Chưa thể gửi báo giá.", description: error });
        return;
      }

      setActionLoading("submit");
      const created = await quotationService.create(buildRequestPayload());
      notify("Đã gửi báo giá thành công.", "success");
      navigate(ROUTE_URL.QUOTATION_DETAIL.replace(":id", created.id));
    } catch (error) {
      if (typeof error === "object" && error !== null && "errorFields" in error) {
        setInlineAlert({
          type: "error",
          message: "Vui lòng kiểm tra lại các trường thông tin được đánh dấu đỏ.",
        });
        return;
      }

      const message = getErrorMessage(error, "Không thể gửi báo giá.");
      setInlineAlert({ type: "error", message });
      notify(message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveDraft = async () => {
    try {
      clearInlineFieldErrors();
      await form.validateFields(["deliveryRequirements", "note", "promotionCode"]);

      const error = getValidationError("draft");
      if (error) {
        setInlineAlert({ type: "error", message: "Chưa thể lưu nháp.", description: error });
        return;
      }

      setActionLoading("draft");
      const draft = await quotationService.saveDraft(buildRequestPayload());
      notify("Đã lưu bản nháp báo giá.", "success");
      navigate(ROUTE_URL.QUOTATION_DETAIL.replace(":id", draft.id));
    } catch (error) {
      if (typeof error === "object" && error !== null && "errorFields" in error) {
        setInlineAlert({
          type: "error",
          message: "Vui lòng kiểm tra lại các trường thông tin được đánh dấu đỏ.",
        });
        return;
      }

      const message = getErrorMessage(error, "Không thể lưu bản nháp.");
      setInlineAlert({ type: "error", message });
      notify(message, "error");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title="Soạn báo giá mới"
          subtitle="Tạo báo giá theo luồng từng bước để kiểm soát đầy đủ sản phẩm, điều khoản và tổng giá trị trước khi gửi."
          breadcrumb={
            <CustomBreadcrumb
              breadcrumbs={[
                { label: "Trang chủ" },
                { label: "Báo giá", url: ROUTE_URL.QUOTATION_LIST },
                { label: "Tạo mới" },
              ]}
            />
          }
        />
      }
      body={
        <Layout style={{ background: "transparent" }}>
          {pageLoading ? (
            <Card variant="borderless" className="border border-slate-200">
              <Skeleton active paragraph={{ rows: 8 }} />
            </Card>
          ) : (
            <Space orientation="vertical" size={16} style={{ width: "100%" }}>
              <Card variant="borderless" className="border border-slate-200">
                <Steps
                  size="small"
                  current={processStep}
                  items={[
                    { title: "Thông tin nền" },
                    { title: "Sản phẩm báo giá" },
                    { title: "Xem trước" },
                    { title: "Gửi báo giá" },
                  ]}
                />
              </Card>

              {initError ? <Alert type="warning" showIcon title="Dữ liệu khởi tạo chưa đầy đủ." description={initError} /> : null}

              <Form<QuotationCreateFormValues>
                form={form}
                layout="vertical"
                initialValues={{
                  quantityToAdd: 1,
                }}
              >
                <Row gutter={[16, 16]} align="top">
                  <Col xs={24} xl={16}>
                    <Space orientation="vertical" size={16} style={{ width: "100%" }}>
                      <Card variant="borderless" className="border border-slate-200">
                        <Space orientation="vertical" size={14} style={{ width: "100%" }}>
                          <Typography.Title level={5} className="!mb-0">
                            1. Thông tin khách hàng / dự án
                          </Typography.Title>

                          <Descriptions column={1} size="small" colon={false}>
                            <Descriptions.Item label="Doanh nghiệp">{customerInfo?.companyName || "Chưa có thông tin"}</Descriptions.Item>
                            <Descriptions.Item label="Phân loại">{customerInfo?.customerType || "Chưa có thông tin"}</Descriptions.Item>
                            <Descriptions.Item label="Trạng thái">{customerInfo?.status || "Chưa có thông tin"}</Descriptions.Item>
                          </Descriptions>

                          <Row gutter={[12, 12]}>
                            <Col xs={24} lg={16}>
                              <Form.Item name="projectId" label="Dự án áp dụng (tuỳ chọn)">
                                <Select
                                  allowClear
                                  showSearch
                                  placeholder="Chọn dự án liên quan"
                                  options={projectOptions}
                                  optionFilterProp="label"
                                />
                              </Form.Item>
                            </Col>
                            <Col xs={24} lg={8}>
                              <Form.Item label="Dự án đã chọn">
                                {selectedProject ? (
                                  <Tag color="blue">{selectedProject.name}</Tag>
                                ) : (
                                  <Typography.Text type="secondary">Chưa chọn dự án</Typography.Text>
                                )}
                              </Form.Item>
                            </Col>
                          </Row>
                        </Space>
                      </Card>

                      <Card variant="borderless" className="border border-slate-200">
                        <Space orientation="vertical" size={14} style={{ width: "100%" }}>
                          <Typography.Title level={5} className="!mb-0">
                            2. Sản phẩm báo giá
                          </Typography.Title>

                          <Row gutter={[12, 12]} align="middle" className="items-center">
                            <Col xs={24} lg={14}>
                              <Form.Item name="productId" label="Sản phẩm">
                                <Select
                                  showSearch
                                  placeholder="Chọn sản phẩm để thêm vào báo giá"
                                  optionFilterProp="label"
                                >
                                  {products.map((product) => {
                                    const imageUrl = getProductFirstImage(product);
                                    const productLabel = getProductDisplayLabel(product);
                                    const isAdded = selectedProductIdSet.has(product.id);

                                    return (
                                      <Select.Option key={product.id} value={product.id} label={productLabel} disabled={isAdded}>
                                        <Flex
                                          align="center"
                                          justify="space-between"
                                          gap={12}
                                          style={{
                                            width: "100%",
                                            padding: "4px 8px",
                                            borderRadius: 8,
                                            background: isAdded ? "#e6f4ff" : "transparent",
                                            border: isAdded ? "1px solid #d6e4ff" : "1px solid transparent",
                                          }}
                                        >
                                          <Flex align="center" gap={10} style={{ minWidth: 0 }}>
                                            <div
                                              style={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 8,
                                                border: "1px solid #d9d9d9",
                                                overflow: "hidden",
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                flexShrink: 0,
                                                background: "#f5f5f5",
                                              }}
                                            >
                                              {imageUrl ? (
                                                <ProductImage
                                                  src={imageUrl}
                                                  alt={product.productName}
                                                  preview={false}
                                                  width={36}
                                                  height={36}
                                                  style={{ objectFit: "cover" }}
                                                />
                                              ) : (
                                                <PictureOutlined style={{ color: "#8c8c8c" }} />
                                              )}
                                            </div>
                                            <Space orientation="vertical" size={0} style={{ minWidth: 0 }}>
                                              <Typography.Text ellipsis style={{ maxWidth: 280 }}>
                                                {productLabel}
                                              </Typography.Text>
                                              <Typography.Text type="secondary" ellipsis style={{ maxWidth: 280 }}>
                                                {[product.type, product.size, product.thickness].filter(Boolean).join(" • ") || "Chưa có thông tin kỹ thuật"}
                                              </Typography.Text>
                                            </Space>
                                          </Flex>

                                          <Space size={4}>
                                            {isAdded ? <Tag color="blue">Đã thêm</Tag> : null}
                                            <Button
                                              type="link"
                                              size="small"
                                              onMouseDown={(event) => {
                                                event.preventDefault();
                                                event.stopPropagation();
                                              }}
                                              onClick={(event) => {
                                                event.preventDefault();
                                                event.stopPropagation();
                                                navigate(ROUTE_URL.PRODUCT_DETAIL.replace(":id", product.id), {
                                                  state: {
                                                    returnTo: ROUTE_URL.QUOTATION_CREATE,
                                                    returnLabel: "Quay lại tạo báo giá",
                                                    restoreDraft: {
                                                      formValues: form.getFieldsValue(),
                                                      quotationItems,
                                                    },
                                                  },
                                                });
                                              }}
                                            >
                                              Xem chi tiết
                                            </Button>
                                          </Space>
                                        </Flex>
                                      </Select.Option>
                                    );
                                  })}
                                </Select>
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} lg={5}>
                              <Form.Item
                                name="quantityToAdd"
                                label="Số lượng"
                                rules={[
                                  { required: true, message: "Vui lòng nhập số lượng." },
                                  {
                                    validator: (_, value) => {
                                      const numeric = Number(value);
                                      if (!Number.isFinite(numeric) || !Number.isInteger(numeric) || numeric < 1) {
                                        return Promise.reject(new Error("Số lượng phải là số nguyên, tối thiểu 1."));
                                      }

                                      return Promise.resolve();
                                    },
                                  },
                                ]}
                              >
                                <InputNumber className="w-full" min={1} precision={0} step={1} />
                              </Form.Item>
                            </Col>
                            <Col xs={24} sm={12} lg={5}>
                              <Button block icon={<PlusOutlined />} onClick={handleAddProduct}>
                                Thêm dòng
                              </Button>
                            </Col>
                          </Row>

                          {quotationItems.length === 0 ? (
                            <Alert
                              type="info"
                              showIcon
                              title="Bạn chưa thêm sản phẩm nào."
                              description="Hãy chọn ít nhất một sản phẩm để tạo và xem trước báo giá."
                            />
                          ) : null}

                          <QuotationItemsTable
                            items={quotationItemRows}
                            editable
                            emptyDescription="Chưa có sản phẩm trong báo giá."
                            onQuantityChange={updateItemQuantity}
                            onRemove={removeItem}
                          />

                          <Flex justify="space-between" align="center" wrap="wrap" gap={8}>
                            <Space>
                              <Badge count={quotationItems.length} color="#1677ff" />
                              <Typography.Text>{`Số dòng sản phẩm: ${quotationItems.length}/${MAX_ITEMS}`}</Typography.Text>
                            </Space>
                            <Typography.Text strong>{`Tạm tính tham chiếu: ${formatQuotationCurrency(estimatedSubTotal)}`}</Typography.Text>
                          </Flex>
                        </Space>
                      </Card>

                      <Card variant="borderless" className="border border-slate-200">
                        <Space orientation="vertical" size={14} style={{ width: "100%" }}>
                          <Typography.Title level={5} className="!mb-0">
                            3. Thông tin giao hàng và ghi chú
                          </Typography.Title>

                          <Row gutter={[12, 12]}>
                            <Col xs={24}>
                              <Form.Item
                                name="deliveryRequirements"
                                label="Yêu cầu giao hàng"
                                rules={[{ max: DELIVERY_MAX_LENGTH, message: `Tối đa ${DELIVERY_MAX_LENGTH} ký tự.` }]}
                              >
                                <Input.TextArea
                                  rows={4}
                                  showCount
                                  maxLength={DELIVERY_MAX_LENGTH}
                                  placeholder="Mô tả điều kiện giao hàng, địa điểm hoặc mốc thời gian mong muốn"
                                />
                              </Form.Item>
                            </Col>
                            <Col xs={24}>
                              <Form.Item name="note" label="Ghi chú nội dung báo giá" rules={[{ max: NOTE_MAX_LENGTH, message: `Tối đa ${NOTE_MAX_LENGTH} ký tự.` }]}>
                                <Input.TextArea rows={4} showCount maxLength={NOTE_MAX_LENGTH} placeholder="Ghi chú thêm cho người duyệt hoặc người nhận báo giá" />
                              </Form.Item>
                            </Col>
                          </Row>
                        </Space>
                      </Card>

                      <Card variant="borderless" className="border border-slate-200">
                        <Space orientation="vertical" size={14} style={{ width: "100%" }}>
                          <Typography.Title level={5} className="!mb-0">
                            4. Khuyến mãi / mã ưu đãi
                          </Typography.Title>

                          <Form.Item
                            name="promotionCode"
                            label="Mã ưu đãi (tuỳ chọn)"
                            rules={[{ max: PROMOTION_MAX_LENGTH, message: `Tối đa ${PROMOTION_MAX_LENGTH} ký tự.` }]}
                          >
                            <Select allowClear showSearch placeholder="Chọn mã ưu đãi nếu có" options={promotionOptions} optionFilterProp="label" />
                          </Form.Item>

                          {watchedPromotionCode ? (
                            <Typography.Text type="secondary">
                              Mã đã chọn: <Tag color="gold">{watchedPromotionCode}</Tag>
                            </Typography.Text>
                          ) : (
                            <Typography.Text type="secondary">Chưa áp dụng mã ưu đãi.</Typography.Text>
                          )}
                        </Space>
                      </Card>

                      <Card variant="borderless" className="border border-slate-200">
                        <Space orientation="vertical" size={14} style={{ width: "100%" }}>
                          <Typography.Title level={5} className="!mb-0">
                            5. Xem trước báo giá
                          </Typography.Title>

                          {!previewResult ? (
                            <Alert
                              type="info"
                              showIcon
                              title="Bạn chưa xem trước báo giá."
                              description="Hãy bấm “Xem trước” để kiểm tra tổng tiền, ưu đãi và hạn hiệu lực trước khi gửi."
                            />
                          ) : null}

                          {previewResult && isPreviewStale ? (
                            <Alert
                              type="warning"
                              showIcon
                              title="Bản xem trước đã cũ do dữ liệu vừa thay đổi."
                              description="Vui lòng xem trước lại để đảm bảo thông tin gửi đi là mới nhất."
                            />
                          ) : null}

                          {previewResult && !isPreviewStale && !isPreviewValid ? (
                            <Alert
                              type="warning"
                              showIcon
                              title="Bản xem trước đang có cảnh báo."
                              description={previewValidationMessages.join(" ") || "Vui lòng kiểm tra lại thông tin trước khi gửi báo giá."}
                            />
                          ) : null}

                          {inlineAlert ? <Alert type={inlineAlert.type} showIcon title={inlineAlert.message} description={inlineAlert.description} /> : null}

                          <Divider style={{ margin: 0 }} />

                          <Flex wrap="wrap" gap={8}>
                            <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTE_URL.QUOTATION_LIST)}>
                              Quay lại danh sách
                            </Button>
                            <Button
                              icon={<EyeOutlined />}
                              loading={actionLoading === "preview"}
                              onClick={() => void handlePreview()}
                              disabled={Boolean(actionLoading) || quotationItems.length === 0}
                            >
                              Xem trước
                            </Button>
                            <Button
                              icon={<SaveOutlined />}
                              loading={actionLoading === "draft"}
                              onClick={() => void handleSaveDraft()}
                              disabled={Boolean(actionLoading) || quotationItems.length === 0}
                            >
                              Lưu nháp
                            </Button>
                            <Button
                              type={canSubmitQuotation ? "primary" : "default"}
                              icon={<SendOutlined />}
                              loading={actionLoading === "submit"}
                              onClick={() => void handleSubmit()}
                              disabled={Boolean(actionLoading) || quotationItems.length === 0 || !canSubmitQuotation}
                            >
                              Gửi báo giá
                            </Button>
                          </Flex>
                        </Space>
                      </Card>
                    </Space>
                  </Col>

                  <Col xs={24} xl={8}>
                    {screens.xl ? (
                      <div style={{ position: "sticky", top: 16 }}>
                        <QuotationPreviewPanel
                          lineItems={quotationItems.length}
                          estimatedSubTotal={estimatedSubTotal}
                          preview={previewResult}
                          previewStale={isPreviewStale}
                          minSubmitAmount={MIN_SUBMIT_AMOUNT}
                        />
                      </div>
                    ) : (
                      <QuotationPreviewPanel
                        lineItems={quotationItems.length}
                        estimatedSubTotal={estimatedSubTotal}
                        preview={previewResult}
                        previewStale={isPreviewStale}
                        minSubmitAmount={MIN_SUBMIT_AMOUNT}
                      />
                    )}
                  </Col>
                </Row>
              </Form>
            </Space>
          )}
        </Layout>
      }
    />
  );
};

export default QuotationCreatePage;
