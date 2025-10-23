# 📚 Ứng Dụng Quản Lý Sách với Tesseract OCR

Ứng dụng web quản lý thư viện sách được xây dựng bằng React.js, tích hợp công nghệ OCR (Optical Character Recognition) để tự động trích xuất thông tin sách từ hình ảnh.

## ✨ Tính Năng

### 1. Quản Lý Sách
- ➕ **Thêm sách mới**: Nhập thông tin chi tiết về sách (tên, tác giả, ISBN, thể loại, năm xuất bản, nhà xuất bản, mô tả)
- ✏️ **Chỉnh sửa sách**: Cập nhật thông tin sách đã có
- 🗑️ **Xóa sách**: Xóa sách khỏi danh sách
- 💾 **Lưu trữ dữ liệu**: Tự động lưu dữ liệu vào localStorage
- 📦 **Dữ liệu mẫu**: 100 cuốn sách mẫu sẵn có để demo

### 2. Tìm Kiếm và Lọc
- 🔍 **Tìm kiếm thông minh**: Tìm kiếm theo tên sách, tác giả hoặc ISBN
- 🎯 **Hiển thị kết quả real-time**: Kết quả tìm kiếm được cập nhật ngay lập tức
- 📊 **Bộ lọc đa tiêu chí**: 
  - Lọc theo danh mục (Lập trình, Văn học, Kinh doanh, Khoa học, Tiểu thuyết, Lịch sử)
  - Lọc theo nhà xuất bản
  - Lọc theo năm xuất bản
- 🔄 **Sắp xếp linh hoạt**: 8 tùy chọn sắp xếp (tên, tác giả, năm xuất bản, thời gian thêm)
- 🎨 **Lọc kết hợp**: Có thể áp dụng nhiều bộ lọc cùng lúc

### 3. OCR Scanner
- 📷 **Quét hình ảnh**: Upload hoặc kéo thả hình ảnh sách
- 📸 **Camera trực tiếp**: Sử dụng camera để chụp và quét sách ngay lập tức
- 🤖 **Trích xuất tự động**: Sử dụng Tesseract.js để nhận dạng văn bản
- 🌐 **Đa ngôn ngữ**: Hỗ trợ tiếng Việt và tiếng Anh
- 📊 **Hiển thị tiến trình**: Thanh progress bar theo dõi quá trình xử lý
- ✅ **Áp dụng dữ liệu**: Tự động điền thông tin vào form thêm sách

### 4. Giao Diện
- 🎨 **Thiết kế hiện đại**: Gradient màu sắc đẹp mắt
- 📱 **Responsive**: Tương thích với mọi kích thước màn hình
- ⚡ **Hiệu ứng mượt mà**: Animations và transitions mượt mà
- 🎯 **Trực quan**: Icon và màu sắc dễ hiểu

## 🚀 Cài Đặt và Chạy

### Yêu Cầu Hệ Thống
- Node.js (phiên bản 14 trở lên)
- npm hoặc yarn

### Các Bước Cài Đặt

1. **Mở thư mục dự án**
   ```bash
   cd book-management-app
   ```

2. **Cài đặt dependencies (đã hoàn thành)**
   ```bash
   npm install
   ```

3. **Chạy ứng dụng**
   ```bash
   npm start
   ```

4. **Mở trình duyệt**
   - Ứng dụng sẽ tự động mở tại: `http://localhost:3000`

## 📦 Công Nghệ Sử Dụng

- **React.js**: Framework JavaScript cho UI
- **Tesseract.js**: Thư viện OCR nhận dạng văn bản
- **localStorage**: Lưu trữ dữ liệu cục bộ
- **CSS3**: Styling và animations

## 📖 Hướng Dẫn Sử Dụng

### Tải Dữ Liệu Mẫu
1. Nhấn nút "📦 Tải Sách Mẫu" trên thanh điều hướng
2. Xác nhận trong hộp thoại
3. 100 cuốn sách mẫu sẽ được tải vào thư viện
4. Bao gồm 6 danh mục: Lập trình, Văn học Việt Nam, Kinh doanh, Khoa học, Tiểu thuyết, Lịch sử

