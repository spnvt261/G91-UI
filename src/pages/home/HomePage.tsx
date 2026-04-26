import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  LoginOutlined,
  MailOutlined,
  PhoneOutlined,
  ShoppingOutlined,
  SolutionOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { Alert, Avatar, Button, Card, Col, Grid, Layout, Row, Skeleton, Space, Tag, Typography } from "antd";
import { useEffect, useMemo, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { getDefaultRouteByRole } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import type { ProductModel } from "../../models/product/product.model";
import { productService } from "../../services/product/product.service";
import { getStoredAccessToken, getStoredUserRole } from "../../utils/authSession";
import ProductImage from "../products/components/ProductImage";
import { getErrorMessage } from "../shared/page.utils";

const FEATURED_PRODUCTS_LIMIT = 6;

const serviceItems = [
  {
    icon: <ShoppingOutlined />,
    title: "Catalog rõ ràng",
    description: "Thông số, hình ảnh và trạng thái sản phẩm được trình bày gọn.",
  },
  {
    icon: <SolutionOutlined />,
    title: "Báo giá nhanh",
    description: "Khách hàng chuyển từ xem sản phẩm sang yêu cầu báo giá chỉ trong vài bước.",
  },
  {
    icon: <CheckCircleOutlined />,
    title: "Vận hành nhất quán",
    description: "Kinh doanh, kho và kế toán dùng cùng một nguồn dữ liệu.",
  },
];

const companyContacts = [
  {
    icon: <EnvironmentOutlined />,
    label: "Văn phòng",
    value: "TP. Hồ Chí Minh, Việt Nam",
  },
  {
    icon: <PhoneOutlined />,
    label: "Hotline",
    value: "1900 9091",
    href: "tel:19009091",
  },
  {
    icon: <MailOutlined />,
    label: "Email",
    value: "hello@g90steel.vn",
    href: "mailto:hello@g90steel.vn",
  },
];

type ProductDefaultVisualProps = {
  variant?: "hero" | "card";
};

const ProductDefaultVisual = ({ variant = "card" }: ProductDefaultVisualProps) => (
  <div className={`landing-page__product-default landing-page__product-default--${variant}`} role="img" aria-label="Ảnh sản phẩm đang cập nhật">
    <div className="landing-page__product-default-mark">G90</div>
    <div className="landing-page__product-default-stack" aria-hidden="true">
      <span />
      <span />
      <span />
    </div>
    <div className="landing-page__product-default-caption">
      <Typography.Text>Ảnh đang cập nhật</Typography.Text>
      <Typography.Text type="secondary">Vật tư thép công nghiệp</Typography.Text>
    </div>
  </div>
);

const HomePage = () => {
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();
  const accessToken = getStoredAccessToken();
  const role = getStoredUserRole();
  const isCustomerSession = Boolean(accessToken && role === "CUSTOMER");

  const [featuredProducts, setFeaturedProducts] = useState<ProductModel[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

  const featuredHeroProduct = useMemo(() => featuredProducts[0], [featuredProducts]);

  const handleScrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (!section) {
      return;
    }

    window.scrollTo({
      top: section.getBoundingClientRect().top + window.scrollY - 96,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    let alive = true;

    const loadFeaturedProducts = async () => {
      try {
        setLoadingProducts(true);
        setProductError(null);

        const response = await productService.getList({
          page: 1,
          pageSize: FEATURED_PRODUCTS_LIMIT,
          status: "ACTIVE",
          sortBy: "createdAt",
          sortDir: "desc",
        });

        if (!alive) {
          return;
        }

        setFeaturedProducts(response.items.slice(0, FEATURED_PRODUCTS_LIMIT));
      } catch (error) {
        if (!alive) {
          return;
        }

        setProductError(getErrorMessage(error, "Không thể tải sản phẩm nổi bật lúc này."));
        setFeaturedProducts([]);
      } finally {
        if (alive) {
          setLoadingProducts(false);
        }
      }
    };

    void loadFeaturedProducts();

    return () => {
      alive = false;
    };
  }, []);

  if (accessToken && role && role !== "CUSTOMER") {
    return <Navigate to={getDefaultRouteByRole(role)} replace />;
  }

  return (
    <Layout className="landing-page">
      <Layout.Header className="landing-page__header">
        <div className="landing-page__container landing-page__header-inner">
          <Link to={ROUTE_URL.HOME} className="landing-page__brand">
            <Avatar shape="square" size={38} className="landing-page__brand-mark">
              G90
            </Avatar>
            <div>
              <Typography.Title level={5} className="landing-page__brand-title">
                G90 Steel
              </Typography.Title>
              <Typography.Text className="landing-page__brand-subtitle">Vật tư thép công nghiệp</Typography.Text>
            </div>
          </Link>

          {screens.md ? (
            <Space size={24} className="landing-page__nav">
              <button type="button" className="landing-page__nav-link" onClick={() => handleScrollToSection("services")}>
                Dịch vụ
              </button>
              <button type="button" className="landing-page__nav-link" onClick={() => handleScrollToSection("featured-products")}>
                Sản phẩm
              </button>
              <button type="button" className="landing-page__nav-link" onClick={() => handleScrollToSection("company-contact")}>
                Liên hệ
              </button>
            </Space>
          ) : null}

          <Space wrap size={10}>
            {isCustomerSession ? (
              <>
                <Button onClick={() => navigate(ROUTE_URL.PRODUCT_LIST)}>Catalog</Button>
                <Button type="primary" icon={<ArrowRightOutlined />} onClick={() => navigate(ROUTE_URL.QUOTATION_LIST)}>
                  Báo giá
                </Button>
              </>
            ) : (
              <>
                <Button icon={<LoginOutlined />} onClick={() => navigate(ROUTE_URL.LOGIN)}>
                  Đăng nhập
                </Button>
                <Button type="primary" icon={<UserAddOutlined />} onClick={() => navigate(ROUTE_URL.REGISTER)}>
                  Đăng ký
                </Button>
              </>
            )}
          </Space>
        </div>
      </Layout.Header>

      <Layout.Content>
        <section className="landing-page__hero">
          <div className="landing-page__container">
            <Row gutter={[32, 28]} align="middle">
              <Col xs={24} lg={13}>
                <Space direction="vertical" size={18} className="landing-page__hero-copy">
                  <Typography.Text className="landing-page__section-eyebrow">G90 Steel</Typography.Text>
                  <Typography.Title level={1} className="landing-page__hero-title">
                    Catalog thép và báo giá gọn trong một hệ thống.
                  </Typography.Title>
                  <Typography.Paragraph className="landing-page__hero-description">
                    Xem sản phẩm, đăng ký tài khoản và gửi yêu cầu báo giá khi sẵn sàng.
                  </Typography.Paragraph>

                  <Space wrap size={12}>
                    {isCustomerSession ? (
                      <>
                        <Button type="primary" size="large" icon={<ArrowRightOutlined />} onClick={() => navigate(ROUTE_URL.QUOTATION_LIST)}>
                          Mở báo giá
                        </Button>
                        <Button size="large" onClick={() => navigate(ROUTE_URL.PRODUCT_LIST)}>
                          Xem catalog
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button type="primary" size="large" icon={<UserAddOutlined />} onClick={() => navigate(ROUTE_URL.REGISTER)}>
                          Tạo tài khoản
                        </Button>
                        <Button size="large" onClick={() => handleScrollToSection("featured-products")}>
                          Xem sản phẩm
                        </Button>
                      </>
                    )}
                  </Space>
                </Space>
              </Col>

              <Col xs={24} lg={11}>
                <Card className="landing-page__hero-panel" styles={{ body: { padding: 0 } }}>
                  <div className="landing-page__hero-visual">
                    {featuredHeroProduct?.mainImage ? (
                      <ProductImage
                        src={featuredHeroProduct.mainImage}
                        alt={featuredHeroProduct.productName}
                        preview={false}
                        fallback={<ProductDefaultVisual variant="hero" />}
                        style={{ height: 340, width: "100%", objectFit: "cover" }}
                      />
                    ) : (
                      <ProductDefaultVisual variant="hero" />
                    )}

                    <div className="landing-page__hero-product-meta">
                      <Typography.Text className="landing-page__section-eyebrow">Nổi bật</Typography.Text>
                      <Typography.Title level={4} className="landing-page__panel-title">
                        {featuredHeroProduct?.productName || "Danh mục đang cập nhật"}
                      </Typography.Title>
                      <Space wrap size={8}>
                        <Tag>{featuredHeroProduct?.type || "Catalog"}</Tag>
                        <Tag>{featuredHeroProduct?.size || "Quy cách"}</Tag>
                      </Space>
                    </div>
                  </div>

                  <div className="landing-page__hero-stats">
                    <div>
                      <Typography.Title level={4}>{loadingProducts ? "--" : featuredProducts.length}</Typography.Title>
                      <Typography.Text>Sản phẩm nổi bật</Typography.Text>
                    </div>
                    <div>
                      <Typography.Title level={4}>24/7</Typography.Title>
                      <Typography.Text>Catalog trực tuyến</Typography.Text>
                    </div>
                    <div>
                      <Typography.Title level={4}>3</Typography.Title>
                      <Typography.Text>Nhóm vận hành</Typography.Text>
                    </div>
                  </div>
                </Card>
              </Col>
            </Row>
          </div>
        </section>

        <section id="services" className="landing-page__section">
          <div className="landing-page__container">
            <Space direction="vertical" size={18} style={{ width: "100%" }}>
              <div className="landing-page__section-heading">
                <Typography.Text className="landing-page__section-eyebrow">Dịch vụ</Typography.Text>
                <Typography.Title level={2} className="landing-page__section-title">
                  Tập trung vào sản phẩm, báo giá và vận hành.
                </Typography.Title>
              </div>

              <Row gutter={[16, 16]}>
                {serviceItems.map((item) => (
                  <Col key={item.title} xs={24} md={8}>
                    <Card className="landing-page__service-card" styles={{ body: { padding: 20 } }}>
                      <Space direction="vertical" size={12}>
                        <Avatar size={40} className="landing-page__service-icon" icon={item.icon} />
                        <Typography.Title level={4} className="landing-page__service-title">
                          {item.title}
                        </Typography.Title>
                        <Typography.Paragraph className="landing-page__service-description">{item.description}</Typography.Paragraph>
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>
            </Space>
          </div>
        </section>

        <section id="featured-products" className="landing-page__section landing-page__section--products">
          <div className="landing-page__container">
            <Space direction="vertical" size={18} style={{ width: "100%" }}>
              <div className="landing-page__section-heading landing-page__section-heading--split">
                <div>
                  <Typography.Text className="landing-page__section-eyebrow">Sản phẩm</Typography.Text>
                  <Typography.Title level={2} className="landing-page__section-title">
                    Một số mã hàng mới nhất.
                  </Typography.Title>
                </div>

                <Button type="primary" icon={<ArrowRightOutlined />} onClick={() => navigate(ROUTE_URL.PRODUCT_LIST)}>
                  Xem tất cả
                </Button>
              </div>

              {productError ? <Alert type="warning" showIcon message="Không tải được sản phẩm" description={productError} /> : null}

              {loadingProducts ? (
                <Row gutter={[16, 16]}>
                  {Array.from({ length: FEATURED_PRODUCTS_LIMIT }).map((_, index) => (
                    <Col key={index} xs={24} md={12} xl={8}>
                      <Card className="landing-page__product-card">
                        <Skeleton active paragraph={{ rows: 3 }} />
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : null}

              {!loadingProducts && !productError && featuredProducts.length === 0 ? (
                <Alert type="info" showIcon message="Chưa có sản phẩm nổi bật" />
              ) : null}

              {!loadingProducts && !productError && featuredProducts.length > 0 ? (
                <Row gutter={[16, 16]}>
                  {featuredProducts.map((product) => (
                    <Col key={product.id} xs={24} md={12} xl={8}>
                      <Card
                        hoverable
                        className="landing-page__product-card"
                        cover={
                          product.mainImage ? (
                            <ProductImage
                              src={product.mainImage}
                              alt={product.productName}
                              preview={false}
                              fallback={<ProductDefaultVisual />}
                              style={{ height: 210, width: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <ProductDefaultVisual />
                          )
                        }
                        styles={{ body: { padding: 18 } }}
                      >
                        <Space direction="vertical" size={10} style={{ width: "100%" }}>
                          <div>
                            <Typography.Text type="secondary">Mã: {product.productCode || "Đang cập nhật"}</Typography.Text>
                            <Typography.Title level={4} className="landing-page__product-title" ellipsis={{ rows: 2 }}>
                              {product.productName || "Sản phẩm chưa đặt tên"}
                            </Typography.Title>
                          </div>

                          <Space wrap size={6}>
                            <Tag color="processing">{product.type || "Loại"}</Tag>
                            <Tag>{product.size || "Kích thước"}</Tag>
                            <Tag>{product.thickness || "Độ dày"}</Tag>
                          </Space>

                          <Button type="link" className="landing-page__product-link" onClick={() => navigate(ROUTE_URL.PRODUCT_DETAIL.replace(":id", product.id))}>
                            Chi tiết
                          </Button>
                        </Space>
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : null}
            </Space>
          </div>
        </section>

        <section className="landing-page__section">
          <div className="landing-page__container">
            <Card className="landing-page__cta-card" styles={{ body: { padding: 24 } }}>
              <Row gutter={[20, 20]} align="middle">
                <Col xs={24} lg={15}>
                  <Typography.Title level={2} className="landing-page__cta-title">
                    Sẵn sàng tạo báo giá?
                  </Typography.Title>
                  <Typography.Paragraph className="landing-page__cta-description">
                    Đăng ký tài khoản khách hàng hoặc đăng nhập để tiếp tục giao dịch.
                  </Typography.Paragraph>
                </Col>
                <Col xs={24} lg={9}>
                  <Space wrap size={10} className="landing-page__cta-actions">
                    {isCustomerSession ? (
                      <>
                        <Button type="primary" icon={<ArrowRightOutlined />} onClick={() => navigate(ROUTE_URL.QUOTATION_LIST)}>
                          Báo giá
                        </Button>
                        <Button onClick={() => navigate(ROUTE_URL.PRODUCT_LIST)}>Catalog</Button>
                      </>
                    ) : (
                      <>
                        <Button type="primary" icon={<UserAddOutlined />} onClick={() => navigate(ROUTE_URL.REGISTER)}>
                          Đăng ký
                        </Button>
                        <Button icon={<LoginOutlined />} onClick={() => navigate(ROUTE_URL.LOGIN)}>
                          Đăng nhập
                        </Button>
                      </>
                    )}
                  </Space>
                </Col>
              </Row>
            </Card>
          </div>
        </section>
      </Layout.Content>

      <Layout.Footer id="company-contact" className="landing-page__footer">
        <div className="landing-page__container">
          <Row gutter={[24, 20]} align="top">
            <Col xs={24} lg={10}>
              <Typography.Title level={4} className="landing-page__footer-title">
                G90 Steel
              </Typography.Title>
              <Typography.Paragraph className="landing-page__footer-description">
                Catalog và báo giá vật tư thép cho khách hàng doanh nghiệp.
              </Typography.Paragraph>
            </Col>

            <Col xs={24} lg={9}>
              <Space direction="vertical" size={10} style={{ width: "100%" }}>
                {companyContacts.map((item) => (
                  <div key={item.label} className="landing-page__contact-row">
                    <span className="landing-page__contact-icon">{item.icon}</span>
                    <div>
                      <Typography.Text type="secondary">{item.label}</Typography.Text>
                      <br />
                      {item.href ? <Typography.Link href={item.href}>{item.value}</Typography.Link> : <Typography.Text>{item.value}</Typography.Text>}
                    </div>
                  </div>
                ))}
              </Space>
            </Col>

            <Col xs={24} lg={5}>
              <Space direction="vertical" size={6}>
                <Button type="link" className="landing-page__footer-link" onClick={() => navigate(ROUTE_URL.PRODUCT_LIST)}>
                  Sản phẩm
                </Button>
                <Button type="link" className="landing-page__footer-link" onClick={() => navigate(ROUTE_URL.LOGIN)}>
                  Đăng nhập
                </Button>
                <Button type="link" className="landing-page__footer-link" onClick={() => navigate(ROUTE_URL.REGISTER)}>
                  Đăng ký
                </Button>
              </Space>
            </Col>
          </Row>
        </div>
      </Layout.Footer>
    </Layout>
  );
};

export default HomePage;
