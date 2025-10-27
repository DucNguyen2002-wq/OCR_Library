# Hướng dẫn cài đặt OCR Module

## ⚠️ Lỗi thường gặp và cách khắc phục

### Lỗi 1: Cài đặt Python dependencies thất bại

**Giải pháp 1: Cài đặt từng gói riêng lẻ**

```powershell
# Bước 1: Upgrade pip
python -m pip install --upgrade pip

# Bước 2: Cài đặt các gói cơ bản trước
pip install numpy
pip install pillow
pip install opencv-python

# Bước 3: Cài đặt PyTorch (chọn 1 trong 2)
# CPU version (nhẹ hơn, ~200MB):
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu

# GPU version (nếu có NVIDIA GPU, ~2GB):
# pip install torch torchvision

# Bước 4: Cài đặt các gói còn lại
pip install scipy scikit-image python-bidi pyclipper

# Bước 5: Cài đặt EasyOCR cuối cùng
pip install easyocr
```

**Giải pháp 2: Chỉ dùng Tesseract (không cần Python)**

Nếu không muốn cài đặt EasyOCR phức tạp, bạn có thể chỉ dùng Tesseract:

```powershell
# Chỉ cần cài Node.js dependencies
npm install
```

Tesseract.js hoạt động hoàn toàn trong Node.js, không cần Python!

### Lỗi 2: Python không tìm thấy

**Giải pháp:**

1. Kiểm tra Python đã cài đặt:

   ```powershell
   python --version
   ```

2. Nếu chưa có, tải Python từ: https://www.python.org/downloads/

   - Chọn "Add Python to PATH" khi cài đặt!

3. Nếu có nhưng không nhận, thử:

   ```powershell
   python3 --version
   py --version
   ```

4. Cập nhật `pythonBridge.js` nếu cần:
   ```javascript
   this.pythonCommand = "python3"; // hoặc 'py'
   ```

### Lỗi 3: Thiếu Visual C++ Build Tools (Windows)

PyTorch và một số package cần Visual C++.

**Giải pháp:**

1. Tải Visual Studio Build Tools:
   https://visualstudio.microsoft.com/downloads/

2. Hoặc cài phiên bản pre-built:
   ```powershell
   pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
   ```

## 🚀 Cài đặt nhanh (Recommended)

### Option 1: Chỉ dùng Tesseract (Dễ nhất ✅)

```powershell
# Cài Node.js dependencies
npm install

# Chạy server
npm start

# Sử dụng chỉ Tesseract trong code
# API: POST /ocr/tesseract
```

### Option 2: Dùng cả Tesseract + EasyOCR

```powershell
# 1. Cài Node.js dependencies
npm install

# 2. Upgrade pip
python -m pip install --upgrade pip

# 3. Cài PyTorch CPU version (nhanh, nhẹ)
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu

# 4. Cài EasyOCR
pip install easyocr

# 5. Chạy server
npm start

# Test cả 2 engines
# API: POST /ocr/compare
```

## 🧪 Kiểm tra cài đặt

### Test Node.js và Tesseract

```powershell
node -e "console.log('Node.js OK'); const Tesseract = require('tesseract.js'); console.log('Tesseract.js OK');"
```

### Test Python và EasyOCR

```powershell
python -c "import easyocr; print('EasyOCR OK'); reader = easyocr.Reader(['en']); print('EasyOCR Reader OK')"
```

### Test server

```powershell
npm start
```

Sau đó gọi API:

```
GET http://localhost:3000/ocr/status
```

## 📋 Cấu hình tối thiểu

### Chỉ dùng Tesseract:

- Node.js >= 14
- RAM: 1GB
- Disk: 500MB

### Dùng cả EasyOCR:

- Node.js >= 14
- Python >= 3.8
- RAM: 4GB (8GB recommended)
- Disk: 3GB (cho models)

## 🔧 Troubleshooting Commands

```powershell
# Kiểm tra phiên bản
node --version
npm --version
python --version
pip --version

# Xem packages đã cài
pip list | Select-String "easyocr|torch|opencv"

# Gỡ cài đặt nếu cần
pip uninstall easyocr torch torchvision -y

# Xóa cache pip
pip cache purge

# Reinstall từ đầu
pip install --no-cache-dir easyocr
```

## 💡 Tips

1. **Sử dụng Virtual Environment** (khuyến nghị):

   ```powershell
   python -m venv venv
   .\venv\Scripts\Activate.ps1
   pip install -r moduleOCR/requirements.txt
   ```

2. **Nếu mạng chậm**, tải models EasyOCR trước:

   ```python
   import easyocr
   reader = easyocr.Reader(['vi', 'en'])  # Sẽ tải ~2GB models
   ```

3. **Kiểm tra disk space**: EasyOCR cần ~3GB

4. **RAM**: Đóng các ứng dụng khác khi chạy EasyOCR lần đầu

## 📞 Hỗ trợ

Nếu vẫn gặp lỗi, vui lòng cung cấp:

1. Output của: `python --version`
2. Output của: `pip list`
3. Thông báo lỗi đầy đủ
4. Hệ điều hành (Windows/Mac/Linux)

## ⚡ Giải pháp nhanh nhất

Nếu không muốn cài đặt phức tạp:

**Chỉ dùng Tesseract.js - Không cần Python!**

```powershell
npm install
npm start
```

Sau đó chỉ dùng endpoint `/ocr/tesseract` thay vì `/ocr/easyocr`.

Tesseract.js cho kết quả tốt với tiếng Việt (~80-90% accuracy) và không cần cài đặt gì thêm!
