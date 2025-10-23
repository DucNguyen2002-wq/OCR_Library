# 🧪 Test Camera OCR - Demo Guide

## ⚡ Quick Test (5 phút)

### 1. Khởi động ứng dụng
```bash
cd book-management-app
npm start
```
Đợi ứng dụng mở tại: http://localhost:3000

### 2. Test Camera Feature
1. Click tab **"📷 Quét OCR"**
2. Click nút **"📷 Mở Camera"**
3. Trình duyệt sẽ hỏi quyền → Click **"Allow/Cho phép"**
4. Camera sẽ mở và hiển thị video preview
5. Hướng camera về một cuốn sách hoặc văn bản bất kỳ
6. Click **"📸 Chụp Ảnh"**
7. Ảnh sẽ hiển thị thay cho video
8. Click **"🔍 Quét & Trích Xuất"**
9. Đợi progress bar chạy đến 100%
10. Xem text được trích xuất
11. Click **"✅ Sử Dụng Dữ Liệu Này"**
12. Form sẽ tự động điền thông tin

### 3. Test Upload Feature (so sánh)
1. Click **"🔄 Chọn Ảnh Khác"** để reset
2. Click **"📁 Chọn Từ Thiết Bị"**
3. Chọn một ảnh sách từ máy tính
4. Tiếp tục từ bước 8 ở trên

## 📱 Test Cases

### ✅ Test Case 1: Camera Permission
**Mục đích**: Kiểm tra xin quyền camera

**Bước thực hiện**:
1. Mở ứng dụng lần đầu
2. Click "Mở Camera"
3. Quan sát dialog permission

**Kết quả mong đợi**:
- Dialog hiện ra yêu cầu quyền
- Nếu Allow: Camera mở
- Nếu Deny: Alert hiển thị lỗi

---

### ✅ Test Case 2: Camera Preview
**Mục đích**: Kiểm tra video stream

**Bước thực hiện**:
1. Allow camera permission
2. Quan sát video preview

**Kết quả mong đợi**:
- Video hiển thị realtime từ camera
- Controls overlay ở bottom
- Video full width, responsive

---

### ✅ Test Case 3: Capture Photo
**Mục đích**: Kiểm tra chức năng chụp ảnh

**Bước thực hiện**:
1. Camera đang mở
2. Click "Chụp Ảnh"

**Kết quả mong đợi**:
- Video stream dừng
- Ảnh captured hiển thị
- Camera tự động đóng
- Nút "Quét & Trích Xuất" xuất hiện

---

### ✅ Test Case 4: OCR Processing
**Mục đích**: Kiểm tra OCR từ ảnh camera

**Bước thực hiện**:
1. Có ảnh từ camera
2. Click "Quét & Trích Xuất"
3. Đợi xử lý

**Kết quả mong đợi**:
- Progress bar hiện ra
- Progress tăng từ 0% → 100%
- Text được trích xuất hiển thị
- Nút "Sử Dụng Dữ Liệu" xuất hiện

---

### ✅ Test Case 5: Close Camera
**Mục đích**: Kiểm tra đóng camera

**Bước thực hiện**:
1. Camera đang mở
2. Click "Đóng Camera"

**Kết quả mong đợi**:
- Video stream dừng
- Camera tắt (đèn LED tắt)
- Quay về giao diện chọn input

---

### ✅ Test Case 6: Mobile Responsive
**Mục đích**: Kiểm tra trên mobile

**Bước thực hiện**:
1. Mở DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Chọn iPhone/Android
4. Test camera feature

**Kết quả mong đợi**:
- Camera sau được sử dụng
- Controls responsive
- Touch-friendly buttons
- Layout đúng

---

### ✅ Test Case 7: Error Handling
**Mục đích**: Kiểm tra xử lý lỗi

**Bước thực hiện**:
1. Deny camera permission
2. Hoặc camera đang được dùng
3. Click "Mở Camera"

**Kết quả mong đợi**:
- Alert hiển thị lỗi rõ ràng
- Không crash
- Có thể thử lại

---

## 🎯 Demo Scenarios

### Scenario A: Scan Book Cover
**Setup**: Chuẩn bị một cuốn sách với bìa có text

**Steps**:
1. Đặt sách trên bàn
2. Mở camera
3. Giữ camera vuông góc với sách
4. Chụp khi text rõ ràng
5. Quét OCR
6. Kiểm tra text extracted

**Expected**: Title, author visible in extracted text

---

### Scenario B: Scan ISBN Barcode
**Setup**: Sách có ISBN code

**Steps**:
1. Focus vào phần ISBN
2. Zoom gần để số rõ
3. Chụp ảnh
4. Quét OCR
5. Tìm ISBN trong text

**Expected**: ISBN number được trích xuất

---

### Scenario C: Scan Copyright Page
**Setup**: Trang thông tin xuất bản

**Steps**:
1. Mở sách đến copyright page
2. Camera hướng thẳng xuống
3. Chụp toàn bộ trang
4. Quét OCR
5. Xem thông tin NXB, năm XB

