# FE Called Backend APIs

Generated date: 2026-03-29  
Scope scanned: `src/App.tsx`, `src/pages/**`, `src/components/**`, `src/hooks/**`, `src/services/**`, `src/api/**`, `src/apiConfig/**`, `src/models/**`, `src/store/**`, `src/context/**`, `src/utils/**`

## 1. Executive Summary
- Tổng số endpoint FE gọi tới BE (unique `METHOD + PATH` từ service + nhánh động): **79**.
- Tổng số service methods liên quan HTTP: **80**.
- Endpoint `Active / Used`: **70**.
- Endpoint `Defined but unused`: **9**.
- Endpoint `Demo/Test only`: **0** (route `/test` không gọi BE).
- Endpoint `Could not fully confirm active path`: **0**.
- Tổng số module có API usage: **13**.
- Module chính: `Auth`, `User Profile`, `Accounts`, `Products`, `Price Lists`, `Promotions`, `Quotations`, `Contracts`, `Customers`, `Projects`, `Inventory`, `Payments`, `Reports`.

## 2. Global Request / Response Behavior
- `baseURL`: lấy từ `VITE_API_BASE_URL`, fallback `http://localhost:8080/api` (`src/apiConfig/axiosConfig.ts`).
- HTTP client dùng chung: `api` (Axios instance) trong `src/apiConfig/axiosConfig.ts`.
- Request interceptor:
  - gắn `Authorization: Bearer <access_token>` nếu có token trong `localStorage.access_token`.
  - auto-normalize URL: nếu `baseURL` đã kết thúc `/api` nhưng path bắt đầu `/api/...` thì strip `/api` ở request URL để tránh double `/api/api`.
  - gắn metadata thời gian để enforce min request duration (`1000ms`).
- Token/session:
  - đọc/ghi từ `src/utils/authSession.ts` (`access_token`, `user_role`).
  - role được normalize (`ROLE_`, `ACOUNTER`, `ACCOUNTING`, `ADMIN` mapping về role app).
- Response envelope:
  - FE kỳ vọng envelope kiểu `ApiResponse<T> { code, message, data, errors }`.
  - interceptor unwrap khi `code === SUCCESS`: `response.data = payload.data`.
  - nếu `code != SUCCESS` hoặc BE trả lỗi có `payload.code`: throw `ApiClientError`.
- Common error handling:
  - pages dùng `getErrorMessage` (`src/pages/shared/page.utils.ts`) để đọc `ApiClientError`, `axios error.response.data.message`, hoặc fallback.
  - notify qua `useNotify()` (CustomEvent `ADD_NOTIFICATION`).
- Auth/global flow:
  - trong `AppAuthenticatedLayout`, FE gọi `authService.getProfile()` để hydrate user từ token cũ.
- Pagination conventions hiện tại trong FE:
  - `page + size`: `accounts`, `price-lists`, `inventory`, nhiều model payment query.
  - `page + pageSize`: `products`, `promotions`, `quotations`, `projects`.
  - Nhiều list page đang phân trang/filter phía client sau khi fetch (`contracts`, `customers`, `projects`, `payments`) => over-fetch risk.
  - `accounts` đang dùng base-1 (phù hợp thay đổi BE 2026-03-29).

## 3. API Inventory By Module

### Auth

#### [AUTH-01] POST /api/auth/login
- FE status: Active / Used.
- Called from:
  - page(s): `src/pages/auth/LoginPage.tsx`.
  - service function: `authService.login`.
- Route(s): `/login`.
- FE purpose: đăng nhập + tạo session FE.
- Trigger: submit form login.
- Request sent by FE:
  - Body: `{ email, password }`.
  - Headers: JSON; chưa có bearer token ở lần login đầu.
- Example real request payload from FE:
```json
{ "email": "user@company.com", "password": "***" }
```
- Response expected by FE:
  - envelope unwrap bởi interceptor.
  - fields FE đọc: `accessToken`, `user.role`, toàn bộ `user` để lưu Redux.
- FE normalization / mapping:
  - `persistAuthSession(accessToken, user.role)`.
  - special error code `EMAIL_VERIFICATION_REQUIRED` -> redirect `/verify-registration?email=...`.

#### [AUTH-02] POST /api/auth/register
- FE status: Active / Used.
- Called from: `RegisterPage` -> `authService.register`.
- Route(s): `/register`.
- Trigger: submit form đăng ký.
- Request sent by FE:
  - Body: `{ fullName, email, password, confirmPassword }`.
- Response expected by FE:
  - fields FE đọc: `redirectTo`, `email`, `expireMinutes`.
- Response usage in FE:
  - điều hướng sang verify page, pass state `email`, `expireMinutes`.

#### [AUTH-03] POST /api/auth/verify-registration
- FE status: Active / Used.
- Called from: `VerifyRegistrationPage` -> `authService.verifyRegistration`.
- Route(s): `/verify-registration`.
- Trigger: click Verify.
- Request sent by FE:
  - Body: `{ email: trim, verificationCode: uppercase }`.
- Response FE đọc: `redirectTo`.
- Usage: notify success + navigate login/redirect path.

#### [AUTH-04] POST /api/auth/resend-verification-code
- FE status: Active / Used.
- Called from: `VerifyRegistrationPage`.
- Trigger: click Resend.
- Request sent by FE:
  - Body: `{ email: trim }`.
- Response FE đọc: `expireMinutes`.
- Usage: update timer text local UI.

#### [AUTH-05] POST /api/auth/forgot-password
- FE status: Active / Used.
- Called from: `ForgotPasswordPage`.
- Route(s): `/forgot-password`.
- Trigger: submit form.
- Request sent by FE:
  - Body: `{ email }`.
- Response usage: không đọc field; chỉ toast theo success/fail.

#### [AUTH-06] POST /api/auth/reset-password
- FE status: Active / Used.
- Called from: `ResetPasswordPage`.
- Route(s): `/reset-password`.
- Trigger: submit form.
- Request sent by FE:
  - Body: `{ token, newPassword, confirmNewPassword }`.
- Response usage: không đọc field; success -> navigate `/login`.

#### [AUTH-07] POST /api/auth/logout
- FE status: Active / Used.
- Called from: `UserAvatarDropdown`.
- Trigger: click Logout.
- Request sent by FE: không body.
- Error handling:
  - kể cả API fail, FE vẫn clear session local + redirect `/login`.

#### [AUTH-08] GET /api/users/me
- FE status: Active / Used.
- Called from:
  - `App.tsx` hydrate session.
  - `UserProfilePage` load profile.
- Route(s): mọi route authenticated (hydrate) + `/profile`.
- Trigger: app mount khi có token hoặc profile page mount.
- Response FE đọc: `id`, `fullName`, `email`, `role`, `status`, `phone`, `address`.

#### [AUTH-09] PUT /api/users/me
- FE status: Active / Used.
- Called from: `UserProfilePage` save profile.
- Trigger: click Save profile.
- Request sent by FE:
  - Body: `{ fullName: trim, phone?: trim, address?: trim }`.
- Response FE đọc: updated profile object -> update redux `auth.user`.

---

### User Profile
- User Profile dùng lại `GET/PUT /api/users/me` (mục Auth trên).

