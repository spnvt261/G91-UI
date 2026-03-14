# G91-UI

Frontend cho hệ thống ERP Steel Business Management, xây dựng với `React + TypeScript + Vite + TailwindCSS`.

README này mô tả dùng hiện trạng source code tại thời điểm hiện tại, bao gồm:
- Toàn bộ pages và routes đang có
- Cấu trúc thư mục
- Page nào gọi service/API nào
- Trạng thái Redux, Axios, và layout/component dùng chung

## 1. Công nghệ sử dụng

- React 18
- TypeScript
- Vite
- TailwindCSS
- Redux Toolkit + React Redux
- React Router DOM
- Axios

## 2. Cài đặt và chạy dự án

### 2.1 Yêu cầu

- Node.js >= 18
- npm

### 2.2 Cài dependencies

```bash
npm install
```

### 2.3 Chạy môi trường dev

```bash
npm run dev
```

### 2.4 Build production

```bash
npm run build
```

### 2.5 Preview build

```bash
npm run preview
```

### 2.6 Lint

```bash
npm run lint
```

## 3. Biến môi trường

Tạo file `.env.development` (hoặc `.env`) như sau:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

`src/apiConfig/axiosConfig.ts` sử dụng biến này làm `baseURL`.

## 4. Kiến trúc tổng quan

- `src/models/*`: định nghĩa kiểu dữ liệu cho từng domain
- `src/services/*`: lớp gọi API theo domain
- `src/api/URL_const.ts`: tập trung endpoint constants
- `src/pages/*`: UI theo module nghiệp vụ
- `src/components/*`: component tái sử dụng
- `src/store/*`: Redux store (hiện có auth slice)
- `src/const/route_url.const.ts`: khai báo toàn bộ route URL

Luồng render chính trong `src/main.tsx`:
- `Provider` (Redux)
- `BrowserRouter`
- `NotificationProvider`
- `App`

## 5. Định tuyến hiện tại

### 5.1 Auth routes (không dùng AppLayout)

- `/login` -> `LoginPage`
- `/register` -> `RegisterPage`
- `/forgot-password` -> `ForgotPasswordPage`
- `/reset-password` -> `ResetPasswordPage`

### 5.2 Authenticated routes (dùng `AppLayout`)

- `/dashboard` -> `DashboardPage`

#### Products
- `/products` -> `ProductListPage`
- `/products/:id` -> `ProductDetailPage`

#### Quotations
- `/quotations` -> `QuotationListPage`
- `/quotations/create` -> `QuotationCreatePage`
- `/quotations/:id` -> `QuotationDetailPage`

#### Contracts
- `/contracts` -> `ContractListPage`
- `/contracts/create/:quotationId` -> `ContractCreatePage`
- `/contracts/:id` -> `ContractDetailPage`
- `/contracts/:id/edit` -> `ContractEditPage`
- `/contracts/:id/tracking` -> `ContractTrackingPage`

#### Approvals
- `/approvals/contracts` -> `ContractApprovalListPage`
- `/approvals/contracts/:id` -> `ContractApprovalDetailPage`

#### Customers
- `/customers` -> `CustomerListPage`
- `/customers/create` -> `CustomerCreatePage`
- `/customers/:id` -> `CustomerDetailPage`
- `/customers/:id/edit` -> `CustomerEditPage`

#### Projects
- `/projects` -> `ProjectListPage`
- `/projects/create` -> `ProjectCreatePage`
- `/projects/:id` -> `ProjectDetailPage`
- `/projects/:id/edit` -> `ProjectEditPage`
- `/projects/:id/assign-warehouse` -> `ProjectAssignWarehousePage`

#### Payments
- `/payments` -> `PaymentListPage`
- `/payments/:id` -> `PaymentDetailPage`
- `/payments/:id/record` -> `RecordPaymentPage`

#### Reports
- `/reports/dashboard` -> `DashboardReportPage`
- `/reports/sales` -> `SalesReportPage`
- `/reports/inventory` -> `InventoryReportPage`
- `/reports/financial` -> `FinancialReportPage`

### 5.3 Utility routes

- `/` -> redirect sang `/login`
- `/test` -> `TestPage` (showcase component)
- `*` -> `NotFoundPage`

## 6. Danh sách pages theo module

Tổng cộng có các page sau trong `src/pages`:

### Auth (4)
- `LoginPage`
- `RegisterPage`
- `ForgotPasswordPage`
- `ResetPasswordPage`

### Dashboard (1)
- `DashboardPage`

### Products (2)
- `ProductListPage`
- `ProductDetailPage`

### Quotations (3)
- `QuotationListPage`
- `QuotationCreatePage`
- `QuotationDetailPage`

### Contracts (5)
- `ContractListPage`
- `ContractCreatePage`
- `ContractDetailPage`
- `ContractEditPage`
- `ContractTrackingPage`

