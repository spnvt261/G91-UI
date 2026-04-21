import {
  ArrowRightOutlined,
  CheckCircleOutlined,
  EnvironmentOutlined,
  FacebookFilled,
  GlobalOutlined,
  LinkedinFilled,
  LoginOutlined,
  MailOutlined,
  PhoneOutlined,
  ShoppingOutlined,
  SolutionOutlined,
  UserAddOutlined,
} from "@ant-design/icons";
import { Alert, Avatar, Button, Card, Col, Grid, Layout, Row, Skeleton, Space, Tag, Typography } from "antd";
import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { getDefaultRouteByRole } from "../../const/authz.const";
import { ROUTE_URL } from "../../const/route_url.const";
import type { ProductModel } from "../../models/product/product.model";
import ProductImage from "../products/components/ProductImage";
import { getErrorMessage } from "../shared/page.utils";
import { productService } from "../../services/product/product.service";
import { getStoredAccessToken, getStoredUserRole } from "../../utils/authSession";

const FEATURED_PRODUCTS_LIMIT = 6;

const serviceItems = [
  {
    icon: <ShoppingOutlined />,
    title: "Danh mục sản phẩm trực quan",
    description: "Khách truy cập có thể xem nhanh vật tư, quy cách và hình ảnh sản phẩm nổi bật ngay từ trang chủ.",
  },
  {
    icon: <SolutionOutlined />,
    title: "Yêu cầu báo giá theo nhu cầu",
    description: "Khách hàng doanh nghiệp đăng nhập để chuyển tiếp sang luồng báo giá, hợp đồng và đơn hàng một cách liền mạch.",
  },
  {
    icon: <CheckCircleOutlined />,
    title: "Quy trình làm việc rõ ràng",
    description: "Thông tin được tổ chức theo từng bước giúp đội kinh doanh, kho và kế toán phối hợp nhất quán trên cùng hệ thống.",
  },
];

const operatingHighlights = [
  "Guest có thể vào trang chủ, xem sản phẩm nổi bật và điều hướng sang đăng ký hoặc đăng nhập.",
  "Customer có thể quay lại landing page để xem nhanh danh mục, sau đó đi thẳng sang nghiệp vụ báo giá.",
  "Kiến trúc page độc lập với sidebar nội bộ, phù hợp cho trải nghiệm giới thiệu dịch vụ bên ngoài.",
];