---

### Accounts

#### [ACC-01] GET /api/accounts
- FE status: Active / Used.
- Called from: `AccountListPage` (`accountService.getList`).
- Route(s): `/accounts`.
- Trigger: page load, đổi page, filter role/status.
- Request sent by FE:
  - Query: `{ page, size, role?, status? }`.
- Response expected by FE:
  - FE đọc: `content`, `totalElements`, `page`, `size`.
- FE normalization / mapping:
  - keyword filter làm thêm ở client trên `content`.

#### [ACC-02] GET /api/accounts/{id}
- FE status: Active / Used.
- Called from: `AccountListPage` (open edit/detail, activate flow).
- Trigger: click View/Edit/Activate.
- Path params: `id`.
- Response FE đọc: `fullName`, `email`, `phone`, `address`, `role`, `status`.

#### [ACC-03] POST /api/accounts
- FE status: Active / Used.
- Called from: `AccountListPage` create modal.
- Trigger: save form create.
- Request sent by FE:
  - Body: `{ fullName, email, password, phone?, address?, roleId }`.
- Response FE đọc: không dùng field cụ thể, chỉ success state.

#### [ACC-04] PUT /api/accounts/{id}
- FE status: Active / Used.
- Called from: `AccountListPage` edit/activate flow.
- Trigger: save edit; activate account.
- Request sent by FE:
  - Body: `{ fullName, phone?, address?, roleId, status }`.

#### [ACC-05] PATCH /api/accounts/{id}/deactivate
- FE status: Active / Used.
- Called from: `AccountListPage` deactivate action.
- Trigger: confirm deactivate.
- Body FE gửi: `{ reason: "Deactivated by owner" }`.

---

### Products

#### [PRO-01] GET /api/products
- FE status: Active / Used.
- Called from:
  - `ProductListPage` list/search/filter.
  - các page select options: `PriceListCreate`, `PromotionCreate`, `PromotionDetail`, `Inventory*Create`.
- Route(s): `/products`, `/price-lists/create`, `/promotions/create`, `/promotions/:id`, `/inventory/*/create`.
- Trigger: page load + filter changes.
- Request sent by FE:
  - Query có thể gồm `page`, `pageSize`, `keyword`, `search`, `type`, `size`, `thickness`, `unit`, `status`, `sortBy`, `sortDir`.
- Response expected by FE:
  - service đọc `items|content|results` qua `extractList`.
  - pagination fallback từ `pagination` hoặc root fields `page/pageSize/size/totalElements`.
- FE normalization / mapping:
  - map ảnh: `imageUrls` + `images`, chọn `mainImage` fallback.
  - normalize status về `ACTIVE|INACTIVE`.

#### [PRO-02] GET /api/products/{id}
- FE status: Active / Used.
- Called from: `ProductDetailPage`, `ProductEditPage`.
- Route(s): `/products/:id`, `/products/:id/edit`.
- Response FE đọc: thông tin chi tiết sản phẩm, images/mainImage.
- Mapping: `toModel` (status + image fallback chain).

#### [PRO-03] POST /api/products
- FE status: Active / Used.
- Called from: `ProductCreatePage`.
- Trigger: save create.
- Request sent by FE:
  - body từ `toProductWritePayload` + service trim:
  - `productCode`, `productName`, `type`, `size`, `thickness`, `unit`, `weightConversion?`, `referenceWeight?`, `status`, `imageUrls[]`.
- Response FE đọc: `id` để navigate detail.

#### [PRO-04] PUT /api/products/{id}
- FE status: Active / Used.
- Called from: `ProductEditPage`.
- Trigger: save edit.
- Body FE gửi: giống create payload.

#### [PRO-05] DELETE /api/products/{id}
- FE status: Active / Used.
- Called from: `ProductListPage` delete modal.
- Trigger: confirm delete.
- Response usage: không đọc body, refetch list.

---

### Price Lists

#### [PRI-01] GET /api/price-lists
- FE status: Active / Used.
- Called from: `PriceListListPage`.
- Route(s): `/price-lists`.
- Trigger: load/search/filter/page.
- Query FE gửi: `{ page, size, search?, status?, customerGroup?, validFrom?, validTo? }`.
- Response FE đọc: `items/content/results`, `page`, `size`, `totalElements`.
- Mapping:
  - item price fallback: `unitPriceVnd|unitPrice|unit_price_vnd|unitPriceVND`.

#### [PRI-02] GET /api/price-lists/{id}
- FE status: Active / Used.
- Called from: `PriceListDetailPage`.
- Route(s): `/price-lists/:id`.
- Trigger: detail load + reload after update.
- Response FE đọc: `name`, `customerGroup`, `validFrom|startDate`, `validTo|endDate`, `status`, `items`.

#### [PRI-03] POST /api/price-lists
- FE status: Active / Used.
- Called from: `PriceListCreatePage`.
- Trigger: create form submit.
- Request sent by FE:
  - body: `{ name, customerGroup?, validFrom, validTo, status, items[{productId, unitPriceVnd}] }`.
- Response FE đọc: `id` để điều hướng detail.

#### [PRI-04] PUT /api/price-lists/{id}
- FE status: Active / Used.
- Called from: `PriceListDetailPage` (edit mode).
- Trigger: save changes.
- Body FE gửi: same create payload.

#### [PRI-05] DELETE /api/price-lists/{id}
- FE status: Active / Used.
- Called from: `PriceListListPage` delete modal.

---

### Promotions

#### [PRM-01] GET /api/promotions
- FE status: Active / Used.
- Called from: `PromotionListPage`.
- Route(s): `/promotions`.
- Trigger: load/search/filter/page.
- Query FE gửi:
  - `{ page, size, search, status, promotionType, validFrom, validTo, customerGroup, productId }`.
  - mapping từ UI query: `pageSize -> size`, `keyword -> search`, date range start/end merged.
- Response FE đọc: `items`, `pagination.totalItems/page/pageSize`, `filters`.

#### [PRM-02] GET /api/promotions/{id}
- FE status: Active / Used.
- Called from:
  - `PromotionDetailPage` load detail.
  - follow-up inside `promotionService.create` sau create để lấy detail đầy đủ.
- Response FE đọc: `id, code, name, promotionType, discountValue, validFrom, validTo, status, products[], customerGroups...`.
- Mapping: service map `validFrom -> startDate`, `products[].productId -> productIds`.

#### [PRM-03] POST /api/promotions
- FE status: Active / Used.
- Called from: `PromotionCreatePage`.
- Body FE gửi:
  - `{ name, promotionType, discountValue, validFrom, validTo, status?, priority?, description?, productIds[], customerGroups[] }`.
- Notes:
  - field `code` từ UI bị drop khi build API payload trong service.

#### [PRM-04] PUT /api/promotions/{id}
- FE status: Active / Used.
- Called from: `PromotionDetailPage` edit mode.
- Body FE gửi: cùng shape create payload.

#### [PRM-05] DELETE /api/promotions/{id}
- FE status: Active / Used.
- Called from: `PromotionListPage`.

---

### Quotations

