# UI Permission Matrix Assessment

Ngày audit: 2026-03-29  
Phạm vi: Frontend/UI (`routes`, `guards`, `sidebar/menu`, `list/detail/form/actions`, `CTA`, `dashboard/reports`, `auth/profile`)

## 1. Executive Summary
- Tổng số chức năng đối chiếu: **63**
- **PASS:** 42/63 (66.7%)
- **PARTIAL:** 3/63 (4.8%)
- **MISSING:** 11/63 (17.5%)
- **ROLE_MISMATCH:** 7/63 (11.1%)
- **UNVERIFIED:** 0/63 (riêng cơ chế hard-delete backend của Product chưa thể xác minh hoàn toàn từ UI)

Nhóm module tương đối ổn:
- Authentication cơ bản (register/login/logout/reset), User Management (owner), Product, Price List, Promotion, Inventory.

Nhóm thiếu nhiều nhất:
- Project lifecycle nâng cao (delete/close/confirm milestone).
- Invoice/Debt nghiệp vụ nâng cao (create/update/cancel invoice, reminder, settlement).
- Contract phụ trợ (cancel, print documents).

Lỗi phân quyền đáng lo nhất:
- `ACCOUNTANT` truy cập được route tạo báo giá (`/quotations/create`) dù ma trận không cho phép.
- `CUSTOMER` nhìn thấy CTA không đúng quyền ở Project và Invoice Detail.
- `OWNER` bị thiếu quyền Inventory Report theo ma trận.
- `OWNER` lại có quyền xem Project Financial Summary dù ma trận không cho phép.

## 2. Coverage Summary Table

Legend: `PASS` | `PARTIAL` | `MISSING` | `ROLE_MISMATCH` | `UNVERIFIED`

