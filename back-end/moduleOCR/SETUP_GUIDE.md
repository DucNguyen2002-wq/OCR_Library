# 🚀 Hướng Dẫn Cài Đặt và Kiểm Tra Hệ Thống OCR

## 📋 Tổng Quan

Hệ thống OCR mới đã được nâng cấp với:
- **PaddleOCR**: Engine chính (nhanh hơn 2-3x, độ chính xác cao cho tiếng Việt)
- **EasyOCR**: Engine dự phòng (tự động chuyển sang nếu PaddleOCR lỗi)
- **Interactive Bounding Boxes**: Giao diện tương tác với các hộp văn bản
- **Single API Endpoint**: Upload và quét trực tiếp trong 1 bước

---

## 🔧 Bước 1: Cài Đặt PaddleOCR

### Windows (PowerShell)

```powershell
# Di chuyển đến thư mục moduleOCR
cd back-end\moduleOCR

# Cài đặt PaddleOCR và dependencies
pip install paddlepaddle==2.5.2
pip install paddleocr==2.7.0.3
pip install shapely==2.0.2

# Kiểm tra cài đặt
python -c "import paddle; print('PaddlePaddle version:', paddle.__version__)"
python -c "from paddleocr import PaddleOCR; print('PaddleOCR imported successfully')"
```

### Linux/Mac

```bash
cd back-end/moduleOCR

# Cài đặt PaddleOCR
pip3 install paddlepaddle==2.5.2
pip3 install paddleocr==2.7.0.3
pip3 install shapely==2.0.2

# Kiểm tra
python3 -c "import paddle; print('PaddlePaddle version:', paddle.__version__)"
```

### GPU Support (Tùy chọn - Tăng tốc độ)

Nếu có GPU NVIDIA:

```bash
pip install paddlepaddle-gpu==2.5.2
```

---

## 🧪 Bước 2: Kiểm Tra Hệ Thống

### Test 1: Kiểm tra PaddleOCR Service

```powershell
# Test với một ảnh bất kỳ
python paddleOCRService.py "path/to/test-image.jpg"
```

**Kết quả mong đợi:**
```json
{
  "success": true,
  "text": "Nội dung văn bản đọc được...",
  "boxes": [
    {
      "box": [[433, 295], [563, 295], [563, 361], [433, 361]],
      "text": "Văn bản",
      "confidence": 0.9876
    }
  ],
  "confidence": 95.5,
  "processing_time": 2.3,
  "engine": "PaddleOCR"
}
```

### Test 2: Kiểm tra Unified OCR Service

Tạo file test `test-unified.js`:

```javascript
const UnifiedOCRService = require('./unifiedOCRService');

const service = new UnifiedOCRService('paddle');

service.processImage('path/to/test-image.jpg')
  .then(result => {
    console.log('✅ Success!');
    console.log('Engine:', result.engine);
    console.log('Text detected:', result.text.substring(0, 100));
    console.log('Boxes count:', result.boxes.length);
    console.log('Confidence:', result.confidence);
  })
  .catch(err => {
    console.error('❌ Error:', err.message);
  });
```

Chạy test:
```powershell
node test-unified.js
```

---

## 🌐 Bước 3: Khởi Động Backend

```powershell
# Di chuyển đến thư mục back-end
cd ..

# Cài đặt dependencies (nếu chưa)
npm install

# Khởi động server
npm start
```

**Server sẽ chạy tại:** `http://localhost:5000`

**Endpoints mới:**
- `POST /api/ocr-direct/process` - Upload và quét ảnh
- `POST /api/ocr-direct/batch` - Quét nhiều ảnh cùng lúc
- `POST /api/ocr-direct/re-ocr` - Quét lại ảnh đã upload
- `GET /api/ocr-direct/engines` - Danh sách engine có sẵn

---

## 🎨 Bước 4: Khởi Động Frontend

```powershell
# Di chuyển đến thư mục frontend
cd ..\front-end\user

# Cài đặt dependencies (nếu chưa)
npm install

# Khởi động dev server
npm run dev
```

**Frontend sẽ chạy tại:** `http://localhost:5173`

---

## ✅ Bước 5: Test End-to-End

### 1. Mở trình duyệt và đăng nhập

Truy cập: `http://localhost:5173/login`

### 2. Vào OCR Scanner

Click vào menu **"OCR Scanner"** trên navbar

### 3. Chọn Engine

- **PaddleOCR** (Khuyến nghị): Nhanh hơn, chính xác hơn
- **EasyOCR** (Dự phòng): Đáng tin cậy, hỗ trợ nhiều ngôn ngữ