#### [QTN-01] GET /api/customer/quotation-form-init
- FE status: Active / Used.
- Called from: `QuotationCreatePage`.
- Route(s): `/quotations/create`.
- Trigger: page load.
- Query FE gửi: `{ page: 1, pageSize: 100 }`.
- Response FE đọc:
  - `customer`, `products`, `projects`, `availablePromotions`.
- Usage: build dropdown options + reference unit price map.

#### [QTN-02] GET /api/customer/quotations
- FE status: Active / Used.
- Called from: `QuotationListPage` khi role CUSTOMER.
- Query FE gửi: `{ page, pageSize, keyword?, status?, fromDate?, toDate? }`.
- Response FE đọc: `items`, `pagination.totalItems`, `item.actions.canEdit`.

#### [QTN-03] GET /api/quotations
- FE status: Active / Used.
- Called from: `QuotationListPage` khi role không phải CUSTOMER.
- Query FE gửi: `{ page, pageSize, keyword?, status?, fromDate?, toDate? }`.
- Response FE đọc: `items`, `pagination.totalItems`, `canEdit`, `canCreateContract`.

#### [QTN-04] POST /api/quotations/preview
- FE status: Active / Used.
- Called from: `QuotationCreatePage` preview.
- Trigger: click Preview.
- Body FE gửi:
```json
{
  "projectId": "...",
  "deliveryRequirements": "...",
  "promotionCode": "...",
  "note": "...",
  "items": [{ "productId": "...", "quantity": 10 }]
}
```
- Response FE đọc: `summary.subTotal`, `summary.discountAmount`, `summary.totalAmount`, `validUntil`, `validation.messages`.

#### [QTN-05] POST /api/quotations
- FE status: Active / Used.
- Called from: `QuotationCreatePage` submit.
- Trigger: click Submit Quotation.
- Body FE gửi: cùng shape preview payload.
- Response FE đọc: `quotation.id` (qua mapping model) để navigate detail.

#### [QTN-06] POST /api/quotations/draft
- FE status: Active / Used.
- Called from: `QuotationCreatePage` save draft.
- Body FE gửi: cùng shape preview payload.
- Response FE đọc: `quotation.id`, `items`, `metadata.deliveryRequirements`, `metadata.promotionCode`.

#### [QTN-07] GET /api/quotations/{id}
- FE status: Active / Used.
- Called from:
  - `QuotationDetailPage`.
  - `ContractCreatePage` (load quotation để tạo contract).
- Response FE đọc:
  - `quotation`, `customer`, `project`, `items`, `pricing.promotionCode`, `deliveryRequirements`, `actions`.
- Mapping: `item.amount` fallback `totalPrice`.

#### [QTN-08] GET /api/quotations/{id}/history
- FE status: Active / Used.
- Called from: `QuotationDetailPage`.
- Response FE đọc: `events[]` (`id`, `action`, `note`, `createdAt`).

#### [QTN-09] POST /api/quotations/{id}/submit
- FE status: Active / Used.
- Called from: `QuotationDetailPage` submit draft.
- Trigger: button Submit Draft.
- Request FE gửi: không body.

---

### Contracts

#### [CON-01] GET /api/contracts
- FE status: Active / Used.
- Called from: `ContractListPage`, `ContractApprovalListPage`.
- Route(s): `/contracts`, `/approvals/contracts`.
- Query FE gửi thực tế: chủ yếu `{ keyword?, status? }`.
- Response FE đọc: list item fields (`id`, `contractNumber`, `customerId`, `customerName`, `status`, `approvalStatus`, `totalAmount`, ...).
- FE note: nhiều filter (date/total range) xử lý client-side sau khi fetch.

#### [CON-02] GET /api/contracts/{id}
- FE status: Active / Used.
- Called from: `ContractDetailPage`, `ContractEditPage`, `ContractApprovalDetailPage`.
- Response FE đọc: contract header + items + customer/quotation metadata.

#### [CON-03] POST /api/contracts
- FE status: Active / Used.
- Called from: `ContractCreatePage`.
- Trigger: create from quotation flow.
- Body FE gửi:
  - `customerId`, `quotationId`, `paymentTerms`, `deliveryAddress`, `items[{productId,quantity,unitPrice}]`.
- Notes: FE đang dùng legacy create endpoint (không dùng `from-quotation`).

#### [CON-04] PUT /api/contracts/{id}
- FE status: Active / Used.
- Called from: `ContractEditPage`.
- Body FE gửi:
  - `quotationId`, `customerId`, `paymentTerms`, `deliveryAddress`, `deliveryTerms?`, `note?`, `expectedDeliveryDate?`, `confidential`, `changeReason`, `items[]`.

#### [CON-05] POST /api/contracts/{id}/submit
- FE status: Active / Used.
- Called from: `ContractDetailPage`.
- Request FE gửi:
  - service gửi `{}` nếu page không truyền request payload.

#### [CON-06] POST /api/contracts/{id}/approve
- FE status: Active / Used.
- Called from: `ContractDetailPage`, `ContractApprovalDetailPage`.
- Body FE gửi:
  - từ detail page: `{}`.
  - từ approval page: `{ comment: "..." }`.

#### [CON-07] POST /api/contracts/{id}/reject
- FE status: Active / Used.
- Called from: `ContractDetailPage`, `ContractApprovalDetailPage`.
- Body FE gửi tương tự approve (`{}` hoặc `{comment}`).

#### [CON-08] POST /api/contracts/{id}/request-modification
- FE status: Active / Used.
- Called from: `ContractApprovalDetailPage`.
- Body FE gửi: `{ comment: "Requested modification by owner" }`.

#### [CON-09] GET /api/contracts/{id}/tracking
- FE status: Active / Used.
- Called from: `ContractTrackingPage`.
- Response FE đọc:
  - `contractId`, `currentStatus`, `events[]`.
- Mapping:
  - `eventStatus || eventType -> status`, `actualAt || expectedAt -> at`.

---

### Customers

#### [CUS-01] GET /api/customers
- FE status: Active / Used.
- Called from: `CustomerListPage`.
- Query FE gửi thực tế: `{ keyword?, status? }`.
- Response FE đọc qua normalize:
  - list từ `items|content|results|data`.
  - `id`, `fullName/companyName/contactPerson`, `email`, `phone`, `status`, `creditLimit`, ...

#### [CUS-02] GET /api/customers/{id}
- FE status: Active / Used.
- Called from: `CustomerDetailPage`, `CustomerEditPage`.
- Response FE đọc: thông tin profile + tài chính hiển thị.
- Mapping: `unwrapCustomerPayload` đọc `data.customer` fallback root.

#### [CUS-03] POST /api/customers
- FE status: Active / Used.
- Called from: `CustomerCreatePage`.
- Body FE gửi:
  - `fullName`, `companyName?`, `contactPerson?`, `customerType?`, `email?`, `phone?`, `address?`, `creditLimit?`, `status`.

#### [CUS-04] PUT /api/customers/{id}
- FE status: Active / Used.
- Called from: `CustomerEditPage`.
- Body FE gửi: cùng shape create.

---

### Projects