| Chức năng | Guest | Customer | Warehouse | Accountant | Owner | Trạng thái chung | Nhận xét ngắn | File/path liên quan |
|---|---|---|---|---|---|---|---|---|
| Register | PASS | PASS | PASS | PASS | PASS | PASS | Có trang register cho guest, role khác bị redirect khi đã login | `src/App.tsx`, `src/pages/auth/RegisterPage.tsx`, `src/const/authz.const.ts` |
| Login / Logout | PASS | PASS | PASS | PASS | PASS | PASS | Login page + logout trong avatar dropdown | `src/pages/auth/LoginPage.tsx`, `src/components/navigation/UserAvatarDropdown.tsx` |
| Change Password / Reset Password / View Profile / Update Profile | PASS | PARTIAL | PARTIAL | PARTIAL | PARTIAL | PARTIAL | Có reset + profile view/update, **chưa có UI change-password** | `src/pages/auth/ForgotPasswordPage.tsx`, `src/pages/auth/ResetPasswordPage.tsx`, `src/pages/profile/UserProfilePage.tsx`, `src/services/auth/auth.service.ts` |
| Create User Account | PASS | PASS | PASS | PASS | PASS | PASS | Owner có modal tạo account | `src/const/authz.const.ts`, `src/pages/accounts/AccountListPage.tsx` |
| View User Account | PASS | PASS | PASS | PASS | PASS | PASS | Owner có list + detail modal | `src/pages/accounts/AccountListPage.tsx` |
| Update User Account | PASS | PASS | PASS | PASS | PASS | PASS | Owner có edit modal | `src/pages/accounts/AccountListPage.tsx` |
| Deactivate User Account | PASS | PASS | PASS | PASS | PASS | PASS | Owner có deactivate/activate action | `src/pages/accounts/AccountListPage.tsx`, `src/services/account/account.service.ts` |
| View Product List | PASS | PASS | PASS | PASS | PASS | PASS | Guest/Customer/Warehouse xem được, Accountant/Owner bị chặn | `src/const/authz.const.ts`, `src/pages/products/ProductListPage.tsx` |
| View Product Details | PASS | PASS | PASS | PASS | PASS | PASS | Có detail page đúng nhóm role | `src/const/authz.const.ts`, `src/pages/products/ProductDetailPage.tsx` |
| Filter Products | PASS | PASS | PASS | PASS | PASS | PASS | Filter modal có đủ bộ lọc | `src/pages/products/ProductListPage.tsx` |
| Search Products | PASS | PASS | PASS | PASS | PASS | PASS | Search bar hoạt động ở list | `src/pages/products/ProductListPage.tsx` |
| Create Product | PASS | PASS | PASS | PASS | PASS | PASS | Chỉ Warehouse có CTA + route hợp lệ | `src/const/authz.const.ts`, `src/pages/products/ProductListPage.tsx`, `src/pages/products/ProductCreatePage.tsx` |
| Update Product | PASS | PASS | PASS | PASS | PASS | PASS | Chỉ Warehouse có edit | `src/pages/products/ProductListPage.tsx`, `src/pages/products/ProductEditPage.tsx`, `src/const/authz.const.ts` |
| Delete Product | PASS | PASS | PASS | PASS | PASS | PASS | Chỉ Warehouse có delete; UI mô tả **soft-delete**; hard/soft thực tế backend chưa thể xác minh từ FE | `src/pages/products/ProductListPage.tsx`, `src/services/product/product.service.ts` |
| Create Price List | PASS | PASS | PASS | PASS | PASS | PASS | Chỉ Owner tạo được | `src/const/authz.const.ts`, `src/pages/pricing/PriceListListPage.tsx`, `src/pages/pricing/PriceListCreatePage.tsx` |
| View Price List | PASS | PASS | PASS | PASS | PASS | PASS | Accountant/Owner có list/detail | `src/const/authz.const.ts`, `src/pages/pricing/PriceListListPage.tsx`, `src/pages/pricing/PriceListDetailPage.tsx` |
| Update Price List | PASS | PASS | PASS | PASS | PASS | PASS | Edit mode chỉ Owner | `src/pages/pricing/PriceListDetailPage.tsx`, `src/const/authz.const.ts` |
| Delete Price List | PASS | PASS | PASS | PASS | PASS | PASS | Delete chỉ Owner | `src/pages/pricing/PriceListListPage.tsx`, `src/const/authz.const.ts` |
| Create Promotion | PASS | PASS | PASS | PASS | PASS | PASS | Chỉ Owner có create | `src/pages/promotions/PromotionListPage.tsx`, `src/pages/promotions/promotion.utils.ts` |
| View Promotion | PASS | PASS | PASS | PASS | PASS | PASS | Customer/Accountant/Owner có view list/detail | `src/const/authz.const.ts`, `src/pages/promotions/PromotionListPage.tsx`, `src/pages/promotions/PromotionDetailPage.tsx` |
| Update Promotion | PASS | PASS | PASS | PASS | PASS | PASS | Edit chỉ Owner | `src/pages/promotions/PromotionDetailPage.tsx`, `src/pages/promotions/promotion.utils.ts` |
| Delete Promotion | PASS | PASS | PASS | PASS | PASS | PASS | Delete chỉ Owner | `src/pages/promotions/PromotionListPage.tsx`, `src/pages/promotions/promotion.utils.ts` |
| Create Inventory Receipt | PASS | PASS | PASS | PASS | PASS | PASS | Chỉ Warehouse | `src/const/authz.const.ts`, `src/pages/inventory/InventoryReceiptCreatePage.tsx` |
| Create Inventory Issue | PASS | PASS | PASS | PASS | PASS | PASS | Chỉ Warehouse | `src/pages/inventory/InventoryIssueCreatePage.tsx`, `src/const/authz.const.ts` |
| Adjust Inventory | PASS | PASS | PASS | PASS | PASS | PASS | Chỉ Warehouse | `src/pages/inventory/InventoryAdjustmentCreatePage.tsx`, `src/const/authz.const.ts` |
| View Inventory Status | PASS | PASS | PASS | PASS | PASS | PASS | Chỉ Warehouse có route/menu | `src/pages/inventory/InventoryStatusPage.tsx`, `src/const/authz.const.ts`, `src/components/navigation/Sidebar.tsx` |
| View Inventory History | PASS | PASS | PASS | PASS | PASS | PASS | Chỉ Warehouse | `src/pages/inventory/InventoryHistoryPage.tsx`, `src/const/authz.const.ts` |
| Create Quotation | PASS | PASS | PASS | ROLE_MISMATCH | PASS | ROLE_MISMATCH | Accountant có thể vào trực tiếp `/quotations/create` (menu ẩn nhưng route không chặn) | `src/const/authz.const.ts`, `src/App.tsx`, `src/pages/quotations/QuotationCreatePage.tsx` |
| View List Quotation | PASS | PASS | PASS | PASS | PASS | PASS | Customer/Accountant có list, role khác bị chặn | `src/pages/quotations/QuotationListPage.tsx`, `src/const/authz.const.ts` |
| Create Contract | PASS | PASS | PASS | PASS | PASS | PASS | Accountant tạo contract từ quotation | `src/pages/quotations/QuotationListPage.tsx`, `src/pages/contracts/ContractCreatePage.tsx`, `src/const/authz.const.ts` |
| View Contract | PASS | PASS | PASS | PASS | PASS | PASS | Customer/Accountant xem list/detail/track | `src/pages/contracts/ContractListPage.tsx`, `src/pages/contracts/ContractDetailPage.tsx`, `src/const/authz.const.ts` |
| Update Contract | PASS | PASS | PASS | PASS | PASS | PASS | Accountant có edit | `src/pages/contracts/ContractListPage.tsx`, `src/pages/contracts/ContractEditPage.tsx` |
| Cancel Contract | PASS | PASS | PASS | MISSING | PASS | MISSING | Có service `cancel` nhưng **không có UI action/page** | `src/services/contract/contract.service.ts`, `src/pages/contracts/ContractDetailPage.tsx` |
| Submit Contract | PASS | PASS | PASS | PASS | PASS | PASS | Accountant submit từ contract detail | `src/pages/contracts/ContractDetailPage.tsx`, `src/const/authz.const.ts` |
| Track Contract | PASS | PASS | PASS | PASS | PASS | PASS | Customer/Accountant có tracking page | `src/pages/contracts/ContractTrackingPage.tsx`, `src/pages/contracts/ContractDetailPage.tsx` |
| Print Contract Documents | PASS | PASS | PASS | MISSING | PASS | MISSING | Chưa có UI in/xuất tài liệu hợp đồng | `src/api/URL_const.ts`, `src/pages/contracts/ContractDetailPage.tsx` |
| Approve Contract | PASS | PASS | PASS | PASS | PASS | PASS | Owner có approvals list/detail + approve/reject/request modification | `src/pages/approvals/ContractApprovalListPage.tsx`, `src/pages/approvals/ContractApprovalDetailPage.tsx`, `src/const/authz.const.ts` |
| Create Customer | PASS | PASS | PASS | PASS | PASS | PASS | Accountant tạo customer | `src/pages/customers/CustomerListPage.tsx`, `src/pages/customers/CustomerCreatePage.tsx`, `src/const/authz.const.ts` |
| View Customer Information | PASS | PASS | PASS | PASS | PASS | PASS | Accountant có list/detail | `src/pages/customers/CustomerListPage.tsx`, `src/pages/customers/CustomerDetailPage.tsx` |
| Update Customer Information | PASS | PASS | PASS | PASS | PASS | PASS | Accountant có edit | `src/pages/customers/CustomerEditPage.tsx`, `src/const/authz.const.ts` |
| Delete / Disable Customer | PASS | PASS | PASS | MISSING | PASS | MISSING | Chưa có delete/disable customer UI | `src/pages/customers/CustomerListPage.tsx`, `src/services/customer/customer.service.ts` |
| Create Project | PASS | ROLE_MISMATCH | PASS | PASS | PASS | ROLE_MISMATCH | Customer thấy nút "Tạo dự án" dù không có quyền route | `src/pages/projects/ProjectListPage.tsx`, `src/const/authz.const.ts`, `src/components/navigation/Sidebar.tsx` |
| View Project | PASS | PASS | PASS | PASS | PASS | PASS | Customer/Accountant xem list/detail | `src/pages/projects/ProjectListPage.tsx`, `src/pages/projects/ProjectDetailPage.tsx` |
| Update Project | PASS | ROLE_MISMATCH | PASS | PASS | PASS | ROLE_MISMATCH | Customer thấy nút "Cập nhật" trong detail | `src/pages/projects/ProjectDetailPage.tsx`, `src/const/authz.const.ts` |
| Delete Project | PASS | PASS | PASS | MISSING | PASS | MISSING | Chưa có delete project | `src/pages/projects/ProjectListPage.tsx`, `src/pages/projects/ProjectDetailPage.tsx` |
| Assign Warehouse to Project | PASS | ROLE_MISMATCH | PASS | PASS | PASS | ROLE_MISMATCH | Customer thấy nút "Gán kho" dù không có quyền | `src/pages/projects/ProjectDetailPage.tsx`, `src/pages/projects/ProjectAssignWarehousePage.tsx`, `src/const/authz.const.ts` |
| Update Project Progress | PASS | PASS | PASS | PARTIAL | PASS | PARTIAL | Có gọi `updateProgress` trong Edit, nhưng chưa có flow progress/milestone độc lập | `src/pages/projects/ProjectEditPage.tsx`, `src/services/project/project.service.ts` |
| Confirm Project Milestone | PASS | MISSING | PASS | PASS | PASS | MISSING | Chưa có UI customer xác nhận milestone | `src/pages/projects/*`, `src/models/project/project.model.ts` |
| View Project Financial Summary | PASS | PASS | PASS | PASS | ROLE_MISMATCH | ROLE_MISMATCH | Owner truy cập được dù ma trận chỉ cho Accountant | `src/const/authz.const.ts`, `src/pages/reports/FinancialReportPage.tsx`, `src/App.tsx` |
| Close Project | PASS | PASS | PASS | MISSING | PASS | MISSING | Không có close-project action/page | `src/pages/projects/*` |
| Create Invoice | PASS | PASS | PASS | MISSING | PASS | MISSING | Không có UI tạo hóa đơn | `src/pages/payments/*`, `src/const/route_url.const.ts` |
| View Invoice | PASS | PASS | PASS | PASS | PASS | PASS | Customer/Accountant xem list/detail invoice | `src/pages/payments/PaymentListPage.tsx`, `src/pages/payments/PaymentDetailPage.tsx` |
| Update Invoice | PASS | PASS | PASS | MISSING | PASS | MISSING | Không có UI update invoice | `src/pages/payments/*` |
| Cancel Invoice | PASS | PASS | PASS | MISSING | PASS | MISSING | Không có UI cancel invoice | `src/pages/payments/*` |
| Record Customer Payment | PASS | ROLE_MISMATCH | PASS | PASS | PASS | ROLE_MISMATCH | Customer thấy CTA ghi nhận ở invoice detail (route vẫn bị chặn) | `src/pages/payments/PaymentDetailPage.tsx`, `src/pages/payments/PaymentListPage.tsx`, `src/const/authz.const.ts` |
| View Debt Status | PASS | PASS | PASS | PASS | PASS | PASS | Có bảng Debt Status cho customer/accountant | `src/pages/payments/PaymentListPage.tsx` |
| Send Payment Reminder | PASS | PASS | PASS | MISSING | PASS | MISSING | Chưa có UI send reminder | `src/pages/payments/*` |
| Confirm Debt Settlement | PASS | PASS | PASS | MISSING | PASS | MISSING | Chưa có UI confirm settlement | `src/pages/payments/*` |
| View Sales Report | PASS | PASS | PASS | PASS | PASS | PASS | Accountant/Owner có route + menu | `src/const/authz.const.ts`, `src/pages/reports/SalesReportPage.tsx`, `src/components/navigation/Sidebar.tsx` |
| View Inventory Report | PASS | PASS | PASS | PASS | ROLE_MISMATCH | ROLE_MISMATCH | Owner bị thiếu quyền route/menu trái ma trận | `src/const/authz.const.ts`, `src/components/navigation/Sidebar.tsx`, `src/pages/reports/InventoryReportPage.tsx` |
| View Project Report | PASS | PASS | PASS | PASS | PASS | PASS | Accountant/Owner truy cập được report project | `src/const/authz.const.ts`, `src/App.tsx`, `src/pages/reports/FinancialReportPage.tsx` |
| Export Report | PASS | PASS | PASS | PARTIAL | PARTIAL | PARTIAL | Có route/menu nhưng trang mới là placeholder, chưa có export action thực | `src/pages/reports/ExportReportPage.tsx`, `src/const/authz.const.ts` |
| View Dashboard | PASS | PASS | PASS | PASS | PASS | PASS | Chỉ Owner có dashboard | `src/const/authz.const.ts`, `src/components/navigation/Sidebar.tsx`, `src/pages/dashboard/DashboardPage.tsx` |

