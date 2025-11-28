// services/BookCoverOCRService.js
/**
 * Book Cover OCR Service
 * Nhiệm vụ: gọi OCR Python, gom text từ các bìa và (tuỳ chọn) gửi sang Perplexity để lấy metadata.
 */

const pythonBridge = require("./pythonBridge");
const perplexityService = require("./ocrService");
const path = require("path");
const fs = require("fs").promises;

class BookCoverOCRService {
  constructor() {
    this.coverTypes = {
      FRONT: "front",
      INSIDE: "inside",
      BACK: "back",
      SPINE: "spine",
    };
  }

  /**
   * Chuẩn hoá path và kiểm tra file tồn tại
   */
  async _resolveAndCheckPath(imagePath) {
    const absolutePath = path.isAbsolute(imagePath)
      ? imagePath
      : path.join(__dirname, "..", imagePath);

    await fs.access(absolutePath);
    return absolutePath;
  }

  /**
   * Gọi OCR cho 1 bìa (không phân tích field, chỉ lấy text + metadata)
   */
  async processCover(imagePath, coverType, languages = ["vi", "en"]) {
    try {
      if (!imagePath) return null;

      const absolutePath = await this._resolveAndCheckPath(imagePath);

      const ocrResult = await pythonBridge.callEasyOCR(
        absolutePath,
        languages,
        false // GPU
      );

      if (!ocrResult || !ocrResult.success) {
        throw new Error(ocrResult?.error || "OCR failed");
      }

      return {
        success: true,
        coverType,
        rawText: ocrResult.full_text || ocrResult.text || "",
        confidence:
          ocrResult.avg_confidence || ocrResult.confidence || 0,
        processingTime:
          ocrResult.processing_time || ocrResult.processingTime || 0,
        blocks: ocrResult.blocks || [],
        num_blocks: ocrResult.num_blocks || 0,
      };
    } catch (error) {
      console.error(`[BookCoverOCR] Error processing ${coverType}:`, error);
      return {
        success: false,
        coverType,
        error: error.message,
      };
    }
  }

  /**
   * Xử lý batch các bìa (FRONT, SPINE, INSIDE, BACK) và (tuỳ chọn) gọi Perplexity để trích metadata.
   */
  async processCoverBatch(
    frontPath,
    spinePath,
    insidePath,
    backPath,
    languages = ["vi", "en"],
    usePerplexity = true
  ) {
    try {
      // Xử lý tuần tự thay vì Promise.all để tránh crash EasyOCR khi load nhiều ảnh
      let frontResult = null;
      let spineResult = null;
      let insideResult = null;
      let backResult = null;

      if (frontPath) {
        console.log('[BookCoverOCR] Processing FRONT cover...');
        frontResult = await this.processCover(frontPath, this.coverTypes.FRONT, languages);
      }

      if (spinePath) {
        console.log('[BookCoverOCR] Processing SPINE cover...');
        spineResult = await this.processCover(spinePath, this.coverTypes.SPINE, languages);
      }

      if (insidePath) {
        console.log('[BookCoverOCR] Processing INSIDE cover...');
        insideResult = await this.processCover(insidePath, this.coverTypes.INSIDE, languages);
      }

      if (backPath) {
        console.log('[BookCoverOCR] Processing BACK cover...');
        backResult = await this.processCover(backPath, this.coverTypes.BACK, languages);
      }

      // Dữ liệu OCR thô để debug / lưu log
      const ocrDetails = {
        front: frontResult,
        spine: spineResult,
        inside: insideResult,
        back: backResult,
      };

      // Nếu không dùng Perplexity thì chỉ trả OCR
      if (!usePerplexity) {
        return {
          success: true,
          bookData: null,
          perplexity: null,
          details: ocrDetails,
        };
      }

      // Ghép toàn bộ text OCR từ TẤT CẢ các bìa
      const combinedText = [
        frontResult?.rawText,
        spineResult?.rawText,
        insideResult?.rawText,
        backResult?.rawText,
      ]
        .filter(Boolean)
        .join("\n\n");

      if (!combinedText.trim()) {
        return {
          success: false,
          error: "Không có text OCR để gửi Perplexity",
          bookData: null,
          perplexity: null,
          details: ocrDetails,
        };
      }

      console.log("[BookCoverOCR] 📤 Sending combined text from all covers to Perplexity...");

      // Gọi Perplexity để trích metadata (title, author, isbn, publisher, year, description, ...)
      const perplexityResult =
        await perplexityService.extractBookInfo(combinedText);

      // bookData chuẩn lấy trực tiếp từ Perplexity; giữ OCR để tham chiếu
      const bookData = perplexityResult?.success
        ? this._normalizeBookData(perplexityResult.book_info)
        : null;

      return {
        success: true,
        bookData,
        perplexity: perplexityResult,
        details: ocrDetails,
      };
    } catch (error) {
      console.error("[BookCoverOCR] Error processing batch:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Chuẩn hoá book_info trả về từ Perplexity thành cấu trúc thống nhất
   */
  _normalizeBookData(bookInfo = {}) {
    const cleanText = (t) =>
      typeof t === "string"
        ? t.replace(/\s+/g, " ").trim()
        : "";

    const title = cleanText(bookInfo.title);
    const publisher = cleanText(bookInfo.publisher);
    const description = cleanText(bookInfo.description);
    const translator = cleanText(bookInfo.translator);

    let authors = bookInfo.author || bookInfo.authors || [];
    if (typeof authors === "string") {
      authors = authors
        .split(/[,;]+/)
        .map((a) => a.trim())
        .filter(Boolean);
    }
    if (!Array.isArray(authors)) {
      authors = [];
    }

    return {
      title,
      authors,
      translator,
      publisher,
      year_published: bookInfo.year ?? "",
      isbn: bookInfo.isbn ?? "",
      description,
      copyright: bookInfo.copyright ?? "",
      edition: bookInfo.edition ?? "",
    };
  }
}

module.exports = new BookCoverOCRService();
