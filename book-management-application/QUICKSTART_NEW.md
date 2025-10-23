# 🚀 Hướng Dẫn Nhanh - Ứng Dụng Quản Lý Sách

## ⚡ Chạy Ứng Dụng Trong 30 Giây

1. **Mở Terminal/CMD** tại thư mục `book-management-app`

2. **Chạy lệnh:**
   ```bash
   npm start
   ```

3. **Mở trình duyệt** tại: `http://localhost:3000`

Xong! Ứng dụng đã sẵn sàng sử dụng! 🎉

## 📦 Bắt Đầu Nhanh Với Dữ Liệu Mẫu

### Bước 1: Tải 100 Cuốn Sách Mẫu
1. Nhấn nút **"📦 Tải Sách Mẫu"** (góc phải thanh điều hướng)
2. Xác nhận "OK"
3. Có ngay 100 cuốn sách để thử nghiệm!

### Bước 2: Khám Phá Bộ Lọc
1. Chọn **Danh mục**: "Lập trình" để xem sách lập trình
2. Chọn **Nhà XB**: "O'Reilly" để lọc theo nhà xuất bản
3. Chọn **Sắp xếp**: "Tên A → Z" để sắp xếp
4. Thử kết hợp nhiều bộ lọc cùng lúc!

## 📱 3 Tính Năng Chính

### 1️⃣ Quản Lý Sách
```
➕ Thêm Sách → Điền form → Lưu
✏️ Sửa Sách → Click ✏️ trên card sách
🗑️ Xóa Sách → Click 🗑️ trên card sách
```

### 2️⃣ Tìm Kiếm và Lọc
```
🔍 Tìm kiếm: Nhập từ khóa (tên/tác giả/ISBN)
📊 Lọc theo: Danh mục, Nhà XB, Năm
🔄 Sắp xếp: 8 kiểu sắp xếp khác nhau
🔄 Reset: Xóa tất cả bộ lọc
```

### 3️⃣ Quét OCR
```
📷 Camera → Chụp → Quét → Sử dụng
hoặc
📁 Upload → Chọn ảnh → Quét → Sử dụng
```

## 🎯 Workflow Khuyến Nghị

### Lần Đầu Sử Dụng:
1. ✅ Tải 100 sách mẫu để có data demo
2. ✅ Thử nghiệm tìm kiếm và lọc
3. ✅ Thử quét sách bằng camera
4. ✅ Thêm sách của riêng bạn

### Sử Dụng Hàng Ngày:
1. 📋 Xem danh sách và lọc theo nhu cầu
2. 📷 Quét sách mới bằng OCR
3. ✏️ Chỉnh sửa thông tin nếu cần
4. 🔍 Tìm kiếm sách khi cần

## 💡 Mẹo Nhanh

### Tìm Kiếm Hiệu Quả:
- Gõ tên sách: `"clean code"`
- Gõ tên tác giả: `"martin"`
- Gõ ISBN: `"978"`
- Kết quả real-time!

### Lọc Thông Minh:
- **Tìm sách mới**: Chọn "Mới nhất" trong Sắp xếp
- **Duyệt theo chủ đề**: Chọn Danh mục
- **Xem sách của NXB**: Chọn Nhà xuất bản
- **Sách năm nay**: Lọc theo năm 2024

### Camera OCR:
- 💡 Chụp ở nơi sáng
- 📐 Giữ camera thẳng
- 🎯 Zoom đúng cỡ chữ rõ
- ⏱️ Giữ tay vững

## 🎨 Các Tab Chính

| Tab | Biểu Tượng | Chức Năng |
|-----|-----------|-----------|
| Danh Sách | 📋 | Xem, tìm kiếm, lọc sách |
| Thêm Sách | ➕ | Form thêm/sửa sách |
| Quét OCR | 📷 | Camera & upload OCR |
| Tải Mẫu | 📦 | Tải 100 sách demo |

## 🔄 Ví Dụ Use Case

### Case 1: Tìm Sách Lập Trình Python
```
1. Chọn Danh mục: "Lập trình"
2. Gõ tìm kiếm: "python"
3. Kết quả: Tất cả sách Python
```

### Case 2: Xem Văn Học Việt Của NXB Trẻ
```
1. Chọn Danh mục: "Văn học Việt Nam"
2. Chọn Nhà XB: "NXB Trẻ"
3. Chọn Sắp xếp: "Tên A → Z"
```

### Case 3: Quét Sách Mới Bằng Camera
```
1. Tab "📷 Quét OCR"
2. "📷 Mở Camera"
3. Hướng về sách
4. "📸 Chụp Ảnh"
5. "🔍 Quét & Trích Xuất"
6. "✅ Sử Dụng Dữ Liệu"
7. Kiểm tra và lưu
```

## ⚠️ Troubleshooting Nhanh

### Camera Không Hoạt Động?
```
✅ Check: Cho phép quyền camera
✅ Check: Dùng HTTPS hoặc localhost
✅ Check: Trình duyệt hỗ trợ camera
```

### Không Thấy Sách?
```
✅ Check: Đã tải sách mẫu chưa?
✅ Check: Bộ lọc có đang hoạt động?
✅ Check: localStorage có bị xóa?
```

### OCR Không Chính Xác?
```
✅ Chụp ảnh rõ hơn
✅ Ánh sáng tốt hơn
✅ Camera giữ thẳng
✅ Chỉnh sửa sau khi quét
```

## 📊 Thống Kê Dữ Liệu Mẫu

| Danh Mục | Số Sách |
|----------|---------|
| Lập trình | 25 |
| Văn học VN | 20 |
| Kinh doanh | 15 |
| Khoa học | 15 |
| Tiểu thuyết | 15 |
| Lịch sử | 10 |
| **TỔNG** | **100** |

## 🎓 Tài Liệu Đầy Đủ

- 📖 [README.md](README.md) - Tài liệu chi tiết
- 📷 [CAMERA_GUIDE.md](CAMERA_GUIDE.md) - Hướng dẫn camera
- 🔍 [FILTER_GUIDE.md](FILTER_GUIDE.md) - Hướng dẫn bộ lọc

---

**Chúc Bạn Sử Dụng Hiệu Quả! 🚀📚**
