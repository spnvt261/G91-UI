# G91-UI

Frontend cho hệ thống ERP ngành thép, xây dựng bằng `React + TypeScript + Vite + TailwindCSS`.

README này mô tả đúng hiện trạng code ở thời điểm hiện tại: UI nào đã có, UI nào mới dừng ở mức component/service, và cách chạy dự án.

## 1. Mục tiêu dự án

- Xây dựng nền tảng UI cho hệ thống quản lý kinh doanh thép (sản phẩm, báo giá, hợp đồng, dự án, thanh toán, báo cáo).
- Chuẩn hóa lớp `models`, `services`, `API constants` để sẵn sàng nối backend.
- Dựng bộ component tái sử dụng cho các trang ERP.

## 2. Công nghệ đang dùng

- `React 18`
- `TypeScript`
- `Vite`
- `TailwindCSS`
- `Redux Toolkit`
- `React Router`
- `Axios`

## 3. Chạy dự án

### 3.1 Yêu cầu

- `Node.js` >= 18
- `npm`

### 3.2 Cài đặt và chạy

```bash
npm install
npm run dev
```

Mặc định Vite chạy tại `http://localhost:5173`.

### 3.3 Các lệnh khác

```bash
npm run build
npm run preview
npm run lint
```

## 4. Cấu hình môi trường

File `.env.development` / `.env.example`:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

`src/apiConfig/axiosConfig.ts` đang:

- Dùng `VITE_API_BASE_URL` làm base URL.
- Tự gắn `Authorization: Bearer <token>` nếu có `access_token` trong localStorage.
- Có cơ chế refresh token khi gặp `401`.

## 5. Routing hiện tại (UI đang chạy thực tế)

Trong `src/App.tsx` hiện chỉ có 3 route:

- `/` -> `TestPage` (trang showcase UI/component)
- `/test` -> `TestPage`
- `*` -> `NotFoundPage`

Lưu ý: chưa có route nghiệp vụ riêng cho từng module (products, quotations, contracts...) dù menu/sidebar đã có placeholder path.

## 6. UI hiện tại đang có gì

### 6.1 Trang Showcase (`/` hoặc `/test`)

Trang `src/pages/404/test.page.tsx` đang demo trực tiếp:

- Cụm Auth UI:
  - Card Đăng ký
  - Card Đăng nhập
  - Card Quên mật khẩu
  - Card Đặt lại mật khẩu
- Cụm layout ERP:
  - `AppLayout` (Sidebar + TopNavbar + Footer)
  - `PageHeader`
- Cụm dashboard:
  - `StatsGrid`
  - `ChartCard`
- Cụm danh sách dữ liệu:
  - `TableFilterBar` (search + filter)
  - `DataTable`
  - `Pagination`
- Cụm form:
  - `FormSectionCard`
  - `StockConfigTable`
  - `ImageUploadCard`
- Modal:
  - `DeleteConfirmModal`

### 6.2 Trang 404

`src/pages/404/NotFound.Page.tsx` đã có UI 404 đầy đủ:

- Nút về trang chủ
- Nút thử lại
- Nút báo lỗi (handler chưa triển khai)

### 6.3 Hệ component dùng lại

Đã có bộ component tương đối đầy đủ cho admin UI:

- `auth`: `AuthCard`, `AuthHeader`, `AuthFooter`
- `layout`: `AppLayout`, `PageHeader`, `ContentWrapper`, `AppFooter`
- `navigation`: `Sidebar`, `TopNavbar`, `NotificationBell`, `UserAvatarDropdown`
- `cards`: `BaseCard`, `InfoCard`
- `table`: `DataTable`, `TableFilterBar`, `Pagination`
- `forms`: `FormSectionCard`, `ImageUploadCard`, `StockConfigTable`
- `modals`: `ConfirmModal`, `DeleteConfirmModal`
- `shared`: `CustomButton`, `CustomTextField`, `CustomSelect`, `CustomSearchBar`, `Loading`
- `notification`: `notify.provider.tsx` + `Notifycation.tsx`

Chi tiết hơn xem thêm file `COMPONENTS_CATALOG.md`.

## 7. Trạng thái nghiệp vụ ERP trong code hiện tại

### 7.1 Đã có lớp dữ liệu và gọi API

Các module bên dưới đã có:

- `models/*`
- `services/*`
- endpoint trong `src/api/URL_const.ts`

Module hiện có:

- `auth`
- `product`
- `quotation`
- `contract`
- `customer`
- `project`
- `payment`
- `report`

### 7.2 Chưa hoàn tất ở tầng UI trang nghiệp vụ

- Chưa có các page nghiệp vụ tách riêng theo module trong `src/pages/**`.
- Chưa gắn routing thật theo luồng ERP.
- Hiện tại mới là nền tảng component + service, và một trang demo tổng hợp.

## 8. Redux hiện tại

Store đang có `authSlice` với state:

- `accessToken`
- `user`
- `isAuthenticated`

Action:

- `loginSuccess`
- `logout`
- `setUser`

## 9. Cấu trúc thư mục chính

```text
src/
  api/                # API endpoint constants
  apiConfig/          # axios config + interceptors
  components/         # UI components tái sử dụng
  context/            # notification context/provider
  hooks/              # hooks dùng chung
  models/             # model theo từng module nghiệp vụ
  pages/              # hiện chủ yếu 404 + test showcase
  services/           # service gọi API theo từng module
  store/              # redux store
```

## 10. Ghi chú hiện trạng và đề xuất bước tiếp theo

- Một số text tiếng Việt trong vài file đang lỗi encoding.
- Tên thư mục `notifycation` đang sai chính tả (`notification` chuẩn hơn).
- Sidebar đang có menu đầy đủ nhưng mới ở mức UI/placeholder path.

Bước tiếp theo khuyến nghị:

1. Tạo bộ page thật cho từng module (list/detail/create/update).
2. Nối page với service tương ứng.
3. Chuẩn hóa encoding UTF-8 và đặt lại tên thư mục `notifycation`.
