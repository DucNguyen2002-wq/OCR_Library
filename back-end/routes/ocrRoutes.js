const express = require('express');
const router = express.Router();
const ocrController = require('../moduleOCR/ocrController');
const { requireAuth } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, 'public/uploads/'); },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'ocr-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } });

// Upload fields for book covers (3 images: front, inside, back)
const uploadBookCovers = multer({ 
  storage: storage, 
  limits: { fileSize: 10 * 1024 * 1024 } 
}).fields([
  { name: 'front', maxCount: 1 },
  { name: 'inside', maxCount: 1 },
  { name: 'back', maxCount: 1 }
]);

/**
 * @swagger
 * tags:
 *   name: OCR
 *   description: OCR text extraction from images
 */

/**
 * @swagger
 * /api/ocr/extract:
 *   post:
 *     tags: [OCR]
 *     summary: Extract text from uploaded image
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
 *         description: Text extracted successfully
 */
router.post('/extract', requireAuth, upload.single('image'), ocrController.extractText);

/**
 * @swagger
 * /api/ocr/book-covers:
 *   post:
 *     tags: [OCR]
 *     summary: Extract book information from uploaded cover images
 *     description: Process đã upload covers để extract book data
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               front:
 *                 type: string
 *                 description: Filename của bìa trước đã upload
 *               inside:
 *                 type: string
 *                 description: Filename của bìa trong đã upload
 *               back:
 *                 type: string
 *                 description: Filename của bìa sau đã upload
 *               languages:
 *                 type: string
 *                 description: Comma-separated languages (default vi,en)
 *                 example: vi,en
 *     responses:
 *       200:
 *         description: Book information extracted successfully
 */
router.post('/book-covers', requireAuth, ocrController.processBookCovers);

/**
 * @swagger
 * /api/ocr/book-cover:
 *   post:
 *     tags: [OCR]
 *     summary: Extract book information from a single uploaded cover
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - filename
 *             properties:
 *               filename:
 *                 type: string
 *                 description: Filename của ảnh đã upload
 *               coverType:
 *                 type: string
 *                 enum: [front, inside, back]
 *                 default: front
 *               languages:
 *                 type: string
 *                 example: vi,en
 *     responses:
 *       200:
 *         description: Book information extracted successfully
 */
router.post('/book-cover', requireAuth, ocrController.processBookCover);

module.exports = router;
