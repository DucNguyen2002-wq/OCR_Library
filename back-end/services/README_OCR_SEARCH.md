# OCR Book Search - Tìm Sách Bằng Ảnh Bìa

## 📋 Mô Tả

Chức năng tìm kiếm sách trong database bằng cách upload ảnh bìa sách. Hệ thống sử dụng:
- **EasyOCR**: Nhận diện text từ ảnh bìa
- **Perplexity AI**: Trích xuất thông tin sách (tên sách, tác giả) từ text OCR
- **MongoDB**: Tìm kiếm sách trong database

## 🚀 Setup

### 1. Cài đặt dependencies (đã có sẵn)
```bash
npm install axios
```

### 2. Cấu hình Perplexity API Key

Thêm vào file `.env`:
```env
PERPLEXITY_API_KEY=pplx-your-api-key-here
```

**Lấy API key:**
- Đăng ký tại: https://www.perplexity.ai/
- Vào Settings → API → Create API Key
- Free tier: 5$ credit miễn phí

### 3. Tạo thư mục temp

```bash
node scripts/createTempFolder.js
```

Hoặc tạo thủ công: `back-end/public/uploads/temp/`

### 4. Khởi động server

```bash
npm start
# hoặc
npm run dev
```

## 📡 API Endpoints

### 1. Tìm sách bằng ảnh

**Endpoint:** `POST /api/ocr/search-book`

**Headers:**
```
Authorization: Bearer <your-jwt-token>
Content-Type: multipart/form-data
```

**Body (form-data):**
- `coverImage`: File ảnh bìa sách (JPEG, PNG, WebP)

**Example cURL:**
```bash
curl -X POST http://localhost:3000/api/ocr/search-book \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "coverImage=@/path/to/book_cover.jpg"
```

**Example PowerShell:**
```powershell
curl.exe -X POST http://localhost:3000/api/ocr/search-book `
  -H "Authorization: Bearer YOUR_TOKEN" `
  -F "coverImage=@path\to\book_cover.jpg"
```

**Success Response:**
```json
{
  "success": true,
  "message": "Found 3 matching book(s)",
  "data": {
    "ocr": {
      "raw_text": "ĐẮC NHÂN TÂM Dale Carnegie...",
      "confidence": 85.5,
      "blocks_count": 12
    },
    "extracted": {
      "title": "Đắc Nhân Tâm",
      "author": "Dale Carnegie",
      "alternative_title": "How to Win Friends and Influence People",
      "keywords": ["đắc nhân tâm", "dale carnegie", "kỹ năng sống"],
      "confidence": 0.92
    },
    "books": [
      {
        "_id": "...",
        "title": "Đắc Nhân Tâm",
        "authors": ["Dale Carnegie"],
        "cover_front_url": "...",
        "isbn": "...",
        "publisher": "NXB Trẻ",
        "year_published": 2020,
        "matchScore": 95
      }
    ]
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Failed to search book",
  "error": "OCR failed to extract text from image"
}
```

### 2. Kiểm tra trạng thái service

**Endpoint:** `GET /api/ocr/search-book/status`

**Response:**
```json
{
  "success": true,
  "status": "operational",
  "features": {
    "ocr": "enabled",
    "ai_extraction": "enabled",
    "database_search": "enabled"
  },
  "message": "OCR Book Search is ready"
}
```

## 🔍 Workflow

```
User uploads book cover image
    ↓
1. OCR Processing (EasyOCR)
   - Extract text from image
   - Get bounding boxes + confidence
    ↓
2. AI Extraction (Perplexity API)
   - Clean OCR text
   - Extract: title, author, keywords
   - Fix OCR errors
    ↓
3. Database Search (MongoDB)
   - Search by title
   - Search by authors
   - Calculate match score
    ↓
4. Return results (Top 10)
```

## 💰 Chi Phí

**Perplexity API:**
- Small model: ~$0.20 per 1M tokens
- Average search: ~500 tokens
- **Cost per search: ~$0.0001** (rất rẻ)
- Free tier: $5 credit

**Ước tính:**
- 1,000 searches = ~$0.10
- 10,000 searches = ~$1.00

## 📝 Files Được Thêm

Chức năng này **KHÔNG thay đổi** code gốc, chỉ thêm các files mới:

```
back-end/
  services/
    bookSearchService.js       ← NEW (business logic)
  controllers/
    ocrSearchController.js     ← NEW (request handler)
  routes/
    ocrSearchRoutes.js         ← NEW (API routes)
  scripts/
    createTempFolder.js        ← NEW (setup script)
  server.js                    ← UPDATED (+2 lines)
```

## 🧪 Testing

### 1. Test với Postman/Thunder Client

1. Import request:
   - Method: POST
   - URL: `http://localhost:3000/api/ocr/search-book`
   - Headers: `Authorization: Bearer <token>`
   - Body: form-data, key=`coverImage`, type=File

2. Upload ảnh bìa sách

3. Kiểm tra response

### 2. Test status endpoint

```bash
curl http://localhost:3000/api/ocr/search-book/status
```

## ⚠️ Lưu Ý

1. **Yêu cầu PERPLEXITY_API_KEY:** Service sẽ không hoạt động nếu thiếu API key

2. **File size limit:** 10MB maximum

3. **Supported formats:** JPEG, PNG, WebP

4. **Authentication required:** Cần đăng nhập để sử dụng

5. **Temp files:** Tự động xóa sau khi xử lý

## 🐛 Troubleshooting

### API Key không hoạt động
```
Error: PERPLEXITY_API_KEY not configured
```
→ Kiểm tra file `.env` có key chưa

### OCR không nhận diện được text
```
Error: OCR failed to extract text
```
→ Ảnh quá mờ hoặc không có text
→ Thử ảnh khác rõ nét hơn

### Không tìm thấy sách
```
Message: No books found matching this cover
```
→ Sách chưa có trong database
→ Hoặc tên sách/tác giả khác nhiều so với OCR

## 📚 Tài Liệu Tham Khảo

- [Perplexity API Docs](https://docs.perplexity.ai/)
- [EasyOCR GitHub](https://github.com/JaidedAI/EasyOCR)
- [Express.js Multer](https://www.npmjs.com/package/multer)
