/**
 * Upload Routes - API upload ảnh bìa sách
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const uploadController = require('../controllers/uploadController');
const { requireAuth } = require('../middleware/auth');

// Đảm bảo thư mục uploads tồn tại
const uploadsDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
  console.log('[Upload] Created uploads directory:', uploadsDir);
}

// Multer config - Lưu file vào disk
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Tạo tên file unique: cover-timestamp-random.ext
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `cover-${uniqueSuffix}${ext}`);
  }
});

// File filter - Chỉ chấp nhận ảnh
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Chỉ chấp nhận file ảnh (JPEG, PNG, GIF, WebP)'));
  }
};

// Multer instance
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: fileFilter
});

// Storage cho upload nhiều bìa - đặt tên theo loại bìa
const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Tạo tên file theo loại bìa: front-cover-timestamp.ext, spine-cover-timestamp.ext, inside-cover-timestamp.ext, back-cover-timestamp.ext
    const coverType = file.fieldname; // 'front', 'spine', 'inside', 'back'
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${coverType}-cover-${timestamp}${ext}`);
  }
});

// Multer cho upload nhiều bìa
const uploadCovers = multer({
  storage: coverStorage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB per file
  },
  fileFilter: fileFilter
}).fields([
  { name: 'front', maxCount: 1 },
  { name: 'spine', maxCount: 1 },
  { name: 'inside', maxCount: 1 },
  { name: 'back', maxCount: 1 }
]);

/**
 * @swagger
 * /api/upload/book-cover:
 *   post:
 *     tags: [Upload]
 *     summary: Upload single book cover image
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - image
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Upload thành công
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     filename:
 *                       type: string
 *                     url:
 *                       type: string
 *                     path:
 *                       type: string
 *                     size:
 *                       type: number
 */
router.post('/book-cover', requireAuth, upload.single('image'), uploadController.uploadBookCover);

/**
 * @swagger
 * /api/upload/book-covers:
 *   post:
 *     tags: [Upload]
 *     summary: Upload multiple book cover images (front, spine, inside, back)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               front:
 *                 type: string
 *                 format: binary
 *               spine:
 *                 type: string
 *                 format: binary
 *               inside:
 *                 type: string
 *                 format: binary
 *               back:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Upload thành công
 */
router.post('/book-covers', requireAuth, uploadCovers, uploadController.uploadBookCovers);

/**
 * @swagger
 * /api/upload/images:
 *   get:
 *     tags: [Upload]
 *     summary: Get list of uploaded images
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách ảnh
 */
router.get('/images', requireAuth, uploadController.listImages);

/**
 * @swagger
 * /api/upload/image/{filename}:
 *   delete:
 *     tags: [Upload]
 *     summary: Delete uploaded image
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Xóa thành công
 */
router.delete('/image/:filename', requireAuth, uploadController.deleteImage);

module.exports = router;