#### [PRJ-01] GET /api/projects
- FE status: Active / Used.
- Called from: `ProjectListPage`.
- Query FE gửi thực tế: `{ keyword?, status? }`.
- Service normalize query:
  - `projectName <- keyword`, `pageSize <- size` nếu có.

#### [PRJ-02] GET /api/projects/{id}
- FE status: Active / Used.
- Called from: `ProjectDetailPage`, `ProjectEditPage`.
- Response FE đọc: `project` node -> `id, code/projectCode, name, customerId, warehouseId, status, progress...`.
- Mapping: alias normalize (`code<->projectCode`, `warehouseId<->primaryWarehouseId`, `progress<->progressPercent`).

#### [PRJ-03] POST /api/projects
- FE status: Active / Used.
- Called from: `ProjectCreatePage`.
- Body FE thực tế (sau service transform):
  - always include `customerId, name, location(default "TBD"), startDate/endDate(default today), budget(default 1), assignedProjectManager(default "TBD")`.
  - map `warehouseId -> primaryWarehouseId`.
  - auto-generate `paymentMilestones` nếu thiếu.

#### [PRJ-04] PUT /api/projects/{id}
- FE status: Active / Used.
- Called from: `ProjectEditPage`.
- Body FE gửi sau transform:
  - canonical fields + `changeReason` default `"Updated from UI"`.
  - map `warehouseId -> primaryWarehouseId`.

#### [PRJ-05] POST /api/projects/{id}/warehouses
- FE status: Active / Used.
- Called from: `ProjectAssignWarehousePage`.
- Body FE gửi: `{ primaryWarehouseId: request.primaryWarehouseId ?? request.warehouseId, backupWarehouseId?, assignmentReason? }`.

#### [PRJ-06] POST /api/projects/{id}/progress
- FE status: Active / Used.
- Called from: `ProjectEditPage` (`updateProgress` không truyền `progressUpdateId`).
- Body FE gửi:
  - `{ progressPercent, progressStatus?, phase?, notes?, changeReason?, evidenceDocuments? }`.

---

### Inventory

#### [INV-01] GET /api/inventory/status
- FE status: Active / Used.
- Called from: `InventoryStatusPage`.
- Query FE gửi: `{ page, size, search? }`.
- Response FE đọc: `items`, `totalElements`, `onHandQuantity`, `availableQuantity`, `reservedQuantity`, `updatedAt`.
- Mapping: `extractList` + numeric normalization.

#### [INV-02] GET /api/inventory/history
- FE status: Active / Used.
- Called from: `InventoryHistoryPage`.
- Query FE gửi: `{ page, size, search?, transactionType?, fromDate?, toDate? }`.
- Response FE đọc: `items`, `totalElements`.
- Mapping: `transactionType` fallback về `RECEIPT` nếu giá trị lạ.

#### [INV-03] POST /api/inventory/receipts
- FE status: Active / Used.
- Called from: `InventoryReceiptCreatePage`.
- Body FE gửi:
  - `{ productId, quantity, receiptDate, supplierName?, reason?, note? }`.

#### [INV-04] POST /api/inventory/issues
- FE status: Active / Used.
- Called from: `InventoryIssueCreatePage`.
- Body FE gửi:
  - `{ productId, quantity, relatedOrderId?, relatedProjectId?, reason?, note? }`.

#### [INV-05] POST /api/inventory/adjustments
- FE status: Active / Used.
- Called from: `InventoryAdjustmentCreatePage`.
- Body FE gửi:
  - `{ productId, adjustmentQuantity, reason?, note? }`.

---

### Payments

#### [PAY-01] GET /api/invoices
- FE status: Active / Used.
- Called from: `PaymentListPage`.
- Query FE gửi: `{ keyword?, status? }`.
- Response FE đọc: invoice list fields (`id`, `contractId`, `customerId`, `totalAmount`, `paidAmount`, `dueAmount`, `dueDate`, `status`).

#### [PAY-02] GET /api/invoices/{id}
- FE status: Active / Used.
- Called from: `PaymentDetailPage`.
- Response FE đọc: invoice detail same fields như list + render chi tiết.

#### [PAY-03] POST /api/invoices/{id}/payments
- FE status: Active / Used.
- Called from: `RecordPaymentPage`.
- Body FE gửi: `{ amount: Number, paidAt, method, note }`.

#### [PAY-04] GET /api/debts
- FE status: Active / Used.
- Called from: `PaymentListPage`.
- Query FE gửi: `{ keyword? }`.
- Response FE đọc: `customerId`, `customerName`, `totalDebt`, `overdueDebt`.

---

### Reports

#### [RPT-01] GET /api/reports/dashboard
- FE status: Active / Used.
- Called from:
  - `DashboardPage`.
  - `FinancialReportPage`.
  - `DashboardReportPage` (page này chưa mount route).
- Response FE đọc: `summary.totalRevenue`, `summary.totalContracts`, `summary.totalOrders`, `summary.totalDebt`, `openProjectCount`, `inventoryAlertCount`.

#### [RPT-02] GET /api/reports/sales
- FE status: Active / Used.
- Called from: `SalesReportPage`.
- Response FE đọc: `[{ period, revenue }]`.

#### [RPT-03] GET /api/reports/inventory
- FE status: Active / Used.
- Called from: `InventoryReportPage`.
- Response FE đọc: `[{ productId, productCode, productName, availableQty, reservedQty }]`.

#### [RPT-04] GET /api/reports/projects
- FE status: Active / Used.
- Called from: `FinancialReportPage`.
- Response FE đọc: `[{ projectId, projectName, progress, status }]`.

---

### Others
- `ExportReportPage` (`/reports/export`) không gọi API; chỉ hiển thị notice chờ contract BE export.
- `TestPage` (`/test`) là showcase UI, không gọi API.

## 4. Route-to-API Matrix
Ghi chú thêm:
- Ngoài các route dưới, `AppAuthenticatedLayout` có call `GET /api/users/me` để hydrate user khi có token.
- Route auth (`/login`, `/register`, `/verify-registration`, `/forgot-password`, `/reset-password`) cũng có API calls, chi tiết ở bảng dưới.

