const bookSearchService = require('../services/bookSearchService');
const fs = require('fs');
const path = require('path');

/**
 * Controller cho tìm kiếm sách bằng OCR
 */

/**
 * POST /api/ocr/search-book
 * Upload ảnh bìa sách và tìm kiếm trong database
 */
exports.searchBookByImage = async (req, res) => {
  let imagePath = null;

  try {
    // Validate file upload
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image uploaded. Please upload a book cover image.',
        error: 'Missing file'
      });
    }

    imagePath = req.file.path;
    console.log('[OCRSearch] Processing image:', imagePath);

    // Kiểm tra file tồn tại
    if (!fs.existsSync(imagePath)) {
      return res.status(400).json({
        success: false,
        message: 'Uploaded file not found',
        error: 'File system error'
      });
    }

    // Gọi service để search
    const result = await bookSearchService.searchByImage(imagePath);

    // Cleanup temp file
    try {
      fs.unlinkSync(imagePath);
      console.log('[OCRSearch] Temp file deleted:', imagePath);
    } catch (cleanupErr) {
      console.warn('[OCRSearch] Failed to delete temp file:', cleanupErr.message);
    }

    // Trả về response
    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: 'Failed to search book',
        error: result.error,
        details: result.details
      });
    }

    // Success response
    res.json({
      success: true,
      message: result.total > 0 
        ? `Found ${result.total} matching book(s)` 
        : 'No books found matching this cover',
      data: {
        ocr: result.ocr,
        extracted: result.extracted,
        books: result.results
      }
    });

  } catch (error) {
    console.error('[OCRSearch] Controller error:', error);

    // Cleanup on error
    if (imagePath && fs.existsSync(imagePath)) {
      try {
        fs.unlinkSync(imagePath);
      } catch (cleanupErr) {
        console.warn('[OCRSearch] Cleanup failed:', cleanupErr.message);
      }
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error while processing book search',
      error: error.message
    });
  }
};

/**
 * GET /api/ocr/search-book/status
 * Kiểm tra trạng thái của OCR search service
 */
exports.checkStatus = async (req, res) => {
  try {
    const hasPerplexityKey = !!process.env.PERPLEXITY_API_KEY;
    
    res.json({
      success: true,
      status: 'operational',
      features: {
        ocr: 'enabled',
        ai_extraction: hasPerplexityKey ? 'enabled' : 'disabled',
        database_search: 'enabled'
      },
      message: hasPerplexityKey 
        ? 'OCR Book Search is ready'
        : 'OCR is ready but AI extraction is disabled (PERPLEXITY_API_KEY not configured)'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to check status',
      error: error.message
    });
  }
};
