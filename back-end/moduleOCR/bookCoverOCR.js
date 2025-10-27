/**
 * Book Cover OCR Service - Advanced book cover analysis
 * Phân tích thông minh bìa sách với OCR và image preprocessing
 */

const pythonBridge = require("./pythonBridge");
const path = require("path");
const fs = require("fs").promises;

class BookCoverOCRService {
  constructor() {
    this.coverTypes = {
      FRONT: 'front',    // Bìa trước: Title, Author
      INSIDE: 'inside',  // Bìa trong: ISBN, Publisher, Year
      BACK: 'back',      // Bìa sau: Description
      SPINE: 'spine'     // Gáy sách: Author (trái) + Title (phải)
    };
  }

  /**
   * Xử lý batch 3 bìa sách (spine, inside, back)
   */
  async processCoverBatch(spinePath, insidePath, backPath, languages = ['vi', 'en']) {
    try {

      const results = await Promise.allSettled([
        spinePath ? this.processCover(spinePath, this.coverTypes.SPINE, languages) : null,
        insidePath ? this.processCover(insidePath, this.coverTypes.INSIDE, languages) : null,
        backPath ? this.processCover(backPath, this.coverTypes.BACK, languages) : null
      ]);

      const [spineResult, insideResult, backResult] = results.map(r => 
        r.status === 'fulfilled' ? r.value : null
      );

      // Merge data from all 3 covers
      const bookData = this.mergeBookData(spineResult, insideResult, backResult);

      return {
        success: true,
        bookData,
        details: {
          spine: spineResult,
          inside: insideResult,
          back: backResult
        }
      };
    } catch (error) {
      console.error('[BookCoverOCR] Error processing batch:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Xử lý từng bìa riêng lẻ
   */
  async processCover(imagePath, coverType, languages = ['vi', 'en']) {
    try {
      if (!imagePath) return null;

      // Check file exists
      const absolutePath = path.isAbsolute(imagePath)
        ? imagePath
        : path.join(__dirname, '..', imagePath);

      try {
        await fs.access(absolutePath);
      } catch (error) {
        throw new Error(`File không tồn tại: ${absolutePath}`);
      }

      // Điều chỉnh thông số theo loại bìa
      let textThreshold = 0.3;
      let lowText = 0.2;
      let contrast = 1.5;
      let brightness = 10;
      let mag_ratio = 1.5;
      let paragraph = true;

      // Tối ưu cho BÌA TRONG (nền trắng, chữ đen có thể có underline)
      if (coverType === this.coverTypes.INSIDE) {
        // BÌA TRONG: CÂN BẰNG giữa enhancement và giữ nguyên chi tiết
        // Underline đã được xử lý ở Python → giảm preprocessing
        textThreshold = 0.35;  // Vừa phải để nhận diện text rõ nhưng không quá strict
        lowText = 0.25;        // Vừa phải để giữ được text nhạt
        contrast = 1.7;        // Tăng nhẹ contrast (thay vì 2.0)
        brightness = 5;        // Tăng nhẹ brightness để text sáng hơn
        mag_ratio = 1.2;       // Phóng nhẹ 20% để text rõ hơn
      }
      
      // Tối ưu cho GÁY SÁCH (text nhỏ, có thể xoay dọc)
      if (coverType === this.coverTypes.SPINE) {
        // GÁY SÁCH: Giữ paragraph mode để có bounding boxes chính xác
        textThreshold = 0.3;   // Giữ mặc định
        lowText = 0.2;         // Giữ mặc định
        contrast = 2.0;        // Tăng mạnh contrast (text nhỏ cần rõ nét)
        brightness = 10;       // Tăng brightness để text sáng hơn
        mag_ratio = 2.0;       // Phóng to 2x (text nhỏ cần phóng to)
        paragraph = true;      // PARAGRAPH MODE để có bounding boxes đúng
      }

      // Call OCR with adjusted parameters
      const ocrResult = await pythonBridge.callEasyOCR(
        absolutePath,
        languages,
        false,          // GPU
        textThreshold,
        lowText,
        paragraph,
        contrast,
        brightness,
        mag_ratio
      );

      if (!ocrResult.success) {
        throw new Error(ocrResult.error || 'OCR failed');
      }

      // Extract book info based on cover type AND font size classification
      const extractedData = this.extractByCoverType(
        ocrResult,
        coverType
      );

      return {
        success: true,
        coverType,
        rawText: ocrResult.text,
        extractedData,
        confidence: ocrResult.confidence || 0,
        processingTime: ocrResult.processingTime || 0,
        detailsCount: ocrResult.details?.length || 0,
        // Thêm font size classification để FE sử dụng
        classified: ocrResult.classified || null,
        lines: ocrResult.lines || []
      };

    } catch (error) {
      console.error(`[BookCoverOCR] Error processing ${coverType}:`, error);
      return {
        success: false,
        coverType,
        error: error.message
      };
    }
  }

  /**
   * Extract data dựa trên loại bìa
   */
  extractByCoverType(ocrResult, coverType) {
    const text = ocrResult.text || '';
    const lines = text.split('\n').filter(l => l.trim().length > 0);
    const boxes = ocrResult.boxes || [];
    const classified = ocrResult.classified || null; // Font size classification

    switch (coverType) {
      case this.coverTypes.FRONT:
        return this.extractFrontCover(lines, text, boxes, classified);
      
      case this.coverTypes.INSIDE:
        return this.extractInsideCover(lines, text, boxes, classified);
      
      case this.coverTypes.BACK:
        return this.extractBackCover(lines, text, boxes, classified);
      
      case this.coverTypes.SPINE:
        return this.extractSpineCover(lines, text, boxes, classified);
      
      default:
        return {};
    }
  }

  /**
   * BÌA TRƯỚC: Extract Title + Author
   */
  extractFrontCover(lines, fullText, boxes, classified) {
    const data = {
      title: '',
      subtitle: '' // Bỏ author và publisher - chỉ lấy ở bìa trong
    };

    // ✨ SỬ DỤNG FONT SIZE CLASSIFICATION (ưu tiên)
    if (classified) {
      // TITLE: Ghép TITLE + SUBTITLE lại thành tiêu đề hoàn chỉnh
      const titleParts = [];
      if (classified.title && classified.title.length > 0) {
        titleParts.push(classified.title.map(block => block.text).join(' ').trim());
      }
      if (classified.subtitle && classified.subtitle.length > 0) {
        titleParts.push(classified.subtitle.map(block => block.text).join(' ').trim());
      }
      data.title = titleParts.join(' - ').trim(); // Ghép với dấu "-"

      return data;
    }

    // 📦 FALLBACK: Old logic nếu không có classified
    // Title thường là text lớn nhất, ở trên cùng
    // Tìm dòng có font size lớn nhất (dựa vào bounding box height)
    if (boxes && boxes.length > 0) {
      const sortedByHeight = [...boxes].sort((a, b) => {
        const heightA = a.box ? Math.abs(a.box[2][1] - a.box[0][1]) : 0;
        const heightB = b.box ? Math.abs(b.box[2][1] - b.box[0][1]) : 0;
        return heightB - heightA;
      });

      // Lấy text lớn nhất làm title
      if (sortedByHeight[0]) {
        data.title = sortedByHeight[0].text.trim();
      }

      // Tìm author - thường có keyword "Tác giả", "Dịch", hoặc ở dưới title
      const authorKeywords = ['tác giả', 'author', 'dịch giả', 'thực hiện', 'translator'];
      
      for (const box of boxes) {
        const text = box.text.toLowerCase();
        if (authorKeywords.some(kw => text.includes(kw))) {
          // Lấy text sau keyword
          const match = box.text.match(/(?:tác giả|author|dịch giả)[:\s]+(.+)/i);
          if (match) {
            data.author = match[1].trim();
          }
        }
      }
    }

    // Fallback: Phân tích từ lines
    if (!data.title && lines.length > 0) {
      // Dòng đầu tiên thường là title
      data.title = lines[0].trim();
    }

    if (!data.author) {
      // Tìm dòng chứa tên tác giả
      for (const line of lines) {
        const authorMatch = line.match(/(?:tác giả|author|dịch)[:\s]+(.+)/i);
        if (authorMatch) {
          data.author = authorMatch[1].trim();
          break;
        }
        
        // Nếu không có keyword, kiểm tra pattern tên người (2-4 chữ viết hoa)
        const namePattern = /^([A-ZĐÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ][a-zđàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]+\s){1,3}[A-ZĐÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴ][a-zđàáảãạăắằẳẵặâấầẩẫậèéẻẽẹêếềểễệìíỉĩịòóỏõọôốồổỗộơớờởỡợùúủũụưứừửữựỳýỷỹỵ]+$/;
        if (namePattern.test(line)) {
          data.author = line.trim();
          break;
        }
      }
    }

    return data;
  }

  /**
   * BÌA TRONG: Extract ISBN + Publisher + Year
   * ✨ QUÉT TOÀN BỘ TEXT - Tối ưu pattern matching
   */
  extractInsideCover(lines, fullText, boxes, classified) {
    const data = {
      author: '',
      isbn: '',
      publisher: '',
      year: '',
      copyright: '',
      edition: ''
    };

    // ✨ XỬ LÝ TOÀN BỘ TEXT - Lấy Publisher, ISBN, Year
    const fullTextTrimmed = fullText.trim();

    // 1️⃣ Tìm Publisher - ĐƠN GIẢN HÓA (underline đã được xử lý ở preprocessing)
    
    // 1️⃣ Tìm Publisher - Production-ready
    const publisherMatch = fullTextTrimmed.match(
      /(?:^|\n|\s)nhà\s*xuất\s*bản[\s:]+([^\n]+)/i
    );

    if (publisherMatch && publisherMatch[1]) {
      data.publisher = publisherMatch[1]
        .trim()
        .replace(/\s*(?:\||Địa\s*chỉ|ĐC|DT|Tel|Tầng|Ô|Phòng|Số|QĐ).*$/i, '')
        .replace(/\s*\d{2,}.*$/g, '')
        .replace(/\s*[-,]\s*\d+.*$/g, '')
        .trim();              
    }

    // 2️⃣ Tìm ISBN (trong toàn bộ text) - Enhanced logic
    /**
     * Extract ISBN từ text
     * Handle cases:
     * - "ISBN: 978-604-304-155-2"
     * - "ISBN bản tiếng Việt: 978-604-304-155-2"
     * - "Mã ISBN E: 978-604-304-155-2"
     * - "ISBN 9786043041552" (không có dấu gạch ngang)
     */
    const extractISBN = (text) => {
      // Pattern 1: "ISBN" + bất kỳ text nào + ":" + số ISBN
      let isbnMatch = text.match(/ISBN[^:]*?:\s*(\d{3}[-\s]?\d{1,5}[-\s]?\d{1,7}[-\s]?\d{1,7}[-\s]?\d{1})/i);
      
      if (isbnMatch) {
        return isbnMatch[1].replace(/[-\s]/g, '');
      }
      
      // Pattern 2: "ISBN" + spaces + số (không có dấu ":")
      isbnMatch = text.match(/ISBN\s+(\d{3}[-\s]?\d{1,5}[-\s]?\d{1,7}[-\s]?\d{1,7}[-\s]?\d{1})/i);
      
      if (isbnMatch) {
        return isbnMatch[1].replace(/[-\s]/g, '');
      }
      
      // Pattern 3: Tìm bất kỳ số ISBN-13 nào (978 hoặc 979 bắt đầu)
      isbnMatch = text.match(/\b(97[89][-\s]?\d{1,5}[-\s]?\d{1,7}[-\s]?\d{1,7}[-\s]?\d{1})\b/);
      
      if (isbnMatch) {
        return isbnMatch[1].replace(/[-\s]/g, '');
      }
      
      return null;
    };

    data.isbn = extractISBN(fullTextTrimmed);
    if (data.isbn) {
    }

    // 3️⃣ Tìm Year (lấy năm cuối cùng trong text)
    const yearPattern = /\b(20\d{2})\b/g;
    const yearMatches = fullTextTrimmed.match(yearPattern);
    if (yearMatches && yearMatches.length > 0) {
      data.year = yearMatches[yearMatches.length - 1];
    }

    return data;
  }

    /**
   * BÌA SAU: Chỉ lấy phần mô tả (dừng ở gap lớn)
   */
  extractBackCover(lines, fullText, boxes, classified) {
    const data = { description: '', isbn: '' };

    // Lấy body blocks nếu có classification
    if (classified?.body && classified.body.length > 0) {
      data.description = classified.body.map(b => b.text).join(' ').trim();
    }
    // Fallback: Split fullText by double newlines, lấy phần đầu
    else if (fullText) {
      const sections = fullText.split(/\n\n+/);
      data.description = sections[0]?.trim() || '';
      
      // Ghép thêm section 2 nếu section 1 quá ngắn và section 2 không phải info
      if (data.description.length < 100 && sections[1] && 
          !/^(ISBN|GIÁ|Shine|AZ|NHÀ\s*XUẤT)/i.test(sections[1])) {
        data.description += '\n\n' + sections[1].trim();
      }
    }

    // Extract ISBN
    const isbnMatch = fullText?.match(/ISBN[\s:-]*(\d{3}[-\s]?\d{1,5}[-\s]?\d{1,7}[-\s]?\d{1,7}[-\s]?\d{1})/i);
    if (isbnMatch) {
      data.isbn = isbnMatch[1].replace(/[-\s]/g, '');
      // Remove ISBN from description
      data.description = data.description.replace(/ISBN[\s:-]*\d{3}[-\s]?\d{1,5}[-\s]?\d{1,7}[-\s]?\d{1,7}[-\s]?\d{1}/gi, '').trim();
    }

    // Cleanup
    data.description = data.description
      .replace(/(?:GIÁ|giá)[:\s]*[\d,.]+\s*(?:₫|VND)/gi, '')  // Remove price
      .replace(/\d{8,}/g, '')  // Remove barcode
      .replace(/(?:Shine|AZ\s*VIETNAM|NHÀ\s*XUẤT\s*BẢN).*$/i, '')  // Remove publisher
      .trim();

    return data;
  }

  /**
   * GÁY SÁCH (SPINE): Extract Author (trái) + Title (phải)
   * Text trên gáy sách thường được xếp theo chiều dọc, OCR sẽ đọc từ trái sang phải
   * Layout: [Tác giả] | [Tên sách]
   */
  extractSpineCover(lines, fullText, boxes, classified) {
    const data = {
      author: '',
      title: ''
    };

    // Phân tích dựa trên KHOẢNG CÁCH giữa các boxes (tìm "gap lớn")
    if (boxes && boxes.length >= 2) {
      // Lọc boxes hợp lệ
      const validBoxes = boxes.filter(box => 
        box.text && 
        box.text.trim().length > 0 &&
        box.box && 
        Array.isArray(box.box) && 
        box.box.length === 4
      );

      if (validBoxes.length >= 2) {
        // Sort boxes theo tọa độ X (trái -> phải)
        const sortedByX = [...validBoxes].sort((a, b) => {
          const xA = a.box[0][0];
          const xB = b.box[0][0];
          return xA - xB;
        });

        sortedByX.forEach((box, idx) => {
          const x = box.box[0][0];
        });

        // Tính khoảng cách giữa các boxes liên tiếp
        const gaps = [];
        for (let i = 0; i < sortedByX.length - 1; i++) {
          // Cạnh phải của box hiện tại
          const currentBoxRightX = Math.max(...sortedByX[i].box.map(p => p[0]));
          // Cạnh trái của box tiếp theo
          const nextBoxLeftX = Math.min(...sortedByX[i + 1].box.map(p => p[0]));
          // Khoảng cách (gap)
          const gap = nextBoxLeftX - currentBoxRightX;
          
          gaps.push({
            index: i,
            gap: gap,
            leftText: sortedByX[i].text,
            rightText: sortedByX[i + 1].text
          });
          
        }

        // Tìm gap LỚN NHẤT (đây là ranh giới author/title)
        if (gaps.length > 0) {
          const maxGap = gaps.reduce((max, g) => g.gap > max.gap ? g : max, gaps[0]);

          // Chia boxes thành 2 nhóm tại vị trí gap lớn nhất
          const authorBoxes = sortedByX.slice(0, maxGap.index + 1);
          const titleBoxes = sortedByX.slice(maxGap.index + 1);

          data.author = authorBoxes.map(b => b.text).join(' ').trim();
          data.title = titleBoxes.map(b => b.text).join(' ').trim();

        }
      }
    }

    // Fallback: Nếu không tách được bằng boxes, dùng text analysis
    if (!data.author || !data.title) {
      
      let fullTextTrimmed = fullText.trim();
      
      // Cleanup chỉ xóa noise rõ ràng (số, logo)
      fullTextTrimmed = fullTextTrimmed
        .replace(/^[0-9\s\+\-=#,\.]+/g, '')
        .replace(/[+#=,\.'\s]*(?:shi|shine)\s*(?:books?)?$/i, '')
        .trim();
    
      // Tìm 2 từ IN HOA đầu tiên (tác giả tiếng Việt)
      const vietnameseAuthorPattern = /\b([A-ZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴĐ]{2,}\s+[A-ZÀÁẢÃẠĂẮẰẲẴẶÂẤẦẨẪẬÈÉẺẼẸÊẾỀỂỄỆÌÍỈĨỊÒÓỎÕỌÔỐỒỔỖỘƠỚỜỞỠỢÙÚỦŨỤƯỨỪỬỮỰỲÝỶỸỴĐ]{2,})\b/;
      const authorMatch = fullTextTrimmed.match(vietnameseAuthorPattern);
      
      if (authorMatch) {
        data.author = authorMatch[1].trim();
        const authorIndex = fullTextTrimmed.indexOf(data.author);
        
        if (authorIndex !== -1) {
          // Lấy phần SAU author
          let titlePart = fullTextTrimmed.substring(authorIndex + data.author.length).trim();
          
          // Xóa CHỈ ký tự phân cách rõ ràng ở đầu (|, +, -, =, #, v.v.)
          titlePart = titlePart.replace(/^[|\+\-=#,\.\s]+/, '').trim();
          
          // KHÔNG fix lỗi OCR tự động - giữ nguyên text như OCR đọc được
          data.title = titlePart;
          
        }
      } 
      // Fallback: Author nước ngoài
      else {
        const foreignPattern = /\b([A-Z][a-z]+(?:[-\.]\s*[A-Z][a-z]+)*(?:\s+[A-Z][a-z]+(?:[-\.]\s*[A-Z][a-z]+)*){1,3})\b/;
        const foreignMatch = fullTextTrimmed.match(foreignPattern);
        
        if (foreignMatch) {
          data.author = foreignMatch[1].trim();
          const authorIndex = fullTextTrimmed.indexOf(data.author);
          if (authorIndex !== -1) {
            data.title = fullTextTrimmed
              .substring(authorIndex + data.author.length)
              .replace(/^[|\+\-=#,\.\s]+/, '')
              .trim();
          }
        } else {
          // Không tìm được author → coi toàn bộ là title
          data.title = fullTextTrimmed;
        }
      }
    }

    return data;
  }

  /**
   * Merge data từ cả 3 bìa thành 1 book object hoàn chỉnh
   */
  mergeBookData(spineData, insideData, backData) {
    const bookData = {
      title: '',
      author: '',
      subtitle: '',
      publisher: '',
      year_published: '',
      isbn: '',
      description: '',
      copyright: '',
      edition: '',
      reviews: [],
      confidence: {
        title: 0,
        author: 0,
        publisher: 0
      }
    };

    // Spine cover data - LẤY TITLE + AUTHOR
    if (spineData?.success && spineData.extractedData) {
      bookData.title = spineData.extractedData.title || '';
      bookData.author = spineData.extractedData.author || '';
      bookData.confidence.title = spineData.confidence || 0;
      bookData.confidence.author = spineData.confidence || 0;
    }

    // Inside cover data - LẤY ISBN + PUBLISHER + YEAR (và fallback author nếu spine không có)
    if (insideData?.success && insideData.extractedData) {
      // Chỉ lấy author từ inside nếu spine không có
      if (!bookData.author && insideData.extractedData.author) {
        bookData.author = insideData.extractedData.author;
        bookData.confidence.author = insideData.confidence || 0;
      }
      bookData.isbn = insideData.extractedData.isbn || '';
      bookData.publisher = insideData.extractedData.publisher || '';
      bookData.year_published = insideData.extractedData.year || '';
      bookData.copyright = insideData.extractedData.copyright || '';
      bookData.edition = insideData.extractedData.edition || '';
      bookData.confidence.publisher = insideData.confidence || 0;
    }

    // Back cover data - LẤY TOÀN BỘ DESCRIPTION
    if (backData?.success && backData.extractedData) {
      bookData.description = backData.extractedData.description || '';
      // Fallback ISBN từ bìa sau nếu bìa trong không có
      if (!bookData.isbn && backData.extractedData.isbn) {
        bookData.isbn = backData.extractedData.isbn;
      }
    }

    // Post-processing: Clean và validate
    bookData.title = this.cleanText(bookData.title);
    bookData.author = this.cleanText(bookData.author);
    bookData.publisher = this.cleanText(bookData.publisher);
    bookData.description = this.cleanText(bookData.description);

    // Convert author string to array if contains comma
    if (bookData.author && bookData.author.includes(',')) {
      bookData.author = bookData.author.split(',').map(a => a.trim());
    } else if (bookData.author) {
      bookData.author = [bookData.author];
    } else {
      bookData.author = [];
    }

    return bookData;
  }

  /**
   * Clean text: remove extra spaces, special chars
   */
  cleanText(text) {
    if (!text) return '';
    return text
      .replace(/\s+/g, ' ')
      .replace(/[^\w\sÀ-ỹĂăĐđÊêÔôƠơƯư.,!?;:()"'\/\-]/g, '')
      .trim();
  }
}

module.exports = new BookCoverOCRService();