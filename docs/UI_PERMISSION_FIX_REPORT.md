# UI Permission Fix Report

Ngay cap nhat: 2026-03-29

## 1) Tong quan
Frontend da duoc refactor permission theo mot nguon su that duy nhat va da fix nhom loi ROLE_MISMATCH trong file audit.

Ket qua coverage sau fix:
- PASS: 56/63
- PARTIAL: 7/63
- MISSING: 0/63
- ROLE_MISMATCH: 0/63

Danh gia cuoi: **chua dat 100%** do blocker backend API cho mot so nghiep vu invoice/debt/report export va hard-delete project.

## 2) Kien truc permission sau refactor
Nguon su that trung tam: `src/const/authz.const.ts`

Cac cau phan chinh:
- `PERMISSION_ROLE_MAP`: role -> permission key theo matrix
- `ACTION_PERMISSION_MAP`: CTA/page action -> permission key
- `MENU_PERMISSION_MAP`: sidebar/menu key -> permission key
- `PROTECTED_ROUTE_RULES`: route template (`:id`) -> permission key

Helper dung chung:
- `hasPermission(role, permission)`
- `canPerformAction(role, action)`
- `canSeeMenu(role, menuId)`
- `canAccessPathByRole(role, pathname)`

Dong bo da ap dung cho:
- Route guard + deep-link denial
- Sidebar/menu visibility
- Page header CTA
- Row action/button action

## 3) File da sua
- `src/const/authz.const.ts`
- `src/const/route_url.const.ts`
- `src/App.tsx`
- `src/components/navigation/Sidebar.tsx`
- `src/pages/profile/UserProfilePage.tsx`
- `src/pages/contracts/ContractDetailPage.tsx`
- `src/services/contract/contract.service.ts`
- `src/pages/customers/CustomerListPage.tsx`
- `src/pages/customers/CustomerDetailPage.tsx`
- `src/services/customer/customer.service.ts`
- `src/pages/projects/ProjectListPage.tsx`
- `src/pages/projects/ProjectDetailPage.tsx`
- `src/pages/projects/ProjectEditPage.tsx`
- `src/pages/projects/ProjectProgressUpdatePage.tsx` (new)
- `src/services/project/project.service.ts`
- `src/pages/payments/PaymentListPage.tsx`
- `src/pages/payments/PaymentDetailPage.tsx`
- `src/pages/quotations/QuotationListPage.tsx`
- `src/pages/quotations/QuotationDetailPage.tsx`
- `src/pages/products/ProductListPage.tsx`
- `src/pages/products/ProductDetailPage.tsx`
- `src/pages/promotions/promotion.utils.ts`
- `src/pages/reports/ExportReportPage.tsx`
- `tests/e2e/helpers/checklists.ts`
- `tests/e2e/permission-smoke.spec.ts` (new)

## 4) ROLE_MISMATCH da fix
1. ACCOUNTANT khong con vao duoc `/quotations/create` (route guard + deep-link).
2. CUSTOMER khong con thay CTA sai quyen trong Project:
   - Create Project
   - Update Project
   - Assign Warehouse
3. CUSTOMER khong con thay CTA `Record Payment`.
4. OWNER duoc cap quyen `Inventory Report` dung matrix:
   - route
   - sidebar/menu
   - page access
5. OWNER bi go quyen `Project Financial Summary`:
   - route `/reports/financial`
   - direct URL denial
6. Route `/test` da bo khoi production flow.

## 5) MISSING/PARTIAL da hoan thien
Da hoan thien luong/UI (PASS):
- Change Password UI (Profile)
- Cancel Contract action
- Print Contract Documents action (generate/list/export)
- Delete/Disable Customer
- Confirm Project Milestone
- Close Project
- Update Project Progress thanh flow rieng (`/projects/:id/progress`)

Da hoan thien theo soft-delete fallback co minh bach UX:
- Delete Project: su dung archive/soft-delete (`status=CANCELLED`) + confirmation text ro rang.

Da xu ly theo controlled PARTIAL (khong fake pass):
- Create Invoice
- Update Invoice
- Cancel Invoice
- Send Payment Reminder
- Confirm Debt Settlement
- Export Report

## 6) Blocker backend con lai
| Chuc nang | Trang thai | Blocker API | File lien quan |
|---|---|---|---|
| Delete Project (hard-delete) | PARTIAL | Khong co endpoint hard delete (chi co `PUT /api/projects/{id}`) | `src/services/project/project.service.ts`, `src/pages/projects/ProjectListPage.tsx`, `src/pages/projects/ProjectDetailPage.tsx` |
| Create Invoice | PARTIAL | Khong co `POST /api/invoices` trong FE endpoint constants/service | `src/api/URL_const.ts`, `src/services/payment/payment.service.ts`, `src/pages/payments/PaymentListPage.tsx` |
| Update Invoice | PARTIAL | Khong co `PUT/PATCH /api/invoices/{id}` | `src/api/URL_const.ts`, `src/services/payment/payment.service.ts`, `src/pages/payments/PaymentDetailPage.tsx` |
| Cancel Invoice | PARTIAL | Khong co endpoint cancel invoice | `src/api/URL_const.ts`, `src/services/payment/payment.service.ts`, `src/pages/payments/PaymentDetailPage.tsx` |
| Send Payment Reminder | PARTIAL | Khong co endpoint reminder | `src/api/URL_const.ts`, `src/services/payment/payment.service.ts`, `src/pages/payments/PaymentDetailPage.tsx` |
| Confirm Debt Settlement | PARTIAL | Khong co endpoint settlement confirm | `src/api/URL_const.ts`, `src/services/payment/payment.service.ts`, `src/pages/payments/PaymentDetailPage.tsx` |
| Export Report | PARTIAL | Khong co endpoint export report trong report service/constants | `src/pages/reports/ExportReportPage.tsx`, `src/services/report/report.service.ts`, `src/api/URL_const.ts` |

## 7) Coverage sau fix
| Ket qua | So luong |
|---|---:|
| PASS | 56 |
| PARTIAL | 7 |
| MISSING | 0 |
| ROLE_MISMATCH | 0 |

## 8) Verification da chay
Da chay thanh cong:
- `npm run build`
- `npx playwright test tests/e2e/permission-smoke.spec.ts --reporter=line` (5 passed)
- `npx playwright test tests/e2e/negative-access.spec.ts --reporter=line` (4 passed)

Da cap nhat smoke/checklist theo role:
- Guest
- Customer
- Warehouse
- Accountant
- Owner

Noi dung verify gom:
- Route access matrix
- Sidebar visibility
- Action button visibility
- Direct URL denial

## 9) Ket luan
- Da dat muc dong bo permission route/menu/CTA/action/deep-link theo matrix cho cac luong co API.
- Khong con ROLE_MISMATCH.
- Chua dat 100% do 7 blocker backend neu tren.
