import { HomeOutlined, RightOutlined } from "@ant-design/icons";
import { Breadcrumb, Space, Typography } from "antd";
import type { BreadcrumbProps } from "antd";
import { Link, matchPath, useLocation } from "react-router-dom";
import { ROUTE_URL } from "../../const/route_url.const";

export interface AppBreadcrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbConfig {
  path: string;
  title: string;
  subtitle?: string;
  breadcrumbs: AppBreadcrumbItem[];
}

interface PageContext {
  title: string;
  subtitle?: string;
  breadcrumbs: AppBreadcrumbItem[];
}

const BREADCRUMB_CONFIGS: BreadcrumbConfig[] = [
  { path: ROUTE_URL.DASHBOARD, title: "Tổng quan", breadcrumbs: [] },
  { path: ROUTE_URL.PROFILE, title: "Hồ sơ người dùng", breadcrumbs: [{ label: "Tài khoản" }, { label: "Hồ sơ" }] },
  {
    path: ROUTE_URL.CHANGE_PASSWORD,
    title: "Đổi mật khẩu",
    breadcrumbs: [{ label: "Tài khoản" }, { label: "Đổi mật khẩu" }],
  },
  { path: ROUTE_URL.ACCOUNT_LIST, title: "Quản lý tài khoản", breadcrumbs: [{ label: "Người dùng" }, { label: "Danh sách tài khoản" }] },
  { path: ROUTE_URL.PRODUCT_LIST, title: "Danh sách sản phẩm", breadcrumbs: [{ label: "Sản phẩm" }] },
  {
    path: ROUTE_URL.PRODUCT_CREATE,
    title: "Tạo sản phẩm",
    breadcrumbs: [{ label: "Sản phẩm", to: ROUTE_URL.PRODUCT_LIST }, { label: "Tạo mới" }],
  },
  {
    path: ROUTE_URL.PRODUCT_DETAIL,
    title: "Chi tiết sản phẩm",
    breadcrumbs: [{ label: "Sản phẩm", to: ROUTE_URL.PRODUCT_LIST }, { label: "Chi tiết" }],
  },
  {
    path: ROUTE_URL.PRODUCT_EDIT,
    title: "Cập nhật sản phẩm",
    breadcrumbs: [{ label: "Sản phẩm", to: ROUTE_URL.PRODUCT_LIST }, { label: "Chỉnh sửa" }],
  },
  { path: ROUTE_URL.PRICE_LIST_LIST, title: "Danh sách bảng giá", breadcrumbs: [{ label: "Bảng giá" }] },
  {
    path: ROUTE_URL.PRICE_LIST_CREATE,
    title: "Tạo bảng giá",
    breadcrumbs: [{ label: "Bảng giá", to: ROUTE_URL.PRICE_LIST_LIST }, { label: "Tạo mới" }],
  },
  {
    path: ROUTE_URL.PRICE_LIST_DETAIL,
    title: "Chi tiết bảng giá",
    breadcrumbs: [{ label: "Bảng giá", to: ROUTE_URL.PRICE_LIST_LIST }, { label: "Chi tiết" }],
  },
  { path: ROUTE_URL.QUOTATION_LIST, title: "Danh sách báo giá", breadcrumbs: [{ label: "Báo giá" }] },
  {
    path: ROUTE_URL.QUOTATION_CREATE,
    title: "Tạo báo giá",
    breadcrumbs: [{ label: "Báo giá", to: ROUTE_URL.QUOTATION_LIST }, { label: "Tạo mới" }],
  },
  {
    path: ROUTE_URL.QUOTATION_DETAIL,
    title: "Chi tiết báo giá",
    breadcrumbs: [{ label: "Báo giá", to: ROUTE_URL.QUOTATION_LIST }, { label: "Chi tiết" }],
  },
  { path: ROUTE_URL.PROMOTION_LIST, title: "Danh sách khuyến mãi", breadcrumbs: [{ label: "Khuyến mãi" }] },
  {
    path: ROUTE_URL.PROMOTION_CREATE,
    title: "Tạo khuyến mãi",
    breadcrumbs: [{ label: "Khuyến mãi", to: ROUTE_URL.PROMOTION_LIST }, { label: "Tạo mới" }],
  },
  {
    path: ROUTE_URL.PROMOTION_DETAIL,
    title: "Chi tiết khuyến mãi",
    breadcrumbs: [{ label: "Khuyến mãi", to: ROUTE_URL.PROMOTION_LIST }, { label: "Chi tiết" }],
  },
  { path: ROUTE_URL.CONTRACT_LIST, title: "Danh sách hợp đồng", breadcrumbs: [{ label: "Hợp đồng" }] },
  {
    path: ROUTE_URL.CONTRACT_CREATE,
    title: "Tạo hợp đồng",
    breadcrumbs: [{ label: "Hợp đồng", to: ROUTE_URL.CONTRACT_LIST }, { label: "Tạo mới" }],
  },
  {
    path: ROUTE_URL.CONTRACT_DETAIL,
    title: "Chi tiết hợp đồng",
    breadcrumbs: [{ label: "Hợp đồng", to: ROUTE_URL.CONTRACT_LIST }, { label: "Chi tiết" }],
  },
  {
    path: ROUTE_URL.CONTRACT_EDIT,
    title: "Chỉnh sửa hợp đồng",
    breadcrumbs: [{ label: "Hợp đồng", to: ROUTE_URL.CONTRACT_LIST }, { label: "Chỉnh sửa" }],
  },
  {
    path: ROUTE_URL.CONTRACT_TRACKING,
    title: "Theo dõi hợp đồng",
    breadcrumbs: [{ label: "Hợp đồng", to: ROUTE_URL.CONTRACT_LIST }, { label: "Theo dõi" }],
  },
  {
    path: ROUTE_URL.CONTRACT_APPROVAL_LIST,
    title: "Danh sách phê duyệt hợp đồng",
    breadcrumbs: [{ label: "Phê duyệt" }, { label: "Hợp đồng chờ duyệt" }],
  },
  {
    path: ROUTE_URL.CONTRACT_APPROVAL_DETAIL,
    title: "Chi tiết yêu cầu phê duyệt",
    breadcrumbs: [
      { label: "Phê duyệt", to: ROUTE_URL.CONTRACT_APPROVAL_LIST },
      { label: "Chi tiết hợp đồng" },
    ],
  },
  { path: ROUTE_URL.CUSTOMER_LIST, title: "Danh sách khách hàng", breadcrumbs: [{ label: "Khách hàng" }] },
  {
    path: ROUTE_URL.CUSTOMER_CREATE,
    title: "Tạo khách hàng",
    breadcrumbs: [{ label: "Khách hàng", to: ROUTE_URL.CUSTOMER_LIST }, { label: "Tạo mới" }],
  },
  {
    path: ROUTE_URL.CUSTOMER_DETAIL,
    title: "Chi tiết khách hàng",
    breadcrumbs: [{ label: "Khách hàng", to: ROUTE_URL.CUSTOMER_LIST }, { label: "Chi tiết" }],
  },
  {
    path: ROUTE_URL.CUSTOMER_EDIT,
    title: "Chỉnh sửa khách hàng",
    breadcrumbs: [{ label: "Khách hàng", to: ROUTE_URL.CUSTOMER_LIST }, { label: "Chỉnh sửa" }],
  },
  { path: ROUTE_URL.PROJECT_LIST, title: "Danh sách dự án", breadcrumbs: [{ label: "Dự án" }] },
  {
    path: ROUTE_URL.PROJECT_CREATE,
    title: "Tạo dự án",
    breadcrumbs: [{ label: "Dự án", to: ROUTE_URL.PROJECT_LIST }, { label: "Tạo mới" }],
  },
  {
    path: ROUTE_URL.PROJECT_DETAIL,
    title: "Chi tiết dự án",
    breadcrumbs: [{ label: "Dự án", to: ROUTE_URL.PROJECT_LIST }, { label: "Chi tiết" }],
  },
  {
    path: ROUTE_URL.PROJECT_EDIT,
    title: "Chỉnh sửa dự án",
    breadcrumbs: [{ label: "Dự án", to: ROUTE_URL.PROJECT_LIST }, { label: "Chỉnh sửa" }],
  },
  {
    path: ROUTE_URL.PROJECT_ASSIGN_WAREHOUSE,
    title: "Gán kho cho dự án",
    breadcrumbs: [{ label: "Dự án", to: ROUTE_URL.PROJECT_LIST }, { label: "Gán kho" }],
  },
  {
    path: ROUTE_URL.PROJECT_PROGRESS_UPDATE,
    title: "Cập nhật tiến độ dự án",
    breadcrumbs: [{ label: "Dự án", to: ROUTE_URL.PROJECT_LIST }, { label: "Cập nhật tiến độ" }],
  },
  {
    path: ROUTE_URL.PROJECT_FINANCIAL_SUMMARY,
    title: "Thống kê tài chính dự án",
    breadcrumbs: [{ label: "Dự án", to: ROUTE_URL.PROJECT_LIST }, { label: "Tài chính" }],
  },
  { path: ROUTE_URL.PAYMENT_LIST, title: "Danh sách thanh toán", breadcrumbs: [{ label: "Công nợ" }] },
  {
    path: ROUTE_URL.PAYMENT_DETAIL,
    title: "Chi tiết thanh toán",
    breadcrumbs: [{ label: "Công nợ", to: ROUTE_URL.PAYMENT_LIST }, { label: "Chi tiết" }],
  },
  {
    path: ROUTE_URL.PAYMENT_RECORD,
    title: "Ghi nhận thanh toán",
    breadcrumbs: [{ label: "Công nợ", to: ROUTE_URL.PAYMENT_LIST }, { label: "Ghi nhận" }],
  },
  { path: ROUTE_URL.INVENTORY_STATUS, title: "Tồn kho hiện tại", breadcrumbs: [{ label: "Kho vận" }, { label: "Tồn kho" }] },
  {
    path: ROUTE_URL.INVENTORY_RECEIPT_CREATE,
    title: "Tạo phiếu nhập kho",
    breadcrumbs: [{ label: "Kho vận", to: ROUTE_URL.INVENTORY_STATUS }, { label: "Nhập kho" }],
  },
  {
    path: ROUTE_URL.INVENTORY_ISSUE_CREATE,
    title: "Tạo phiếu xuất kho",
    breadcrumbs: [{ label: "Kho vận", to: ROUTE_URL.INVENTORY_STATUS }, { label: "Xuất kho" }],
  },
  {
    path: ROUTE_URL.INVENTORY_ADJUSTMENT_CREATE,
    title: "Điều chỉnh tồn kho",
    breadcrumbs: [{ label: "Kho vận", to: ROUTE_URL.INVENTORY_STATUS }, { label: "Điều chỉnh" }],
  },
  {
    path: ROUTE_URL.INVENTORY_HISTORY,
    title: "Lịch sử kho",
    breadcrumbs: [{ label: "Kho vận", to: ROUTE_URL.INVENTORY_STATUS }, { label: "Lịch sử" }],
  },
  { path: ROUTE_URL.REPORT_DASHBOARD, title: "Báo cáo tổng quan", breadcrumbs: [{ label: "Báo cáo" }, { label: "Tổng quan" }] },
  { path: ROUTE_URL.REPORT_SALES, title: "Báo cáo doanh số", breadcrumbs: [{ label: "Báo cáo" }, { label: "Doanh số" }] },
  { path: ROUTE_URL.REPORT_PROJECT, title: "Báo cáo dự án", breadcrumbs: [{ label: "Báo cáo" }, { label: "Dự án" }] },
  { path: ROUTE_URL.REPORT_INVENTORY, title: "Báo cáo tồn kho", breadcrumbs: [{ label: "Báo cáo" }, { label: "Tồn kho" }] },
  { path: ROUTE_URL.REPORT_FINANCIAL, title: "Báo cáo tài chính", breadcrumbs: [{ label: "Báo cáo" }, { label: "Tài chính" }] },
  { path: ROUTE_URL.REPORT_EXPORT, title: "Xuất dữ liệu báo cáo", breadcrumbs: [{ label: "Báo cáo" }, { label: "Xuất dữ liệu" }] },
];

