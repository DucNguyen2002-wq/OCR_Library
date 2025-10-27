## 🚀 Cài đặt

### 1. Clone dự án

```bash
git clone <repository-url>
cd Project
```

### 2. Cài đặt Backend

```bash
cd back-end
npm install
```

### 3. Cài đặt Python dependencies cho OCR

```bash
# Tạo virtual environment (khuyến nghị)
python -m venv venv

# Kích hoạt virtual environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Cài đặt packages
cd moduleOCR
pip install -r requirements.txt
```

**Lưu ý:** Xem file `back-end/moduleOCR/INSTALLATION.md` để biết chi tiết cài đặt OCR.

### 4. Cài đặt Frontend Admin

```bash
cd front-end/admin
npm install
```

### 5. Cài đặt Frontend User

```bash
cd front-end/user
npm install
```

## 🚀 Production Deployment

### Backend
```bash
cd back-end
npm run start
```

### Frontend
```bash
# Build admin
cd front-end/admin
npm run build

# Build user
cd front-end/user
npm run build
```

## 🛠 Công nghệ sử dụng

### Backend
- **Node.js** + **Express.js** - REST API
- **MongoDB** + **Mongoose** - Database
- **JWT** - Authentication
- **Cloudinary** - Cloud image storage
- **EasyOCR** + **Tesseract** - OCR engine
- **Python Bridge** - Integration with Python OCR
- **Swagger** - API documentation
- **Multer** - File upload

### Frontend
- **React** + **Vite** - UI framework
- **React Router** - Routing
- **Axios** - HTTP client
- **CSS** - Styling

## 📦 Yêu cầu hệ thống

### Phần mềm cần thiết
- **Node.js** >= 16.x
- **npm** >= 8.x
- **Python** >= 3.8
- **MongoDB** (Local hoặc MongoDB Atlas)
- **Git**

### Python Dependencies (cho OCR)
```
easyocr>=1.7.0
pytesseract>=0.3.10
opencv-python>=4.8.0
Pillow>=10.0.0
numpy>=1.24.0
```

## ⚙️ Cấu hình

### 1. Backend Configuration

Tạo file `.env` trong thư mục `back-end/`:

```env
# MongoDB Connection
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority

# JWT Secret
JWT_SECRET=your-super-secret-jwt-key-here

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Server Port
PORT=3000

# Node Environment
NODE_ENV=development
```

**Cách lấy thông tin:**

#### MongoDB Atlas:
1. Đăng ký tại https://www.mongodb.com/cloud/atlas
2. Tạo cluster miễn phí
3. Tạo database user
4. Lấy connection string
5. Thay `<username>`, `<password>`, `<cluster>`, `<database>`

#### Cloudinary:
1. Đăng ký tại https://cloudinary.com/
2. Vào Dashboard
3. Copy `Cloud name`, `API Key`, `API Secret`

### 2. Frontend Admin Configuration

File `front-end/admin/vite.config.js` đã cấu hình proxy:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
```

### 3. Frontend User Configuration

File `front-end/user/vite.config.js` đã cấu hình proxy:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
```

## 🎯 Chạy ứng dụng

### Development Mode

Bạn cần mở **3 terminal** để chạy đầy đủ hệ thống:

#### Terminal 1: Backend Server

```bash
cd back-end
node server.js
```

Server sẽ chạy tại: http://localhost:3000
- API: http://localhost:3000/api
- Swagger Docs: http://localhost:3000/api-docs

#### Terminal 2: Frontend Admin

```bash
cd front-end/admin
npm run dev
```

Admin dashboard sẽ chạy tại: http://localhost:5174

#### Terminal 3: Frontend User

```bash
cd front-end/user
npm run dev
```

User app sẽ chạy tại: http://localhost:5173

## 👤 Tài khoản mặc định

### Admin Account
```
Email: admin@example.com
Password: admin123
```

### User Account
```
Email: user@example.com
Password: user123
```

**Lưu ý:** Đổi password sau khi đăng nhập lần đầu!

## 📁 Cấu trúc dự án

```
Project/
├── back-end/
│   ├── config/
│   │   └── swagger.js          # Swagger configuration
│   ├── controllers/
│   │   ├── authController.js   # Authentication logic
│   │   ├── bookController.js   # Book CRUD operations
│   │   ├── dashboardController.js
│   │   ├── notificationController.js
│   │   ├── profileController.js
│   │   └── uploadController.js
│   ├── middleware/
│   │   ├── auth.js             # JWT authentication
│   │   └── checkRole.js        # Role-based access
│   ├── models/
│   │   ├── Book.js             # Book schema
│   │   ├── User.js             # User schema
│   │   ├── Role.js             # Role schema
│   │   └── Notification.js     # Notification schema
│   ├── moduleOCR/
│   │   ├── bookCoverOCR.js     # OCR main logic
│   │   ├── easyocr_fast.py     # Python OCR script
│   │   ├── easyocrService.py
│   │   ├── tesseractService.js
│   │   ├── layoutExtractor.js
│   │   ├── ocrController.js
│   │   └── requirements.txt    # Python dependencies
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── bookRoutes.js
│   │   ├── dashboardRoutes.js
│   │   ├── notificationRoutes.js
│   │   ├── ocrRoutes.js
│   │   ├── profileRoutes.js
│   │   ├── uploadRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   └── validator.js
│   ├── .env                    # Environment variables
│   ├── server.js               # Entry point
│   ├── db.js                   # MongoDB connection
│   ├── bookHelpers.js          # Book helper functions
│   └── package.json
│
├── front-end/
│   ├── admin/
│   │   ├── src/
│   │   │   ├── api/            # API client functions
│   │   │   ├── components/     # React components
│   │   │   ├── pages/          # Page components
│   │   │   ├── styles/         # CSS files
│   │   │   ├── App.jsx
│   │   │   ├── main.jsx
│   │   │   └── router.jsx
│   │   ├── index.html
│   │   ├── package.json
│   │   └── vite.config.js
│   │
│   └── user/
│       ├── src/
│       │   ├── api/
│       │   ├── components/
│       │   ├── context/
│       │   ├── pages/
│       │   ├── styles/
│       │   ├── App.jsx
│       │   └── main.jsx
│       ├── index.html
│       ├── package.json
│       └── vite.config.js
│
└── README.md
```

