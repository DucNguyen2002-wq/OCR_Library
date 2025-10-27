/**
 * OCR Controller - Chỉ sử dụng EasyOCR
 */

const pythonBridge = require("./pythonBridge");
const layoutExtractor = require("./layoutExtractor");
const bookCoverOCR = require("./bookCoverOCR");
const path = require("path");
const fs = require("fs").promises;

class OCRController {
  async processEasyOCR(req, res) {
    try {
      const { imagePath, languages, useGPU } = req.body;

      if (!imagePath) {
        return res.status(400).json({
          success: false,
          message: "Thiếu đường dẫn ảnh",
        });
      }

      const absolutePath = path.isAbsolute(imagePath)
        ? imagePath
        : path.join(__dirname, "..", imagePath);

      try {
        await fs.access(absolutePath);
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: "File không tồn tại",
          path: absolutePath,
        });
      }

      const langs = languages ? languages.split(",") : ["vi", "en"];
      const result = await pythonBridge.callEasyOCR(
        absolutePath,
        langs,
        useGPU || false
      );

      if (result.success) {
        return res.json({
          ...result,
          bookInfo: this.extractBookInfo(result.text),
        });
      } else {
        return res.status(500).json(result);
      }
    } catch (error) {
      console.error("[OCRController] Lỗi processEasyOCR:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi xử lý OCR",
        error: error.message,
      });
    }
  }

  async processUploadedFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "Không có file được upload",
        });
      }

      const { languages, useGPU, layoutType } = req.body;
      const imagePath = req.file.path;

      console.log(
        `[OCRController] Xử lý file upload: ${imagePath} với EasyOCR`
      );
      console.log(`[OCRController] Layout type: ${layoutType || "standard"}`);

      const langs = languages ? languages.split(",") : ["vi", "en"];
      
      let result;
      try {
        result = await pythonBridge.callEasyOCR(
          imagePath,
          langs,
          useGPU === "true"
        );
      } catch (pythonError) {
        console.error("[OCRController] Python OCR Error:", pythonError);
        return res.status(500).json({
          success: false,
          message: "Lỗi khi chạy OCR. Vui lòng kiểm tra:\n• Python đã được cài đặt\n• EasyOCR đã được cài đặt (pip install easyocr)\n• Ảnh có định dạng hợp lệ",
          error: pythonError.message,
        });
      }

      if (result.success) {
        result.bookInfo = layoutExtractor.extractByLayout(
          result.text,
          layoutType || "standard",
          result // Pass full OCR result with lineHeights, largestTextIndices
        );
      } else {
        // Python script returned error
        return res.status(500).json({
          success: false,
          message: result.error || "OCR failed",
          details: result.details || "Unknown error",
        });
      }

      return res.json({
        ...result,
        fileInfo: {
          originalName: req.file.originalname,
          path: req.file.path,
          size: req.file.size,
        },
      });
    } catch (error) {
      console.error("[OCRController] Lỗi processUploadedFile:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi xử lý file upload",
        error: error.message,
      });
    }
  }

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
      console.error("[OCRController] Lỗi checkStatus:", error);
      return res.status(500).json({
        success: false,
        message: "Lỗi khi kiểm tra trạng thái",
        error: error.message,
      });
    }
  }

  extractBookInfo(text) {
    if (!text)
      return { title: "", author: "", publisher: "", year: "", isbn: "" };

    const lines = text.split("\n").filter((line) => line.trim().length > 0);

    return {
      title: this.findTitle(lines, text),
      author: this.findAuthor(lines, text),
      publisher: this.findPublisher(lines, text),
      year: this.findYear(text),
      isbn: this.findISBN(text),
      allText: text,
      lineCount: lines.length,
    };
  }

  findTitle(lines, fullText) {
    // Tên sách thường ở dòng đầu, in đậm, cỡ chữ lớn
    // Hoặc có thể có từ khóa

    const titlePatterns = [
      /^(.+)$/m, // Dòng đầu tiên
      /(?:tên sách|tiêu đề|title)[\s:]+(.+)/i,
      /^([A-ZĐÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ][^.!?]+)$/m,
    ];

    // Ưu tiên dòng đầu nếu không chứa từ khóa không phải tên sách
    const firstLine = lines[0]?.trim() || "";
    const skipWords = [
      "nhà xuất bản",
      "tác giả",
      "nxb",
      "publisher",
      "author",
      "isbn",
      "giá",
    ];

    if (
      firstLine &&
      !skipWords.some((word) => firstLine.toLowerCase().includes(word))
    ) {
      // Nếu dòng đầu dài hơn 5 ký tự và không có số nhiều
      if (firstLine.length > 5 && !/^\d+$/.test(firstLine)) {
        return firstLine;
      }
    }

    // Thử các pattern khác
    for (const pattern of titlePatterns.slice(1)) {
      const match = fullText.match(pattern);
      if (match && match[1]) {
        return match[1].trim();
      }
    }

    return firstLine || "";
  }

  findAuthor(lines, fullText) {
    // Pattern cho tác giả
    const authorPatterns = [
      /(?:tác\s*giả|tac\s*gia|author|by|của)[\s:]+([^\n]+)/i,
      /([A-ZĐÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ][a-zđàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]+(?:\s+[A-ZĐÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ][a-zđàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]+){1,3})(?:\s+viết|\s+sáng\s+tác)/i,
      /(?:viết bởi|sáng tác bởi|biên soạn)[\s:]+([^\n]+)/i,
    ];

    for (const pattern of authorPatterns) {
      const match = fullText.match(pattern);
      if (match && match[1]) {
        let author = match[1].trim();
        // Loại bỏ các từ không cần thiết
        author = author.replace(/^(bởi|by|của)\s+/i, "");
        author = author.split(/[,;]|và/)[0].trim(); // Lấy tác giả đầu tiên nếu có nhiều
        if (author.length > 2 && author.length < 100) {
          return author;
        }
      }
    }

    // Tìm theo vị trí: thường ở dòng 2 hoặc 3
    for (let i = 1; i < Math.min(5, lines.length); i++) {
      const line = lines[i].trim();
      // Tên người thường có 2-4 từ, viết hoa chữ cái đầu
      if (
        /^[A-ZĐÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆ][a-zđàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]+(?:\s+[A-ZĐÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆ][a-zđàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]+){1,3}$/.test(
          line
        )
      ) {
        if (
          !line.toLowerCase().includes("xuất bản") &&
          !line.toLowerCase().includes("nxb")
        ) {
          return line;
        }
      }
    }

    return "";
  }

  findPublisher(lines, fullText) {
    // Pattern cho nhà xuất bản
    const publisherPatterns = [
      /(?:nhà\s*xuất\s*bản|nha\s*xuat\s*ban|nxb|publisher)[\s:]+([^\n]+)/i,
      /(?:xuất bản bởi|phát hành bởi)[\s:]+([^\n]+)/i,
      /nxb[\s.]*([^\n]+)/i,
    ];

    for (const pattern of publisherPatterns) {
      const match = fullText.match(pattern);
      if (match && match[1]) {
        let publisher = match[1].trim();
        // Loại bỏ các từ thừa
        publisher = publisher.replace(/^(bởi|by)\s+/i, "");
        publisher = publisher.split(/[,;]/)[0].trim();
        if (publisher.length > 2 && publisher.length < 200) {
          return publisher;
        }
      }
    }

    // Tìm theo từ khóa trong từng dòng
    for (const line of lines) {
      if (
        line.toLowerCase().includes("xuất bản") ||
        line.toLowerCase().includes("nxb")
      ) {
        let publisher = line
          .replace(/(?:nhà\s*xuất\s*bản|nxb)[\s:]/i, "")
          .trim();
        if (publisher.length > 2 && publisher.length < 200) {
          return publisher;
        }
      }
    }

    return "";
  }

  findYear(text) {
    // Tìm năm xuất bản (4 chữ số từ 1900-2099)
    const yearPatterns = [
      /(?:năm|year|xuất\s*bản|published)[\s:]*(\d{4})/gi, // Thêm flag 'g'
      /(\d{4})/g,
    ];

    for (const pattern of yearPatterns) {
      const matches = [...text.matchAll(pattern)]; // Convert iterator to array
      for (const match of matches) {
        const year = parseInt(match[1]);
        if (year >= 1900 && year <= 2099) {
          return year.toString();
        }
      }
    }

    return "";
  }

  findISBN(text) {
    // Tìm ISBN (10 hoặc 13 chữ số)
    const isbnPatterns = [
      /isbn[\s:-]*(\d{10}|\d{13})/i,
      /(\d{3}-\d{10})/,
      /(\d{13})/,
    ];

    for (const pattern of isbnPatterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        return match[1].replace(/-/g, "");
      }
    }

    return "";
  }

  // Alias for backward compatibility
  extractText(req, res) {
    return this.processUploadedFile(req, res);
  }

  /**
   * Process Book Cover Batch - 3 bìa sách
   * POST /api/ocr/book-covers
   */
  /**
   * Process book covers từ filenames đã upload
   * Body: { spine: filename, inside: filename, back: filename, languages: 'vi,en' }
   */
  async processBookCovers(req, res) {
    try {
      const { spine, inside, back, languages } = req.body;  // Thay front → spine
      
      if (!spine && !inside && !back) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng cung cấp ít nhất 1 ảnh bìa (spine/inside/back)"
        });
      }

      console.log('[OCRController] Processing book covers from filenames:', { spine, inside, back });

      const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');

      // Tạo đường dẫn đầy đủ cho các file (thay frontPath → spinePath)
      const spinePath = spine ? path.join(uploadsDir, spine) : null;
      const insidePath = inside ? path.join(uploadsDir, inside) : null;
      const backPath = back ? path.join(uploadsDir, back) : null;

      const langs = languages ? languages.split(',') : ['vi', 'en'];

      // Process covers với bookCoverOCR service
      const result = await bookCoverOCR.processCoverBatch(
        spinePath,    // Thay frontPath → spinePath
        insidePath,
        backPath,
        langs
      );

      if (result.success) {
        return res.json({
          success: true,
          bookData: result.bookData,
          coverDetails: result.details,
          processedFiles: {
            spine: spine || null,    // Thay front → spine
            inside: inside || null,
            back: back || null
          }
        });
      } else {
        return res.status(500).json({
          success: false,
          message: result.error || 'Lỗi khi xử lý bìa sách',
          details: result.details
        });
      }

    } catch (error) {
      console.error('[OCRController] Error processBookCovers:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi xử lý bìa sách',
        error: error.message
      });
    }
  }

  /**
   * Process Single Book Cover từ filename đã upload
   * Body: { filename: string, coverType: 'front'|'inside'|'back', languages: 'vi,en' }
   */
  async processBookCover(req, res) {
    try {
      const { filename, coverType = 'front', languages } = req.body;

      if (!filename) {
        return res.status(400).json({
          success: false,
          message: "Vui lòng cung cấp tên file ảnh (filename)"
        });
      }

      console.log(`[OCRController] Processing ${coverType} cover:`, filename);

      const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
      const filePath = path.join(uploadsDir, filename);

      const langs = languages ? languages.split(',') : ['vi', 'en'];

      const result = await bookCoverOCR.processCover(
        filePath,
        coverType,
        langs
      );

      if (result.success) {
        // Upload ảnh lên Cloudinary ngay sau OCR
        const cloudinary = require('cloudinary').v2;
        let cloudinaryUrl = null;
        
        try {
          console.log(`📤 Uploading ${coverType} cover to Cloudinary...`);
          const uploadResult = await cloudinary.uploader.upload(filePath, {
            folder: 'book-covers',
            public_id: `book_${Date.now()}_${coverType}_${Math.random().toString(36).substring(7)}`,
            overwrite: true,
          });
          
          cloudinaryUrl = uploadResult.secure_url;
          console.log(`✅ Uploaded to Cloudinary: ${cloudinaryUrl}`);
          
          // Xóa file local sau khi upload thành công
          try {
            await fs.unlink(filePath);
            console.log(`🗑️  Deleted local file: ${filePath}`);
          } catch (deleteErr) {
            console.error(`Error deleting local file: ${deleteErr.message}`);
          }
          
        } catch (uploadErr) {
          console.error(`❌ Error uploading to Cloudinary: ${uploadErr.message}`);
          // Nếu upload lỗi, vẫn trả về URL local
          cloudinaryUrl = `/uploads/${filename}`;
        }

        return res.json({
          success: true,
          coverType: result.coverType,
          extractedData: result.extractedData,
          rawText: result.rawText,
          confidence: result.confidence,
          processingTime: result.processingTime,
          processedFile: {
            filename: filename,
            url: cloudinaryUrl, // Trả về Cloudinary URL thay vì local
            isCloudinary: cloudinaryUrl.startsWith('http')
          }
        });
      } else {
        return res.status(500).json({
          success: false,
          message: result.error || 'Lỗi khi xử lý bìa sách'
        });
      }

    } catch (error) {
      console.error('[OCRController] Error processBookCover:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi xử lý bìa sách',
        error: error.message
      });
    }
  }
}

module.exports = new OCRController();

module.exports = new OCRController();
