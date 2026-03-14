# G91-UI Component Catalog

Tài liệu này tổng hợp **toàn bộ component hiện có** trong project `G91-UI`, dựa trên mã nguồn hiện tại trong `src/`.

## 1) Tổng quan kiến trúc

- Stack: `React 18 + TypeScript + Vite + TailwindCSS`
- Điểm vào app: `src/main.tsx`
- Router chính: `src/App.tsx`
- Khu vực component chính: `src/components/**`
- Trang demo tổng hợp component: `src/pages/404/test.page.tsx` (route: `/` và `/test`)

## 2) Theme và quy ước UI hiện có

Biến CSS global trong `src/index.css`:

- `--primary-color: 30, 91, 168`
- `--primary-text-color: 255,255,255`
- `--primary-border-color: 217,217,217`
- `--primary-rounded: 1rem`

Phong cách xuyên suốt:

- Card bo góc (`rounded-lg`, `rounded-2xl`)
- Bóng đổ nhẹ (`shadow-sm`, `shadow-xl`)
- Nền sáng (`bg-white`, `bg-gray-100`)
- Palette xanh dương cho action và navbar

## 3) Danh mục component theo nhóm

## 3.1 Layout Components

### `AppLayout`
- File: `src/components/layout/AppLayout.tsx`
- Vai trò:
  - Khung layout cho trang đã đăng nhập.
  - Ghép `Sidebar` + `TopNavbar` + vùng nội dung + `AppFooter`.
  - Responsive: desktop có sidebar trái; mobile mở dạng drawer.
- Props:
  - `children: ReactNode`
- Hành vi:
  - `onToggleSidebar` trên `TopNavbar` sẽ:
    - `< 1024px`: mở/đóng drawer mobile.
    - `>= 1024px`: collapse sidebar desktop.

### `ContentWrapper`
- File: `src/components/layout/ContentWrapper.tsx`
- Vai trò:
  - Wrapper đồng bộ nền và padding cho page.
- Props:
  - `children: ReactNode`
- Style chính:
  - `min-h-screen bg-gray-100 p-6`

### `PageHeader`
- File: `src/components/layout/PageHeader.tsx`
- Vai trò:
  - Header tiêu đề trang + actions bên phải.
- Props:
  - `title: string`
  - `rightActions?: ReactNode`

### `AppFooter`
- File: `src/components/layout/AppFooter.tsx`
- Vai trò:
  - Footer dùng cho layout app.
- Nội dung mặc định:
  - `© 2024 G90 Steel. Hanoi - Vietnam`

## 3.2 Navigation Components

### `Sidebar`
- File: `src/components/navigation/Sidebar.tsx`
- Vai trò:
  - Menu điều hướng dọc (dark blue gradient).
  - Có trạng thái `collapsed`.
- Props:
  - `collapsed?: boolean`
  - `activePath?: string`
  - `onNavigate?: (path: string) => void`
  - `className?: string`
- Menu hiện có:
  - Dashboard
  - Products (Product List, Add Product)
  - Inventory (Import/Export/History)
  - Quotation & Contract
  - Customers
  - Projects
  - Payments
  - Reports
  - Settings
- Ghi chú:
  - Icon hiện đang dùng ký tự đơn giản/placeholder.

### `SidebarItem`
- File: `src/components/navigation/SidebarItem.tsx`
- Vai trò:
  - Item tái sử dụng cho sidebar, hỗ trợ cây menu nhiều cấp.
- Kiểu dữ liệu:
  - `SidebarNode { id, icon?, label, path?, children? }`
- Props:
  - `item: SidebarNode`
  - `activePath?: string`
  - `collapsed?: boolean`
  - `depth?: number`
  - `onNavigate?: (path: string) => void`
- Hành vi:
  - Auto active theo `activePath`.
  - Có thể mở/đóng submenu.

### `TopNavbar`
- File: `src/components/navigation/TopNavbar.tsx`
- Vai trò:
  - Thanh top bar cho khu vực app.
  - Trái: nút toggle sidebar + title.
  - Phải: `NotificationBell` + `UserAvatarDropdown`.
- Props:
  - `onToggleSidebar?: () => void`
  - `title?: string`

### `NotificationBell`
- File: `src/components/navigation/NotificationBell.tsx`
- Vai trò:
  - Chuông thông báo kèm badge số lượng.
  - Dropdown list thông báo mẫu.
