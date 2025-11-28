// controllers/OCRController.js
/**
 * OCR Controller - Sử dụng EasyOCR + Perplexity AI
 * Đã loại bỏ logic trích thủ công (regex), chỉ dùng Perplexity
 */

const path = require("path");
const fs = require("fs").promises;
const cloudinary = require("cloudinary").v2;
const pythonBridge = require("./pythonBridge");
const bookCoverOCR = require("./bookCoverOCR");

class OCRController {
  constructor() {
    this.uploadsDir = path.join(__dirname, "..", "public", "uploads");
  }

  // --- Helpers -----------------------------------------------------------

  async _uploadToCloudinary(filePath, coverType) {
    if (!filePath) return null;

    try {
      console.log(`📤 Uploading ${coverType} to Cloudinary...`);
      const result = await cloudinary.uploader.upload(filePath, {
        folder: "book-covers",
        public_id: `book_${Date.now()}_${coverType}_${Math.random()
          .toString(36)
          .substring(7)}`,
        overwrite: true,
      });

      const url = result.secure_url;
      console.log(`✅ Uploaded ${coverType}: ${url}`);

      // Xóa file local
      try {
        await fs.unlink(filePath);
        console.log(`🗑️  Deleted local: ${filePath}`);
      } catch (e) {
        console.warn(`⚠️  Cannot delete local file: ${e.message}`);
      }

      return url;
    } catch (err) {
      console.error(`❌ Cloudinary upload error (${coverType}):`, err.message);
      return null;
    }
  }

  _parseLanguages(languagesParam) {
    return languagesParam ? languagesParam.split(",") : ["vi", "en"];
  }

  _shouldUsePerplexity(param) {
    return param !== "false" && param !== false;
  }

  // --- API Endpoints -----------------------------------------------------

