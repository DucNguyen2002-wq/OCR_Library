/**
 * Tesseract OCR Service
 * Module xử lý OCR bìa sách sử dụng Tesseract.js
 */

const Tesseract = require("tesseract.js");
const fs = require("fs").promises;
const path = require("path");

class TesseractService {
  constructor() {
    this.languages = ["vie", "eng"]; // Hỗ trợ tiếng Việt và tiếng Anh
  }

  /**
   * Xử lý OCR cho một ảnh bìa sách
   * @param {string} imagePath - Đường dẫn đến file ảnh
   * @param {string} lang - Ngôn ngữ OCR (mặc định: 'vie+eng')
   * @returns {Promise<Object>} - Kết quả OCR với text và confidence
   */
  async recognizeText(imagePath, lang = "vie+eng") {
    try {
      console.log(`[Tesseract] Bắt đầu OCR cho file: ${imagePath}`);

      const startTime = Date.now();

      // Kiểm tra file tồn tại
      await fs.access(imagePath);

      // Thực hiện OCR
      const result = await Tesseract.recognize(imagePath, lang, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            console.log(
              `[Tesseract] Tiến độ: ${Math.round(m.progress * 100)}%`
            );
          }
        },
      });

      const endTime = Date.now();
      const processingTime = (endTime - startTime) / 1000;

      console.log(`[Tesseract] Hoàn thành OCR trong ${processingTime}s`);

      return {
        success: true,
        engine: "tesseract",
        text: result.data.text.trim(),
        confidence: result.data.confidence,
        processingTime: processingTime,
        words: result.data.words.map((word) => ({
          text: word.text,
          confidence: word.confidence,
          bbox: word.bbox,
        })),
        lines: result.data.lines.map((line) => ({
          text: line.text,
          confidence: line.confidence,
          bbox: line.bbox,
        })),
      };
    } catch (error) {
      console.error("[Tesseract] Lỗi khi xử lý OCR:", error);
      return {
        success: false,
        engine: "tesseract",
        error: error.message,
      };
    }
  }

  /**
   * Xử lý OCR với tiền xử lý ảnh
   * @param {string} imagePath - Đường dẫn đến file ảnh
   * @param {Object} options - Các tùy chọn OCR
   * @returns {Promise<Object>} - Kết quả OCR
   */
  async recognizeWithPreprocessing(imagePath, options = {}) {
    const {
      lang = "vie+eng",
      psm = 3, // Page segmentation mode
      oem = 3, // OCR Engine mode
    } = options;

    try {
      console.log(
        `[Tesseract] Bắt đầu OCR với preprocessing cho: ${imagePath}`
      );

      const startTime = Date.now();

      const result = await Tesseract.recognize(imagePath, lang, {
        logger: (m) =>
          console.log(
            `[Tesseract] ${m.status}: ${Math.round(m.progress * 100)}%`
          ),
        tessedit_pageseg_mode: psm,
        tessedit_ocr_engine_mode: oem,
      });

      const endTime = Date.now();
      const processingTime = (endTime - startTime) / 1000;

      // Làm sạch và xử lý text
      const cleanedText = this.cleanText(result.data.text);

      return {
        success: true,
        engine: "tesseract",
        text: cleanedText,
        rawText: result.data.text.trim(),
        confidence: result.data.confidence,
        processingTime: processingTime,
        metadata: {
          psm: psm,
          oem: oem,
          lang: lang,
        },
      };
    } catch (error) {
      console.error("[Tesseract] Lỗi khi xử lý OCR với preprocessing:", error);
      return {
        success: false,
        engine: "tesseract",
        error: error.message,
      };
    }
  }

  /**
   * Làm sạch text OCR
   * @param {string} text - Text cần làm sạch
   * @returns {string} - Text đã được làm sạch
   */
  cleanText(text) {
    return text
      .trim()
      .replace(/\s+/g, " ") // Loại bỏ khoảng trắng thừa
      .replace(/[\n\r]+/g, "\n") // Chuẩn hóa xuống dòng
      .replace(/[^\w\sÀ-ỹ\.,!?;:()\-]/g, ""); // Giữ lại ký tự hợp lệ
  }

  /**
   * Trích xuất thông tin sách từ text OCR
   * @param {string} text - Text từ OCR
   * @returns {Object} - Thông tin sách đã trích xuất
   */
  extractBookInfo(text) {
    const lines = text.split("\n").filter((line) => line.trim().length > 0);

    return {
      title: lines[0] || "", // Dòng đầu tiên thường là tên sách
      author: this.findAuthor(lines),
      publisher: this.findPublisher(lines),
      allText: text,
      lineCount: lines.length,
    };
  }

  /**
   * Tìm tên tác giả trong text
   * @param {Array<string>} lines - Các dòng text
   * @returns {string} - Tên tác giả
   */
  findAuthor(lines) {
    const authorPatterns = [
      /(?:tác giả|author|by)[\s:]+([^\n]+)/i,
      /([^\n]+)(?:\s+viết)/i,
    ];

    for (const line of lines) {
      for (const pattern of authorPatterns) {
        const match = line.match(pattern);
        if (match) {
          return match[1].trim();
        }
      }
    }
    return "";
  }

  /**
   * Tìm nhà xuất bản trong text
   * @param {Array<string>} lines - Các dòng text
   * @returns {string} - Tên nhà xuất bản
   */
  findPublisher(lines) {
    const publisherPatterns = [
      /(?:nhà xuất bản|publisher|nxb)[\s:]+([^\n]+)/i,
      /(?:xuất bản bởi)[\s:]+([^\n]+)/i,
    ];

    for (const line of lines) {
      for (const pattern of publisherPatterns) {
        const match = line.match(pattern);
        if (match) {
          return match[1].trim();
        }
      }
    }
    return "";
  }

  /**
   * Xử lý OCR cho nhiều ảnh
   * @param {Array<string>} imagePaths - Mảng đường dẫn ảnh
   * @param {string} lang - Ngôn ngữ OCR
   * @returns {Promise<Array<Object>>} - Mảng kết quả OCR
   */
  async recognizeMultiple(imagePaths, lang = "vie+eng") {
    console.log(`[Tesseract] Bắt đầu OCR cho ${imagePaths.length} ảnh`);

    const results = [];
    for (const imagePath of imagePaths) {
      const result = await this.recognizeText(imagePath, lang);
      results.push({
        imagePath: imagePath,
        ...result,
      });
    }

    return results;
  }
}

module.exports = new TesseractService();