- Hành vi:
  - Click mở/đóng dropdown.
  - Click ngoài dropdown để đóng.

### `UserAvatarDropdown`
- File: `src/components/navigation/UserAvatarDropdown.tsx`
- Vai trò:
  - Avatar + username + menu thao tác.
- Menu mặc định:
  - `Profile`, `Settings`, `Logout`
- Hành vi:
  - Click mở/đóng dropdown.
  - Click ngoài để đóng.

## 3.3 Card Components

### `BaseCard`
- File: `src/components/cards/BaseCard.tsx`
- Vai trò:
  - Card nền tảng dùng lại cho nhiều vùng UI.
- Props:
  - `title?: string`
  - `actions?: ReactNode`
  - `children: ReactNode`
  - `className?: string`

### `InfoCard`
- File: `src/components/cards/InfoCard.tsx`
- Vai trò:
  - Card thống kê nhanh cho dashboard.
- Props:
  - `title: string`
  - `value: string`
  - `icon?: ReactNode`
  - `trend?: string`

## 3.4 Table Components

### `DataTable<T>`
- File: `src/components/table/DataTable.tsx`
- Vai trò:
  - Bảng dữ liệu generic, dùng cho nhiều loại row.
- Kiểu dữ liệu:
  - `DataTableColumn<T> { key, header, render?, className? }`
- Props:
  - `columns: DataTableColumn<T>[]`
  - `data: T[]`
  - `actions?: (row: T, index: number) => ReactNode`
  - `emptyText?: string`
- Hành vi:
  - Header động theo `columns`.
  - Hỗ trợ cột action riêng.
  - Zebra rows + hover highlight.

### `TableFilterBar`
- File: `src/components/table/TableFilterBar.tsx`
- Vai trò:
  - Thanh lọc bảng gồm search + select filters.
- Props:
  - `searchValue: string`
  - `onSearchChange: (value: string) => void`
  - `filters?: Array<{ key, placeholder, options, value, onChange }>`
- Thành phần nội bộ dùng lại:
  - `CustomSearchBar`
  - `CustomSelect`

### `Pagination`
- File: `src/components/table/Pagination.tsx`
- Vai trò:
  - Phân trang cơ bản (Previous/Next/số trang).
- Props:
  - `page: number`
  - `pageSize: number`
  - `total: number`
  - `onChange?: (newPage: number) => void`
- Hành vi:
  - Tự tính `totalPages`.
  - Disable nút đầu/cuối hợp lệ.

## 3.5 Form Components

### `FormSectionCard`
- File: `src/components/forms/FormSectionCard.tsx`
- Vai trò:
  - Gom nhóm trường nhập theo section.
- Props:
  - `title: string`
  - `children: ReactNode`

### `ImageUploadCard`
- File: `src/components/forms/ImageUploadCard.tsx`
- Vai trò:
  - Upload và preview ảnh sản phẩm.
- Props:
  - `title?: string` (mặc định `Product Image`)
- Hành vi:
  - Chọn file ảnh -> tạo preview bằng `URL.createObjectURL`.
  - Cleanup URL cũ để tránh leak.

### `StockConfigTable`
- File: `src/components/forms/StockConfigTable.tsx`
- Vai trò:
  - Bảng cấu hình tồn kho theo lô.
- Cột:
  - `Batch Code`, `Production Date`, `Weight`, `Stock Quantity`, `Action`
- Hành vi:
  - Add row động.
  - Remove row (không cho xoá khi còn 1 hàng).
  - Tính tổng quantity realtime.

## 3.6 Auth Components

### `AuthHeader`
- File: `src/components/auth/AuthHeader.tsx`
- Vai trò:
  - Header xanh cho màn auth, gồm logo + system text.
- Props:
  - `logo?: ReactNode`
  - `systemName?: string`
  - `tagline?: string`

### `AuthFooter`
- File: `src/components/auth/AuthFooter.tsx`
- Vai trò:
  - Footer chuẩn cho auth card.

### `AuthCard`
- File: `src/components/auth/AuthCard.tsx`
- Vai trò:
  - Khung dùng cho login/register/forgot/reset.
- Props:
  - `title: string`
  - `subtitle?: string`
  - `children: ReactNode`
  - `footer?: ReactNode`
  - `logo?: ReactNode`
  - `className?: string`
