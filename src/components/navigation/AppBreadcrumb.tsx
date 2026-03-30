import { Link, matchPath, useLocation } from "react-router-dom";
import { ROUTE_URL } from "../../const/route_url.const";

interface CrumbItem {
  label: string;
  to?: string;
}

interface BreadcrumbConfig {
  path: string;
  crumbs: CrumbItem[];
}

const BREADCRUMB_CONFIGS: BreadcrumbConfig[] = [
  { path: ROUTE_URL.DASHBOARD, crumbs: [{ label: "Trang chủ" }] },
  { path: ROUTE_URL.PROFILE, crumbs: [{ label: "Hồ sơ người dùng" }] },
  { path: ROUTE_URL.CHANGE_PASSWORD, crumbs: [{ label: "Đổi mật khẩu" }] },

  { path: ROUTE_URL.PRODUCT_LIST, crumbs: [{ label: "Sản phẩm" }] },
  {
    path: ROUTE_URL.PRODUCT_DETAIL,
    crumbs: [
      { label: "Sản phẩm", to: ROUTE_URL.PRODUCT_LIST },
      { label: "Chi tiết sản phẩm" },
    ],
  },

  { path: ROUTE_URL.QUOTATION_LIST, crumbs: [{ label: "Báo giá" }] },
  {
    path: ROUTE_URL.QUOTATION_CREATE,
    crumbs: [
      { label: "Báo giá", to: ROUTE_URL.QUOTATION_LIST },
      { label: "Tạo báo giá" },
    ],
  },
  {
    path: ROUTE_URL.QUOTATION_DETAIL,
    crumbs: [
      { label: "Báo giá", to: ROUTE_URL.QUOTATION_LIST },
      { label: "Chi tiết báo giá" },
    ],
  },

  { path: ROUTE_URL.CONTRACT_LIST, crumbs: [{ label: "Hợp đồng" }] },
  {
    path: ROUTE_URL.CONTRACT_CREATE,
    crumbs: [
      { label: "Hợp đồng", to: ROUTE_URL.CONTRACT_LIST },
      { label: "Tạo hợp đồng" },
    ],
  },
  {
    path: ROUTE_URL.CONTRACT_DETAIL,
    crumbs: [
      { label: "Hợp đồng", to: ROUTE_URL.CONTRACT_LIST },
      { label: "Chi tiết hợp đồng" },
    ],
  },
  {
    path: ROUTE_URL.CONTRACT_EDIT,
    crumbs: [
      { label: "Hợp đồng", to: ROUTE_URL.CONTRACT_LIST },
      { label: "Chỉnh sửa hợp đồng" },
    ],
  },
  {
    path: ROUTE_URL.CONTRACT_TRACKING,
    crumbs: [
      { label: "Hợp đồng", to: ROUTE_URL.CONTRACT_LIST },
      { label: "Theo dõi hợp đồng" },
    ],
  },

  { path: ROUTE_URL.CUSTOMER_LIST, crumbs: [{ label: "Khách hàng" }] },
  {
    path: ROUTE_URL.CUSTOMER_CREATE,
    crumbs: [
      { label: "Khách hàng", to: ROUTE_URL.CUSTOMER_LIST },
      { label: "Tạo khách hàng" },
    ],
  },
  {
    path: ROUTE_URL.CUSTOMER_DETAIL,
    crumbs: [
      { label: "Khách hàng", to: ROUTE_URL.CUSTOMER_LIST },
      { label: "Chi tiết khách hàng" },
    ],
  },
  {
    path: ROUTE_URL.CUSTOMER_EDIT,
    crumbs: [
      { label: "Khách hàng", to: ROUTE_URL.CUSTOMER_LIST },
      { label: "Chỉnh sửa khách hàng" },
    ],
  },

  { path: ROUTE_URL.PROJECT_LIST, crumbs: [{ label: "Dự án" }] },
  {
    path: ROUTE_URL.PROJECT_CREATE,
    crumbs: [
      { label: "Dự án", to: ROUTE_URL.PROJECT_LIST },
      { label: "Tạo dự án" },
    ],
  },
  {
    path: ROUTE_URL.PROJECT_DETAIL,
    crumbs: [
      { label: "Dự án", to: ROUTE_URL.PROJECT_LIST },
      { label: "Chi tiết dự án" },
    ],
  },
  {
    path: ROUTE_URL.PROJECT_EDIT,
    crumbs: [
      { label: "Dự án", to: ROUTE_URL.PROJECT_LIST },
      { label: "Chỉnh sửa dự án" },
    ],
  },
  {
    path: ROUTE_URL.PROJECT_ASSIGN_WAREHOUSE,
    crumbs: [
      { label: "Dự án", to: ROUTE_URL.PROJECT_LIST },
      { label: "Gán kho cho dự án" },
    ],
  },

  { path: ROUTE_URL.PAYMENT_LIST, crumbs: [{ label: "Thanh toán" }] },
  {
    path: ROUTE_URL.PAYMENT_DETAIL,
    crumbs: [
      { label: "Thanh toán", to: ROUTE_URL.PAYMENT_LIST },
      { label: "Chi tiết thanh toán" },
    ],
  },
  {
    path: ROUTE_URL.PAYMENT_RECORD,
    crumbs: [
      { label: "Thanh toán", to: ROUTE_URL.PAYMENT_LIST },
      { label: "Ghi nhận thanh toán" },
    ],
  },

  { path: ROUTE_URL.REPORT_DASHBOARD, crumbs: [{ label: "Báo cáo tổng quan" }] },
  { path: ROUTE_URL.REPORT_SALES, crumbs: [{ label: "Báo cáo doanh số" }] },
  { path: ROUTE_URL.REPORT_INVENTORY, crumbs: [{ label: "Báo cáo tồn kho" }] },
  { path: ROUTE_URL.REPORT_FINANCIAL, crumbs: [{ label: "Báo cáo tài chính" }] },
];