**Expected**: Publisher, year trong extracted text

---

## 🐛 Bug Report Template

Nếu phát hiện lỗi, báo cáo theo format:

```markdown
### Bug: [Tên lỗi ngắn gọn]

**Môi trường**:
- Browser: Chrome 120 / Firefox 121 / Safari 17
- Device: Desktop / Mobile (Android/iOS)
- OS: Windows 11 / macOS / Android

**Tái hiện**:
1. [Bước 1]
2. [Bước 2]
3. [Bước 3]

**Kết quả thực tế**:
[Mô tả điều xảy ra]

**Kết quả mong đợi**:
[Mô tả điều nên xảy ra]

**Screenshots/Video**:
[Đính kèm nếu có]

**Console Errors**:
```
[Copy error từ console]
```

**Workaround**:
[Cách khắc phục tạm thời, nếu có]
```

---

## 📊 Test Results Template

```markdown
## Test Session: [Date]

**Tester**: [Tên]
**Environment**: [Browser/Device/OS]
**Version**: 1.1.0

### Test Results:

| Test Case | Status | Notes |
|-----------|--------|-------|
| Camera Permission | ✅ Pass | Permission dialog OK |
| Camera Preview | ✅ Pass | Smooth video |
| Capture Photo | ✅ Pass | Clear image |
| OCR Processing | ✅ Pass | Accurate text |
| Close Camera | ✅ Pass | Stream closed |
| Mobile Responsive | ⚠️ Minor Issue | Button slightly small |
| Error Handling | ✅ Pass | Clear messages |

### Issues Found:
1. [Issue 1 description]
2. [Issue 2 description]

### Suggestions:
1. [Suggestion 1]
2. [Suggestion 2]
```

---

## 🎥 Screen Recording Tips

Để demo tính năng:

### Windows:
- Win + G → Xbox Game Bar
- Start recording
- Test camera feature
- Stop and save

### macOS:
- Cmd + Shift + 5 → Screen Recording
- Test camera feature
- Stop and save

### Chrome Extension:
- Loom hoặc Screencastify
- Record tab
- Test feature
- Share link

---

## 🚀 Performance Benchmarks

Test và ghi lại:

```markdown
### Camera Performance

**Startup Time**:
- Camera init: ___ seconds
- First frame: ___ seconds

**Capture**:
- Photo capture: ___ ms
- Preview display: ___ ms

**OCR**:
- Processing time: ___ seconds
- Image size: ___ KB
- Text accuracy: ___ %

**Memory**:
- Before camera: ___ MB
- With camera: ___ MB
- After cleanup: ___ MB
```

---

## ✅ Acceptance Criteria

Feature được chấp nhận khi:

- [ ] Camera mở thành công trên Chrome, Firefox, Safari
- [ ] Video preview smooth, không lag
- [ ] Chụp ảnh chất lượng cao, rõ nét
- [ ] OCR trích xuất text chính xác > 80%
- [ ] Đóng camera cleanup stream đúng cách
- [ ] Mobile: Camera sau được chọn tự động
- [ ] Error messages rõ ràng và hữu ích
- [ ] UI responsive trên mọi device
- [ ] Không có memory leak
- [ ] Console không có error

---

## 📝 Demo Script (Cho Presentation)

**Introduction** (30s):
"Hôm nay tôi xin demo tính năng Camera OCR mới trong ứng dụng Quản Lý Sách. Tính năng này cho phép quét sách trực tiếp bằng camera, không cần upload file."

**Demo** (2 phút):
1. "Đầu tiên, tôi click vào tab Quét OCR"
2. "Nhấn nút Mở Camera, cho phép quyền truy cập"
3. "Camera mở, tôi hướng về cuốn sách này"
4. "Chụp ảnh khi text rõ nét"
5. "Nhấn Quét & Trích Xuất, đợi xử lý"
6. "Text được trích xuất tự động"
7. "Click Sử Dụng Dữ Liệu, form tự động điền"
8. "Kiểm tra và lưu sách - Done!"

**Benefits** (30s):
"So với upload file, camera nhanh hơn, tiện hơn, và cho phép scan nhiều sách liên tục mà không cần chuẩn bị ảnh trước."

**Q&A**: Ready for questions!

---

## 🎓 Tips For Testing

1. **Ánh sáng**: Test ở nhiều điều kiện ánh sáng khác nhau
2. **Góc độ**: Thử nghiêng, thẳng, gần, xa
3. **Loại sách**: Test với nhiều font chữ, size khác nhau
4. **Device**: Test trên ít nhất 3 devices khác nhau
5. **Network**: Test online và offline (sau lần đầu)
6. **Permission**: Test cả allow và deny
7. **Multi-tasking**: Test khi switch tab, minimize window
8. **Errors**: Cố tình tạo lỗi để test handling

---

**Ready to test? Let's go! 🚀📷📚**