### Approvals (2)
- `ContractApprovalListPage`
- `ContractApprovalDetailPage`

### Customers (4)
- `CustomerListPage`
- `CustomerCreatePage`
- `CustomerDetailPage`
- `CustomerEditPage`

### Projects (5)
- `ProjectListPage`
- `ProjectCreatePage`
- `ProjectDetailPage`
- `ProjectEditPage`
- `ProjectAssignWarehousePage`

### Payments (3)
- `PaymentListPage`
- `PaymentDetailPage`
- `RecordPaymentPage`

### Reports (4)
- `DashboardReportPage`
- `SalesReportPage`
- `InventoryReportPage`
- `FinancialReportPage`

### Khác
- `NotFoundPage`
- `TestPage`
- `AuthPageShell` (shared)

## 7. Mapping page -> service -> API

### 7.1 Auth

- `LoginPage`
  - `authService.login`
  - `POST /api/auth/login`
- `RegisterPage`
  - `authService.register`
  - `POST /api/auth/register`
- `ForgotPasswordPage`
  - `authService.forgotPassword`
  - `POST /api/auth/forgot-password`
- `ResetPasswordPage`
  - `authService.resetPassword`
  - `POST /api/auth/reset-password`

### 7.2 Dashboard

- `DashboardPage`
  - `reportService.getDashboard`
  - `GET /api/reports/dashboard`

### 7.3 Products

- `ProductListPage`
  - `productService.getList`
  - `GET /api/products`
- `ProductDetailPage`
  - `productService.getDetail`
  - `GET /api/products/{id}`

### 7.4 Quotations

- `QuotationListPage`
  - `quotationService.getList`
  - `GET /api/quotations`
- `QuotationCreatePage`
  - `productService.getList` -> `GET /api/products`
  - `quotationService.create` -> `POST /api/quotations`
- `QuotationDetailPage`
  - `quotationService.getDetail`
  - `GET /api/quotations/{id}`

### 7.5 Contracts

- `ContractListPage`
  - `contractService.getList`
  - `GET /api/contracts`
- `ContractCreatePage`
  - `quotationService.getDetail` -> `GET /api/quotations/{id}`
  - `contractService.create` -> `POST /api/contracts`
- `ContractDetailPage`
  - `contractService.getDetail`
  - `GET /api/contracts/{id}`
- `ContractEditPage`
  - `contractService.getDetail` -> `GET /api/contracts/{id}`
  - `contractService.update` -> `PUT /api/contracts/{id}`
- `ContractTrackingPage`
  - `contractService.track`
  - `GET /api/contracts/{id}/track`

### 7.6 Approvals

- `ContractApprovalListPage`
  - `contractService.getList` (lọc `PENDING`)
  - `GET /api/contracts`
- `ContractApprovalDetailPage`
  - `contractService.getDetail` -> `GET /api/contracts/{id}`
  - `contractService.approve` -> `POST /api/contracts/{id}/approve`
  - `contractService.reject` -> `POST /api/contracts/{id}/reject`

### 7.7 Customers

- `CustomerListPage`
  - `customerService.getList`
  - `GET /api/customers`
- `CustomerCreatePage`
  - `customerService.create`
  - `POST /api/customers`
- `CustomerDetailPage`
  - `customerService.getDetail`
  - `GET /api/customers/{id}`
- `CustomerEditPage`
  - `customerService.getDetail` -> `GET /api/customers/{id}`
  - `customerService.update` -> `PUT /api/customers/{id}`

### 7.8 Projects

- `ProjectListPage`
  - `projectService.getList`
  - `GET /api/projects`
- `ProjectCreatePage`
  - `projectService.create`
  - `POST /api/projects`
- `ProjectDetailPage`
  - `projectService.getDetail`
  - `GET /api/projects/{id}`
- `ProjectEditPage`
  - `projectService.getDetail` -> `GET /api/projects/{id}`
  - `projectService.update` -> `PUT /api/projects/{id}`
  - `projectService.updateProgress` -> `PATCH /api/projects/{id}/progress`
- `ProjectAssignWarehousePage`
  - `projectService.assignWarehouse`
  - `PATCH /api/projects/{id}/assign-warehouse`

### 7.9 Payments

- `PaymentListPage`
  - `paymentService.getInvoiceList` -> `GET /api/invoices`
  - `paymentService.getDebtStatus` -> `GET /api/debts`
- `PaymentDetailPage`
  - `paymentService.getInvoiceDetail`
  - `GET /api/invoices/{id}`
- `RecordPaymentPage`
  - `paymentService.recordPayment`
  - `POST /api/invoices/{id}/payments`

### 7.10 Reports

- `DashboardReportPage`
  - `reportService.getDashboard`
  - `GET /api/reports/dashboard`
- `SalesReportPage`
  - `reportService.getSalesReport`
  - `GET /api/reports/sales`