| Route | Page | Service Function(s) | API Endpoint(s) | Status | Notes |
|---|---|---|---|---|---|
| / | Redirect route | - | - | No API | Redirect theo token/role sang default route |
| /login | LoginPage | authService.login | POST /api/auth/login | Active / Used | Special handling code EMAIL_VERIFICATION_REQUIRED |
| /register | RegisterPage | authService.register | POST /api/auth/register | Active / Used | - |
| /verify-registration | VerifyRegistrationPage | authService.verifyRegistration, authService.resendVerificationCode | POST /api/auth/verify-registration, POST /api/auth/resend-verification-code | Active / Used | - |
| /forgot-password | ForgotPasswordPage | authService.forgotPassword | POST /api/auth/forgot-password | Active / Used | - |
| /reset-password | ResetPasswordPage | authService.resetPassword | POST /api/auth/reset-password | Active / Used | - |
| /dashboard | DashboardPage | reportService.getDashboard | GET /api/reports/dashboard | Active / Used | - |
| /profile | UserProfilePage | authService.getProfile<br>authService.updateProfile | GET /api/users/me<br>PUT /api/users/me | Active / Used | - |
| /accounts | AccountListPage | accountService.getList<br>accountService.getDetail<br>accountService.create<br>accountService.update<br>accountService.deactivate | GET /api/accounts<br>GET /api/accounts/{id}<br>POST /api/accounts<br>PUT /api/accounts/{id}<br>PATCH /api/accounts/{id}/deactivate | Active / Used | - |
| /products | ProductListPage | productService.getList<br>productService.remove | GET /api/products<br>DELETE /api/products/{id} | Active / Used | - |
| /products/:id | ProductDetailPage | productService.getDetail | GET /api/products/{id} | Active / Used | - |
| /products/create | ProductCreatePage | productService.create | POST /api/products | Active / Used | - |
| /products/:id/edit | ProductEditPage | productService.getDetail<br>productService.update | GET /api/products/{id}<br>PUT /api/products/{id} | Active / Used | - |
| /price-lists | PriceListListPage | priceListService.getList<br>priceListService.remove | GET /api/price-lists<br>DELETE /api/price-lists/{id} | Active / Used | - |
| /price-lists/create | PriceListCreatePage | productService.getList<br>priceListService.create | GET /api/products<br>POST /api/price-lists | Active / Used | - |
| /price-lists/:id | PriceListDetailPage | priceListService.getDetail<br>priceListService.update | GET /api/price-lists/{id}<br>PUT /api/price-lists/{id} | Active / Used | - |
| /quotations | QuotationListPage | quotationService.getCustomerList<br>quotationService.getManagementList | GET /api/customer/quotations<br>GET /api/quotations | Active / Used | - |
| /quotations/create | QuotationCreatePage | quotationService.getFormInit<br>quotationService.preview<br>quotationService.create<br>quotationService.saveDraft | GET /api/customer/quotation-form-init<br>POST /api/quotations/preview<br>POST /api/quotations<br>POST /api/quotations/draft | Active / Used | - |
| /quotations/:id | QuotationDetailPage | quotationService.getDetail<br>quotationService.getHistory<br>quotationService.submit | GET /api/quotations/{id}<br>GET /api/quotations/{id}/history<br>POST /api/quotations/{id}/submit | Active / Used | Global submit endpoint (`POST /api/quotations/submit`) is defined but currently unused by route call-sites |
| /promotions | PromotionListPage | promotionService.getList<br>promotionService.delete | GET /api/promotions<br>DELETE /api/promotions/{id} | Active / Used | - |
| /promotions/create | PromotionCreatePage | productService.getList<br>promotionService.create | GET /api/products<br>POST /api/promotions<br>GET /api/promotions/{id} | Active / Used | - |
| /promotions/:id | PromotionDetailPage | promotionService.getDetail<br>productService.getList<br>promotionService.update | GET /api/promotions/{id}<br>GET /api/products<br>PUT /api/promotions/{id} | Active / Used | - |
| /contracts/create/:quotationId | ContractCreatePage | quotationService.getDetail<br>contractService.create | GET /api/quotations/{id}<br>POST /api/contracts | Active / Used | - |
| /contracts | ContractListPage | contractService.getList | GET /api/contracts | Active / Used | - |
| /contracts/:id | ContractDetailPage | contractService.getDetail<br>contractService.submit<br>contractService.approve<br>contractService.reject | GET /api/contracts/{id}<br>POST /api/contracts/{id}/submit<br>POST /api/contracts/{id}/approve<br>POST /api/contracts/{id}/reject | Active / Used | - |
| /contracts/:id/edit | ContractEditPage | contractService.getDetail<br>contractService.update | GET /api/contracts/{id}<br>PUT /api/contracts/{id} | Active / Used | - |
| /contracts/:id/tracking | ContractTrackingPage | contractService.track | GET /api/contracts/{id}/tracking | Active / Used | Endpoint confirmed manually from service implementation |
| /approvals/contracts | ContractApprovalListPage | contractService.getList | GET /api/contracts | Active / Used | - |
| /approvals/contracts/:id | ContractApprovalDetailPage | contractService.getDetail<br>contractService.approve<br>contractService.requestModification<br>contractService.reject | GET /api/contracts/{id}<br>POST /api/contracts/{id}/approve<br>POST /api/contracts/{id}/request-modification<br>POST /api/contracts/{id}/reject | Active / Used | - |
| /customers | CustomerListPage | customerService.getList | GET /api/customers | Active / Used | - |
| /customers/:id | CustomerDetailPage | customerService.getDetail | GET /api/customers/{id} | Active / Used | - |
| /customers/create | CustomerCreatePage | customerService.create | POST /api/customers | Active / Used | - |
| /customers/:id/edit | CustomerEditPage | customerService.getDetail<br>customerService.update | GET /api/customers/{id}<br>PUT /api/customers/{id} | Active / Used | - |
| /projects | ProjectListPage | projectService.getList | GET /api/projects | Active / Used | - |
| /projects/:id | ProjectDetailPage | projectService.getDetail | GET /api/projects/{id} | Active / Used | - |
| /projects/create | ProjectCreatePage | projectService.create | POST /api/projects | Active / Used | - |
| /projects/:id/edit | ProjectEditPage | projectService.getDetail<br>projectService.update<br>projectService.updateProgress | GET /api/projects/{id}<br>PUT /api/projects/{id}<br>POST /api/projects/{id}/progress | Active / Used | - |
| /projects/:id/assign-warehouse | ProjectAssignWarehousePage | projectService.assignWarehouse | POST /api/projects/{id}/warehouses | Active / Used | - |
| /payments | PaymentListPage | paymentService.getInvoiceList<br>paymentService.getDebtStatus | GET /api/invoices<br>GET /api/debts | Active / Used | - |
| /payments/:id | PaymentDetailPage | paymentService.getInvoiceDetail | GET /api/invoices/{id} | Active / Used | - |
| /payments/:id/record | RecordPaymentPage | paymentService.recordPayment | POST /api/invoices/{id}/payments | Active / Used | - |
| /inventory | InventoryStatusPage | inventoryService.getStatus | GET /api/inventory/status | Active / Used | - |
| /inventory/receipts/create | InventoryReceiptCreatePage | productService.getList<br>inventoryService.createReceipt | GET /api/products<br>POST /api/inventory/receipts | Active / Used | - |
| /inventory/issues/create | InventoryIssueCreatePage | productService.getList<br>inventoryService.createIssue | GET /api/products<br>POST /api/inventory/issues | Active / Used | - |
| /inventory/adjustments/create | InventoryAdjustmentCreatePage | productService.getList<br>inventoryService.createAdjustment | GET /api/products<br>POST /api/inventory/adjustments | Active / Used | - |
| /inventory/history | InventoryHistoryPage | inventoryService.getHistory | GET /api/inventory/history | Active / Used | - |
| /reports/sales | SalesReportPage | reportService.getSalesReport | GET /api/reports/sales | Active / Used | - |
| /reports/inventory | InventoryReportPage | reportService.getInventoryReport | GET /api/reports/inventory | Active / Used | - |
| /reports/project | FinancialReportPage | reportService.getProjectReport<br>reportService.getDashboard | GET /api/reports/projects<br>GET /api/reports/dashboard | Active / Used | - |
| /reports/financial | FinancialReportPage | reportService.getProjectReport<br>reportService.getDashboard | GET /api/reports/projects<br>GET /api/reports/dashboard | Active / Used | - |
| /reports/export | ExportReportPage | - | - | No API | - |
| /test | TestPage | - | - | Demo/Test only | No backend call |
| * | NotFoundPage | - | - | No API | - |

