# 🔍 Hướng Dẫn Sử Dụng Bộ Lọc

## Tính Năng Lọc và Sắp Xếp Sách

Ứng dụng cung cấp hệ thống lọc mạnh mẽ để tìm kiếm sách theo nhiều tiêu chí khác nhau.

## 📦 Tải Dữ Liệu Mẫu

### Cách Tải 100 Cuốn Sách Mẫu:
1. Nhấn nút **"📦 Tải Sách Mẫu"** trên thanh điều hướng
2. Xác nhận trong hộp thoại (dữ liệu hiện tại sẽ bị ghi đè)
3. Hệ thống sẽ tải 100 cuốn sách mẫu vào thư viện

### Danh Mục Sách Mẫu:
- **Lập trình** (25 cuốn): Clean Code, Design Patterns, Refactoring...
- **Văn học Việt Nam** (20 cuốn): Số Đỏ, Vợ Nhặt, Chí Phèo...
- **Kinh doanh** (15 cuốn): Start with Why, The Lean Startup...
- **Khoa học** (15 cuốn): A Brief History of Time, Sapiens...
- **Tiểu thuyết** (15 cuốn): Harry Potter, The Lord of the Rings...
- **Lịch sử** (10 cuốn): Guns, Germs, and Steel...

## 🔍 Các Loại Bộ Lọc

### 1. Tìm Kiếm (Search Bar)
- Tìm theo **tên sách**
- Tìm theo **tác giả**
- Tìm theo **mã ISBN**
- Tìm kiếm real-time, không cần nhấn Enter

### 2. Lọc Theo Danh Mục
Dropdown menu với các danh mục:
- Tất cả danh mục
- Lập trình
- Văn học Việt Nam
- Kinh doanh
- Khoa học
- Tiểu thuyết
- Lịch sử

### 3. Lọc Theo Nhà Xuất Bản
Dropdown menu liệt kê tất cả nhà xuất bản có trong thư viện:
- Tất cả nhà xuất bản
- NXB Trẻ
- NXB Kim Đồng
- Pearson
- O'Reilly
- ... (và nhiều hơn)

### 4. Lọc Theo Năm Xuất Bản
Dropdown menu với các năm có sách:
- Tất cả năm
- 2024
- 2023
- 2022
- ... (các năm có sách)

### 5. Sắp Xếp
8 tùy chọn sắp xếp:
- **Mới nhất**: Sách được thêm gần đây nhất
- **Cũ nhất**: Sách được thêm lâu nhất
- **Tên A → Z**: Sắp xếp theo tên tăng dần
- **Tên Z → A**: Sắp xếp theo tên giảm dần
- **Tác giả A → Z**: Sắp xếp theo tác giả tăng dần
- **Tác giả Z → A**: Sắp xếp theo tác giả giảm dần
- **Năm XB mới nhất**: Năm xuất bản giảm dần
- **Năm XB cũ nhất**: Năm xuất bản tăng dần

## 🎯 Cách Sử Dụng

### Lọc Đơn Giản:
1. Chọn một bộ lọc (ví dụ: Danh mục = "Lập trình")
2. Xem kết quả ngay lập tức
3. Số lượng sách được lọc hiển thị trong phần thống kê

### Lọc Kết Hợp:
Bạn có thể kết hợp nhiều bộ lọc cùng lúc:
```
Tìm kiếm: "nguyễn"
+ Danh mục: "Văn học Việt Nam"
+ Năm XB: "2020"
+ Sắp xếp: "Tên A → Z"
```

### Đếm Bộ Lọc Đang Hoạt Động:
- Badge màu đỏ hiển thị số bộ lọc đang được áp dụng
- Ví dụ: "🔍 Bộ Lọc (3)" nghĩa là có 3 bộ lọc đang hoạt động

### Reset Bộ Lọc:
1. Nhấn nút **"🔄 Reset"** trên FilterBar
2. Hoặc nhấn nút **"✕"** trong SearchBar để xóa tìm kiếm
3. Tất cả bộ lọc sẽ được đặt lại về mặc định

## 📊 Thống Kê

### Hiển Thị Số Liệu:
- **Tổng số sách**: Tổng số sách trong thư viện
- **Kết quả lọc**: Số sách sau khi áp dụng tất cả bộ lọc

### Ví Dụ:
```
Tổng số sách: 100
Kết quả lọc: 15
```
Nghĩa là có 15 sách phù hợp với các bộ lọc hiện tại.