  /**
   * POST /api/ocr/check-status
   * Kiểm tra Python/EasyOCR có sẵn sàng không
   */
  async checkStatus(req, res) {
    try {
      const pythonStatus = await pythonBridge.checkPythonEnvironment();

      return res.json({
        success: true,
        engines: {
          easyocr: {
            available: pythonStatus.success,
            version: pythonStatus.python_version || "Unknown",
            gpu: pythonStatus.gpu_available || false,
            python_path: pythonStatus.python_path,
          },
        },
        activeEngine: "easyocr",
      });
    } catch (error) {
      console.error("[OCRController] checkStatus error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi kiểm tra trạng thái",
        error: error.message,
      });
    }
  }

  /**
   * POST /api/ocr/process-uploaded
   * Xử lý 1 file ảnh đã upload (dùng req.file từ multer)
   */
  async processUploadedFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Không có file được upload",
        });
      }

      const { languages, useGPU, usePerplexity } = req.body;
      const imagePath = req.file.path;

      console.log(`[OCRController] 📸 Processing: ${imagePath}`);

      const langs = this._parseLanguages(languages);

      // Bước 1: OCR
      let ocrResult;
      try {
        ocrResult = await pythonBridge.callEasyOCR(
          imagePath,
          langs,
          useGPU === "true"
        );
      } catch (pythonError) {
        console.error("[OCRController] Python OCR Error:", pythonError);
        return res.status(500).json({
          success: false,
          message:
            "Lỗi khi chạy OCR. Kiểm tra:\n• Python đã cài\n• EasyOCR đã cài (pip install easyocr)\n• Ảnh hợp lệ",
          error: pythonError.message,
        });
      }

      if (!ocrResult || !ocrResult.success) {
        return res.status(500).json({
          success: false,
          message: ocrResult?.error || "OCR failed",
          details: ocrResult?.details || "Unknown error",
        });
      }

      // Bước 2: Perplexity (tuỳ chọn)
      let perplexityResult = null;
      let bookInfo = null;

      const shouldUsePerplexity = this._shouldUsePerplexity(usePerplexity);

      if (
        shouldUsePerplexity &&
        ocrResult.full_text &&
        ocrResult.full_text.trim()
      ) {
        console.log("[OCRController] 📤 Sending to Perplexity...");

        try {
          perplexityResult = await perplexityService.extractBookInfo(
            ocrResult.full_text
          );

          if (perplexityResult?.success) {
            bookInfo = perplexityResult.book_info;
            console.log("[OCRController] ✅ Book info extracted");
          } else {
            console.log("[OCRController] ⚠️ Perplexity extraction failed");
          }
        } catch (perplexityError) {
          console.error("[OCRController] Perplexity Error:", perplexityError);
        }
      }

      return res.json({
        ...ocrResult,
        perplexity: perplexityResult,
        bookInfo: bookInfo,
        fileInfo: {
          originalName: req.file.originalname,
          path: req.file.path,
          size: req.file.size,
        },
      });
    } catch (error) {
      console.error("[OCRController] processUploadedFile error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi xử lý file upload",
        error: error.message,
      });
    }
  }

  /**
   * POST /api/ocr/book-covers
   * Xử lý batch bìa sách (front, spine, inside, back)
   * Body: { front, spine, inside, back, languages, usePerplexity }
   */
  async processBookCovers(req, res) {
    try {
      const { front, spine, inside, back, languages, usePerplexity } = req.body;

      if (!front && !spine && !inside && !back) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng cung cấp ít nhất 1 ảnh bìa",
        });
      }

      console.log("[OCRController] Processing book covers:", {
        front,
        spine,
        inside,
        back,
      });

      // Tạo đường dẫn đầy đủ
      const frontPath = front ? path.join(this.uploadsDir, front) : null;
      const spinePath = spine ? path.join(this.uploadsDir, spine) : null;
      const insidePath = inside ? path.join(this.uploadsDir, inside) : null;
      const backPath = back ? path.join(this.uploadsDir, back) : null;

      const langs = this._parseLanguages(languages);
      const shouldUsePerplexity = this._shouldUsePerplexity(usePerplexity);

      // Gọi BookCoverOCRService (đã tích hợp Perplexity)
      const result = await bookCoverOCR.processCoverBatch(
        frontPath,
        spinePath,
        insidePath,
        backPath,
        langs,
        shouldUsePerplexity
      );

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: result.error || "Lỗi khi xử lý bìa sách",
          details: result.details,
        });
      }

      // Upload tất cả ảnh lên Cloudinary
      const [frontUrl, spineUrl, insideUrl, backUrl] = await Promise.all([
        this._uploadToCloudinary(frontPath, "front"),
        this._uploadToCloudinary(spinePath, "spine"),
        this._uploadToCloudinary(insidePath, "inside"),
        this._uploadToCloudinary(backPath, "back"),
      ]);

      return res.json({
        success: true,
        bookData: result.bookData,
        perplexity: result.perplexity,
        coverDetails: result.details,
        processedFiles: {
          front: front || null,
          spine: spine || null,
          inside: inside || null,
          back: back || null,
        },
        cloudinaryUrls: {
          front: frontUrl,
          spine: spineUrl,
          inside: insideUrl,
          back: backUrl,
        },
      });
    } catch (error) {
      console.error("[OCRController] processBookCovers error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi xử lý bìa sách",
        error: error.message,
      });
    }
  }

  /**
   * POST /api/ocr/book-cover (single)
   * Xử lý 1 bìa sách
   * Body: { filename, coverType, languages }
   */
  async processBookCover(req, res) {
    try {
      const { filename, coverType = "front", languages } = req.body;

      if (!filename) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng cung cấp tên file ảnh (filename)",
        });
      }

      console.log(`[OCRController] Processing ${coverType} cover:`, filename);

      const filePath = path.join(this.uploadsDir, filename);
      const langs = this._parseLanguages(languages);

      const result = await bookCoverOCR.processCover(filePath, coverType, langs);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: result.error || "Lỗi khi xử lý bìa sách",
        });
      }

      // Upload lên Cloudinary
      const cloudinaryUrl = await this._uploadToCloudinary(filePath, coverType);

      return res.json({
        success: true,
        coverType: result.coverType,
        rawText: result.rawText,
        confidence: result.confidence,
        processingTime: result.processingTime,
        processedFile: {
          filename: filename,
          url: cloudinaryUrl || `/uploads/${filename}`,
          isCloudinary: !!cloudinaryUrl,
        },
      });
    } catch (error) {
      console.error("[OCRController] processBookCover error:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi xử lý bìa sách",
        error: error.message,
      });
    }
  }

  // Alias backward compatibility
  extractText(req, res) {
    return this.processUploadedFile(req, res);
  }
}

module.exports = new OCRController();