- `InventoryReportPage`
  - `reportService.getInventoryReport`
  - `GET /api/reports/inventory`
- `FinancialReportPage`
  - `reportService.getProjectReport` -> `GET /api/reports/projects`
  - `reportService.getDashboard` -> `GET /api/reports/dashboard`

### 7.11 Pages không gọi API trực tiếp

- `NotFoundPage`
- `TestPage`

## 8. Services và endpoints hỗ trợ thêm (chưa được UI gọi hết)

Một số hàm service đã có sẵn nhưng chưa được page hiện tại sử dụng trực tiếp:

- `authService.logout` -> `POST /api/auth/logout`
- `authService.changePassword` -> `POST /api/auth/change-password`
- `authService.getProfile` -> `GET /api/users/me`
- `authService.updateProfile` -> `PUT /api/users/me`
- `productService.create` -> `POST /api/products`
- `productService.update` -> `PUT /api/products/{id}`
- `productService.updateStatus` -> `PATCH /api/products/{id}/status`
- `quotationService.update` -> `PUT /api/quotations/{id}`
- `quotationService.submit` -> `POST /api/quotations/{id}/submit`
- `contractService.submit` -> `POST /api/contracts/{id}/submit`

Ngoài ra `API.ACCOUNT` và `API.PRICING` đã khai báo trong `URL_const.ts` nhưng hiện chưa có service/page tương ứng.

## 9. Redux

Hiện store có 1 slice chính: `authSlice`.

State:
- `accessToken: string | null`
- `user: UserModel | null`
- `isAuthenticated: boolean`

Actions:
- `loginSuccess`
- `logout`
- `setUser`

`LoginPage` đang dispatch `loginSuccess` và lưu `access_token` vào `localStorage`.

## 10. Axios và cơ chế auth token

`src/apiConfig/axiosConfig.ts`:

- Tự động gán `Authorization: Bearer <access_token>` cho request
- Chuẩn hóa URL để tránh trùng `/api/api/...`
- Có interceptor xử lý `401`:
  - Gọi `POST /auth/refresh` với `refresh_token`
  - Cập nhật lại `access_token`
  - Retry request cũ

## 11. Component system

Các nhóm component chính:

- `components/auth`: `AuthCard`, `AuthHeader`, `AuthFooter`
- `components/layout`: `AppLayout`, `TopNavbar`, `Sidebar`, `PageHeader`, `ContentWrapper`, `AppFooter`
- `components/table`: `DataTable`, `TableFilterBar`, `Pagination`
- `components/forms`: `FormSectionCard`, `ImageUploadCard`, `StockConfigTable`
- `components/custom*`: `CustomButton`, `CustomTextField`, `CustomSelect`, `CustomSearchBar`
- `components/dashboard`: `StatsGrid`, `ChartCard`
- `components/modals`: `ConfirmModal`, `DeleteConfirmModal`
- `components/loading`: `Loading`
- `components/notifycation`: `Notifycation`

## 12. Cấu trúc thư mục

```text
src/
  api/
    URL_const.ts
  apiConfig/
    axiosConfig.ts
  assets/
  components/
    auth/
    cards/
    customButton/
    customSearchBar/
    customSelect/
    customTextField/
    dashboard/
    forms/
    layout/
    loading/
    modals/
    navigation/
    notifycation/
    table/
  const/
    route_url.const.ts
  context/
    notify.provider.tsx
    notifyContext.tsx
  hooks/
    usePageSearchParams.ts
    useValidateUUID.ts
  models/
    auth/
    common/
    contract/
    customer/
    payment/
    product/
    project/
    quotation/
    report/
  pages/
    404/
    approvals/
    auth/
    contracts/
    customers/
    dashboard/
    payments/
    products/
    projects/
    quotations/
    reports/
    shared/
  services/
    auth/
    contract/
    customer/
    payment/
    product/
    project/
    quotation/
    report/
  store/
    authSlice.ts
    index.ts
  utils/
    formatDate.ts
  App.tsx
  App.css
  index.css
  main.tsx
```

## 13. Ghi chú hiện trạng

- Hầu hết page đã có service integration cơ bản theo module.
- Chưa có route guard (phân quyền/đăng nhập) ở mức router.
- Nhiều page đang ở mức CRUD skeleton để nối API và layout, chưa phải UI/business cuối cùng.
- Thư mục `notifycation` đang sai chính tả (theo code hiện tại).

## 14. Đề xuất bước tiếp theo

1. Thêm `PrivateRoute` + role-based route guard (Customer/Accountant/Owner/Warehouse).
2. Bổ sung loading skeleton, empty state, error boundary thống nhất toàn app.
3. Chuẩn hóa i18n text và encoding tiếng Việt.
4. Hoàn thiện luồng nghiệp vụ nâng cao (submit quotation/contract, profile, pricing/account modules).