## 💡 Mẹo Sử Dụng

### 1. Tìm Sách Nhanh:
- Dùng tìm kiếm cho kết quả nhanh nhất
- Nhập tên tác giả hoặc tên sách

### 2. Duyệt Theo Chủ Đề:
- Chọn danh mục muốn xem
- Sắp xếp theo tên hoặc năm xuất bản

### 3. Tìm Sách Mới:
- Chọn "Năm XB mới nhất" trong dropdown Sắp xếp
- Hoặc lọc theo năm 2024, 2023

### 4. So Sánh Nhà Xuất Bản:
- Lọc theo nhà xuất bản
- Xem số lượng và chất lượng sách của từng NXB

### 5. Tìm Sách Cùng Chủ Đề:
- Lọc theo danh mục
- Sắp xếp theo tác giả để thấy các tác phẩm của cùng một tác giả

## 🔧 Kỹ Thuật

### Performance:
- Lọc và sắp xếp real-time
- Không cần reload trang
- Mượt mà với 100+ cuốn sách

### Lưu Trữ:
- Bộ lọc chỉ hoạt động trong phiên làm việc
- Không lưu vào localStorage
- Reset khi reload trang

### Tương Thích:
- Hỗ trợ tiếng Việt có dấu
- Tìm kiếm không phân biệt hoa thường
- Sắp xếp theo alphabet tiếng Việt

## 🎨 Giao Diện

### Responsive Design:
- Desktop: Hiển thị 4 dropdown trên 1 hàng
- Tablet: Hiển thị 2 dropdown trên 1 hàng
- Mobile: Hiển thị 1 dropdown trên 1 hàng

### Visual Feedback:
- Badge đỏ hiển thị số bộ lọc đang hoạt động
- Hover effect trên tất cả controls
- Smooth transitions

## 📝 Ví Dụ Thực Tế

### Tình Huống 1: Tìm sách lập trình mới nhất
1. Chọn Danh mục: "Lập trình"
2. Chọn Sắp xếp: "Năm XB mới nhất"
3. Kết quả: Các sách lập trình mới nhất xuất hiện đầu tiên

### Tình Huống 2: Tìm văn học Việt Nam của NXB Trẻ
1. Chọn Danh mục: "Văn học Việt Nam"
2. Chọn Nhà XB: "NXB Trẻ"
3. Chọn Sắp xếp: "Tên A → Z"
4. Kết quả: Văn học VN của NXB Trẻ, sắp xếp theo tên

### Tình Huống 3: Tìm tất cả sách xuất bản năm 2023
1. Chọn Năm: "2023"
2. Chọn Sắp xếp: "Tên A → Z"
3. Kết quả: Tất cả sách năm 2023, sắp xếp theo tên

## 🚀 Tính Năng Nâng Cao

### Lọc Cascade:
- Các bộ lọc hoạt động độc lập
- Có thể bật/tắt từng bộ lọc riêng lẻ
- Kết hợp linh hoạt

### Auto-Population:
- Dropdown tự động cập nhật dựa trên dữ liệu
- Không hiển thị tùy chọn không có dữ liệu
- Danh sách sắp xếp tự động

### Intelligent Reset:
- Giữ lại sắp xếp khi reset (nếu muốn)
- Xóa tất cả bộ lọc cùng lúc
- Quay về trạng thái mặc định

## 🐛 Xử Lý Lỗi

### Không Có Kết Quả:
- Hiển thị "Không tìm thấy sách nào"
- Gợi ý điều chỉnh bộ lọc
- Nút reset rõ ràng

### Dữ Liệu Trống:
- Ứng dụng tự động load 100 sách mẫu nếu chưa có dữ liệu
- Hoặc người dùng có thể nhấn "Tải Sách Mẫu" bất kỳ lúc nào

## 📚 Tài Nguyên

### Code References:
- `FilterBar.js`: Component chính
- `FilterBar.css`: Styling
- `App.js`: Logic lọc và sắp xếp
- `sampleBooks.js`: Dữ liệu mẫu

### Functions:
- `getFilteredAndSortedBooks()`: Áp dụng tất cả bộ lọc
- `getCategories()`: Lấy danh sách categories
- `getPublishers()`: Lấy danh sách publishers
- `getYearRange()`: Lấy danh sách years

---

**Tận Hưởng Trải Nghiệm Quản Lý Sách Mạnh Mẽ! 📖✨**