## 5. Service-to-Endpoint Matrix
Ghi chú:
- Bảng dưới lấy từ code `src/services/**/*.service.ts` và call-site toàn `src/**`.
- `contractService.track` có endpoint thực tế là `GET /api/contracts/{id}/tracking` (regex auto-parser không bắt được vì generic type multiline).
- `projectService.updateProgress` có thêm nhánh `PUT /api/projects/{id}/progress/{progressUpdateId}` khi truyền `progressUpdateId`.

| Service file | Function | Method | Endpoint | Used by | Status |
|---|---|---|---|---|---|
| src/services/account/account.service.ts | create | POST | /api/accounts | accounts/AccountListPage.tsx | Active / Used |
| src/services/account/account.service.ts | deactivate | PATCH | /api/accounts/{id}/deactivate | accounts/AccountListPage.tsx | Active / Used |
| src/services/account/account.service.ts | getDetail | GET | /api/accounts/{id} | accounts/AccountListPage.tsx | Active / Used |
| src/services/account/account.service.ts | getList | GET | /api/accounts | accounts/AccountListPage.tsx | Active / Used |
| src/services/account/account.service.ts | update | PUT | /api/accounts/{id} | accounts/AccountListPage.tsx | Active / Used |
| src/services/auth/auth.service.ts | changePassword | POST | /api/auth/change-password | - | Defined but unused |
| src/services/auth/auth.service.ts | forgotPassword | POST | /api/auth/forgot-password | auth/ForgotPasswordPage.tsx | Active / Used |
| src/services/auth/auth.service.ts | getProfile | GET | /api/users/me | App.tsx, profile/UserProfilePage.tsx | Active / Used |
| src/services/auth/auth.service.ts | login | POST | /api/auth/login | auth/LoginPage.tsx | Active / Used |
| src/services/auth/auth.service.ts | logout | POST | /api/auth/logout | navigation/UserAvatarDropdown.tsx | Active / Used |
| src/services/auth/auth.service.ts | register | POST | /api/auth/register | auth/RegisterPage.tsx | Active / Used |
| src/services/auth/auth.service.ts | resendVerificationCode | POST | /api/auth/resend-verification-code | auth/VerifyRegistrationPage.tsx | Active / Used |
| src/services/auth/auth.service.ts | resetPassword | POST | /api/auth/reset-password | auth/ResetPasswordPage.tsx | Active / Used |
| src/services/auth/auth.service.ts | updateProfile | PUT | /api/users/me | profile/UserProfilePage.tsx | Active / Used |
| src/services/auth/auth.service.ts | verifyRegistration | POST | /api/auth/verify-registration | auth/VerifyRegistrationPage.tsx | Active / Used |
| src/services/contract/contract.service.ts | approve | POST | /api/contracts/{id}/approve | approvals/ContractApprovalDetailPage.tsx, contracts/ContractDetailPage.tsx | Active / Used |
| src/services/contract/contract.service.ts | cancel | POST | /api/contracts/{id}/cancel | - | Defined but unused |
| src/services/contract/contract.service.ts | create | POST | /api/contracts | contracts/ContractCreatePage.tsx | Active / Used |
| src/services/contract/contract.service.ts | createFromQuotation | POST | /api/contracts/from-quotation/{id} | - | Defined but unused |
| src/services/contract/contract.service.ts | getDetail | GET | /api/contracts/{id} | approvals/ContractApprovalDetailPage.tsx, contracts/ContractDetailPage.tsx, contracts/ContractEditPage.tsx | Active / Used |
| src/services/contract/contract.service.ts | getList | GET | /api/contracts | approvals/ContractApprovalListPage.tsx, contracts/ContractListPage.tsx | Active / Used |
| src/services/contract/contract.service.ts | reject | POST | /api/contracts/{id}/reject | approvals/ContractApprovalDetailPage.tsx, contracts/ContractDetailPage.tsx | Active / Used |
| src/services/contract/contract.service.ts | requestModification | POST | /api/contracts/{id}/request-modification | approvals/ContractApprovalDetailPage.tsx | Active / Used |
| src/services/contract/contract.service.ts | submit | POST | /api/contracts/{id}/submit | contracts/ContractDetailPage.tsx | Active / Used |
| src/services/contract/contract.service.ts | track | GET | /api/contracts/{id}/tracking | contracts/ContractTrackingPage.tsx | Active / Used |
| src/services/contract/contract.service.ts | update | PUT | /api/contracts/{id} | contracts/ContractEditPage.tsx | Active / Used |
| src/services/customer/customer.service.ts | create | POST | /api/customers | customers/CustomerCreatePage.tsx | Active / Used |
| src/services/customer/customer.service.ts | getDetail | GET | /api/customers/{id} | customers/CustomerDetailPage.tsx, customers/CustomerEditPage.tsx | Active / Used |
| src/services/customer/customer.service.ts | getList | GET | /api/customers | customers/CustomerListPage.tsx | Active / Used |
| src/services/customer/customer.service.ts | update | PUT | /api/customers/{id} | customers/CustomerEditPage.tsx | Active / Used |
| src/services/inventory/inventory.service.ts | createAdjustment | POST | /api/inventory/adjustments | inventory/InventoryAdjustmentCreatePage.tsx | Active / Used |
| src/services/inventory/inventory.service.ts | createIssue | POST | /api/inventory/issues | inventory/InventoryIssueCreatePage.tsx | Active / Used |
| src/services/inventory/inventory.service.ts | createReceipt | POST | /api/inventory/receipts | inventory/InventoryReceiptCreatePage.tsx | Active / Used |
| src/services/inventory/inventory.service.ts | getHistory | GET | /api/inventory/history | inventory/InventoryHistoryPage.tsx | Active / Used |
| src/services/inventory/inventory.service.ts | getStatus | GET | /api/inventory/status | inventory/InventoryStatusPage.tsx | Active / Used |
| src/services/payment/payment.service.ts | getDebtStatus | GET | /api/debts | payments/PaymentListPage.tsx | Active / Used |
| src/services/payment/payment.service.ts | getInvoiceDetail | GET | /api/invoices/{id} | payments/PaymentDetailPage.tsx | Active / Used |
| src/services/payment/payment.service.ts | getInvoiceList | GET | /api/invoices | payments/PaymentListPage.tsx | Active / Used |
| src/services/payment/payment.service.ts | recordPayment | POST | /api/invoices/{id}/payments | payments/RecordPaymentPage.tsx | Active / Used |
| src/services/pricing/price-list.service.ts | create | POST | /api/price-lists | pricing/PriceListCreatePage.tsx | Active / Used |
| src/services/pricing/price-list.service.ts | getDetail | GET | /api/price-lists/{id} | pricing/PriceListDetailPage.tsx | Active / Used |
| src/services/pricing/price-list.service.ts | getList | GET | /api/price-lists | pricing/PriceListListPage.tsx | Active / Used |
| src/services/pricing/price-list.service.ts | remove | DELETE | /api/price-lists/{id} | pricing/PriceListListPage.tsx | Active / Used |
| src/services/pricing/price-list.service.ts | update | PUT | /api/price-lists/{id} | pricing/PriceListDetailPage.tsx | Active / Used |
| src/services/product/product.service.ts | create | POST | /api/products | products/ProductCreatePage.tsx | Active / Used |
| src/services/product/product.service.ts | getDetail | GET | /api/products/{id} | products/ProductDetailPage.tsx, products/ProductEditPage.tsx | Active / Used |
| src/services/product/product.service.ts | getList | GET | /api/products | inventory/InventoryAdjustmentCreatePage.tsx, inventory/InventoryIssueCreatePage.tsx, inventory/InventoryReceiptCreatePage.tsx, pricing/PriceListCreatePage.tsx, products/ProductListPage.tsx, promotions/PromotionCreatePage.tsx, promotions/PromotionDetailPage.tsx | Active / Used |
| src/services/product/product.service.ts | remove | DELETE | /api/products/{id} | products/ProductListPage.tsx | Active / Used |
| src/services/product/product.service.ts | update | PUT | /api/products/{id} | products/ProductEditPage.tsx | Active / Used |
| src/services/product/product.service.ts | updateStatus | PATCH | /api/products/{id}/status | - | Defined but unused |
| src/services/project/project.service.ts | assignWarehouse | POST | /api/projects/{id}/warehouses | projects/ProjectAssignWarehousePage.tsx | Active / Used |
| src/services/project/project.service.ts | create | POST | /api/projects | projects/ProjectCreatePage.tsx | Active / Used |
| src/services/project/project.service.ts | getDetail | GET | /api/projects/{id} | projects/ProjectDetailPage.tsx, projects/ProjectEditPage.tsx | Active / Used |
| src/services/project/project.service.ts | getList | GET | /api/projects | projects/ProjectListPage.tsx | Active / Used |
| src/services/project/project.service.ts | update | PUT | /api/projects/{id} | projects/ProjectEditPage.tsx | Active / Used |
| src/services/project/project.service.ts | updateProgress | POST / PUT | /api/projects/{id}/progress ; /api/projects/{id}/progress/{progressUpdateId} | projects/ProjectEditPage.tsx | Active / Used |
| src/services/promotion/promotion.service.ts | create | POST / GET | /api/promotions ; /api/promotions/{id} | promotions/PromotionCreatePage.tsx | Active / Used |
| src/services/promotion/promotion.service.ts | delete | DELETE | /api/promotions/{id} | promotions/PromotionListPage.tsx | Active / Used |
| src/services/promotion/promotion.service.ts | getDetail | GET | /api/promotions/{id} | promotions/PromotionDetailPage.tsx | Active / Used |
| src/services/promotion/promotion.service.ts | getList | GET | /api/promotions | promotions/PromotionListPage.tsx | Active / Used |
| src/services/promotion/promotion.service.ts | update | PUT | /api/promotions/{id} | promotions/PromotionDetailPage.tsx | Active / Used |
| src/services/quotation/quotation.service.ts | create | POST | /api/quotations | quotations/QuotationCreatePage.tsx | Active / Used |
| src/services/quotation/quotation.service.ts | getCustomerList | GET | /api/customer/quotations | quotations/QuotationListPage.tsx | Active / Used |
| src/services/quotation/quotation.service.ts | getDetail | GET | /api/quotations/{id} | contracts/ContractCreatePage.tsx, quotations/QuotationDetailPage.tsx | Active / Used |
| src/services/quotation/quotation.service.ts | getFormInit | GET | /api/customer/quotation-form-init | quotations/QuotationCreatePage.tsx | Active / Used |
| src/services/quotation/quotation.service.ts | getHistory | GET | /api/quotations/{id}/history | quotations/QuotationDetailPage.tsx | Active / Used |
| src/services/quotation/quotation.service.ts | getList | - | - | - | Defined but unused |
| src/services/quotation/quotation.service.ts | getManagementList | GET | /api/quotations | quotations/QuotationListPage.tsx | Active / Used |
| src/services/quotation/quotation.service.ts | getManagementModelList | - | - | - | Defined but unused |
| src/services/quotation/quotation.service.ts | getRawDetail | GET | /api/quotations/{id} | - | Defined but unused |
| src/services/quotation/quotation.service.ts | getSummary | GET | /api/customer/quotations/summary | - | Defined but unused |
| src/services/quotation/quotation.service.ts | preview | POST | /api/quotations/preview | quotations/QuotationCreatePage.tsx | Active / Used |
| src/services/quotation/quotation.service.ts | previewById | GET | /api/quotations/{id}/preview | - | Defined but unused |
| src/services/quotation/quotation.service.ts | saveDraft | POST | /api/quotations/draft | quotations/QuotationCreatePage.tsx | Active / Used |
| src/services/quotation/quotation.service.ts | submit | POST | /api/quotations/{id}/submit ; /api/quotations/submit | quotations/QuotationDetailPage.tsx | Active / Used |
| src/services/quotation/quotation.service.ts | update | PUT | /api/quotations/{id} | - | Defined but unused |
| src/services/report/report.service.ts | getDashboard | GET | /api/reports/dashboard | dashboard/DashboardPage.tsx, reports/DashboardReportPage.tsx, reports/FinancialReportPage.tsx | Active / Used |
| src/services/report/report.service.ts | getInventoryReport | GET | /api/reports/inventory | reports/InventoryReportPage.tsx | Active / Used |
| src/services/report/report.service.ts | getProjectReport | GET | /api/reports/projects | reports/FinancialReportPage.tsx | Active / Used |
| src/services/report/report.service.ts | getSalesReport | GET | /api/reports/sales | reports/SalesReportPage.tsx | Active / Used |

