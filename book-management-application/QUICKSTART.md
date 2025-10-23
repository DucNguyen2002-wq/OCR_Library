# 🚀 Hướng Dẫn Nhanh - Quick Start Guide

## Khởi Động Ứng Dụng

Ứng dụng đã được khởi động! Mở trình duyệt và truy cập:
**http://localhost:3000**

## Các Tab Chính

### 1️⃣ 📋 Danh Sách Sách
- Xem tất cả sách đã thêm
- Tìm kiếm sách theo tên, tác giả, ISBN
- Chỉnh sửa hoặc xóa sách

### 2️⃣ ➕ Thêm Sách
- Nhập thủ công thông tin sách
- Các trường bắt buộc: Tên sách, Tác giả, ISBN
- Các trường tùy chọn: Thể loại, Năm xuất bản, Nhà xuất bản, Mô tả

### 3️⃣ 📷 Quét OCR
- **Camera trực tiếp**: Mở camera để chụp ảnh sách ngay lập tức
- **Upload file**: Tải lên hình ảnh từ thiết bị
- **Kéo & thả**: Kéo ảnh trực tiếp vào vùng upload
- Nhấn "Quét & Trích Xuất" để OCR nhận dạng
- Xem văn bản được trích xuất
- Nhấn "Sử Dụng Dữ Liệu Này" để tự động điền form

## Demo Nhanh

### Thử nghiệm thêm sách thủ công:
1. Click tab "➕ Thêm Sách"
2. Nhập thông tin:
   - **Tên sách**: "Clean Code"
   - **Tác giả**: "Robert C. Martin"
   - **ISBN**: "978-0132350884"
   - **Thể loại**: "Programming"
   - **Năm xuất bản**: "2008"
   - **Nhà xuất bản**: "Prentice Hall"
   - **Mô tả**: "A Handbook of Agile Software Craftsmanship"
3. Nhấn "➕ Thêm Sách"

### Thử nghiệm OCR:

#### Cách 1: Sử dụng Camera (Nhanh nhất!)
1. Click tab "📷 Quét OCR"
2. Nhấn "📷 Mở Camera"
3. Cho phép trình duyệt truy cập camera
4. Hướng camera về phía sách
5. Đợi hình ảnh rõ nét và nhấn "📸 Chụp Ảnh"
6. Nhấn "🔍 Quét & Trích Xuất"
7. Đợi thanh tiến trình hoàn tất
8. Xem kết quả và nhấn "✅ Sử Dụng Dữ Liệu Này"

#### Cách 2: Upload File
1. Click tab "📷 Quét OCR"
2. Nhấn "📁 Chọn Từ Thiết Bị"
3. Chọn hình ảnh bìa sách hoặc trang thông tin sách
4. Hoặc kéo thả hình ảnh vào vùng upload
5. Nhấn "🔍 Quét & Trích Xuất"
6. Đợi thanh tiến trình hoàn tất
7. Xem kết quả và nhấn "✅ Sử Dụng Dữ Liệu Này"

## Tính Năng Nổi Bật

✅ **Lưu trữ tự động**: Dữ liệu được lưu ngay lập tức vào localStorage
✅ **Tìm kiếm realtime**: Kết quả hiển thị ngay khi gõ
✅ **Responsive**: Hoạt động tốt trên mobile và desktop
✅ **OCR đa ngôn ngữ**: Hỗ trợ tiếng Việt và tiếng Anh
✅ **Camera trực tiếp**: Chụp ảnh sách ngay trên trình duyệt
✅ **Camera thông minh**: Tự động chọn camera sau trên mobile
✅ **Kéo & thả**: Upload ảnh dễ dàng bằng drag & drop

## Một Số Sách Mẫu Để Test

### Sách 1:
- Tên: "The Pragmatic Programmer"
- Tác giả: "Andrew Hunt, David Thomas"
- ISBN: "978-0135957059"
- Thể loại: "Software Engineering"
- Năm: "2019"

### Sách 2:
- Tên: "Design Patterns"
- Tác giả: "Erich Gamma"
- ISBN: "978-0201633610"
- Thể loại: "Software Design"
- Năm: "1994"

### Sách 3:
- Tên: "Đắc Nhân Tâm"
- Tác giả: "Dale Carnegie"
- ISBN: "978-8935235537"
- Thể loại: "Self-help"
- Năm: "2016"

## Tips & Tricks

🔥 **Camera trực tiếp**: 
- Nhấn "Mở Camera" để chụp ảnh sách ngay lập tức
- Camera tự động chọn camera sau trên điện thoại để chụp tốt hơn
- Giữ camera thẳng và đảm bảo ánh sáng tốt

🔥 **Shortcut cho OCR**: 
- Kéo thả hình ảnh trực tiếp vào vùng upload thay vì click chọn file

🔥 **Tìm kiếm nhanh**: 
- Gõ từ khóa ngay, không cần nhấn nút tìm kiếm

🔥 **Làm sạch tìm kiếm**: 
- Nhấn nút ✕ trong ô tìm kiếm để xóa nhanh

🔥 **Chỉnh sửa nhanh**: 
- Nhấn icon ✏️ trên card sách để sửa trực tiếp

🔥 **Chụp ảnh tốt**: 
- Đảm bảo văn bản trong khung hình rõ ràng
- Tránh chụp ở nơi tối hoặc có bóng che
- Giữ camera song song với bề mặt sách

## Xử Lý Lỗi Thường Gặp

### ❌ Không thể mở camera:
- Kiểm tra quyền truy cập camera trong trình duyệt
- Đảm bảo không có ứng dụng khác đang sử dụng camera
- Thử refresh trang và cho phép quyền lại
- Camera chỉ hoạt động trên HTTPS hoặc localhost

### ❌ OCR không hoạt động:
- Kiểm tra kết nối internet (cần tải language data lần đầu)
- Đảm bảo hình ảnh có định dạng JPG, PNG hoặc GIF
- Thử với hình ảnh có chất lượng tốt hơn

### ❌ Dữ liệu bị mất:
- Không xóa cache/cookies của trình duyệt
- Sao lưu dữ liệu quan trọng

### ❌ Ứng dụng chậm:
- OCR cần thời gian xử lý (30-60s tùy kích thước ảnh)
- Đợi thanh tiến trình hoàn tất
- Sử dụng ảnh có kích thước vừa phải (không quá lớn)

## Cấu Trúc Dữ Liệu Sách

```json
{
  "id": 1234567890,
  "title": "Tên sách",
  "author": "Tên tác giả",
  "isbn": "Mã ISBN",
  "category": "Thể loại",
  "publishYear": "Năm xuất bản",
  "publisher": "Nhà xuất bản",
  "description": "Mô tả chi tiết",
  "createdAt": "2025-10-16T..."
}
```

## Support

Nếu gặp vấn đề, hãy kiểm tra:
1. Node.js version >= 14
2. npm dependencies đã cài đặt đầy đủ
3. Port 3000 chưa bị sử dụng
4. Trình duyệt hỗ trợ localStorage

---

**Chúc bạn trải nghiệm vui vẻ! 🎉**
