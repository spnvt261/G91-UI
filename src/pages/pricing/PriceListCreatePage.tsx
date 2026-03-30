import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Button, Card, Space, Typography } from "antd";
import { useNavigate } from "react-router-dom";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import { productService } from "../../services/product/product.service";
import { priceListService } from "../../services/pricing/price-list.service";
import { getErrorMessage } from "../shared/page.utils";
import PriceListPageHeader from "./components/PriceListPageHeader";
import PriceListFormSection from "./PriceListFormSection";
import {
  createInitialPriceListFormValues,
  toPriceListWritePayload,
  validatePriceListForm,
  type PriceListFormErrors,
} from "./priceListForm.utils";
import type { PriceListProductOption } from "./priceList.ui";

const PriceListCreatePage = () => {
  const navigate = useNavigate();
  const { notify } = useNotify();
  const [values, setValues] = useState(createInitialPriceListFormValues());
  const [errors, setErrors] = useState<PriceListFormErrors>({});
  const [saving, setSaving] = useState(false);
  const [productOptions, setProductOptions] = useState<PriceListProductOption[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productLoadError, setProductLoadError] = useState<string | null>(null);

  const loadProducts = useCallback(async () => {
    try {
      setLoadingProducts(true);
      setProductLoadError(null);
      const response = await productService.getList({
        page: 1,
        pageSize: 1000,
        status: "ACTIVE",
      });

      setProductOptions(
        response.items.map((item) => ({
          label: `${item.productCode} - ${item.productName}`,
          value: item.id,
          productCode: item.productCode,
          productName: item.productName,
        })),
      );
    } catch (error) {
      setProductOptions([]);
      setProductLoadError(getErrorMessage(error, "Không thể tải danh sách sản phẩm đang hoạt động. Vui lòng thử lại."));
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const isCreateBlocked = useMemo(() => {
    return Boolean(productLoadError) && productOptions.length === 0;
  }, [productLoadError, productOptions.length]);

  const handleSave = async () => {
    if (isCreateBlocked) {
      notify("Chưa thể lưu bảng giá do danh sách sản phẩm chưa tải được.", "error");
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
      const created = await priceListService.create(toPriceListWritePayload(values));
      notify("Đã tạo bảng giá thành công.", "success");
      navigate(ROUTE_URL.PRICE_LIST_DETAIL.replace(":id", created.id));
    } catch (error) {
      notify(getErrorMessage(error, "Không thể tạo bảng giá."), "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <PriceListPageHeader
          title="Tạo bảng giá mới"
          subtitle="Thiết lập phạm vi áp dụng, thời gian hiệu lực và đơn giá sản phẩm cho hoạt động báo giá."
          breadcrumbItems={[
            { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.DASHBOARD)}>Trang chủ</span> },
            { title: <span className="cursor-pointer" onClick={() => navigate(ROUTE_URL.PRICE_LIST_LIST)}>Bảng giá</span> },
            { title: "Tạo mới" },
          ]}
        />
      }
      body={
        <Space orientation="vertical" size={16} style={{ width: "100%" }}>
          {isCreateBlocked ? (
            <Alert
              type="error"
              showIcon
              message="Không thể tạo bảng giá lúc này"
              description="Danh sách sản phẩm chưa tải được nên bạn chưa thể hoàn tất biểu mẫu. Vui lòng thử tải lại trước khi lưu."
            />
          ) : null}

          <PriceListFormSection
            title="Luồng tạo bảng giá"
            subtitle="Điền lần lượt thông tin chung, hiệu lực và danh sách đơn giá để đảm bảo bảng giá sẵn sàng áp dụng."
            values={values}
            errors={errors}
            productOptions={productOptions}
            loadingProducts={loadingProducts}
            productLoadError={productLoadError}
            onRetryLoadProducts={() => void loadProducts()}
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
                Sau khi lưu, hệ thống sẽ chuyển bạn sang trang chi tiết để kiểm tra lại bảng giá vừa tạo.
              </Typography.Text>
              <Space wrap>
                <Button type="primary" icon={<SaveOutlined />} loading={saving} onClick={() => void handleSave()} disabled={saving || isCreateBlocked}>
                  Lưu bảng giá
                </Button>
                <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTE_URL.PRICE_LIST_LIST)} disabled={saving}>
                  Quay lại
                </Button>
              </Space>
            </Space>
          </Card>
        </Space>
      }
    />
  );
};

export default PriceListCreatePage;
