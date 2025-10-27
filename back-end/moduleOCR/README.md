# Hướng dẫn sử dụng OCR Module

## Cấu trúc Module

Dự án đã được tích hợp 2 OCR engines:

- **Tesseract OCR** (Node.js) - Nhanh, nhẹ
- **EasyOCR** (Python) - Chính xác hơn với tiếng Việt

### Cấu trúc thư mục

```
WebOCR/
├── moduleOCR/
│   ├── tesseractService.js    # Module Tesseract OCR
│   ├── easyocrService.py      # Module EasyOCR (Python)
│   ├── pythonBridge.js        # Cầu nối Node.js - Python
│   ├── ocrController.js       # Controller xử lý các request OCR
│   └── requirements.txt       # Python dependencies
├── server.js                  # Server chính với các OCR routes
└── package.json              # Node.js dependencies
```

## Cài đặt

### 1. Cài đặt Node.js dependencies

```bash
npm install
```

### 2. Cài đặt Python và EasyOCR

```bash
# Cài đặt Python 3.8 trở lên nếu chưa có
# Sau đó cài đặt các thư viện Python:

pip install -r moduleOCR/requirements.txt
```

**Lưu ý**: EasyOCR yêu cầu khoảng 2-3GB để tải models lần đầu.

### 3. Kiểm tra cài đặt

Khởi động server và gọi API status:

```bash
npm start
```

Sau đó gọi API (cần đăng nhập trước):

```
GET http://localhost:3000/ocr/status
Authorization: Bearer YOUR_TOKEN
```

## API Endpoints

### 1. Kiểm tra trạng thái OCR engines

```http
GET /ocr/status
Authorization: Bearer YOUR_TOKEN
```

**Response:**

```json
{
  "success": true,
  "engines": {
    "tesseract": {
      "available": true,
      "status": "ready",
      "languages": ["vie", "eng"]
    },
    "easyocr": {
      "available": true,
      "status": "ready",
      "message": "Python và EasyOCR đã được cài đặt",
      "pythonVersion": "3.10.0"
    }
  }
}
```

### 2. OCR với Tesseract

```http
POST /ocr/tesseract
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "imagePath": "public/uploads/cover-123456.jpg",
  "lang": "vie+eng"
}
```

**Response:**

```json
{
  "success": true,
  "engine": "tesseract",
  "text": "ĐẮC NHÂN TÂM\nDale Carnegie",
  "confidence": 85.5,
  "processingTime": 2.5,
  "bookInfo": {
    "title": "ĐẮC NHÂN TÂM",
    "author": "Dale Carnegie",
    "publisher": "",
    "allText": "...",
    "lineCount": 10
  }
}
```

### 3. OCR với EasyOCR

```http
POST /ocr/easyocr
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "imagePath": "public/uploads/cover-123456.jpg",
  "languages": ["vi", "en"],
  "useGPU": false
}
```

**Response:**

```json
{
  "success": true,
  "engine": "easyocr",
  "text": "ĐẮC NHÂN TÂM Dale Carnegie",
  "confidence": 0.92,
  "processingTime": 5.8,
  "blocks": [
    {
      "text": "ĐẮC NHÂN TÂM",
      "confidence": 0.95,
      "bbox": [
        [10, 20],
        [200, 20],
        [200, 50],
        [10, 50]
      ]
    }
  ],
  "blockCount": 5
}
```

### 4. So sánh cả 2 engines

```http
POST /ocr/compare
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "imagePath": "public/uploads/cover-123456.jpg",
  "lang": "vie+eng",
  "languages": ["vi", "en"],
  "useGPU": false
}
```

**Response:**

```json
{
  "success": true,
  "tesseract": { ... },
  "easyocr": { ... },
  "comparison": {
    "similarity": 87,
    "tesseractConfidence": 85.5,
    "easyocrConfidence": 92.0,
    "recommendation": "EasyOCR cho kết quả tốt hơn"
  }
}
```

### 5. OCR từ file upload

```http
POST /ocr/upload
Authorization: Bearer YOUR_TOKEN
Content-Type: multipart/form-data

coverImage: [FILE]
engine: "tesseract" | "easyocr" | "compare"
lang: "vie+eng"
languages: "vi,en"
useGPU: "false"
```

**Response:**

```json
{
  "success": true,
  "engine": "tesseract",
  "text": "...",
  "confidence": 85.5,
  "bookInfo": { ... },
  "fileInfo": {
    "originalName": "book-cover.jpg",
    "path": "public/uploads/coverImage-123456.jpg",
    "size": 245678
  }
}
```

## Sử dụng trong Code

### Ví dụ với JavaScript (Frontend)