### Tìm Kiếm và Lọc Sách
1. **Tìm kiếm**: Nhập từ khóa vào ô tìm kiếm (tên sách, tác giả, ISBN)
2. **Lọc theo danh mục**: Chọn danh mục từ dropdown "Danh Mục"
3. **Lọc theo nhà xuất bản**: Chọn nhà xuất bản từ dropdown "Nhà XB"
4. **Lọc theo năm**: Chọn năm xuất bản từ dropdown "Năm XB"
5. **Sắp xếp**: Chọn kiểu sắp xếp (mới nhất, cũ nhất, A-Z, Z-A, năm XB)
6. **Reset**: Nhấn nút "🔄 Reset" để xóa tất cả bộ lọc
7. Các bộ lọc có thể kết hợp với nhau

### Thêm Sách Thủ Công
1. Nhấn nút "➕ Thêm Sách"
2. Điền đầy đủ thông tin (các trường có dấu * là bắt buộc)
3. Nhấn "➕ Thêm Sách" để lưu

### Sử Dụng OCR

#### Phương pháp 1: Sử dụng Camera (Khuyến nghị)
1. Nhấn nút "📷 Quét OCR"
2. Nhấn "📷 Mở Camera"
3. Trình duyệt sẽ yêu cầu quyền truy cập camera - cho phép để tiếp tục
4. Hướng camera về phía sách cần quét
5. Nhấn "📸 Chụp Ảnh" khi đã đặt vị trí phù hợp
6. Nhấn "🔍 Quét & Trích Xuất"
7. Đợi quá trình xử lý hoàn tất
8. Xem văn bản được trích xuất
9. Nhấn "✅ Sử Dụng Dữ Liệu Này" để chuyển sang form thêm sách
10. Kiểm tra và chỉnh sửa thông tin nếu cần
11. Lưu sách

#### Phương pháp 2: Upload từ thiết bị
1. Nhấn nút "📷 Quét OCR"
2. Nhấn "📁 Chọn Từ Thiết Bị" hoặc kéo thả hình ảnh
3. Chọn hình ảnh sách từ máy tính/điện thoại
4. Nhấn "🔍 Quét & Trích Xuất"
5. Đợi quá trình xử lý hoàn tất
6. Xem văn bản được trích xuất
7. Nhấn "✅ Sử Dụng Dữ Liệu Này" để chuyển sang form thêm sách
8. Kiểm tra và chỉnh sửa thông tin nếu cần
9. Lưu sách

### Tìm Kiếm Sách
1. Vào tab "📋 Danh Sách Sách"
2. Gõ từ khóa vào ô tìm kiếm
3. Kết quả sẽ hiển thị ngay lập tức

### Chỉnh Sửa/Xóa Sách
1. Trong danh sách sách, nhấn ✏️ để chỉnh sửa
2. Hoặc nhấn 🗑️ để xóa sách

## 💡 Mẹo Để OCR Hoạt Động Tốt

### Sử dụng Camera:
- 📷 **Camera tự động chọn camera sau** (nếu có) để chụp chất lượng tốt hơn
- 💡 **Ánh sáng tốt**: Chụp ở nơi có ánh sáng đầy đủ
- 📐 **Giữ thẳng**: Giữ camera song song với bề mặt sách
- 🎯 **Zoom phù hợp**: Đảm bảo văn bản lấp đầy khung hình
- ⏱️ **Giữ chắc**: Giữ tay vững để tránh ảnh bị mờ

### Upload File:
- ✅ Sử dụng hình ảnh có độ phân giải cao
- ✅ Đảm bảo văn bản rõ ràng, không bị mờ
- ✅ Chụp ảnh với ánh sáng tốt
- ✅ Góc chụp thẳng, không bị nghiêng
- ✅ Văn bản không bị che khuất

### Lưu ý:
- 🌐 **Quyền truy cập camera**: Trình duyệt sẽ yêu cầu quyền - hãy cho phép
- 🔒 **Bảo mật**: Camera chỉ hoạt động trên HTTPS hoặc localhost
- 📱 **Mobile**: Tự động sử dụng camera sau trên điện thoại

## 🎯 Cấu Trúc Dự Án

