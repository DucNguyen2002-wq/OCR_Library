# 🌐 Bộ Lọc Ngôn Ngữ - Language Filter

## Tổng Quan

Tính năng mới: **Lọc theo ngôn ngữ** cho phép người dùng lọc sách theo ngôn ngữ (Tiếng Việt hoặc English).

## ✨ Tính Năng Đã Thêm

### 1. Trường Ngôn Ngữ trong Dữ Liệu
- ✅ Thêm trường `language` vào tất cả 100 cuốn sách mẫu
- ✅ Phân loại: 
  - **Tiếng Việt**: 20 sách (văn học Việt Nam, sách dịch tiếng Việt)
  - **English**: 80 sách (lập trình, khoa học, văn học nước ngoài)

### 2. Bộ Lọc Ngôn Ngữ trong FilterBar
- ✅ Dropdown mới: "🌐 Ngôn ngữ"
- ✅ 3 tùy chọn:
  - Tất cả ngôn ngữ (mặc định)
  - Tiếng Việt
  - English
- ✅ Responsive layout: 5 cột filter

### 3. Logic Lọc trong App.js
- ✅ Filter theo ngôn ngữ
- ✅ Kết hợp với các bộ lọc khác
- ✅ Đếm trong active filters badge

### 4. Form Thêm/Sửa Sách
- ✅ Dropdown chọn ngôn ngữ trong BookForm
- ✅ Validation và lưu trữ

### 5. Hiển Thị Thông Tin
- ✅ Icon 🌐 trong BookList
- ✅ Hiển thị ngôn ngữ của sách

## 🎯 Cách Sử Dụng

### Lọc Sách Theo Ngôn Ngữ:

#### 1. Xem Tất Cả Sách Tiếng Việt:
```
1. Vào tab "📋 Danh Sách Sách"
2. Trong FilterBar, chọn dropdown "🌐 Ngôn ngữ"
3. Chọn "Tiếng Việt"
4. Kết quả: 20 sách tiếng Việt
```

#### 2. Xem Tất Cả Sách Tiếng Anh:
```
1. Chọn dropdown "🌐 Ngôn ngữ"
2. Chọn "English"
3. Kết quả: 80 sách tiếng Anh
```

#### 3. Lọc Kết Hợp:
```
Ví dụ: Sách lập trình tiếng Anh
1. Danh mục: "Lập trình"
2. Ngôn ngữ: "English"
3. Kết quả: Sách lập trình tiếng Anh
```

```
Ví dụ: Văn học Việt Nam
1. Danh mục: "Tiểu thuyết"
2. Ngôn ngữ: "Tiếng Việt"
3. Kết quả: Tiểu thuyết tiếng Việt
```

### Thêm Sách Mới với Ngôn Ngữ:

```
1. Tab "➕ Thêm Sách"
2. Điền thông tin sách
3. Chọn ngôn ngữ từ dropdown:
   - Tiếng Việt
   - English
4. Lưu sách
```

## 📊 Phân Bổ Ngôn Ngữ trong 100 Sách Mẫu

### Tiếng Việt (20 sách):
- Đắc Nhân Tâm
- Nhà Giả Kim
- Tuổi Trẻ Đáng Giá Bao Nhiêu
- Cà Phê Cùng Tony
- Sapiens: Lược Sử Loài Người (bản dịch)
- Tôi Thấy Hoa Vàng Trên Cỏ Xanh
- Mắt Biếc
- Cho Tôi Xin Một Vé Đi Tuổi Thơ
- Cây Cam Ngọt Của Tôi (bản dịch)
- Không Diệt Không Sinh Đừng Sợ Hãi
- 7 Thói Quen Của Người Thành Đạt (bản dịch)
- Nghĩ Giàu Làm Giàu (bản dịch)
- Dám Nghĩ Lớn (bản dịch)
- Quẳng Gánh Lo Đi Và Vui Sống (bản dịch)
- Con Chim Xanh Biếc Bay Về
- Dế Mèn Phiêu Lưu Ký
- Số Đỏ
- Lão Hạc
- Chí Phèo
- Vợ Nhặt

### English (80 sách):
- **Lập trình** (25 sách): Clean Code, Design Patterns, Python Crash Course...
- **Kinh doanh** (15 sách): The Lean Startup, Zero to One, Good to Great...
- **Khoa học** (15 sách): A Brief History of Time, Cosmos, Sapiens (original)...
- **Văn học** (15 sách): 1984, Harry Potter, The Lord of the Rings...
- **Lịch sử & Tiểu sử** (10 sách): Steve Jobs, Educated, Unbroken...

## 🔧 Chi Tiết Kỹ Thuật

### Files Đã Cập Nhật:

#### 1. `src/data/sampleBooks.js`
```javascript
// Added language field to all books
{ 
  title: "Clean Code",
  language: "English" // NEW
}

// Added helper function
export const getLanguages = () => {
  const languages = [...new Set(sampleBooks.map(book => book.language))];
  return languages.sort();
};
```

