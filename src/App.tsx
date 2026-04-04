import "./App.css";
import { useEffect } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import { canAccessPathByRole, getDefaultRouteByRole } from "./const/authz.const";
import { ROUTE_URL } from "./const/route_url.const";
import NotFoundPage from "./pages/404/NotFound.Page";
import AccountListPage from "./pages/accounts/AccountListPage";
import ContractApprovalDetailPage from "./pages/approvals/ContractApprovalDetailPage";
import ContractApprovalListPage from "./pages/approvals/ContractApprovalListPage";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import VerifyRegistrationPage from "./pages/auth/VerifyRegistrationPage";
import ContractCreatePage from "./pages/contracts/ContractCreatePage";
import ContractDetailPage from "./pages/contracts/ContractDetailPage";
import ContractEditPage from "./pages/contracts/ContractEditPage";
import ContractListPage from "./pages/contracts/ContractListPage";
import ContractTrackingPage from "./pages/contracts/ContractTrackingPage";
import CustomerCreatePage from "./pages/customers/CustomerCreatePage";
import CustomerDetailPage from "./pages/customers/CustomerDetailPage";
import CustomerEditPage from "./pages/customers/CustomerEditPage";
import CustomerListPage from "./pages/customers/CustomerListPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import InventoryAdjustmentCreatePage from "./pages/inventory/InventoryAdjustmentCreatePage";
import InventoryHistoryPage from "./pages/inventory/InventoryHistoryPage";
import InventoryIssueCreatePage from "./pages/inventory/InventoryIssueCreatePage";
import InventoryReceiptCreatePage from "./pages/inventory/InventoryReceiptCreatePage";
import InventoryStatusPage from "./pages/inventory/InventoryStatusPage";
import InvoiceCreatePage from "./pages/invoices/InvoiceCreatePage";
import InvoiceDetailPage from "./pages/invoices/InvoiceDetailPage";
import InvoiceEditPage from "./pages/invoices/InvoiceEditPage";
import InvoiceListPage from "./pages/invoices/InvoiceListPage";
import DebtDetailPage from "./pages/debts/DebtDetailPage";
import DebtListPage from "./pages/debts/DebtListPage";
import PaymentDetailPage from "./pages/payments/PaymentDetailPage";
import PaymentListPage from "./pages/payments/PaymentListPage";
import RecordPaymentPage from "./pages/payments/RecordPaymentPage";
import PriceListCreatePage from "./pages/pricing/PriceListCreatePage";
import PriceListDetailPage from "./pages/pricing/PriceListDetailPage";
import PriceListListPage from "./pages/pricing/PriceListListPage";
import PromotionCreatePage from "./pages/promotions/PromotionCreatePage";
import PromotionDetailPage from "./pages/promotions/PromotionDetailPage";
import PromotionListPage from "./pages/promotions/PromotionListPage";
import ProductCreatePage from "./pages/products/ProductCreatePage";
import ProductDetailPage from "./pages/products/ProductDetailPage";
import ProductEditPage from "./pages/products/ProductEditPage";
import ProductListPage from "./pages/products/ProductListPage";
import ChangePasswordPage from "./pages/profile/ChangePasswordPage";
import UserProfilePage from "./pages/profile/UserProfilePage";
import ProjectAssignWarehousePage from "./pages/projects/ProjectAssignWarehousePage";
import ProjectCreatePage from "./pages/projects/ProjectCreatePage";
import ProjectDetailPage from "./pages/projects/ProjectDetailPage";
import ProjectEditPage from "./pages/projects/ProjectEditPage";
import ProjectFinancialSummaryPage from "./pages/projects/ProjectFinancialSummaryPage";
import ProjectListPage from "./pages/projects/ProjectListPage";
import ProjectProgressUpdatePage from "./pages/projects/ProjectProgressUpdatePage";
import QuotationCreatePage from "./pages/quotations/QuotationCreatePage";
import QuotationDetailPage from "./pages/quotations/QuotationDetailPage";
import QuotationListPage from "./pages/quotations/QuotationListPage";
import ExportReportPage from "./pages/reports/ExportReportPage";
import FinancialReportPage from "./pages/reports/FinancialReportPage";
import InventoryReportPage from "./pages/reports/InventoryReportPage";
import ProjectReportPage from "./pages/reports/ProjectReportPage";
import SalesReportPage from "./pages/reports/SalesReportPage";
import { authService } from "./services/auth/auth.service";
import type { AppDispatch, RootState } from "./store";
import { loginSuccess, logout as logoutAction } from "./store/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { clearAuthSession, getStoredAccessToken, getStoredUserRole, persistAuthSession } from "./utils/authSession";
import Loading from "./components/loading/Loading";

