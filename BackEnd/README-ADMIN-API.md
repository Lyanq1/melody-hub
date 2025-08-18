# Admin API Documentation

## Tổng quan
Hệ thống Admin API cung cấp các endpoint để quản lý người dùng và hệ thống, chỉ dành cho tài khoản có role `Admin`.

## Authentication
Tất cả các API admin đều yêu cầu JWT token trong header:
```
Authorization: Bearer <your_jwt_token>
```

## Middleware Bảo vệ

### 1. `verifyToken`
- Kiểm tra JWT token hợp lệ
- Trả về 401 nếu không có token hoặc token không hợp lệ

### 2. `canManageSystem`
- Kiểm tra quyền Admin
- Chỉ cho phép role `Admin` truy cập
- Trả về 403 nếu không có quyền

### 3. `canAccessDashboard`
- Kiểm tra quyền truy cập dashboard
- Cho phép role `Admin` và `Artist`
- Trả về 403 nếu không có quyền

## API Endpoints

### Auth Routes

#### 1. Kiểm tra quyền truy cập Dashboard
```
GET /api/auth/dashboard/access
```
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Access granted",
  "canAccess": true,
  "user": {
    "accountID": "...",
    "username": "...",
    "email": "...",
    "displayName": "...",
    "avatarURL": "...",
    "role": "Admin"
  }
}
```

#### 2. Lấy thông tin user hiện tại
```
GET /api/auth/me
```
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "user": {
    "accountID": "...",
    "username": "...",
    "email": "...",
    "displayName": "...",
    "avatarURL": "...",
    "role": "Admin",
    "phone": "...",
    "address": "..."
  }
}
```

### Admin Routes

#### 1. Lấy danh sách tất cả người dùng
```
GET /api/admin/users
```
**Headers:** `Authorization: Bearer <token>`

**Response:** Array of users (không bao gồm password)

#### 2. Tìm kiếm người dùng
```
GET /api/admin/users/search?query=<search_term>&role=<role>&page=<page>&limit=<limit>
```
**Query Parameters:**
- `query`: Từ khóa tìm kiếm (tên, username, email)
- `role`: Lọc theo role (Customer, Artist, Admin, all)
- `page`: Trang hiện tại (mặc định: 1)
- `limit`: Số lượng user mỗi trang (mặc định: 10)

**Response:**
```json
{
  "users": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalUsers": 50,
    "usersPerPage": 10
  }
}
```

#### 3. Lấy thông tin user theo ID
```
GET /api/admin/users/:userId
```
**Headers:** `Authorization: Bearer <token>`

#### 4. Cập nhật thông tin user
```
PUT /api/admin/users/:userId
```
**Headers:** `Authorization: Bearer <token>`
**Body:** User data (không bao gồm password)

#### 5. Xóa user
```
DELETE /api/admin/users/:userId
```
**Headers:** `Authorization: Bearer <token>`

**Lưu ý:** Không thể xóa chính mình

#### 6. Thay đổi role của user
```
PATCH /api/admin/users/:userId/role
```
**Headers:** `Authorization: Bearer <token>`
**Body:** `{ "newRole": "Admin" }`

**Lưu ý:** Không thể thay đổi role của chính mình

#### 7. Lấy thống kê hệ thống
```
GET /api/admin/stats
```
**Headers:** `Authorization: Bearer <token>`

**Response:**
```json
{
  "totalUsers": 100,
  "adminUsers": 5,
  "artistUsers": 15,
  "customerUsers": 80,
  "newUsers24h": 3,
  "newUsersWeek": 12,
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "message": "Authentication token is required"
}
```

### 403 Forbidden
```json
{
  "message": "Access denied. Admin privileges required."
}
```

### 404 Not Found
```json
{
  "message": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "message": "Error message",
  "error": "Detailed error message"
}
```

## Testing

### Chạy test script
```bash
cd BackEnd
node test-admin-api.js
```

### Test với Postman/Insomnia
1. Đăng ký tài khoản admin: `POST /api/auth/register`
2. Đăng nhập: `POST /api/auth/login`
3. Sử dụng token nhận được để test các API admin

## Security Features

1. **JWT Token Verification**: Tất cả requests đều phải có token hợp lệ
2. **Role-based Access Control**: Chỉ Admin mới có thể truy cập các API admin
3. **Self-protection**: Admin không thể xóa hoặc thay đổi role của chính mình
4. **Password Protection**: API admin không thể truy cập hoặc thay đổi password
5. **Input Validation**: Tất cả input đều được validate

## Usage Examples

### Frontend Integration

```javascript
// Kiểm tra quyền truy cập dashboard
const checkDashboardAccess = async () => {
  try {
    const response = await fetch('/api/auth/dashboard/access', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      if (data.canAccess) {
        // Redirect to dashboard
        window.location.href = '/dashboard';
      }
    }
  } catch (error) {
    console.error('Access denied:', error);
  }
};

// Lấy danh sách users
const getUsers = async () => {
  try {
    const response = await fetch('/api/admin/users', {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.ok) {
      const users = await response.json();
      // Handle users data
    }
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};
```

## Notes

- Tất cả timestamps đều sử dụng UTC
- User IDs sử dụng MongoDB ObjectId
- Password không bao giờ được trả về trong responses
- Rate limiting có thể được áp dụng trong tương lai

