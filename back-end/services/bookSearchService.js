const Book = require('../models/Book');
const pythonBridge = require('../moduleOCR/pythonBridge');
const axios = require('axios');
const path = require('path');

/**
 * Service tìm kiếm sách bằng OCR + AI API
 */
class BookSearchService {
  /**
   * Tìm sách bằng ảnh bìa - sử dụng OCR + AI
   */
  async searchByImage(imagePath) {
    try {
      console.log('[BookSearch] Starting search for:', imagePath);

      // 1. Chạy OCR để lấy text từ ảnh
      const ocrResult = await this.runOCR(imagePath);
      
      if (!ocrResult.success || !ocrResult.full_text) {
        return {
          success: false,
          error: 'OCR failed to extract text from image',
          details: ocrResult.error || 'No text detected'
        };
      }

      // 2. Dùng AI để extract thông tin sách từ OCR text
      const aiExtracted = await this.extractBookInfoWithAI(ocrResult.full_text);

      if (!aiExtracted.success) {
        return {
          success: false,
          error: 'AI extraction failed',
          details: aiExtracted.error,
          ocr: {
            raw_text: ocrResult.full_text,
            confidence: ocrResult.avg_confidence
          }
        };
      }

      console.log('[BookSearch] AI extracted:', aiExtracted.data);

      // 3. Tìm kiếm trong database
      const searchResults = await this.searchInDatabase(aiExtracted.data);

      console.log('[BookSearch] Found', searchResults.length, 'results');

      // 4. Trả về kết quả
      return {
        success: true,
        ocr: {
          raw_text: ocrResult.full_text,
          confidence: ocrResult.avg_confidence,
          blocks_count: ocrResult.num_blocks
        },
        extracted: aiExtracted.data,
        results: searchResults,
        total: searchResults.length
      };

    } catch (error) {
      console.error('[BookSearch] Error:', error);
      return {
        success: false,
        error: 'Search failed',
        details: error.message
      };
    }
  }

  /**
   * Chạy OCR sử dụng easyocr_fast.py (tái sử dụng code có sẵn)
   */
  async runOCR(imagePath) {
    try {
      // Sử dụng pythonBridge đã có sẵn
      const result = await pythonBridge.callEasyOCR(imagePath, ['vi', 'en'], false);
      return result;
    } catch (error) {
      console.error('[BookSearch] OCR error:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Sử dụng Perplexity AI để extract thông tin sách từ OCR text
   */
  async extractBookInfoWithAI(ocrText) {
    try {
      const apiKey = process.env.PPLX_API_KEY ;
      
      if (!apiKey) {
        throw new Error('PPLX_API_KEY not configured in .env');
      }

      const prompt = `
Phân tích text OCR từ bìa sách tiếng Việt. Text có thể có lỗi OCR.

TEXT OCR:
"""
${ocrText}
"""

NHIỆM VỤ:
1. Tìm và sửa lỗi chính tả nếu có
2. Xác định: TÊN SÁCH và TÁC GIẢ chính (không phải dịch giả, nhà xuất bản), nếu chỉ có tên sách hoặc tên tác giả không thì vẫn lấy.
3. Loại bỏ: ISBN, giá tiền, nhà xuất bản, "tái bản lần thứ X", v.v.
4. Tạo keywords quan trọng để tìm kiếm

Trả về định dạng JSON sau, KHÔNG thêm text khác:
{
  "title": "tên sách chính xác đã sửa lỗi",
  "author": "tên tác giả chính",
  "alternative_title": "tên tiếng Anh hoặc tên khác nếu có",
  "keywords": ["keyword1", "keyword2", "keyword3"],
  "confidence": 0.9
}
`.trim();

      const response = await axios.post(
        'https://api.perplexity.ai/chat/completions',
        {
          model: 'sonar',
          messages: [
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1, // Low temperature for consistent extraction
          max_tokens: 500
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 seconds timeout
        }
      );

      const content = response.data.choices[0].message.content;
      console.log('[BookSearch] AI response:', content);

      // Extract JSON từ response (AI có thể trả về markdown code block)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      if (!jsonMatch) {
        return {
          success: false,
          error: 'AI did not return valid JSON'
        };
      }

      const extracted = JSON.parse(jsonMatch[0]);

      return {
        success: true,
        data: extracted
      };

    } catch (error) {
      console.error('[BookSearch] AI extraction error:', error.message);
      
      if (error.response) {
        console.error('API Error:', error.response.data);
      }

      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Tìm kiếm trong MongoDB database
   */
  async searchInDatabase(extractedData) {
    try {
      const { title, author, alternative_title, keywords } = extractedData;

      // Build search terms
      const searchTerms = [
        title,
        author,
        alternative_title,
        ...(keywords || [])
      ].filter(Boolean); // Remove null/undefined

      if (searchTerms.length === 0) {
        return [];
      }

      const searchQuery = searchTerms.join(' ');
      console.log('[BookSearch] DB search query:', searchQuery);

      // Build $or conditions - chỉ cần match 1 trường
      const orConditions = [];
      
      if (title) {
        orConditions.push({ title: { $regex: title, $options: 'i' } });
      }
      
      if (author) {
        orConditions.push({ authors: { $in: [new RegExp(author, 'i')] } });
      }
      
      if (alternative_title) {
        orConditions.push({ title: { $regex: alternative_title, $options: 'i' } });
      }

      // Nếu không có điều kiện nào thì return rỗng
      if (orConditions.length === 0) {
        return [];
      }

      // Tìm kiếm - chỉ cần match 1 trong các trường
      const results = await Book.find({
        $or: orConditions,
        approval_status: 'approved'
      })
      .select('title authors cover_front_url isbn publisher year_published description')
      .limit(10)
      .lean();

      // Calculate match score dựa trên số keywords match
      return results.map(book => {
        let matchScore = 0;
        const bookText = `${book.title} ${book.authors.join(' ')}`.toLowerCase();
        
        searchTerms.forEach(term => {
          if (bookText.includes(term.toLowerCase())) {
            matchScore += 20;
          }
        });

        return {
          ...book,
          matchScore: Math.min(100, matchScore)
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    } catch (error) {
      console.error('[BookSearch] Database search error:', error);
      return [];
    }
  }
}

module.exports = new BookSearchService();