const AppAuthenticatedLayout = () => {
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const token = getStoredAccessToken();
  const role = getStoredUserRole();
  const currentUser = useSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    if (!token || !role || currentUser) {
      return;
    }

    let alive = true;

    const hydrateUser = async () => {
      try {
        const profile = await authService.getProfile();
        if (!alive) {
          return;
        }

        dispatch(
          loginSuccess({
            accessToken: token,
            user: profile,
          }),
        );
        persistAuthSession(token, profile.role);
      } catch {
        if (!alive) {
          return;
        }

        clearAuthSession();
        dispatch(logoutAction());
      }
    };

    void hydrateUser();

    return () => {
      alive = false;
    };
  }, [currentUser, dispatch, role, token]);

  if (!token || !role) {
    if (canAccessPathByRole("GUEST", location.pathname)) {
      return <Outlet />;
    }
    return <Navigate to={ROUTE_URL.LOGIN} replace />;
  }

  if (!currentUser) {
    return <Loading mode="page" text="Đang đồng bộ thông tin tài khoản..." fullScreen />;
  }

  if (!canAccessPathByRole(role, location.pathname)) {
    return <Navigate to={getDefaultRouteByRole(role)} replace />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
};

function App() {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const roleFromState = useSelector((state: RootState) => state.auth.user?.role ?? null);

  const token = accessToken ?? getStoredAccessToken();
  const userRole = roleFromState ?? getStoredUserRole();
  const hasSession = Boolean(token && userRole);
  const defaultRoute = !token || !userRole ? ROUTE_URL.LOGIN : getDefaultRouteByRole(userRole);

  return (
    <div className="min-h-screen w-full">
      <Routes>
        <Route path="/" element={<Navigate to={defaultRoute} replace />} />

        <Route path={ROUTE_URL.LOGIN} element={hasSession ? <Navigate to={defaultRoute} replace /> : <LoginPage />} />
        <Route path={ROUTE_URL.REGISTER} element={hasSession ? <Navigate to={defaultRoute} replace /> : <RegisterPage />} />
        <Route
          path={ROUTE_URL.VERIFY_REGISTRATION}
          element={hasSession ? <Navigate to={defaultRoute} replace /> : <VerifyRegistrationPage />}
        />
        <Route path={ROUTE_URL.FORGOT_PASSWORD} element={hasSession ? <Navigate to={defaultRoute} replace /> : <ForgotPasswordPage />} />
        <Route path={ROUTE_URL.RESET_PASSWORD} element={hasSession ? <Navigate to={defaultRoute} replace /> : <ResetPasswordPage />} />

        <Route element={<AppAuthenticatedLayout />}>
          <Route path={ROUTE_URL.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTE_URL.PROFILE} element={<UserProfilePage />} />
          <Route path={ROUTE_URL.CHANGE_PASSWORD} element={<ChangePasswordPage />} />
          <Route path={ROUTE_URL.ACCOUNT_LIST} element={<AccountListPage />} />

          <Route path={ROUTE_URL.PRODUCT_LIST} element={<ProductListPage />} />
          <Route path={ROUTE_URL.PRODUCT_DETAIL} element={<ProductDetailPage />} />
          <Route path={ROUTE_URL.PRODUCT_CREATE} element={<ProductCreatePage />} />
          <Route path={ROUTE_URL.PRODUCT_EDIT} element={<ProductEditPage />} />

          <Route path={ROUTE_URL.PRICE_LIST_LIST} element={<PriceListListPage />} />
          <Route path={ROUTE_URL.PRICE_LIST_CREATE} element={<PriceListCreatePage />} />
          <Route path={ROUTE_URL.PRICE_LIST_DETAIL} element={<PriceListDetailPage />} />

          <Route path={ROUTE_URL.QUOTATION_LIST} element={<QuotationListPage />} />
          <Route path={ROUTE_URL.QUOTATION_CREATE} element={<QuotationCreatePage />} />
          <Route path={ROUTE_URL.QUOTATION_DETAIL} element={<QuotationDetailPage />} />

          <Route path={ROUTE_URL.PROMOTION_LIST} element={<PromotionListPage />} />
          <Route path={ROUTE_URL.PROMOTION_CREATE} element={<PromotionCreatePage />} />
          <Route path={ROUTE_URL.PROMOTION_DETAIL} element={<PromotionDetailPage />} />

          <Route path={ROUTE_URL.CONTRACT_CREATE} element={<ContractCreatePage />} />
          <Route path={ROUTE_URL.CONTRACT_LIST} element={<ContractListPage />} />
          <Route path={ROUTE_URL.CONTRACT_DETAIL} element={<ContractDetailPage />} />
          <Route path={ROUTE_URL.CONTRACT_EDIT} element={<ContractEditPage />} />
          <Route path={ROUTE_URL.CONTRACT_TRACKING} element={<ContractTrackingPage />} />
          <Route path={ROUTE_URL.CONTRACT_APPROVAL_LIST} element={<ContractApprovalListPage />} />
          <Route path={ROUTE_URL.CONTRACT_APPROVAL_DETAIL} element={<ContractApprovalDetailPage />} />

          <Route path={ROUTE_URL.CUSTOMER_LIST} element={<CustomerListPage />} />
          <Route path={ROUTE_URL.CUSTOMER_DETAIL} element={<CustomerDetailPage />} />
          <Route path={ROUTE_URL.CUSTOMER_CREATE} element={<CustomerCreatePage />} />
          <Route path={ROUTE_URL.CUSTOMER_EDIT} element={<CustomerEditPage />} />

          <Route path={ROUTE_URL.PROJECT_LIST} element={<ProjectListPage />} />
          <Route path={ROUTE_URL.PROJECT_DETAIL} element={<ProjectDetailPage />} />
          <Route path={ROUTE_URL.PROJECT_CREATE} element={<ProjectCreatePage />} />
          <Route path={ROUTE_URL.PROJECT_EDIT} element={<ProjectEditPage />} />
          <Route path={ROUTE_URL.PROJECT_ASSIGN_WAREHOUSE} element={<ProjectAssignWarehousePage />} />
          <Route path={ROUTE_URL.PROJECT_PROGRESS_UPDATE} element={<ProjectProgressUpdatePage />} />
          <Route path={ROUTE_URL.PROJECT_FINANCIAL_SUMMARY} element={<ProjectFinancialSummaryPage />} />

          <Route path={ROUTE_URL.INVOICE_LIST} element={<InvoiceListPage />} />
          <Route path={ROUTE_URL.INVOICE_DETAIL} element={<InvoiceDetailPage />} />
          <Route path={ROUTE_URL.INVOICE_CREATE} element={<InvoiceCreatePage />} />
          <Route path={ROUTE_URL.INVOICE_EDIT} element={<InvoiceEditPage />} />

          <Route path={ROUTE_URL.DEBT_LIST} element={<DebtListPage />} />
          <Route path={ROUTE_URL.DEBT_DETAIL} element={<DebtDetailPage />} />

          <Route path={ROUTE_URL.PAYMENT_LIST} element={<PaymentListPage />} />
          <Route path={ROUTE_URL.PAYMENT_DETAIL} element={<PaymentDetailPage />} />
          <Route path={ROUTE_URL.PAYMENT_RECORD} element={<RecordPaymentPage />} />
          <Route path={ROUTE_URL.PAYMENT_RECORD_BY_INVOICE} element={<RecordPaymentPage />} />

          <Route path={ROUTE_URL.INVENTORY_STATUS} element={<InventoryStatusPage />} />
          <Route path={ROUTE_URL.INVENTORY_RECEIPT_CREATE} element={<InventoryReceiptCreatePage />} />
          <Route path={ROUTE_URL.INVENTORY_ISSUE_CREATE} element={<InventoryIssueCreatePage />} />
          <Route path={ROUTE_URL.INVENTORY_ADJUSTMENT_CREATE} element={<InventoryAdjustmentCreatePage />} />
          <Route path={ROUTE_URL.INVENTORY_HISTORY} element={<InventoryHistoryPage />} />

          <Route path={ROUTE_URL.REPORT_SALES} element={<SalesReportPage />} />
          <Route path={ROUTE_URL.REPORT_INVENTORY} element={<InventoryReportPage />} />
          <Route path={ROUTE_URL.REPORT_PROJECT} element={<ProjectReportPage />} />
          <Route path={ROUTE_URL.REPORT_FINANCIAL} element={<FinancialReportPage />} />
          <Route path={ROUTE_URL.REPORT_EXPORT} element={<ExportReportPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </div>
  );
}

export default App;