## 3. Detailed Findings by Module

### Authentication & Profile
- Những gì đã có:
  - Register/Login/Forgot/Reset/Verify đầy đủ route và page.
  - Logout có trong avatar dropdown.
  - Profile có view/update cho 4 role đã đăng nhập.
- Những gì thiếu:
  - Chưa có UI Change Password dù service đã có method.
- Những gì sai quyền:
  - Không phát hiện sai quyền rõ ràng trong auth/profile.
- Những gì chưa xác minh được:
  - Không.
- File/path tham chiếu:
  - `src/App.tsx`
  - `src/pages/auth/*.tsx`
  - `src/pages/profile/UserProfilePage.tsx`
  - `src/services/auth/auth.service.ts`

### User Management
- Những gì đã có:
  - Owner-only module với list/create/view/update/deactivate/activate account.
- Những gì thiếu:
  - Không thiếu theo ma trận.
- Những gì sai quyền:
  - Không thấy lộ quyền ra role khác.
- Những gì chưa xác minh được:
  - Không.
- File/path tham chiếu:
  - `src/const/authz.const.ts`
  - `src/pages/accounts/AccountListPage.tsx`
  - `src/services/account/account.service.ts`

### Product
- Những gì đã có:
  - List/detail/filter/search cho Guest/Customer/Warehouse.
  - Create/edit/delete cho Warehouse.