```
book-management-app/
├── public/
├── src/
│   ├── components/
│   │   ├── BookList.js          # Component hiển thị danh sách sách
│   │   ├── BookList.css
│   │   ├── BookForm.js          # Form thêm/sửa sách
│   │   ├── BookForm.css
│   │   ├── SearchBar.js         # Thanh tìm kiếm
│   │   ├── SearchBar.css
│   │   ├── FilterBar.js         # Bộ lọc và sắp xếp
│   │   ├── FilterBar.css
│   │   ├── OCRScanner.js        # Scanner OCR với camera
│   │   └── OCRScanner.css
│   ├── data/
│   │   └── sampleBooks.js       # 100 cuốn sách mẫu
│   ├── App.js                   # Component chính
│   ├── App.css                  # Styling chính
│   └── index.js                 # Entry point
├── README.md                    # Tài liệu chính
├── QUICKSTART.md               # Hướng dẫn nhanh
├── CAMERA_GUIDE.md             # Hướng dẫn sử dụng camera
├── FILTER_GUIDE.md             # Hướng dẫn sử dụng bộ lọc
└── package.json                # Dependencies
│   │   ├── SearchBar.css
│   │   ├── OCRScanner.js        # Component quét OCR
│   │   └── OCRScanner.css
│   ├── App.js                   # Component chính
│   ├── App.css                  # Styles chính
│   └── index.js                 # Entry point
├── package.json
└── README.md
```

## 🔧 Scripts Có Sẵn

- `npm start`: Chạy ứng dụng ở chế độ development
- `npm test`: Chạy test suite
- `npm run build`: Build ứng dụng cho production
- `npm run eject`: Eject cấu hình (không thể hoàn tác)

## 🌟 Tính Năng Nổi Bật

1. **Không cần backend**: Dữ liệu được lưu trữ cục bộ
2. **100 sách mẫu**: Dữ liệu demo phong phú để thử nghiệm
3. **Bộ lọc mạnh mẽ**: Lọc theo nhiều tiêu chí, sắp xếp linh hoạt
4. **Offline-ready**: Có thể sử dụng không cần internet (sau lần tải đầu)
5. **Fast performance**: React virtual DOM để render nhanh
6. **User-friendly**: Giao diện thân thiện, dễ sử dụng
7. **Camera OCR**: Quét sách trực tiếp bằng camera

## � Danh Mục Sách Mẫu

- **Lập trình** (25 cuốn): Clean Code, Design Patterns, Refactoring, Data Structures...
- **Văn học Việt Nam** (20 cuốn): Số Đỏ, Vợ Nhặt, Chí Phèo, Tắt Đèn...
- **Kinh doanh** (15 cuốn): Start with Why, The Lean Startup, Zero to One...
- **Khoa học** (15 cuốn): A Brief History of Time, Sapiens, The Selfish Gene...
- **Tiểu thuyết** (15 cuốn): Harry Potter, The Lord of the Rings, 1984...
- **Lịch sử** (10 cuốn): Guns, Germs, and Steel, The History of the World...

## �📝 Lưu Ý

- Dữ liệu được lưu trong localStorage của trình duyệt
- Xóa cache/cookies sẽ làm mất dữ liệu
- OCR cần kết nối internet lần đầu để tải language data
- Độ chính xác OCR phụ thuộc vào chất lượng hình ảnh
- Camera chỉ hoạt động trên HTTPS hoặc localhost
- Nếu không có dữ liệu, app tự động tải 100 sách mẫu

## 🔗 Tài Liệu Khác

- [QUICKSTART.md](QUICKSTART.md) - Hướng dẫn nhanh để bắt đầu
- [CAMERA_GUIDE.md](CAMERA_GUIDE.md) - Hướng dẫn chi tiết về tính năng camera
- [FILTER_GUIDE.md](FILTER_GUIDE.md) - Hướng dẫn sử dụng bộ lọc và sắp xếp

## 🤝 Đóng Góp

Mọi đóng góp đều được chào đón! Hãy tạo issue hoặc pull request.

## 📄 License

MIT License - Tự do sử dụng cho mục đích cá nhân và thương mại.

## 👨‍💻 Tác Giả

Được phát triển với ❤️ bằng React & Tesseract OCR

---

**Chúc bạn sử dụng vui vẻ! 📚✨**


### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
