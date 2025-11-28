# Scripts

Thư mục chứa các utility scripts để quản lý và bảo trì hệ thống.

## Files

### checkPending.js
Script để kiểm tra và liệt kê các sách có trạng thái pending (chờ phê duyệt).

**Cách chạy:**
```bash
node scripts/checkPending.js
```

---

### migrateImagesToCloudinary.js
Script migration để di chuyển ảnh từ local storage (`/public/uploads/`) lên Cloudinary.

**Sử dụng khi:**
- Migrate từ local storage sang cloud storage
- Backup ảnh lên Cloudinary
- Chuyển đổi hệ thống storage

**Cách chạy:**
```bash
node scripts/migrateImagesToCloudinary.js
```

**Yêu cầu:**
- File `.env` phải có cấu hình Cloudinary (CLOUD_NAME, API_KEY, API_SECRET)
- Ảnh phải tồn tại trong `/public/uploads/`

---

### seedBooksFromExcel.js
Script để import dữ liệu sách từ file Excel vào MongoDB.

**Cách chạy:**
```bash
node scripts/seedBooksFromExcel.js
```

**Format Excel:**
- Cột A: Tiêu đề sách (title)
- Cột B: Tác giả (authors) - phân tách bằng dấu phẩy
- Cột C: Nhà xuất bản (publisher)
- Cột D: Năm xuất bản (year_published)
- Cột E: ISBN
- Cột F: Mô tả (description)

**Lưu ý:**
- File Excel mặc định: `data/Op2.xlsx`
- Có thể thay đổi đường dẫn trong code
- Sách được import sẽ có status = 'pending'

---

## Quy tắc khi thêm script mới

1. **Tên file:** Sử dụng camelCase, mô tả rõ mục đích (vd: `cleanupOldImages.js`)
2. **Documentation:** Thêm comment ở đầu file giải thích:
   - Mục đích của script
   - Cách sử dụng
   - Parameters (nếu có)
   - Dependencies
3. **Error Handling:** Luôn có try-catch và log errors
4. **Dry Run Mode:** Nên có option `--dry-run` để preview thay đổi trước khi thực thi
5. **Logging:** Log rõ ràng các bước thực hiện
6. **Confirmation:** Với operations nguy hiểm (delete, update nhiều records), cần confirmation

## Best Practices

- ✅ Test script trên local/staging trước khi chạy production
- ✅ Backup database trước khi chạy migration scripts
- ✅ Log kết quả ra file để audit
- ✅ Sử dụng environment variables cho configs
- ✅ Graceful error handling (không crash giữa chừng)
