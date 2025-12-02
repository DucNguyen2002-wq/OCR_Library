const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');
const ocrSearchController = require('../controllers/ocrSearchController');

// Multer configuration for temporary file upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/temp/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'ocr-search-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },
  fileFilter: (req, file, cb) => {
    // Chỉ chấp nhận file ảnh
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only image files (JPEG, PNG, WebP) are allowed'), false);
    }
  }
});

/**
 * @route   POST /api/ocr/search-book
 * @desc    Upload ảnh bìa sách và tìm kiếm trong database bằng OCR + AI
 * @access  Private (cần authentication)
 */
router.post(
  '/search-book',
  authenticateToken,
  upload.single('coverImage'),
  ocrSearchController.searchBookByImage
);

/**
 * @route   GET /api/ocr/search-book/status
 * @desc    Kiểm tra trạng thái của OCR search service
 * @access  Public
 */
router.get(
  '/search-book/status',
  ocrSearchController.checkStatus
);

module.exports = router;
