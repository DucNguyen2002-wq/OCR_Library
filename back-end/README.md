# Library Management System - Back-end API

Back-end API cho hệ thống quản lý thư viện với tính năng OCR. API phục vụ dữ liệu cho front-end React và xử lý OCR, upload ảnh.

## 🚀 Tính năng chính

### 1. Xác thực và Phân quyền
- ✅ Đăng ký/Đăng nhập với bcrypt hash password
- ✅ JWT-based authentication
- ✅ Role-based access control (Admin/User)
- ✅ Middleware bảo vệ routes

### 2. Quản lý dữ liệu cốt lõi
- ✅ 3 thực thể có quan hệ: User - Book - Role
- ✅ CRUD đầy đủ cho Books và Users
- ✅ **Search, Sort, Pagination** (server-side) cho tất cả resources
- ✅ Upload và hiển thị file ảnh (cover books)
- ✅ Workflow phê duyệt sách (approval status)

### 3. Dashboard và Thống kê
- ✅ Tổng quan hệ thống (tổng sách, users)
- ✅ Thống kê theo trạng thái sách
- ✅ Biểu đồ sách theo tháng/năm
- ✅ Top contributors
- ✅ Recent activities

### 4. Bảo mật
- ✅ Input validation với express-validator
- ✅ Sanitization chống XSS attacks
- ✅ CORS configuration
- ✅ Request body size limits
- ✅ Password strength requirements

### 5. API Documentation
- ✅ Swagger/OpenAPI 3.0
- ✅ Interactive API testing
- ✅ Auto-generated documentation

## 📁 Cấu trúc thư mục

```
back-end/
├── server.js                # Entry point của Express server
├── db.js                    # MongoDB connection
├── package.json             # Dependencies
├── .env.example             # Environment variables template
│
├── config/
│   └── swagger.js           # Swagger/OpenAPI configuration
│
├── controllers/
│   ├── authController.js    # Authentication logic
│   ├── bookController.js    # Books CRUD với search/sort/pagination
│   ├── profileController.js # User profile management
│   └── dashboardController.js # Dashboard statistics
│
├── routes/
│   ├── authRoutes.js        # /api/auth routes
│   ├── bookRoutes.js        # /api/books routes
│   ├── profileRoutes.js     # /api/profile routes
│   ├── userRoutes.js        # /api/admin/users routes
│   ├── dashboardRoutes.js   # /api/dashboard routes
│   └── ocrRoutes.js         # /api/ocr routes
│
├── middleware/
│   ├── auth.js              # JWT authentication
│   └── checkRole.js         # Role-based authorization
│
├── models/
│   ├── User.js              # User schema
│   ├── Book.js              # Book schema
│   └── Role.js              # Role schema
│
├── utils/
│   └── validator.js         # Input validation rules
│
├── moduleOCR/               # OCR processing
│   ├── tesseractService.js
│   ├── easyocrService.py
│   └── ...
│
└── public/
    └── uploads/             # Uploaded images storage
```

## 🛠️ Yêu cầu hệ thống

- **Node.js** 18+ 
- **MongoDB** 4.4+ (Atlas Cloud hoặc Local)
- **Python** 3.8+ (cho OCR module - optional)

## ⚙️ Cài đặt và Cấu hình

### 1. Clone và cài đặt dependencies

```powershell
cd back-end
npm install
```

### 2. Cấu hình môi trường

Tạo file `.env` từ `.env.example`:

```powershell
copy .env.example .env
```

Cập nhật các giá trị trong `.env`:

```env
# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/WebOCR

# JWT Secret (generate bằng: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
JWT_SECRET=your-very-long-and-secure-secret-key

# Server
PORT=3000
NODE_ENV=development
```

### 3. Khởi tạo dữ liệu ban đầu

Đảm bảo đã tạo sẵn 2 roles trong MongoDB:

```javascript
// Chạy trong MongoDB shell hoặc Compass
db.roles.insertMany([
  {
    _id: "role_admin_id",
    name: "admin",
    permissions: {
      can_manage_books: true,
      can_delete: true,
      can_approve: true
    }
  },
  {
    _id: "role_user_id", 
    name: "user",
    permissions: {
      can_manage_books: false,
      can_delete: false,
      can_approve: false
    }
  }
]);
```

## 🚀 Chạy ứng dụng

### Development mode (với nodemon)
```powershell
npm run dev
```

### Production mode
```powershell
npm start
```