- Những gì thiếu:
  - Không thiếu theo ma trận.
- Những gì sai quyền:
  - Không thấy sai quyền chính.
- Những gì chưa xác minh được:
  - UI ghi "soft-delete" nhưng service gọi DELETE endpoint; hard/soft thực tế backend chưa thể xác minh từ FE.
- File/path tham chiếu:
  - `src/const/authz.const.ts`
  - `src/pages/products/ProductListPage.tsx`
  - `src/pages/products/ProductDetailPage.tsx`
  - `src/pages/products/ProductCreatePage.tsx`
  - `src/pages/products/ProductEditPage.tsx`
  - `src/services/product/product.service.ts`

### Price List
- Những gì đã có:
  - Owner create/update/delete.
  - Accountant + Owner view list/detail.
- Những gì thiếu:
  - Không thiếu theo ma trận.
- Những gì sai quyền:
  - Không thấy sai quyền chính.
- Những gì chưa xác minh được:
  - Không.
- File/path tham chiếu:
  - `src/const/authz.const.ts`
  - `src/pages/pricing/PriceListListPage.tsx`
  - `src/pages/pricing/PriceListCreatePage.tsx`
  - `src/pages/pricing/PriceListDetailPage.tsx`

### Promotion
- Những gì đã có:
  - View cho Customer/Accountant/Owner.
  - Create/update/delete cho Owner.
