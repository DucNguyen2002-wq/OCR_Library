/**
 * Perplexity AI Service
 * Xử lý việc gửi OCR text đến Perplexity API để trích xuất thông tin sách
 */

const axios = require('axios');

class PerplexityService {
  constructor() {
    this.apiKey = process.env.PPLX_API_KEY; // ✅ KHÔNG hard-code
    this.apiUrl = 'https://api.perplexity.ai/chat/completions';

    if (!this.apiKey) {
      console.warn('[PerplexityService] ⚠️ PPLX_API_KEY chưa được set trong env');
    }
  }

  /**
   * Gửi OCR text đến Perplexity để trích xuất thông tin sách
   * @param {string} ocrText - Text đã OCR từ ảnh
   * @param {string} imagePath - Đường dẫn ảnh (optional)
   * @returns {Promise<Object>} - Thông tin sách được trích xuất
   */
  async extractBookInfo(ocrText, imagePath = null) {
    if (!ocrText || !ocrText.trim()) {
      return {
        success: false,
        error: 'OCR text is empty',
      };
    }

    try {
      const prompt = this._createPrompt(ocrText);

      const payload = {
        model: 'sonar',
        messages: [
          {
            role: 'system',
            content:
              'Bạn là chuyên gia phân tích thông tin sách. Luôn trả về JSON hợp lệ, đúng schema yêu cầu.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
        max_tokens: 600,
      };

      console.log('[PerplexityService] 🚀 Calling Perplexity API...');

      const response = await axios.post(this.apiUrl, payload, {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        timeout: 30000,
      });

      const aiContent = response.data?.choices?.[0]?.message?.content ?? '';
      const bookInfo = this._parseBookInfo(aiContent);

      return {
        success: true,
        book_info: bookInfo,
        raw_response: aiContent,
        ocr_text: ocrText,
      };
    } catch (error) {
      console.error('[PerplexityService] ❌ Error:', error.message);

      if (error.response) {
        console.error('[PerplexityService] Response status:', error.response.status);
        console.error('[PerplexityService] Response data:', JSON.stringify(error.response.data, null, 2));
        return {
          success: false,
          error: `API error: ${error.response.status}`,
          details: error.response.data,
        };
      }

      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Tạo prompt để gửi cho Perplexity
   * @param {string} ocrText - Text OCR
   * @returns {string} - Prompt
   * @private
   */
  _createPrompt(ocrText) {
  return `
Text sau đây là kết quả OCR từ nhiều mặt bìa của CÙNG MỘT quyển sách (tiếng Việt hoặc dịch từ nước ngoài).

TEXT OCR:
${ocrText}

NHIỆM VỤ:
1. Đọc kỹ toàn bộ text, kể cả phần có font nhỏ, nằm ở góc, hoặc có lỗi OCR.
2. Trích xuất các trường sau (nếu không tìm thấy thì để null):

- **title**: Tên sách chính xác (thường là chữ lớn nhất, nổi bật).
- **author**: Tên tác giả gốc (tìm các pattern: "Tác giả: ...", "Author: ...", các chữ phía trên hoặc bên trái "sáng tác", hoặc chữ IN HOA ở góc/đầu trang).
- **translator**: Tên người dịch nếu có. TÌM KIẾM CẨN THẬN:
  * Pattern 1: "[Tên người] dịch" (VD: "Nguyệt Lạc dịch", "Nguyễn Văn B dịch")
  * Pattern 2: "Dịch giả: [Tên]"
  * Pattern 3: "Người dịch: [Tên]" 
  * Pattern 4: "Translator: [Tên]"
  * Pattern 5: "[Tên] - Dịch"
  * Nếu KHÔNG tìm thấy bất kỳ pattern nào thì để null
- **publisher**: Nhà xuất bản.
- **year**: Năm xuất bản (4 chữ số, ví dụ: 2020).
- **isbn**: Mã ISBN (chỉ lấy số, bỏ dấu gạch ngang).
- **description**: Toàn bộ nội dung mô tả từ bìa sau.

LƯU Ý QUAN TRỌNG:
- Tên tác giả thường ở GÓC TRÊN hoặc DƯỚI TIÊU ĐỀ, có thể VIẾT HOA TOÀN BỘ (ví dụ: NGƯU DOANH, NGUYỄN VĂN A).
- Người dịch thường xuất hiện ở CUỐI TÊN TÁC GIẢ hoặc GÓC TRANG BÌA với từ "dịch" đằng sau tên.
- Nếu text OCR có lỗi chính tả/dấu, hãy suy luận và sửa thành tên đúng.

YÊU CẦU:
- Chỉ trả về DUY NHẤT một JSON object, không thêm văn bản giải thích:

{
  "title": "...",
  "author": "...",
  "translator": "..." hoặc null,
  "publisher": "...",
  "year": "...",
  "isbn": "...",
  "description": "..."
}
`.trim();
}

  /**
   * Parse JSON từ AI response
   * @param {string} aiResponse - Response từ AI
   * @returns {Object} - Book info object
   * @private
   */
  _parseBookInfo(aiResponse) {
    if (!aiResponse || typeof aiResponse !== 'string') {
      return this._emptyBookInfo(aiResponse, 'empty_response');
    }

    try {
      // Thử parse toàn bộ trước
      let parsed = null;
      try {
        parsed = JSON.parse(aiResponse);
      } catch {
        // Nếu không phải JSON thuần, tìm block JSON lớn nhất
        const match = aiResponse.match(/\{[\s\S]*\}/);
        if (match) {
          parsed = JSON.parse(match[0]);
        }
      }

      if (!parsed || typeof parsed !== 'object') {
        return this._emptyBookInfo(aiResponse, 'cannot_parse');
      }

      return {
        title: parsed.title ?? parsed.Title ?? null,
        author: parsed.author ?? parsed.Author ?? null,
        translator: parsed.translator ?? parsed.Translator ?? null,
        publisher: parsed.publisher ?? parsed.Publisher ?? null,
        year: parsed.year ?? parsed.Year ?? null,
        isbn: parsed.isbn ?? parsed.ISBN ?? null,
        description: parsed.description ?? parsed.Description ?? null,
      };
    } catch (e) {
      console.error('[PerplexityService] JSON parse error:', e.message);
      return this._emptyBookInfo(aiResponse, e.message);
    }
  }

  /**
   * Tạo object rỗng khi không parse được
   * @param {string} raw - Raw response
   * @param {string} parseError - Lỗi parse
   * @returns {Object} - Empty book info
   * @private
   */
  _emptyBookInfo(raw, parseError) {
    return {
      title: null,
      author: null,
      translator: null,
      publisher: null,
      year: null,
      isbn: null,
      description: null,
      raw_response: raw,
      parse_error: parseError,
    };
  }

  /**
   * Xử lý nhiều OCR text tuần tự (nếu cần)
   * @param {Array<string>} ocrTexts - Mảng OCR texts
   * @returns {Promise<Array<Object>>} - Mảng kết quả
   */
  async batchExtractBookInfo(ocrTexts) {
    const results = [];
    for (const text of ocrTexts) {
      const res = await this.extractBookInfo(text);
      results.push(res);
      await new Promise((r) => setTimeout(r, 500)); // delay nhẹ
    }
    return results;
  }
}

module.exports = new PerplexityService();