## 📚 API Documentation

Sau khi chạy backend server, truy cập Swagger UI tại:

```
http://localhost:3000/api-docs
```

### Các endpoint chính:

#### Authentication
- `POST /api/auth/register` - Đăng ký user mới
- `POST /api/auth/login` - Đăng nhập
- `GET /api/auth/me` - Lấy thông tin user hiện tại

#### Books
- `GET /api/books` - Lấy danh sách sách đã duyệt
- `GET /api/books/pending` - Lấy sách chờ duyệt (Admin)
- `GET /api/books/rejected` - Lấy sách bị từ chối (Admin)
- `GET /api/books/:id` - Lấy chi tiết sách
- `POST /api/books` - Tạo sách mới
- `PUT /api/books/:id` - Cập nhật sách
- `DELETE /api/books/:id` - Xóa sách
- `PATCH /api/books/:id/approve` - Duyệt sách (Admin)
- `PATCH /api/books/:id/reject` - Từ chối sách (Admin)

#### OCR
- `POST /api/ocr/process-cover` - Scan ảnh bìa sách

#### Users (Admin)
- `GET /api/users` - Lấy danh sách users
- `POST /api/users` - Tạo user mới
- `PUT /api/users/:id` - Cập nhật user
- `DELETE /api/users/:id` - Xóa user

#### Dashboard (Admin)
- `GET /api/dashboard/stats` - Thống kê tổng quan

#### Notifications
- `GET /api/notifications` - Lấy thông báo của user
- `PATCH /api/notifications/:id/read` - Đánh dấu đã đọc

## 🔧 Troubleshooting

### Lỗi MongoDB Connection

**Lỗi:** `MongooseServerSelectionError: Could not connect to any servers`

**Giải pháp:**
1. Kiểm tra `MONGO_URI` trong `.env`
2. Kiểm tra network access trong MongoDB Atlas (thêm IP 0.0.0.0/0)
3. Kiểm tra username/password
4. Kiểm tra kết nối internet

### Lỗi Python/OCR

**Lỗi:** `Python script not found` hoặc `ModuleNotFoundError`

**Giải pháp:**
1. Cài đặt Python >= 3.8
2. Cài đặt dependencies: `pip install -r moduleOCR/requirements.txt`
3. Kiểm tra PATH của Python
4. Xem chi tiết: `back-end/moduleOCR/INSTALLATION.md`

### Lỗi Cloudinary

**Lỗi:** `Invalid cloud_name` hoặc `Cloudinary upload failed`

**Giải pháp:**
1. Kiểm tra thông tin Cloudinary trong `.env`
2. Đảm bảo đã đăng ký tài khoản Cloudinary
3. Kiểm tra API Key và Secret

### Lỗi CORS

**Lỗi:** `Access-Control-Allow-Origin` error

**Giải pháp:**
1. Backend đã cấu hình CORS cho ports 5173, 5174, 5175
2. Đảm bảo frontend chạy đúng port
3. Kiểm tra proxy trong `vite.config.js`

### Port đã được sử dụng

**Lỗi:** `EADDRINUSE: address already in use`

**Giải pháp:**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:3000 | xargs kill -9
```

### Frontend không kết nối được Backend

**Giải pháp:**
1. Kiểm tra backend đang chạy tại port 3000
2. Kiểm tra proxy config trong `vite.config.js`
3. Clear browser cache và restart dev server

### Lỗi JWT Token

**Lỗi:** `Token không hợp lệ` hoặc `401 Unauthorized`

**Giải pháp:**
1. Đăng xuất và đăng nhập lại
2. Clear localStorage
3. Kiểm tra `JWT_SECRET` trong `.env`

## 📝 Ghi chú quan trọng

### OCR Module
- OCR yêu cầu Python và các dependencies đã được cài đặt
- Lần đầu chạy OCR có thể mất thời gian để download models
- Models sẽ được cache tại `~/.EasyOCR/`

### Cloudinary
- Ảnh sẽ được upload tự động sau khi OCR xong
- Folder trên Cloudinary: `book-covers/`
- Xóa sách sẽ tự động xóa ảnh trên Cloudinary

### Database
- Sử dụng MongoDB Atlas (cloud) hoặc local MongoDB
- Indexes tự động được tạo khi chạy lần đầu
- Backup database định kỳ

### Security
- Đổi `JWT_SECRET` trong production
- Không commit file `.env` lên Git
- Đổi password mặc định của admin
- Sử dụng HTTPS trong production