## 6. Defined But Unused APIs
### 6.1 Unused endpoints (unique `METHOD + PATH`)
1. `POST /api/auth/change-password`
- Service: `src/services/auth/auth.service.ts` -> `authService.changePassword`.
- Why unused: không có call-site `authService.changePassword(...)` trong `src/**`.
- Confidence: High.

2. `PATCH /api/products/{id}/status`
- Service: `src/services/product/product.service.ts` -> `productService.updateStatus`.
- Why unused: không có call-site.
- Confidence: High.

3. `POST /api/contracts/from-quotation/{id}`
- Service: `src/services/contract/contract.service.ts` -> `contractService.createFromQuotation`.
- Why unused: không có call-site; page tạo contract đang dùng `POST /api/contracts`.
- Confidence: High.

4. `POST /api/contracts/{id}/cancel`
- Service: `contractService.cancel`.
- Why unused: không có call-site.
- Confidence: High.

5. `GET /api/customer/quotations/summary`
- Service: `quotationService.getSummary`.
- Why unused: không có call-site.
- Confidence: High.

6. `GET /api/quotations/{id}/preview`
- Service: `quotationService.previewById`.
- Why unused: không có call-site.
- Confidence: High.

7. `PUT /api/quotations/{id}`
- Service: `quotationService.update`.
- Why unused: không có call-site.
- Confidence: High.

