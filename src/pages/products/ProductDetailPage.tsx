import { ArrowLeftOutlined, EditOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { Alert, Breadcrumb, Button, Col, Divider, Row, Space, Typography } from "antd";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
import { getErrorMessage } from "../shared/page.utils";
import ProductGallery from "./components/ProductGallery";
import ProductInfoCard from "./components/ProductInfoCard";
import ProductStatusTag from "./components/ProductStatusTag";

const ProductDetailPage = () => {
  const navigate = useNavigate();
  const role = getStoredUserRole() ?? "GUEST";
  const { id } = useParams();
  const { notify } = useNotify();

  const [product, setProduct] = useState<ProductModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const canUpdate = canPerformAction(role, "product.update");
  const showRequestQuotation = canPerformAction(role, "quotation.create");

  const loadDetail = useCallback(async () => {
    if (!id) {
      setLoadError("Không tìm thấy mã sản phẩm hợp lệ.");
      return;
    }

    try {
      setLoading(true);
      setLoadError(null);
      const detail = await productService.getDetail(id);
      setProduct(detail);
    } catch (error) {
      const message = getErrorMessage(error, "Không thể tải thông tin chi tiết sản phẩm.");
      setLoadError(message);
      notify(message, "error");
    } finally {
      setLoading(false);
    }
  }, [id, notify]);

  useEffect(() => {
    void loadDetail();
  }, [loadDetail]);

  const subtitle = useMemo(() => {
    if (!product) {
      return "Trang hiển thị thông tin kỹ thuật, hình ảnh và trạng thái sản phẩm.";
    }

    return `Mã sản phẩm: ${product.productCode || "Chưa cập nhật"}`;
  }, [product]);

  return (
    <NoResizeScreenTemplate
      loading={false}
      bodyClassName="px-0 pb-0 pt-4"
      header={
        <ListScreenHeaderTemplate
          title={
            <Space wrap>
              <span>{product?.productName || "Chi tiết sản phẩm"}</span>
              {product ? <ProductStatusTag status={product.status} /> : null}
            </Space>
          }
          subtitle={subtitle}
          actions={
            <Space wrap>
              {canUpdate && id ? (
                <Button icon={<EditOutlined />} onClick={() => navigate(ROUTE_URL.PRODUCT_EDIT.replace(":id", id))}>
                  Chỉnh sửa
                </Button>
              ) : null}
              {showRequestQuotation ? (
                <Button icon={<ShoppingCartOutlined />} onClick={() => navigate(ROUTE_URL.QUOTATION_CREATE)}>
                  Yêu cầu báo giá
                </Button>
              ) : null}
              <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(ROUTE_URL.PRODUCT_LIST)}>
                Quay lại danh sách
              </Button>
            </Space>
          }
          breadcrumb={
            <Breadcrumb
              items={[
                { title: "Trang chủ" },
                { title: "Sản phẩm" },
                { title: product?.productName || "Chi tiết" },
              ]}
            />
          }
        />
      }
      body={
        <Space orientation="vertical" size={16} style={{ width: "100%" }}>
          {loading ? <InlinePageStatus mode="loading" title="Đang tải chi tiết sản phẩm..." /> : null}

          {!loading && loadError ? (
            <InlinePageStatus
              mode="error"
              title="Không thể hiển thị thông tin sản phẩm"
              description={loadError}
              actionLabel="Tải lại"
              onAction={() => void loadDetail()}
            />
          ) : null}

          {!loading && !loadError && !product ? (
            <InlinePageStatus
              mode="empty"
              title="Sản phẩm không tồn tại hoặc đã bị xóa"
              description="Bạn có thể quay lại danh sách để chọn sản phẩm khác."
              actionLabel="Về danh sách sản phẩm"
              onAction={() => navigate(ROUTE_URL.PRODUCT_LIST)}
            />
          ) : null}

          {!loading && !loadError && product ? (
            <>
              <Alert
                type="info"
                showIcon
                message="Trải nghiệm catalog"
                description="Trang chi tiết tập trung vào hình ảnh và thông số quan trọng để hỗ trợ báo giá và tư vấn nhanh."
              />

              <Row gutter={[16, 16]}>
                <Col xs={24} xl={14}>
                  <PageSectionCard title="Bộ sưu tập hình ảnh" subtitle="Hình ảnh sản phẩm giúp đội kinh doanh tư vấn trực quan hơn.">
                    <ProductGallery productName={product.productName || "Sản phẩm"} mainImage={product.mainImage} imageUrls={product.images ?? product.imageUrls} />
                  </PageSectionCard>
                </Col>

                <Col xs={24} xl={10}>
                  <PageSectionCard title="Thông tin chi tiết" subtitle="Các thông số kỹ thuật và trạng thái hiện tại của sản phẩm.">
                    <ProductInfoCard product={product} />
                  </PageSectionCard>
                </Col>
              </Row>

              <PageSectionCard title="Tóm tắt nhanh" subtitle="Những điểm nổi bật để nắm nhanh trước khi báo giá.">
                <Space orientation="vertical" size={8} style={{ width: "100%" }}>
                  <Typography.Text>
                    {product.productName || "Sản phẩm"} thuộc nhóm <Typography.Text strong>{product.type || "chưa phân loại"}</Typography.Text>,
                    độ dày <Typography.Text strong>{product.thickness || "chưa cập nhật"}</Typography.Text> và đơn vị <Typography.Text strong>{product.unit || "chưa cập nhật"}</Typography.Text>.
                  </Typography.Text>
                  <Divider style={{ margin: "8px 0" }} />
                  <Typography.Text type="secondary">
                    Nếu cần báo giá nhanh, bạn có thể dùng nút "Yêu cầu báo giá" ngay trên đầu trang để chuyển sang luồng xử lý tiếp theo.
                  </Typography.Text>
                </Space>
              </PageSectionCard>
            </>
          ) : null}
        </Space>
      }
    />
  );
};

export default ProductDetailPage;
