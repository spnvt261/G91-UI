# FRONTEND SYSTEM OVERVIEW

## Mục lục
1. [Tổng quan frontend](#1-tổng-quan-frontend)
2. [Sơ đồ điều hướng màn hình](#2-sơ-đồ-điều-hướng-màn-hình)
3. [Phân tích từng page](#3-phân-tích-từng-page)
4. [Component dùng chung quan trọng](#4-component-dùng-chung-quan-trọng)
5. [Routing và permission](#5-routing-và-permission)
6. [State management và data flow](#6-state-management-và-data-flow)
7. [Business rules quan trọng toàn hệ thống](#7-business-rules-quan-trọng-toàn-hệ-thống)
8. [Những điểm chưa xác định chắc chắn từ source code](#8-những-điểm-chưa-xác-định-chắc-chắn-từ-source-code)

---

## 1. Tổng quan frontend

### 1.1 Tech stack
- Core: React 18 + TypeScript + Vite.
- UI: TailwindCSS + Ant Design icons + một phần component Antd (`Modal`, `Typography`, `Breadcrumb`).
- Routing: `react-router-dom`.
- State: Redux Toolkit (`authSlice`) + React Context (`NotificationProvider`).
- HTTP: Axios với interceptor tùy biến.
- Build tools: ESLint, PostCSS, Tailwind.

### 1.2 Cấu trúc source
- Source chính nằm ở `src/`.
- Các thư mục thực tế có trong project:
  - `src/pages`, `src/components`, `src/services`, `src/models`, `src/store`, `src/context`, `src/hooks`, `src/utils`, `src/const`, `src/api`, `src/apiConfig`.
- Các thư mục **không tồn tại** trong source hiện tại:
  - `src/routes`, `src/router`, `src/features`, `src/modules`, `src/constants`, `src/types`.

### 1.3 Kiến trúc tổng thể
- `main.tsx` bọc app theo thứ tự: `Redux Provider` -> `BrowserRouter` -> `NotificationProvider` -> `App`.
- `App.tsx` định nghĩa toàn bộ route và guard auth/role.
- Các page business dùng layout thống nhất qua:
  - `AppLayout` (sidebar + topbar)
  - `NoResizeScreenTemplate` + `ListScreenHeaderTemplate`.
- Dữ liệu đi theo hướng:
  - `Page` -> `service` -> `axios instance` -> backend API.
- Model type nằm ở `src/models/*` và được dùng trực tiếp trong page/service.

### 1.4 Giao diện tổng thể hiện tại
- Phần đã đăng nhập dùng layout 2 cột:
  - Sidebar trái gradient xanh đậm.
  - Top navbar có toggle sidebar, chuông notification giả lập, avatar user dropdown.
- Các màn hình list chủ yếu dùng:
  - Header + breadcrumb.
  - Search + filter modal.
  - Bảng dữ liệu + pagination local.
- Form pages chủ yếu dùng `FormSectionCard`, input text thủ công.
- Theme hiện tại là tone xanh/xám, bo góc lớn, shadow nhẹ.
- Text UI đang trộn Việt + Anh, và một số file có dấu hiệu lỗi encoding ký tự tiếng Việt.

---

## 2. Sơ đồ điều hướng màn hình

### 2.1 Route tree tổng thể

```text
/
|- /login
|- /register
|- /verify-registration
|- /forgot-password
|- /reset-password
|- (authenticated layout)
|  |- /dashboard
|  |- /profile
|  |- /products
|  |- /products/:id
|  |- /quotations
|  |- /quotations/create
|  |- /quotations/:id
|  |- /contracts
|  |- /contracts/create/:quotationId
|  |- /contracts/:id
|  |- /contracts/:id/edit
|  |- /contracts/:id/tracking
|  |- /approvals/contracts (redirect -> /quotations)
|  |- /approvals/contracts/:id (redirect -> /quotations)
|  |- /customers
|  |- /customers/create
|  |- /customers/:id
|  |- /customers/:id/edit
|  |- /projects
|  |- /projects/create
|  |- /projects/:id
|  |- /projects/:id/edit
|  |- /projects/:id/assign-warehouse
|  |- /payments
|  |- /payments/:id
|  |- /payments/:id/record
|  |- /reports/dashboard
|  |- /reports/sales
|  |- /reports/inventory
|  |- /reports/financial
|- /test
|- * (404)
```

### 2.2 Sơ đồ page/module
- Auth module:
  - `Login` -> `Verify Registration` (khi login bị yêu cầu verify) -> `Login`.
  - `Register` -> `Verify Registration` -> `Login`.
  - `Forgot Password` -> `Reset Password` -> `Login`.
- Quotation-Contract module:
  - `Quotation List` -> `Quotation Detail`.
  - `Quotation Create` -> `Quotation Detail` (save draft hoặc submit create).
  - `Quotation Detail` -> `Contract Create` (khi role/flag cho phép) -> `Contract Detail`.
- Contract module:
  - `Contract List` -> `Contract Detail` -> (`Edit` / `Tracking`).
  - `Contract Detail` có action submit/approve/reject theo role.
- Customer module:
  - `Customer List` -> `Detail` -> `Edit`.
  - `Customer List` -> `Create` -> `Detail`.
- Project module:
  - `Project List` -> `Detail` -> (`Edit` / `Assign Warehouse`).
  - `Project List` -> `Create` -> `Detail`.
- Payment module:
  - `Payment List` -> `Payment Detail` -> `Record Payment` -> `Payment Detail`.
  - `Payment List` -> `Record Payment` trực tiếp.
- Report module:
  - Truy cập độc lập từng báo cáo dashboard/sales/inventory/financial.

---

## 3. Phân tích từng page

### 3.1 LoginPage
- Route: `/login`
- Module: `pages/auth`
- Mục đích: đăng nhập hệ thống.
- Người dùng sử dụng: người chưa đăng nhập.
- UI structure: auth card, field email/password, nút login, link quên mật khẩu/đăng ký.
- Thành phần chính: `AuthPageShell`, `AuthCard`, `CustomTextField`, `CustomButton`.
- Dữ liệu load ban đầu: không load data.
- Các action người dùng: nhập email/password, submit login, đi quên mật khẩu, đi đăng ký.
- Form/filter:
  - Fields: `email:string`, `password:string`.
  - Required: không check client-side rõ ràng, backend chịu trách nhiệm chính.
- Table/list: không có.
- Modal/drawer: không có.
- API sử dụng:
  - `POST /api/auth/login` (`authService.login`).
- State chính: `email`, `password`, `loading`.
- Validate:
  - Không có validate định dạng email ở client.
  - Bắt case backend code `EMAIL_VERIFICATION_REQUIRED`.
- Business logic:
  - Login thành công -> lưu `access_token` + `user_role` localStorage + dispatch `loginSuccess` -> navigate default route theo role.
  - Nếu yêu cầu verify email -> chuyển `verify-registration?email=...`.
- Permission/Auth:
  - Nếu đã có token + role thì route này redirect về default route.
- Loading/Error/Empty state:
  - Loading: disable nút và đổi label `Processing...`.
  - Error: notify message.
- Điều hướng liên quan:
  - Sang `ForgotPasswordPage`, `RegisterPage`, `VerifyRegistrationPage`, default page theo role.
- Ghi chú:
  - Chưa có cơ chế throttling/login attempt lock ở frontend.

### 3.2 RegisterPage
- Route: `/register`
- Module: `pages/auth`
- Mục đích: tạo tài khoản mới.
- Người dùng sử dụng: người chưa có tài khoản.
- UI structure: auth card form 4 field + nút register + link login.
- Thành phần chính: `AuthCard`, `CustomTextField`, `CustomButton`.
- Dữ liệu load ban đầu: không.
- Các action người dùng: nhập form, submit đăng ký, quay lại login.
- Form/filter:
  - Fields: `fullName`, `email`, `password`, `confirmPassword`.
  - Required: logic ngầm qua API, client chỉ check khớp mật khẩu.
- Table/list: không.
- Modal/drawer: không.
- API sử dụng:
  - `POST /api/auth/register`.
- State chính: 4 field form + `loading`.
- Validate:
  - `password === confirmPassword`.
- Business logic:
  - Thành công -> điều hướng `response.redirectTo` hoặc `/verify-registration` kèm `state.email`, `state.expireMinutes`.
- Permission/Auth:
  - Đã login thì bị redirect khỏi page này.
- Loading/Error/Empty state: disable nút khi loading, notify lỗi backend.
- Điều hướng liên quan: login, verify-registration.
- Ghi chú: chưa có rule mạnh về độ mạnh password ở client.

### 3.3 VerifyRegistrationPage
- Route: `/verify-registration`
- Module: `pages/auth`
- Mục đích: xác thực email sau đăng ký.
- Người dùng sử dụng: user mới đăng ký/chưa verify.
- UI structure: form email + verification code + nút verify + resend.
- Thành phần chính: `AuthCard`, `CustomTextField`, `CustomButton`.
- Dữ liệu load ban đầu:
  - Lấy email từ query string hoặc `location.state`.
- Các action người dùng: verify tài khoản, gửi lại mã.
- Form/filter:
  - Fields: `email`, `verificationCode`.
  - `verificationCode` bị upper-case + cắt tối đa 5 ký tự.
- API sử dụng:
  - `POST /api/auth/verify-registration`.
  - `POST /api/auth/resend-verification-code`.
- State chính: form fields, `expireMinutes`, `verifyLoading`, `resendLoading`.
- Validate:
  - Email bắt buộc.
  - Verification code bắt buộc.
- Business logic:
  - Verify thành công -> về `redirectTo` của backend hoặc `/login`.
  - Resend thành công -> update thời hạn mã.
- Permission/Auth: màn hình public (không cần login).
- Loading/Error/Empty state: disable action khi đang gọi API.
- Điều hướng liên quan: back về login.
- Ghi chú: không có countdown timer realtime, chỉ hiển thị phút từ API.
### 3.4 ForgotPasswordPage
- Route: `/forgot-password`
- Module: `pages/auth`
- Mục đích: gửi yêu cầu reset password.
- Người dùng sử dụng: user quên mật khẩu.
- UI structure: 1 field email + nút gửi.
- Thành phần chính: `AuthCard`, `CustomTextField`, `CustomButton`.
- Dữ liệu load ban đầu: không.
- Các action người dùng: nhập email, gửi yêu cầu.
- Form/filter:
  - Field: `email`.
- API sử dụng:
  - `POST /api/auth/forgot-password`.
- State chính: `email`, `loading`.
- Validate: không check format email ở client.
- Business logic: gửi request và thông báo thành công/thất bại.
- Permission/Auth: public.
- Loading/Error/Empty state: disable nút khi loading.
- Điều hướng liên quan: về login.
- Ghi chú: text hiển thị có dấu hiệu encoding lỗi ở source.

### 3.5 ResetPasswordPage
- Route: `/reset-password`
- Module: `pages/auth`
- Mục đích: đặt mật khẩu mới bằng token.
- Người dùng sử dụng: user nhận link/token reset.
- UI structure: token + new password + confirm password.
- Thành phần chính: `AuthCard`, `CustomTextField`, `CustomButton`.
- Dữ liệu load ban đầu:
  - Lấy token từ query `?token=`.
- Các action người dùng: nhập token + mật khẩu mới, submit.
- Form/filter:
  - Fields: `token`, `newPassword`, `confirmNewPassword`.
- API sử dụng:
  - `POST /api/auth/reset-password`.
- State chính: 3 field + `loading`.
- Validate:
  - `newPassword === confirmNewPassword`.
- Business logic: thành công -> về login.
- Permission/Auth: public.
- Loading/Error/Empty state: disable nút khi loading.
- Điều hướng liên quan: login.
- Ghi chú: không validate độ dài/độ mạnh password ở client.

### 3.6 DashboardPage
- Route: `/dashboard`
- Module: `pages/dashboard`
- Mục đích: dashboard tổng quan cho user đã đăng nhập.
- Người dùng sử dụng: tất cả role đăng nhập có quyền truy cập dashboard.
- UI structure:
  - Header breadcrumb.
  - Stats grid 4 card.
  - 2 chart placeholder.
- Thành phần chính: `NoResizeScreenTemplate`, `ListScreenHeaderTemplate`, `StatsGrid`, `ChartCard`.
- Dữ liệu load ban đầu:
  - `GET /api/reports/dashboard`.
- Các action người dùng: xem KPI, không có thao tác CRUD.
- Form/filter: không có.
- Table/list: không có.
- API sử dụng: `reportService.getDashboard`.
- State chính: `totalSales`, `totalContracts`, `pendingQuotations`, `inventoryValue`, `loading`.
- Validate: không.
- Business logic:
  - Map `openProjectCount` thành `Pending Quotations`.
  - Map `inventoryAlertCount * 1,000,000` thành `Inventory Value` (ước lượng frontend).
- Permission/Auth: cần đăng nhập + pass `canAccessPathByRole`.
- Loading/Error/Empty state: loading overlay + notify error.
- Điều hướng liên quan: từ sidebar Dashboard.
- Ghi chú: biểu đồ đang placeholder, chưa render chart data thật.

### 3.7 UserProfilePage
- Route: `/profile`
- Module: `pages/profile`
- Mục đích: xem hồ sơ cá nhân.
- Người dùng sử dụng: user đã đăng nhập.
- UI structure: card thông tin read-only theo grid.
- Thành phần chính: `ListScreenHeaderTemplate`, `NoResizeScreenTemplate`.
- Dữ liệu load ban đầu:
  - `GET /api/users/me`.
- Các action người dùng: chỉ xem dữ liệu.
- Form/filter: không.
- API sử dụng: `authService.getProfile`.
- State chính: `profile`, `loading`.
- Validate: không.
- Business logic:
  - Sau khi load profile, dispatch `setUser` để đồng bộ Redux auth.user.
- Permission/Auth: cần đăng nhập.
- Loading/Error/Empty state: loading overlay; dữ liệu trống hiển thị `-`.
- Điều hướng liên quan: mở từ avatar dropdown.
- Ghi chú: chưa có chức năng update profile trên page này.

### 3.8 ProductListPage
- Route: `/products`
- Module: `pages/products`
- Mục đích: duyệt danh mục sản phẩm.
- Người dùng sử dụng: CUSTOMER, WAREHOUSE, OWNER (theo authz path `/products`).
- UI structure:
  - Header + action `Tạo báo giá`.
  - Search bar + filter modal (type, status).
  - Grid card sản phẩm + pagination.
  - Status badge trên card.
- Thành phần chính: `FilterSearchModalBar`, `Pagination`, `CustomButton`.
- Dữ liệu load ban đầu:
  - `GET /api/products` có query page, pageSize, keyword, type, status.
- Các action người dùng: search/filter, đổi trang, xem chi tiết, đi tạo báo giá.
- Form/filter:
  - Search keyword.
  - Type single-select (Ton/Thep Tam).
  - Status single-select (ACTIVE/INACTIVE).
- Table/list: list dạng card, không table.
- Modal/drawer: filter modal của `FilterSearchModalBar`.
- API sử dụng: `productService.getList`.
- State chính: `items`, `total`, `page`, `keyword`, `typeFilter`, `statusFilter`, `loading`.
- Validate: không có validate form phức tạp.
- Business logic:
  - Dữ liệu ảnh sản phẩm đã được service normalize/generate mock image fallback.
- Permission/Auth: theo guard role path.
- Loading/Error/Empty state:
  - Loading overlay.
  - Empty card khi không có item.
  - Error notify.
- Điều hướng liên quan:
  - `/products/:id`, `/quotations/create`.
- Ghi chú:
  - Không có thao tác create/edit/delete sản phẩm tại UI hiện tại.

### 3.9 ProductDetailPage
- Route: `/products/:id`
- Module: `pages/products`
- Mục đích: xem chi tiết sản phẩm + gallery.
- Người dùng sử dụng: role có quyền `/products`.
- UI structure:
  - Header với nút `Quay lại`, `Yêu cầu báo giá`.
  - Cột trái ảnh chính + thumbnail gallery.
  - Cột phải thông tin sản phẩm + status badge.
- Thành phần chính: `ListScreenHeaderTemplate`, `BaseCard`.
- Dữ liệu load ban đầu:
  - `GET /api/products/{id}`.
- Các action người dùng: đổi ảnh active, quay lại list, sang tạo báo giá.
- Form/filter: không.
- API sử dụng: `productService.getDetail`.
- State chính: `product`, `activeImage`, `loading`.
- Validate: không.
- Business logic:
  - Gallery cắt tối đa 6 ảnh từ `product.images`.
- Permission/Auth: theo guard role path.
- Loading/Error/Empty state: loading overlay + notify lỗi.
- Điều hướng liên quan: `/products`, `/quotations/create`.
- Ghi chú: text hiển thị tiếng Việt không dấu trong source hiện tại.

### 3.10 QuotationListPage
- Route: `/quotations`
- Module: `pages/quotations`
- Mục đích: quản lý danh sách báo giá.
- Người dùng sử dụng: CUSTOMER, ACCOUNTANT, OWNER (theo authz path `/quotations`).
- UI structure:
  - Header + nút tạo báo giá.
  - Search + filter modal (status, created date range, total range).
  - DataTable + pagination.
- Thành phần chính: `FilterSearchModalBar`, `DataTable`, `Pagination`.
- Dữ liệu load ban đầu:
  - `GET /api/quotations` (service `getCustomerList`).
- Các action người dùng: search, filter, xem chi tiết, tạo mới.
- Form/filter:
  - Status (`DRAFT/PENDING/CONVERTED/REJECTED`).
  - Created range (`fromDate`,`toDate`) gửi lên API.
  - Total range filter ở client (`min/max`).
- Table/list:
  - Cột: quotation number, status, total, valid until, created at.
- API sử dụng: `quotationService.getCustomerList`.
- State chính: `items`, `total`, `page`, `keyword`, `status`, `createdRange`, `totalRange`, `loading`.
- Validate: không có validate input nâng cao.
- Business logic:
  - Filter totalRange xử lý client-side sau khi nhận page data.
- Permission/Auth: theo guard role path.
- Loading/Error/Empty state: loading overlay + notify lỗi.
- Điều hướng liên quan: `/quotations/create`, `/quotations/:id`.
- Ghi chú: total pagination có thể lệch khi filter theo totalRange client-side.

### 3.11 QuotationCreatePage
- Route: `/quotations/create`
- Module: `pages/quotations`
- Mục đích: tạo báo giá mới, preview, lưu draft, submit.
- Người dùng sử dụng: role có quyền `/quotations`.
- UI structure:
  - Section Customer Context.
  - Section Products (select product + quantity, bảng item).
  - Section Quotation Info (project, promotion, delivery requirements, note, preview summary).
  - Action buttons: Preview / Save Draft / Submit / Back.
- Thành phần chính: `FormSectionCard`, `CustomSelect`, `CustomTextField`, `DataTable`(bảng item viết tay bằng `<table>`), `CustomButton`.
- Dữ liệu load ban đầu:
  - `GET /api/customer/quotation-form-init?page=1&pageSize=100`.
  - Data nhận: customer context, products, projects, available promotions.
- Các action người dùng:
  - Thêm product vào quotation.
  - Sửa quantity từng dòng.
  - Remove item.
  - Preview báo giá.
  - Save draft.
  - Submit tạo quotation.
- Form/filter:
  - Fields chính:
    - `projectId` (optional).
    - `promotionCode` (optional).
    - `deliveryRequirement` (text).
    - `note` (text).
    - `items[]` gồm `productId`, `quantity`.
- Table/list:
  - Bảng item hiển thị code/name/spec/unit/reference price/amount.
- Modal/drawer: không.
- API sử dụng:
  - `quotationService.getFormInit`.
  - `quotationService.preview` (`POST /api/quotations/preview`).
  - `quotationService.saveDraft` (`POST /api/quotations/draft`).
  - `quotationService.create` (`POST /api/quotations`).
- State chính:
  - Product/project/promotion options.
  - `quotationItems`, `previewResult`, `isPreviewStale`.
  - `pageLoading`, `loading`.
- Validate:
  - Ít nhất 1 item.
  - Tối đa 20 item.
  - Quantity từng item > 0.
  - Delivery requirement <= 1000 ký tự.
  - Note <= 1000 ký tự.
  - Promotion code <= 50 ký tự.
  - Submit bắt buộc đã preview và preview chưa stale.
  - Submit yêu cầu preview validation valid.
  - Submit yêu cầu total >= 10,000,000 VND.
- Business logic:
  - Thêm lại cùng product thì cộng quantity.
  - Mọi thay đổi form làm preview stale.
  - Cảnh báo nếu tổng preview dưới ngưỡng.
- Permission/Auth: theo guard role path.
- Loading/Error/Empty state:
  - `pageLoading` cho load init.
  - `loading` cho preview/save/submit.
  - Error qua notify.
- Điều hướng liên quan:
  - Save draft hoặc submit thành công -> `/quotations/:id`.
  - Back -> `/quotations`.
- Ghi chú:
  - `CustomTextField` không render `<textarea>` thật dù truyền `type="textarea"`.

### 3.12 QuotationDetailPage
- Route: `/quotations/:id`
- Module: `pages/quotations`
- Mục đích: xem chi tiết báo giá + lịch sử hành động.
- Người dùng sử dụng: role có quyền `/quotations`.
- UI structure:
  - Header action theo role.
  - Thông tin summary báo giá.
  - DataTable items.
  - History list.
- Thành phần chính: `DataTable`, `ListScreenHeaderTemplate`.
- Dữ liệu load ban đầu:
  - Song song `GET /api/quotations/{id}` + `GET /api/quotations/{id}/history`.
- Các action người dùng:
  - Submit draft (non-customer).
  - Create contract (ACCOUNTANT, có quyền từ payload actions).
  - Back.
- Form/filter: không.
- Table/list: bảng items + timeline lịch sử.
- API sử dụng:
  - `quotationService.getDetail`.
  - `quotationService.getHistory`.
  - `quotationService.submit(id)` (submit by id).
- State chính: `quotation`, `history`, `loading`, `submitting`.
- Validate:
  - Nút Submit Draft chỉ enable khi status = `DRAFT`.
- Business logic:
  - Quyền tạo hợp đồng phụ thuộc `quotation.actions.accountantCanCreateContract`.
- Permission/Auth:
  - Ẩn submit cho CUSTOMER.
  - Hiện create contract cho ACCOUNTANT.
- Loading/Error/Empty state: loading overlay, notify lỗi, history empty message.
- Điều hướng liên quan:
  - `/quotations`, `/contracts/create/:quotationId`.
- Ghi chú: không có edit trực tiếp quotation trong page này.
### 3.13 ContractListPage
- Route: `/contracts`
- Module: `pages/contracts`
- Mục đích: quản lý danh sách hợp đồng.
- Người dùng sử dụng: ACCOUNTANT, OWNER (theo authz path `/contracts`).
- UI structure:
  - Search + filter modal (status/date range/total range).
  - DataTable + pagination.
- Thành phần chính: `FilterSearchModalBar`, `DataTable`, `Pagination`.
- Dữ liệu load ban đầu:
  - `GET /api/contracts` (keyword + status).
- Các action người dùng: xem detail, vào edit.
- Form/filter:
  - status filter gửi API.
  - createdRange + totalRange xử lý ở client.
- Table/list:
  - Cột: contract id, quotationId, customerId, status, total, createdAt.
- API sử dụng: `contractService.getList`.
- State chính: `allItems`, `filteredItems`, `page`, `keyword`, `status`, `createdRange`, `totalRange`, `loading`.
- Validate: không.
- Business logic:
  - Client-side filter theo ngày tạo/tổng tiền sau khi đã gọi API.
- Permission/Auth: theo guard role path.
- Loading/Error/Empty state: loading overlay + notify lỗi.
- Điều hướng liên quan: `/contracts/:id`, `/contracts/:id/edit`.
- Ghi chú: chưa có nút tạo hợp đồng trực tiếp từ list.

### 3.14 ContractCreatePage
- Route: `/contracts/create/:quotationId`
- Module: `pages/contracts`
- Mục đích: tạo hợp đồng từ báo giá.
- Người dùng sử dụng: chủ yếu ACCOUNTANT.
- UI structure:
  - Quotation info readonly.
  - Quotation items readonly table.
  - Form Contract terms.
  - Nút back/create.
- Thành phần chính: `FormSectionCard`, `DataTable`, `CustomTextField`, `CustomButton`.
- Dữ liệu load ban đầu:
  - `GET /api/quotations/{quotationId}`.
- Các action người dùng: nhập payment terms + delivery address, tạo contract.
- Form/filter:
  - Fields: `paymentTerms`, `deliveryAddress`.
- API sử dụng:
  - `contractService.create` (`POST /api/contracts`).
- State chính:
  - Quotation snapshot (`quotation`, number, customerLabel, total).
  - `canCreateFromQuotation`, `paymentTerms`, `deliveryAddress`, loading states.
- Validate:
  - Có `quotationId`.
  - `paymentTerms` bắt buộc, <=255.
  - `deliveryAddress` bắt buộc, <=500.
  - `quotation.actions.accountantCanCreateContract` phải true.
  - `quotation.customerId` bắt buộc.
- Business logic:
  - Tự map item từ quotation sang contract payload.
  - Unit price fallback từ `totalPrice/quantity` nếu thiếu `unitPrice`.
- Permission/Auth:
  - UI không hard-block theo role ở page, nhưng route `/contracts` chỉ cho ACCOUNTANT/OWNER.
- Loading/Error/Empty state:
  - Page loading khi load quotation.
  - Action loading khi tạo.
  - Notify lỗi.
- Điều hướng liên quan:
  - Back về quotation detail.
  - Tạo thành công -> contract detail.
- Ghi chú: text breadcrumb trong source có ký tự lỗi encoding.

### 3.15 ContractDetailPage
- Route: `/contracts/:id`
- Module: `pages/contracts`
- Mục đích: xem chi tiết hợp đồng và xử lý submit/approve/reject.
- Người dùng sử dụng: ACCOUNTANT/OWNER và trường hợp đặc biệt raw role ADMIN.
- UI structure:
  - Header action theo role.
  - Summary thông tin hợp đồng.
  - DataTable item hợp đồng.
- Thành phần chính: `DataTable`, `CustomButton`.
- Dữ liệu load ban đầu:
  - `GET /api/contracts/{id}`.
- Các action người dùng:
  - Submit hợp đồng (ACCOUNTANT).
  - Approve/reject (OWNER hoặc raw localStorage role = ADMIN).
  - Theo dõi.
  - Chỉnh sửa.
- Form/filter: không.
- API sử dụng:
  - `contractService.getDetail`.
  - `contractService.submit`.
  - `contractService.approve`.
  - `contractService.reject`.
- State chính: `contract`, `loading`, `actionLoading`.
- Validate:
  - Chỉ disable action khi không có contract hoặc đang actionLoading.
- Business logic:
  - Role check riêng cho nút action.
- Permission/Auth:
  - Route guard theo path `/contracts`.
  - Action guard nội bộ theo role.
- Loading/Error/Empty state:
  - Loading overlay.
  - Notify lỗi action/API.
- Điều hướng liên quan:
  - `/contracts/:id/tracking`, `/contracts/:id/edit`.
- Ghi chú:
  - Không check status trước approve/reject tại client.

### 3.16 ContractEditPage
- Route: `/contracts/:id/edit`
- Module: `pages/contracts`
- Mục đích: cập nhật hợp đồng.
- Người dùng sử dụng: ACCOUNTANT/OWNER.
- UI structure:
  - 2 section form: thông tin hợp đồng + điều khoản.
- Thành phần chính: `FormSectionCard`, `CustomTextField`, `CustomButton`.
- Dữ liệu load ban đầu:
  - `GET /api/contracts/{id}`.
- Các action người dùng: sửa field và lưu.
- Form/filter:
  - Fields: quotationId, customerId, productId, quantity, unitPrice, paymentTerms, deliveryAddress, deliveryTerms, note, expectedDeliveryDate, confidential, status, changeReason.
- API sử dụng:
  - `PUT /api/contracts/{id}`.
- State chính: toàn bộ field form + `pageLoading`, `saving`.
- Validate:
  - Bắt buộc `quotationId`.
  - Các field còn lại không check chặt ở client.
- Business logic:
  - Payload update chỉ gửi **1 item** từ field `productId/quantity/unitPrice`.
  - Field `status` có trên UI nhưng không map vào payload update.
  - ACCOUNTANT bị disable input status.
- Permission/Auth: theo guard `/contracts` + disable status theo role.
- Loading/Error/Empty state: loading overlay khi load, disable save khi saving.
- Điều hướng liên quan: lưu xong về detail.
- Ghi chú:
  - Rủi ro mất item nếu contract có nhiều item nhưng chỉ edit item đầu.

### 3.17 ContractTrackingPage
- Route: `/contracts/:id/tracking`
- Module: `pages/contracts`
- Mục đích: theo dõi timeline trạng thái hợp đồng.
- Người dùng sử dụng: role có quyền `/contracts`.
- UI structure: current status + danh sách timeline event.
- Thành phần chính: `BaseCard`.
- Dữ liệu load ban đầu:
  - `GET /api/contracts/{id}/tracking`.
- Các action người dùng: xem timeline, quay lại.
- Form/filter: không.
- API sử dụng: `contractService.track`.
- State chính: `timeline`, `currentStatus`, `loading`.
- Validate: không.
- Business logic:
  - Service map backend event sang `timeline` chuẩn frontend.
- Permission/Auth: theo guard path.
- Loading/Error/Empty state: loading overlay, notify lỗi.
- Điều hướng liên quan: về `/contracts`.
- Ghi chú: không có empty-specific UI cho timeline trống.

### 3.18 ContractApprovalListPage
- Route code-level: `/approvals/contracts`
- Route thực thi trong App: đang redirect sang `/quotations`.
- Module: `pages/approvals`
- Mục đích thiết kế: danh sách hợp đồng chờ duyệt (PENDING).
- Người dùng sử dụng: dự kiến OWNER/ADMIN.
- UI structure: search + table + pagination.
- Thành phần chính: `FilterSearchModalBar`, `DataTable`, `Pagination`.
- Dữ liệu load ban đầu (nếu page được mount):
  - `GET /api/contracts?status=PENDING`.
- Các action người dùng: mở chi tiết phê duyệt.
- Form/filter: chỉ search keyword.
- API sử dụng: `contractService.getList`.
- State chính: `allItems`, `keyword`, `page`, `loading`.
- Validate: không.
- Business logic: lọc pending từ API query.
- Permission/Auth: chưa thấy guard riêng cho approval ngoài route/authz tổng.
- Loading/Error/Empty state: loading overlay + notify.
- Điều hướng liên quan: `/approvals/contracts/:id`.
- Ghi chú:
  - Trong `App.tsx`, route này hiện **không render page thật**, mà redirect về quotation list.

### 3.19 ContractApprovalDetailPage
- Route code-level: `/approvals/contracts/:id`
- Route thực thi trong App: đang redirect sang `/quotations`.
- Module: `pages/approvals`
- Mục đích thiết kế: xem chi tiết để approve/reject/request modification.
- Người dùng sử dụng: dự kiến OWNER/ADMIN.
- UI structure: summary contract + 3 nút decision.
- Thành phần chính: `BaseCard`, `CustomButton`.
- Dữ liệu load ban đầu:
  - `GET /api/contracts/{id}`.
- Các action người dùng:
  - Approve.
  - Reject.
  - Request modification.
- API sử dụng:
  - `contractService.approve`.
  - `contractService.reject`.
  - `contractService.requestModification`.
- State chính: `contract`, `loading`, `actionLoading`.
- Validate: không có rule status trước khi decision.
- Business logic:
  - Sau action -> navigate approval list.
- Permission/Auth: theo thiết kế là admin/owner, nhưng route thật đang redirect.
- Loading/Error/Empty state: loading overlay, notify lỗi.
- Điều hướng liên quan: `/approvals/contracts`.
- Ghi chú:
  - Hiện chưa truy cập được qua route chính của App.
### 3.20 CustomerListPage
- Route: `/customers`
- Module: `pages/customers`
- Mục đích: quản lý danh sách khách hàng.
- Người dùng sử dụng: ACCOUNTANT, OWNER.
- UI structure: search + status filter + table + pagination.
- Thành phần chính: `FilterSearchModalBar`, `DataTable`, `Pagination`.
- Dữ liệu load ban đầu:
  - `GET /api/customers` với keyword/status.
- Các action người dùng: search/filter, xem detail, tạo customer.
- Form/filter:
  - Search keyword.
  - Status ACTIVE/INACTIVE.
- Table/list:
  - Cột: id, fullName, email, phone, status.
- API sử dụng: `customerService.getList`.
- State chính: `allItems`, `page`, `keyword`, `status`, `loading`.
- Validate: không.
- Business logic:
  - Pagination local sau khi fetch toàn list.
- Permission/Auth: theo guard `/customers`.
- Loading/Error/Empty state: loading overlay + notify; empty dùng default DataTable text.
- Điều hướng liên quan:
  - `/customers/create`, `/customers/:id`.
- Ghi chú: không có delete customer ở UI.

### 3.21 CustomerDetailPage
- Route: `/customers/:id`
- Module: `pages/customers`
- Mục đích: xem thông tin chi tiết khách hàng.
- Người dùng sử dụng: ACCOUNTANT, OWNER.
- UI structure: card thông tin key-value + action edit/back.
- Thành phần chính: `BaseCard`, `CustomButton`.
- Dữ liệu load ban đầu:
  - `GET /api/customers/{id}`.
- Các action người dùng: edit, back.
- Form/filter: không.
- API sử dụng: `customerService.getDetail`.
- State chính: `customer`, `loading`.
- Validate: không.
- Business logic: hiển thị fallback field (`companyName ?? fullName`).
- Permission/Auth: theo guard `/customers`.
- Loading/Error/Empty state: loading overlay, notify lỗi, fallback text khi null.
- Điều hướng liên quan: list/edit.
- Ghi chú: format tiền dùng helper `toCurrency`.

### 3.22 CustomerCreatePage
- Route: `/customers/create`
- Module: `pages/customers`
- Mục đích: tạo mới khách hàng.
- Người dùng sử dụng: ACCOUNTANT, OWNER.
- UI structure: form nhập thông tin khách hàng + nút lưu/quay lại.
- Thành phần chính: `FormSectionCard`, `CustomTextField`, `CustomButton`.
- Dữ liệu load ban đầu: không.
- Các action người dùng: nhập form, tạo khách hàng.
- Form/filter:
  - Fields: companyName, contactPerson, customerType, email, phone, creditLimit, status, address.
- API sử dụng:
  - `POST /api/customers`.
- State chính: field form + `loading`.
- Validate:
  - Credit limit parse number >=0 mới gửi.
  - Không check bắt buộc cứng ở client.
- Business logic:
  - `fullName` gửi lên lấy từ `contactPerson` hoặc `companyName`.
  - Nếu role ACCOUNTANT: disable chỉnh `status`.
- Permission/Auth: theo guard `/customers`.
- Loading/Error/Empty state: disable save khi loading + notify lỗi.
- Điều hướng liên quan: tạo thành công về detail, hoặc quay list.
- Ghi chú: không có dropdown chuẩn cho status/customerType, dùng text input.

### 3.23 CustomerEditPage
- Route: `/customers/:id/edit`
- Module: `pages/customers`
- Mục đích: chỉnh sửa khách hàng.
- Người dùng sử dụng: ACCOUNTANT, OWNER.
- UI structure: tương tự create, có prefill dữ liệu.
- Thành phần chính: `FormSectionCard`, `CustomTextField`, `CustomButton`.
- Dữ liệu load ban đầu:
  - `GET /api/customers/{id}`.
- Các action người dùng: cập nhật thông tin.
- Form/filter: giống CustomerCreate.
- API sử dụng:
  - `PUT /api/customers/{id}`.
- State chính: field form, `pageLoading`, `saving`.
- Validate:
  - Credit limit number >=0.
  - Không có validate bắt buộc khác.
- Business logic:
  - ACCOUNTANT không được sửa status tại UI.
- Permission/Auth: theo guard `/customers`.
- Loading/Error/Empty state: loading overlay khi prefill, notify lỗi.
- Điều hướng liên quan: save xong về detail.
- Ghi chú: không có change log/audit tại UI.

### 3.24 ProjectListPage
- Route: `/projects`
- Module: `pages/projects`
- Mục đích: quản lý danh sách dự án.
- Người dùng sử dụng: CUSTOMER, ACCOUNTANT, WAREHOUSE, OWNER.
- UI structure: search + status filter + table + pagination + create button.
- Thành phần chính: `FilterSearchModalBar`, `DataTable`, `Pagination`.
- Dữ liệu load ban đầu:
  - `GET /api/projects`.
- Các action người dùng: search/filter, xem detail, tạo mới.
- Form/filter:
  - Status NEW/IN_PROGRESS/ON_HOLD/DONE.
- Table/list:
  - Cột: id, code, name, customerId, status, progress.
- API sử dụng: `projectService.getList`.
- State chính: `allItems`, `pagedItems`, `keyword`, `status`, `page`, `loading`.
- Validate: không.
- Business logic: pagination local.
- Permission/Auth: theo guard `/projects`.
- Loading/Error/Empty state: loading overlay + notify.
- Điều hướng liên quan: create/detail.
- Ghi chú: không có delete/archive action ở UI.

### 3.25 ProjectDetailPage
- Route: `/projects/:id`
- Module: `pages/projects`
- Mục đích: xem chi tiết dự án.
- Người dùng sử dụng: role có quyền `/projects`.
- UI structure: card key-value + action update/assign warehouse.
- Thành phần chính: `BaseCard`, `CustomButton`.
- Dữ liệu load ban đầu:
  - `GET /api/projects/{id}`.
- Các action người dùng: vào edit, vào assign warehouse.
- Form/filter: không.
- API sử dụng: `projectService.getDetail`.
- State chính: `project`, `loading`.
- Validate: không.
- Business logic: hiển thị tiến độ `%`.
- Permission/Auth: guard path `/projects`.
- Loading/Error/Empty state: loading overlay, notify lỗi, fallback text khi null.
- Điều hướng liên quan: edit/assign/list.
- Ghi chú: nhiều trường nâng cao của project model chưa hiển thị.

### 3.26 ProjectCreatePage
- Route: `/projects/create`
- Module: `pages/projects`
- Mục đích: tạo dự án.
- Người dùng sử dụng: ACCOUNTANT, OWNER (menu create hiển thị cho ACCOUNTANT/OWNER, owner toàn quyền).
- UI structure: form 6 field + lưu/quay lại.
- Thành phần chính: `FormSectionCard`, `CustomTextField`, `CustomButton`.
- Dữ liệu load ban đầu: không.
- Các action người dùng: nhập và tạo project.
- Form/filter:
  - Fields: code, name, customerId, warehouseId, status, progress.
- API sử dụng:
  - `POST /api/projects`.
- State chính: field form + `loading`.
- Validate: hầu như không validate client-side.
- Business logic:
  - Gửi alias legacy fields (`code`,`warehouseId`,`progress`) qua service để map request mới.
- Permission/Auth: theo guard `/projects`.
- Loading/Error/Empty state: disable save khi loading, notify lỗi.
- Điều hướng liên quan: thành công về project detail.
- Ghi chú: field status đang free text, không khóa enum.

### 3.27 ProjectEditPage
- Route: `/projects/:id/edit`
- Module: `pages/projects`
- Mục đích: cập nhật dự án và cập nhật progress.
- Người dùng sử dụng: role có quyền `/projects`.
- UI structure: form tương tự create.
- Thành phần chính: `FormSectionCard`, `CustomTextField`, `CustomButton`.
- Dữ liệu load ban đầu:
  - `GET /api/projects/{id}`.
- Các action người dùng: lưu cập nhật.
- Form/filter: code, name, customerId, warehouseId, status, progress.
- API sử dụng:
  - `PUT /api/projects/{id}`.
  - `POST /api/projects/{id}/progress` (hoặc updateProgress endpoint theo service).
- State chính: field form, `pageLoading`, `saving`.
- Validate: không validate mạnh.
- Business logic:
  - Sau update project sẽ gọi thêm `updateProgress` với note hardcode `Updated from ProjectEditPage`.
- Permission/Auth: theo guard `/projects`.
- Loading/Error/Empty state: loading overlay và notify lỗi.
- Điều hướng liên quan: save xong về detail.
- Ghi chú: gọi 2 API liên tiếp, không rollback nếu API 2 fail.

### 3.28 ProjectAssignWarehousePage
- Route: `/projects/:id/assign-warehouse`
- Module: `pages/projects`
- Mục đích: gán kho cho dự án.
- Người dùng sử dụng: role có quyền project update.
- UI structure: form 1 field warehouseId + xác nhận/quay lại.
- Thành phần chính: `FormSectionCard`, `CustomTextField`, `CustomButton`.
- Dữ liệu load ban đầu: không.
- Các action người dùng: nhập warehouseId và submit.
- Form/filter:
  - Field: `warehouseId`.
- API sử dụng:
  - `POST /api/projects/{id}/warehouses` (service `assignWarehouse`).
- State chính: `warehouseId`, `loading`.
- Validate:
  - Button disabled nếu `warehouseId` trống.
- Business logic: thành công về project detail.
- Permission/Auth: theo guard `/projects`.
- Loading/Error/Empty state: notify lỗi, disable nút khi loading.
- Điều hướng liên quan: detail/list.
- Ghi chú: không có chọn kho từ dropdown master data.
### 3.29 PaymentListPage
- Route: `/payments`
- Module: `pages/payments`
- Mục đích: quản lý hóa đơn thanh toán và theo dõi công nợ.
- Người dùng sử dụng: CUSTOMER, ACCOUNTANT, OWNER.
- UI structure:
  - Card 1: list invoice có search/filter/table/pagination.
  - Card 2: Debt Status table.
- Thành phần chính: `FilterSearchModalBar`, `DataTable`, `Pagination`, `BaseCard`.
- Dữ liệu load ban đầu:
  - Song song:
    - `GET /api/invoices`.
    - `GET /api/debts`.
- Các action người dùng: search/filter, xem invoice detail, record payment.
- Form/filter:
  - Status UNPAID/PARTIAL/PAID.
  - Due date range client-side.
  - Total amount range client-side.
- Table/list:
  - Invoice table và debt table.
- API sử dụng:
  - `paymentService.getInvoiceList`.
  - `paymentService.getDebtStatus`.
- State chính:
  - `allInvoices`, `debtItems`, `keyword`, `status`, `dueDateRange`, `totalRange`, `page`, `loading`.
- Validate: không validate input nâng cao.
- Business logic:
  - Lọc date/amount ở client sau khi lấy data.
- Permission/Auth: theo guard `/payments`.
- Loading/Error/Empty state: loading overlay + notify lỗi.
- Điều hướng liên quan: `/payments/:id`, `/payments/:id/record`.
- Ghi chú: chưa có export/bulk action.

### 3.30 PaymentDetailPage
- Route: `/payments/:id`
- Module: `pages/payments`
- Mục đích: xem chi tiết hóa đơn.
- Người dùng sử dụng: role có quyền `/payments`.
- UI structure: card key-value + nút ghi nhận thanh toán.
- Thành phần chính: `BaseCard`, `CustomButton`.
- Dữ liệu load ban đầu:
  - `GET /api/invoices/{id}`.
- Các action người dùng: sang record payment.
- Form/filter: không.
- API sử dụng: `paymentService.getInvoiceDetail`.
- State chính: `invoice`, `loading`.
- Validate: không.
- Business logic: hiển thị tổng tiền/đã trả/còn lại.
- Permission/Auth: theo guard `/payments`.
- Loading/Error/Empty state: loading overlay + notify + fallback text.
- Điều hướng liên quan: list, record payment.
- Ghi chú: chưa hiển thị lịch sử từng lần thanh toán.

### 3.31 RecordPaymentPage
- Route: `/payments/:id/record`
- Module: `pages/payments`
- Mục đích: ghi nhận thanh toán cho invoice.
- Người dùng sử dụng: role có quyền `/payments`.
- UI structure: form amount/paidAt/method/note + action confirm/back.
- Thành phần chính: `FormSectionCard`, `CustomTextField`, `CustomButton`.
- Dữ liệu load ban đầu:
  - `paidAt` mặc định ngày hiện tại (YYYY-MM-DD).
- Các action người dùng: nhập form và submit.
- Form/filter:
  - Fields: `amount:number`, `paidAt:string`, `method:string`, `note:string`.
- API sử dụng:
  - `POST /api/invoices/{id}/payments`.
- State chính: fields + `loading`.
- Validate:
  - Nút confirm disable khi `amount` trống.
  - Không check amount > 0 ở client.
- Business logic: thành công quay về invoice detail.
- Permission/Auth: theo guard `/payments`.
- Loading/Error/Empty state: disable nút khi loading.
- Điều hướng liên quan: payment detail/list.
- Ghi chú: `paidAt` đang nhập text/date string, không bắt buộc format cứng ở client.

### 3.32 DashboardReportPage
- Route: `/reports/dashboard`
- Module: `pages/reports`
- Mục đích: báo cáo dashboard tài chính/tổng quan.
- Người dùng sử dụng: ACCOUNTANT, OWNER.
- UI structure: stats grid + 2 chart placeholder.
- Thành phần chính: `StatsGrid`, `ChartCard`, `BaseCard`.
- Dữ liệu load ban đầu:
  - `GET /api/reports/dashboard`.
- Các action người dùng: xem tổng quan.
- Form/filter: không.
- API sử dụng: `reportService.getDashboard`.
- State chính: 4 summary số liệu + `loading`.
- Validate: không.
- Business logic: map summary vào KPI card.
- Permission/Auth: theo guard role path reports.
- Loading/Error/Empty state: loading overlay, notify lỗi.
- Điều hướng liên quan: nhóm report.
- Ghi chú: chart chỉ placeholder.

### 3.33 SalesReportPage
- Route: `/reports/sales`
- Module: `pages/reports`
- Mục đích: báo cáo doanh số theo kỳ.
- Người dùng sử dụng: ACCOUNTANT, OWNER.
- UI structure: search bar + data table.
- Thành phần chính: `TableFilterBar`, `DataTable`.
- Dữ liệu load ban đầu:
  - `GET /api/reports/sales`.
- Các action người dùng: search theo period.
- Form/filter: keyword filter local theo `period`.
- API sử dụng: `reportService.getSalesReport`.
- State chính: `items`, `keyword`, `loading`.
- Validate: không.
- Business logic: filter local trên kết quả report.
- Permission/Auth: theo guard role reports sales.
- Loading/Error/Empty state: loading overlay + notify.
- Điều hướng liên quan: báo cáo khác.
- Ghi chú: không có pagination, hiển thị toàn bộ list.

### 3.34 InventoryReportPage
- Route: `/reports/inventory`
- Module: `pages/reports`
- Mục đích: báo cáo tồn kho.
- Người dùng sử dụng: WAREHOUSE, OWNER.
- UI structure: search bar + table tồn kho.
- Thành phần chính: `TableFilterBar`, `DataTable`.
- Dữ liệu load ban đầu:
  - `GET /api/reports/inventory`.
- Các action người dùng: search code/tên sản phẩm.
- Form/filter: keyword local.
- API sử dụng: `reportService.getInventoryReport`.
- State chính: `items`, `keyword`, `loading`.
- Validate: không.
- Business logic: filter local trên `productCode` hoặc `productName`.
- Permission/Auth: theo guard role reports inventory.
- Loading/Error/Empty state: loading overlay + notify.
- Điều hướng liên quan: báo cáo khác.
- Ghi chú: không có filter theo kho dù model report có `warehouseId`.

### 3.35 FinancialReportPage
- Route: `/reports/financial`
- Module: `pages/reports`
- Mục đích: báo cáo tài chính + trạng thái dự án.
- Người dùng sử dụng: ACCOUNTANT, OWNER.
- UI structure:
  - Card summary doanh thu/công nợ.
  - Card table tình trạng tài chính project + search.
- Thành phần chính: `BaseCard`, `TableFilterBar`, `DataTable`.
- Dữ liệu load ban đầu:
  - `GET /api/reports/projects`.
  - `GET /api/reports/dashboard`.
- Các action người dùng: search project theo tên/id.
- Form/filter: keyword local.
- API sử dụng:
  - `reportService.getProjectReport`.
  - `reportService.getDashboard`.
- State chính: `projectRows`, `summaryRevenue`, `summaryDebt`, `keyword`, `loading`.
- Validate: không.
- Business logic: ghép 2 nguồn report để hiển thị.
- Permission/Auth: theo guard role reports financial.
- Loading/Error/Empty state: loading overlay + notify.
- Điều hướng liên quan: báo cáo khác.
- Ghi chú: chưa có drill-down từ project sang màn hình project detail.

### 3.36 NotFoundPage
- Route: `*`
- Module: `pages/404`
- Mục đích: xử lý đường dẫn không tồn tại.
- Người dùng sử dụng: mọi người.
- UI structure: card 404 + nút về trang chủ/thử lại/báo lỗi.
- Thành phần chính: `NoResizeScreenTemplate`, `ListScreenHeaderTemplate`.
- Dữ liệu load ban đầu: không.
- API sử dụng: không.
- State chính: không đáng kể.
- Validate: không.
- Business logic: `Retry` reload trang, `Go Home` về `/`.
- Permission/Auth: không yêu cầu.
- Loading/Error/Empty state: không.
- Điều hướng liên quan: về `/`.
- Ghi chú: action `Báo lỗi` hiện chưa có xử lý.

### 3.37 TestPage (Showcase)
- Route: `/test`
- Module: `pages/404` (file test page nằm trong thư mục 404).
- Mục đích: showcase component UI, không phải flow nghiệp vụ production.
- Người dùng sử dụng: dev/test.
- UI structure: rất nhiều section demo auth/table/form/card/modal.
- Thành phần chính: gần như toàn bộ component shared.
- Dữ liệu load ban đầu: dữ liệu mock local.
- API sử dụng: không.
- State chính: search/filter/pagination/mock modal.
- Validate: không có rule nghiệp vụ thật.
- Business logic: demo tương tác component.
- Permission/Auth: có route riêng trong App, không guard riêng.
- Loading/Error/Empty state: không đáng kể.
- Điều hướng liên quan: không thuộc luồng nghiệp vụ chính.
- Ghi chú: nên xem như sandbox UI.

### 3.38 Root redirect `/`
- Route: `/`
- Mục đích: điểm vào hệ thống.
- Business logic:
  - Có token + role hợp lệ -> redirect default theo role.
  - Không có session -> redirect `/login`.
- API: không gọi trực tiếp tại route này.

---
## 4. Component dùng chung quan trọng

### 4.1 AppLayout
- Mục đích: khung chính sau đăng nhập.
- Dùng ở đâu: toàn bộ route authenticated.
- Props chính: `children`.
- Hành vi UI:
  - Sidebar desktop có thể collapse.
  - Sidebar mobile mở bằng overlay.
  - TopNavbar có nút toggle.
- Ghi chú nghiệp vụ: điều hướng sidebar dùng `navigate(path)`.

### 4.2 Sidebar + SidebarItem
- Mục đích: menu điều hướng theo role.
- Dùng ở đâu: `AppLayout`.
- Props chính:
  - `collapsed`, `activePath`, `onNavigate`.
- Hành vi UI:
  - Menu tree có nhóm con.
  - Filter item theo role (`ROLE_MENU_IDS`).
- Ghi chú nghiệp vụ:
  - Mapping menu role khác với route authz ở một số điểm (ví dụ approvals không xuất hiện trên sidebar).

### 4.3 TopNavbar + UserAvatarDropdown + NotificationBell
- Mục đích: top-level action và session action.
- Dùng ở đâu: `AppLayout`.
- Props chính:
  - `TopNavbar`: `onToggleSidebar`.
- Hành vi UI:
  - NotificationBell dùng dữ liệu dummy local.
  - UserAvatarDropdown có profile + logout.
- Ghi chú nghiệp vụ:
  - Logout vẫn clear client session ngay cả khi API logout fail.

### 4.4 ListScreenHeaderTemplate
- Mục đích: header nhất quán cho list/form page.
- Dùng ở đâu: hầu hết page business.
- Props chính: `title`, `breadcrumb`, `actions`, `className`.
- Hành vi UI: render breadcrumb + action góc phải.
- Ghi chú nghiệp vụ: nếu không truyền breadcrumb thì fallback `AppBreadcrumb`.

### 4.5 NoResizeScreenTemplate
- Mục đích: khung body fixed, scroll nội dung, tích hợp footer/loading overlay.
- Dùng ở đâu: đa số page business.
- Props chính: `header`, `body`, `loading`, `loadingText`, `bodyClassName`.
- Hành vi UI: hiển thị `Loading` overlay khi `loading=true`.
- Ghi chú nghiệp vụ: chuẩn hóa spacing/margin toàn page.

### 4.6 FilterSearchModalBar
- Mục đích: thanh search + modal filter đa kiểu.
- Dùng ở đâu: list pages (products/customers/projects/quotations/contracts/payments/approvals).
- Props chính:
  - `searchValue`, `onSearchChange`, `onSearchReset`.
  - `filters` (options/dateRange/numberRange).
  - `onApplyFilters`.
- Hành vi UI:
  - Hiển thị tag filter đã áp dụng.
  - Có clear all filter.
  - Filter được chỉnh ở draft state trong modal, apply mới commit.
- Ghi chú nghiệp vụ: đây là cơ chế filter chuẩn toàn hệ thống list page.

### 4.7 DataTable
- Mục đích: bảng generic.
- Dùng ở đâu: hầu hết màn list/detail có bảng.
- Props chính: `columns`, `data`, `actions`, `emptyText`.
- Hành vi UI: render column custom, action column optional.
- Ghi chú nghiệp vụ: key row đang dùng index (`row-${index}`), không tối ưu cho reorder dữ liệu.

### 4.8 Pagination
- Mục đích: điều hướng trang local.
- Dùng ở đâu: list page.
- Props chính: `page`, `pageSize`, `total`, `onChange`.
- Hành vi UI: render nút page đầy đủ từ 1..N.
- Ghi chú nghiệp vụ: với total lớn, số lượng nút page có thể nhiều.

### 4.9 CustomTextField
- Mục đích: input text/password/number dùng chung.
- Dùng ở đâu: gần như toàn bộ form.
- Props chính: `title`, `value`, `type`, `onChange`, `error`, `helperText`, `disabled`.
- Hành vi UI: có toggle show/hide password.
- Ghi chú nghiệp vụ:
  - Khi `type="textarea"` vẫn render `<input>` (không phải textarea thật).

### 4.10 CustomSelect
- Mục đích: select đơn/đa chọn có search.
- Dùng ở đâu: quotation create, table filter bar.
- Props chính: `options`, `value`, `onChange`, `multiple`, `search`, `disable`.
- Hành vi UI: dropdown tự đóng khi click ngoài.
- Ghi chú nghiệp vụ: hỗ trợ `navigateTo` ở label phụ.

### 4.11 NotificationProvider + Notifycation
- Mục đích: thông báo toàn app.
- Dùng ở đâu: bọc app ở `main.tsx`.
- Props chính: `notify(message, type, duration)` qua context hook `useNotify`.
- Hành vi UI:
  - Dispatch custom browser event `ADD_NOTIFICATION`.
  - Toast xuất hiện top-center, có auto-close (trừ loading).
- Ghi chú nghiệp vụ: không lưu notification trong Redux.

### 4.12 AuthCard/AuthHeader/AuthFooter
- Mục đích: layout chuẩn cho auth pages.
- Dùng ở đâu: login/register/forgot/reset/verify.
- Props chính: `title`, `subtitle`, `children`, `footer`.
- Hành vi UI: card có header gradient, footer cố định.
- Ghi chú nghiệp vụ: giúp auth pages nhất quán UI.

---

## 5. Routing và permission

### 5.1 Route tree
- Toàn bộ route khai báo tập trung trong `App.tsx`.
- Không dùng file router riêng (`src/routes` hoặc `src/router` không có).

### 5.2 Layout mapping
- Nhóm public (không qua `AppLayout`):
  - `/login`, `/register`, `/verify-registration`, `/forgot-password`, `/reset-password`.
- Nhóm authenticated (qua `AppLayout` + `Outlet`):
  - dashboard, profile, products, quotations, contracts, customers, projects, payments, reports.

### 5.3 Guard/auth
- `AppAuthenticatedLayout` kiểm tra:
  - Có token + role trong localStorage.
  - Nếu có token/role nhưng Redux chưa có user -> gọi `authService.getProfile` để hydrate user.
  - Nếu hydrate fail -> clear session và logout Redux.
  - Nếu role không có quyền path hiện tại -> redirect default route theo role.
- Root `/` tự redirect theo session.

### 5.4 Permission mapping theo role (canAccessPathByRole)
- `CUSTOMER`:
  - `/dashboard`, `/profile`, `/products`, `/quotations`, `/projects`, `/payments`.
- `ACCOUNTANT`:
  - `/dashboard`, `/profile`, `/customers`, `/projects`, `/contracts`, `/quotations`, `/payments`, `/reports/dashboard`, `/reports/sales`, `/reports/financial`.
- `WAREHOUSE`:
  - `/dashboard`, `/profile`, `/products`, `/projects`, `/reports/inventory`.
- `OWNER`:
  - toàn bộ path.

### 5.5 Menu/sidebar mapping
- Sidebar lọc theo `ROLE_MENU_IDS` riêng.
- Có thể khác nhẹ với route authz:
  - Approval pages có source nhưng không xuất hiện menu và route App đang redirect.

### 5.6 Điểm đặc biệt route approvals
- `ROUTE_URL.CONTRACT_APPROVAL_LIST` và `ROUTE_URL.CONTRACT_APPROVAL_DETAIL` trong `App.tsx` đang map `Navigate -> /quotations`.
- Nghĩa là 2 page approvals hiện chưa hoạt động trong flow route chính, dù code page vẫn tồn tại.

---

## 6. State management và data flow

### 6.1 Global state
- Redux store hiện có 1 slice: `auth`.
- `auth` chứa:
  - `accessToken`, `user`, `isAuthenticated`.
- Actions:
  - `loginSuccess`, `logout`, `setUser`.

### 6.2 Local state
- Phần lớn page dùng `useState` cho:
  - search/filter/page.
  - form field.
  - loading/actionLoading.
  - table data đã load.
- Không dùng React Query/SWR/Zustand.

### 6.3 Notification state
- Không lưu trong Redux.
- Dùng `NotificationContext` + custom event trên `window`.

### 6.4 API fetching
- Pattern phổ biến:
  - `useEffect` gọi service khi dependencies đổi.
  - set `loading=true` trước call và `false` ở finally.
  - lỗi gọi `notify(getErrorMessage(...), "error")`.
- Không có layer cache query tự động.

### 6.5 Axios layer
- `baseURL` lấy từ `VITE_API_BASE_URL`, fallback `http://localhost:8080/api`.
- Request interceptor:
  - Gắn `Authorization: Bearer <access_token>` nếu có.
  - Chuẩn hóa URL tránh `/api/api/...`.
  - lưu timestamp request.
- Response interceptor:
  - Ép thời gian request tối thiểu 1 giây (`MIN_REQUEST_DURATION_MS = 1000`).
  - Nếu payload theo format `{ code, message, data }` thì unwrap `data` khi `code=SUCCESS`.
  - Nếu lỗi business thì ném `ApiClientError` kèm validation errors.

### 6.6 Data adapter/normalizer
- Nhiều service có normalize để tương thích payload backend:
  - `productService`: bổ sung `mainImage/images` fallback bằng picsum.
  - `customerService`: unwrap và normalize field.
  - `projectService`: map alias field cũ/mới (`code/projectCode`, `warehouseId/primaryWarehouseId`, `progress/progressPercent`).
  - `quotationService` + `contractService`: map response list/detail/save/submit về model thống nhất frontend.
- `extractList` hỗ trợ đọc list từ nhiều shape (`items`, `content`, `results`, nested `data`).

### 6.7 Cache/refetch/invalidate
- Không có cơ chế cache/invalidate chuẩn như React Query.
- Refetch chủ yếu bằng:
  - gọi lại API sau action thành công.
  - hoặc navigate sang page khác rồi page đó tự load lại.

### 6.8 Side effects quan trọng
- Login/logout có side effect localStorage + Redux + navigate.
- `AppAuthenticatedLayout` có side effect hydrate profile khi reload app.
- Một số page gọi nhiều API liên tiếp trong 1 action:
  - `ProjectEditPage`: update project rồi update progress.

---

## 7. Business rules quan trọng toàn hệ thống

1. Auth/role
- Session frontend phụ thuộc `access_token` + `user_role` trong localStorage.
- Role string `ACOUNTER` được normalize thành `ACCOUNTANT`.
- Role quyết định default route sau login.

2. Quotation
- Một báo giá tối đa 20 item.
- Mỗi item quantity phải > 0.
- Submit quotation yêu cầu:
  - đã preview,
  - preview chưa stale,
  - preview hợp lệ,
  - tổng tiền >= 10,000,000 VND.
- Có thể save draft trước khi submit.

3. Contract
- Tạo contract từ quotation phụ thuộc cờ backend `actions.accountantCanCreateContract`.
- Contract detail action theo role:
  - ACCOUNTANT: submit hợp đồng.
  - OWNER/ADMIN raw role: approve hoặc reject.
- Approval pages có code nhưng route hiện redirect (chưa active luồng chuẩn).

4. Customer
- Tạo/sửa customer: `fullName` được dựng từ `contactPerson` hoặc `companyName`.
- Role ACCOUNTANT bị khóa chỉnh status customer trên UI.

5. Project
- Update project hiện gọi thêm API update progress ngay sau update thông tin dự án.
- Assign warehouse yêu cầu có warehouseId mới bật nút xác nhận.

6. Payment
- Payment list hiển thị đồng thời invoice và debt status.
- Record payment chỉ check amount không rỗng ở UI, không check amount > 0.

7. UI/UX rule chung
- Hầu hết page business dùng template header + breadcrumb + body card.
- Thao tác lỗi/success thống nhất qua toast notify.
- Các list page ưu tiên search/filter client + pagination local (trừ vài API có pagination metadata).

8. Các thiếu hụt CRUD hiện tại
- Nhiều module mới có C-R-U nhưng chưa có D (delete).
- Không thấy import/export hoặc bulk actions ở các module chính.

---

## 8. Những điểm chưa xác định chắc chắn từ source code

- Chưa xác định chắc chắn từ source code: backend có bắt buộc field nào ở mức validation cuối cùng cho từng API (nhiều form client không validate required rõ ràng).
- Chưa xác định chắc chắn từ source code: policy phân quyền chuẩn cho approvals vì page approvals tồn tại nhưng route trong `App.tsx` đang redirect.
- Chưa xác định chắc chắn từ source code: một số role ngoài enum (`ADMIN`) có được backend phát hành chính thức hay chỉ là legacy tạm thời.
- Chưa xác định chắc chắn từ source code: lý do nghiệp vụ của mapping `inventoryAlertCount * 1,000,000` trong DashboardPage.
- Chưa xác định chắc chắn từ source code: vì sao một số text tiếng Việt bị lỗi encoding (nguồn file hoặc editor settings).
- Chưa xác định chắc chắn từ source code: vì sao `CustomTextField` hỗ trợ type `textarea` nhưng render input thường (có thể chủ ý hoặc bug).
- Chưa xác định chắc chắn từ source code: page `/test` có dùng trong release production hay chỉ phục vụ nội bộ dev.

---

## Phụ lục A - Danh sách màn hình thực tế trong source

### Auth
- LoginPage
- RegisterPage
- VerifyRegistrationPage
- ForgotPasswordPage
- ResetPasswordPage

### Core
- DashboardPage
- UserProfilePage

### Products
- ProductListPage
- ProductDetailPage

### Quotations
- QuotationListPage
- QuotationCreatePage
- QuotationDetailPage

### Contracts
- ContractListPage
- ContractCreatePage
- ContractDetailPage
- ContractEditPage
- ContractTrackingPage

### Approvals (có source nhưng route chính đang redirect)
- ContractApprovalListPage
- ContractApprovalDetailPage

### Customers
- CustomerListPage
- CustomerDetailPage
- CustomerCreatePage
- CustomerEditPage

### Projects
- ProjectListPage
- ProjectDetailPage
- ProjectCreatePage
- ProjectEditPage
- ProjectAssignWarehousePage

### Payments
- PaymentListPage
- PaymentDetailPage
- RecordPaymentPage

### Reports
- DashboardReportPage
- SalesReportPage
- InventoryReportPage
- FinancialReportPage

### Utility
- NotFoundPage
- TestPage
- Root redirect route
