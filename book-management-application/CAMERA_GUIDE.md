# 📷 Hướng Dẫn Sử Dụng Camera OCR

## Tổng Quan

Tính năng camera OCR cho phép bạn chụp ảnh sách trực tiếp từ trình duyệt mà không cần upload file. Điều này giúp quá trình quét sách nhanh chóng và tiện lợi hơn.

## 🚀 Cách Sử Dụng

### Bước 1: Mở Camera
1. Vào tab **"📷 Quét OCR"**
2. Nhấn nút **"📷 Mở Camera"**
3. Trình duyệt sẽ hiển thị thông báo yêu cầu quyền truy cập camera
4. Nhấn **"Cho phép"** hoặc **"Allow"**

### Bước 2: Chụp Ảnh
1. Camera sẽ mở và hiển thị hình ảnh trực tiếp
2. Hướng camera về phía sách cần quét
3. Điều chỉnh góc độ và khoảng cách để văn bản rõ nét
4. Nhấn nút **"📸 Chụp Ảnh"** khi đã sẵn sàng

### Bước 3: Quét và Trích Xuất
1. Ảnh đã chụp sẽ hiển thị trên màn hình
2. Nhấn **"🔍 Quét & Trích Xuất"**
3. Đợi thanh tiến trình hoàn tất
4. Xem văn bản được trích xuất

### Bước 4: Sử Dụng Dữ Liệu
1. Kiểm tra văn bản đã trích xuất
2. Nhấn **"✅ Sử Dụng Dữ Liệu Này"**
3. Form thêm sách sẽ tự động điền thông tin
4. Kiểm tra và chỉnh sửa nếu cần
5. Lưu sách

## 💡 Mẹo Chụp Ảnh Tốt

### Ánh Sáng
- ☀️ **Ánh sáng tự nhiên tốt nhất**: Chụp gần cửa sổ hoặc ngoài trời
- 💡 **Tránh ánh sáng mạnh trực tiếp**: Có thể tạo bóng hoặc lóa
- 🌙 **Ánh sáng đủ**: Đảm bảo văn bản không bị tối

### Góc Chụp
- 📐 **Giữ camera song song**: Camera vuông góc với bề mặt sách
- 🎯 **Căn giữa**: Đặt văn bản ở giữa khung hình
- 📏 **Khoảng cách phù hợp**: Đủ gần để văn bản rõ, đủ xa để có toàn bộ thông tin

### Chất Lượng
- 🔍 **Focus tốt**: Chờ camera tự động lấy nét
- 🤚 **Giữ chắc**: Tránh rung lắc khi chụp
- 📱 **Độ phân giải cao**: Camera sau thường tốt hơn camera trước

### Nội Dung
- 📖 **Văn bản rõ ràng**: Không bị nhăn, gấp hoặc hư
- 🚫 **Không che khuất**: Tránh ngón tay hoặc vật khác che văn bản
- 📄 **Bề mặt phẳng**: Đặt sách trên bề mặt phẳng nếu có thể

## 🎯 Tính Năng Camera

### Camera Sau Tự Động (Mobile)
- Trên điện thoại, ứng dụng tự động sử dụng camera sau
- Camera sau thường có chất lượng tốt hơn camera trước
- Phù hợp để quét sách chuyên nghiệp

### Độ Phân Giải Cao
- Camera được cấu hình sử dụng độ phân giải 1920x1080
- Đảm bảo chất lượng ảnh tốt cho OCR
- Kích thước file vẫn được tối ưu

### Responsive
- Hoạt động tốt trên cả desktop và mobile
- Giao diện tự động điều chỉnh theo kích thước màn hình
- Controls dễ sử dụng trên mọi thiết bị

## 🔒 Quyền Riêng Tư & Bảo Mật

### Quyền Truy Cập
- Ứng dụng chỉ yêu cầu quyền camera khi bạn nhấn "Mở Camera"
- Bạn có thể từ chối quyền và sử dụng chức năng upload thay thế
- Quyền có thể được thu hồi bất cứ lúc nào trong cài đặt trình duyệt

### Dữ Liệu
- Ảnh được xử lý hoàn toàn trên máy của bạn
- Không có ảnh nào được upload lên server
- Dữ liệu được lưu trong localStorage của trình duyệt