8. `POST /api/quotations/submit`
- Service: nhánh object trong `quotationService.submit(idOrRequest)`.
- Why unused: call-site hiện tại chỉ truyền `string id` (QuotationDetailPage), không có call-site truyền object.
- Confidence: Medium-High (inferred from static call-sites).

9. `PUT /api/projects/{id}/progress/{progressUpdateId}`
- Service: nhánh có `progressUpdateId` trong `projectService.updateProgress`.
- Why unused: call-site hiện tại luôn gọi không truyền `progressUpdateId`.
- Confidence: Medium-High.

### 6.2 Unused service methods (HTTP-related)
- `authService.changePassword`
- `productService.updateStatus`
- `contractService.createFromQuotation`
- `contractService.cancel`
- `quotationService.getSummary`
- `quotationService.previewById`
- `quotationService.update`
- `quotationService.getRawDetail` (method unused; endpoint vẫn active qua `getDetail`)
- `quotationService.getList` (wrapper unused)
- `quotationService.getManagementModelList` (wrapper unused)

## 7. Demo / Test Only APIs
- Kết quả scan: **không có endpoint nào chỉ dùng demo/test**.
- Route `/test` (`src/pages/404/test.page.tsx`) không có call HTTP.
- `src/pages/reports/DashboardReportPage.tsx` không mount trong route tree, nhưng endpoint nó gọi (`GET /api/reports/dashboard`) đã active từ route khác (`/dashboard`, `/reports/project`, `/reports/financial`).

## 8. FE vs BE Contract Mismatches

### Mismatch 1: Tài liệu BE chưa bao phủ Payment/Report endpoints FE đang gọi
- Endpoint:
  - `GET /api/invoices`
  - `GET /api/invoices/{id}`
  - `POST /api/invoices/{id}/payments`
  - `GET /api/debts`
  - `GET /api/reports/*`
- FE hiện đang làm gì:
  - Payment + Report pages gọi trực tiếp các endpoint trên (active routes).
- Backend contract mong đợi gì:
  - `API_DOCUMENTATION.md` hiện không có section chính thức cho các endpoint này.
- Mức độ ảnh hưởng: **Medium**.
- Gợi ý sửa:
  - Bổ sung tài liệu BE cho payment/report API để FE/QA có nguồn contract chính thức.

### Mismatch 2: Approval screens đang dùng API list/detail chung thay vì approval-dedicated endpoints
- Endpoint:
  - FE dùng: `GET /api/contracts`, `GET /api/contracts/{id}`.
  - BE docs có thêm: `GET /api/contracts/approvals/pending`, `GET /api/contracts/{id}/approval-review`.
- FE hiện đang làm gì:
  - `/approvals/contracts` filter `status=PENDING` trên endpoint list chung.
  - `/approvals/contracts/:id` đọc detail chung.
- Backend contract mong đợi gì:
  - Có endpoint chuyên cho approval flow theo docs.
- Mức độ ảnh hưởng: **Medium**.
- Gợi ý sửa:
  - Chuyển approval pages qua endpoint dedicated để nhận đủ data review/insight và giảm coupling.

### Mismatch 3: FE không gửi server-side pagination cho một số list route dù BE support paging
- Endpoint:
  - `GET /api/contracts`, `GET /api/customers`, `GET /api/projects`, `GET /api/invoices`.
- FE hiện đang làm gì:
  - Chủ yếu gửi `keyword/status`, sau đó filter + paginate ở client (`slice`).
- Backend contract mong đợi gì:
  - Các endpoint list trong docs có paging/filter server-side.
- Mức độ ảnh hưởng: **Medium** (performance, consistency).
- Gợi ý sửa:
  - Chuẩn hóa query `page/pageSize` (hoặc `size`) theo từng endpoint và dùng pagination BE làm source of truth.

### Mismatch 4: `POST /api/contracts/{id}/submit` FE gửi `{}` khi không có form submit payload
- Endpoint: `POST /api/contracts/{id}/submit`.
- FE hiện đang làm gì:
  - `contractService.submit(id)` gửi `request ?? {}`.
- Backend contract mong đợi gì:
  - Docs mô tả `ContractSubmitRequest` (`scheduledSubmissionAt`, `submissionNote`) là payload submit.
- Mức độ ảnh hưởng: **Low-Medium** (tuỳ BE validation).
- Gợi ý sửa:
  - Nếu BE yêu cầu body strict, FE nên gửi đúng DTO hoặc BE chấp nhận body rỗng chính thức.

### Mismatch 5: Legacy alias payload ở Project create/update
- Endpoint: `POST/PUT /api/projects*`.
- FE hiện đang làm gì:
  - UI page gửi alias `code`, `warehouseId`, `progress`; service map về canonical + inject default (`location: "TBD"`, `budget: 1`, `assignedProjectManager: "TBD"`).
- Backend contract mong đợi gì:
  - Docs mô tả canonical fields domain-oriented.
- Mức độ ảnh hưởng: **Low-Medium**.
- Gợi ý sửa:
  - Đồng bộ UI form với canonical fields, giảm default kỹ thuật để tránh dữ liệu giả.

## 9. Findings / Risks
1. Nhiều route list đang over-fetch và paginate/filter ở client (`contracts`, `customers`, `projects`, `payments`).
2. Duplicate product-load logic (`GET /api/products?page=1&pageSize=1000`) lặp lại ở nhiều form pages.
3. Một số service methods/endpoint đã define nhưng chết (section 6) làm tăng độ nhiễu integration.
4. Approval flow chưa dùng endpoint chuyên dụng (review/pending), có thể thiếu business context.
5. `ExportReportPage` đã mount route nhưng chưa có integration backend.
6. Có các `catch { setOptions([]) }` silent fail ở nhiều page load options -> dễ che giấu lỗi integration runtime.
7. Conditional branch endpoint chưa có runtime caller (`/api/quotations/submit`, `PUT .../progress/{progressUpdateId}`).

## 10. Confidence / Method Notes
- Full call path đã xác nhận (`page -> service -> axios call`) cho toàn bộ endpoint `Active / Used` trong section 3 và matrix.
- Endpoint chỉ xác nhận ở service level nhưng chưa có runtime path: đã liệt kê ở section 6.
- Endpoint demo/test only: không có.
- Vùng cần lưu ý:
  - `POST /api/quotations/submit` và `PUT /api/projects/{id}/progress/{progressUpdateId}` là nhánh condition trong method đã dùng, nhưng chưa thấy caller phù hợp hiện tại.
  - `contractService.track` endpoint được xác nhận thủ công từ code (`GET /api/contracts/{id}/tracking`) do parser tự động bỏ sót call multiline.

---

### Method trace notes
- Nguồn sự thật chính: FE runtime code (`pages/components/hooks`) + service layer + axios wrapper.
- BE docs (`API_DOCUMENTATION.md`, `API_CHANGE_ASSESSMENT_2026-03-29.md`) chỉ dùng để đối chiếu mismatch/impact, không dùng để suy ngược inventory API FE.