#### 2. `src/components/FilterBar.js`
```javascript
// Added language prop
const FilterBar = ({ filters, languages }) => {
  
  // Added language dropdown
  <select
    id="language-filter"
    value={filters.language}
    onChange={handleLanguageChange}
  >
    <option value="">Tất cả ngôn ngữ</option>
    {languages && languages.map(lang => (
      <option key={lang} value={lang}>{lang}</option>
    ))}
  </select>
};
```

#### 3. `src/App.js`
```javascript
// Import getLanguages
import { getLanguages } from './data/sampleBooks';

// Add language to filters state
const [filters, setFilters] = useState({
  language: '', // NEW
  // ...
});

// Apply language filter
if (filters.language) {
  result = result.filter(book => book.language === filters.language);
}

// Pass languages to FilterBar
<FilterBar 
  languages={getLanguages()}
/>
```

#### 4. `src/components/BookForm.js`
```javascript
// Add language to formData
const [formData, setFormData] = useState({
  language: '' // NEW
});

// Add language dropdown
<select id="language" name="language">
  <option value="">Chọn ngôn ngữ</option>
  <option value="Tiếng Việt">Tiếng Việt</option>
  <option value="English">English</option>
</select>
```

#### 5. `src/components/BookList.js`
```javascript
// Display language in book card
{book.language && (
  <div className="info-row">
    <span className="label">🌐 Ngôn ngữ:</span>
    <span className="value">{book.language}</span>
  </div>
)}
```

#### 6. `src/components/FilterBar.css`
```css
/* Updated grid for 5 columns */
.filter-controls {
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
}
```

## 💡 Use Cases

### 1. Tìm Sách Học Tiếng Anh
```
Người dùng muốn tìm sách tiếng Anh để luyện đọc:
1. Lọc: Ngôn ngữ = "English"
2. Lọc: Danh mục = "Văn học"
3. Sắp xếp: "Tên A → Z"
→ Danh sách văn học tiếng Anh
```

### 2. Tìm Sách Việt Cho Trẻ Em
```
Tìm sách thiếu nhi tiếng Việt:
1. Lọc: Ngôn ngữ = "Tiếng Việt"
2. Lọc: Danh mục = "Thiếu nhi"
3. Sắp xếp: "Năm XB mới nhất"
→ Sách thiếu nhi mới nhất
```

### 3. Thư Viện Đa Ngôn Ngữ
```
Quản lý thư viện có cả sách Việt và Anh:
1. Xem tổng sách: 100 cuốn
2. Lọc Tiếng Việt: 20 cuốn
3. Lọc English: 80 cuốn
4. Thống kê phân bổ rõ ràng
```

## 📈 Thống Kê

### Số Lượng:
- **Tổng sách**: 100 cuốn
- **Tiếng Việt**: 20 cuốn (20%)
- **English**: 80 cuốn (80%)

### Phân Bố Theo Danh Mục:

**Tiếng Việt:**
- Tiểu thuyết: 8 cuốn
- Kỹ năng sống: 7 cuốn
- Thiếu nhi: 1 cuốn
- Tâm linh: 1 cuốn
- Lịch sử: 3 cuốn

**English:**
- Lập trình: 25 cuốn
- Kinh doanh/Kinh tế: 15 cuốn
- Khoa học: 15 cuốn
- Văn học/Giả tưởng: 15 cuốn
- Lịch sử/Tiểu sử: 10 cuốn

## 🎨 Giao Diện

### FilterBar với 5 Filters:
```
┌─────────────────────────────────────────────────────────┐
│ 🔍 Bộ Lọc                      🔄 Xóa Lọc (X)          │
├─────────────────────────────────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│ │ Thể  │ │ NXB  │ │ Năm  │ │ Ngôn │ │ Sắp  │          │
│ │ loại │ │      │ │ XB   │ │ ngữ  │ │ xếp  │          │
│ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘          │
└─────────────────────────────────────────────────────────┘
```

### Book Card với Language:
```
┌─────────────────────────────┐
│ 📖 Clean Code               │
│ 👤 Robert C. Martin         │
│ 📖 978-0132350884           │
│ 🏷️ Lập trình               │
│ 📅 2008                     │
│ 🏢 Prentice Hall            │
│ 🌐 English              ← NEW│
└─────────────────────────────┘
```

## ✅ Testing Checklist

- [x] Tất cả 100 sách có trường language
- [x] Dropdown ngôn ngữ hiển thị đúng
- [x] Filter theo Tiếng Việt hoạt động
- [x] Filter theo English hoạt động
- [x] Kết hợp với filters khác
- [x] Badge đếm bao gồm language
- [x] Reset filters xóa language
- [x] BookForm có dropdown language
- [x] BookList hiển thị language
- [x] Responsive design

## 🚀 Kết Quả

### Trước:
- 4 bộ lọc: Danh mục, NXB, Năm, Sắp xếp
- Không phân biệt ngôn ngữ

### Sau:
- ✅ 5 bộ lọc: + Ngôn ngữ
- ✅ Phân loại rõ ràng Việt/Anh
- ✅ Dễ quản lý thư viện đa ngôn ngữ
- ✅ Hỗ trợ tìm sách theo ngôn ngữ

---

**Status: ✅ HOÀN THÀNH**
**Updated: 2024**
**Developed with ❤️**