- Những gì thiếu:
  - Không thiếu theo ma trận.
- Những gì sai quyền:
  - Không thấy sai quyền chính.
- Những gì chưa xác minh được:
  - Không.
- File/path tham chiếu:
  - `src/const/authz.const.ts`
  - `src/pages/promotions/PromotionListPage.tsx`
  - `src/pages/promotions/PromotionCreatePage.tsx`
  - `src/pages/promotions/PromotionDetailPage.tsx`

### Inventory
- Những gì đã có:
  - Warehouse có status/history/receipt/issue/adjust đầy đủ.
- Những gì thiếu:
  - Không thiếu theo ma trận cho Warehouse.
- Những gì sai quyền:
  - Owner thiếu quyền Inventory Report (nằm nhóm Report, không phải Inventory transaction).
- Những gì chưa xác minh được:
  - Không.
- File/path tham chiếu:
  - `src/pages/inventory/*.tsx`
  - `src/services/inventory/inventory.service.ts`
  - `src/const/authz.const.ts`

### Quotation
- Những gì đã có:
  - Customer có create/list/detail.
  - Accountant có list/detail và create contract từ quotation.
- Những gì thiếu:
  - Không thiếu major flow theo ma trận.
- Những gì sai quyền:
  - Accountant vẫn vào được `/quotations/create` qua URL direct.
- Những gì chưa xác minh được:
  - Không.
- File/path tham chiếu:
  - `src/const/authz.const.ts`
  - `src/pages/quotations/QuotationListPage.tsx`
  - `src/pages/quotations/QuotationCreatePage.tsx`
  - `src/App.tsx`

### Contract
- Những gì đã có:
  - Customer/Accountant xem contract và track.
  - Accountant update + submit.
  - Owner approve qua module approvals.
- Những gì thiếu:
  - Chưa có UI cancel contract.
  - Chưa có UI print/export contract documents.
