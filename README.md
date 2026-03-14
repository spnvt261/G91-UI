# G91-UI

Frontend cho he thong ERP Steel Business Management, xay dung voi `React + TypeScript + Vite + TailwindCSS`.

README nay mo ta dung hien trang source code tai thoi diem hien tai, bao gom:
- Toan bo pages va routes dang co
- Cau truc thu muc
- Page nao goi service/API nao
- Trang thai Redux, Axios, va layout/component dung chung

## 1. Cong nghe su dung

- React 18
- TypeScript
- Vite
- TailwindCSS
- Redux Toolkit + React Redux
- React Router DOM
- Axios

## 2. Cai dat va chay du an

### 2.1 Yeu cau

- Node.js >= 18
- npm

### 2.2 Cai dependencies

```bash
npm install
```

### 2.3 Chay moi truong dev

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

## 3. Bien moi truong

Tao file `.env.development` (hoac `.env`) nhu sau:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

`src/apiConfig/axiosConfig.ts` su dung bien nay lam `baseURL`.

## 4. Kien truc tong quan

- `src/models/*`: dinh nghia kieu du lieu cho tung domain
- `src/services/*`: lop goi API theo domain
- `src/api/URL_const.ts`: tap trung endpoint constants
- `src/pages/*`: UI theo module nghiep vu
- `src/components/*`: component tai su dung
- `src/store/*`: Redux store (hien co auth slice)
- `src/const/route_url.const.ts`: khai bao toan bo route URL

Luong render chinh trong `src/main.tsx`:
- `Provider` (Redux)
- `BrowserRouter`
- `NotificationProvider`
- `App`

## 5. Routing hien tai

### 5.1 Auth routes (khong dung AppLayout)

- `/login` -> `LoginPage`
- `/register` -> `RegisterPage`
- `/forgot-password` -> `ForgotPasswordPage`
- `/reset-password` -> `ResetPasswordPage`

### 5.2 Authenticated routes (dung `AppLayout`)

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

## 6. Danh sach pages theo module

Tong cong co cac page sau trong `src/pages`:

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

### Khac
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
  - `contractService.getList` (loc `PENDING`)
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

### 7.11 Pages khong goi API truc tiep

- `NotFoundPage`
- `TestPage`

## 8. Services va endpoints ho tro them (chua duoc UI goi het)

Mot so ham service da co san nhung chua duoc page hien tai su dung truc tiep:

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

Ngoai ra `API.ACCOUNT` va `API.PRICING` da khai bao trong `URL_const.ts` nhung hien chua co service/page tuong ung.

## 9. Redux

Hien store co 1 slice chinh: `authSlice`.

State:
- `accessToken: string | null`
- `user: UserModel | null`
- `isAuthenticated: boolean`

Actions:
- `loginSuccess`
- `logout`
- `setUser`

`LoginPage` dang dispatch `loginSuccess` va luu `access_token` vao `localStorage`.

## 10. Axios va co che auth token

`src/apiConfig/axiosConfig.ts`:

- Tu dong gan `Authorization: Bearer <access_token>` cho request
- Chuan hoa URL de tranh trung `/api/api/...`
- Co interceptor xu ly `401`:
  - Goi `POST /auth/refresh` voi `refresh_token`
  - Cap nhat lai `access_token`
  - Retry request cu

## 11. Component system

Cac nhom component chinh:

- `components/auth`: `AuthCard`, `AuthHeader`, `AuthFooter`
- `components/layout`: `AppLayout`, `TopNavbar`, `Sidebar`, `PageHeader`, `ContentWrapper`, `AppFooter`
- `components/table`: `DataTable`, `TableFilterBar`, `Pagination`
- `components/forms`: `FormSectionCard`, `ImageUploadCard`, `StockConfigTable`
- `components/custom*`: `CustomButton`, `CustomTextField`, `CustomSelect`, `CustomSearchBar`
- `components/dashboard`: `StatsGrid`, `ChartCard`
- `components/modals`: `ConfirmModal`, `DeleteConfirmModal`
- `components/loading`: `Loading`
- `components/notifycation`: `Notifycation`

## 12. Cau truc thu muc

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

## 13. Ghi chu hien trang

- Hau het page da co service integration co ban theo module.
- Chua co route guard (phan quyen/dang nhap) o muc router.
- Nhieu page dang o muc CRUD skeleton de noi API va layout, chua phai UI/business cuoi cung.
- Thu muc `notifycation` dang sai chinh ta (theo code hien tai).

## 14. De xuat buoc tiep theo

1. Them `PrivateRoute` + role-based route guard (Customer/Accountant/Owner/Warehouse).
2. Bo sung loading skeleton, empty state, error boundary thong nhat toan app.
3. Chuan hoa i18n text va encoding tieng Viet.
4. Hoan thien luong nghiep vu nang cao (submit quotation/contract, profile, pricing/account modules).