### HTTPS
- Camera chỉ hoạt động trên kết nối an toàn (HTTPS) hoặc localhost
- Đây là yêu cầu bảo mật của trình duyệt
- Đảm bảo dữ liệu của bạn được bảo vệ

## ⚠️ Xử Lý Sự Cố

### Camera không mở được

**Nguyên nhân có thể:**
- Quyền truy cập camera bị từ chối
- Camera đang được sử dụng bởi ứng dụng khác
- Trình duyệt không hỗ trợ API camera
- Kết nối không phải HTTPS (trừ localhost)

**Giải pháp:**
1. Kiểm tra quyền camera trong cài đặt trình duyệt
2. Đóng các ứng dụng khác đang dùng camera (Zoom, Skype, etc.)
3. Thử trình duyệt khác (Chrome, Firefox, Edge)
4. Refresh trang và thử lại
5. Nếu không được, sử dụng chức năng upload file

### Hình ảnh bị mờ

**Giải pháp:**
- Chờ camera tự động lấy nét
- Giữ camera và sách ổn định
- Di chuyển đến vị trí có ánh sáng tốt hơn
- Chụp lại với khoảng cách khác

### OCR không chính xác

**Giải pháp:**
- Chụp lại với góc độ thẳng hơn
- Đảm bảo toàn bộ văn bản trong khung hình
- Tăng ánh sáng
- Làm sạch ống kính camera
- Sử dụng sách có văn bản rõ ràng, không bị phai

### Camera sử dụng camera trước thay vì camera sau

**Giải pháp:**
- Ứng dụng đã được cấu hình sử dụng camera sau
- Một số thiết bị có thể chỉ có một camera
- Kiểm tra cài đặt quyền camera của trình duyệt
- Thử trình duyệt khác

## 🌐 Tương Thích Trình Duyệt

### ✅ Hỗ trợ đầy đủ:
- Chrome/Edge 53+
- Firefox 36+
- Safari 11+
- Opera 40+

### ⚠️ Hỗ trợ hạn chế:
- Internet Explorer: Không hỗ trợ
- Các trình duyệt cũ: Có thể không hoạt động

### 📱 Mobile:
- Chrome Android
- Safari iOS
- Firefox Android
- Samsung Internet

## 🎓 Ví Dụ Thực Tế

### Quét Bìa Sách
1. Đặt sách trên bề mặt phẳng
2. Mở camera và hướng thẳng xuống
3. Đảm bảo toàn bộ bìa trong khung hình
4. Chụp ảnh và quét

### Quét Trang Thông Tin
1. Mở sách đến trang có thông tin xuất bản
2. Giữ camera song song với trang sách
3. Zoom vào phần có thông tin quan trọng
4. Chụp và quét

### Quét Nhiều Sách
1. Chụp ảnh sách đầu tiên
2. Quét và sử dụng dữ liệu
3. Nhấn "Quét OCR" lại để quét sách tiếp theo
4. Lặp lại quy trình

## 📊 So Sánh: Camera vs Upload

| Tính năng | Camera | Upload File |
|-----------|---------|-------------|
| Tốc độ | ⚡⚡⚡ Rất nhanh | ⚡⚡ Nhanh |
| Tiện lợi | ⭐⭐⭐ Rất tiện | ⭐⭐ Tiện |
| Chất lượng | 📷 Phụ thuộc điều kiện | 📷 Ảnh có sẵn |
| Yêu cầu | 📱 Camera + quyền | 📁 File ảnh |
| Offline | ❌ Cần quyền lần đầu | ✅ Hoàn toàn |

## 🎉 Kết Luận

Tính năng camera OCR giúp việc quét sách trở nên:
- ⚡ **Nhanh chóng**: Chụp và quét ngay lập tức
- 🎯 **Chính xác**: Kiểm soát góc chụp và ánh sáng
- 🌟 **Tiện lợi**: Không cần chuẩn bị file ảnh trước
- 📱 **Linh hoạt**: Hoạt động trên mọi thiết bị

Hãy thử ngay và trải nghiệm sự tiện lợi! 📚✨

---

**Cần hỗ trợ?** Kiểm tra phần "Xử Lý Lỗi Thường Gặp" trong README.md
