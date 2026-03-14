import "./App.css";
import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import { ROUTE_URL } from "./const/route_url.const";
import NotFoundPage from "./pages/404/NotFound.Page";
import TestPage from "./pages/404/test.page";
import ContractApprovalDetailPage from "./pages/approvals/ContractApprovalDetailPage";
import ContractApprovalListPage from "./pages/approvals/ContractApprovalListPage";
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

const AppAuthenticatedLayout = () => {
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
};

function App() {
  return (
    <div className="min-h-screen w-full">
      <Routes>
        <Route path="/" element={<Navigate to={ROUTE_URL.LOGIN} replace />} />

        <Route path={ROUTE_URL.LOGIN} element={<LoginPage />} />
        <Route path={ROUTE_URL.REGISTER} element={<RegisterPage />} />
        <Route path={ROUTE_URL.FORGOT_PASSWORD} element={<ForgotPasswordPage />} />
        <Route path={ROUTE_URL.RESET_PASSWORD} element={<ResetPasswordPage />} />

        <Route element={<AppAuthenticatedLayout />}>
          <Route path={ROUTE_URL.DASHBOARD} element={<DashboardPage />} />

          <Route path={ROUTE_URL.PRODUCT_LIST} element={<ProductListPage />} />
          <Route path={ROUTE_URL.PRODUCT_DETAIL} element={<ProductDetailPage />} />

          <Route path={ROUTE_URL.QUOTATION_LIST} element={<QuotationListPage />} />
          <Route path={ROUTE_URL.QUOTATION_CREATE} element={<QuotationCreatePage />} />
          <Route path={ROUTE_URL.QUOTATION_DETAIL} element={<QuotationDetailPage />} />

          <Route path={ROUTE_URL.CONTRACT_LIST} element={<ContractListPage />} />
          <Route path={ROUTE_URL.CONTRACT_CREATE} element={<ContractCreatePage />} />
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
    </div>
  );
}

export default App;