- Những gì sai quyền:
  - Không thấy leak nghiêm trọng trong contract actions hiện có.
- Những gì chưa xác minh được:
  - Không.
- File/path tham chiếu:
  - `src/pages/contracts/*.tsx`
  - `src/pages/approvals/*.tsx`
  - `src/services/contract/contract.service.ts`

### Customer
- Những gì đã có:
  - Accountant có create/view/update customer.
- Những gì thiếu:
  - Chưa có delete/disable customer.
- Những gì sai quyền:
  - Không thấy lộ quyền role khác.
- Những gì chưa xác minh được:
  - Không.
- File/path tham chiếu:
  - `src/pages/customers/*.tsx`
  - `src/services/customer/customer.service.ts`
  - `src/const/authz.const.ts`

### Project
- Những gì đã có:
  - Customer + Accountant có view list/detail.
  - Accountant có create/edit/assign warehouse.
  - Có update progress tích hợp trong Project Edit.
- Những gì thiếu:
  - Chưa có delete project.
  - Chưa có close project.
  - Chưa có customer confirm milestone.
- Những gì sai quyền:
  - Customer thấy CTA create/update/assign warehouse (không đúng ma trận).
  - Owner thấy được project financial summary (không đúng ma trận).
- Những gì chưa xác minh được:
  - Không.
- File/path tham chiếu:
  - `src/pages/projects/ProjectListPage.tsx`
  - `src/pages/projects/ProjectDetailPage.tsx`
  - `src/pages/projects/ProjectEditPage.tsx`
  - `src/pages/projects/ProjectAssignWarehousePage.tsx`
  - `src/pages/reports/FinancialReportPage.tsx`
  - `src/const/authz.const.ts`

### Invoice / Debt
- Những gì đã có:
  - View invoice list/detail cho Customer/Accountant.
  - Record payment cho Accountant.
  - View debt status cho Customer/Accountant.
- Những gì thiếu:
  - Chưa có create/update/cancel invoice.
  - Chưa có send payment reminder.
  - Chưa có confirm debt settlement.
- Những gì sai quyền:
  - Customer thấy CTA "Ghi nhận thanh toán" trong invoice detail (dù route bị chặn).
- Những gì chưa xác minh được:
  - Không.
- File/path tham chiếu:
  - `src/pages/payments/PaymentListPage.tsx`
  - `src/pages/payments/PaymentDetailPage.tsx`
  - `src/pages/payments/RecordPaymentPage.tsx`
  - `src/const/authz.const.ts`

### Report / Dashboard
- Những gì đã có:
  - Sales report (Accountant/Owner), Project report (Accountant/Owner), Dashboard (Owner).
- Những gì thiếu:
  - Export report mới là placeholder text, chưa có luồng export thực.
- Những gì sai quyền:
  - Owner **thiếu** Inventory Report (ma trận yêu cầu có).
  - Owner **thừa** quyền Project Financial Summary.
- Những gì chưa xác minh được:
  - Không.
- File/path tham chiếu:
  - `src/const/authz.const.ts`
  - `src/components/navigation/Sidebar.tsx`
  - `src/pages/reports/SalesReportPage.tsx`
  - `src/pages/reports/InventoryReportPage.tsx`
  - `src/pages/reports/FinancialReportPage.tsx`
  - `src/pages/reports/ExportReportPage.tsx`
  - `src/pages/dashboard/DashboardPage.tsx`

## 4. Role-based Gap Analysis

### Guest
- Đang thấy gì:
  - Register/Login/Forgot/Reset + Product list/detail/filter/search.
- Thiếu gì:
  - Không có thiếu đáng kể theo ma trận guest.
- Lộ gì:
  - Chưa thấy lộ action nhạy cảm cho guest.

### Customer
- Đang thấy gì:
  - Product view, promotion view, quotation create/list/detail, contract view/track, project view, invoice/debt view.
- Thiếu gì:
  - Confirm Project Milestone chưa có UI.
- Lộ gì:
  - Thấy CTA tạo/cập nhật/gán kho dự án dù không có quyền.
  - Thấy CTA ghi nhận thanh toán ở invoice detail dù không có quyền.

### Warehouse
- Đang thấy gì:
  - Product CRUD + Inventory full flow + Inventory Report.
- Thiếu gì:
  - Không thiếu lớn theo ma trận warehouse.
