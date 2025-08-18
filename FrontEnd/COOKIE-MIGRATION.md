# Cookie Migration Guide

## Vấn đề đã được giải quyết

Trước đây, ứng dụng sử dụng **localStorage** để lưu trữ token xác thực, trong khi **middleware Next.js** lại kiểm tra token từ **cookies**. Điều này gây ra sự không nhất quán và khiến người dùng bị redirect về trang login mặc dù đã đăng nhập.

## Những thay đổi đã thực hiện

### 1. Cập nhật `useAuth` hook (`FrontEnd/hooks/use-auth.ts`)
- Thay thế `localStorage.getItem('token')` bằng `getCookie('token')`
- Thay thế `localStorage.setItem('token', token)` bằng `setCookie('token', token, 7)`
- Thay thế `localStorage.removeItem('token')` bằng `removeCookie('token')`
- Thêm helper functions để làm việc với cookies

### 2. Cập nhật `ProtectedRoute` component (`FrontEnd/components/ProtectedRoute.tsx`)
- Cải thiện logic kiểm tra quyền truy cập
- Thêm logging để debug
- Sửa logic loading state

### 3. Cập nhật `middleware.ts`
- Thêm logging để debug
- Thêm kiểm tra token hết hạn
- Cải thiện xử lý lỗi

### 4. Cập nhật các trang sử dụng token
- `FrontEnd/app/login/page.tsx` - Sử dụng cookies cho cả login thường và Facebook login
- `FrontEnd/app/dashboard/page.tsx` - Sử dụng cookies để gọi API
- `FrontEnd/app/admin/page.tsx` - Sử dụng cookies để gọi API
- `FrontEnd/app/homepage/page.tsx` - Sử dụng cookies để kiểm tra xác thực
- `FrontEnd/components/ui/navbar.tsx` - Sử dụng cookies để lấy username

### 5. Cập nhật debug page
- `FrontEnd/app/debug-auth/page.tsx` - Hiển thị cookies thay vì localStorage

## Helper Functions

### setCookie(name, value, days)
```javascript
const setCookie = (name: string, value: string, days: number = 7) => {
  const expires = new Date()
  expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000))
  document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/`
}
```

### getCookie(name)
```javascript
const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`
  const parts = value.split(`; ${name}=`)
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null
  return null
}
```

### removeCookie(name)
```javascript
const removeCookie = (name: string) => {
  document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`
}
```

## Lợi ích của việc sử dụng Cookies

1. **Đồng bộ với Middleware**: Middleware Next.js có thể đọc cookies
2. **Bảo mật tốt hơn**: Cookies có thể được đặt với các thuộc tính bảo mật
3. **Tự động gửi**: Cookies được tự động gửi với mọi request
4. **Quản lý session**: Dễ dàng quản lý thời gian hết hạn

## Kiểm tra

1. Mở Developer Tools > Console
2. Đăng nhập với tài khoản admin
3. Kiểm tra cookies trong Application > Cookies
4. Truy cập `/dashboard` hoặc `/admin`
5. Xem console logs để đảm bảo không có redirect không mong muốn

## Troubleshooting

### Nếu vẫn bị redirect về login:
1. Kiểm tra console logs
2. Kiểm tra cookies có tồn tại không
3. Kiểm tra token có hợp lệ không
4. Kiểm tra middleware logs

### Nếu cookies không được lưu:
1. Kiểm tra domain và path
2. Kiểm tra HTTPS requirement
3. Kiểm tra browser settings

## Test File

Sử dụng `FrontEnd/test-cookies.html` để test cookies functionality.