Server sẽ chạy tại: **http://localhost:3000**

## 📚 API Documentation

Sau khi server chạy, truy cập Swagger UI tại:

**http://localhost:3000/api-docs**

### Các endpoint chính:

#### Authentication
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Thông tin user hiện tại

#### Books (với search/sort/pagination)
- `GET /api/books?page=1&limit=10&search=keyword&sortBy=title&order=asc` - Danh sách sách
- `GET /api/books/:id` - Chi tiết sách
- `POST /api/books` - Tạo sách mới
- `PUT /api/books/:id` - Cập nhật sách
- `DELETE /api/books/:id` - Xóa sách
- `PUT /api/books/:id/approve` - Phê duyệt sách (Admin)
- `PUT /api/books/:id/reject` - Từ chối sách (Admin)

#### Users (Admin only - với search/sort/pagination)
- `GET /api/admin/users?page=1&limit=10&search=keyword&role=admin` - Danh sách users
- `PUT /api/admin/users/:id/role` - Đổi role
- `DELETE /api/admin/users/:id` - Xóa user

#### Dashboard (Admin only)
- `GET /api/dashboard/stats` - Thống kê tổng quan
- `GET /api/dashboard/books-stats?period=month` - Thống kê sách

#### Profile
- `GET /api/profile/stats` - Thống kê cá nhân
- `PUT /api/profile/update` - Cập nhật thông tin
- `PUT /api/profile/change-password` - Đổi mật khẩu

#### File Upload
- `POST /upload` - Upload ảnh (requires authentication)

## 🔐 Authentication

API sử dụng JWT Bearer Token. Sau khi đăng nhập, thêm token vào header:

```
Authorization: Bearer <your-jwt-token>
```

## 🧪 Testing API

### Sử dụng Swagger UI
Truy cập http://localhost:3000/api-docs và test trực tiếp

### Sử dụng cURL

```powershell
# Đăng ký
curl -X POST http://localhost:3000/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{\"name\":\"Test User\",\"email\":\"test@example.com\",\"password\":\"Test@123\"}'

# Đăng nhập
curl -X POST http://localhost:3000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"username\":\"test@example.com\",\"password\":\"Test@123\"}'

# Get books với pagination
curl -X GET "http://localhost:3000/api/books?page=1&limit=10&search=clean&sortBy=title&order=asc" `
  -H "Authorization: Bearer <token>"
```

## 📊 Database Schema

### User
```javascript
{
  _id: String,
  email: String (unique),
  password_hash: String,
  name: String,
  role_id: String (ref: Role),
  phone: String,
  address: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Book
```javascript
{
  _id: String,
  title: String,
  isbn: String,
  publisher: String,
  year_published: Number,
  description: String,
  authors: [String],
  cover_front_url: String,
  cover_inner_url: String,
  cover_back_url: String,
  created_by: String (ref: User),
  status: 'draft' | 'published',
  approval_status: 'pending' | 'approved' | 'rejected',
  approved_by: String (ref: User),
  approved_at: Date,
  rejected_reason: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Role
```javascript
{
  _id: String,
  name: 'admin' | 'user',
  permissions: {
    can_manage_books: Boolean,
    can_delete: Boolean,
    can_approve: Boolean
  },
  createdAt: Date,
  updatedAt: Date
}
```

## 🔒 Bảo mật

- ✅ Password hashing với bcrypt (10 rounds)
- ✅ JWT token expiration (24h)
- ✅ Input validation và sanitization
- ✅ XSS protection với xss-clean
- ✅ CORS configuration
- ✅ Request size limits (10MB)
- ✅ MongoDB injection prevention với Mongoose

## 📝 Logs

Server logs được in ra console với format:
- 🚀 Server start
- 📚 API documentation URL
- ❌ Errors với stack trace

## 🐛 Troubleshooting

### Lỗi kết nối MongoDB
```
Error: connect ECONNREFUSED
```
**Giải pháp**: Kiểm tra MONGODB_URI trong .env

### Lỗi JWT token
```
Token không hợp lệ
```
**Giải pháp**: Đảm bảo JWT_SECRET giống nhau và token chưa hết hạn

### Lỗi validation
```
Dữ liệu không hợp lệ
```
**Giải pháp**: Kiểm tra format dữ liệu theo API documentation

## 📞 Support

Nếu gặp vấn đề, vui lòng tạo issue hoặc liên hệ team phát triển.

## 📄 License

MIT License