const getBreadcrumbsByPath = (pathname: string): CrumbItem[] => {
  const matched = BREADCRUMB_CONFIGS.find((config) => matchPath({ path: config.path, end: true }, pathname));
  if (matched) {
    return matched.crumbs;
  }

  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) {
    return [{ label: "Trang chủ", to: ROUTE_URL.DASHBOARD }];
  }

  let cumulativePath = "";
  return segments.map((segment, index) => {
    cumulativePath += `/${segment}`;
    const label = decodeURIComponent(segment).replace(/[-_]/g, " ");
    const isLast = index === segments.length - 1;

    return {
      label: label.charAt(0).toUpperCase() + label.slice(1),
      to: isLast ? undefined : cumulativePath,
    };
  });
};

const AppBreadcrumb = () => {
  const { pathname } = useLocation();
  const breadcrumbs = getBreadcrumbsByPath(pathname).filter(
    (crumb, index) => !(index === 0 && crumb.label === "Trang chủ" && !crumb.to),
  );

  return (
    <nav aria-label="Breadcrumb" className="mb-4 rounded-lg border border-slate-200 bg-white px-4 py-2">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        <li>
          <Link to={ROUTE_URL.DASHBOARD} className="text-slate-500 hover:text-blue-700">
            Trang chủ
          </Link>
        </li>
        {breadcrumbs.map((crumb, index) => {
          const isLast = index === breadcrumbs.length - 1;
          return (
            <li key={`${crumb.label}-${index}`} className="flex items-center gap-1.5">
              <span className="text-slate-300">/</span>
              {crumb.to && !isLast ? (
                <Link to={crumb.to} className="text-slate-500 hover:text-blue-700">
                  {crumb.label}
                </Link>
              ) : (
                <span className="font-medium text-slate-700">{crumb.label}</span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default AppBreadcrumb;