const SEGMENT_LABELS: Record<string, string> = {
  accounts: "Tài khoản",
  products: "Sản phẩm",
  "price-lists": "Bảng giá",
  quotations: "Báo giá",
  promotions: "Khuyến mãi",
  contracts: "Hợp đồng",
  approvals: "Phê duyệt",
  customers: "Khách hàng",
  projects: "Dự án",
  payments: "Công nợ",
  inventory: "Kho vận",
  reports: "Báo cáo",
  create: "Tạo mới",
  edit: "Chỉnh sửa",
  detail: "Chi tiết",
};

const humanizeSegment = (segment: string) => {
  const normalizedSegment = segment.trim().toLowerCase();
  if (SEGMENT_LABELS[normalizedSegment]) {
    return SEGMENT_LABELS[normalizedSegment];
  }

  if (/^[a-f0-9-]{8,}$/i.test(segment)) {
    return "Chi tiết";
  }

  return segment
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const getMatchedConfig = (pathname: string) =>
  BREADCRUMB_CONFIGS.find((config) => matchPath({ path: config.path, end: true }, pathname));

const getFallbackBreadcrumbs = (pathname: string): AppBreadcrumbItem[] => {
  const segments = pathname.split("/").filter(Boolean);
  let cumulativePath = "";

  return segments.map((segment, index) => {
    cumulativePath += `/${segment}`;
    const isLast = index === segments.length - 1;

    return {
      label: humanizeSegment(segment),
      to: isLast ? undefined : cumulativePath,
    };
  });
};

export const getPageContextByPath = (pathname: string): PageContext => {
  const matchedConfig = getMatchedConfig(pathname);

  if (matchedConfig) {
    return {
      title: matchedConfig.title,
      subtitle: matchedConfig.subtitle,
      breadcrumbs: matchedConfig.breadcrumbs,
    };
  }

  const fallbackBreadcrumbs = getFallbackBreadcrumbs(pathname);
  const fallbackTitle = fallbackBreadcrumbs[fallbackBreadcrumbs.length - 1]?.label ?? "Không gian làm việc";

  return {
    title: fallbackTitle,
    breadcrumbs: fallbackBreadcrumbs,
  };
};

const AppBreadcrumb = () => {
  const { pathname } = useLocation();
  const pageContext = getPageContextByPath(pathname);

  const breadcrumbItems: BreadcrumbProps["items"] = [
    {
      key: "home",
      title: (
        <Link to={ROUTE_URL.DASHBOARD} className="app-breadcrumb__home-link">
          <Space size={4}>
            <HomeOutlined />
            <span>Trang chủ</span>
          </Space>
        </Link>
      ),
    },
    ...pageContext.breadcrumbs.map((item, index) => ({
      key: `crumb-${index}-${item.label}`,
      title: item.to ? (
        <Link to={item.to} className="app-breadcrumb__link">
          {item.label}
        </Link>
      ) : (
        <Typography.Text className="app-breadcrumb__current">{item.label}</Typography.Text>
      ),
    })),
  ];

  return (
    <Breadcrumb
      items={breadcrumbItems}
      separator={<RightOutlined style={{ fontSize: 10, color: "#94a3b8" }} />}
      className="app-breadcrumb"
    />
  );
};

export default AppBreadcrumb;