- Cấu trúc:
  - `AuthHeader` -> phần body (`BaseCard`) -> footer tùy biến.

## 3.7 Dashboard Components

### `StatsGrid`
- File: `src/components/dashboard/StatsGrid.tsx`
- Vai trò:
  - Grid hiển thị danh sách `InfoCard`.
- Props:
  - `items: StatItem[]`
  - `StatItem { title, value, icon?, trend? }`

### `ChartCard`
- File: `src/components/dashboard/ChartCard.tsx`
- Vai trò:
  - Card placeholder cho chart area.
- Props:
  - `title: string`
  - `subtitle?: string`
  - `children?: ReactNode`

## 3.8 Modal Components

### `ConfirmModal`
- File: `src/components/modals/ConfirmModal.tsx`
- Vai trò:
  - Modal xác nhận dùng chung.
- Props:
  - `open: boolean`
  - `title?: string`
  - `label?: string`
  - `cancelText?: string`
  - `confirmText?: string`
  - `onCancel?: () => void`
  - `onConfirm?: () => void`
  - `disabledConfirm?: boolean`
- Hành vi:
  - Render qua `ReactDOM.createPortal` vào `document.body`.

### `DeleteConfirmModal`
- File: `src/components/modals/DeleteConfirmModal.tsx`
- Vai trò:
  - Wrapper cho xác nhận xoá, kế thừa `ConfirmModal`.
- Props:
  - Tất cả props của `ConfirmModal` (trừ text/title cố định)
  - `itemName?: string`
- Mặc định text:
  - Title: `Delete product`
  - Label: `Are you sure you want to delete {itemName}?`
  - Buttons: `Delete` / `Cancel`

## 3.9 Shared/Legacy Utility UI Components

### `CustomButton`
- File: `src/components/customButton/CustomButton.tsx`
- Vai trò:
  - Nút chuẩn theo biến theme.
- Props:
  - `label: string`
  - `onClick?: () => void`
  - `padding?: string`
  - `className?: string`
  - `width?: string`
  - `disabled?: boolean`
  - `Icon?: ComponentType<any>`
  - `type?: "button" | "submit"`

### `CustomSearchBar`
- File: `src/components/customSearchBar/CustomSearchBar.tsx`
- Vai trò:
  - Ô search có icon và nút clear.
- Props:
  - `className?`, `classNameInput?`, `width?`
  - `value?`, `onChange?`, `resetSearch?`
  - `placeHolder?`

### `CustomSelect`
- File: `src/components/customSelect/CustomSelect.tsx`
- Vai trò:
  - Dropdown select hỗ trợ single/multiple/search.
- Option type:
  - `Option { label: ReactNode; value: string; searchText?: string }`
- Props chính:
  - `options`, `placeholder`, `value`, `onChange`
  - `multiple?`, `search?`, `disable?`
  - `className`, `classNameSelect`, `classNameOptions`, `spanMaxWidth`
  - `title?`, `label?`, `helperText?`
  - `navigateTo?`, `navigateLabel?`
- Hành vi:
  - Click ngoài để đóng.
  - Lọc option khi bật `search`.

### `CustomTextField`
- File: `src/components/customTextField/CustomTextField.tsx`
- Vai trò:
  - Input dùng chung cho form.
- Props chính:
  - `title?`, `label?`, `helperText?`
  - `value?`, `placeholder?`
  - `type?: "text" | "password" | "number" | "textarea"`
  - `disabled?`, `required?`, `error?`
  - `onChange?`, `className?`, `classNameInput?`
  - `navigateTo?`, `navigateLabel?`
- Hành vi:
  - Với `type="password"` có toggle ẩn/hiện mật khẩu.

### `Loading`
- File: `src/components/loading/Loading.tsx`
- Vai trò:
  - Overlay loading toàn màn hình.
- Props:
  - `showGoHome?: boolean`
  - `text?: string` (mặc định `Loading...`)
- Hành vi:
  - Sau 3 giây, nếu `showGoHome=true` sẽ hiện nút về trang chủ.

### `Notifycation` (NotificationContainer)
- File: `src/components/notifycation/Notifycation.tsx`
- Vai trò:
  - Container hiển thị toast notification qua portal.
- Type hỗ trợ:
  - `"success" | "error" | "loading" | "warning"`
- Cơ chế:
  - Lắng nghe event `ADD_NOTIFICATION` từ `window`.
  - Quản lý danh sách toast, tự đóng theo `duration`.