```javascript
// 1. Upload và OCR với Tesseract
async function ocrWithTesseract(file) {
  const formData = new FormData();
  formData.append("coverImage", file);
  formData.append("engine", "tesseract");
  formData.append("lang", "vie+eng");

  const response = await fetch("http://localhost:3000/ocr/upload", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });

  const result = await response.json();
  console.log("OCR Result:", result);
  return result;
}

// 2. So sánh cả 2 engines
async function compareOCR(imagePath) {
  const response = await fetch("http://localhost:3000/ocr/compare", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      imagePath: imagePath,
      lang: "vie+eng",
      languages: ["vi", "en"],
    }),
  });

  return await response.json();
}
```

### Ví dụ với Node.js (Backend)

```javascript
const tesseractService = require("./moduleOCR/tesseractService");
const pythonBridge = require("./moduleOCR/pythonBridge");

// OCR với Tesseract
async function processWithTesseract(imagePath) {
  const result = await tesseractService.recognizeText(imagePath, "vie+eng");
  const bookInfo = tesseractService.extractBookInfo(result.text);
  return { ...result, bookInfo };
}

// OCR với EasyOCR
async function processWithEasyOCR(imagePath) {
  const result = await pythonBridge.callEasyOCR(imagePath, ["vi", "en"], false);
  return result;
}
```

## Tính năng chính

### Tesseract Service

- ✅ OCR nhanh với Tesseract.js
- ✅ Hỗ trợ tiếng Việt và tiếng Anh
- ✅ Trích xuất thông tin sách (title, author, publisher)
- ✅ Làm sạch text tự động
- ✅ Trả về confidence score và thời gian xử lý

### EasyOCR Service

- ✅ OCR chính xác hơn với deep learning
- ✅ Hỗ trợ nhiều ngôn ngữ
- ✅ Trả về bounding boxes chi tiết
- ✅ Có thể sử dụng GPU để tăng tốc
- ✅ Tiền xử lý ảnh tự động

### OCR Controller

- ✅ API endpoints đầy đủ
- ✅ So sánh kết quả 2 engines
- ✅ Tính độ tương đồng giữa kết quả
- ✅ Khuyến nghị engine nào tốt hơn
- ✅ Xác thực JWT
- ✅ Upload file trực tiếp

## So sánh Tesseract vs EasyOCR

| Tiêu chí     | Tesseract       | EasyOCR             |
| ------------ | --------------- | ------------------- |
| Tốc độ       | ⚡ Nhanh (2-3s) | 🐢 Chậm hơn (5-10s) |
| Độ chính xác | ⭐⭐⭐          | ⭐⭐⭐⭐⭐          |
| Tiếng Việt   | ✅ Tốt          | ✅ Rất tốt          |
| Cài đặt      | 🟢 Dễ           | 🟡 Trung bình       |
| Kích thước   | 📦 Nhẹ (~50MB)  | 📦 Nặng (~2GB)      |
| GPU          | ❌ Không        | ✅ Có               |

## Khuyến nghị sử dụng

1. **Tesseract**: Dùng cho preview nhanh, testing, hoặc khi cần xử lý real-time
2. **EasyOCR**: Dùng cho xử lý chính thức, cần độ chính xác cao
3. **Compare**: Dùng khi muốn đối chiếu kết quả hoặc không chắc chắn về chất lượng ảnh

## Xử lý lỗi

```javascript
try {
  const result = await ocrWithTesseract(file);
  if (!result.success) {
    console.error("OCR failed:", result.error);
  }
} catch (error) {
  console.error("Error:", error.message);
}
```

## Tips tối ưu

1. **Chất lượng ảnh**: Ảnh rõ nét, độ phân giải cao (ít nhất 1000px width)
2. **Ánh sáng**: Tránh ảnh bị tối hoặc quá sáng
3. **Góc chụp**: Chụp thẳng, tránh nghiêng
4. **Ngôn ngữ**: Chọn đúng ngôn ngữ để tăng độ chính xác
5. **GPU**: Bật GPU cho EasyOCR nếu có card đồ họa NVIDIA

## Troubleshooting

### Python không được tìm thấy

```bash
# Windows: Thêm Python vào PATH
# Hoặc thay đổi trong pythonBridge.js:
this.pythonCommand = 'python3'; // hoặc đường dẫn đầy đủ
```

### EasyOCR chậm lần đầu

EasyOCR sẽ tải models lần đầu (~2GB). Các lần sau sẽ nhanh hơn.

### Lỗi memory

Giảm kích thước ảnh trước khi OCR hoặc giảm canvas_size trong options.

## License

MIT
