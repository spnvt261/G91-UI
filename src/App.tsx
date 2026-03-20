import "./App.css";
import { useEffect, useState } from "react";
import { Navigate, Outlet, Route, Routes, useLocation } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Loading from "./components/loading/Loading";
import { ROUTE_URL } from "./const/route_url.const";
import NotFoundPage from "./pages/404/NotFound.Page";
import TestPage from "./pages/404/test.page";
import ForgotPasswordPage from "./pages/auth/ForgotPasswordPage";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
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
import PaymentDetailPage from "./pages/payments/PaymentDetailPage";
import PaymentListPage from "./pages/payments/PaymentListPage";
import RecordPaymentPage from "./pages/payments/RecordPaymentPage";
import ProductDetailPage from "./pages/products/ProductDetailPage";
import ProductListPage from "./pages/products/ProductListPage";
import ProjectAssignWarehousePage from "./pages/projects/ProjectAssignWarehousePage";
import ProjectCreatePage from "./pages/projects/ProjectCreatePage";
import ProjectDetailPage from "./pages/projects/ProjectDetailPage";
import ProjectEditPage from "./pages/projects/ProjectEditPage";
import ProjectListPage from "./pages/projects/ProjectListPage";
import QuotationCreatePage from "./pages/quotations/QuotationCreatePage";
import QuotationDetailPage from "./pages/quotations/QuotationDetailPage";
import QuotationListPage from "./pages/quotations/QuotationListPage";
import DashboardReportPage from "./pages/reports/DashboardReportPage";
import FinancialReportPage from "./pages/reports/FinancialReportPage";
import InventoryReportPage from "./pages/reports/InventoryReportPage";
import SalesReportPage from "./pages/reports/SalesReportPage";
import UserProfilePage from "./pages/profile/UserProfilePage";
import { canAccessPathByRole, getDefaultRouteByRole } from "./const/authz.const";
import { clearAuthSession, getStoredAccessToken, getStoredUserRole, persistAuthSession } from "./utils/authSession";
import { authService } from "./services/auth/auth.service";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "./store";
import { loginSuccess, logout as logoutAction } from "./store/authSlice";
import { subscribePendingApiRequests } from "./apiConfig/axiosConfig";

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
    return <Navigate to="/" replace />;
  }

  if (!currentUser) {
    return <div className="flex min-h-screen items-center justify-center text-sm text-slate-500">Loading user...</div>;
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
  const token = getStoredAccessToken();
  const userRole = getStoredUserRole();
  const [isGlobalLoading, setIsGlobalLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribePendingApiRequests((count) => {
      setIsGlobalLoading(count > 0);
    });

    return unsubscribe;
  }, []);

  return (
    <div className="min-h-screen w-full">
      <Routes>
        <Route path="/" element={<Navigate to={token && userRole ? getDefaultRouteByRole(userRole) : ROUTE_URL.LOGIN} replace />} />

        <Route path={ROUTE_URL.LOGIN} element={token ? <Navigate to={getDefaultRouteByRole(userRole ?? "OWNER")} replace /> : <LoginPage />} />
        <Route path={ROUTE_URL.REGISTER} element={token ? <Navigate to={getDefaultRouteByRole(userRole ?? "OWNER")} replace /> : <RegisterPage />} />
        <Route path={ROUTE_URL.FORGOT_PASSWORD} element={token ? <Navigate to={getDefaultRouteByRole(userRole ?? "OWNER")} replace /> : <ForgotPasswordPage />} />
        <Route path={ROUTE_URL.RESET_PASSWORD} element={token ? <Navigate to={getDefaultRouteByRole(userRole ?? "OWNER")} replace /> : <ResetPasswordPage />} />

        <Route element={<AppAuthenticatedLayout />}>
          <Route path={ROUTE_URL.DASHBOARD} element={<DashboardPage />} />
          <Route path={ROUTE_URL.PROFILE} element={<UserProfilePage />} />

          <Route path={ROUTE_URL.PRODUCT_LIST} element={<ProductListPage />} />
          <Route path={ROUTE_URL.PRODUCT_DETAIL} element={<ProductDetailPage />} />

          <Route path={ROUTE_URL.QUOTATION_LIST} element={<QuotationListPage />} />
          <Route path={ROUTE_URL.QUOTATION_CREATE} element={<QuotationCreatePage />} />
          <Route path={ROUTE_URL.QUOTATION_DETAIL} element={<QuotationDetailPage />} />

          <Route path={ROUTE_URL.CONTRACT_CREATE} element={<ContractCreatePage />} />
          <Route path={ROUTE_URL.CONTRACT_LIST} element={<ContractListPage />} />
          <Route path={ROUTE_URL.CONTRACT_DETAIL} element={<ContractDetailPage />} />
          <Route path={ROUTE_URL.CONTRACT_EDIT} element={<ContractEditPage />} />
          <Route path={ROUTE_URL.CONTRACT_TRACKING} element={<ContractTrackingPage />} />
          <Route path={ROUTE_URL.CONTRACT_APPROVAL_LIST} element={<Navigate to={ROUTE_URL.QUOTATION_LIST} replace />} />
          <Route path={ROUTE_URL.CONTRACT_APPROVAL_DETAIL} element={<Navigate to={ROUTE_URL.QUOTATION_LIST} replace />} />

          <Route path={ROUTE_URL.CUSTOMER_LIST} element={<CustomerListPage />} />
          <Route path={ROUTE_URL.CUSTOMER_DETAIL} element={<CustomerDetailPage />} />
          <Route path={ROUTE_URL.CUSTOMER_CREATE} element={<CustomerCreatePage />} />
          <Route path={ROUTE_URL.CUSTOMER_EDIT} element={<CustomerEditPage />} />

          <Route path={ROUTE_URL.PROJECT_LIST} element={<ProjectListPage />} />
          <Route path={ROUTE_URL.PROJECT_DETAIL} element={<ProjectDetailPage />} />
          <Route path={ROUTE_URL.PROJECT_CREATE} element={<ProjectCreatePage />} />
          <Route path={ROUTE_URL.PROJECT_EDIT} element={<ProjectEditPage />} />
          <Route path={ROUTE_URL.PROJECT_ASSIGN_WAREHOUSE} element={<ProjectAssignWarehousePage />} />

          <Route path={ROUTE_URL.PAYMENT_LIST} element={<PaymentListPage />} />
          <Route path={ROUTE_URL.PAYMENT_DETAIL} element={<PaymentDetailPage />} />
          <Route path={ROUTE_URL.PAYMENT_RECORD} element={<RecordPaymentPage />} />

          <Route path={ROUTE_URL.REPORT_DASHBOARD} element={<DashboardReportPage />} />
          <Route path={ROUTE_URL.REPORT_SALES} element={<SalesReportPage />} />
          <Route path={ROUTE_URL.REPORT_INVENTORY} element={<InventoryReportPage />} />
          <Route path={ROUTE_URL.REPORT_FINANCIAL} element={<FinancialReportPage />} />
        </Route>

        <Route path="/test" element={<TestPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      {isGlobalLoading ? <Loading fullScreen text="Loading data..." /> : null}
    </div>
  );
}

export default App;