## 4) Context và hooks liên quan trực tiếp đến component

### `NotificationProvider`
- File: `src/context/notify.provider.tsx`
- Vai trò:
  - Bọc app để cấp hàm `notify(message, type, duration)` qua context.
  - Mount `NotificationContainer` toàn cục.

### `NotificationContext` + `useNotify`
- File: `src/context/notifyContext.tsx`
- Vai trò:
  - Hook tiện dụng để gọi thông báo từ bất kỳ component con nào.

### `usePageSearchParams`
- File: `src/hooks/usePageSearchParams.ts`
- Vai trò:
  - Hook quản lý page/size/search/sort bằng URL query params.
  - Có debounce search 1 giây.

### `useValidateUUID`
- File: `src/hooks/useValidateUUID.ts`
- Vai trò:
  - Validate UUID route param.
  - Nếu sai: notify lỗi + navigate redirect.

## 5) Thành phần demo và cách các component đang ghép với nhau

Trang `src/pages/404/test.page.tsx` hiện là showcase chính:

- Cụm `Auth`: `AuthCard` + `AuthHeader/AuthFooter` + `CustomTextField` + `CustomButton`
- Cụm `ERP Admin Layout`: `AppLayout` + `PageHeader` + `StatsGrid` + `BaseCard`
- Cụm bảng: `TableFilterBar` + `DataTable` + `Pagination`
- Cụm form chi tiết: `FormSectionCard` + `StockConfigTable` + `ImageUploadCard`
- Cụm biểu đồ placeholder: `ChartCard`
- Cụm modal xác nhận xoá: `DeleteConfirmModal`

## 6) Đánh giá nhanh trạng thái component hiện tại

Điểm tốt:
- Đã có hệ component khá đầy đủ cho ERP admin + auth.
- Tái sử dụng tốt qua `BaseCard`, `DataTable`, `Custom*` inputs.
- Có sẵn hệ notification context/global toast.
- Có layout responsive cơ bản (desktop/mobile sidebar).

Điểm cần lưu ý khi phát triển tiếp:
- Một số icon đang là placeholder ký tự, nên thay bằng bộ icon thống nhất.
- Có file/thư mục typo: `notifycation` (nên đổi `notification` nếu muốn chuẩn hoá).
- Có dấu hiệu lỗi encoding ký tự ở vài chuỗi tiếng Việt trong source cũ.
- `CustomTextField` khai báo type có `textarea` nhưng hiện render `input` (chưa tách `textarea`).

## 7) Danh sách file component (tham chiếu nhanh)

- `src/components/auth/AuthCard.tsx`
- `src/components/auth/AuthFooter.tsx`
- `src/components/auth/AuthHeader.tsx`
- `src/components/cards/BaseCard.tsx`
- `src/components/cards/InfoCard.tsx`
- `src/components/customButton/CustomButton.tsx`
- `src/components/customSearchBar/CustomSearchBar.tsx`
- `src/components/customSelect/CustomSelect.tsx`
- `src/components/customTextField/CustomTextField.tsx`
- `src/components/dashboard/ChartCard.tsx`
- `src/components/dashboard/StatsGrid.tsx`
- `src/components/forms/FormSectionCard.tsx`
- `src/components/forms/ImageUploadCard.tsx`
- `src/components/forms/StockConfigTable.tsx`
- `src/components/layout/AppFooter.tsx`
- `src/components/layout/AppLayout.tsx`
- `src/components/layout/ContentWrapper.tsx`
- `src/components/layout/PageHeader.tsx`
- `src/components/loading/Loading.tsx`
- `src/components/modals/ConfirmModal.tsx`
- `src/components/modals/DeleteConfirmModal.tsx`
- `src/components/navigation/NotificationBell.tsx`
- `src/components/navigation/Sidebar.tsx`
- `src/components/navigation/SidebarItem.tsx`
- `src/components/navigation/TopNavbar.tsx`
- `src/components/navigation/UserAvatarDropdown.tsx`
- `src/components/notifycation/Notifycation.tsx`

---

Nếu cần, có thể tách tiếp tài liệu này thành:
- `Component API Reference` (chỉ props + kiểu dữ liệu)
- `UI Patterns` (mẫu ghép component theo từng màn hình: list/detail/form/auth)
- `Migration Guide` (chuẩn hoá icon, encoding, naming)
