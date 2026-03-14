# BaseReactTs - Dự án React TypeScript Base

![Version](https://img.shields.io/badge/version-0.0.0-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![React](https://img.shields.io/badge/React-18.2-blue)
![Vite](https://img.shields.io/badge/Vite-7.2-blue)

## 📋 Mô tả dự án

**BaseReactTs** là một dự án khởi đầu (starter template) được xây dựng với **React 18**, **TypeScript** và **Vite**. Dự án bao gồm các component tái sử dụng, quản lý thông báo, và các utility hữu ích để xây dựng ứng dụng web hiện đại.

## 🎯 Tính năng chính

✅ **React 18** - Với React Router v7 để quản lý định tuyến  
✅ **TypeScript** - Hỗ trợ kiểu dữ liệu tĩnh  
✅ **Vite** - Build tool nhanh chóng  
✅ **Tailwind CSS** - Framework CSS tiện ích  
✅ **Component thái sử dụng** - CustomButton, CustomTextField, CustomSelect, CustomSearchBar  
✅ **Hệ thống thông báo** (Notification System) - Toast notifications với các loại khác nhau  
✅ **Axios Config** - Cấu hình HTTP client với token authentication và refresh token  
✅ **Custom Hooks** - usePageSearchParams, useValidateUUID  
✅ **ESLint & TypeScript** - Kiểm tra mã chất lượng cao  

## 📁 Cấu trúc dự án

```
BaseReactTs/
├── public/                      # Tài nguyên tĩnh
├── src/
│   ├── assets/                  # Ảnh, icon, media
│   ├── components/              # Các component React
│   │   ├── customButton/        # Component nút tùy chỉnh
│   │   ├── customSearchBar/     # Component thanh tìm kiếm
│   │   ├── customSelect/        # Component dropdown chọn
│   │   ├── customTextField/     # Component input text
│   │   ├── loading/             # Component loading spinner
│   │   ├── modals/              # Các dialog/modal
│   │   │   └── ConfirmModal.tsx # Modal xác nhận
│   │   ├── notifycation/        # Hệ thống thông báo
│   │   └── layout/              # Layout component
│   ├── context/                 # React Context
│   │   ├── notify.provider.tsx  # Provider cho thông báo
│   │   └── notifyContext.tsx    # Context thông báo
│   ├── hooks/                   # Custom hooks
│   │   ├── usePageSearchParams.ts
│   │   └── useValidateUUID.ts
│   ├── pages/                   # Trang/Page component
│   │   └── 404/
│   │       ├── NotFound.Page.tsx
│   │       └── test.page.tsx
│   ├── types/                   # TypeScript types
│   ├── utils/                   # Utility functions
│   │   └── formatDate.ts
│   ├── const/                   # Hằng số
│   ├── apiConfig/               # Cấu hình API
│   │   └── axiosConfig.ts
│   ├── App.tsx                  # Component App chính
│   ├── main.tsx                 # Entry point
│   ├── App.css                  # Style cho App
│   └── index.css                # Style global
├── eslint.config.js             # Cấu hình ESLint
├── tailwind.config.cjs          # Cấu hình Tailwind
├── postcss.config.cjs           # Cấu hình PostCSS
├── tsconfig.json                # Cấu hình TypeScript chung
├── tsconfig.app.json            # Cấu hình TypeScript ứng dụng
├── tsconfig.node.json           # Cấu hình TypeScript Node
├── vite.config.ts               # Cấu hình Vite
├── package.json                 # Dependencies
└── index.html                   # HTML entry point
```

## 🚀 Cài đặt và chạy

### Yêu cầu
- **Node.js** 16.0 hoặc cao hơn
- **npm** hoặc **yarn**

### Cài đặt dependencies

```bash
npm install
# hoặc
yarn install
```

### Chạy development server

```bash
npm run dev
```

Server sẽ chạy tại `http://localhost:5173` (Vite default port)

### Build production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

### Kiểm tra linting

```bash
npm run lint
```

## 📦 Dependencies chính

### Dependencies

| Package | Version | Mục đích |
|---------|---------|---------|
| `react` | ^18.2.0 | Framework React |
| `react-dom` | ^18.2.0 | React DOM rendering |
| `react-router-dom` | ^7.10.0 | Định tuyến ứng dụng |
| `axios` | ^1.13.2 | HTTP client |

### Dev Dependencies

| Package | Version | Mục đích |
|---------|---------|---------|
| `typescript` | ~5.9.3 | Hỗ trợ TypeScript |
| `vite` | ^7.2.4 | Build tool |
| `tailwindcss` | ^3.4.19 | Framework CSS |
| `eslint` | ^9.39.1 | Code linter |
| `@vitejs/plugin-react` | ^5.1.1 | Plugin React cho Vite |

## 🎨 Component chính

### CustomButton
Nút bấm tùy chỉnh với hỗ trợ icon, disabled state, và các style khác nhau.

```tsx
<CustomButton 
  label="Click me"
  onClick={() => console.log('clicked')}
  Icon={IconComponent}
  disabled={false}
/>
```

### CustomTextField
Input text với hỗ trợ:
- Placeholder, label, helper text
- Password toggle
- Error state
- Navigation link

```tsx
<CustomTextField
  title="Email"
  label="Nhập email của bạn"
  type="text"
  placeholder="user@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  error={emailError}
/>
```

### CustomSelect
Dropdown/select component với hỗ trợ:
- Single/Multiple selection
- Search functionality
- Customizable styles
- Disabled state

```tsx
<CustomSelect
  title="Chọn tùy chọn"
  options={[
    { label: "Option 1", value: "1" },
    { label: "Option 2", value: "2" }
  ]}
  value={['1']}
  onChange={(values) => console.log(values)}
  multiple={true}
  search={true}
/>
```

### CustomSearchBar
Thanh tìm kiếm với icon và nút xóa

```tsx
<CustomSearchBar
  value={searchValue}
  onChange={(e) => setSearchValue(e.target.value)}
  resetSearch={() => setSearchValue("")}
  placeHolder="Tìm kiếm..."
/>
```

### ConfirmModal
Modal xác nhận hành động

```tsx
<ConfirmModal
  open={isOpen}
  title="Xác nhận"
  label="Bạn có chắc muốn xóa?"
  onConfirm={() => handleDelete()}
  onCancel={() => setIsOpen(false)}
/>
```

### Loading
Component loading spinner

```tsx
<Loading 
  text="Đang tải..."
  showGoHome={true}
/>
```

## 🔔 Hệ thống thông báo (Notification System)

Hệ thống thông báo được xây dựng với **Context API** và **Custom Events**.

### Cách sử dụng

Sử dụng hook `useNotify()` trong component:

```tsx
import { useNotify } from "@/context/notifyContext";

export const MyComponent = () => {
  const { notify } = useNotify();

  const handleSuccess = () => {
    notify("Thành công!", "success", 3000);
  };

  const handleError = () => {
    notify("Lỗi xảy ra!", "error", 3000);
  };

  return (
    <>
      <button onClick={handleSuccess}>Success</button>
      <button onClick={handleError}>Error</button>
    </>
  );
};
```

### Các loại thông báo

- **"success"** - Thông báo thành công (xanh lá)
- **"error"** - Thông báo lỗi (đỏ)
- **"warning"** - Cảnh báo (vàng)
- **"loading"** - Đang tải (không tự động đóng)

## 🔐 API Configuration (Axios)

File [src/apiConfig/axiosConfig.ts](src/apiConfig/axiosConfig.ts) cung cấp:

✅ Base URL: `http://localhost:8080/api`  
✅ Timeout: 5000ms  
✅ Interceptor request - Tự động thêm token vào header  
✅ Interceptor response - Xử lý refresh token  
✅ Queue xử lý request khi token hết hạn  

### Cách sử dụng

```tsx
import api from "@/apiConfig/axiosConfig";

// GET request
const response = await api.get('/users');

// POST request với data
const response = await api.post('/users', { 
  name: 'John',
  email: 'john@example.com'
});

// Lưu token
localStorage.setItem('access_token', token);
```

## 🪝 Custom Hooks

### usePageSearchParams
Quản lý pagination, search, sort từ URL query parameters

```tsx
const { 
  page, 
  pageSize, 
  search, 
  searchInput,
  sort,
  handlePageChange,
  handleSearchChange,
  handleSortChange
} = usePageSearchParams(1, 10);
```

### useValidateUUID
Kiểm tra UUID hợp lệ, redirect nếu không hợp lệ

```tsx
useValidateUUID(id, "/users", "ID không hợp lệ!");
```

## 🛠️ Utility Functions

### formatDateToUTC7
Chuyển đổi datetime ISO sang định dạng UTC+7

```tsx
import { formatDateToUTC7 } from "@/utils/formatDate";

const formatted = formatDateToUTC7("2025-12-05T07:24:40.000Z");
// Kết quả: "December 5, 2025 at 14:24 (UTC+07:00)"
```

## 📡 Cấu hình Proxy

Vite được cấu hình proxy để forward API requests đến backend:

```typescript
// vite.config.ts
server: {
  proxy: {
    "/api": {
      target: "http://localhost:8080",
      changeOrigin: true,
      secure: false,
    },
  },
}
```

## 📝 Routing

Ứng dụng sử dụng React Router v7:

```tsx
<Routes>
  <Route path="/" element={<HomePage />} />
  <Route path="/test" element={<TestPage />} />
  <Route path="*" element={<NotFoundPage />} /> {/* 404 page */}
</Routes>
```

## 🎨 Styling

Dự án sử dụng **Tailwind CSS** v3 với các CSS variables cho theme:

```css
:root {
  --primary-color: 24, 144, 255;           /* Màu chính */
  --primary-text-color: 31, 31, 31;        /* Màu text */
  --primary-border-color: 229, 230, 235;   /* Màu border */
  --primary-rounded: 4px;                  /* Border radius */
}
```

Sử dụng CSS variables trong Tailwind:

```tsx
<button className="bg-[rgba(var(--primary-color),0.8)]">
  Styled Button
</button>
```

## ⚙️ Cấu hình ESLint

Dự án sử dụng ESLint với:
- JavaScript ESLint rules
- TypeScript ESLint support
- React Hooks linter
- React Refresh linter

Chạy linting:

```bash
npm run lint
```

## 🌐 Environment

### Development
- Base URL: `http://localhost:8080/api`
- Server proxy: `/api` → `http://localhost:8080`

### Production
Cần cập nhật base URL trong [src/apiConfig/axiosConfig.ts](src/apiConfig/axiosConfig.ts)

## 📚 Tài liệu tham khảo

- [React Documentation](https://react.dev)
- [React Router Documentation](https://reactrouter.com)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Vite Documentation](https://vite.dev)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Axios Documentation](https://axios-http.com)

## 🤝 Đóng góp

Nếu bạn muốn đóng góp cho dự án, vui lòng:

1. Fork repository
2. Tạo branch feature (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Mở Pull Request

## 📄 Giấy phép

Dự án này được cấp phép dưới MIT License - xem file [LICENSE](LICENSE) để biết chi tiết.

## 📧 Liên hệ

Nếu có câu hỏi hoặc cần hỗ trợ, vui lòng liên hệ:

- 📧 Email: your.email@example.com
- 💬 Discord: [Discord Link]
- 🐛 Issues: [GitHub Issues](issues)

---

**Chúc bạn phát triển ứng dụng thành công! 🚀**

Cập nhật lần cuối: December 12, 2025
