import { ArrowLeftOutlined, SaveOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Col, Form, Row, Space, Typography } from "antd";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import NoResizeScreenTemplate from "../../components/templates/NoResizeScreenTemplate";
import { ROUTE_URL } from "../../const/route_url.const";
import { useNotify } from "../../context/notifyContext";
import { productService } from "../../services/product/product.service";
import { promotionService } from "../../services/promotion/promotion.service";
import { getErrorMessage } from "../shared/page.utils";
import PromotionFormSections, { type PromotionProductOption } from "./components/PromotionFormSections";
import PromotionFormSummaryCard from "./components/PromotionFormSummaryCard";
import PromotionPageHeader from "./components/PromotionPageHeader";
import {
  createInitialPromotionFormValues,
  toPromotionWritePayload,
  validatePromotionForm,
  type PromotionFormErrors,
  type PromotionFormValues,
} from "./promotionForm.utils";

const PromotionCreatePage = () => {
  const navigate = useNavigate();
  const { notify } = useNotify();

  const [formValues, setFormValues] = useState<PromotionFormValues>(createInitialPromotionFormValues());
  const [errors, setErrors] = useState<PromotionFormErrors>({});
  const [productOptions, setProductOptions] = useState<PromotionProductOption[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [productLoadError, setProductLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

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

  const handleValuesChange = useCallback((patch: Partial<PromotionFormValues>) => {
    setFormValues((previous) => ({ ...previous, ...patch }));
    setSubmitError(null);

    setErrors((previous) => {
      const next = { ...previous };
      (Object.keys(patch) as Array<keyof PromotionFormValues>).forEach((key) => {
        delete next[key];
      });
      return next;
    });
  }, []);

  const handleSubmit = async () => {
    const validationErrors = validatePromotionForm(formValues);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      setSubmitError("Vui lòng kiểm tra lại các thông tin bắt buộc trước khi tạo khuyến mãi.");
      return;
    }

    try {
      setSaving(true);
      setSubmitError(null);
      const response = await promotionService.create(toPromotionWritePayload(formValues));
      notify("Đã tạo chương trình khuyến mãi thành công.", "success");
      navigate(ROUTE_URL.PROMOTION_DETAIL.replace(":id", response.promotion.id));
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tạo chương trình khuyến mãi.");
      setSubmitError(message);
      notify(message, "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <NoResizeScreenTemplate
      loading={false}
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <PromotionPageHeader
          title="Tạo chương trình khuyến mãi"
          subtitle="Thiết lập chiến dịch ưu đãi theo từng bước để đảm bảo dễ kiểm soát và chính xác trước khi phát hành."
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
            { title: "Tạo mới" },
          ]}
        />
      }
      body={
        <Form layout="vertical" onFinish={() => void handleSubmit()}>
          <Space orientation="vertical" size={16} style={{ width: "100%" }}>
            <Alert
              type="info"
              showIcon
              message="Gợi ý cấu hình nhanh"
              description="Hãy thiết lập đầy đủ loại khuyến mãi, giá trị giảm và thời gian hiệu lực để đội kinh doanh có thể áp dụng ngay."
            />

            {submitError ? (
              <Alert
                type="error"
                showIcon
                message="Không thể tạo chương trình khuyến mãi"
                description={submitError}
              />
            ) : null}

            <Row gutter={[16, 16]} align="top">
              <Col xs={24} xl={16}>
                <PromotionFormSections
                  formValues={formValues}
                  errors={errors}
                  productOptions={productOptions}
                  loadingProducts={loadingProducts}
                  productLoadError={productLoadError}
                  disabled={saving}
                  onValuesChange={handleValuesChange}
                />
              </Col>

              <Col xs={24} xl={8}>
                <Space orientation="vertical" size={16} style={{ width: "100%" }}>
                  <PromotionFormSummaryCard
                    formValues={formValues}
                    className="xl:sticky xl:top-4"
                  />
                </Space>
              </Col>
            </Row>

            <Card variant="borderless" className="sticky bottom-4 z-10 shadow-md">
              <Row justify="space-between" align="middle" gutter={[12, 12]}>
                <Col xs={24} md={14}>
                  <Typography.Text type="secondary">
                    Sau khi tạo thành công, hệ thống sẽ chuyển sang trang chi tiết để bạn theo dõi hoặc chỉnh sửa thêm.
                  </Typography.Text>
                </Col>

                <Col xs={24} md={10}>
                  <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                    <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTE_URL.PROMOTION_LIST)} disabled={saving}>
                      Quay lại
                    </Button>
                    <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={saving}>
                      Tạo khuyến mãi
                    </Button>
                  </Space>
                </Col>
              </Row>
            </Card>
          </Space>
        </Form>
      }
    />
  );
};

export default PromotionCreatePage;