### 4. Upload và Quét Ảnh

1. Click nút **"Chọn Ảnh để Quét OCR"**
2. Chọn ảnh bìa sách (front/inside/back cover)
3. Đợi xử lý (2-5 giây)

### 5. Xem Kết Quả

- Ảnh sẽ hiển thị với các **hộp bao quanh văn bản**
- Màu hộp theo độ tin cậy:
  - 🟢 **Xanh lá**: Độ tin cậy cao (>80%)
  - 🟡 **Vàng**: Độ tin cậy trung bình (60-80%)
  - 🟠 **Cam**: Độ tin cậy thấp (<60%)
  - 🔴 **Đỏ**: Hộp đang được chọn

### 6. Tương Tác với Bounding Boxes

1. **Click vào hộp văn bản** để xem nội dung
2. Panel bên dưới sẽ hiển thị:
   - Văn bản đọc được (có thể chỉnh sửa)
   - Độ tin cậy
   - Nút **"Sử dụng văn bản này"**

### 7. Sử dụng Văn Bản

- **Sử dụng 1 hộp**: Click hộp → Click "Sử dụng văn bản này"
- **Sử dụng toàn bộ**: Click "Sử dụng toàn bộ văn bản"

---

## 🔍 Troubleshooting

### Lỗi: "PaddleOCR not found"

**Nguyên nhân:** Chưa cài đặt PaddleOCR

**Giải pháp:**
```bash
pip install paddlepaddle paddleocr shapely
```

### Lỗi: "Python script error"

**Nguyên nhân:** Python path không đúng hoặc dependencies thiếu

**Giải pháp:**
1. Kiểm tra Python path:
   ```bash
   python --version  # Phải là Python 3.8+
   ```

2. Kiểm tra dependencies:
   ```bash
   pip list | grep -E "paddle|opencv|numpy"
   ```

3. Cài đặt lại:
   ```bash
   pip install -r requirements.txt
   ```

### Lỗi: "CORS error" trên frontend

**Nguyên nhân:** Backend chưa chạy hoặc cấu hình CORS sai

**Giải pháp:**
1. Đảm bảo backend đang chạy: `http://localhost:5000`
2. Kiểm tra `server.js` có cấu hình CORS:
   ```javascript
   app.use(cors({ origin: 'http://localhost:5173' }));
   ```

### PaddleOCR chậm lần đầu chạy

**Nguyên nhân:** PaddleOCR tải model lần đầu (~100MB)

**Giải pháp:** Đợi 1-2 phút cho lần đầu, sau đó sẽ nhanh (cache model)

### Không nhận diện được tiếng Việt

**Nguyên nhân:** Model không hỗ trợ hoặc ảnh chất lượng kém

**Giải pháp:**
1. Thử chuyển sang EasyOCR (hỗ trợ tiếng Việt tốt hơn)
2. Tăng chất lượng ảnh (độ phân giải, độ sáng)
3. Điều chỉnh threshold trong `paddleOCRService.py`:
   ```python
   det_db_thresh=0.3,  # Giảm xuống 0.2 để nhận diện nhiều hơn
   det_db_box_thresh=0.5  # Giảm xuống 0.4
   ```

---

## 📊 So Sánh Performance

| Engine | Tốc Độ | Độ Chính Xác | Tiếng Việt | GPU Support |
|--------|--------|--------------|------------|-------------|
| **PaddleOCR** | ⚡⚡⚡ Rất nhanh | ✅ Cao | ✅ Tốt | ✅ Có |
| **EasyOCR** | ⚡ Trung bình | ✅ Cao | ✅ Rất tốt | ✅ Có |

**Khuyến nghị:**
- Dùng **PaddleOCR** cho hầu hết trường hợp (nhanh, chính xác)
- Dùng **EasyOCR** nếu cần nhận diện tiếng Việt phức tạp

---

## 🎯 Next Steps

Sau khi hệ thống hoạt động ổn định:

1. **Tích hợp Auto-fill Form**: Tự động điền thông tin sách từ OCR
2. **Box Editing**: Cho phép merge/split các hộp văn bản
3. **Lưu Kết Quả**: Lưu OCR results vào database
4. **Batch Processing**: Quét nhiều ảnh đồng thời
5. **Advanced Preprocessing**: Tăng chất lượng ảnh trước khi OCR

---

## 📞 Support

Nếu gặp vấn đề, kiểm tra:
1. Backend logs: Console của `npm start`
2. Frontend logs: Browser DevTools (F12) → Console
3. Python logs: Kiểm tra file `paddleOCRService.py` output

**Happy Scanning! 📚✨**
