const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { requireAuth, requireAdmin, requireBookModifyPermission } = require('../middleware/auth');
const { bookValidation, idValidation } = require('../utils/validator');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, 'public/uploads/'); },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() +'-' + Math.round(Math.random() * 1E9);
    cb(null, 'book-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype && extname) { return cb(null, true); }
  else { cb(new Error('Only image files are allowed!')); }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: fileFilter
});

/**
 * @swagger
 * tags:
 *   name: Books
 *   description: Book management endpoints
 */

/**
 * @swagger
 * /api/books:
 *   get:
 *     tags: [Books]
 *     summary: Get all books with pagination and filters
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *     responses:
 *       200:
 *         description: Books retrieved successfully
 */
router.get('/', bookController.getAllBooks);

/**
 * @swagger
 * /api/books/pending:
 *   get:
 *     tags: [Books]
 *     summary: Get pending books (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Pending books retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/pending', requireAuth, requireAdmin, bookController.getPendingBooks);

/**
 * @swagger
 * /api/books/rejected:
 *   get:
 *     tags: [Books]
 *     summary: Get rejected books (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: Rejected books retrieved successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 */
router.get('/rejected', requireAuth, requireAdmin, bookController.getRejectedBooks);

/**
 * @swagger
 * /api/books/my-rejected:
 *   get:
 *     tags: [Books]
 *     summary: Get my rejected books
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: My rejected books retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/my-rejected', requireAuth, bookController.getMyRejectedBooks);

/**
 * @swagger
 * /api/books/featured:
 *   get:
 *     tags: [Books]
 *     summary: Get featured books
 *     responses:
 *       200:
 *         description: Featured books retrieved successfully
 */
router.get('/featured', bookController.getFeaturedBooks);

/**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     tags: [Books]
 *     summary: Get book by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book details
 */
router.get('/:id', bookController.getBookById);

/**
 * @swagger
 * /api/books:
 *   post:
 *     tags: [Books]
 *     summary: Create a new book
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               coverImage:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Book created successfully
 */
router.post('/', requireAuth, upload.single('coverImage'), bookController.createBook);

/**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     tags: [Books]
 *     summary: Update a book
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book updated successfully
 */
router.put('/:id', requireAuth, requireBookModifyPermission, upload.single('coverImage'), bookController.updateBook);

/**
 * @swagger
 * /api/books/{id}/resubmit:
 *   put:
 *     tags: [Books]
 *     summary: Resubmit rejected book
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               authors:
 *                 type: array
 *                 items:
 *                   type: string
 *               publisher:
 *                 type: string
 *               year_published:
 *                 type: integer
 *               isbn:
 *                 type: string
 *               description:
 *                 type: string
 *               cover_front_url:
 *                 type: string
 *     responses:
 *       200:
 *         description: Book resubmitted successfully
 *       400:
 *         description: Book is not rejected
 *       403:
 *         description: Not book owner
 *       404:
 *         description: Book not found
 */
router.put('/:id/resubmit', requireAuth, bookController.resubmitBook);

/**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     tags: [Books]
 *     summary: Delete a book
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book deleted successfully
 */
router.delete('/:id', requireAuth, requireBookModifyPermission, bookController.deleteBook);

/**
 * @swagger
 * /api/books/{id}/approve:
 *   patch:
 *     tags: [Books]
 *     summary: Approve a book (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book approved successfully
 */
router.patch('/:id/approve', requireAuth, requireAdmin, bookController.approveBook);

/**
 * @swagger
 * /api/books/{id}/reject:
 *   patch:
 *     tags: [Books]
 *     summary: Reject a book (Admin only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Book rejected successfully
 */
router.patch('/:id/reject', requireAuth, requireAdmin, bookController.rejectBook);

module.exports = router;
