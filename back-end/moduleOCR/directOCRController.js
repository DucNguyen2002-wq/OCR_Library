/**
 * Direct OCR Controller
 * API endpoint để FE upload ảnh và nhận kết quả OCR ngay lập tức
 * với bounding boxes để hiển thị
 */

const unifiedOCR = require('./unifiedOCRService');
const path = require('path');
const fs = require('fs').promises;

class DirectOCRController {
  /**
   * POST /api/ocr/direct
   * Upload ảnh và OCR trực tiếp, trả về bounding boxes
   * 
   * Body: multipart/form-data
   *   - image: file ảnh
   *   - engine: 'paddle' | 'easyocr' (optional, default: 'paddle')
   *   - languages: 'vi,en' (optional)
   * 
   * Response:
   *   {
   *     success: true,
   *     text: 'Full extracted text',
   *     boxes: [
   *       { box: [[x,y],...], text: '...', confidence: 0.95 },
   *       ...
   *     ],
   *     imageUrl: '/uploads/filename.jpg',
   *     confidence: 85.5,
   *     processing_time: 2.3
   *   }
   */
  async processDirectOCR(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng upload file ảnh'
        });
      }

      const { engine = 'paddle', languages = 'vi,en' } = req.body;
      const imagePath = req.file.path;
      const imageUrl = `/uploads/${req.file.filename}`;

      console.log('[DirectOCR] 📸 Processing uploaded image:', req.file.filename);
      console.log('[DirectOCR] Engine:', engine);

      // Gọi Unified OCR Service
      const result = await unifiedOCR.processImage(imagePath, {
        engine,
        languages: languages.split(','),
        useGPU: false
      });

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: 'OCR failed',
          error: result.error
        });
      }

      // Trả về kết quả với bounding boxes
      return res.json({
        success: true,
        text: result.text,
        boxes: result.boxes,
        imageUrl,
        imagePath: req.file.filename,
        confidence: result.confidence,
        processing_time: result.processing_time,
        num_boxes: result.boxes?.length || 0,
        engine: result.engine,
        image_size: result.image_size
      });

    } catch (error) {
      console.error('[DirectOCR] Error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi xử lý OCR',
        error: error.message
      });
    }
  }

  /**
   * POST /api/ocr/direct-batch
   * Upload nhiều ảnh và OCR batch
   * 
   * Body: multipart/form-data
   *   - images: file[] (mảng ảnh)
   *   - engine: 'paddle' | 'easyocr' (optional)
   * 
   * Response:
   *   {
   *     success: true,
   *     results: [
   *       { imageUrl: '...', text: '...', boxes: [...] },
   *       ...
   *     ]
   *   }
   */
  async processBatchOCR(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng upload ít nhất 1 ảnh'
        });
      }

      const { engine = 'paddle', languages = 'vi,en' } = req.body;
      const imagePaths = req.files.map(f => f.path);

      console.log('[DirectOCR] 📦 Batch processing', imagePaths.length, 'images');

      // Gọi batch processing
      const results = await unifiedOCR.processImages(imagePaths, {
        engine,
        languages: languages.split(','),
        useGPU: false
      });

      // Format response
      const formattedResults = results.map((result, index) => ({
        imageUrl: `/uploads/${req.files[index].filename}`,
        imagePath: req.files[index].filename,
        success: result.success,
        text: result.text || '',
        boxes: result.boxes || [],
        confidence: result.confidence || 0,
        processing_time: result.processing_time || 0,
        error: result.error
      }));

      const successCount = formattedResults.filter(r => r.success).length;

      return res.json({
        success: true,
        total: formattedResults.length,
        successCount,
        failCount: formattedResults.length - successCount,
        results: formattedResults
      });

    } catch (error) {
      console.error('[DirectOCR] Batch error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi xử lý batch OCR',
        error: error.message
      });
    }
  }

  /**
   * POST /api/ocr/re-ocr
   * Re-OCR một ảnh đã upload (từ filename)
   * 
   * Body: { filename: 'xxx.jpg', engine: 'paddle' }
   */
  async reOCR(req, res) {
    try {
      const { filename, engine = 'paddle', languages = 'vi,en' } = req.body;

      if (!filename) {
        return res.status(400).json({
          success: false,
          message: 'Vui lòng cung cấp filename'
        });
      }

      const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
      const imagePath = path.join(uploadsDir, filename);

      // Kiểm tra file tồn tại
      try {
        await fs.access(imagePath);
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: 'File không tồn tại'
        });
      }

      console.log('[DirectOCR] 🔄 Re-OCR:', filename);

      // OCR lại
      const result = await unifiedOCR.processImage(imagePath, {
        engine,
        languages: languages.split(','),
        useGPU: false
      });

      if (!result.success) {
        return res.status(500).json({
          success: false,
          message: 'OCR failed',
          error: result.error
        });
      }

      return res.json({
        success: true,
        text: result.text,
        boxes: result.boxes,
        imageUrl: `/uploads/${filename}`,
        confidence: result.confidence,
        processing_time: result.processing_time,
        num_boxes: result.boxes?.length || 0,
        engine: result.engine
      });

    } catch (error) {
      console.error('[DirectOCR] Re-OCR error:', error);
      return res.status(500).json({
        success: false,
        message: 'Lỗi khi re-OCR',
        error: error.message
      });
    }
  }

  /**
   * GET /api/ocr/engines
   * Lấy danh sách OCR engines có sẵn
   */
  async getAvailableEngines(req, res) {
    try {
      // TODO: Check which engines are actually installed
      return res.json({
        success: true,
        engines: [
          {
            name: 'paddle',
            displayName: 'PaddleOCR',
            description: 'Tối ưu cho tiếng Việt, nhanh hơn',
            available: true,
            default: true
          },
          {
            name: 'easyocr',
            displayName: 'EasyOCR',
            description: 'Fallback engine, hỗ trợ nhiều ngôn ngữ',
            available: true,
            default: false
          }
        ],
        languages: ['vi', 'en', 'ch_sim', 'ch_tra']
      });
    } catch (error) {
      return res.status(500).json({
        success: false,
        error: error.message
      });
    }
  }
}

module.exports = new DirectOCRController();