const companyContacts = [
  {
    icon: <EnvironmentOutlined />,
    label: "Địa chỉ",
    value: "Văn phòng điều hành G90 Steel, TP. Hồ Chí Minh, Việt Nam",
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

const HomePage = () => {
  const navigate = useNavigate();
  const screens = Grid.useBreakpoint();
  const accessToken = getStoredAccessToken();
  const role = getStoredUserRole();
  const isCustomerSession = Boolean(accessToken && role === "CUSTOMER");

  const [featuredProducts, setFeaturedProducts] = useState<ProductModel[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [productError, setProductError] = useState<string | null>(null);

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

        setProductError(getErrorMessage(error, "Không thể tải sản phẩm nổi bật ở thời điểm hiện tại."));
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
            <Avatar shape="square" size={40} className="landing-page__brand-mark">
              G90
            </Avatar>
            <div>
              <Typography.Title level={5} className="landing-page__brand-title">
                G90 Steel
              </Typography.Title>
              <Typography.Text className="landing-page__brand-subtitle">
                Hệ thống điều hành và bán hàng vật tư
              </Typography.Text>
            </div>
          </Link>

          {screens.md ? (
            <Space size={24} className="landing-page__nav">
              <a href="#services">Dịch vụ</a>
              <a href="#featured-products">Sản phẩm nổi bật</a>
              <a href="#company-contact">Liên hệ</a>
            </Space>
          ) : null}

          <Space wrap size={12}>
            {isCustomerSession ? (
              <>
                <Button onClick={() => navigate(ROUTE_URL.PRODUCT_LIST)}>Danh mục sản phẩm</Button>
                <Button type="primary" icon={<ArrowRightOutlined />} onClick={() => navigate(ROUTE_URL.QUOTATION_LIST)}>
                  Đi đến báo giá
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
            <Row gutter={[32, 32]} align="middle">
              <Col xs={24} xl={14}>
                <Space direction="vertical" size={20} className="landing-page__hero-copy">
                  <Space wrap>
                    <Tag color="blue">Guest</Tag>
                    <Tag color="gold">Customer</Tag>
                    <Tag color="cyan">Ant Design UI</Tag>
                  </Space>

                  <Typography.Title level={1} className="landing-page__hero-title">
                    Nền tảng giới thiệu dịch vụ và điều hướng giao dịch cho khách hàng thép doanh nghiệp.
                  </Typography.Title>

                  <Typography.Paragraph className="landing-page__hero-description">
                    Trang chủ được thiết kế như một landing page chuyên nghiệp để giới thiệu năng lực hệ thống, nêu bật sản phẩm tiêu biểu,
                    đồng thời điều hướng khách truy cập sang đăng ký, đăng nhập hoặc tiếp tục luồng báo giá.
                  </Typography.Paragraph>

                  <Space wrap size={12}>
                    {isCustomerSession ? (
                      <>
                        <Button type="primary" size="large" icon={<ArrowRightOutlined />} onClick={() => navigate(ROUTE_URL.QUOTATION_LIST)}>
                          Xem danh sách báo giá
                        </Button>
                        <Button size="large" onClick={() => navigate(ROUTE_URL.PRODUCT_LIST)}>
                          Khám phá catalog
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button type="primary" size="large" icon={<UserAddOutlined />} onClick={() => navigate(ROUTE_URL.REGISTER)}>
                          Tạo tài khoản khách hàng
                        </Button>
                        <Button size="large" icon={<LoginOutlined />} onClick={() => navigate(ROUTE_URL.LOGIN)}>
                          Tôi đã có tài khoản
                        </Button>
                      </>
                    )}
                  </Space>

                  <Row gutter={[12, 12]}>
                    <Col xs={24} md={8}>
                      <Card bordered={false} className="landing-page__metric-card">
                        <Typography.Text type="secondary">Quyền truy cập</Typography.Text>
                        <Typography.Title level={4}>Guest / Customer</Typography.Title>
                      </Card>
                    </Col>
                    <Col xs={24} md={8}>
                      <Card bordered={false} className="landing-page__metric-card">
                        <Typography.Text type="secondary">Mục tiêu</Typography.Text>
                        <Typography.Title level={4}>Giới thiệu dịch vụ</Typography.Title>
                      </Card>
                    </Col>
                    <Col xs={24} md={8}>
                      <Card bordered={false} className="landing-page__metric-card">
                        <Typography.Text type="secondary">Điều hướng</Typography.Text>
                        <Typography.Title level={4}>Đăng ký / Đăng nhập</Typography.Title>
                      </Card>
                    </Col>
                  </Row>
                </Space>
              </Col>

              <Col xs={24} xl={10}>
                <Card className="landing-page__hero-panel" styles={{ body: { padding: 24 } }}>
                  <Space direction="vertical" size={18} style={{ width: "100%" }}>
                    <div>
                      <Typography.Text className="landing-page__section-eyebrow">Tổng quan vận hành</Typography.Text>
                      <Typography.Title level={3} className="landing-page__panel-title">
                        Một điểm chạm thống nhất cho khách truy cập và khách hàng đang giao dịch
                      </Typography.Title>
                    </div>

                    <Space direction="vertical" size={12} style={{ width: "100%" }}>
                      {serviceItems.map((item) => (
                        <div key={item.title} className="landing-page__feature-row">
                          <Avatar size={44} className="landing-page__feature-icon" icon={item.icon} />
                          <div>
                            <Typography.Title level={5} className="landing-page__feature-title">
                              {item.title}
                            </Typography.Title>
                            <Typography.Paragraph className="landing-page__feature-description">
                              {item.description}
                            </Typography.Paragraph>
                          </div>
                        </div>
                      ))}
                    </Space>
                  </Space>
                </Card>
              </Col>
            </Row>
          </div>
        </section>

        <section id="services" className="landing-page__section">
          <div className="landing-page__container">
            <Space direction="vertical" size={20} style={{ width: "100%" }}>
              <div className="landing-page__section-heading">
                <Typography.Text className="landing-page__section-eyebrow">Dịch vụ hệ thống cung cấp</Typography.Text>
                <Typography.Title level={2} className="landing-page__section-title">
                  Trang chủ đóng vai trò như một cửa ngõ thương mại rõ ràng, hiện đại và đúng ngữ cảnh nghiệp vụ
                </Typography.Title>
                <Typography.Paragraph className="landing-page__section-description">
                  Nội dung được tổ chức để khách mới hiểu nhanh dịch vụ, còn khách hàng đã có tài khoản có thể tiếp tục hành trình làm việc mà
                  không phải đi qua các màn hình nội bộ.
                </Typography.Paragraph>
              </div>

              <Row gutter={[20, 20]}>
                {serviceItems.map((item) => (
                  <Col key={item.title} xs={24} md={8}>
                    <Card className="landing-page__service-card" styles={{ body: { padding: 24 } }}>
                      <Space direction="vertical" size={14}>
                        <Avatar size={52} className="landing-page__service-icon" icon={item.icon} />
                        <Typography.Title level={4} className="landing-page__service-title">
                          {item.title}
                        </Typography.Title>
                        <Typography.Paragraph className="landing-page__service-description">
                          {item.description}
                        </Typography.Paragraph>
                      </Space>
                    </Card>
                  </Col>
                ))}
              </Row>

              <Card className="landing-page__workflow-card" styles={{ body: { padding: 24 } }}>
                <Row gutter={[24, 16]}>
                  <Col xs={24} lg={8}>
                    <Typography.Title level={4} className="landing-page__workflow-title">
                      Điểm nhấn triển khai
                    </Typography.Title>
                    <Typography.Paragraph className="landing-page__workflow-description">
                      Landing page được đặt ở đầu hệ thống để phục vụ giới thiệu, còn phần nghiệp vụ sâu vẫn giữ nguyên trong các màn hình antd hiện có.
                    </Typography.Paragraph>
                  </Col>
                  <Col xs={24} lg={16}>
                    <Space direction="vertical" size={12} style={{ width: "100%" }}>
                      {operatingHighlights.map((item) => (
                        <div key={item} className="landing-page__workflow-item">
                          <CheckCircleOutlined />
                          <Typography.Text>{item}</Typography.Text>
                        </div>
                      ))}
                    </Space>
                  </Col>
                </Row>
              </Card>
            </Space>
          </div>
        </section>

        <section id="featured-products" className="landing-page__section landing-page__section--products">
          <div className="landing-page__container">
            <Space direction="vertical" size={20} style={{ width: "100%" }}>
              <div className="landing-page__section-heading landing-page__section-heading--split">
                <div>
                  <Typography.Text className="landing-page__section-eyebrow">Sản phẩm nổi bật</Typography.Text>
                  <Typography.Title level={2} className="landing-page__section-title">
                    Một số mã hàng đang được đưa lên trang chủ để khách hàng xem nhanh
                  </Typography.Title>
                  <Typography.Paragraph className="landing-page__section-description">
                    Frontend hiện lấy danh sách sản phẩm theo cơ chế không cần token cho guest để phục vụ trải nghiệm landing page trong giai đoạn hiện tại.
                  </Typography.Paragraph>
                </div>

                <Button type="primary" icon={<ArrowRightOutlined />} onClick={() => navigate(ROUTE_URL.PRODUCT_LIST)}>
                  Xem toàn bộ sản phẩm
                </Button>
              </div>

              {productError ? (
                <Alert
                  type="warning"
                  showIcon
                  message="Không tải được sản phẩm nổi bật"
                  description={productError}
                />
              ) : null}

              {loadingProducts ? (
                <Row gutter={[20, 20]}>
                  {Array.from({ length: FEATURED_PRODUCTS_LIMIT }).map((_, index) => (
                    <Col key={index} xs={24} md={12} xl={8}>
                      <Card className="landing-page__product-card">
                        <Skeleton active paragraph={{ rows: 4 }} />
                      </Card>
                    </Col>
                  ))}
                </Row>
              ) : null}

              {!loadingProducts && !productError ? (
                <Row gutter={[20, 20]}>
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
                              style={{ height: 228, width: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <div className="landing-page__product-placeholder">
                              <ShoppingOutlined />
                            </div>
                          )
                        }
                        styles={{ body: { padding: 20 } }}
                      >
                        <Space direction="vertical" size={12} style={{ width: "100%" }}>
                          <div>
                            <Typography.Text type="secondary">Mã: {product.productCode || "Đang cập nhật"}</Typography.Text>
                            <Typography.Title level={4} className="landing-page__product-title">
                              {product.productName || "Sản phẩm chưa đặt tên"}
                            </Typography.Title>
                          </div>

                          <Space wrap>
                            <Tag color="processing">{product.type || "Loại sản phẩm"}</Tag>
                            <Tag>{product.size || "Kích thước"}</Tag>
                            <Tag>{product.thickness || "Độ dày"}</Tag>
                          </Space>

                          <Typography.Paragraph ellipsis={{ rows: 2 }} className="landing-page__product-description">
                            {product.description || `Đơn vị tính: ${product.unit || "Đang cập nhật"}.`}
                          </Typography.Paragraph>

                          <Button type="link" className="landing-page__product-link" onClick={() => navigate(ROUTE_URL.PRODUCT_DETAIL.replace(":id", product.id))}>
                            Xem chi tiết
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
            <Card className="landing-page__cta-card" styles={{ body: { padding: 28 } }}>
              <Row gutter={[24, 24]} align="middle">
                <Col xs={24} lg={15}>
                  <Typography.Text className="landing-page__section-eyebrow">Sẵn sàng bắt đầu</Typography.Text>
                  <Typography.Title level={2} className="landing-page__cta-title">
                    Điều hướng khách truy cập sang đúng bước tiếp theo ngay trên trang chủ
                  </Typography.Title>
                  <Typography.Paragraph className="landing-page__cta-description">
                    Người dùng mới có thể tạo tài khoản để tiếp cận luồng giao dịch. Khách hàng hiện hữu có thể đăng nhập và tiếp tục xử lý báo giá,
                    hợp đồng hoặc các tác vụ liên quan.
                  </Typography.Paragraph>
                </Col>
                <Col xs={24} lg={9}>
                  <Space direction="vertical" size={12} style={{ width: "100%" }}>
                    {isCustomerSession ? (
                      <>
                        <Button type="primary" size="large" block icon={<ArrowRightOutlined />} onClick={() => navigate(ROUTE_URL.QUOTATION_LIST)}>
                          Mở không gian khách hàng
                        </Button>
                        <Button size="large" block onClick={() => navigate(ROUTE_URL.PRODUCT_LIST)}>
                          Xem danh mục sản phẩm
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button type="primary" size="large" block icon={<UserAddOutlined />} onClick={() => navigate(ROUTE_URL.REGISTER)}>
                          Đăng ký tài khoản
                        </Button>
                        <Button size="large" block icon={<LoginOutlined />} onClick={() => navigate(ROUTE_URL.LOGIN)}>
                          Đăng nhập hệ thống
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
          <Row gutter={[24, 24]}>
            <Col xs={24} lg={10}>
              <Space direction="vertical" size={12}>
                <Typography.Title level={4} className="landing-page__footer-title">
                  G90 Steel
                </Typography.Title>
                <Typography.Paragraph className="landing-page__footer-description">
                  Không gian giới thiệu dịch vụ, danh mục sản phẩm và điều hướng giao dịch dành cho khách truy cập và khách hàng doanh nghiệp.
                </Typography.Paragraph>
                <Space wrap>
                  <Tag icon={<FacebookFilled />} color="blue">
                    Facebook
                  </Tag>
                  <Tag icon={<LinkedinFilled />} color="geekblue">
                    LinkedIn
                  </Tag>
                  <Tag icon={<GlobalOutlined />} color="cyan">
                    Website
                  </Tag>
                </Space>
              </Space>
            </Col>

            <Col xs={24} lg={8}>
              <Space direction="vertical" size={12} style={{ width: "100%" }}>
                <Typography.Title level={5} className="landing-page__footer-subtitle">
                  Thông tin liên hệ
                </Typography.Title>
                {companyContacts.map((item) => (
                  <div key={item.label} className="landing-page__contact-row">
                    <span className="landing-page__contact-icon">{item.icon}</span>
                    <div>
                      <Typography.Text type="secondary">{item.label}</Typography.Text>
                      <br />
                      {item.href ? (
                        <Typography.Link href={item.href}>{item.value}</Typography.Link>
                      ) : (
                        <Typography.Text>{item.value}</Typography.Text>
                      )}
                    </div>
                  </div>
                ))}
              </Space>
            </Col>

            <Col xs={24} lg={6}>
              <Space direction="vertical" size={12}>
                <Typography.Title level={5} className="landing-page__footer-subtitle">
                  Điều hướng nhanh
                </Typography.Title>
                <Button type="link" className="landing-page__footer-link" onClick={() => navigate(ROUTE_URL.PRODUCT_LIST)}>
                  Danh mục sản phẩm
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