- Lộ gì:
  - Không phát hiện lộ quyền đáng kể.

### Accountant
- Đang thấy gì:
  - Customer/Quotation/Contract/Project/Invoice & Debt/Reports theo phần lớn ma trận.
- Thiếu gì:
  - Cancel contract, print contract docs.
  - Delete/disable customer.
  - Delete/close project; progress flow còn chưa tách rõ.
  - Create/update/cancel invoice; reminder; settlement.
- Lộ gì:
  - Truy cập được route create quotation dù ma trận không cho.

### Owner
- Đang thấy gì:
  - Dashboard, User Management, Price List, Promotion, Contract approvals, Sales/Project/Export reports.
- Thiếu gì:
  - Inventory Report (theo ma trận phải có).
- Lộ gì:
  - Có thể xem Project Financial Summary dù ma trận không cho.

## 5. High-risk Issues
- `ROLE_MISMATCH`: Accountant vào được `/quotations/create` qua route guard prefix-based (`/quotations`) nhưng thiếu deny rule cho create.
- `ROLE_MISMATCH`: Customer thấy CTA nghiệp vụ Project (create/update/assign warehouse) dễ gây nhầm quyền và tạo hành vi truy cập sai.
- `ROLE_MISMATCH`: Customer thấy CTA ghi nhận thanh toán trong invoice detail.
- `ROLE_MISMATCH`: Owner thiếu quyền Inventory Report do cả menu lẫn route guard đều không cho.
- `ROLE_MISMATCH`: Owner thừa quyền xem Project Financial Summary.
- `MISSING`: Contract chưa có cancel và print documents trên UI.
- `MISSING`: Invoice lifecycle còn thiếu create/update/cancel/reminder/settlement.
- `MISSING`: Project lifecycle thiếu delete/close/milestone confirmation.
- `POTENTIAL UX/SECURITY`: Có route `/test` public ngoài guard, không thuộc matrix nghiệp vụ nhưng nên loại bỏ ở môi trường production.

## 6. Prioritized Recommendations

### P0: lỗi phân quyền nghiêm trọng / hở quyền
- Chặn `ACCOUNTANT` truy cập `/quotations/create` ở `canAccessPathByRole` (deny pattern/prefix rõ ràng).
- Ẩn CTA sai quyền cho `CUSTOMER` ở Project (`Create`, `Update`, `Assign Warehouse`) và Payment Detail (`Record Payment`).
- Sửa quyền `OWNER` cho Inventory Report theo ma trận (menu + route guard).
- Tách/giới hạn quyền Project Financial Summary để Owner không truy cập nếu theo ma trận là `-`.

### P1: thiếu màn hình nghiệp vụ chính
- Bổ sung UI cho: `Cancel Contract`, `Print Contract Documents`.
- Bổ sung UI cho: `Delete/Disable Customer`.
- Bổ sung UI cho: `Create/Update/Cancel Invoice`.

### P2: thiếu action phụ / thiếu hoàn thiện flow
- Bổ sung `Send Payment Reminder`, `Confirm Debt Settlement`.
- Bổ sung `Delete Project`, `Close Project`, `Confirm Project Milestone`.
- Hoàn thiện flow `Update Project Progress` thành action/page rõ ràng riêng (không chỉ side-effect trong Edit).

### P3: cải thiện UX/UI structure
- Chuẩn hóa điều kiện hiển thị CTA theo cùng một policy helper (`canPerformAction`/policy map) để giảm lệch UI so với guard.
- Với trang placeholder (`Export Report`), hiển thị rõ trạng thái "coming soon" và ẩn khỏi menu nếu chưa dùng production.
- Rà soát các trang text đơn giản để đảm bảo đúng bố cục nghiệp vụ (form/action/detail) trước khi đánh PASS.

## 7. Final Verdict
- Mức độ đáp ứng ma trận hiện tại (strict PASS): **66.7%** (42/63 chức năng).
- Module đủ tốt để sử dụng sớm: Product, Price List, Promotion, Inventory, User Management (owner).
- Module cần ưu tiên sửa trước:
  1. Phân quyền route/action sai ở Quotation, Project, Payment, Report.
  2. Các thiếu hụt nghiệp vụ lớn ở Contract, Project lifecycle, Invoice/Debt lifecycle.
  3. Hoàn thiện auth profile với Change Password UI.
